import { atom, computed } from 'nanostores';
import type { Season, SeasonId } from '../types';
import { SEASONS, getSeasonById, getActiveSeasons } from '../data/seasons';

/**
 * Current season ID
 */
export const currentSeasonId = atom<SeasonId>(2);

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
 * Set the current active season
 */
export function setCurrentSeason(seasonId: SeasonId): void {
  currentSeasonId.set(seasonId);
}

/**
 * Get a season by ID
 */
export function getSeason(seasonId: SeasonId): Season | undefined {
  return getSeasonById(seasonId);
}

/**
 * Check if a season is active
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
 * Get the pack design for a season
 */
export function getSeasonPackDesign(seasonId: SeasonId): string {
  const season = getSeasonById(seasonId);
  return season?.packDesign || 'base_set';
}
