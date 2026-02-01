/**
 * Rarity Effects Configuration
 *
 * Centralized configuration for visual and haptic feedback based on card rarity.
 * Used by PackAnimation and other components that need rarity-based effects.
 */
import type { Rarity } from '@/types';
import { HAPTIC_PATTERNS } from '../config/pack-config';

// ============================================================================
// RARITY EFFECT TYPES
// ============================================================================

/**
 * Visual effects that can be triggered during card/pack reveals
 */
export interface RarityVisualEffects {
  /** Full-screen flash effect */
  screenFlash: boolean;
  /** Lightning bolt overlay */
  lightning: boolean;
  /** Golden particle trail */
  goldenTrail: boolean;
}

/**
 * Haptic feedback pattern for different rarities
 */
export type HapticPattern = number[];

// ============================================================================
// EFFECT CONFIGURATION BY RARITY
// ============================================================================

/**
 * Get visual effects configuration for a given rarity
 *
 * @param rarity - The card's rarity tier
 * @returns Object indicating which visual effects to show
 *
 * @example
 * const effects = getVisualEffectsForRarity('legendary');
 * // { screenFlash: true, lightning: false, goldenTrail: false }
 */
export function getVisualEffectsForRarity(rarity: Rarity): RarityVisualEffects {
  switch (rarity) {
    case 'mythic':
    case 'legendary':
      // Legendary+: Screen flash + camera shake
      return {
        screenFlash: true,
        lightning: false,
        goldenTrail: false,
      };
    case 'epic':
      // Epic: Lightning effect
      return {
        screenFlash: false,
        lightning: true,
        goldenTrail: false,
      };
    case 'rare':
      // Rare: Golden particle trail
      return {
        screenFlash: false,
        lightning: false,
        goldenTrail: true,
      };
    default:
      // Common/Uncommon: No special effects
      return {
        screenFlash: false,
        lightning: false,
        goldenTrail: false,
      };
  }
}

/**
 * Get haptic feedback pattern for a given rarity
 *
 * @param rarity - The card's rarity tier
 * @returns Vibration pattern array for navigator.vibrate(), or null if no haptic
 *
 * @example
 * const pattern = getHapticPatternForRarity('legendary');
 * if (pattern && navigator.vibrate) {
 *   navigator.vibrate(pattern);
 * }
 */
export function getHapticPatternForRarity(rarity: Rarity): HapticPattern | null {
  switch (rarity) {
    case 'mythic':
    case 'legendary':
      return [...HAPTIC_PATTERNS.LEGENDARY_REVEAL];
    case 'epic':
      return [...HAPTIC_PATTERNS.EPIC_REVEAL];
    default:
      return null;
  }
}

/**
 * Trigger haptic feedback for a given rarity (if device supports it)
 *
 * @param rarity - The card's rarity tier
 *
 * @example
 * triggerRarityHaptic('epic'); // Triggers double-buzz for epic cards
 */
export function triggerRarityHaptic(rarity: Rarity): void {
  const pattern = getHapticPatternForRarity(rarity);
  if (pattern && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// ============================================================================
// RARITY TIER HELPERS
// ============================================================================

/**
 * Check if a rarity is legendary or higher
 */
export function isLegendaryPlus(rarity: Rarity): boolean {
  return rarity === 'legendary' || rarity === 'mythic';
}

/**
 * Check if a rarity qualifies for special visual effects (rare+)
 */
export function hasSpecialEffects(rarity: Rarity): boolean {
  return rarity === 'rare' || rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic';
}
