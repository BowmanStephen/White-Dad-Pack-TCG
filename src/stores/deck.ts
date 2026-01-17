import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { Card, Deck, DeckCard, DeckValidation } from '@/types';
import {
  calculateDeckStats,
  cloneDeck,
  createDeck,
  createDeckCard,
  generateDeckId,
  isDeckLimitReached,
  isDeckNameUnique,
  updateDeckCards,
  updateDeckMetadata,
  validateDeck,
  canAddCardToDeck,
  addCardToDeck,
  removeCardFromDeck,
  updateCardCount,
  exportDeckToText,
  importDeckFromText,
} from '@/lib/deck';
import { getAllCards } from '@/lib/cards/database';
import { trackEvent } from './analytics';

// Get all cards once for deck import functionality
const ALL_CARDS = getAllCards();

// ============================================================================
// ENCODER FOR LOCALSTORAGE (handles Date serialization)
// ============================================================================

const deckListEncoder = {
  encode(data: Deck[]): string {
    return JSON.stringify(data, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): Deck[] {
    const data = JSON.parse(str);
    // Convert ISO strings back to Date objects
    return data.map((deck: any) => ({
      ...deck,
      createdAt: new Date(deck.createdAt),
      updatedAt: new Date(deck.updatedAt),
    }));
  },
};

// ============================================================================
// DECK STORES
// ============================================================================

// All saved decks (max 10, persisted to LocalStorage)
export const decks = persistentAtom<Deck[]>('daddeck-decks', [], deckListEncoder);

// Currently editing deck (transient state)
export const currentDeck = atom<Deck | null>(null);

// Selected deck ID for viewing (transient state)
export const selectedDeckId = atom<string | null>(null);

// ============================================================================
// DECK ACTIONS
// ============================================================================

/**
 * Get all decks
 */
export function getAllDecks(): Deck[] {
  return decks.get();
}

/**
 * Get a deck by ID
 */
export function getDeckById(id: string): Deck | undefined {
  return decks.get().find(deck => deck.id === id);
}

/**
 * Get the currently selected deck
 */
export function getSelectedDeck(): Deck | undefined {
  const id = selectedDeckId.get();
  return id ? getDeckById(id) : undefined;
}

/**
 * Create a new deck
 */
export function createNewDeck(
  name: string,
  description?: string,
  cards: DeckCard[] = []
): { success: boolean; deck?: Deck; error?: string } {
  const existingDecks = decks.get();

  // Check deck limit
  if (isDeckLimitReached(existingDecks)) {
    return {
      success: false,
      error: 'Maximum of 10 decks reached. Delete an existing deck to create a new one.',
    };
  }

  // Check name uniqueness
  if (!isDeckNameUnique(name, existingDecks)) {
    return {
      success: false,
      error: `A deck named "${name}" already exists. Please choose a different name.`,
    };
  }

  // Create deck
  const newDeck = createDeck(name, description, cards);

  // Validate
  const validation = validateDeck(newDeck, existingDecks);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(', '),
    };
  }

  // Save
  decks.set([...existingDecks, newDeck]);
  currentDeck.set(newDeck);
  selectedDeckId.set(newDeck.id);

  // Track analytics
  trackEvent({
    type: 'collection_view', // Re-using existing type, could add deck-specific
    data: {
      totalPacks: 0,
      totalCards: newDeck.stats.totalCards,
      uniqueCards: newDeck.stats.uniqueCards,
    },
  });

  return { success: true, deck: newDeck };
}

/**
 * Update an existing deck
 */
export function updateDeck(
  deckId: string,
  updates: Partial<Pick<Deck, 'name' | 'description' | 'cards'>>
): { success: boolean; deck?: Deck; error?: string } {
  const existingDecks = decks.get();
  const deckIndex = existingDecks.findIndex(d => d.id === deckId);

  if (deckIndex === -1) {
    return { success: false, error: 'Deck not found' };
  }

  const deck = existingDecks[deckIndex];
  let updatedDeck: Deck;

  // Update metadata or cards
  if (updates.name !== undefined || updates.description !== undefined) {
    const newName = updates.name ?? deck.name;
    const newDescription = updates.description;

    // Check name uniqueness if name changed
    if (updates.name !== undefined && !isDeckNameUnique(newName, existingDecks, deckId)) {
      return {
        success: false,
        error: `A deck named "${newName}" already exists.`,
      };
    }

    updatedDeck = updateDeckMetadata(deck, newName, newDescription);
  } else if (updates.cards !== undefined) {
    updatedDeck = updateDeckCards(deck, updates.cards);
  } else {
    return { success: false, error: 'No updates provided' };
  }

  // Validate
  const validation = validateDeck(updatedDeck, existingDecks);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(', '),
    };
  }

  // Save
  const newDecks = [...existingDecks];
  newDecks[deckIndex] = updatedDeck;
  decks.set(newDecks);

  // Update current/selected if applicable
  if (currentDeck.get()?.id === deckId) {
    currentDeck.set(updatedDeck);
  }

  return { success: true, deck: updatedDeck };
}

/**
 * Delete a deck
 */
