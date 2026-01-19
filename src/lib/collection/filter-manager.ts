/**
 * Collection Filter Manager
 * Consolidated filter state and logic for Gallery component
 * Reduces scattered state variables into single source of truth
 */

import type {
  CollectionDisplayCard,
  Rarity,
  DadType,
  HoloVariant,
  StatRanges,
  SortOption,
} from '../../types';
import {
  filterCardsByRarity,
  filterCardsByHolo,
  filterCardsByTypes,
  filterCardsBySearch,
  filterCardsByStatRanges,
  filterCardsByHoloVariants,
} from './utils';

/**
 * Complete filter state object
 */
export interface FilterState {
  // Basic filters
  searchTerm: string;
  rarity: Rarity | null;
  types: Set<DadType>;
  holoOnly: boolean;
  selectedHoloVariants: Set<HoloVariant>;

  // Advanced filters
  statRanges: StatRanges;
  abilitiesMode: 'any' | 'hasAbilities' | 'noAbilities';

  // Sort
  sort: SortOption;
}

/**
 * Default filter state
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  searchTerm: '',
  rarity: null,
  types: new Set(),
  holoOnly: false,
  selectedHoloVariants: new Set(),
  statRanges: {},
  abilitiesMode: 'any',
  sort: 'rarity_desc',
};

/**
 * Filter Manager - consolidates all filtering logic
 */
export class FilterManager {
  private state: FilterState;

  constructor(initialState: Partial<FilterState> = {}) {
    this.state = { ...DEFAULT_FILTER_STATE, ...initialState };
  }

  /**
   * Get current filter state
   */
  getState(): FilterState {
    return { ...this.state };
  }

  /**
   * Update filter state
   */
  updateState(partial: Partial<FilterState>): void {
    this.state = { ...this.state, ...partial };
  }

  /**
   * Apply all filters to cards
   * Returns filtered cards in a single pass
   */
  applyFilters(cards: CollectionDisplayCard[]): CollectionDisplayCard[] {
    let filtered = [...cards];

    // Apply rarity filter
    filtered = filterCardsByRarity(filtered, this.state.rarity);

    // Apply holo filters (prefer new variant filter over legacy)
    if (this.state.holoOnly && this.state.selectedHoloVariants.size === 0) {
      filtered = filterCardsByHolo(filtered, this.state.holoOnly);
    } else if (this.state.selectedHoloVariants.size > 0) {
      filtered = filterCardsByHoloVariants(
        filtered,
        this.state.selectedHoloVariants
      );
    }

    // Apply type filter
    filtered = filterCardsByTypes(filtered, this.state.types);

    // Apply search filter
    filtered = filterCardsBySearch(filtered, this.state.searchTerm);

    // Apply stat range filter
    filtered = filterCardsByStatRanges(filtered, this.state.statRanges);

    // Apply abilities filter
    if (this.state.abilitiesMode === 'hasAbilities') {
      filtered = filtered.filter(
        card => card.card.abilities && card.card.abilities.length > 0
      );
    } else if (this.state.abilitiesMode === 'noAbilities') {
      filtered = filtered.filter(
        card => !card.card.abilities || card.card.abilities.length === 0
      );
    }

    return filtered;
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return (
      this.state.searchTerm.trim() !== '' ||
      this.state.rarity !== null ||
      this.state.types.size > 0 ||
      this.state.holoOnly ||
      this.state.selectedHoloVariants.size > 0 ||
      Object.keys(this.state.statRanges).length > 0 ||
      this.state.abilitiesMode !== 'any'
    );
  }

  /**
   * Reset all filters to defaults
   */
  reset(): void {
    this.state = { ...DEFAULT_FILTER_STATE };
  }

  /**
   * Get filters suitable for URL params
   */
  getURLParams(): Record<string, string | null | undefined> {
    return {
      rarity: this.state.rarity,
      type:
        this.state.types.size > 0
          ? Array.from(this.state.types).join(',')
          : undefined,
      sort: this.state.sort,
    };
  }
}
