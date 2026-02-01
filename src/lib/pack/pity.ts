import type { Rarity } from '../../types';
import { RARITY_ORDER } from '../../types';
import { PITY_THRESHOLDS as CONFIG_PITY_THRESHOLDS } from '../config/pack-config';

/**
 * Pity system configuration (PACK-003)
 *
 * Provides bad luck protection for pack opening:
 * - Guaranteed rare after X packs without a rare+
 * - Tracks pity counter across pack opens
 * - Resets counter when rare+ is pulled
 * - Configurable pity thresholds per rarity
 */

// Re-export pity thresholds from centralized config (lowercase keys for backward compatibility)
export const PITY_THRESHOLDS = {
  rare: CONFIG_PITY_THRESHOLDS.RARE,
  epic: CONFIG_PITY_THRESHOLDS.EPIC,
  legendary: CONFIG_PITY_THRESHOLDS.LEGENDARY,
  mythic: CONFIG_PITY_THRESHOLDS.MYTHIC,
} as const;

// Pity counter state (tracks consecutive packs without rare+ pulls)
export interface PityCounter {
  rare: number;      // Packs since last rare
  epic: number;      // Packs since last epic
  legendary: number; // Packs since last legendary
  mythic: number;    // Packs since last mythic
}

/**
 * Default pity counter (all counters at zero)
 */
export const DEFAULT_PITY_COUNTER: PityCounter = {
  rare: 0,
  epic: 0,
  legendary: 0,
  mythic: 0,
};

/**
 * Check if pity should trigger for a given rarity
 *
 * @param counter - Current pity counter state
 * @param rarity - Rarity to check against pity threshold
 * @returns True if pity threshold has been reached for this rarity
 *
 * @example
 * const counter = { rare: 10, epic: 5, legendary: 0, mythic: 0 };
 * shouldTriggerPity(counter, 'rare'); // Returns true (10 = threshold)
 * shouldTriggerPity(counter, 'epic'); // Returns false (5 < 30)
 */
export function shouldTriggerPity(counter: PityCounter, rarity: Rarity): boolean {
  switch (rarity) {
    case 'mythic':
      return counter.mythic >= PITY_THRESHOLDS.mythic;
    case 'legendary':
      return counter.legendary >= PITY_THRESHOLDS.legendary;
    case 'epic':
      return counter.epic >= PITY_THRESHOLDS.epic;
    case 'rare':
      return counter.rare >= PITY_THRESHOLDS.rare;
    default:
      return false;
  }
}

/**
 * Get the highest pity tier that should trigger
 *
 * Checks all pity counters in descending order (mythic → rare)
 * and returns the highest rarity tier that has reached its threshold.
 *
 * @param counter - Current pity counter state
 * @returns Highest rarity tier that should trigger pity, or null if none
 *
 * @example
 * const counter1 = { rare: 10, epic: 30, legendary: 0, mythic: 0 };
 * getHighestPityTier(counter1); // Returns 'epic' (epic threshold reached)
 *
 * const counter2 = { rare: 10, epic: 5, legendary: 0, mythic: 0 };
 * getHighestPityTier(counter2); // Returns 'rare' (only rare threshold reached)
 *
 * const counter3 = { rare: 5, epic: 5, legendary: 0, mythic: 0 };
 * getHighestPityTier(counter3); // Returns null (no thresholds reached)
 */
export function getHighestPityTier(counter: PityCounter): Rarity | null {
  // Check in descending order (mythic → rare)
  if (shouldTriggerPity(counter, 'mythic')) return 'mythic';
  if (shouldTriggerPity(counter, 'legendary')) return 'legendary';
  if (shouldTriggerPity(counter, 'epic')) return 'epic';
  if (shouldTriggerPity(counter, 'rare')) return 'rare';
  return null;
}

/**
 * Update pity counter after a pack opening
 *
 * Increments counters for all rarities NOT pulled in the pack.
 * Resets counters for rarities that WERE pulled.
 *
 * @param counter - Current pity counter state
 * @param pulledRarities - Array of rarities pulled in the pack
 * @returns Updated pity counter state
 *
 * @example
 * const counter = { rare: 9, epic: 5, legendary: 0, mythic: 0 };
 * const pulledRarities = ['common', 'common', 'common', 'uncommon', 'uncommon', 'rare'];
 * updatePityCounter(counter, pulledRarities);
 * // Returns: { rare: 0, epic: 6, legendary: 1, mythic: 1 }
 * // - rare resets to 0 (pulled a rare)
 * // - epic increments to 6 (no epic pulled)
 * // - legendary increments to 1 (no legendary pulled)
 * // - mythic increments to 1 (no mythic pulled)
 */
