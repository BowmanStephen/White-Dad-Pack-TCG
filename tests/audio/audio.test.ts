/**
 * Tests for Audio Store
 *
 * Tests:
 * - Rarity jingle configuration (duration, volume)
 * - Sound caching for instant playback
 * - Master volume control
 * - Mute state persistence
 * - Sound playback functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Rarity } from '../../src/types';
import {
  muted,
  masterVolume,
  RARITY_JINGLE_CONFIG,
  initAudioContext,
  toggleMute,
  setMasterVolume,
  getJingleDuration,
  playSound,
  playPackTear,
  playCardReveal,
  playRarityJingle,
  playCardFlip,
  preloadSounds,
  isAudioAvailable,
  getAudioConfig,
} from '../../src/stores/audio';

// Mock Audio and AudioContext
class MockAudio {
  src: string;
  volume: number;
  preload: string;
  _errored: boolean = false;

  constructor(src: string) {
    this.src = src;
    this.volume = 1.0;
    this.preload = 'auto';
  }

  play(): Promise<void> {
    if (this._errored) {
      return Promise.reject(new Error('Audio play failed'));
    }
    return Promise.resolve();
  }

  addEventListener(event: string, handler: () => void): void {
    if (event === 'error' && this._errored) {
      setTimeout(handler, 0);
    } else if (event === 'ended') {
      setTimeout(handler, 10);
    }
  }

  remove(): void {
    // Mock remove method
  }

  cloneNode(): MockAudio {
    const clone = new MockAudio(this.src);
    clone.volume = this.volume;
    clone.preload = this.preload;
    return clone;
  }
}

class MockAudioContext {
  state: string = 'running';
  resume(): Promise<void> {
    return Promise.resolve();
  }
}

// Setup global mocks
const mockLocalStorage = {
  getItem: vi.fn((key: string) => {
    if (key === 'daddeck_audio_muted') return 'false';
    if (key === 'daddeck_audio_volume') return '0.7';
    return null;
  }),
  setItem: vi.fn(),
};

// Setup before importing modules
(global as any).Audio = MockAudio;
(global as any).AudioContext = MockAudioContext;
(global as any).webkitAudioContext = MockAudioContext;
(global as any).localStorage = mockLocalStorage;

describe('Audio Store', () => {
  beforeEach(() => {
    // Reset stores before each test
    muted.set(false);
    masterVolume.set(0.7);
    vi.clearAllMocks();
  });

  describe('Rarity Jingle Configuration', () => {
    it('should have duration configs for all rarities', () => {
      const durations: Record<Rarity, number> = {
        common: 0.5,
        uncommon: 0.8,
        rare: 1.2,
        epic: 2.0,
        legendary: 3.0,
        mythic: 5.0,
      };

      for (const [rarity, expectedDuration] of Object.entries(durations)) {
        const config = RARITY_JINGLE_CONFIG[rarity as Rarity];
        expect(config).toBeDefined();
        expect(config.duration).toBe(expectedDuration);
        expect(config.volume).toBeGreaterThan(0);
        expect(config.volume).toBeLessThanOrEqual(1);
        expect(config.description).toBeTruthy();
      }
    });

    it('epic jingle should be 2 seconds triumphant fanfare', () => {
      expect(RARITY_JINGLE_CONFIG.epic.duration).toBe(2.0);
      expect(RARITY_JINGLE_CONFIG.epic.volume).toBe(0.8);
      expect(RARITY_JINGLE_CONFIG.epic.description).toContain('Triumphant fanfare');
      expect(RARITY_JINGLE_CONFIG.epic.description).toContain('2 seconds');
    });

    it('legendary jingle should be 3 seconds epic orchestral hit', () => {
      expect(RARITY_JINGLE_CONFIG.legendary.duration).toBe(3.0);
      expect(RARITY_JINGLE_CONFIG.legendary.volume).toBe(0.9);
      expect(RARITY_JINGLE_CONFIG.legendary.description).toContain('Epic orchestral hit');
      expect(RARITY_JINGLE_CONFIG.legendary.description).toContain('3 seconds');
    });

    it('mythic jingle should be 5 seconds full celebration', () => {
      expect(RARITY_JINGLE_CONFIG.mythic.duration).toBe(5.0);
      expect(RARITY_JINGLE_CONFIG.mythic.volume).toBe(1.0);
      expect(RARITY_JINGLE_CONFIG.mythic.description).toContain('Full celebration');
      expect(RARITY_JINGLE_CONFIG.mythic.description).toContain('5 seconds');
    });

    it('volume should scale with rarity (mythic = 1.0, common = 0.5)', () => {
      expect(RARITY_JINGLE_CONFIG.mythic.volume).toBeGreaterThan(RARITY_JINGLE_CONFIG.legendary.volume);
      expect(RARITY_JINGLE_CONFIG.legendary.volume).toBeGreaterThan(RARITY_JINGLE_CONFIG.epic.volume);
      expect(RARITY_JINGLE_CONFIG.epic.volume).toBeGreaterThan(RARITY_JINGLE_CONFIG.rare.volume);
      expect(RARITY_JINGLE_CONFIG.rare.volume).toBeGreaterThan(RARITY_JINGLE_CONFIG.common.volume);
    });
  });

  describe('Jingle Duration Helper', () => {
    it('should return correct duration for each rarity', () => {
      expect(getJingleDuration('common')).toBe(0.5);
      expect(getJingleDuration('uncommon')).toBe(0.8);
      expect(getJingleDuration('rare')).toBe(1.2);
      expect(getJingleDuration('epic')).toBe(2.0);
      expect(getJingleDuration('legendary')).toBe(3.0);
      expect(getJingleDuration('mythic')).toBe(5.0);
    });
  });

  describe('Master Volume Control', () => {
    it('should set master volume', () => {
      setMasterVolume(0.5);
      expect(masterVolume.get()).toBe(0.5);
    });

    it('should clamp volume to 0-1 range', () => {
      setMasterVolume(1.5);
      expect(masterVolume.get()).toBe(1.0);

      setMasterVolume(-0.5);
      expect(masterVolume.get()).toBe(0.0);

      setMasterVolume(0.75);
      expect(masterVolume.get()).toBe(0.75);
    });
  });

  describe('Mute State', () => {
    it('should toggle mute state', () => {
      muted.set(false);
      toggleMute();
      expect(muted.get()).toBe(true);

      toggleMute();
      expect(muted.get()).toBe(false);
    });
  });

  describe('Sound Playback', () => {
    it('should not play sound when muted', () => {
      muted.set(true);
      const audioSpy = vi.spyOn(MockAudio.prototype, 'play');

      playSound('pack_tear');

      expect(audioSpy).not.toHaveBeenCalled();
    });

    it('should play pack tear sound', () => {
      const audioSpy = vi.spyOn(MockAudio.prototype, 'play');

      playPackTear();

      expect(audioSpy).toHaveBeenCalled();
    });

    it('should play card flip sound', () => {
      const audioSpy = vi.spyOn(MockAudio.prototype, 'play');

      playCardFlip();

      expect(audioSpy).toHaveBeenCalled();
    });

    it('should play rarity-specific reveal sounds', () => {
      const audioSpy = vi.spyOn(MockAudio.prototype, 'play');

      playCardReveal('epic');
      playCardReveal('legendary');
      playCardReveal('mythic');

      expect(audioSpy).toHaveBeenCalledTimes(3);
    });

    it('should only play jingles for epic+ cards', () => {
      const audioSpy = vi.spyOn(MockAudio.prototype, 'play');

      // These should not play (below epic)
      playRarityJingle('common');
      playRarityJingle('uncommon');
      playRarityJingle('rare');

      // These should play
      playRarityJingle('epic');
      playRarityJingle('legendary');
      playRarityJingle('mythic');

      expect(audioSpy).toHaveBeenCalledTimes(3);
    });

    it('should apply master volume to sounds', () => {
      masterVolume.set(0.5);
      const audioSpy = vi.spyOn(MockAudio.prototype, 'play').mockImplementation(function (this: MockAudio) {
        // Check that volume is set (master 0.5 × rarity multiplier)
        expect(this.volume).toBeGreaterThan(0);
        expect(this.volume).toBeLessThanOrEqual(1);
        return Promise.resolve();
      });

      playSound('card_reveal', { rarity: 'epic' });

      expect(audioSpy).toHaveBeenCalled();
    });
  });

  describe('Sound Caching', () => {
    it('should preload all common sounds', () => {
      // This function should not throw
      expect(() => preloadSounds()).not.toThrow();
    });
  });

  describe('Audio Config', () => {
    it('should return current audio configuration', () => {
      muted.set(false);
      masterVolume.set(0.7);

      const config = getAudioConfig();

      expect(config).toMatchObject({
        muted: false,
        masterVolume: 0.7,
      });
      expect(config.cacheSize).toEqual(expect.any(Number));
      expect(config.musicVolume).toEqual(expect.any(Number));
      expect(config.sfxVolume).toEqual(expect.any(Number));
    });
  });

  describe('Audio Availability', () => {
    it('should report audio available when not muted', () => {
      muted.set(false);
      // isAudioAvailable checks both muted and Audio existence
      // Since Audio is mocked, it should be available
      expect(isAudioAvailable()).toBe(true);
    });

    it('should report audio unavailable when muted', () => {
      muted.set(true);
      expect(isAudioAvailable()).toBe(false);
    });
  });

  describe('Audio Context Initialization', () => {
    it('should initialize audio context', () => {
      expect(() => initAudioContext()).not.toThrow();
    });
  });

  describe('Sound Layering', () => {
    it('should support layerable option in playSound', () => {
      const audioSpy = vi.spyOn(MockAudio.prototype, 'play');

      playSound('jingle', {
        rarity: 'epic',
        layerable: true,
      });

      expect(audioSpy).toHaveBeenCalled();
    });

    it('should support custom volume override', () => {
      const audioSpy = vi.spyOn(MockAudio.prototype, 'play').mockImplementation(function (this: MockAudio) {
        // Volume should be affected by custom override
        expect(this.volume).toBeGreaterThan(0);
        return Promise.resolve();
      });

      playSound('card_reveal', {
        rarity: 'legendary',
        volume: 0.5,
      });

      expect(audioSpy).toHaveBeenCalled();
    });
  });
});
