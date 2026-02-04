import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  CardInCollection,
  AdvancedCollectionFilters,
  SearchPreset,
  StatRangeFilter,
  AbilitiesFilterMode,
  HoloFilterMode
} from '@/types/collection';
import { collectionStore } from './collection';

// ============================================================================
// ADVANCED FILTERS STORE
// ============================================================================

// Default advanced filters state
export const DEFAULT_ADVANCED_FILTERS: AdvancedCollectionFilters = {
  statRanges: [],
  abilitiesMode: 'any',
  holoMode: 'all'
};

// Advanced filters atom (in-memory, not persisted)
export const advancedFilters = atom<AdvancedCollectionFilters>(DEFAULT_ADVANCED_FILTERS);

// Search presets (persisted to LocalStorage)
export const searchPresets = persistentAtom<SearchPreset[]>('daddeck-search-presets', [], {
  encode: (value) => {
    return JSON.stringify(value.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString()
    })));
  },
  decode: (value) => {
    try {
      const parsed = JSON.parse(value);
      return parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
    } catch {
      return [];
    }
  }
});

// ============================================================================
// FILTER ACTIONS
// ============================================================================

/**
 * Set stat range filters
 */
export function setStatRangeFilters(filters: StatRangeFilter[]) {
  advancedFilters.set({
    ...advancedFilters.get(),
    statRanges: filters
  });
}

/**
 * Add a stat range filter
 */
export function addStatRangeFilter(filter: StatRangeFilter) {
  const current = advancedFilters.get();
  advancedFilters.set({
    ...current,
    statRanges: [...current.statRanges, filter]
  });
}

/**
 * Remove a stat range filter by index
 */
export function removeStatRangeFilter(index: number) {
  const current = advancedFilters.get();
  advancedFilters.set({
    ...current,
    statRanges: current.statRanges.filter((_, i) => i !== index)
  });
}

/**
 * Update a stat range filter
 */
export function updateStatRangeFilter(index: number, filter: StatRangeFilter) {
  const current = advancedFilters.get();
  const updated = [...current.statRanges];
  updated[index] = filter;
  advancedFilters.set({
    ...current,
    statRanges: updated
  });
}

/**
 * Set abilities filter mode
 */
export function setAbilitiesFilterMode(mode: AbilitiesFilterMode) {
  advancedFilters.set({
    ...advancedFilters.get(),
    abilitiesMode: mode
  });
}

/**
 * Set holo filter mode
 */
export function setHoloFilterMode(mode: HoloFilterMode) {
  advancedFilters.set({
    ...advancedFilters.get(),
    holoMode: mode
  });
}

/**
 * Reset all advanced filters to default
 */
export function resetAdvancedFilters() {
  advancedFilters.set(DEFAULT_ADVANCED_FILTERS);
}

/**
 * Check if any advanced filters are active
 */
export function hasActiveAdvancedFilters(): boolean {
  const filters = advancedFilters.get();
  return (
    filters.statRanges.length > 0 ||
    filters.abilitiesMode !== 'any' ||
    filters.holoMode !== 'all'
  );
}

// ============================================================================
// SEARCH PRESET ACTIONS
// ============================================================================

/**
 * Save current filters as a preset
 */
export function saveSearchPreset(name: string): void {
  const current = advancedFilters.get();
  const newPreset: SearchPreset = {
    id: crypto.randomUUID(),
    name,
    filters: { ...current },
    createdAt: new Date()
  };

  searchPresets.set([...searchPresets.get(), newPreset]);
}

/**
 * Load a search preset
 */
export function loadSearchPreset(preset: SearchPreset): void {
  advancedFilters.set({ ...preset.filters });
}

/**
 * Delete a search preset
 */
export function deleteSearchPreset(presetId: string): void {
  searchPresets.set(searchPresets.get().filter(p => p.id !== presetId));
}

/**
 * Update a search preset
 */
export function updateSearchPreset(presetId: string, name: string): void {
  const presets = searchPresets.get();
  const updated = presets.map(p =>
    p.id === presetId ? { ...p, name } : p
  );
  searchPresets.set(updated);
}

// ============================================================================
// FILTERED CARTS COMPUTED STORE
// ============================================================================

/**
 * Apply all advanced filters to collection cards
 */
function applyAdvancedFilters(
  cards: CardInCollection[],
  filters: AdvancedCollectionFilters
): CardInCollection[] {
  let filtered = [...cards];

  // Apply stat range filters
  if (filters.statRanges.length > 0) {
    filtered = filtered.filter(card => {
      return filters.statRanges.every(range => {
        const statValue = card.card.stats[range.stat];
        return statValue >= range.min && statValue <= range.max;
      });
    });
  }

  // Apply abilities filter
  if (filters.abilitiesMode === 'any') {
    filtered = filtered.filter(card =>
      card.card.abilities && card.card.abilities.length > 0
    );
  } else if (filters.abilitiesMode === 'none') {
    filtered = filtered.filter(card =>
      !card.card.abilities || card.card.abilities.length === 0
    );
  }

  // Apply holo filter
  if (filters.holoMode === 'holoOnly') {
    filtered = filtered.filter(card => card.isHolo);
  } else if (filters.holoMode === 'nonHoloOnly') {
    filtered = filtered.filter(card => !card.isHolo);
  }

  return filtered;
}

// Export for use in components
export {
  advancedFilters,
  searchPresets,
  setStatRangeFilters,
  addStatRangeFilter,
  removeStatRangeFilter,
  updateStatRangeFilter,
  setAbilitiesFilterMode,
  setHoloFilterMode,
  resetAdvancedFilters,
  hasActiveAdvancedFilters,
  saveSearchPreset,
  loadSearchPreset,
  deleteSearchPreset,
  updateSearchPreset,
  applyAdvancedFilters
};
