import type { PackCard } from './card';
import type { SeasonId } from './season';

// ============================================================================
// CARD BATTLES TYPES (US090 - Card Battles - Minigame)
// ============================================================================

// Battle state machine
export type BattleState =
  | 'idle'              // Ready to start battle
  | 'selecting'         // Selecting cards for battle
  | 'battling'          // Battle in progress (auto-battle animation)
  | 'completed';        // Battle finished, showing results

// Battle mode types
export type BattleMode = 'casual' | 'ranked';

// Battle format
export type BattleFormat = '3v3'; // 3 cards vs 3 cards

// Battle slot position (1-3 for player, 4-6 for opponent)
export type BattleSlot = 1 | 2 | 3;

// Card in battle (with current HP and status)
export interface BattleCard {
  card: PackCard;               // The card data
  currentHP: number;            // Current health points
  maxHP: number;                // Maximum health points
  isAlive: boolean;             // Whether card is still in battle
  position: BattleSlot;         // Position in team (1-3)
}

// Battle team (player or opponent)
export interface BattleTeam {
  cards: BattleCard[];          // 3 cards in the team
  teamName: string;             // Team name
  isPlayer: boolean;            // Whether this is the player's team
}

// Battle result
export interface BattleResult {
  winner: 'player' | 'opponent' | 'draw';
  playerTeam: BattleTeam;
  opponentTeam: BattleTeam;
  turns: number;                // Number of turns in battle
  battleLog: BattleLogEntry[];  // Battle log entries
  duration: number;             // Battle duration in ms
  timestamp: Date;              // When battle completed
  rewards?: BattleRewards;      // Rewards (for ranked mode)
}

// Battle log entry
export interface BattleLogEntry {
  turn: number;
  action: BattleAction;
  description: string;
  damage?: number;
  criticalHit?: boolean;
}

// Battle action types
export type BattleAction =
  | 'attack'
  | 'ability'
  | 'status_effect'
  | 'knockout'
  | 'victory';

// Battle rewards (for ranked mode)
export interface BattleRewards {
  xp: number;
  rankPoints: number;           // Positive for win, negative for loss
  currency?: number;            // Optional currency reward
}

// Battle entry in history
export interface BattleHistoryEntry {
  id: string;                   // Unique battle ID
  mode: BattleMode;             // Casual or ranked
  result: BattleResult;         // Battle result
  playerDeck: string[];         // Card IDs used by player
  timestamp: Date;              // When battle occurred
}

// Ranked season data
export interface RankedSeason {
  seasonId: SeasonId;           // Current season ID
  startDate: Date;              // Season start
  endDate: Date;                // Season end
}

// Player ranked data
export interface PlayerRankedData {
  currentRank: number;          // Current rank (1 = best)
  currentTier: RankedTier;      // Current tier
  rankPoints: number;           // Current rank points
  wins: number;                 // Season wins
  losses: number;               // Season losses
  winRate: number;              // Win percentage
  bestRank: number;             // Best rank achieved
}

// Ranked tiers
export type RankedTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'champion';

// Ranked tier configuration
export interface RankedTierConfig {
  name: string;
  icon: string;
  color: string;
  minRank: number;
  maxRank: number;
  rankPointsRange: [number, number];
}

// Battle configuration
export interface BattleConfig {
  cardsPerTeam: number;         // Cards per team (3)
  turnDuration: number;         // Duration per turn in ms (for auto-battle)
  maxTurns: number;             // Maximum turns before time limit
  rankedMultiplier: number;     // Rank points multiplier
}

// Default battle configuration
export const DEFAULT_BATTLE_CONFIG: BattleConfig = {
  cardsPerTeam: 3,
  turnDuration: 1000,           // 1 second per turn (10s total battle)
  maxTurns: 10,
  rankedMultiplier: 1.0,
};

// Ranked tier configurations
export const RANKED_TIERS: Record<RankedTier, RankedTierConfig> = {
  bronze: {
    name: 'Bronze',
    icon: '🥉',
    color: '#cd7f32',
    minRank: 1001,
    maxRank: 999999,
    rankPointsRange: [0, 999],
  },
  silver: {
    name: 'Silver',
    icon: '🥈',
    color: '#c0c0c0',
    minRank: 501,
    maxRank: 1000,
    rankPointsRange: [1000, 1999],
  },
  gold: {
    name: 'Gold',
    icon: '🥇',
    color: '#ffd700',
    minRank: 201,
    maxRank: 500,
    rankPointsRange: [2000, 2999],
  },
  platinum: {
    name: 'Platinum',
    icon: '💎',
    color: '#e5e4e2',
    minRank: 51,
    maxRank: 200,
    rankPointsRange: [3000, 3999],
  },
  diamond: {
    name: 'Diamond',
    icon: '💠',
    color: '#b9f2ff',
    minRank: 11,
    maxRank: 50,
    rankPointsRange: [4000, 4999],
  },
  champion: {
    name: 'Champion',
    icon: '👑',
    color: '#ff6b6b',
    minRank: 1,
    maxRank: 10,
    rankPointsRange: [5000, 99999],
  },
};
