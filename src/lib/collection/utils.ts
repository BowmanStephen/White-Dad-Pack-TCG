import type { Pack, Rarity, CollectionDisplayCard, DadType, SortOption, StatRanges, HoloVariant, AdvancedSearchFilters } from '../../types';
import { RARITY_ORDER, DAD_TYPE_NAMES } from '../../types';

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
export function sortCardsByRarityAndName(cards: CollectionDisplayCard[], reverse = false): CollectionDisplayCard[] {
  return [...cards].sort((a, b) => {
    // First sort by rarity (mythic first, common last)
    const rarityDiff = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    if (rarityDiff !== 0) return reverse ? -rarityDiff : rarityDiff;

    // Then sort by name alphabetically
    return reverse ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
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
 * Filter cards by search term (name, flavor text, or type)
 */
export function filterCardsBySearch(cards: CollectionDisplayCard[], searchTerm: string): CollectionDisplayCard[] {
  if (!searchTerm.trim()) return cards;

  const term = searchTerm.toLowerCase();
  return cards.filter((card) => {
    return (
      card.name.toLowerCase().includes(term) ||
      card.subtitle.toLowerCase().includes(term) ||
      card.flavorText.toLowerCase().includes(term) ||
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
export function sortCardsByName(cards: CollectionDisplayCard[], reverse = false): CollectionDisplayCard[] {
  return [...cards].sort((a, b) =>
    reverse ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
  );
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
  obtainedDates: Map<string, Date>,
  reverse = false
): CollectionDisplayCard[] {
  return [...cards].sort((a, b) => {
    const dateA = obtainedDates.get(a.id);
    const dateB = obtainedDates.get(b.id);

    // Cards without dates go last
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Default: Newest first (descending), reverse: Oldest first (ascending)
    const diff = dateB.getTime() - dateA.getTime();
    return reverse ? -diff : diff;
  });
}

/**
 * Sort cards by dad type (FILTER-003)
 * Type sorting uses DAD_TYPE_NAMES for alphabetical order
 */
export function sortCardsByType(cards: CollectionDisplayCard[], reverse = false): CollectionDisplayCard[] {
  return [...cards].sort((a, b) => {
    const typeA = DAD_TYPE_NAMES[a.type] || a.type;
    const typeB = DAD_TYPE_NAMES[b.type] || b.type;

    // Sort by type name alphabetically
    const typeDiff = typeA.localeCompare(typeB);
    if (typeDiff !== 0) return reverse ? -typeDiff : typeDiff;

    // Secondary sort by name for consistency
    return reverse ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
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
    case 'rarity_asc':
      return sortCardsByRarityAndName(cards, true); // Reverse rarity sort
    case 'name_asc':
      return sortCardsByName(cards);
    case 'name_desc':
      return sortCardsByName(cards, true); // Reverse name sort
    case 'date_obtained_desc':
      if (!obtainedDates) {
        // Fallback to rarity sort if no dates provided
        return sortCardsByRarityAndName(cards);
      }
      return sortCardsByDateObtained(cards, obtainedDates);
    case 'date_obtained_asc':
      if (!obtainedDates) {
        return sortCardsByRarityAndName(cards);
      }
      return sortCardsByDateObtained(cards, obtainedDates, true); // Reverse date sort
    case 'type_asc':
      return sortCardsByType(cards);
    case 'type_desc':
      return sortCardsByType(cards, true); // Reverse type sort
    default:
      return sortCardsByRarityAndName(cards);
  }
}

// ============================================================================
// ADVANCED SEARCH FILTERS (US077 - Card Search - Advanced Filters)
// ============================================================================

/**
 * Filter cards by stat ranges (e.g., Grill Skill > 80)
 * @param cards - Cards to filter
 * @param statRanges - Stat range filters
 * @returns Filtered cards
 */
export function filterCardsByStatRanges(
  cards: CollectionDisplayCard[],
  statRanges: StatRanges
): CollectionDisplayCard[] {
  // If no stat ranges specified, return all cards
  if (Object.keys(statRanges).length === 0) {
    return cards;
  }

  return cards.filter((card) => {
    // Check each stat range - ALL must match (AND logic)
    for (const [stat, range] of Object.entries(statRanges)) {
      if (!range) continue; // Skip undefined ranges

      const cardStatValue = card.stats[stat as keyof typeof card.stats];

      // Check if card stat is within range (inclusive)
      if (cardStatValue < range.min || cardStatValue > range.max) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Filter cards by holo variant(s)
 * @param cards - Cards to filter
 * @param holoVariants - Set of holo variants to include
 * @returns Filtered cards
 */
export function filterCardsByHoloVariants(
  cards: CollectionDisplayCard[],
  holoVariants: Set<HoloVariant>
): CollectionDisplayCard[] {
  if (holoVariants.size === 0) return cards;

  return cards.filter((card) => {
    // Check if card's holoType matches any of the selected variants
    return holoVariants.has(card.holoType);
  });
}

/**
 * Apply advanced search filters with AND logic
 * All filters must match for a card to be included
 * @param cards - Cards to filter
 * @param filters - Advanced search filters
 * @returns Filtered cards
 */
export function filterCardsByAdvancedSearch(
  cards: CollectionDisplayCard[],
  filters: AdvancedSearchFilters
): CollectionDisplayCard[] {
  let filtered = [...cards];

  // Apply search term filter
  filtered = filterCardsBySearch(filtered, filters.searchTerm);

  // Apply rarity filter
  filtered = filterCardsByRarity(filtered, filters.rarity);

  // Apply holo variant filter
  filtered = filterCardsByHoloVariants(filtered, filters.holoVariants);

  // Apply dad type filter
  filtered = filterCardsByTypes(filtered, filters.selectedTypes);

  // Apply stat range filter
  filtered = filterCardsByStatRanges(filtered, filters.statRanges);

  return filtered;
}

/**
 * Get default stat ranges (0-100 for all stats)
 * @returns Default stat ranges
 */
export function getDefaultStatRanges(): StatRanges {
  return {
    dadJoke: { min: 0, max: 100 },
    grillSkill: { min: 0, max: 100 },
    fixIt: { min: 0, max: 100 },
    napPower: { min: 0, max: 100 },
    remoteControl: { min: 0, max: 100 },
    thermostat: { min: 0, max: 100 },
    sockSandal: { min: 0, max: 100 },
    beerSnob: { min: 0, max: 100 },
  };
}

/**
 * Check if stat ranges are at default values (no filtering)
 * @param statRanges - Stat ranges to check
 * @returns True if all ranges are at default (0-100)
 */
export function areStatRangesDefault(statRanges: StatRanges): boolean {
  const defaults = getDefaultStatRanges();

  for (const [stat, range] of Object.entries(statRanges)) {
    if (!range) return false; // If range is undefined, it's not default
    const defaultRange = defaults[stat as keyof typeof defaults];
    if (!defaultRange) return false;

    if (range.min !== defaultRange.min || range.max !== defaultRange.max) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// WISHLIST UTILITIES (PACK-020 - Collection Wishlist)
// ============================================================================

/**
 * Check if pulled cards contain any wishlisted cards
 * @param pulledCards - Cards from an opened pack
 * @param wishlistEntries - Wishlist entries to check against
 * @returns Array of wishlisted cards that were pulled
 */
export function findPulledWishlistedCards(
  pulledCards: string[],
  wishlistEntries: any[]
): string[] {
  const wishlistCardIds = new Set(wishlistEntries.map((entry) => entry.cardId));
  return pulledCards.filter((cardId) => wishlistCardIds.has(cardId));
}

/**
 * Format priority for display
 * @param priority - Wishlist priority level
 * @returns Formatted priority label with emoji
 */
export function formatWishlistPriority(priority: string): string {
  const priorityLabels: Record<string, string> = {
    urgent: '🔥 Urgent',
    high: '⭐ High',
    medium: '📍 Medium',
    low: '💤 Low',
  };

  return priorityLabels[priority] || priority;
}

/**
 * Get priority color for styling
 * @param priority - Wishlist priority level
 * @returns CSS color class or hex color
 */
export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    urgent: '#ef4444', // Red
    high: '#f59e0b',   // Orange
    medium: '#3b82f6', // Blue
    low: '#9ca3af',    // Gray
  };

  return priorityColors[priority] || '#9ca3af';
}

// ============================================================================
// COLLECTION VALUE CALCULATOR (PACK-023 - Collection Value)
// ============================================================================

/**
 * Base point values for each rarity tier
 */
const RARITY_POINT_VALUES: Record<Rarity, number> = {
  common: 1,
  uncommon: 5,
  rare: 25,
  epic: 100,
  legendary: 500,
  mythic: 5000,
};

/**
 * Holographic bonus multiplier (50% increase)
 */
const HOLO_BONUS_MULTIPLIER = 1.5;

/**
 * Upgrade bonus per level (10% increase per level)
 * Note: Currently upgrade levels are not tracked in PackCard,
 * so this will be 0 for all cards until upgrade system is integrated.
 */
const UPGRADE_BONUS_PER_LEVEL = 0.1;

/**
 * Calculate the value of a single card based on rarity, holo status, and upgrade level
 * @param card - Card to calculate value for
 * @param upgradeLevel - Current upgrade level (default: 0)
 * @returns Card value in points
 */
export function calculateCardValue(
  card: CollectionDisplayCard,
  upgradeLevel: number = 0
): number {
  // Start with base rarity value
  let value = RARITY_POINT_VALUES[card.rarity];

  // Apply holographic bonus (+50%)
  if (card.isHolo) {
    value = value * HOLO_BONUS_MULTIPLIER;
  }

  // Apply upgrade bonus (+10% per level)
  if (upgradeLevel > 0) {
    const upgradeBonus = 1 + (upgradeLevel * UPGRADE_BONUS_PER_LEVEL);
    value = value * upgradeBonus;
  }

  return Math.round(value);
}

/**
 * Calculate total collection value from all cards
 * @param cards - All cards in collection (with duplicate counts)
 * @param cardUpgrades - Optional map of card IDs to upgrade levels
 * @returns Total collection value in points
 */
export function calculateCollectionValue(
  cards: CollectionDisplayCard[],
  cardUpgrades?: Map<string, number>
): number {
  let totalValue = 0;

  for (const card of cards) {
    const upgradeLevel = cardUpgrades?.get(card.id) || 0;
    const cardValue = calculateCardValue(card, upgradeLevel);

    // Multiply by duplicate count (e.g., 3 copies = 3x value)
    totalValue += cardValue * card.duplicateCount;
  }

  return totalValue;
}

/**
 * Format collection value for display with thousands separators
 * @param value - Collection value in points
 * @returns Formatted string (e.g., "12,450 points")
 */
export function formatCollectionValue(value: number): string {
  return `${value.toLocaleString('en-US')} points`;
}

/**
 * Get rarity breakdown of collection value
 * @param cards - All cards in collection
 * @param cardUpgrades - Optional map of card IDs to upgrade levels
 * @returns Object with value breakdown by rarity
 */
export function getValueBreakdownByRarity(
  cards: CollectionDisplayCard[],
  cardUpgrades?: Map<string, number>
): Record<Rarity, number> {
  const breakdown: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (const card of cards) {
    const upgradeLevel = cardUpgrades?.get(card.id) || 0;
    const cardValue = calculateCardValue(card, upgradeLevel);
    breakdown[card.rarity] += cardValue * card.duplicateCount;
  }

  return breakdown;
}
