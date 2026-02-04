import type { Deck, DeckCard, DeckValidation } from '@/types';

/**
 * Validate a deck according to TCG rules
 * - Max 10 decks per user
 * - Max 4 copies of each card (visual duplicates allowed)
 * - Deck must have a name
 * - Deck must have at least 1 card
 */
export function validateDeck(deck: Deck, existingDecks: Deck[]): DeckValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Name validation
  if (!deck.name || deck.name.trim().length === 0) {
    errors.push('Deck name is required');
  }

  if (deck.name && deck.name.length > 50) {
    errors.push('Deck name must be 50 characters or less');
  }

  // Card count validation
  if (deck.cards.length === 0) {
    errors.push('Deck must contain at least 1 card');
  }

  // Check for duplicate card IDs exceeding limit
  const cardCounts = new Map<string, number>();
  for (const deckCard of deck.cards) {
    const currentCount = cardCounts.get(deckCard.cardId) || 0;
    cardCounts.set(deckCard.cardId, currentCount + deckCard.count);

    if (currentCount + deckCard.count > 4) {
      errors.push(`Card "${deckCard.card.name}" exceeds maximum of 4 copies`);
    }
  }

  // Check deck count limit (warning only, enforced at save time)
  if (existingDecks.length >= 10 && !existingDecks.find(d => d.id === deck.id)) {
    warnings.push('Maximum of 10 decks reached. Creating a new deck will require deleting an existing one.');
  }

  // Description validation (optional)
  if (deck.description && deck.description.length > 200) {
    warnings.push('Description is longer than 200 characters and may be truncated');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a card can be added to a deck
 */
export function canAddCardToDeck(deckCard: DeckCard, deck: Deck): { canAdd: boolean; reason?: string } {
  // Find existing card in deck
  const existingCard = deck.cards.find(dc => dc.cardId === deckCard.cardId);

  // Calculate new count
  const currentCount = existingCard?.count || 0;
  const newCount = currentCount + deckCard.count;

  if (newCount > 4) {
    return {
      canAdd: false,
      reason: `Cannot add more than 4 copies of "${deckCard.card.name}"`,
    };
  }

  return { canAdd: true };
}

/**
 * Check if deck limit has been reached
 */
export function isDeckLimitReached(decks: Deck[]): boolean {
  return decks.length >= 10;
}

/**
 * Validate deck name uniqueness
 */
export function isDeckNameUnique(name: string, decks: Deck[], excludeId?: string): boolean {
  return !decks.some(deck => deck.name === name && deck.id !== excludeId);
}
