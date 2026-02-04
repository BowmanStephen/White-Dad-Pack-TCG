import { atom } from 'nanostores';

// Daily rewards modal open state
export const dailyRewardsModalOpen = atom(false);

/**
 * Open daily rewards modal
 */
export function openDailyRewardsModal(): void {
  dailyRewardsModalOpen.set(true);
}

/**
 * Close daily rewards modal
 */
export function closeDailyRewardsModal(): void {
  dailyRewardsModalOpen.set(false);
}

/**
 * Toggle daily rewards modal
 */
export function toggleDailyRewardsModal(): void {
  dailyRewardsModalOpen.set(!dailyRewardsModalOpen.get());
}
