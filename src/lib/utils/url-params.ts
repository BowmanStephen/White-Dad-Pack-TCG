/**
 * URL Query Parameter Utilities
 * Helpers for getting/setting URL search params without page reload
 */

import { browser } from './browser';
import type { Rarity, DadType, SortOption } from '../../types';
import { RARITY_CONFIG, DAD_TYPE_NAMES, SORT_OPTION_CONFIG } from '../../types';

/**
 * Get single query parameter
 */
export function getQueryParam(param: string): string | null {
  if (!browser) return null;
  return new URLSearchParams(window.location.search).get(param);
}

/**
 * Get array query parameter (comma-separated values)
 */
export function getQueryParamArray(param: string): string[] {
  if (!browser) return [];
  const value = new URLSearchParams(window.location.search).get(param);
  return value ? value.split(',').map(v => v.trim()) : [];
}

/**
 * Set single query parameter
 */
export function setQueryParam(param: string, value: string | null): void {
  if (!browser) return;
  const url = new URL(window.location.href);
  if (value === null) {
    url.searchParams.delete(param);
  } else {
    url.searchParams.set(param, value);
  }
  window.history.replaceState({}, '', url.toString());
}

/**
 * Set array query parameter (joins as comma-separated values)
 */
export function setQueryParamArray(param: string, values: string[]): void {
  if (!browser) return;
  const url = new URL(window.location.href);
  if (values.length === 0) {
    url.searchParams.delete(param);
  } else {
    url.searchParams.set(param, values.join(','));
  }
  window.history.replaceState({}, '', url.toString());
}

/**
 * Gallery-specific: Initialize filter state from URL params
 * Returns object with validated filter values
 */
export function initializeGalleryFiltersFromURL(): {
  rarity: Rarity | null;
  types: Set<DadType>;
  sort: SortOption;
} {
  // Rarity filter
  const rarityParam = getQueryParam('rarity');
  const rarity = rarityParam && Object.keys(RARITY_CONFIG).includes(rarityParam)
    ? (rarityParam as Rarity)
    : null;

  // Type filters (multi-select)
  const typeParams = getQueryParamArray('type');
  const validTypes = typeParams.filter((t): t is DadType =>
    Object.keys(DAD_TYPE_NAMES).includes(t)
  );
  const types = new Set(validTypes);

  // Sort option
  const sortParam = getQueryParam('sort');
  const sort = sortParam && Object.keys(SORT_OPTION_CONFIG).includes(sortParam)
    ? (sortParam as SortOption)
    : 'rarity_desc';

  return { rarity, types, sort };
}

/**
 * Sync all active filters to URL
 */
export function syncFiltersToURL(filters: {
  rarity?: Rarity | null;
  types?: Set<DadType>;
  sort?: SortOption;
}): void {
  if (filters.rarity !== undefined) {
    setQueryParam('rarity', filters.rarity);
  }
  if (filters.types !== undefined) {
    setQueryParamArray('type', Array.from(filters.types));
  }
  if (filters.sort !== undefined) {
    setQueryParam('sort', filters.sort);
  }
}