export function deleteDeck(deckId: string): { success: boolean; error?: string } {
  const existingDecks = decks.get();
  const newDecks = existingDecks.filter(d => d.id !== deckId);

  if (newDecks.length === existingDecks.length) {
    return { success: false, error: 'Deck not found' };
  }

  decks.set(newDecks);

  // Clear current/selected if applicable
  if (currentDeck.get()?.id === deckId) {
    currentDeck.set(null);
  }
  if (selectedDeckId.get() === deckId) {
    selectedDeckId.set(null);
  }

  return { success: true };
}

/**
 * Duplicate a deck
 */
export function duplicateDeck(
  deckId: string,
  newName?: string
): { success: boolean; deck?: Deck; error?: string } {
  const existingDecks = decks.get();
  const deck = getDeckById(deckId);

  if (!deck) {
    return { success: false, error: 'Deck not found' };
  }

  // Check deck limit
  if (isDeckLimitReached(existingDecks)) {
    return {
      success: false,
      error: 'Maximum of 10 decks reached. Delete an existing deck to create a new one.',
    };
  }

  // Clone deck
  const newDeck = cloneDeck(deck, newName);

  // Ensure name uniqueness
  let finalName = newDeck.name;
  let suffix = 1;
  while (!isDeckNameUnique(finalName, existingDecks)) {
    finalName = `${newDeck.name} (${suffix})`;
    suffix++;
  }

  if (finalName !== newDeck.name) {
    newDeck.name = finalName;
    newDeck.updatedAt = new Date();
  }

  // Save
  decks.set([...existingDecks, newDeck]);

  return { success: true, deck: newDeck };
}

/**
 * Set the current deck for editing
 */
export function setCurrentDeck(deckId: string | null): void {
  const deck = deckId ? getDeckById(deckId) : null;
  currentDeck.set(deck);
  selectedDeckId.set(deckId);
}

/**
 * Set the selected deck for viewing
 */
export function setSelectedDeck(deckId: string | null): void {
  selectedDeckId.set(deckId);
}

/**
 * Add a card to the current deck
 */
export function addCardToCurrentDeck(
  card: Card,
  count: number = 1
): { success: boolean; error?: string } {
  const current = currentDeck.get();

  if (!current) {
    return { success: false, error: 'No deck selected. Create or select a deck first.' };
  }

  // Check if can add
  const canAdd = canAddCardToDeck(createDeckCard(card, count), current);
  if (!canAdd.canAdd) {
    return { success: false, error: canAdd.reason };
  }

  // Add card
  const updatedDeck = addCardToDeck(current, card, count);
  currentDeck.set(updatedDeck);

  // Update in list
  return updateDeck(current.id, { cards: updatedDeck.cards });
}

/**
 * Remove a card from the current deck
 */
export function removeCardFromCurrentDeck(cardId: string): { success: boolean; error?: string } {
  const current = currentDeck.get();

  if (!current) {
    return { success: false, error: 'No deck selected' };
  }

  const updatedDeck = removeCardFromDeck(current, cardId);
  currentDeck.set(updatedDeck);

  return updateDeck(current.id, { cards: updatedDeck.cards });
}

/**
 * Update card count in current deck
 */
export function updateCardCountInCurrentDeck(
  cardId: string,
  count: number
): { success: boolean; error?: string } {
  const current = currentDeck.get();

  if (!current) {
    return { success: false, error: 'No deck selected' };
  }

  const updatedDeck = updateCardCount(current, cardId, count);
  currentDeck.set(updatedDeck);

  return updateDeck(current.id, { cards: updatedDeck.cards });
}

/**
 * Validate a deck
 */
export function validateDeckById(deckId: string): DeckValidation {
  const deck = getDeckById(deckId);
  const existingDecks = decks.get();

  if (!deck) {
    return {
      isValid: false,
      errors: ['Deck not found'],
      warnings: [],
    };
  }

  return validateDeck(deck, existingDecks);
}

/**
 * Export a deck to text format
 */
export function exportDeck(deckId: string): string {
  const deck = getDeckById(deckId);
  if (!deck) {
    return '';
  }
  return exportDeckToText(deck);
}

/**
 * Import a deck from text format
 */
export function importDeck(text: string): { success: boolean; deck?: Deck; error?: string } {
  const existingDecks = decks.get();

  // Check deck limit
  if (isDeckLimitReached(existingDecks)) {
    return {
      success: false,
      error: 'Maximum of 10 decks reached. Delete an existing deck to import.',
    };
  }

  // Import
  const result = importDeckFromText(text, ALL_CARDS);

  if (!result.success || !result.deck) {
    return result;
  }

  // Ensure name uniqueness
  let finalName = result.deck.name;
  let suffix = 1;
  while (!isDeckNameUnique(finalName, existingDecks)) {
    finalName = `${result.deck.name} (${suffix})`;
    suffix++;
  }

  if (finalName !== result.deck.name) {
    result.deck.name = finalName;
  }

  // Save
  decks.set([...existingDecks, result.deck]);
  currentDeck.set(result.deck);
  selectedDeckId.set(result.deck.id);

  return { success: true, deck: result.deck };
}

/**
 * Clear all decks (for testing/reset)
 */
export function clearAllDecks(): void {
  decks.set([]);
  currentDeck.set(null);
  selectedDeckId.set(null);
}

/**
 * Get deck count
 */
export function getDeckCount(): number {
  return decks.get().length;
}

/**
 * Check if deck limit has been reached
 */
export function checkDeckLimit(): boolean {
  return isDeckLimitReached(decks.get());
}
