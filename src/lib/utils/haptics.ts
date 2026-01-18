/**
 * Haptic Feedback Utility
 *
 * Provides cross-device haptic feedback using the Vibration API with graceful fallbacks.
 * Designed for mobile-first TCG pack opening experience.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate
 */

import type { Rarity } from '@/types';

/**
 * Haptic pattern presets for different game events
 */
export enum HapticPattern {
  /** Subtle tap feedback */
  TAP = [10],
  /** Card reveal */
  CARD_REVEAL = [20],
  /** Rare card reveal */
  RARE_REVEAL = [30, 50, 30],
  /** Epic card reveal */
  EPIC_REVEAL = [40, 70, 40, 70, 40],
  /** Legendary card reveal */
  LEGENDARY_REVEAL = [50, 100, 50, 100, 50, 100, 50],
  /** Mythic card reveal (maximum impact) */
  MYTHIC_REVEAL = [100, 150, 100, 150, 100, 150, 100, 150, 100],
  /** Pack tear open */
  PACK_OPEN = [80, 50, 80],
  /** Success feedback */
  SUCCESS = [50, 30, 50],
  /** Error feedback */
  ERROR = [30, 20, 30, 20, 30],
  /** Achievement unlock */
  ACHIEVEMENT = [20, 40, 20, 40, 20, 40, 20],
}

/**
 * Check if vibration API is supported
 * @returns true if device supports haptic feedback
 */
export function isHapticSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'vibrate' in navigator;
}

/**
 * Execute haptic feedback with fallback
 * @param pattern - Vibration pattern in ms (array of [on, off, on, off...])
 * @returns true if vibration was triggered
 */
export function vibrate(pattern: number | number[]): boolean {
  if (!isHapticSupported()) {
    return false;
  }

  try {
    // Navigator.vibrate returns true if the vibration pattern was successfully queued
    return navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if vibration throws (e.g., user gesture required)
    console.warn('Haptic feedback failed:', error);
    return false;
  }
}

/**
 * Vibrate on pack open
 * @returns true if vibration was triggered
 */
export function vibratePackOpen(): boolean {
  return vibrate(HapticPattern.PACK_OPEN);
}

/**
 * Vibrate on card reveal based on rarity
 * @param rarity - Card rarity for pattern selection
 * @returns true if vibration was triggered
 */
export function vibrateCardReveal(rarity: Rarity): boolean {
  // No haptic for common cards (too frequent)
  if (rarity === 'common') {
    return false;
  }

  // Select pattern based on rarity
  switch (rarity) {
    case 'uncommon':
      return vibrate(HapticPattern.CARD_REVEAL);
    case 'rare':
      return vibrate(HapticPattern.RARE_REVEAL);
    case 'epic':
      return vibrate(HapticPattern.EPIC_REVEAL);
    case 'legendary':
      return vibrate(HapticPattern.LEGENDARY_REVEAL);
    case 'mythic':
      return vibrate(HapticPattern.MYTHIC_REVEAL);
    default:
      return false;
  }
}

/**
 * Vibrate for UI interactions (taps, clicks)
 * @returns true if vibration was triggered
 */
export function vibrateTap(): boolean {
  return vibrate(HapticPattern.TAP);
}

/**
 * Vibrate for success events
 * @returns true if vibration was triggered
 */
export function vibrateSuccess(): boolean {
  return vibrate(HapticPattern.SUCCESS);
}

/**
 * Vibrate for error events
 * @returns true if vibration was triggered
 */
export function vibrateError(): boolean {
  return vibrate(HapticPattern.ERROR);
}

/**
 * Vibrate for achievement unlocks
 * @returns true if vibration was triggered
 */
export function vibrateAchievement(): boolean {
  return vibrate(HapticPattern.ACHIEVEMENT);
}

/**
 * Cancel any ongoing vibration
 */
export function cancelVibration(): void {
  if (isHapticSupported()) {
    navigator.vibrate(0);
  }
}

/**
 * Haptic feedback helper object for easy importing
 */
export const haptics = {
  isSupported: isHapticSupported,
  vibrate,
  packOpen: vibratePackOpen,
  cardReveal: vibrateCardReveal,
  tap: vibrateTap,
  success: vibrateSuccess,
  error: vibrateError,
  achievement: vibrateAchievement,
  cancel: cancelVibration,
} as const;
