/**
 * DadDeck™ Battle Store
 *
 * Manages battle state, history, and ranked mode.
 */

import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  BattleCard,
  BattleFormat,
  BattleHistoryEntry,
  BattleMode,
  BattleResult,
  BattleState,
  BattleTeam,
  PackCard,
  PlayerRankedData,
  RankedTier,
  SeasonId,
} from '@/types';
import {
  calculateRank,
  calculateRewards,
  calculateWinRate,
  createBattleTeam,
  generateBattleId,
  generateOpponentTeam,
  getBattleSummary,
  getTierFromRankPoints,
  simulateBattle,
  validateBattleDeck,
} from '@/lib/battle';
import { getAllCards } from '@/lib/cards/database';
import { trackEvent } from './analytics';

// ============================================================================
// ENCODER FOR LOCALSTORAGE (handles Date serialization)
// ============================================================================

const battleHistoryEncoder = {
  encode(data: BattleHistoryEntry[]): string {
    return JSON.stringify(data, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): BattleHistoryEntry[] {
    const data = JSON.parse(str);
    return data.map((entry: any) => ({
      ...entry,
      result: {
        ...entry.result,
        timestamp: new Date(entry.result.timestamp),
      },
      timestamp: new Date(entry.timestamp),
    }));
  },
};

// ============================================================================
// BATTLE STORES
// ============================================================================

// Current battle state
export const battleState = atom<BattleState>('idle');

// Current battle mode (casual or ranked)
export const battleMode = atom<BattleMode>('casual');

// Current battle format (always 3v3 for now)
export const battleFormat = atom<BattleFormat>('3v3');

// Selected player cards for battle
export const selectedCards = atom<PackCard[]>([]);

// Current battle result
export const currentBattle = atom<BattleResult | null>(null);

// Player team (for display during battle)
export const playerTeam = atom<BattleTeam | null>(null);

// Opponent team (for display during battle)
export const opponentTeam = atom<BattleTeam | null>(null);

// Battle history (persisted to LocalStorage)
export const battleHistory = persistentAtom<BattleHistoryEntry[]>('daddeck-battle-history', [], battleHistoryEncoder);

// Ranked data (persisted to LocalStorage)
export const rankedData = persistentAtom<PlayerRankedData>('daddeck-ranked-data', {
  currentRank: 1001,
  currentTier: 'bronze',
  rankPoints: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  bestRank: 1001,
});

// Current season ID
export const currentSeason = atom<SeasonId>(1);

// ============================================================================
// BATTLE ACTIONS
// ============================================================================

/**
 * Get battle history
 */
export function getBattleHistory(): BattleHistoryEntry[] {
  return battleHistory.get();
}

/**
 * Get ranked data
 */
export function getRankedData(): PlayerRankedData {
  return rankedData.get();
}

/**
 * Select cards for battle
 */
export function selectBattleCards(cards: PackCard[]): { valid: boolean; error?: string } {
  // Validate
  const validation = validateBattleDeck(cards);
  if (!validation.valid) {
    return validation;
  }

  selectedCards.set(cards);
  return { valid: true };
}

/**
 * Clear selected cards
 */
export function clearSelectedCards(): void {
  selectedCards.set([]);
}

/**
 * Start a battle
 */
export async function startBattle(mode: BattleMode = 'casual'): Promise<{
  success: boolean;
  error?: string;
}> {
  const cards = selectedCards.get();

  if (cards.length !== 3) {
    return {
      success: false,
      error: `Select 3 cards to battle (currently ${cards.length})`,
    };
  }

  // Set battle state
  battleMode.set(mode);
  battleState.set('battling');

  // Create player team
  const player = createBattleTeam(cards, 'Your Dad Squad', true);
  playerTeam.set(player);

  // Generate opponent team
  const allCards = getAllCards();
  const opponent = generateOpponentTeam(cards, allCards);
  opponentTeam.set(opponent);

  // Simulate battle
  const result = simulateBattle(player, opponent);

  // Calculate rewards for ranked mode
  const ranked = rankedData.get();
  if (mode === 'ranked') {
    result.rewards = calculateRewards(result.winner, true, ranked.currentTier);

    // Update ranked data
    const newRankPoints = ranked.rankPoints + result.rewards.rankPoints;
    const newTier = getTierFromRankPoints(newRankPoints);
    const newRank = calculateRank(newRankPoints, newTier);

    let newWins = ranked.wins;
    let newLosses = ranked.losses;

    if (result.winner === 'player') {
      newWins++;
    } else if (result.winner === 'opponent') {
      newLosses++;
    }

    const newBestRank = Math.min(ranked.bestRank, newRank);

    rankedData.set({
      currentRank: newRank,
      currentTier: newTier,
      rankPoints: newRankPoints,
      wins: newWins,
      losses: newLosses,
      winRate: calculateWinRate(newWins, newLosses),
      bestRank: newBestRank,
    });
  }

  // Set battle result
  currentBattle.set(result);

  // Add to history
  const historyEntry: BattleHistoryEntry = {
    id: generateBattleId(),
    mode,
    result,
    playerDeck: cards.map(c => c.id),
    timestamp: new Date(),
  };

  const history = battleHistory.get();
  battleHistory.set([historyEntry, ...history].slice(0, 100)); // Keep last 100 battles

  // Update state
  battleState.set('completed');

  // Track analytics
  trackEvent({
    type: 'pack_complete', // Reusing existing type for now
    data: {
      packId: historyEntry.id,
      cardCount: 6,
      bestRarity: 'common',
      holoCount: 0,
      duration: result.duration,
      skipped: false,
    },
  });

  return { success: true };
}

/**
 * Reset battle state (start new battle)
 */
export function resetBattle(): void {
  battleState.set('idle');
  currentBattle.set(null);
  playerTeam.set(null);
  opponentTeam.set(null);
}

/**
 * Get battle statistics
 */
export function getBattleStats(): {
  totalBattles: number;
  casualBattles: number;
  rankedBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
} {
  const history = battleHistory.get();

  const casualBattles = history.filter(h => h.mode === 'casual').length;
  const rankedBattles = history.filter(h => h.mode === 'ranked').length;

  const wins = history.filter(h => h.result.winner === 'player').length;
  const losses = history.filter(h => h.result.winner === 'opponent').length;
  const draws = history.filter(h => h.result.winner === 'draw').length;

  return {
    totalBattles: history.length,
    casualBattles,
    rankedBattles,
    wins,
    losses,
    draws,
    winRate: history.length > 0 ? Math.round((wins / history.length) * 100) : 0,
  };
}

/**
 * Get recent battles
 */
export function getRecentBattles(count: number = 10): BattleHistoryEntry[] {
  return battleHistory.get().slice(0, count);
}

/**
 * Get battle summary text
 */
export function getBattleSummaryText(result: BattleResult): string {
  return getBattleSummary(result);
}

/**
 * Get ranked tier info
 */
export function getRankedTierInfo(tier: RankedTier): {
  name: string;
  icon: string;
  color: string;
} {
  const tierConfigs: Record<RankedTier, { name: string; icon: string; color: string }> = {
    bronze: { name: 'Bronze', icon: '🥉', color: '#cd7f32' },
    silver: { name: 'Silver', icon: '🥈', color: '#c0c0c0' },
    gold: { name: 'Gold', icon: '🥇', color: '#ffd700' },
    platinum: { name: 'Platinum', icon: '💎', color: '#e5e4e2' },
    diamond: { name: 'Diamond', icon: '💠', color: '#b9f2ff' },
    champion: { name: 'Champion', icon: '👑', color: '#ff6b6b' },
  };

  return tierConfigs[tier];
}

/**
 * Get current battle state
 */
export function getCurrentBattleState(): BattleState {
  return battleState.get();
}

/**
 * Get current battle mode
 */
export function getCurrentBattleMode(): BattleMode {
  return battleMode.get();
}

/**
 * Set battle mode
 */
export function setBattleMode(mode: BattleMode): void {
  battleMode.set(mode);
}

/**
 * Get selected cards
 */
export function getSelectedCards(): PackCard[] {
  return selectedCards.get();
}

/**
 * Check if battle is in progress
 */
export function isBattling(): boolean {
  return battleState.get() === 'battling';
}

/**
 * Check if cards are selected
 */
export function hasSelectedCards(): boolean {
  return selectedCards.get().length === 3;
}

/**
 * Clear all battle data (for reset)
 */
export function clearAllBattleData(): void {
  battleState.set('idle');
  battleMode.set('casual');
  selectedCards.set([]);
  currentBattle.set(null);
  playerTeam.set(null);
  opponentTeam.set(null);
  battleHistory.set([]);
  rankedData.set({
    currentRank: 1001,
    currentTier: 'bronze',
    rankPoints: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    bestRank: 1001,
  });
}
