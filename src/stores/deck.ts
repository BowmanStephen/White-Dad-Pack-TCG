/**
 * Deck store - manages deck building state
 *
 * Uses Nanostores for reactive state management with LocalStorage persistence.
 * Handles deck CRUD operations, current deck being edited, and validation.
 */

import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { Deck, DeckCard, DeckValidation } from '@/types';
import {
  createDeck,
  addCardToDeck,
  removeCardFromDeck,
  updateCardCount,
  updateDeckMetadata,
  cloneDeck,
  validateDeck,
  canAddCardToDeck
} from '@/lib/deck';

/**
 * All saved decks (max 10)
 * Persisted to LocalStorage
 */
export const decks = persistentAtom<Deck[]>('daddeck-decks', [], {
  encode: (value) => {
    // Custom encoder to handle Date serialization
    return JSON.stringify(value, (key, value) => {
      if (value instanceof Date) {
        return { __date__: true, value: value.toISOString() };
      }
      return value;
    });
  },
  decode: (value) => {
    // Custom decoder to handle Date deserialization
    return JSON.parse(value, (key, value) => {
      if (value && typeof value === 'object' && value.__date__) {
        return new Date(value.value);
      }
      return value;
    });
  },
});

/**
 * Currently editing deck (null if viewing deck list)
 */
export const currentDeck = atom<Deck | null>(null);

/**
 * Currently selected deck ID for viewing
 */
export const selectedDeckId = atom<string | null>(null);

/**
 * Validation result for current deck
 */
export const deckValidation = computed(
  [currentDeck, decks],
  (deck, allDecks) => {
    if (!deck) {
      return {
        isValid: false,
        errors: ['No deck selected'],
        warnings: [],
      };
    }
    return validateDeck(deck, allDecks);
  }
);

/**
 * Selected deck from list (for viewing)
 */
export const selectedDeck = computed(
  [decks, selectedDeckId],
  (allDecks, id) => allDecks.find(d => d.id === id) || null
);

/**
 * Number of decks (max 10)
 */
export const deckCount = computed(decks, (allDecks) => allDecks.length);

/**
 * Whether deck limit has been reached
 */
export const isDeckLimitReached = computed(deckCount, (count) => count >= 10);

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Create a new deck and start editing it
 */
export function createNewDeck(name: string = 'New Deck', description?: string): void {
  const newDeck = createDeck(name, description, []);
  currentDeck.set(newDeck);
  selectedDeckId.set(null);
}

/**
 * Load an existing deck for editing
 */
export function loadDeck(deckId: string): void {
  const allDecks = decks.get();
  const deck = allDecks.find(d => d.id === deckId);
  if (deck) {
    currentDeck.set(deck);
    selectedDeckId.set(null);
  }
}

/**
 * Select a deck for viewing (read-only)
 */
export function selectDeck(deckId: string): void {
  selectedDeckId.set(deckId);
  currentDeck.set(null);
}

/**
 * Save the current deck
 */
export function saveCurrentDeck(): void {
  const deck = currentDeck.get();
  if (!deck) return;

  const allDecks = decks.get();
  const existingIndex = allDecks.findIndex(d => d.id === deck.id);

  let newDecks: Deck[];
  if (existingIndex >= 0) {
    // Update existing deck
    newDecks = [...allDecks];
    newDecks[existingIndex] = deck;
  } else {
    // Add new deck (if under limit)
    if (allDecks.length >= 10) {
      throw new Error('Maximum of 10 decks reached. Please delete a deck first.');
    }
    newDecks = [...allDecks, deck];
  }

  decks.set(newDecks);
}

/**
 * Delete a deck by ID
 */
export function deleteDeck(deckId: string): void {
  const allDecks = decks.get();
  const newDecks = allDecks.filter(d => d.id !== deckId);
  decks.set(newDecks);

  // Clear current deck if it was deleted
  const current = currentDeck.get();
  if (current && current.id === deckId) {
    currentDeck.set(null);
  }

  // Clear selected deck if it was deleted
  const selected = selectedDeckId.get();
  if (selected === deckId) {
    selectedDeckId.set(null);
  }
}

/**
 * Duplicate a deck
 */
export function duplicateDeck(deckId: string, newName?: string): void {
  const allDecks = decks.get();
  const deck = allDecks.find(d => d.id === deckId);

  if (!deck) return;

  if (allDecks.length >= 10) {
    throw new Error('Maximum of 10 decks reached. Please delete a deck first.');
  }

  const clonedDeck = cloneDeck(deck, newName);
  decks.set([...allDecks, clonedDeck]);
}

/**
 * Add a card to the current deck
 */
export function addCard(card: any, count: number = 1): void {
  const deck = currentDeck.get();
  if (!deck) {
    throw new Error('No deck selected. Create or load a deck first.');
  }

  // Check if card can be added
  const deckCard = { cardId: card.id, card, count };
  const validation = canAddCardToDeck(deckCard, deck);

  if (!validation.canAdd) {
    throw new Error(validation.reason);
  }

  const updatedDeck = addCardToDeck(deck, card, count);
  currentDeck.set(updatedDeck);
}

/**
 * Remove a card from the current deck
 */
export function removeCard(cardId: string): void {
  const deck = currentDeck.get();
  if (!deck) return;

  const updatedDeck = removeCardFromDeck(deck, cardId);
  currentDeck.set(updatedDeck);
}

/**
 * Update card count in current deck
 */
export function setCardCount(cardId: string, count: number): void {
  const deck = currentDeck.get();
  if (!deck) return;

  const updatedDeck = updateCardCount(deck, cardId, count);
  currentDeck.set(updatedDeck);
}

/**
 * Update current deck metadata
 */
export function updateDeckInfo(name: string, description?: string): void {
  const deck = currentDeck.get();
  if (!deck) return;

  const updatedDeck = updateDeckMetadata(deck, name, description);
  currentDeck.set(updatedDeck);
}

/**
 * Clear the current deck (exit edit mode)
 */
export function clearCurrentDeck(): void {
  currentDeck.set(null);
}

/**
 * Clear deck selection (exit view mode)
 */
export function clearSelectedDeck(): void {
  selectedDeckId.set(null);
}

/**
 * Reset all decks (for testing/debugging)
 */
export function resetAllDecks(): void {
  decks.set([]);
  currentDeck.set(null);
  selectedDeckId.set(null);
}
