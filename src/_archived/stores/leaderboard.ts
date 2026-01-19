/**
 * Leaderboard Store
 *
 * Manages leaderboard state, filters, and data.
 */

import { atom, computed } from 'nanostores';
import type {
  Leaderboard,
  LeaderboardCategory,
  LeaderboardScope,
  LeaderboardTimePeriod,
  LeaderboardRegion,
} from '@/types/leaderboard';

/**
 * Default leaderboard configuration
 */
const DEFAULT_CATEGORY: LeaderboardCategory = 'packsOpened';
const DEFAULT_SCOPE: LeaderboardScope = 'global';
const DEFAULT_TIME_PERIOD: LeaderboardTimePeriod = 'allTime';
const DEFAULT_REGION: LeaderboardRegion = 'global';

/**
 * Current category being viewed
 */
export const currentCategory = atom<LeaderboardCategory>(DEFAULT_CATEGORY);

/**
 * Current scope (global or friends)
 */
export const currentScope = atom<LeaderboardScope>(DEFAULT_SCOPE);

/**
 * Current time period filter
 */
export const currentTimePeriod = atom<LeaderboardTimePeriod>(DEFAULT_TIME_PERIOD);

/**
 * Current region filter (future feature)
 */
export const currentRegion = atom<LeaderboardRegion>(DEFAULT_REGION);

/**
 * Current leaderboard data
 */
export const currentLeaderboard = atom<Leaderboard | null>(null);

/**
 * Loading state
 */
export const isLoading = atom<boolean>(false);

/**
 * Error state
 */
export const error = atom<string | null>(null);

/**
 * Computed store for filter configuration
 */
export const filterConfig = computed(
  [currentCategory, currentScope, currentTimePeriod, currentRegion],
  (category, scope, timePeriod, region) => ({
    category,
    scope,
    timePeriod,
    region,
  })
);

/**
 * Set the current category
 */
export function setCategory(category: LeaderboardCategory) {
  currentCategory.set(category);
  // Invalidate current leaderboard data when filters change
  currentLeaderboard.set(null);
}

/**
 * Set the current scope
 */
export function setScope(scope: LeaderboardScope) {
  currentScope.set(scope);
  currentLeaderboard.set(null);
}

/**
 * Set the current time period
 */
export function setTimePeriod(timePeriod: LeaderboardTimePeriod) {
  currentTimePeriod.set(timePeriod);
  currentLeaderboard.set(null);
}

/**
 * Set the current region
 */
export function setRegion(region: LeaderboardRegion) {
  currentRegion.set(region);
  currentLeaderboard.set(null);
}

/**
 * Set multiple filters at once
 */
export function setFilters(filters: {
  category?: LeaderboardCategory;
  scope?: LeaderboardScope;
  timePeriod?: LeaderboardTimePeriod;
  region?: LeaderboardRegion;
}) {
  if (filters.category !== undefined) {
    currentCategory.set(filters.category);
  }
  if (filters.scope !== undefined) {
    currentScope.set(filters.scope);
  }
  if (filters.timePeriod !== undefined) {
    currentTimePeriod.set(filters.timePeriod);
  }
  if (filters.region !== undefined) {
    currentRegion.set(filters.region);
  }
  // Invalidate current leaderboard data
  currentLeaderboard.set(null);
}

/**
 * Set the current leaderboard data
 */
export function setLeaderboard(leaderboard: Leaderboard) {
  currentLeaderboard.set(leaderboard);
  error.set(null);
}

/**
 * Set loading state
 */
export function setLoading(loading: boolean) {
  isLoading.set(loading);
}

/**
 * Set error state
 */
export function setError(err: string | null) {
  error.set(err);
  isLoading.set(false);
}

/**
 * Reset all filters to defaults
 */
export function resetFilters() {
  currentCategory.set(DEFAULT_CATEGORY);
  currentScope.set(DEFAULT_SCOPE);
  currentTimePeriod.set(DEFAULT_TIME_PERIOD);
  currentRegion.set(DEFAULT_REGION);
  currentLeaderboard.set(null);
  error.set(null);
}
