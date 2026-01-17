import type { Pack, Rarity, CollectionDisplayCard, DadType, SortOption } from '../../types';
import { RARITY_ORDER } from '../../types';

/**
 * Count duplicate cards across all packs
 * Returns a Map of card ID to count
 */
export function countCardDuplicates(packs: Pack[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const pack of packs) {
    for (const card of pack.cards) {
      const current = counts.get(card.id) || 0;
      counts.set(card.id, current + 1);
    }
  }

  return counts;
}

/**
 * Get all unique cards from the collection with duplicate info
 * Returns an array of cards with their count
 */
export function getUniqueCardsWithCounts(packs: Pack[]): CollectionDisplayCard[] {
  const duplicateMap = countCardDuplicates(packs);
  const seenCards = new Set<string>();
  const result: CollectionDisplayCard[] = [];

  for (const pack of packs) {
    for (const card of pack.cards) {
      if (!seenCards.has(card.id)) {
        seenCards.add(card.id);
        result.push({
          ...card,
          duplicateCount: duplicateMap.get(card.id) || 1,
        });
      }
    }
  }

  return result;
}

/**
 * Sort cards by rarity (descending) then by name (ascending)
 */
export function sortCardsByRarityAndName(cards: CollectionDisplayCard[]): CollectionDisplayCard[] {
  return [...cards].sort((a, b) => {
    // First sort by rarity (mythic first, common last)
    const rarityDiff = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    if (rarityDiff !== 0) return rarityDiff;

    // Then sort by name alphabetically
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filter cards by rarity
 */
export function filterCardsByRarity(cards: CollectionDisplayCard[], rarity: Rarity | null): CollectionDisplayCard[] {
  if (!rarity) return cards;
  return cards.filter((card) => card.rarity === rarity);
}

/**
 * Filter cards by search term (name or type)
 */
export function filterCardsBySearch(cards: CollectionDisplayCard[], searchTerm: string): CollectionDisplayCard[] {
  if (!searchTerm.trim()) return cards;

  const term = searchTerm.toLowerCase();
  return cards.filter((card) => {
    return (
      card.name.toLowerCase().includes(term) ||
      card.subtitle.toLowerCase().includes(term) ||
      card.type.toLowerCase().includes(term)
    );
  });
}

/**
 * Filter holographic cards
 */
export function filterCardsByHolo(cards: CollectionDisplayCard[], holoOnly: boolean): CollectionDisplayCard[] {
  if (!holoOnly) return cards;
  return cards.filter((card) => card.isHolo);
}

/**
 * Filter cards by dad types (multi-select)
 */
export function filterCardsByTypes(cards: CollectionDisplayCard[], selectedTypes: Set<DadType>): CollectionDisplayCard[] {
  if (selectedTypes.size === 0) return cards;
  return cards.filter((card) => selectedTypes.has(card.type));
}

/**
 * Get pagination slice for infinite loading
 */
export function getPaginatedCards(cards: CollectionDisplayCard[], page: number, pageSize: number): {
  cards: CollectionDisplayCard[];
  hasMore: boolean;
  nextPage: number | null;
} {
  const startIndex = 0;
  const endIndex = (page + 1) * pageSize;
  const paginatedCards = cards.slice(startIndex, endIndex);
  const hasMore = endIndex < cards.length;
  const nextPage = hasMore ? page + 1 : null;

  return {
    cards: paginatedCards,
    hasMore,
    nextPage,
  };
}

/**
 * Calculate collection completion percentage
 * Returns percentage of unique cards owned out of total cards in database
 */
export function calculateCollectionProgress(uniqueCardCount: number, totalDatabaseCards: number): number {
  if (totalDatabaseCards === 0) return 0;
  return Math.round((uniqueCardCount / totalDatabaseCards) * 100);
}

/**
 * Format card count for display
 */
export function formatCardCount(count: number): string {
  if (count === 1) return '';
  return `x${count}`;
}

/**
 * Get total cards by rarity
 */
export function getCardsByRarity(cards: CollectionDisplayCard[]): Record<Rarity, number> {
  const counts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (const card of cards) {
    counts[card.rarity]++;
  }

  return counts;
}

/**
 * Sort cards by name (ascending A-Z)
 */
export function sortCardsByName(cards: CollectionDisplayCard[]): CollectionDisplayCard[] {
  return [...cards].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get the date a card was first obtained from packs
 * Returns a Map of card ID to first obtained date
 */
export function getCardObtainedDates(packs: Pack[]): Map<string, Date> {
  const obtainedDates = new Map<string, Date>();

  // Sort packs by openedAt date (oldest first) to find first occurrence
  const sortedPacks = [...packs].sort((a, b) =>
    a.openedAt.getTime() - b.openedAt.getTime()
  );

  for (const pack of sortedPacks) {
    for (const card of pack.cards) {
      if (!obtainedDates.has(card.id)) {
        obtainedDates.set(card.id, pack.openedAt);
      }
    }
  }

  return obtainedDates;
}

/**
 * Sort cards by date obtained (descending - newest first)
 * Cards obtained more recently appear first
 */
export function sortCardsByDateObtained(
  cards: CollectionDisplayCard[],
  obtainedDates: Map<string, Date>
): CollectionDisplayCard[] {
  return [...cards].sort((a, b) => {
    const dateA = obtainedDates.get(a.id);
    const dateB = obtainedDates.get(b.id);

    // Cards without dates go last
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Newest first (descending)
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Sort cards by the specified option
 * - rarity_desc: Rarity descending (mythic first), then name ascending
 * - name_asc: Name ascending (A-Z)
 * - date_obtained_desc: Date obtained descending (newest first)
 */
export function sortCardsByOption(
  cards: CollectionDisplayCard[],
  option: SortOption,
  obtainedDates?: Map<string, Date>
): CollectionDisplayCard[] {
  switch (option) {
    case 'rarity_desc':
      return sortCardsByRarityAndName(cards);
    case 'name_asc':
      return sortCardsByName(cards);
    case 'date_obtained_desc':
      if (!obtainedDates) {
        // Fallback to rarity sort if no dates provided
        return sortCardsByRarityAndName(cards);
      }
      return sortCardsByDateObtained(cards, obtainedDates);
    default:
      return sortCardsByRarityAndName(cards);
  }
}
