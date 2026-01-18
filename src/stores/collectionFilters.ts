import { persistentAtom } from '@nanostores/persistent';
import { RARITY_CONFIG } from '../types';
import type { Rarity } from '../types';

// ============================================================================
// COLLECTION FILTER STATE (persisted to LocalStorage)
// ============================================================================

export interface FilterState {
  selectedRarities: Rarity[];
}

/**
 * Initialize empty filter state
 */
function initializeFilterState(): FilterState {
  return {
    selectedRarities: [],
  };
}

// Custom encoder for FilterState (handles Set serialization as array)
const filterEncoder = {
  encode(state: FilterState): string {
    return JSON.stringify({
      selectedRarities: state.selectedRarities,
    });
  },
  decode(str: string): FilterState {
    try {
      const data = JSON.parse(str);
      // Validate that selectedRarities is an array
      if (!Array.isArray(data.selectedRarities)) {
        return initializeFilterState();
      }

      // Validate that each rarity is valid
      const validRarities = Object.keys(RARITY_CONFIG) as Rarity[];
      const filteredRarities = data.selectedRarities.filter((r: string) =>
        validRarities.includes(r as Rarity)
      ) as Rarity[];

      return {
        selectedRarities: filteredRarities,
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
