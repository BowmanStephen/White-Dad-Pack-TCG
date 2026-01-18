import type { Card, CardStats, Deck, DeckCard, DeckStats, Rarity, DadType } from '@/types';

/**
 * Calculate deck statistics from deck cards
 */
export function calculateDeckStats(cards: DeckCard[]): DeckStats {
  // Initialize counters
  const totalCards = cards.reduce((sum, dc) => sum + dc.count, 0);
  const uniqueCards = cards.length;

  // Initialize rarity breakdown
  const rarityBreakdown: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  // Initialize type breakdown with all DadType values
  const typeBreakdown: Record<DadType, number> = {
    // Clean names (Season 1)
    BBQ_DAD: 0,
    FIX_IT_DAD: 0,
    GOLF_DAD: 0,
    COUCH_DAD: 0,
    LAWN_DAD: 0,
    CAR_DAD: 0,
    OFFICE_DAD: 0,
    COOL_DAD: 0,
    COACH_DAD: 0,
    CHEF_DAD: 0,
    HOLIDAY_DAD: 0,
    WAREHOUSE_DAD: 0,
    VINTAGE_DAD: 0,
    FASHION_DAD: 0,
    TECH_DAD: 0,
    // Unhinged names (Season 2+)
    BBQ_DAD: 0,
    FIX_IT_DAD: 0,
    GOLF_DAD: 0,
    COUCH_DAD: 0,
    LAWN_DAD: 0,
    CAR_DAD: 0,
    OFFICE_DAD: 0,
    COOL_DAD: 0,
    COACH_DAD: 0,
    CHEF_DAD: 0,
    HOLIDAY_DAD: 0,
    WAREHOUSE_DAD: 0,
    VINTAGE_DAD: 0,
    FASHION_DAD: 0,
    TECH_DAD: 0,
    // Extended Archetypes
    BBQ_DAD: 0,
    BBQ_DAD: 0,
    PREPPER_PENIS: 0,
    BBQ_BRAWLER: 0,
    SUBURBAN_SOCIALITE: 0,
    NEIGHBORHOOD_NOSY: 0,
    // Crossover Events
    DUNE_DESERT: 0,
    MARVEL_MASH: 0,
    STAR_WARS_SWINGER: 0,
    MCDONALDS_MEAT: 0,
    POTTER_PERVERT: 0,
    FORTNITE_FUCKER: 0,
    // Family Variants
    SON_SPAWNS: 0,
    DAUGHTER_DINGBATS: 0,
    UNCLE_UPROARS: 0,
    SUBURBAN_SIDEKICKS: 0,
    // Special Card Types
    ITEM: 0,
    EVENT: 0,
    TERRAIN: 0,
    EVOLUTION: 0,
    CURSE: 0,
    TRAP: 0,
  };

  // Initialize stat totals
  const statTotal: CardStats = {
    dadJoke: 0,
    grillSkill: 0,
    fixIt: 0,
    napPower: 0,
    remoteControl: 0,
    thermostat: 0,
    sockSandal: 0,
    beerSnob: 0,
  };

  // Calculate totals (weighted by count)
  for (const deckCard of cards) {
    const { card, count } = deckCard;

    // Rarity breakdown
    rarityBreakdown[card.rarity] += count;

    // Type breakdown
    typeBreakdown[card.type] += count;

    // Stat totals (multiplied by count)
    statTotal.dadJoke += card.stats.dadJoke * count;
    statTotal.grillSkill += card.stats.grillSkill * count;
    statTotal.fixIt += card.stats.fixIt * count;
    statTotal.napPower += card.stats.napPower * count;
    statTotal.remoteControl += card.stats.remoteControl * count;
    statTotal.thermostat += card.stats.thermostat * count;
    statTotal.sockSandal += card.stats.sockSandal * count;
    statTotal.beerSnob += card.stats.beerSnob * count;
  }

  // Calculate average stats
  const averageStats: CardStats = {
    dadJoke: totalCards > 0 ? Math.round(statTotal.dadJoke / totalCards) : 0,
    grillSkill: totalCards > 0 ? Math.round(statTotal.grillSkill / totalCards) : 0,
    fixIt: totalCards > 0 ? Math.round(statTotal.fixIt / totalCards) : 0,
    napPower: totalCards > 0 ? Math.round(statTotal.napPower / totalCards) : 0,
    remoteControl: totalCards > 0 ? Math.round(statTotal.remoteControl / totalCards) : 0,
    thermostat: totalCards > 0 ? Math.round(statTotal.thermostat / totalCards) : 0,
    sockSandal: totalCards > 0 ? Math.round(statTotal.sockSandal / totalCards) : 0,
    beerSnob: totalCards > 0 ? Math.round(statTotal.beerSnob / totalCards) : 0,
  };

  return {
    totalCards,
    uniqueCards,
    rarityBreakdown,
    statTotal,
    typeBreakdown,
    averageStats,
  };
}

