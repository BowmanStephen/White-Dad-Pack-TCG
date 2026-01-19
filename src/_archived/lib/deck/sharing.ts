/**
 * Deck sharing module
 *
 * Provides functionality to export decks as shareable codes and import decks from codes.
 * Uses a compact base64-encoded format for easy sharing via text/chat.
 *
 * Format: DadDeck<v1>|<base64-encoded-JSON>
 * - Version prefix for future compatibility
 * - Base64 encoding for compact, URL-safe sharing
 * - Includes deck metadata and card list with counts
 */

import type { Deck, Card } from '@/types';
import { getAllCards } from '@/lib/cards/database';

// ============================================================================
// CONSTANTS
// ============================================================================

const DECK_CODE_VERSION = 'v1';
const DECK_CODE_PREFIX = 'DadDeck';
const DECK_CODE_SEPARATOR = '|';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Serializable deck format for encoding
 */
interface SerializableDeck {
  name: string;
  description?: string;
  cards: Array<{
    cardId: string;
    count: number;
  }>;
}

/**
 * Import result with validation
 */
export interface DeckImportResult {
  success: boolean;
  deck?: Partial<Deck>;
  errors: string[];
  warnings: string[];
  missingCards: string[];
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Generate a shareable deck code from a deck
 *
 * Format: DadDeck<v1>|<base64-encoded-json>
 *
 * @param deck - The deck to export
 * @returns Shareable deck code
 *
 * @example
 * ```ts
 * const code = exportDeckToCode(myDeck);
 * console.log(code); // "DadDeckv1|eyJuYW1lIjoiQkJRIEZhdm9yaXRlcyI...
 * ```
 */
export function exportDeckToCode(deck: Deck): string {
  try {
    // Create serializable format
    const serializable: SerializableDeck = {
      name: deck.name,
      description: deck.description,
      cards: deck.cards.map((dc) => ({
        cardId: dc.cardId,
        count: dc.count,
      })),
    };

    // Encode to JSON
    const json = JSON.stringify(serializable);

    // Convert to base64 (URL-safe)
    const base64 = btoa(json)
      .replace(/\+/g, '-')  // Replace + with - (URL-safe)
      .replace(/\//g, '_')  // Replace / with _ (URL-safe)
      .replace(/=+$/, '');  // Remove trailing = padding

    // Combine with version prefix
    return `${DECK_CODE_PREFIX}${DECK_CODE_VERSION}${DECK_CODE_SEPARATOR}${base64}`;
  } catch (error) {
    console.error('[DeckSharing] Failed to export deck:', error);
    throw new Error('Failed to export deck. Please try again.');
  }
}

/**
 * Export deck as formatted text (human-readable)
 *
 * @param deck - The deck to export
 * @returns Formatted deck string
 *
 * @example
 * ```ts
 * const text = exportDeckToText(myDeck);
 * console.log(text);
 * // "BBQ Favorites
 * //  3x Grillmaster Gary
 * //  2x Backyard Barry
 * // ..."
 * ```
 */
export function exportDeckToText(deck: Deck): string {
  const lines: string[] = [];

  // Header
  lines.push(`🎴 ${deck.name}`);
  if (deck.description) {
    lines.push(`   ${deck.description}`);
  }
  lines.push('');

  // Cards sorted by rarity then name
  const sortedCards = [...deck.cards].sort((a, b) => {
    const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
    const aRarityIndex = rarityOrder.indexOf(a.card.rarity);
    const bRarityIndex = rarityOrder.indexOf(b.card.rarity);

    if (aRarityIndex !== bRarityIndex) {
      return aRarityIndex - bRarityIndex;
    }

    return a.card.name.localeCompare(b.card.name);
  });

  // Card list
  sortedCards.forEach((deckCard) => {
    const count = deckCard.count > 1 ? `${deckCard.count}x ` : '';
    lines.push(`   ${count}${deckCard.card.name} (${deckCard.card.rarity})`);
  });

  // Stats footer
  lines.push('');
  lines.push(`   Total Cards: ${deck.stats.totalCards}`);
  lines.push(`   Unique Cards: ${deck.stats.uniqueCards}`);

  return lines.join('\n');
}

// ============================================================================
// IMPORT FUNCTIONS
// ============================================================================

/**
 * Parse and validate a deck code
 *
 * @param code - Deck code to parse
 * @returns Import result with deck data or errors
 *
 * @example
 * ```ts
 * const result = importDeckFromCode('DadDeckv1|eyJuYW1lI...');
 * if (result.success) {
 *   console.log('Imported:', result.deck);
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export function importDeckFromCode(code: string): DeckImportResult {
  const result: DeckImportResult = {
    success: false,
    errors: [],
    warnings: [],
    missingCards: [],
  };

  try {
    // Validate format
    if (!code.startsWith(DECK_CODE_PREFIX)) {
      result.errors.push('Invalid deck code format. Must start with "DadDeck"');
      return result;
    }

    // Extract version and data
    const versionMatch = code.match(new RegExp(`^${DECK_CODE_PREFIX}(v\\d+)\\${DECK_CODE_SEPARATOR}(.+)$`));

    if (!versionMatch) {
      result.errors.push('Invalid deck code format. Could not parse version or data.');
      return result;
    }

    const [, version, base64] = versionMatch;

    // Validate version
    if (version !== DECK_CODE_VERSION) {
      result.errors.push(`Unsupported deck code version: ${version}. Please use the latest version of DadDeck.`);
      return result;
    }

    // Decode base64 (handle URL-safe characters)
    const normalizedBase64 = base64
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Add padding if needed
    const paddedBase64 = normalizedBase64 + '='.repeat((4 - normalizedBase64.length % 4) % 4);

    // Parse JSON
    let serializable: SerializableDeck;
    try {
      const json = atob(paddedBase64);
      serializable = JSON.parse(json);
    } catch (error) {
      result.errors.push('Failed to decode deck code. The code may be corrupted.');
      return result;
    }

    // Validate structure
    if (!serializable.name || typeof serializable.name !== 'string') {
      result.errors.push('Deck code is missing a valid name.');
      return result;
    }

    if (!Array.isArray(serializable.cards)) {
      result.errors.push('Deck code is missing a valid card list.');
      return result;
    }

    // Get all available cards for validation
    const allCards = getAllCards();
    const cardMap = new Map(allCards.map(c => [c.id, c]));

    // Validate cards and build deck
    const validatedCards: Array<{ cardId: string; card: Card; count: number }> = [];

    for (const cardEntry of serializable.cards) {
      if (!cardEntry.cardId || typeof cardEntry.cardId !== 'string') {
        result.warnings.push('Skipping invalid card entry (missing card ID)');
        continue;
      }

      if (typeof cardEntry.count !== 'number' || cardEntry.count < 1) {
        result.warnings.push(`Invalid count for card ${cardEntry.cardId}, using 1`);
        cardEntry.count = 1;
      }

      // Check if card exists in database
      const card = cardMap.get(cardEntry.cardId);

      if (!card) {
        result.missingCards.push(cardEntry.cardId);
        result.warnings.push(`Card ${cardEntry.cardId} not found in database (may be from a future set)`);
        // Still include it - user may have this card in collection
        validatedCards.push({
          cardId: cardEntry.cardId,
          card: {
            id: cardEntry.cardId,
            name: `Unknown Card (${cardEntry.cardId})`,
            subtitle: 'Card not found in database',
            type: 'BBQ_DAD',
            rarity: 'common',
            artwork: '',
            stats: {
              dadJoke: 0,
              grillSkill: 0,
              fixIt: 0,
              napPower: 0,
              remoteControl: 0,
              thermostat: 0,
              sockSandal: 0,
              beerSnob: 0,
            },
            flavorText: 'This card may be from a future set or expansion.',
            abilities: [],
            series: 1,
            cardNumber: 0,
            totalInSeries: 1,
            artist: 'Unknown',
            holoVariant: 'none',
          },
          count: cardEntry.count,
        });
      } else {
        validatedCards.push({
          cardId: cardEntry.cardId,
          card,
          count: cardEntry.count,
        });
      }
    }

    // Build result deck
    result.deck = {
      name: serializable.name,
      description: serializable.description,
      cards: validatedCards,
    };

    result.success = true;

    return result;
  } catch (error) {
    console.error('[DeckSharing] Failed to import deck:', error);
    result.errors.push('Unexpected error while importing deck. Please check the code and try again.');
    return result;
  }
}

/**
 * Validate that all cards in a deck exist in the user's collection
 *
 * @param deckCode - Deck code to validate
 * @param userCollection - User's collection card IDs
 * @returns Object with validity flag and missing card info
 *
 * @example
 * ```ts
 * const validation = validateDeckCardsInCollection(
 *   'DadDeckv1|eyJ...',
 *   ['bbq_dad_001', 'fixit_dad_002']
 * );
 *
 * if (!validation.canBuild) {
 *   console.log('Missing cards:', validation.missingCards);
 * }
 * ```
 */
export function validateDeckCardsInCollection(
  deckCode: string,
  userCollection: Set<string>
): {
  canBuild: boolean;
  missingCards: Array<{ cardId: string; cardName: string; count: number; ownedCount: number }>;
  totalCards: number;
  ownedCards: number;
} {
  // Import deck
  const importResult = importDeckFromCode(deckCode);

  if (!importResult.success || !importResult.deck?.cards) {
    return {
      canBuild: false,
      missingCards: [],
      totalCards: 0,
      ownedCards: 0,
    };
  }

  const missingCards: Array<{ cardId: string; cardName: string; count: number; ownedCount: number }> = [];
  let totalCards = 0;
  let ownedCards = 0;

  // Check each card
  for (const deckCard of importResult.deck.cards) {
    const needed = deckCard.count;
    const owned = userCollection.has(deckCard.cardId) ? needed : 0;
    totalCards += needed;
    ownedCards += owned;

    if (owned < needed) {
      missingCards.push({
        cardId: deckCard.cardId,
        cardName: deckCard.card.name,
        count: needed,
        ownedCount: owned,
      });
    }
  }

  return {
    canBuild: missingCards.length === 0,
    missingCards,
    totalCards,
    ownedCards,
  };
}

/**
 * Generate a shareable URL for a deck
 *
 * @param deck - The deck to share
 * @returns URL with deck code as hash fragment
 *
 * @example
 * ```ts
 * const url = generateDeckShareUrl(myDeck);
 * console.log(url); // "https://daddeck.com#DadDeckv1|eyJ..."
 * ```
 */
export function generateDeckShareUrl(deck: Deck, baseUrl: string = 'https://daddeck.com'): string {
  const code = exportDeckToCode(deck);
  return `${baseUrl}/#${code}`;
}

/**
 * Extract deck code from current URL hash
 *
 * @returns Deck code if present in URL hash, null otherwise
 *
 * @example
 * ```ts
 * const code = extractDeckCodeFromUrl();
 * if (code) {
 *   const result = importDeckFromCode(code);
 *   // ... handle import
 * }
 * ```
 */
export function extractDeckCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash.substring(1); // Remove #

  if (hash.startsWith(DECK_CODE_PREFIX)) {
    return hash;
  }

  return null;
}