export function updatePityCounter(
  counter: PityCounter,
  pulledRarities: Rarity[]
): PityCounter {
  const newCounter = { ...counter };

  // Check which rarities were pulled (rare or better)
  const pulledRare = pulledRarities.some(r => RARITY_ORDER[r] >= RARITY_ORDER.rare);
  const pulledEpic = pulledRarities.some(r => RARITY_ORDER[r] >= RARITY_ORDER.epic);
  const pulledLegendary = pulledRarities.some(r => RARITY_ORDER[r] >= RARITY_ORDER.legendary);
  const pulledMythic = pulledRarities.some(r => RARITY_ORDER[r] >= RARITY_ORDER.mythic);

  // Update counters based on what was pulled
  if (pulledMythic) {
    // Mythic resets all counters
    newCounter.rare = 0;
    newCounter.epic = 0;
    newCounter.legendary = 0;
    newCounter.mythic = 0;
  } else if (pulledLegendary) {
    // Legendary resets rare, epic, legendary
    newCounter.rare = 0;
    newCounter.epic = 0;
    newCounter.legendary = 0;
    newCounter.mythic = Math.min(newCounter.mythic + 1, PITY_THRESHOLDS.mythic);
  } else if (pulledEpic) {
    // Epic resets rare and epic
    newCounter.rare = 0;
    newCounter.epic = 0;
    newCounter.legendary = Math.min(newCounter.legendary + 1, PITY_THRESHOLDS.legendary);
    newCounter.mythic = Math.min(newCounter.mythic + 1, PITY_THRESHOLDS.mythic);
  } else if (pulledRare) {
    // Rare resets only rare counter
    newCounter.rare = 0;
    newCounter.epic = Math.min(newCounter.epic + 1, PITY_THRESHOLDS.epic);
    newCounter.legendary = Math.min(newCounter.legendary + 1, PITY_THRESHOLDS.legendary);
    newCounter.mythic = Math.min(newCounter.mythic + 1, PITY_THRESHOLDS.mythic);
  } else {
    // No rare+ pulled, increment all counters
    newCounter.rare = Math.min(newCounter.rare + 1, PITY_THRESHOLDS.rare);
    newCounter.epic = Math.min(newCounter.epic + 1, PITY_THRESHOLDS.epic);
    newCounter.legendary = Math.min(newCounter.legendary + 1, PITY_THRESHOLDS.legendary);
    newCounter.mythic = Math.min(newCounter.mythic + 1, PITY_THRESHOLDS.mythic);
  }

  return newCounter;
}

/**
 * Get pity progress percentage for a given rarity
 *
 * Returns a value between 0 and 1 representing how close the player
 * is to triggering pity for the specified rarity.
 *
 * @param counter - Current pity counter state
 * @param rarity - Rarity to check progress for
 * @returns Progress from 0 to 1 (1 = pity will trigger)
 *
 * @example
 * const counter = { rare: 5, epic: 15, legendary: 30, mythic: 50 };
 * getPityProgress(counter, 'rare'); // Returns 0.5 (5/10 = 50%)
 * getPityProgress(counter, 'epic'); // Returns 0.5 (15/30 = 50%)
 * getPityProgress(counter, 'legendary'); // Returns 0.5 (30/60 = 50%)
 * getPityProgress(counter, 'mythic'); // Returns 0.5 (50/100 = 50%)
 */
export function getPityProgress(counter: PityCounter, rarity: Rarity): number {
  switch (rarity) {
    case 'mythic':
      return counter.mythic / PITY_THRESHOLDS.mythic;
    case 'legendary':
      return counter.legendary / PITY_THRESHOLDS.legendary;
    case 'epic':
      return counter.epic / PITY_THRESHOLDS.epic;
    case 'rare':
      return counter.rare / PITY_THRESHOLDS.rare;
    default:
      return 0;
  }
}

/**
 * Get packs remaining before pity triggers for a given rarity
 *
 * @param counter - Current pity counter state
 * @param rarity - Rarity to check
 * @returns Number of packs remaining (0 = pity will trigger next pack)
 *
 * @example
 * const counter = { rare: 8, epic: 25, legendary: 55, mythic: 95 };
 * getPacksRemaining(counter, 'rare'); // Returns 2 (10 - 8 = 2)
 * getPacksRemaining(counter, 'epic'); // Returns 5 (30 - 25 = 5)
 * getPacksRemaining(counter, 'legendary'); // Returns 5 (60 - 55 = 5)
 * getPacksRemaining(counter, 'mythic'); // Returns 5 (100 - 95 = 5)
 */
export function getPacksRemaining(counter: PityCounter, rarity: Rarity): number {
  switch (rarity) {
    case 'mythic':
      return Math.max(0, PITY_THRESHOLDS.mythic - counter.mythic);
    case 'legendary':
      return Math.max(0, PITY_THRESHOLDS.legendary - counter.legendary);
    case 'epic':
      return Math.max(0, PITY_THRESHOLDS.epic - counter.epic);
    case 'rare':
      return Math.max(0, PITY_THRESHOLDS.rare - counter.rare);
    default:
      return 0;
  }
}
