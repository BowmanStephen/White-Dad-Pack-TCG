/**
 * Pack Sound Effects Interface
 *
 * Convenience wrapper for pack opening sound effects.
 * Delegates to the main audio store in src/stores/audio.ts
 *
 * @fileoverview Provides a clean interface for pack-specific sound effects
 * @module audio/pack-sounds
 */

import {
  playPackTear,
  playCardReveal,
  playCinematicCardReveal,
  playRarityJingle,
  playCardFlip,
} from '../../stores/audio';
import type { Rarity } from '../../types';

/**
 * Play pack tear sound effect
 * Called when the pack animation tears open
 */
export function playPackTearSound(): void {
  playPackTear();
}

/**
 * Play card reveal sound based on rarity
 * @param rarity - Card rarity (common, uncommon, rare, epic, legendary, mythic)
 * @param cinematicMode - Whether to use enhanced cinematic audio (default: false)
 */
export function playCardRevealSound(
  rarity: Rarity,
  cinematicMode: boolean = false
): void {
  if (cinematicMode) {
    playCinematicCardReveal(rarity);
  } else {
    playCardReveal(rarity, cinematicMode);
  }
}

/**
 * Play rarity-specific jingle fanfare
 * Only plays for epic+ cards
 * @param rarity - Card rarity
 */
export function playRarityFanfare(rarity: Rarity): void {
  playRarityJingle(rarity);
}

/**
 * Play card flip sound effect
 * Used for manual card flipping interactions
 */
export function playCardFlipSound(): void {
  playCardFlip();
}

/**
 * Sound configuration for pack opening
 */
export const PACK_SOUND_CONFIG = {
  /** Whether pack tear sound is enabled */
  packTearEnabled: true,

  /** Whether card reveal sounds are enabled */
  cardRevealEnabled: true,

  /** Whether rarity jingles are enabled */
  rarityJinglesEnabled: true,

  /** Volume multiplier for pack sounds (0.0 to 1.0) */
  volumeMultiplier: 1.0,
} as const;

/**
 * Rarity-specific sound durations (in seconds)
 * Used for timing visual animations with audio
 */
export const RARITY_SOUND_DURATIONS: Record<Rarity, {
  reveal: number;      // Standard reveal duration
  cinematic: number;   // Cinematic reveal duration
  jingle: number;      // Jingle duration (epic+ only)
}> = {
  common: {
    reveal: 0.5,
    cinematic: 0.75,
    jingle: 0,
  },
  uncommon: {
    reveal: 0.8,
    cinematic: 1.2,
    jingle: 0,
  },
  rare: {
    reveal: 1.2,
    cinematic: 2.0,
    jingle: 0,
  },
  epic: {
    reveal: 2.0,
    cinematic: 3.5,
    jingle: 2.0,
  },
  legendary: {
    reveal: 3.0,
    cinematic: 5.0,
    jingle: 3.0,
  },
  mythic: {
    reveal: 5.0,
    cinematic: 8.0,
    jingle: 5.0,
  },
} as const;

/**
 * Get the reveal sound duration for a rarity
 * @param rarity - Card rarity
 * @param cinematicMode - Whether to use cinematic duration
 * @returns Duration in seconds
 */
export function getRevealSoundDuration(
  rarity: Rarity,
  cinematicMode: boolean = false
): number {
  const durations = RARITY_SOUND_DURATIONS[rarity];
  return cinematicMode ? durations.cinematic : durations.reveal;
}

/**
 * Check if a rarity has a jingle fanfare
 * @param rarity - Card rarity
 * @returns true if the rarity has a jingle (epic+ only)
 */
export function hasRarityJingle(rarity: Rarity): boolean {
  return ['epic', 'legendary', 'mythic'].includes(rarity);
}
