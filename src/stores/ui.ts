import { atom } from 'nanostores';
import { isLowEndDevice } from '../lib/utils/performance';

// Animation Quality Settings
export type AnimationQuality = 'auto' | 'high' | 'medium' | 'low';

const QUALITY_KEY = 'daddeck_animation_quality';

// Initialize quality from localStorage or auto-detect
const getInitialQuality = (): AnimationQuality => {
  if (typeof window === 'undefined') return 'auto';

  const saved = localStorage.getItem(QUALITY_KEY);
  if (saved && ['auto', 'high', 'medium', 'low'].includes(saved)) {
    return saved as AnimationQuality;
  }

  return 'auto'; // Default to auto-detect
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
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUALITY_KEY, quality);
  }
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
export const $toasts = atom<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

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
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
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
export function openModal(modalId: string): void {
  $modalOpen.set(modalId);
}

/**
 * Close the current modal
 */
export function closeModal(): void {
  $modalOpen.set(null);
}
