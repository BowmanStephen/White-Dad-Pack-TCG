import { atom } from 'nanostores';
import type { Rarity } from '../types';
import { onBrowser } from '@/lib/utils/browser';

/**
 * Audio Store - Manages sound effects and mute state
 *
 * Features:
 * - Rarity-specific jingles with configurable durations
 * - Sound caching for instant playback
 * - Layered audio support (jingles over ambient)
 * - Master volume control
 * - iOS/Android compatibility via AudioContext
 */

// Mute state - persists to localStorage
const MUTED_KEY = 'daddeck_audio_muted';
const VOLUME_KEY = 'daddeck_audio_volume';
const MUSIC_VOLUME_KEY = 'daddeck_audio_music_volume';
const SFX_VOLUME_KEY = 'daddeck_audio_sfx_volume';
const SOUND_THEME_KEY = 'daddeck_audio_theme';

export type SoundTheme = 'default' | 'japanese' | 'retro';

const initialSoundTheme = typeof window !== 'undefined'
  ? (localStorage.getItem(SOUND_THEME_KEY) as SoundTheme) || 'default'
  : 'default';

const initialMuted = typeof window !== 'undefined'
  ? localStorage.getItem(MUTED_KEY) === 'true'
  : false;

const initialVolume = typeof window !== 'undefined'
  ? parseFloat(localStorage.getItem(VOLUME_KEY) || '0.7')
  : 0.7;

const initialMusicVolume = typeof window !== 'undefined'
  ? parseFloat(localStorage.getItem(MUSIC_VOLUME_KEY) || '0.7')
  : 0.7;

const initialSfxVolume = typeof window !== 'undefined'
  ? parseFloat(localStorage.getItem(SFX_VOLUME_KEY) || '0.8')
  : 0.8;

export const muted = atom<boolean>(initialMuted);
export const masterVolume = atom<number>(initialVolume);
export const musicVolume = atom<number>(initialMusicVolume);
export const sfxVolume = atom<number>(initialSfxVolume);
export const soundTheme = atom<SoundTheme>(initialSoundTheme);

/**
 * Set sound theme (default, japanese, retro)
 */
export function setSoundTheme(theme: SoundTheme): void {
  soundTheme.set(theme);
  onBrowser(() => {
    localStorage.setItem(SOUND_THEME_KEY, theme);
  });
  // Clear sound cache to reload with new theme
  soundCache.clear();
  preloadSounds();
}

// Audio context for iOS compatibility (created on first user interaction)
let audioContext: AudioContext | null = null;

/**
 * Rarity jingle configuration
 * Defines duration and volume for each rarity's reveal sound
 * Enhanced durations for cinematic mode (US083)
 */
export const RARITY_JINGLE_CONFIG: Record<Rarity, {
  duration: number;      // Duration in seconds
  volume: number;        // Volume multiplier (applied to master)
  description: string;   // Description of the jingle
  cinematicDuration: number; // Extended duration for cinematic mode
}> = {
  common: {
    duration: 0.5,
    volume: 0.5,
    description: 'Quick card flip sound',
    cinematicDuration: 0.75,
  },
  uncommon: {
    duration: 0.8,
    volume: 0.6,
    description: 'Standard reveal with slight flourish',
    cinematicDuration: 1.2,
  },
  rare: {
    duration: 1.2,
    volume: 0.7,
    description: 'Enhanced reveal sound',
    cinematicDuration: 2.0,
  },
  epic: {
    duration: 2.0,
    volume: 0.8,
    description: 'Triumphant fanfare (2 seconds)',
    cinematicDuration: 3.5,
  },
  legendary: {
    duration: 3.0,
    volume: 0.9,
    description: 'Epic orchestral hit (3 seconds)',
    cinematicDuration: 5.0,
  },
  mythic: {
    duration: 5.0,
    volume: 1.0,
    description: 'Full celebration sequence (5 seconds)',
    cinematicDuration: 8.0,
  },
};

/**
 * Sound cache for instant playback
 * Preloads and caches Audio objects to avoid network latency
 */
