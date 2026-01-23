import { atom } from 'nanostores';
import { isLowEndDevice } from '../lib/utils/performance';
import { trackEvent } from './analytics';
import type { CinematicMode, CinematicConfig } from '../types';
import { onBrowser } from '@/lib/utils/browser';

// Animation Quality Settings
export type AnimationQuality = 'auto' | 'high' | 'medium' | 'low';
export type ParticlePreset = 'low' | 'medium' | 'high' | 'ultra';

const QUALITY_KEY = 'daddeck_animation_quality';
const PARTICLE_PRESET_KEY = 'daddeck_particle_preset';
const SCREEN_SHAKE_KEY = 'daddeck_screen_shake_enabled';
const CINEMATIC_MODE_KEY = 'daddeck_cinematic_mode';
const SKIP_ANIMATIONS_KEY = 'daddeck_skip_animations';
const FAST_FORWARD_KEY = 'daddeck_fast_forward';
const PARTICLE_INTENSITY_KEY = 'daddeck_particle_intensity';

// Cinematic mode configuration (US083 - Pack Opening - Cinematic Mode)
const CINEMATIC_CONFIGS: Record<CinematicMode, CinematicConfig> = {
  normal: {
    speedMultiplier: 1.0,
    particleMultiplier: 1.0,
    zoomEnabled: false,
    audioEnhanced: false,
  },
  cinematic: {
    speedMultiplier: 0.5,   // 2x slower animations
    particleMultiplier: 2.0, // 2x more particles
    zoomEnabled: true,       // Camera zoom on reveal
    audioEnhanced: true,     // Enhanced dramatic audio
  },
};

// Modal open time tracking
let modalOpenTime: Record<string, number> = {};

/**
 * Get value from localStorage, with optional validation
 */
function getStoredValue<T extends string>(
  key: string,
  defaultValue: T | null,
  validator?: (value: string) => value is T
): T | null {
  if (typeof window === 'undefined') return defaultValue;

  const saved = localStorage.getItem(key);
  if (saved === null) return defaultValue;

  if (validator) {
    return validator(saved) ? (saved as T) : defaultValue;
  }

  return saved as T;
}

/**
 * Get boolean from localStorage with default fallback
 */
function getStoredBoolean(key: string, defaultValue: boolean): boolean {
  const saved = getStoredValue(key, null);
  return saved === null ? defaultValue : saved === 'true';
}

// Initialize quality from localStorage or auto-detect
const getInitialQuality = (): AnimationQuality => {
  const saved = getStoredValue<AnimationQuality>(
    QUALITY_KEY,
    null,
    (value): value is AnimationQuality => ['auto', 'high', 'medium', 'low'].includes(value)
  );
  return saved ?? 'auto';
};

export const $animationQuality = atom<AnimationQuality>(getInitialQuality());

// Export without $ prefix for imports
export const animationQuality = $animationQuality;

/**
 * Get the particle multiplier based on current quality setting
 * @returns Multiplier (1.0 = full, 0.5 = half, 0.2 = minimal)
 */
export function getParticleMultiplier(): number {
  const quality = $animationQuality.get();

  if (quality === 'auto') {
    // Auto-detect based on device capabilities
    return isLowEndDevice() ? 0.5 : 1.0;
  }

  switch (quality) {
    case 'high':
      return 1.0;
    case 'medium':
      return 0.5;
    case 'low':
      return 0.2;
    default:
      return 1.0;
  }
}

/**
 * Set animation quality
 * @param quality - Quality level to set
 */
export function setAnimationQuality(quality: AnimationQuality): void {
  $animationQuality.set(quality);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(QUALITY_KEY, quality);
  });
}

/**
 * Get the effective quality (resolves 'auto' to actual quality)
 * @returns Effective quality level
 */
export function getEffectiveQuality(): 'high' | 'medium' | 'low' {
  const quality = $animationQuality.get();

  if (quality === 'auto') {
    return isLowEndDevice() ? 'medium' : 'high';
  }

  return quality as 'high' | 'medium' | 'low';
}

// Whether reduced motion is preferred
export const $prefersReducedMotion = atom<boolean>(false);

// Whether the device supports touch
export const $isTouchDevice = atom<boolean>(false);

// Whether the device has gyroscope (for holo effects)
export const $hasGyroscope = atom<boolean>(false);

