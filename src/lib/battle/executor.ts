/**
 * DadDeck™ Battle System
 *
 * Auto-battle system for 3v3 card battles.
 * Combines RNG + strategy through stats-based combat.
 */

import type {
  BattleAction,
  BattleCard,
  BattleLogEntry,
  BattleResult,
  BattleTeam,
  BattleRewards,
  PackCard,
  RankedTier,
} from '@/types';
import {
  calculateCardPower,
  calculateDamage,
  executeAbility,
  getTypeAdvantage,
} from '@/lib/mechanics/combat';
import { RARITY_ORDER } from '@/types';

// ============================================================================
// BATTLE GENERATION
// ============================================================================

/**
 * Generate a unique battle ID
 */
export function generateBattleId(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a battle card from a pack card
 */
export function createBattleCard(
  card: PackCard,
  position: 1 | 2 | 3
): BattleCard {
  const maxHP = calculateCardPower(card) * 10;
  return {
    card,
    currentHP: maxHP,
    maxHP,
    isAlive: true,
    position,
  };
}

/**
 * Create a battle team from 3 cards
 */
export function createBattleTeam(
  cards: PackCard[],
  teamName: string,
  isPlayer: boolean
): BattleTeam {
  if (cards.length !== 3) {
    throw new Error('Battle team must have exactly 3 cards');
  }

  return {
    cards: cards.map((card, index) => createBattleCard(card, (index + 1) as 1 | 2 | 3)),
    teamName,
    isPlayer,
  };
}

/**
 * Generate a random opponent team (AI)
 */
export function generateOpponentTeam(
  playerCards: PackCard[],
  allCards: PackCard[]
): BattleTeam {
  // Calculate average power of player's cards
  const avgPlayerPower = playerCards.reduce(
    (sum, card) => sum + calculateCardPower(card),
    0
  ) / playerCards.length;

  // Filter cards for opponent (within ±20% power range)
  const eligibleCards = allCards.filter(card => {
    const power = calculateCardPower(card);
    return power >= avgPlayerPower * 0.8 && power <= avgPlayerPower * 1.2;
  });

  // Randomly select 3 cards
  const selectedCards: PackCard[] = [];
  const used = new Set<string>();

  while (selectedCards.length < 3 && eligibleCards.length > 0) {
    const randomIndex = Math.floor(Math.random() * eligibleCards.length);
    const card = eligibleCards[randomIndex];

    if (!used.has(card.id)) {
      selectedCards.push(card);
      used.add(card.id);
    }

    // Remove this card from eligible list
    eligibleCards.splice(randomIndex, 1);
  }

  // Fallback: if not enough cards, fill with random cards
  while (selectedCards.length < 3) {
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    if (!used.has(randomCard.id)) {
      selectedCards.push(randomCard);
      used.add(randomCard.id);
    }
  }

  return createBattleTeam(selectedCards, "Opponent's Dad Squad", false);
}

// ============================================================================
// BATTLE SIMULATION
// ============================================================================

/**
 * Simulate a 3v3 auto-battle
 */
export function simulateBattle(
  playerTeam: BattleTeam,
  opponentTeam: BattleTeam,
  maxTurns: number = 10
): BattleResult {
  const startTime = Date.now();
  const battleLog: BattleLogEntry[] = [];

  battleLog.push({
    turn: 0,
    action: 'attack',
    description: `⚔️ BATTLE START: ${playerTeam.teamName} vs ${opponentTeam.teamName}!`,
  });

  let turn = 0;
  let battleOver = false;

  // Clone teams for simulation
  const playerCards = [...playerTeam.cards];
  const opponentCards = [...opponentTeam.cards];

  while (turn < maxTurns && !battleOver) {
    turn++;

    // Get alive cards from each team
    const alivePlayerCards = playerCards.filter(c => c.isAlive);
    const aliveOpponentCards = opponentCards.filter(c => c.isAlive);

    // Check for battle end
    if (alivePlayerCards.length === 0 || aliveOpponentCards.length === 0) {
      battleOver = true;
      break;
    }

    // Each alive card attacks once per turn
    // Player attacks first
    for (const attacker of alivePlayerCards) {
      if (!attacker.isAlive) continue;

      const target = aliveOpponentCards[Math.floor(Math.random() * aliveOpponentCards.length)];
      const result = executeAttack(attacker, target, playerCards, opponentCards);

      battleLog.push(result.log);

      if (target.currentHP <= 0) {
        target.isAlive = false;
        target.currentHP = 0;

        battleLog.push({
          turn,
          action: 'knockout',
          description: `💥 ${target.card.name} has been knocked out!`,
          damage: 0,
        });

        // Check if opponent team is wiped
        if (opponentCards.filter(c => c.isAlive).length === 0) {
          battleOver = true;
          break;
        }
      }
    }

    if (battleOver) break;

    // Opponent attacks back
    for (const attacker of aliveOpponentCards) {
      if (!attacker.isAlive) continue;

      const alivePlayerCardsNow = playerCards.filter(c => c.isAlive);
      if (alivePlayerCardsNow.length === 0) {
        battleOver = true;
        break;
      }

      const target = alivePlayerCardsNow[Math.floor(Math.random() * alivePlayerCardsNow.length)];
      const result = executeAttack(attacker, target, opponentCards, playerCards);

      battleLog.push(result.log);

      if (target.currentHP <= 0) {
        target.isAlive = false;
        target.currentHP = 0;

        battleLog.push({
          turn,
          action: 'knockout',
          description: `💥 ${target.card.name} has been knocked out!`,
          damage: 0,
        });

        // Check if player team is wiped
        if (playerCards.filter(c => c.isAlive).length === 0) {
          battleOver = true;
          break;
        }
      }
    }
  }

  // Determine winner
  const alivePlayerCount = playerCards.filter(c => c.isAlive).length;
  const aliveOpponentCount = opponentCards.filter(c => c.isAlive).length;

  let winner: 'player' | 'opponent' | 'draw';

  if (alivePlayerCount > aliveOpponentCount) {
    winner = 'player';
    battleLog.push({
      turn,
      action: 'victory',
      description: `🏆 ${playerTeam.teamName} WINS!`,
    });
  } else if (aliveOpponentCount > alivePlayerCount) {
    winner = 'opponent';
    battleLog.push({
      turn,
      action: 'victory',
      description: `🏆 ${opponentTeam.teamName} WINS!`,
    });
  } else {
    winner = 'draw';
    battleLog.push({
      turn,
      action: 'victory',
      description: `🤝 It's a DRAW!`,
    });
  }

  const duration = Date.now() - startTime;

  return {
    winner,
    playerTeam: {
      ...playerTeam,
      cards: playerCards,
    },
    opponentTeam: {
      ...opponentTeam,
      cards: opponentCards,
    },
    turns: turn,
    battleLog,
    duration,
    timestamp: new Date(),
  };
}

/**
 * Execute a single attack
 */
function executeAttack(
  attacker: BattleCard,
  defender: BattleCard,
  attackerTeam: BattleCard[],
  defenderTeam: BattleCard[]
): { log: BattleLogEntry; damage: number } {
  // Get type advantage
  const typeAdv = getTypeAdvantage(attacker.card.type, defender.card.type);

  // Calculate base damage
  const baseDamage = calculateDamage(
    attacker.card,
    defender.card,
    'dadJoke',
    'dadJoke'
  );

  // Apply type advantage
  const damage = Math.floor(baseDamage * typeAdv);

  // Check for critical hit
  const critChance = 0.1 + (attacker.card.stats.dadJoke / 1000);
  const isCritical = Math.random() < critChance;
  const finalDamage = isCritical ? damage * 2 : damage;

  // Apply damage
  defender.currentHP = Math.max(0, defender.currentHP - finalDamage);

  // Generate flavor text
  const ability = attacker.card.abilities[0];
  const actionText = ability
    ? `${attacker.card.name} uses ${ability.name}!`
    : `${attacker.card.name} attacks!`;

  const typeAdvText = typeAdv > 1.0
    ? ` (Type advantage!)`
    : typeAdv < 1.0
    ? ` (Type disadvantage...)`
    : '';

  const log: BattleLogEntry = {
    turn: 0, // Will be set by caller
    action: 'attack',
    description: `${actionText} Hits ${defender.card.name} for ${finalDamage} damage!${typeAdvText}`,
    damage: finalDamage,
    criticalHit: isCritical,
  };

  return { log, damage: finalDamage };
}

/**
 * Calculate battle rewards for ranked mode
 */
export function calculateRewards(
  winner: 'player' | 'opponent' | 'draw',
  isRanked: boolean,
  currentTier: RankedTier
): BattleRewards {
  if (!isRanked) {
    return { xp: 10, rankPoints: 0 };
  }

  const tierMultiplier = {
    bronze: 1.0,
    silver: 1.2,
    gold: 1.5,
    platinum: 2.0,
    diamond: 2.5,
    champion: 3.0,
  }[currentTier];

  if (winner === 'player') {
    return {
      xp: Math.floor(50 * tierMultiplier),
      rankPoints: Math.floor(25 * tierMultiplier),
    };
  } else if (winner === 'opponent') {
    return {
      xp: 10,
      rankPoints: Math.floor(-10 * tierMultiplier),
    };
  } else {
    return {
      xp: 25,
      rankPoints: 0,
    };
  }
}

/**
 * Get ranked tier from rank points
 */
export function getTierFromRankPoints(rankPoints: number): RankedTier {
  if (rankPoints >= 5000) return 'champion';
  if (rankPoints >= 4000) return 'diamond';
  if (rankPoints >= 3000) return 'platinum';
  if (rankPoints >= 2000) return 'gold';
  if (rankPoints >= 1000) return 'silver';
  return 'bronze';
}

/**
 * Calculate rank from rank points (within tier)
 */
export function calculateRank(rankPoints: number, tier: RankedTier): number {
  const tierRanges: Record<RankedTier, [number, number]> = {
    bronze: [1001, 999999],
    silver: [501, 1000],
    gold: [201, 500],
    platinum: [51, 200],
    diamond: [11, 50],
    champion: [1, 10],
  };

  const [min, max] = tierRanges[tier];

  if (tier === 'bronze') {
    // Bronze is infinite at the bottom
    return Math.max(1001, 1001 - Math.floor((rankPoints - 999) / 2));
  }

  // For other tiers, calculate position within tier
  const tierPoints = rankPoints - (tier === 'silver' ? 1000 : tier === 'gold' ? 2000 : tier === 'platinum' ? 3000 : tier === 'diamond' ? 4000 : 5000);
  const tierSize = max - min + 1;
  const position = tierSize - Math.floor(tierPoints / 50);

  return Math.max(min, Math.min(max, position));
}

/**
 * Calculate win rate from wins and losses
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

/**
 * Validate battle deck (3 cards)
 */
export function validateBattleDeck(cards: PackCard[]): {
  valid: boolean;
  error?: string;
} {
  if (cards.length !== 3) {
    return {
      valid: false,
      error: `Battle deck must have exactly 3 cards (have ${cards.length})`,
    };
  }

  // Check for duplicates
  const uniqueIds = new Set(cards.map(c => c.id));
  if (uniqueIds.size !== cards.length) {
    return {
      valid: false,
      error: 'Cannot have duplicate cards in battle deck',
    };
  }

  return { valid: true };
}

/**
 * Get battle summary text
 */
export function getBattleSummary(result: BattleResult): string {
  const { winner, turns, playerTeam, opponentTeam } = result;

  const playerAlive = playerTeam.cards.filter(c => c.isAlive).length;
  const opponentAlive = opponentTeam.cards.filter(c => c.isAlive).length;

  const winnerText = winner === 'player'
    ? `🏆 VICTORY! Your dads dominated!`
    : winner === 'opponent'
    ? `💀 DEFEAT! Your dads were out-dad-ed!`
    : `🤝 DRAW! An evenly matched battle!`;

  return `${winnerText}\nBattle lasted ${turns} turns.\nYour team: ${playerAlive}/3 alive\nOpponent: ${opponentAlive}/3 alive`;
}