const soundCache = new Map<string, HTMLAudioElement>();

/**
 * Preload a sound into cache
 * @param soundPath - Path to the sound file
 */
function preloadSound(soundPath: string): HTMLAudioElement {
  if (soundCache.has(soundPath)) {
    return soundCache.get(soundPath)!;
  }

  const audio = new Audio(soundPath);
  audio.preload = 'auto'; // Eagerly load the sound
  soundCache.set(soundPath, audio);
  return audio;
}

/**
 * Get or create a cached audio element
 * Clones the audio to allow overlapping playback
 */
function getCachedAudio(soundPath: string): HTMLAudioElement {
  const cached = preloadSound(soundPath);
  return cached.cloneNode(true) as HTMLAudioElement;
}

/**
 * Initialize audio context (required for iOS/Android)
 * Must be called after user interaction
 */
export function initAudioContext(): void {
  if (typeof window === 'undefined') return;

  if (!audioContext) {
    // Use standard AudioContext with fallback
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }

  // Resume context if suspended (iOS requirement)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

/**
 * Toggle mute state
 */
export function toggleMute(): void {
  const currentMuted = muted.get();
  const newMuted = !currentMuted;
  muted.set(newMuted);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(MUTED_KEY, String(newMuted));
  });

  // Initialize audio context on first unmute
  if (!newMuted) {
    initAudioContext();
  }
}

/**
 * Set master volume
 * @param volume - Volume level (0.0 to 1.0)
 */
export function setMasterVolume(volume: number): void {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  masterVolume.set(clampedVolume);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(VOLUME_KEY, String(clampedVolume));
  });
}

/**
 * Set music volume
 * @param volume - Volume level (0.0 to 1.0)
 */
export function setMusicVolume(volume: number): void {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  musicVolume.set(clampedVolume);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(MUSIC_VOLUME_KEY, String(clampedVolume));
  });
}

/**
 * Set sound effects volume
 * @param volume - Volume level (0.0 to 1.0)
 */
export function setSfxVolume(volume: number): void {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  sfxVolume.set(clampedVolume);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(SFX_VOLUME_KEY, String(clampedVolume));
  });
}

/**
 * Get the jingle duration for a rarity
 * @param rarity - Card rarity
 */
export function getJingleDuration(rarity: Rarity): number {
  return RARITY_JINGLE_CONFIG[rarity].duration;
}

/**
 * Play a sound effect with optional layering
 * @param soundType - Type of sound to play
 * @param options - Playback options
 */
export function playSound(
  soundType: 'pack_tear' | 'card_reveal' | 'card_flip' | 'jingle',
  options?: {
    rarity?: Rarity;
    layerable?: boolean;  // Allow this sound to play over others
    volume?: number;      // Custom volume override
  }
): void {
  // Don't play if muted
  if (muted.get()) return;

  // Initialize audio context if needed
  initAudioContext();

  // Build sound path based on type, rarity, and theme
  const currentTheme = soundTheme.get();
  const themePath = currentTheme === 'default' ? '' : `${currentTheme}/`;
  let soundPath = `/sounds/${themePath}`;
  let targetRarity: Rarity = 'common';

  switch (soundType) {
    case 'pack_tear':
      soundPath += 'pack-tear.mp3';
      break;
    case 'card_reveal':
    case 'jingle':
      targetRarity = options?.rarity || 'common';
      // Use rarity-specific reveal sounds
      if (targetRarity && ['rare', 'epic', 'legendary', 'mythic'].includes(targetRarity)) {
        soundPath += `reveal-${targetRarity}.mp3`;
      } else {
        soundPath += 'reveal-common.mp3';
      }
      break;
    case 'card_flip':
      soundPath += 'card-flip.mp3';
      break;
  }

  // Get or create audio element (uses cache)
  const audio = getCachedAudio(soundPath);

  // Calculate volume: master volume × sfx volume × rarity multiplier × custom override
  const rarityMultiplier = RARITY_JINGLE_CONFIG[targetRarity].volume;
  const customVolume = options?.volume ?? 1.0;
  const finalVolume = masterVolume.get() * sfxVolume.get() * rarityMultiplier * customVolume;
  audio.volume = Math.max(0, Math.min(1, finalVolume));

  // Handle errors gracefully (missing files, etc.)
  audio.addEventListener('error', () => {
    console.debug(`Sound not found: ${soundPath}`);
  });

  // Clean up after playback to free memory
  audio.addEventListener('ended', () => {
    audio.remove();
  });

  // Play the sound
  audio.play().catch(() => {
    console.debug(`Sound playback prevented: ${soundPath}`);
  });
}

