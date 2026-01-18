import { persistentAtom } from '@nanostores/persistent';
import { RARITY_CONFIG, DAD_TYPE_NAMES } from '../types';
import type { Rarity, DadType } from '../types';
import { recordFeatureUsage } from '../lib/analytics/engagement';

// ============================================================================
// COLLECTION FILTER STATE (persisted to LocalStorage)
// ============================================================================

export interface FilterState {
  selectedRarities: Rarity[];
  selectedTypes: DadType[];
}

/**
 * Initialize empty filter state
 */
function initializeFilterState(): FilterState {
  return {
    selectedRarities: [],
    selectedTypes: [],
  };
}

// Custom encoder for FilterState (handles Set serialization as array)
const filterEncoder = {
  encode(state: FilterState): string {
    return JSON.stringify({
      selectedRarities: state.selectedRarities,
      selectedTypes: state.selectedTypes,
    });
  },
  decode(str: string): FilterState {
    try {
      const data = JSON.parse(str);
      // Validate that selectedRarities is an array
      if (!Array.isArray(data.selectedRarities) || !Array.isArray(data.selectedTypes)) {
        return initializeFilterState();
      }

      // Validate that each rarity is valid
      const validRarities = Object.keys(RARITY_CONFIG) as Rarity[];
      const filteredRarities = data.selectedRarities.filter((r: string) =>
        validRarities.includes(r as Rarity)
      ) as Rarity[];

      // Validate that each dad type is valid
      const validTypes = Object.keys(DAD_TYPE_NAMES) as DadType[];
      const filteredTypes = data.selectedTypes.filter((t: string) =>
        validTypes.includes(t as DadType)
      ) as DadType[];

      return {
        selectedRarities: filteredRarities,
        selectedTypes: filteredTypes,
      };
    } catch {
      return initializeFilterState();
    }
  },
};

// Collection filter store with LocalStorage persistence
export const collectionFilters = persistentAtom<FilterState>(
  'daddeck-collection-filters',
  initializeFilterState(),
  filterEncoder
);

// ============================================================================
// FILTER ACTIONS
// ============================================================================

/**
 * Get current filter state
 */
export function getFilterState(): FilterState {
  return collectionFilters.get();
}

/**
 * Set filter state
 */
export function setFilterState(state: FilterState): void {
  collectionFilters.set(state);
}

/**
 * Toggle a rarity in the filter (multi-select)
 * @param rarity - The rarity to toggle
 */
export function toggleRarity(rarity: Rarity): void {
  const state = collectionFilters.get();
  const isSelected = state.selectedRarities.includes(rarity);

  if (isSelected) {
    // Remove rarity if already selected
    collectionFilters.set({
      selectedRarities: state.selectedRarities.filter((r) => r !== rarity),
    });
  } else {
    // Add rarity if not selected
    collectionFilters.set({
      selectedRarities: [...state.selectedRarities, rarity],
    });
  }

  // Engagement: Track filter usage (ANALYTICS-002)
  recordFeatureUsage('collection_filter', { rarity, action: isSelected ? 'remove' : 'add' });
}

/**
 * Add a rarity to the filter (without toggle)
 * @param rarity - The rarity to add
 */
export function addRarity(rarity: Rarity): void {
  const state = collectionFilters.get();

  if (!state.selectedRarities.includes(rarity)) {
    collectionFilters.set({
      selectedRarities: [...state.selectedRarities, rarity],
    });
  }
}

/**
 * Remove a rarity from the filter
 * @param rarity - The rarity to remove
 */
export function removeRarity(rarity: Rarity): void {
  const state = collectionFilters.get();

  collectionFilters.set({
    selectedRarities: state.selectedRarities.filter((r) => r !== rarity),
  });
}

/**
 * Clear all rarity filters
 */
export function clearRarities(): void {
  collectionFilters.set({
    selectedRarities: [],
  });
}

/**
 * Select all rarities
 */
export function selectAllRarities(): void {
  const allRarities: Rarity[] = Object.keys(RARITY_CONFIG) as Rarity[];
  collectionFilters.set({
    selectedRarities: allRarities,
  });
}

/**
 * Check if a specific rarity is selected
 * @param rarity - The rarity to check
 */
export function isRaritySelected(rarity: Rarity): boolean {
  const state = collectionFilters.get();
  return state.selectedRarities.includes(rarity);
}

/**
 * Get the count of selected rarities
 */
export function getSelectedCount(): number {
  const state = collectionFilters.get();
  return state.selectedRarities.length;
}

/**
 * Check if any rarities are selected
 */
export function hasActiveFilters(): boolean {
  const state = collectionFilters.get();
  return state.selectedRarities.length > 0;
}

