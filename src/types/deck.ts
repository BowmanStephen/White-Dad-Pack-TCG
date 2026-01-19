// ============================================================================
// DECK BUILDER TYPES (US084 - Collection - Decks Builder)
// ============================================================================

import type { Card, Rarity, DadType, CardStats } from './card';

// Card in a deck (with count for duplicates)
export interface DeckCard {
  cardId: string;
  card: Card;
  count: number;
}

// Deck statistics (computed from deck cards)
export interface DeckStats {
  totalCards: number;
  uniqueCards: number;
  rarityBreakdown: Record<Rarity, number>;
  statTotal: CardStats;
  typeBreakdown: Record<DadType, number>;
  averageStats: CardStats;
}

// Deck interface
export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: DeckCard[];
  createdAt: Date;
  updatedAt: Date;
  stats: DeckStats;
}

// Deck state for UI
export interface DeckState {
  decks: Deck[];
  currentDeck: Deck | null;
  selectedDeckId: string | null;
}

// Deck validation result
export interface DeckValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Deck export format (text format for sharing)
export interface DeckExport {
  name: string;
  description?: string;
  cards: Array<{
    cardId: string;
    cardName: string;
    count: number;
  }>;
  exportedAt: Date;
}

// ============================================================================
// DECK BATTLE TYPES (PACK-007 - Battle System - Stat Normalization)
// ============================================================================

/**
 * Deck battle statistics
 *
 * Contains normalized power calculations for fair deck battles.
 * All stats are normalized by card count to prevent larger decks
 * from having an unfair advantage.
 */
export interface DeckBattleStats {
  /** Total normalized power (average of all stats) */
  totalPower: number;
  /** Effective power after applying type advantages */
  effectivePower: number;
  /** Final power after applying all bonuses (type advantage + synergy) */
  finalPower: number;
  /** Normalized stats (average per card) */
  normalizedStats: CardStats;
  /** Most common card type in the deck */
  mainType: DadType;
}

/**
 * Result of a deck vs deck battle
 *
 * Contains the battle outcome, damage dealt, statistics for both decks,
 * type advantages, synergy bonuses, and a detailed battle log.
 */
export interface DeckBattleResult {
  /** Winning deck */
  winner: Deck;
  /** Losing deck */
  loser: Deck;
  /** Damage dealt by attacker to defender */
  damage: number;
  /** Attacker's battle statistics (normalized) */
  attackerStats: DeckBattleStats;
  /** Defender's battle statistics (normalized) */
  defenderStats: DeckBattleStats;
  /** Type advantage multiplier (1.5 = advantage, 0.75 = disadvantage, 1.0 = neutral) */
  typeAdvantage: number;
  /** Synergy bonus multiplier (1.0 = none, up to 2.0 for mythic alliances) */
  synergyBonus: number;
  /** Number of turns in battle (deck battles are single-turn calculations) */
  turns: number;
  /** Detailed battle log entries */
  log: string[];
}