/**
 * Play pack tear sound
 * Enhanced for cinematic mode (US083)
 */
export function playPackTear(): void {
  playSound('pack_tear');
}

/**
 * Play card reveal sound based on rarity
 * Enhanced for cinematic mode (US083)
 */
export function playCardReveal(rarity: Rarity, cinematicMode: boolean = false): void {
  playSound('card_reveal', { rarity });
}

/**
 * Play cinematic card reveal sound (extended duration)
 * Only used when cinematic mode is enabled (US083)
 */
export function playCinematicCardReveal(rarity: Rarity): void {
  // In cinematic mode, play both the standard reveal AND a layered jingle
  // This creates a more dramatic, layered audio experience
  playSound('card_reveal', { rarity });

  // For rare+ cards, add the jingle layer
  if (['rare', 'epic', 'legendary', 'mythic'].includes(rarity)) {
    playSound('jingle', {
      rarity,
      layerable: true,
      volume: 0.3, // Lower volume for the layered jingle
    });
  }
}

/**
 * Play a rarity jingle (for epic+ cards)
 * Jingles are longer and more elaborate than standard reveals
 */
export function playRarityJingle(rarity: Rarity): void {
  // Only play special jingles for epic+ cards
  if (!['epic', 'legendary', 'mythic'].includes(rarity)) {
    return;
  }

  playSound('jingle', {
    rarity,
    layerable: true,  // Jingles can layer over ambient sounds
  });
}

/**
 * PACK-025: Play new discovery sound ("ding!" for first-time pull)
 * Special celebratory sound when discovering a card for the first time
 */
export function playNewDiscoverySound(): void {
  if (muted.get()) return;
  initAudioContext();

  // Use the reveal-rare sound as the "ding!" effect
  // It's celebratory but not too long
  const soundPath = '/sounds/reveal-rare.mp3';
  const audio = getCachedAudio(soundPath);

  // Slightly higher volume for discovery celebration
  const finalVolume = masterVolume.get() * sfxVolume.get() * 0.9;
  audio.volume = Math.max(0, Math.min(1, finalVolume));

  audio.addEventListener('error', () => {
    console.debug(`Discovery sound not found: ${soundPath}`);
  });

  audio.addEventListener('ended', () => {
    audio.remove();
  });

  audio.play().catch(() => {
    console.debug(`Discovery sound playback prevented: ${soundPath}`);
  });
}

/**
 * Play card flip sound
 */
export function playCardFlip(): void {
  playSound('card_flip');
}

/**
 * Preload all common sounds into cache
 * Call this during app initialization for instant playback
 */
export function preloadSounds(): void {
  const soundsToPreload = [
    'pack-tear.mp3',
    'reveal-common.mp3',
    'reveal-uncommon.mp3',
    'reveal-rare.mp3',
    'reveal-epic.mp3',
    'reveal-legendary.mp3',
    'reveal-mythic.mp3',
    'card-flip.mp3',
  ];

  soundsToPreload.forEach(sound => {
    preloadSound(`/sounds/${sound}`);
  });
}

/**
 * Check if audio is available
 */
export function isAudioAvailable(): boolean {
  return !muted.get() && typeof Audio !== 'undefined';
}

/**
 * Get current audio configuration
 */
export function getAudioConfig(): {
  muted: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  cacheSize: number;
} {
  return {
    muted: muted.get(),
    masterVolume: masterVolume.get(),
    musicVolume: musicVolume.get(),
    sfxVolume: sfxVolume.get(),
    cacheSize: soundCache.size,
  };
}
