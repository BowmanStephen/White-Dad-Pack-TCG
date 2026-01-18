/**
 * Pity System Store
 *
 * Implements "bad luck protection" - guarantees rare+ pulls after a certain
 * number of packs without pulling them. Prevents player frustration.
 *
 * Thresholds:
 * - Soft pity (rare+): 15 packs -> increased rare+ chance starts
 * - Hard pity (rare+): 30 packs -> guaranteed rare+ pull
 * - Soft pity (epic+): 40 packs -> increased epic+ chance starts
 * - Hard pity (epic+): 60 packs -> guaranteed epic+ pull
 * - Soft pity (legendary+): 80 packs -> increased legendary+ chance starts
 * - Hard pity (legendary+): 100 packs -> guaranteed legendary+ pull
 *
 * @see docs/CARD_MECHANICS.md for full documentation
 */

import { persistentAtom } from '@nanostores/persistent';
import type {
  PityCounter,
  PityState,
  PityThresholds,
  Rarity,
  Pack,
} from '../types';
import { DEFAULT_PITY_THRESHOLDS, RARITY_ORDER } from '../types';
import { safeJsonParse } from '../lib/utils/safe-parse';
import { createDateEncoder } from '../lib/utils/encoders';

// ============================================================================
// PITY COUNTER STORE
// ============================================================================

// Default pity counter
const DEFAULT_PITY_COUNTER: PityCounter = {
  packsSinceRare: 0,
  packsSinceEpic: 0,
  packsSinceLegendary: 0,
  packsSinceMythic: 0,
  lastUpdated: new Date(),
};

// Custom encoder for PityCounter (handles Date serialization)
const pityEncoder = createDateEncoder<PityCounter>({
  dateFields: ['lastUpdated'],
});

const pityCounterEncoder = {
  encode(data: PityCounter): string {
    return pityEncoder.encode(data);
  },
  decode(str: string): PityCounter {
    const data = safeJsonParse<PityCounter>(str);
    if (!data) {
      return { ...DEFAULT_PITY_COUNTER, lastUpdated: new Date() };
    }
    return pityEncoder.decode(JSON.stringify(data));
  },
};

// Persistent pity counter store
export const pityCounter = persistentAtom<PityCounter>(
  'daddeck-pity-counter',
  DEFAULT_PITY_COUNTER,
  pityCounterEncoder
);

// ============================================================================
// PITY SYSTEM LOGIC
// ============================================================================

/**
 * Check if a rarity counts as "rare or better"
 */
function isRareOrBetter(rarity: Rarity): boolean {
  return RARITY_ORDER[rarity] >= RARITY_ORDER.rare;
}

/**
 * Check if a rarity counts as "epic or better"
 */
function isEpicOrBetter(rarity: Rarity): boolean {
  return RARITY_ORDER[rarity] >= RARITY_ORDER.epic;
}

/**
 * Check if a rarity counts as "legendary or better"
 */
function isLegendaryOrBetter(rarity: Rarity): boolean {
  return RARITY_ORDER[rarity] >= RARITY_ORDER.legendary;
}

/**
 * Check if a rarity is mythic
 */
function isMythic(rarity: Rarity): boolean {
  return rarity === 'mythic';
}

/**
 * Update pity counters after opening a pack
 *
 * @param pack - The pack that was just opened
 */
export function updatePityCounters(pack: Pack): void {
  const current = pityCounter.get();
  const bestRarity = pack.bestRarity;

  // Check what rarities were pulled
  const hasRareOrBetter = pack.cards.some((card) => isRareOrBetter(card.rarity));
  const hasEpicOrBetter = pack.cards.some((card) => isEpicOrBetter(card.rarity));
  const hasLegendaryOrBetter = pack.cards.some((card) => isLegendaryOrBetter(card.rarity));
  const hasMythic = pack.cards.some((card) => isMythic(card.rarity));

  // Update counters - reset if pulled, increment if not
  pityCounter.set({
    packsSinceRare: hasRareOrBetter ? 0 : current.packsSinceRare + 1,
    packsSinceEpic: hasEpicOrBetter ? 0 : current.packsSinceEpic + 1,
    packsSinceLegendary: hasLegendaryOrBetter ? 0 : current.packsSinceLegendary + 1,
    packsSinceMythic: hasMythic ? 0 : current.packsSinceMythic + 1,
    lastUpdated: new Date(),
  });
}

/**
 * Get the current pity state for UI display
 *
 * @param thresholds - Optional custom thresholds (defaults to DEFAULT_PITY_THRESHOLDS)
 * @returns PityState object with progress and status information
 */
