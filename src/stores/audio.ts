import { atom } from 'nanostores';
import type { Rarity } from '../types';

/**
 * Audio Store - Manages sound effects and mute state
 */

// Mute state - persists to localStorage
const MUTED_KEY = 'daddeck_audio_muted';
const initialMuted = typeof window !== 'undefined'
  ? localStorage.getItem(MUTED_KEY) === 'true'
  : false;

export const muted = atom<boolean>(initialMuted);

// Audio context for iOS compatibility (created on first user interaction)
let audioContext: AudioContext | null = null;

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
  if (typeof window !== 'undefined') {
    localStorage.setItem(MUTED_KEY, String(newMuted));
  }

  // Initialize audio context on first unmute
  if (!newMuted) {
    initAudioContext();
  }
}

/**
 * Play a sound effect
 * @param soundType - Type of sound to play
 * @param rarity - Optional rarity for sound variation
 */
export function playSound(soundType: 'pack_tear' | 'card_reveal' | 'card_flip', rarity?: Rarity): void {
  // Don't play if muted
  if (muted.get()) return;

  // Initialize audio context if needed
  initAudioContext();

  // Build sound path based on type and rarity
  let soundPath = '/sounds/';

  switch (soundType) {
    case 'pack_tear':
      soundPath += 'pack-tear.mp3';
      break;
    case 'card_reveal':
      // Rarity-based reveal sounds for rare+ cards
      if (rarity && ['rare', 'epic', 'legendary', 'mythic'].includes(rarity)) {
        soundPath += `reveal-${rarity}.mp3`;
      } else {
        soundPath += 'reveal-common.mp3';
      }
      break;
    case 'card_flip':
      soundPath += 'card-flip.mp3';
      break;
  }

  // Play the sound
  const audio = new Audio(soundPath);

  // Set volume based on rarity (mythic gets extra boost)
  const volume = rarity === 'mythic' ? 0.8 : 0.6;
  audio.volume = volume;

  // Handle errors gracefully (missing files, etc.)
  audio.addEventListener('error', () => {
    // Silent fail - sound is optional enhancement
    console.debug(`Sound not found: ${soundPath}`);
  });

  // Play the sound
  audio.play().catch(() => {
    // Silent fail - autoplay prevention, etc.
    console.debug(`Sound playback prevented: ${soundPath}`);
  });
}

/**
 * Play pack tear sound
 */
export function playPackTear(): void {
  playSound('pack_tear');
}

/**
 * Play card reveal sound based on rarity
 */
export function playCardReveal(rarity: Rarity): void {
  playSound('card_reveal', rarity);
}

/**
 * Play card flip sound
 */
export function playCardFlip(): void {
  playSound('card_flip');
}

/**
 * Check if audio is available
 */
export function isAudioAvailable(): boolean {
  return !muted.get() && typeof Audio !== 'undefined';
}
