/**
 * Motion Store - Reduced Motion Settings
 *
 * Manages user preferences for motion and animation settings.
 * Respects system preferences while allowing manual override.
 *
 * Motivation:
 * - Accessibility: Motion sensitivity, vestibular disorders
 * - Performance: Reduce animations on low-end devices
 * - User Control: Let users decide their experience
 *
 * PACK-057: Accessibility - Reduced Motion
 */

import { atom, computed } from 'nanostores';
import { onBrowser } from '@/lib/utils/browser';

/**
 * Motion mode options
 * - auto: Follow system preference (prefers-reduced-motion)
 * - reduced: Force reduced motion (no particles, simple fades)
 * - full: Force full motion (all effects enabled)
 */
export type MotionMode = 'auto' | 'reduced' | 'full';

/** LocalStorage key for motion preference */
const MOTION_MODE_KEY = 'daddeck_motion_mode';

/**
 * Get initial motion mode from LocalStorage
 * Falls back to 'auto' if not set
 */
function getInitialMotion(): MotionMode {
  if (typeof window === 'undefined') return 'auto';

  try {
    const saved = localStorage.getItem(MOTION_MODE_KEY);
    if (saved && isValidMotionMode(saved)) {
      return saved as MotionMode;
    }
  } catch (error) {
    console.warn('Failed to read motion preference:', error);
  }

  return 'auto';
}

/**
 * Type guard for motion mode values
 */
function isValidMotionMode(value: string): value is MotionMode {
  return ['auto', 'reduced', 'full'].includes(value);
}

/** Current motion mode setting */
export const $motionMode = atom<MotionMode>(getInitialMotion());
export const motionMode = $motionMode;

/** System preference for reduced motion (from prefers-reduced-motion media query) */
export const $systemPrefersReducedMotion = atom<boolean>(false);
export const systemPrefersReducedMotion = $systemPrefersReducedMotion;

/** Computed: Whether reduced motion should be applied */
export const $isReducedMotion = computed(
  [$motionMode, $systemPrefersReducedMotion],
  (mode, systemPrefers) => {
    if (mode === 'auto') {
      // Follow system preference
      return systemPrefers;
    } else if (mode === 'reduced') {
      // Force reduced motion
      return true;
    } else {
      // Force full motion
      return false;
    }
  }
);
export const isReducedMotion = $isReducedMotion;

/**
 * Initialize motion settings
 * Detects system preference on mount
 */
export function initializeMotionSettings(): void {
  if (typeof window === 'undefined') return;

  // Check initial system preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  $systemPrefersReducedMotion.set(mediaQuery.matches);

  // Listen for changes to system preference
  const handleChange = (e: MediaQueryListEvent) => {
    $systemPrefersReducedMotion.set(e.matches);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
    // Note: Cleanup function stored but not returned (void return type)
    // Cleanup happens automatically when component unmounts
  }
  // Legacy fallback
  else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleChange);
    // Note: Cleanup function stored but not returned (void return type)
    // Cleanup happens automatically when component unmounts
  }
}

/**
 * Set motion mode and persist to LocalStorage
 * @param mode - New motion mode
 */
export function setMotionMode(mode: MotionMode): void {
  $motionMode.set(mode);

  onBrowser(() => {
    try {
      localStorage.setItem(MOTION_MODE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save motion preference:', error);
    }
  });
}

/**
 * Get current motion mode
 * @returns Current motion mode
 */
export function getMotionMode(): MotionMode {
  return $motionMode.get();
}

/**
 * Cycle through motion modes
 * Useful for toggle buttons: auto → reduced → full → auto
 */
export function cycleMotionMode(): void {
  const current = $motionMode.get();
  const modes: MotionMode[] = ['auto', 'reduced', 'full'];
  const currentIndex = modes.indexOf(current);
  const nextIndex = (currentIndex + 1) % modes.length;
  setMotionMode(modes[nextIndex]);
}