export function getPityState(thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS): PityState {
  const counters = pityCounter.get();

  // Calculate progress percentages
  const rareProgress = Math.min(100, (counters.packsSinceRare / thresholds.rare.hardPity) * 100);
  const epicProgress = Math.min(100, (counters.packsSinceEpic / thresholds.epic.hardPity) * 100);
  const legendaryProgress = Math.min(
    100,
    (counters.packsSinceLegendary / thresholds.legendary.hardPity) * 100
  );
  const mythicProgress = Math.min(
    100,
    (counters.packsSinceMythic / thresholds.mythic.hardPity) * 100
  );

  // Check if soft pity is active
  const rareSoftPityActive = counters.packsSinceRare >= thresholds.rare.softPity;
  const epicSoftPityActive = counters.packsSinceEpic >= thresholds.epic.softPity;
  const legendarySoftPityActive = counters.packsSinceLegendary >= thresholds.legendary.softPity;
  const mythicSoftPityActive = counters.packsSinceMythic >= thresholds.mythic.softPity;

  // Check if hard pity is guaranteed
  const rareGuaranteed = counters.packsSinceRare >= thresholds.rare.hardPity;
  const epicGuaranteed = counters.packsSinceEpic >= thresholds.epic.hardPity;
  const legendaryGuaranteed = counters.packsSinceLegendary >= thresholds.legendary.hardPity;
  const mythicGuaranteed = counters.packsSinceMythic >= thresholds.mythic.hardPity;

  return {
    counters,
    thresholds,
    rareProgress,
    epicProgress,
    legendaryProgress,
    mythicProgress,
    rareSoftPityActive,
    epicSoftPityActive,
    legendarySoftPityActive,
    mythicSoftPityActive,
    rareGuaranteed,
    epicGuaranteed,
    legendaryGuaranteed,
    mythicGuaranteed,
  };
}

/**
 * Get the rarity probability multiplier based on pity status
 *
 * @param rarity - The rarity to check
 * @param thresholds - Optional custom thresholds
 * @returns Probability multiplier (1.0 = normal, higher = boosted)
 */
export function getPityMultiplier(
  rarity: Rarity,
  thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS
): number {
  const counters = pityCounter.get();

  switch (rarity) {
    case 'rare':
      if (counters.packsSinceRare >= thresholds.rare.hardPity) {
        return Infinity; // Guaranteed
      }
      if (counters.packsSinceRare >= thresholds.rare.softPity) {
        // Linear interpolation from soft pity to hard pity
        const progress =
          (counters.packsSinceRare - thresholds.rare.softPity) /
          (thresholds.rare.hardPity - thresholds.rare.softPity);
        return thresholds.rare.softPityMultiplier + progress * (10 - thresholds.rare.softPityMultiplier);
      }
      return 1.0;

    case 'epic':
      if (counters.packsSinceEpic >= thresholds.epic.hardPity) {
        return Infinity; // Guaranteed
      }
      if (counters.packsSinceEpic >= thresholds.epic.softPity) {
        const progress =
          (counters.packsSinceEpic - thresholds.epic.softPity) /
          (thresholds.epic.hardPity - thresholds.epic.softPity);
        return thresholds.epic.softPityMultiplier + progress * (10 - thresholds.epic.softPityMultiplier);
      }
      return 1.0;

    case 'legendary':
      if (counters.packsSinceLegendary >= thresholds.legendary.hardPity) {
        return Infinity; // Guaranteed
      }
      if (counters.packsSinceLegendary >= thresholds.legendary.softPity) {
        const progress =
          (counters.packsSinceLegendary - thresholds.legendary.softPity) /
          (thresholds.legendary.hardPity - thresholds.legendary.softPity);
        return (
          thresholds.legendary.softPityMultiplier +
          progress * (10 - thresholds.legendary.softPityMultiplier)
        );
      }
      return 1.0;

    case 'mythic':
      if (counters.packsSinceMythic >= thresholds.mythic.hardPity) {
        return Infinity; // Guaranteed
      }
      if (counters.packsSinceMythic >= thresholds.mythic.softPity) {
        const progress =
          (counters.packsSinceMythic - thresholds.mythic.softPity) /
          (thresholds.mythic.hardPity - thresholds.mythic.softPity);
        return (
          thresholds.mythic.softPityMultiplier + progress * (10 - thresholds.mythic.softPityMultiplier)
        );
      }
      return 1.0;

    default:
      return 1.0;
  }
}

/**
 * Check if a specific rarity is guaranteed by pity
 *
 * @param rarity - The rarity to check
 * @param thresholds - Optional custom thresholds
 * @returns True if this rarity is guaranteed by hard pity
 */
export function isRarityGuaranteed(
  rarity: Rarity,
  thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS
): boolean {
  const counters = pityCounter.get();

  switch (rarity) {
    case 'rare':
      return counters.packsSinceRare >= thresholds.rare.hardPity;
    case 'epic':
      return counters.packsSinceEpic >= thresholds.epic.hardPity;
    case 'legendary':
      return counters.packsSinceLegendary >= thresholds.legendary.hardPity;
    case 'mythic':
      return counters.packsSinceMythic >= thresholds.mythic.hardPity;
    default:
      return false;
  }
}