// Current mouse/touch position for holo effects
export const $pointerPosition = atom<{ x: number; y: number }>({ x: 0.5, y: 0.5 });

// Device orientation for gyro-based holo effects
export const $deviceOrientation = atom<{ alpha: number; beta: number; gamma: number }>({
  alpha: 0,
  beta: 0,
  gamma: 0,
});

// Modal state
export const $modalOpen = atom<string | null>(null);

// Toast notifications
export const $toasts = atom<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' | 'achievement' }>>([]);

// Screen shake enabled state
export const $screenShakeEnabled = atom<boolean>(getStoredBoolean(SCREEN_SHAKE_KEY, true));
export const screenShakeEnabled = $screenShakeEnabled;

/**
 * Set screen shake enabled state
 */
export function setScreenShakeEnabled(enabled: boolean): void {
  $screenShakeEnabled.set(enabled);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(SCREEN_SHAKE_KEY, String(enabled));
  });
}

/**
 * Toggle screen shake enabled state
 */
export function toggleScreenShake(): void {
  const current = $screenShakeEnabled.get();
  setScreenShakeEnabled(!current);
}

// ============================================================================
// CINEMATIC MODE (US083 - Pack Opening - Cinematic Mode)
// ============================================================================

// Cinematic mode enabled state
const getInitialCinematicMode = (): CinematicMode => {
  const saved = getStoredValue<CinematicMode>(
    CINEMATIC_MODE_KEY,
    null,
    (value): value is CinematicMode => value === 'cinematic' || value === 'normal'
  );
  return saved ?? 'normal';
};

export const $cinematicMode = atom<CinematicMode>(getInitialCinematicMode());
export const cinematicMode = $cinematicMode;

/**
 * Get the current cinematic configuration
 */
export function getCinematicConfig(): CinematicConfig {
  const mode = $cinematicMode.get();
  return CINEMATIC_CONFIGS[mode];
}

// ============================================================================
// PACK ANIMATION SETTINGS (PACK-028 - Skip/Fast-Forward)
// ============================================================================

// Skip animations enabled state
export const $skipAnimations = atom<boolean>(getStoredBoolean(SKIP_ANIMATIONS_KEY, false));
export const skipAnimations = $skipAnimations;

// Fast forward (2x speed) enabled state
export const $fastForward = atom<boolean>(getStoredBoolean(FAST_FORWARD_KEY, false));
export const fastForward = $fastForward;

/**
 * Set skip animations preference
 */
export function setSkipAnimations(enabled: boolean): void {
  $skipAnimations.set(enabled);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(SKIP_ANIMATIONS_KEY, String(enabled));
  });

  // Track setting change
  trackEvent({
    type: 'settings_change',
    data: {
      setting: 'skipAnimations',
      previousValue: !$skipAnimations.get(),
      newValue: enabled,
    },
  });
}

/**
 * Toggle skip animations preference
 */
export function toggleSkipAnimations(): void {
  const current = $skipAnimations.get();
  setSkipAnimations(!current);
}

/**
 * Set fast forward preference
 */
export function setFastForward(enabled: boolean): void {
  $fastForward.set(enabled);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(FAST_FORWARD_KEY, String(enabled));
  });

  // Track setting change
  trackEvent({
    type: 'settings_change',
    data: {
      setting: 'fastForward',
      previousValue: !$fastForward.get(),
      newValue: enabled,
    },
  });
}

/**
 * Toggle fast forward preference
 */
export function toggleFastForward(): void {
  const current = $fastForward.get();
  setFastForward(!current);
}

/**
 * Set cinematic mode
 */
export function setCinematicMode(mode: CinematicMode): void {
  $cinematicMode.set(mode);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(CINEMATIC_MODE_KEY, mode);
  });

  // Track mode change
  trackEvent({
    type: 'settings_change',
    data: {
      setting: 'cinematicMode',
      previousValue: $cinematicMode.get() === 'cinematic' ? 'normal' : 'cinematic',
      newValue: mode,
    },
  });
}

/**
 * Toggle cinematic mode
 */
export function toggleCinematicMode(): void {
  const current = $cinematicMode.get();
  setCinematicMode(current === 'cinematic' ? 'normal' : 'cinematic');
}

// ============================================================================
// PARTICLE PRESET SYSTEM (PACK-VFX-030)
// ============================================================================

/**
 * Particle preset configuration
 * Each preset controls both particle count and screen shake
 */
