import type { Rarity, DadType } from './core';
import type { Card, CardStats } from './card';

// ============================================================================
// DECK BUILDER TYPES (US084 - Collection - Decks Builder)
// ============================================================================

// Card in a deck (with count for duplicates)
export interface DeckCard {
  cardId: string;           // Reference to card ID
  card: Card;               // Full card data
  count: number;            // Number of copies (1-4, visual duplicates allowed)
}

// Deck statistics (computed from deck cards)
export interface DeckStats {
  totalCards: number;       // Total card count (including duplicates)
  uniqueCards: number;      // Number of unique cards
  rarityBreakdown: Record<Rarity, number>; // Count by rarity
  statTotal: CardStats;     // Sum of all card stats (multiplied by count)
  typeBreakdown: Record<DadType, number>; // Count by dad type
  averageStats: CardStats;  // Average stats across all cards
}

// Deck interface
export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: DeckCard[];        // Cards in deck (with counts)
  createdAt: Date;
  updatedAt: Date;
  stats: DeckStats;         // Computed statistics
}

// Deck state for UI
export interface DeckState {
  decks: Deck[];            // All saved decks (max 10)
  currentDeck: Deck | null; // Currently editing deck
  selectedDeckId: string | null; // ID of selected deck for viewing
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