/**
 * Get the highest guaranteed rarity (if any)
 *
 * @param thresholds - Optional custom thresholds
 * @returns The highest guaranteed rarity, or null if none guaranteed
 */
export function getGuaranteedRarity(
  thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS
): Rarity | null {
  // Check in order from highest to lowest
  if (isRarityGuaranteed('mythic', thresholds)) return 'mythic';
  if (isRarityGuaranteed('legendary', thresholds)) return 'legendary';
  if (isRarityGuaranteed('epic', thresholds)) return 'epic';
  if (isRarityGuaranteed('rare', thresholds)) return 'rare';
  return null;
}

/**
 * Reset pity counters (e.g., for testing or new account)
 */
export function resetPityCounters(): void {
  pityCounter.set({
    ...DEFAULT_PITY_COUNTER,
    lastUpdated: new Date(),
  });
}

/**
 * Get packs remaining until guaranteed rare+
 */
export function getPacksUntilRare(
  thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS
): number {
  const counters = pityCounter.get();
  return Math.max(0, thresholds.rare.hardPity - counters.packsSinceRare);
}

/**
 * Get packs remaining until guaranteed epic+
 */
export function getPacksUntilEpic(
  thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS
): number {
  const counters = pityCounter.get();
  return Math.max(0, thresholds.epic.hardPity - counters.packsSinceEpic);
}

/**
 * Get packs remaining until guaranteed legendary+
 */
export function getPacksUntilLegendary(
  thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS
): number {
  const counters = pityCounter.get();
  return Math.max(0, thresholds.legendary.hardPity - counters.packsSinceLegendary);
}

/**
 * Get packs remaining until guaranteed mythic
 */
export function getPacksUntilMythic(
  thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS
): number {
  const counters = pityCounter.get();
  return Math.max(0, thresholds.mythic.hardPity - counters.packsSinceMythic);
}

// ============================================================================
// APPLY PITY TO PACK GENERATION
// ============================================================================

/**
 * Apply pity boost to rarity probabilities
 *
 * This function modifies rarity probabilities based on current pity status.
 * It should be called during pack generation to adjust the odds.
 *
 * @param baseProbabilities - Original rarity probabilities
 * @param thresholds - Optional custom thresholds
 * @returns Modified probabilities with pity boosts applied
 */
export function applyPityToRarityProbabilities(
  baseProbabilities: Partial<Record<Rarity, number>>,
  thresholds: PityThresholds = DEFAULT_PITY_THRESHOLDS
): Partial<Record<Rarity, number>> {
  const boostedProbabilities: Partial<Record<Rarity, number>> = { ...baseProbabilities };

  // Check for guaranteed rarities first
  const guaranteedRarity = getGuaranteedRarity(thresholds);
  if (guaranteedRarity) {
    // Force the guaranteed rarity to 100%
    const result: Partial<Record<Rarity, number>> = {};
    result[guaranteedRarity] = 1.0;
    return result;
  }

  // Apply soft pity multipliers
  const rarities: Rarity[] = ['rare', 'epic', 'legendary', 'mythic'];
  let totalBoost = 0;

  for (const rarity of rarities) {
    if (baseProbabilities[rarity] !== undefined) {
      const multiplier = getPityMultiplier(rarity, thresholds);
      if (multiplier > 1 && multiplier !== Infinity) {
        const originalProb = baseProbabilities[rarity] || 0;
        const boostedProb = originalProb * multiplier;
        boostedProbabilities[rarity] = boostedProb;
        totalBoost += boostedProb - originalProb;
      }
    }
  }

  // Reduce common/uncommon probabilities to compensate
  if (totalBoost > 0) {
    // Take from uncommon first, then common
    if (boostedProbabilities.uncommon !== undefined) {
      const reduction = Math.min(totalBoost, boostedProbabilities.uncommon * 0.5);
      boostedProbabilities.uncommon -= reduction;
      totalBoost -= reduction;
    }
    if (totalBoost > 0 && boostedProbabilities.common !== undefined) {
      boostedProbabilities.common = Math.max(0, boostedProbabilities.common - totalBoost);
    }
  }

  // Normalize probabilities to sum to 1
  const total = Object.values(boostedProbabilities).reduce((sum, p) => sum + (p || 0), 0);
  if (total > 0 && total !== 1) {
    for (const rarity of Object.keys(boostedProbabilities) as Rarity[]) {
      if (boostedProbabilities[rarity] !== undefined) {
        boostedProbabilities[rarity] = boostedProbabilities[rarity]! / total;
      }
    }
  }

  return boostedProbabilities;
}