export const PARTICLE_PRESETS: Record<ParticlePreset, {
  particleMultiplier: number;
  screenShakeEnabled: boolean;
  description: string;
}> = {
  low: {
    particleMultiplier: 0.5,    // 50% particles
    screenShakeEnabled: false,  // No screen shake
    description: 'Minimal particles, no screen shake - best performance',
  },
  medium: {
    particleMultiplier: 0.75,   // 75% particles
    screenShakeEnabled: false,  // No screen shake (reduced effects)
    description: 'Balanced particles, reduced effects for smoother performance',
  },
  high: {
    particleMultiplier: 1.0,    // 100% particles
    screenShakeEnabled: true,   // All effects enabled (default)
    description: 'Full particle effects with screen shake - the complete experience',
  },
  ultra: {
    particleMultiplier: 1.5,    // 150% particles
    screenShakeEnabled: true,   // Maximum drama
    description: 'Maximum particle intensity with all effects for epic reveals',
  },
};

// Particle preset state
const getInitialParticlePreset = (): ParticlePreset => {
  const saved = getStoredValue<ParticlePreset>(
    PARTICLE_PRESET_KEY,
    null,
    (value): value is ParticlePreset => ['low', 'medium', 'high', 'ultra'].includes(value as ParticlePreset)
  );
  return saved ?? 'medium'; // Use 'medium' as default for better performance on most devices
};

export const $particlePreset = atom<ParticlePreset>(getInitialParticlePreset());
export const particlePreset = $particlePreset;

/**
 * Get the particle preset configuration
 */
export function getParticlePresetConfig() {
  const preset = $particlePreset.get();
  return PARTICLE_PRESETS[preset];
}

/**
 * Set particle preset
 * @param preset - Preset to apply
 */
export function setParticlePreset(preset: ParticlePreset): void {
  $particlePreset.set(preset);

  // Apply preset settings
  const config = PARTICLE_PRESETS[preset];

  // Update screen shake based on preset
  setScreenShakeEnabled(config.screenShakeEnabled);

  // Update particle intensity slider to match preset
  // Map preset multiplier to intensity slider (1-5 scale)
  const intensityMap: Record<ParticlePreset, number> = {
    low: 1,      // 0.5x → minimal
    medium: 2,    // 0.75x → low
    high: 3,      // 1.0x → normal
    ultra: 5,     // 1.5x → maximum
  };
  setParticleIntensity(intensityMap[preset]);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(PARTICLE_PRESET_KEY, preset);
  });

  // Track preset change
  trackEvent({
    type: 'settings_change',
    data: {
      setting: 'particlePreset',
      previousValue: $particlePreset.get(),
      newValue: preset,
    },
  });
}

/**
 * Get the combined particle multiplier from preset
 * This overrides the base particle intensity when preset is active
 */
export function getParticlePresetMultiplier(): number {
  const config = getParticlePresetConfig();
  return config.particleMultiplier;
}

// ============================================================================
// PARTICLE INTENSITY (PACK-VFX-029)
// ============================================================================

// Particle intensity: 1-5 scale (1=minimal, 3=normal, 5=maximum)
const getInitialParticleIntensity = (): number => {
  const saved = getStoredValue(PARTICLE_INTENSITY_KEY, null);
  if (saved === null) return 3; // Default to normal

  const intensity = parseInt(saved, 10);
  return isNaN(intensity) || intensity < 1 || intensity > 5 ? 3 : intensity;
};

export const $particleIntensity = atom<number>(getInitialParticleIntensity());
export const particleIntensity = $particleIntensity;

/**
 * Get the particle intensity multiplier based on user setting
 * @returns Multiplier (0.2 = minimal, 1.0 = normal, 2.0 = maximum)
 */
export function getParticleIntensityMultiplier(): number {
  const intensity = $particleIntensity.get();

  // Scale 1-5 to 0.2-2.0 multiplier
  // 1 = 0.2 (20% of normal)
  // 2 = 0.6 (60% of normal)
  // 3 = 1.0 (100% - normal)
  // 4 = 1.5 (150% of normal)
  // 5 = 2.0 (200% of normal)
  return intensity === 1 ? 0.2 : intensity === 2 ? 0.6 : intensity === 3 ? 1.0 : intensity === 4 ? 1.5 : 2.0;
}

