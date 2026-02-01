/**
 * Centralized Pack Configuration (Phase 1: Configuration Centralization)
 *
 * This file consolidates all magic numbers and configuration constants
 * related to pack opening, animations, and persistence. It serves as the
 * single source of truth for these values across the codebase.
 */

// ============================================================================
// ANIMATION TIMINGS
// ============================================================================

/**
 * Base phase durations for pack animation (in milliseconds)
 *
 * These values are multiplied by tear animation config modifiers
 * to create variation between animation types (standard, slow-mo, explosive).
 *
 * Total animation time: ~1.4s (optimized from 2.8s original)
 */
export const ANIMATION_TIMINGS = {
  /** Pack appears with scale animation */
  APPEAR_MS: 200,
  /** Glow intensifies - shows swipe hint */
  GLOW_MS: 400,
  /** Tear animation - the main event */
  TEAR_MS: 600,
  /** Final burst and fade */
  BURST_MS: 200,
  /** Quick reveal flash duration before showing results */
  QUICK_REVEAL_FLASH_MS: 300,
  /** Failsafe timeout to prevent stuck animations */
  FAILSAFE_TIMEOUT_MS: 10000,
  /** Cinematic mode tear duration (fixed value) */
  CINEMATIC_TEAR_MS: 1800,
  /** Auto-reveal delay between cards */
  AUTO_REVEAL_DELAY_MS: 300,
} as const;

// ============================================================================
// SWIPE-TO-TEAR GESTURE CONFIG
// ============================================================================

/**
 * Configuration for the swipe-to-tear gesture on pack opening
 */
export const TEAR_GESTURE_CONFIG = {
  /** Pixels to drag for complete tear */
  THRESHOLD_PX: 200,
  /** Percentage of drag (0-1) needed to complete tear */
  COMPLETE_PERCENTAGE: 0.7,
  /** Progress threshold to trigger tear phase visual feedback */
  VISUAL_FEEDBACK_THRESHOLD: 0.3,
} as const;

// ============================================================================
// SAVE RETRY CONFIG
// ============================================================================

/**
 * Configuration for IndexedDB save retry logic with exponential backoff
 *
 * When saving a pack to collection fails, we retry up to MAX_ATTEMPTS times
 * with exponential backoff delays: 100ms, 200ms, 400ms
 */
export const SAVE_RETRY_CONFIG = {
  /** Maximum number of save attempts before falling back to memory */
  MAX_ATTEMPTS: 3,
  /** Base delay between retries (doubles each attempt) */
  BASE_DELAY_MS: 100,
} as const;

// ============================================================================
// PITY SYSTEM THRESHOLDS
// ============================================================================

/**
 * Pity system thresholds for bad luck protection
 *
 * After opening N consecutive packs without pulling a card of rarity X or higher,
 * the next pack is guaranteed to contain at least one card of rarity X.
 *
 * Design rationale:
 * - Rare: 10 packs ensures players see rare cards regularly
 * - Epic: 30 packs (3x rare) for meaningful epic pulls
 * - Legendary: 60 packs (6x rare) makes legendary feel earned
 * - Mythic: 100 packs makes mythic truly special while preventing infinite drought
 */
export const PITY_THRESHOLDS = {
  /** Guaranteed rare after 10 packs without rare+ */
  RARE: 10,
  /** Guaranteed epic after 30 packs without epic+ */
  EPIC: 30,
  /** Guaranteed legendary after 60 packs without legendary+ */
  LEGENDARY: 60,
  /** Guaranteed mythic after 100 packs without mythic */
  MYTHIC: 100,
} as const;

// ============================================================================
// PACK GENERATION TIMING
// ============================================================================

/**
 * Pack generation UX timing configuration
 *
 * Even though pack generation is fast, we add a minimum delay for smooth UX
 * to prevent jarring instant transitions.
 */
export const PACK_GENERATION_CONFIG = {
  /** Target minimum time for pack generation (for UX smoothness) */
  TARGET_DELAY_MS: 200,
  /** Maximum delay cap to prevent excessive waiting */
  MAX_DELAY_MS: 500,
  /** Timeout for pack generation (fail if exceeded) */
  TIMEOUT_MS: 8000,
  /** Timeout for collection initialization */
  COLLECTION_INIT_TIMEOUT_MS: 2000,
} as const;

// ============================================================================
// HAPTIC FEEDBACK PATTERNS
// ============================================================================

/**
 * Vibration patterns for haptic feedback (in milliseconds)
 *
 * Pattern format: [vibrate, pause, vibrate, pause, ...]
 */
export const HAPTIC_PATTERNS = {
  /** Standard feedback for pack tear */
  PACK_TEAR: [50],
  /** Double-buzz for epic cards */
  EPIC_REVEAL: [30, 20, 30],
  /** Celebration pattern for legendary+ cards */
  LEGENDARY_REVEAL: [50, 30, 100, 30, 50],
} as const;

// ============================================================================
// LEGENDARY+ ANIMATION MODIFIERS
// ============================================================================

/**
 * Special animation modifiers for high-rarity cards
 *
 * Legendary and mythic cards get extended animations for dramatic effect.
 */
export const RARITY_ANIMATION_MODIFIERS = {
  /** Tear duration multiplier for legendary+ cards */
  LEGENDARY_TEAR_MULTIPLIER: 1.5,
} as const;

// ============================================================================
// TYPE EXPORTS FOR EXTERNAL USE
// ============================================================================

export type AnimationTimings = typeof ANIMATION_TIMINGS;
export type TearGestureConfig = typeof TEAR_GESTURE_CONFIG;
export type SaveRetryConfig = typeof SAVE_RETRY_CONFIG;
export type PityThresholds = typeof PITY_THRESHOLDS;
export type PackGenerationConfig = typeof PACK_GENERATION_CONFIG;
export type HapticPatterns = typeof HAPTIC_PATTERNS;
export type RarityAnimationModifiers = typeof RARITY_ANIMATION_MODIFIERS;