/**
 * Creates a new deck object with metadata, cards, and calculated statistics.
 *
 * Generates a unique deck ID, calculates deck statistics (rarity breakdown,
 * type distribution, average stats), and sets creation/update timestamps.
 *
 * @example
 * ```ts
 * const deck = createDeck(
 *   "My BBQ Deck",
 *   "A deck focused on BBQ_DAD type cards",
 *   [
 *     { cardId: "bbq_001", card: bbqCard, count: 3 },
 *     { cardId: "fix_001", card: fixItCard, count: 2 }
 *   ]
 * );
 * ```
 *
 * @param name - The deck name (will be trimmed)
 * @param description - Optional deck description (will be trimmed if provided)
 * @param cards - Array of deck cards to include in the deck
 * @returns A new deck object with generated ID and calculated stats
 *
 * @see {@link calculateDeckStats} for stat calculation logic
 * @see {@link generateDeckId} for ID generation
 */
export function createDeck(
  name: string,
  description: string | undefined,
  cards: DeckCard[]
): Deck {
  const now = new Date();
  const stats = calculateDeckStats(cards);

  return {
    id: generateDeckId(),
    name: name.trim(),
    description: description?.trim() || undefined,
    cards,
    createdAt: now,
    updatedAt: now,
    stats,
  };
}

/**
 * Update a deck with new cards
 */
export function updateDeckCards(deck: Deck, cards: DeckCard[]): Deck {
  const stats = calculateDeckStats(cards);

  return {
    ...deck,
    cards,
    stats,
    updatedAt: new Date(),
  };
}

/**
 * Update deck metadata
 */
export function updateDeckMetadata(
  deck: Deck,
  name: string,
  description?: string
): Deck {
  return {
    ...deck,
    name: name.trim(),
    description: description?.trim() || undefined,
    updatedAt: new Date(),
  };
}

/**
 * Add a card to a deck
 */
export function addCardToDeck(deck: Deck, card: Card, count: number = 1): Deck {
  // Check if card already exists in deck
  const existingCardIndex = deck.cards.findIndex(dc => dc.cardId === card.id);

  let newCards: DeckCard[];
  if (existingCardIndex >= 0) {
    // Update existing card count
    newCards = [...deck.cards];
    newCards[existingCardIndex] = {
      ...newCards[existingCardIndex],
      count: Math.min(newCards[existingCardIndex].count + count, 4), // Max 4 copies
    };
  } else {
    // Add new card
    newCards = [
      ...deck.cards,
      {
        cardId: card.id,
        card,
        count: Math.min(count, 4), // Max 4 copies
      },
    ];
  }

  return updateDeckCards(deck, newCards);
}

/**
 * Remove a card from a deck (by card ID)
 */
export function removeCardFromDeck(deck: Deck, cardId: string): Deck {
  const newCards = deck.cards.filter(dc => dc.cardId !== cardId);
  return updateDeckCards(deck, newCards);
}

/**
 * Update card count in deck
 */
export function updateCardCount(deck: Deck, cardId: string, count: number): Deck {
  if (count <= 0) {
    return removeCardFromDeck(deck, cardId);
  }

  const newCards = deck.cards.map(dc => {
    if (dc.cardId === cardId) {
      return {
        ...dc,
        count: Math.min(count, 4), // Max 4 copies
      };
    }
    return dc;
  });

  return updateDeckCards(deck, newCards);
}