/**
 * Set particle intensity
 * @param intensity - Intensity level (1-5)
 */
export function setParticleIntensity(intensity: number): void {
  // Validate intensity is between 1 and 5
  const validatedIntensity = Math.max(1, Math.min(5, intensity));
  $particleIntensity.set(validatedIntensity);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(PARTICLE_INTENSITY_KEY, String(validatedIntensity));
  });

  // Track setting change
  trackEvent({
    type: 'settings_change',
    data: {
      setting: 'particleIntensity',
      previousValue: $particleIntensity.get(),
      newValue: validatedIntensity,
    },
  });
}

// Export stores without $ prefix for imports
// The $ prefix versions above are used in Svelte templates
export const modalOpen = $modalOpen;
export const prefersReducedMotion = $prefersReducedMotion;
export const isTouchDevice = $isTouchDevice;
export const hasGyroscope = $hasGyroscope;
export const pointerPosition = $pointerPosition;
export const deviceOrientation = $deviceOrientation;
export const toasts = $toasts;

// Audio exports - re-export from audio store for convenience
export {
  muted as audioMuted,
  masterVolume,
  musicVolume,
  sfxVolume,
  toggleMute,
  setMasterVolume,
  setMusicVolume,
  setSfxVolume,
  playPackTear,
  playCardReveal,
  playCardFlip,
  isAudioAvailable
} from './audio';

/**
 * Initialize UI state based on browser capabilities
 */
export function initializeUI(): void {
  if (typeof window === 'undefined') return;
  
  // Check for reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  $prefersReducedMotion.set(mediaQuery.matches);
  mediaQuery.addEventListener('change', (e) => {
    $prefersReducedMotion.set(e.matches);
  });
  
  // Check for touch device
  $isTouchDevice.set('ontouchstart' in window || navigator.maxTouchPoints > 0);
  
  // Check for gyroscope
  if (window.DeviceOrientationEvent) {
    // Request permission on iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // Will need to request permission on user interaction
      $hasGyroscope.set(false);
    } else {
      $hasGyroscope.set(true);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
  }
}

/**
 * Request gyroscope permission (iOS 13+)
 */
export async function requestGyroscopePermission(): Promise<boolean> {
  if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
    return true;
  }
  
  try {
    const permission = await (DeviceOrientationEvent as any).requestPermission();
    if (permission === 'granted') {
      $hasGyroscope.set(true);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      return true;
    }
  } catch (error) {
    console.error('Gyroscope permission denied:', error);
  }
  
  return false;
}

/**
 * Handle device orientation changes
 */
function handleDeviceOrientation(event: DeviceOrientationEvent): void {
  $deviceOrientation.set({
    alpha: event.alpha ?? 0,
    beta: event.beta ?? 0,
    gamma: event.gamma ?? 0,
  });
}

/**
 * Update pointer position (normalized 0-1)
 */
export function updatePointerPosition(x: number, y: number): void {
  $pointerPosition.set({ x, y });
}

/**
 * Show a toast notification
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' | 'achievement' = 'info'): void {
  const id = Math.random().toString(36).substring(2, 9);
  const currentToasts = $toasts.get();
  $toasts.set([...currentToasts, { id, message, type }]);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    removeToast(id);
  }, 3000);
}

/**
 * Remove a toast notification
 */
export function removeToast(id: string): void {
  const currentToasts = $toasts.get();
  $toasts.set(currentToasts.filter((t) => t.id !== id));
}

/**
 * Open a modal
 */
export function openModal(modalId: string, trigger: 'click' | 'keyboard' = 'click'): void {
  $modalOpen.set(modalId);

  // Track modal open event
  trackEvent({
    type: 'modal_open',
    data: {
      modalType: modalId as 'card_inspection' | 'share' | 'settings',
      trigger,
    },
  });

  // Record modal open time for duration tracking
  modalOpenTime[modalId] = Date.now();
}

/**
 * Close the current modal
 */
export function closeModal(): void {
  const currentModal = $modalOpen.get();

  // Track modal close event with duration
  if (currentModal && modalOpenTime[currentModal]) {
    const duration = Date.now() - modalOpenTime[currentModal];
    trackEvent({
      type: 'modal_close',
      data: {
        modalType: currentModal as 'card_inspection' | 'share' | 'settings',
        duration,
      },
    });
    delete modalOpenTime[currentModal];
  }

  $modalOpen.set(null);
}
