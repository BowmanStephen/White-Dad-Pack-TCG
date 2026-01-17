import { atom, computed } from 'nanostores';
import type {
  Season,
  SeasonId,
  SeasonState,
  SeasonConfig,
  SeasonLaunchEvent,
} from '../types';
import {
  SEASONS,
  getSeasonById,
  getActiveSeasons,
  getArchivedSeasons,
  getUpcomingSeasons,
  SEASON_LAUNCH_EVENTS,
  getActiveLaunchEvents,
} from '../data/seasons';
import { persistentAtom } from '@nanostores/persistent';

/**
 * Season Configuration (persisted to localStorage)
 */
export const seasonConfig = persistentAtom<SeasonConfig>('season-config', {
  currentSeason: 1,
  autoArchive: true,
  launchEventDuration: 7,
});

/**
 * Current season ID
 */
export const currentSeasonId = atom<SeasonId>(1);

/**
 * Current season data (computed)
 */
export const currentSeason = computed(currentSeasonId, (id) =>
  getSeasonById(id)
);

/**
 * All seasons data
 */
export const allSeasons = atom<Season[]>(SEASONS);

/**
 * Active seasons (computed)
 */
export const activeSeasons = computed(allSeasons, () => getActiveSeasons());

/**
 * Archived seasons (computed)
 */
export const archivedSeasons = computed(allSeasons, () =>
  getArchivedSeasons()
);

/**
 * Upcoming seasons (computed)
 */
export const upcomingSeasons = computed(allSeasons, () =>
  getUpcomingSeasons()
);

/**
 * Active launch events (computed)
 */
export const activeLaunchEvents = atom<SeasonLaunchEvent[]>(
  getActiveLaunchEvents()
);

/**
 * Full season state (computed for UI components)
 */
export const seasonState = computed(
  [
    currentSeasonId,
    activeSeasons,
    archivedSeasons,
    upcomingSeasons,
    activeLaunchEvents,
  ],
  (
    currentSeason,
    active,
    archived,
    upcoming,
    events
  ): SeasonState => ({
    currentSeason,
    activeSeasons: active,
    archivedSeasons: archived,
    upcomingSeasons: upcoming,
    launchEvents: events,
  })
);

/**
 * Actions
 */

/**
 * Set the current active season
 */
export function setCurrentSeason(seasonId: SeasonId): void {
  currentSeasonId.set(seasonId);
  const config = seasonConfig.get();
  seasonConfig.set({ ...config, currentSeason: seasonId });
}

/**
 * Get a season by ID
 */
export function getSeason(seasonId: SeasonId): Season | undefined {
  return getSeasonById(seasonId);
}

/**
 * Check if a season is archived
 */
export function isSeasonArchived(seasonId: SeasonId): boolean {
  const season = getSeasonById(seasonId);
  return season?.status === 'archived' || false;
}

/**
 * Check if a season is active
 */
export function isSeasonActive(seasonId: SeasonId): boolean {
  const season = getSeasonById(seasonId);
  if (!season) return false;

  const now = new Date();
  const isActive = season.status === 'active';
  const hasStarted = now >= season.startDate;
  const hasNotEnded = !season.endDate || now <= season.endDate;

  return isActive && hasStarted && hasNotEnded;
}

/**
 * Check if a season is upcoming
 */
export function isSeasonUpcoming(seasonId: SeasonId): boolean {
  const season = getSeasonById(seasonId);
  if (!season) return false;

  const now = new Date();
  return now < season.startDate;
}

/**
 * Archive a season (mark as archived)
 * Note: This would typically be called by server/admin, but included for completeness
 */
export function archiveSeason(seasonId: SeasonId): void {
  const seasons = allSeasons.get();
  const updatedSeasons = seasons.map((season) =>
    season.id === seasonId ? { ...season, status: 'archived' as const } : season
  );
  allSeasons.set(updatedSeasons);
}

/**
 * Refresh launch events (check for new active events)
 */
export function refreshLaunchEvents(): void {
  activeLaunchEvents.set(getActiveLaunchEvents());
}

/**
 * Get the pack design for a season
 */
export function getSeasonPackDesign(seasonId: SeasonId): string {
  const season = getSeasonById(seasonId);
  return season?.packDesign || 'base_set';
}

/**
 * Initialize season store
 * Call this on app startup to set up initial season state
 */
export function initializeSeasonStore(): void {
  const config = seasonConfig.get();
  currentSeasonId.set(config.currentSeason);
  refreshLaunchEvents();
}