/**
 * Exports a deck to a formatted text representation for sharing.
 *
 * The output includes deck metadata, statistics, and a card list grouped
 * by rarity (rarest first). Cards are sorted by rarity, then alphabetically
 * by name within each rarity tier.
 *
 * @example
 * ```ts
 * const deck = createDeck("Fire Deck", "Burn them all", cards);
 * const text = exportDeckToText(deck);
 * console.log(text);
 * // Output:
 * // === Fire Deck ===
 * // A deck focused on burning
 * //
 * // Total Cards: 20
 * // Unique Cards: 8
 * //
 * // [LEGENDARY]
 * //   2x Grillmaster Gary
 * //
 * // [RARE]
 * //   3x Flame Broiled Frank
 * // ```
 *
 * @param deck - The deck to export
 * @returns Formatted text representation of the deck
 *
 * @see {@link importDeckFromText} for the complementary import function
 */
export function exportDeckToText(deck: Deck): string {
  const lines: string[] = [];

  lines.push(`=== ${deck.name} ===`);
  if (deck.description) {
    lines.push(deck.description);
  }
  lines.push('');
  lines.push(`Total Cards: ${deck.stats.totalCards}`);
  lines.push(`Unique Cards: ${deck.stats.uniqueCards}`);
  lines.push('');

  // Sort cards by rarity (rarest first), then by name
  const sortedCards = [...deck.cards].sort((a, b) => {
    const rarityOrder: Record<Rarity, number> = {
      mythic: 5,
      legendary: 4,
      epic: 3,
      rare: 2,
      uncommon: 1,
      common: 0,
    };
    const rarityDiff = rarityOrder[b.card.rarity] - rarityOrder[a.card.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return a.card.name.localeCompare(b.card.name);
  });

  // Group by rarity
  const byRarity: Record<Rarity, DeckCard[]> = {
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
    legendary: [],
    mythic: [],
  };

  for (const card of sortedCards) {
    byRarity[card.card.rarity].push(card);
  }

  // Output cards by rarity
  for (const [rarity, cards] of Object.entries(byRarity)) {
    if (cards.length > 0) {
      lines.push(`[${rarity.toUpperCase()}]`);
      for (const card of cards) {
        lines.push(`  ${card.count}x ${card.card.name}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Imports a deck from text format (the format produced by {@link exportDeckToText}).
 *
 * Parses a deck text representation and validates card names against the
 * provided card database. Cards are matched by name (case-insensitive).
 *
 * @example
 * ```ts
 * const deckText = `
 * === Fire Deck ===
 *   2x Grillmaster Gary
 *   3x Flame Broiled Frank
 * `;
 *
 * const result = importDeckFromText(deckText, allCards);
 * if (result.success) {
 *   console.log("Imported deck:", result.deck);
 * } else {
 *   console.error("Import failed:", result.error);
 * }
 * ```
 *
 * @param text - The deck text to import (format produced by exportDeckToText)
 * @param allCards - Array of all available cards to match against
 * @returns Result object with success flag, deck (if successful), or error message
 *
 * @see {@link exportDeckToText} for the text format specification
 */
export function importDeckFromText(text: string, allCards: Card[]): { success: boolean; deck?: Deck; error?: string } {
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Parse name
    const nameLine = lines.find(l => l.startsWith('==='));
    if (!nameLine) {
      return { success: false, error: 'Deck name not found' };
    }

    const name = nameLine.replace(/===/g, '').trim();

    // Parse card lines (format: "Nx CardName")
    const cardLines = lines.filter(l => /^\d+x\s+.+/i.test(l));

    const cards: DeckCard[] = [];
    for (const line of cardLines) {
      const match = line.match(/^(\d+)x\s+(.+)$/i);
      if (match) {
        const count = parseInt(match[1], 10);
        const cardName = match[2].trim();

        // Find card by name
        const card = allCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
        if (card) {
          cards.push({
            cardId: card.id,
            card,
            count: Math.min(count, 4),
          });
        }
      }
    }

    if (cards.length === 0) {
      return { success: false, error: 'No valid cards found in deck list' };
    }

    const deck = createDeck(name, undefined, cards);
    return { success: true, deck };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import deck',
    };
  }
}

/**
 * Generate a unique deck ID
 */
export function generateDeckId(): string {
  return `deck_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a DeckCard from a Card
 */
export function createDeckCard(card: Card, count: number = 1): DeckCard {
  return {
    cardId: card.id,
    card,
    count: Math.min(Math.max(count, 1), 4), // Clamp between 1 and 4
  };
}

/**
 * Clone a deck (for duplication)
 */
export function cloneDeck(deck: Deck, newName?: string): Deck {
  return createDeck(
    newName || `${deck.name} (Copy)`,
    deck.description,
    [...deck.cards] // Shallow copy of cards array
  );
}
