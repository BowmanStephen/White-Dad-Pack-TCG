/**
 * Deck import/export utilities
 *
 * Provides functionality for sharing decks through:
 * - JSON export/import
 * - Text format export/import
 * - URL encoding for sharing via query params
 */

import type { Deck, DeckExport, DeckCard } from '@/types';
import { getAllCards } from '@/lib/cards/database';
import { calculateDeckStats } from './utils';

/**
 * Export a deck to JSON format
 *
 * @param deck - The deck to export
 * @returns JSON string of the deck
 */
export function exportDeckToJSON(deck: Deck): string {
  const exportData: DeckExport = {
    name: deck.name,
    description: deck.description,
    cards: deck.cards.map(dc => ({
      cardId: dc.cardId,
      cardName: dc.card.name,
      count: dc.count,
    })),
    exportedAt: new Date(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export a deck to text format (human-readable)
 *
 * @param deck - The deck to export
 * @returns Formatted text string of the deck
 */
export function exportDeckToText(deck: Deck): string {
  const lines: string[] = [];

  // Header
  lines.push(`=== ${deck.name} ===`);
  if (deck.description) {
    lines.push(deck.description);
  }
  lines.push('');
  lines.push(`Total Cards: ${deck.stats.totalCards}`);
  lines.push(`Created: ${new Date(deck.createdAt).toLocaleDateString()}`);
  lines.push('');
  lines.push('--- Cards ---');

  // Group cards by count
  const cardGroups = deck.cards.map(dc => ({
    name: dc.card.name,
    count: dc.count,
    rarity: dc.card.rarity,
    type: dc.card.type,
  }));

  // Sort by rarity then name
  const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  cardGroups.sort((a, b) => {
    const rarityDiff = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    if (rarityDiff !== 0) return rarityDiff;
    return a.name.localeCompare(b.name);
  });

  // Format: "3x Card Name (Rarity)"
  for (const group of cardGroups) {
    lines.push(`${group.count}x ${group.name} (${group.rarity})`);
  }

  return lines.join('\n');
}

/**
 * Import a deck from JSON format
 *
 * Validates that:
 * - JSON is valid
 * - All cards in the deck exist in the database
 *
 * @param jsonString - The JSON string to import
 * @param userCards - Optional array of card IDs the user owns (for validation)
 * @returns The imported deck
 * @throws Error if JSON is invalid or cards don't exist
 */
export function importDeckFromJSON(
  jsonString: string,
  userCards?: string[]
): Deck {
  let importData: DeckExport;

  // Parse JSON
  try {
    importData = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format. Please check the deck data.');
  }

  // Validate import data structure
  if (!importData.name || typeof importData.name !== 'string') {
    throw new Error('Deck name is required.');
  }

  if (!Array.isArray(importData.cards)) {
    throw new Error('Deck must contain a cards array.');
  }

  // Get all cards from database
  const allCards = getAllCards();
  const cardMap = new Map(allCards.map(c => [c.id, c]));

  // Build deck cards and validate ownership
  const deckCards: DeckCard[] = [];
  const missingCards: string[] = [];
  const unownedCards: string[] = [];

  for (const cardData of importData.cards) {
    if (!cardData.cardId || typeof cardData.cardId !== 'string') {
      throw new Error('Each card must have a valid cardId.');
    }

    if (typeof cardData.count !== 'number' || cardData.count < 1) {
      throw new Error(`Invalid count for card ${cardData.cardName || cardData.cardId}`);
    }

    const card = cardMap.get(cardData.cardId);

    if (!card) {
      missingCards.push(cardData.cardName || cardData.cardId);
      continue;
    }

    // Check ownership if userCards provided
    if (userCards && !userCards.includes(cardData.cardId)) {
      unownedCards.push(card.name);
      continue;
    }

    deckCards.push({
      cardId: card.id,
      card,
      count: cardData.count,
    });
  }

  // Report missing cards
  if (missingCards.length > 0) {
    throw new Error(
      `The following cards are not available: ${missingCards.join(', ')}`
    );
  }

  // Report unowned cards (warning, not error)
  if (unownedCards.length > 0) {
    console.warn(
      `Warning: You don't own these cards: ${unownedCards.join(', ')}`
    );
  }

  // Create deck
  const now = new Date();
  const deck: Deck = {
    id: crypto.randomUUID(),
    name: importData.name,
    description: importData.description,
    cards: deckCards,
    createdAt: now,
    updatedAt: now,
    stats: calculateDeckStats(deckCards),
  };

  return deck;
}

/**
 * Import a deck from text format
 *
 * Supports formats:
 * - "3x Card Name (Rarity)"
 * - "3x Card Name"
 * - Lines starting with "#" are comments
 *
 * @param text - The text string to import
 * @param userCards - Optional array of card IDs the user owns (for validation)
 * @returns The imported deck
 * @throws Error if text is invalid or cards don't exist
 */
export function importDeckFromText(
  text: string,
  userCards?: string[]
): Deck {
  const lines = text.split('\n');
  const cardEntries: Array<{ name: string; count: number; rarity?: string }> = [];

  // Parse each line
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Skip header lines (===, ---, Total:, Created:, etc.)
    if (
      trimmed.startsWith('===') ||
      trimmed.startsWith('---') ||
      trimmed.startsWith('Total') ||
      trimmed.startsWith('Created')
    ) {
      continue;
    }

    // Parse card line: "3x Card Name (Rarity)" or "3x Card Name"
    const match = trimmed.match(/^(\d+)x\s+(.+?)(?:\s+\((\w+)\))?$/);

    if (!match) {
      // Skip non-card lines (like description)
      continue;
    }

    const [, countStr, name, rarity] = match;
    const count = parseInt(countStr, 10);

    if (count < 1 || count > 99) {
      throw new Error(`Invalid count: ${count} for card "${name}"`);
    }

    cardEntries.push({ name: name.trim(), count, rarity });
  }

  if (cardEntries.length === 0) {
    throw new Error('No valid cards found in text. Use format: "3x Card Name (Rarity)"');
  }

  // Get all cards from database
  const allCards = getAllCards();
  const cardMap = new Map(
    allCards.map(c => [c.name.toLowerCase(), { card: c, rarity: c.rarity }])
  );

  // Build deck cards and validate
  const deckCards: DeckCard[] = [];
  const missingCards: string[] = [];
  const unownedCards: string[] = [];

  for (const entry of cardEntries) {
    const matched = cardMap.get(entry.name.toLowerCase());

    if (!matched) {
      missingCards.push(entry.name);
      continue;
    }

    // Check rarity if specified
    if (entry.rarity && matched.rarity !== entry.rarity) {
      console.warn(
        `Warning: Rarity mismatch for "${entry.name}". Expected: ${entry.rarity}, Found: ${matched.rarity}`
      );
    }

    // Check ownership if userCards provided
    if (userCards && !userCards.includes(matched.card.id)) {
      unownedCards.push(matched.card.name);
      continue;
    }

    deckCards.push({
      cardId: matched.card.id,
      card: matched.card,
      count: entry.count,
    });
  }

  // Report missing cards
  if (missingCards.length > 0) {
    throw new Error(
      `The following cards are not available: ${missingCards.join(', ')}`
    );
  }

  // Report unowned cards (warning, not error)
  if (unownedCards.length > 0) {
    console.warn(
      `Warning: You don't own these cards: ${unownedCards.join(', ')}`
    );
  }

  // Create deck
  const now = new Date();
  const deck: Deck = {
    id: crypto.randomUUID(),
    name: 'Imported Deck',
    description: 'Imported from text',
    cards: deckCards,
    createdAt: now,
    updatedAt: now,
    stats: calculateDeckStats(deckCards),
  };

  return deck;
}

/**
 * Encode a deck for URL sharing (base64 encoded JSON)
 *
 * @param deck - The deck to encode
 * @returns Base64 encoded string safe for URLs
 */
export function encodeDeckForURL(deck: Deck): string {
  const exportData = {
    n: deck.name.substring(0, 50), // Limit name length for URL
    d: deck.description?.substring(0, 200),
    c: deck.cards.map(dc => ({
      i: dc.cardId, // Shorter key for cardId
      q: dc.count, // Shorter key for count
    })),
  };

  const json = JSON.stringify(exportData);
  return btoa(json)
    .replace(/\+/g, '-') // Replace + with -
    .replace(/\//g, '_') // Replace / with _
    .replace(/=/g, ''); // Remove padding =
}

/**
 * Decode a deck from URL parameter
 *
 * @param encoded - The base64 encoded string from URL
 * @param userCards - Optional array of card IDs the user owns (for validation)
 * @returns The decoded deck
 * @throws Error if encoding is invalid or cards don't exist
 */
export function decodeDeckFromURL(
  encoded: string,
  userCards?: string[]
): Deck {
  try {
    // Restore base64 padding
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = atob(base64);
    const data = JSON.parse(json);

    // Build standard import format
    const importData: DeckExport = {
      name: data.n || 'Shared Deck',
      description: data.d,
      cards: [],
      exportedAt: new Date(),
    };

    // Get all cards for validation
    const allCards = getAllCards();
    const cardMap = new Map(allCards.map(c => [c.id, c]));

    // Build deck cards
    const deckCards: DeckCard[] = [];

    for (const cardData of data.c || []) {
      const cardId = cardData.i;
      const count = cardData.q || 1;

      const card = cardMap.get(cardId);
      if (!card) {
        console.warn(`Warning: Card ${cardId} not found in database`);
        continue;
      }

      // Check ownership
      if (userCards && !userCards.includes(cardId)) {
        console.warn(`Warning: You don't own card "${card.name}"`);
        continue;
      }

      deckCards.push({
        cardId: card.id,
        card,
        count,
      });
    }

    // Create deck
    const now = new Date();
    const deck: Deck = {
      id: crypto.randomUUID(),
      name: importData.name,
      description: importData.description,
      cards: deckCards,
      createdAt: now,
      updatedAt: now,
      stats: calculateDeckStats(deckCards),
    };

    return deck;
  } catch (error) {
    throw new Error('Invalid deck URL format. Please check the link.');
  }
}

/**
 * Validate if a deck export string is valid JSON
 *
 * @param jsonString - The JSON string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDeckJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.name === 'string' &&
      Array.isArray(data.cards)
    );
  } catch {
    return false;
  }
}