/**
 * Check if cards match the selected rarity filters
 * @param cardRarities - Array of rarities to check (e.g., from multiple cards)
 */
export function matchesSelectedRarities(cardRarities: Rarity[]): boolean {
  const state = collectionFilters.get();

  // If no filters active, match all cards
  if (state.selectedRarities.length === 0) {
    return true;
  }

  // Check if any card rarity matches the selected filters
  return cardRarities.some((rarity) => state.selectedRarities.includes(rarity));
}

/**
 * Filter an array of cards by selected rarities
 * @param cards - Array of cards with rarity property
 * @returns Filtered array of cards
 */
export function filterCardsBySelectedRarities<T extends { rarity: Rarity }>(
  cards: T[]
): T[] {
  const state = collectionFilters.get();

  // If no filters active, return all cards
  if (state.selectedRarities.length === 0) {
    return cards;
  }

  // Filter cards by selected rarities
  return cards.filter((card) => state.selectedRarities.includes(card.rarity));
}

// ============================================================================
// DAD TYPE FILTER ACTIONS
// ============================================================================

/**
 * Toggle a dad type in the filter (multi-select)
 * @param type - The dad type to toggle
 */
export function toggleType(type: DadType): void {
  const state = collectionFilters.get();
  const isSelected = state.selectedTypes.includes(type);

  if (isSelected) {
    // Remove type if already selected
    collectionFilters.set({
      ...state,
      selectedTypes: state.selectedTypes.filter((t) => t !== type),
    });
  } else {
    // Add type if not selected
    collectionFilters.set({
      ...state,
      selectedTypes: [...state.selectedTypes, type],
    });
  }
}

/**
 * Add a dad type to the filter (without toggle)
 * @param type - The dad type to add
 */
export function addType(type: DadType): void {
  const state = collectionFilters.get();

  if (!state.selectedTypes.includes(type)) {
    collectionFilters.set({
      ...state,
      selectedTypes: [...state.selectedTypes, type],
    });
  }
}

/**
 * Remove a dad type from the filter
 * @param type - The dad type to remove
 */
export function removeType(type: DadType): void {
  const state = collectionFilters.get();

  collectionFilters.set({
    ...state,
    selectedTypes: state.selectedTypes.filter((t) => t !== type),
  });
}

/**
 * Clear all dad type filters
 */
export function clearTypes(): void {
  const state = collectionFilters.get();
  collectionFilters.set({
    ...state,
    selectedTypes: [],
  });
}

/**
 * Select all dad types
 */
export function selectAllTypes(): void {
  const allTypes: DadType[] = Object.keys(DAD_TYPE_NAMES) as DadType[];
  const state = collectionFilters.get();
  collectionFilters.set({
    ...state,
    selectedTypes: allTypes,
  });
}

/**
 * Check if a specific dad type is selected
 * @param type - The dad type to check
 */
export function isTypeSelected(type: DadType): boolean {
  const state = collectionFilters.get();
  return state.selectedTypes.includes(type);
}

/**
 * Get the count of selected dad types
 */
export function getSelectedTypeCount(): number {
  const state = collectionFilters.get();
  return state.selectedTypes.length;
}

/**
 * Check if any dad types are selected
 */
export function hasActiveTypeFilters(): boolean {
  const state = collectionFilters.get();
  return state.selectedTypes.length > 0;
}

/**
 * Check if cards match the selected dad type filters
 * @param cardTypes - Array of dad types to check (e.g., from multiple cards)
 */
export function matchesSelectedTypes(cardTypes: DadType[]): boolean {
  const state = collectionFilters.get();

  // If no filters active, match all cards
  if (state.selectedTypes.length === 0) {
    return true;
  }

  // Check if any card type matches the selected filters
  return cardTypes.some((type) => state.selectedTypes.includes(type));
}

/**
 * Filter an array of cards by selected dad types
 * @param cards - Array of cards with type property
 * @returns Filtered array of cards
 */
export function filterCardsBySelectedTypes<T extends { type: DadType }>(
  cards: T[]
): T[] {
  const state = collectionFilters.get();

  // If no filters active, return all cards
  if (state.selectedTypes.length === 0) {
    return cards;
  }

  // Filter cards by selected dad types
  return cards.filter((card) => state.selectedTypes.includes(card.type));
}

/**
 * Filter cards by both selected rarities and dad types
 * @param cards - Array of cards with rarity and type properties
 * @returns Filtered array of cards
 */
export function filterCardsBySelected<T extends { rarity: Rarity; type: DadType }>(
  cards: T[]
): T[] {
  let filtered = cards;

  // Apply rarity filter
  filtered = filterCardsBySelectedRarities(filtered);

  // Apply dad type filter
  filtered = filterCardsBySelectedTypes(filtered);

  return filtered;
}
