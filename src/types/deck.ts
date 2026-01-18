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
