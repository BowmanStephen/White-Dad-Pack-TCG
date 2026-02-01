/**
 * UI Sound Effects Interface
 *
 * Convenience wrapper for UI interaction sound effects.
 * Delegates to the main audio store in src/stores/audio.ts
 *
 * @fileoverview Provides a clean interface for UI-specific sound effects
 * @module audio/ui-sounds
 */

import { playSound, muted, initAudioContext, masterVolume, sfxVolume } from '../../stores/audio';

/**
 * Play button click sound effect
 * Used for button interactions throughout the app
 */
export function playButtonClick(): void {
  if (muted.get()) return;
  initAudioContext();

  // Create and play button click sound with reduced volume
  const audio = new Audio('/sounds/ui/button-click.mp3');
  
  // Button clicks should be quick and subtle
  const finalVolume = masterVolume.get() * sfxVolume.get() * 0.5;
  audio.volume = Math.max(0, Math.min(1, finalVolume));

  audio.addEventListener('error', () => {
    if (import.meta.env.DEV) console.debug(`Button click sound not found`);
  });

  audio.addEventListener('ended', () => {
    audio.remove();
  });

  audio.play().catch(() => {
    if (import.meta.env.DEV) console.debug(`Button click sound playback prevented`);
  });
}

/**
 * Play navigation whoosh sound effect
 * Used for page transitions and navigation
 */
export function playNavigationWhoosh(): void {
  if (muted.get()) return;
  initAudioContext();

  // Create and play navigation whoosh sound
  const audio = new Audio('/sounds/ui/navigation-whoosh.mp3');

  // Navigation sounds should be noticeable but not overwhelming
  const finalVolume = masterVolume.get() * sfxVolume.get() * 0.6;
  audio.volume = Math.max(0, Math.min(1, finalVolume));

  audio.addEventListener('error', () => {
    if (import.meta.env.DEV) console.debug(`Navigation whoosh sound not found`);
  });

  audio.addEventListener('ended', () => {
    audio.remove();
  });

  audio.play().catch(() => {
    if (import.meta.env.DEV) console.debug(`Navigation whoosh sound playback prevented`);
  });
}

/**
 * Play achievement unlock chime sound effect
 * Used when achievements are unlocked
 */
export function playAchievementChime(): void {
  if (muted.get()) return;
  initAudioContext();

  // Create and play achievement chime sound
  const audio = new Audio('/sounds/ui/achievement-chime.mp3');

  // Achievement chimes should be celebratory and noticeable
  const finalVolume = masterVolume.get() * sfxVolume.get() * 0.9;
  audio.volume = Math.max(0, Math.min(1, finalVolume));

  audio.addEventListener('error', () => {
    if (import.meta.env.DEV) console.debug(`Achievement chime sound not found`);
  });

  audio.addEventListener('ended', () => {
    audio.remove();
  });

  audio.play().catch(() => {
    if (import.meta.env.DEV) console.debug(`Achievement chime sound playback prevented`);
  });
}

/**
 * UI Sound configuration
 */
export const UI_SOUND_CONFIG = {
  /** Whether button click sounds are enabled */
  buttonClickEnabled: true,

  /** Whether navigation sounds are enabled */
  navigationEnabled: true,

  /** Whether achievement sounds are enabled */
  achievementEnabled: true,

  /** Volume multiplier for UI sounds (0.0 to 1.0) */
  volumeMultiplier: 1.0,
} as const;

/**
 * UI sound durations (in seconds)
 * Used for timing visual animations with audio
 */
export const UI_SOUND_DURATIONS = {
  buttonClick: 0.1,     // Quick click sound
  navigationWhoosh: 0.3, // Short whoosh for transitions
  achievementChime: 1.5, // Longer celebratory chime
} as const;

/**
 * Get the button click sound duration
 * @returns Duration in seconds
 */
export function getButtonClickDuration(): number {
  return UI_SOUND_DURATIONS.buttonClick;
}

/**
 * Get the navigation whoosh sound duration
 * @returns Duration in seconds
 */
export function getNavigationWhooshDuration(): number {
  return UI_SOUND_DURATIONS.navigationWhoosh;
}

/**
 * Get the achievement chime sound duration
 * @returns Duration in seconds
 */
export function getAchievementChimeDuration(): number {
  return UI_SOUND_DURATIONS.achievementChime;
}
