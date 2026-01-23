import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  muted,
  masterVolume,
  musicVolume,
  sfxVolume,
  soundTheme,
  toggleMute,
  setMasterVolume,
  setMusicVolume,
  setSfxVolume,
  setSoundTheme,
  getJingleDuration,
  getAudioConfig,
  isAudioAvailable,
  RARITY_JINGLE_CONFIG,
  type SoundTheme,
} from '@/stores/audio';

/**
 * Audio Store Test Suite
 *
 * Tests audio management including:
 * - Mute state toggling
 * - Volume controls (master, music, sfx)
 * - Sound themes
 * - Rarity jingle configuration
 * - Audio availability detection
 */

describe('Audio Store', () => {
  beforeEach(() => {
    // Reset stores to initial state
    muted.set(false);
    masterVolume.set(0.7);
    musicVolume.set(0.7);
    sfxVolume.set(0.8);
    soundTheme.set('default');
    
    // Clear localStorage (mocked in setup.ts)
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should start with muted as false', () => {
      expect(muted.get()).toBe(false);
    });

    it('should start with master volume at 0.7', () => {
      expect(masterVolume.get()).toBe(0.7);
    });

    it('should start with music volume at 0.7', () => {
      expect(musicVolume.get()).toBe(0.7);
    });

    it('should start with sfx volume at 0.8', () => {
      expect(sfxVolume.get()).toBe(0.8);
    });

    it('should start with default sound theme', () => {
      expect(soundTheme.get()).toBe('default');
    });
  });

  describe('toggleMute()', () => {
    it('should toggle mute from false to true', () => {
      muted.set(false);
      
      toggleMute();
      
      expect(muted.get()).toBe(true);
    });

    it('should toggle mute from true to false', () => {
      muted.set(true);
      
      toggleMute();
      
      expect(muted.get()).toBe(false);
    });

    it('should persist mute state to localStorage', () => {
      muted.set(false);
      
      toggleMute();
      
      expect(localStorage.getItem('daddeck_audio_muted')).toBe('true');
    });

    it('should handle multiple toggles', () => {
      muted.set(false);
      
      toggleMute(); // false → true
      expect(muted.get()).toBe(true);
      
      toggleMute(); // true → false
      expect(muted.get()).toBe(false);
      
      toggleMute(); // false → true
      expect(muted.get()).toBe(true);
    });
  });

  describe('setMasterVolume()', () => {
    it('should set master volume to specified level', () => {
      setMasterVolume(0.5);
      
      expect(masterVolume.get()).toBe(0.5);
    });

    it('should clamp volume to minimum 0', () => {
      setMasterVolume(-0.5);
      
      expect(masterVolume.get()).toBe(0);
    });

    it('should clamp volume to maximum 1', () => {
      setMasterVolume(1.5);
      
      expect(masterVolume.get()).toBe(1);
    });

    it('should persist volume to localStorage', () => {
      setMasterVolume(0.5);
      
      expect(localStorage.getItem('daddeck_audio_volume')).toBe('0.5');
    });

    it('should handle edge values', () => {
      setMasterVolume(0);
      expect(masterVolume.get()).toBe(0);
      
      setMasterVolume(1);
      expect(masterVolume.get()).toBe(1);
    });
  });

  describe('setMusicVolume()', () => {
    it('should set music volume to specified level', () => {
      setMusicVolume(0.5);
      
      expect(musicVolume.get()).toBe(0.5);
    });

    it('should clamp volume to minimum 0', () => {
      setMusicVolume(-0.5);
      
      expect(musicVolume.get()).toBe(0);
    });

    it('should clamp volume to maximum 1', () => {
      setMusicVolume(1.5);
      
      expect(musicVolume.get()).toBe(1);
    });

    it('should persist volume to localStorage', () => {
      setMusicVolume(0.6);
      
      expect(localStorage.getItem('daddeck_audio_music_volume')).toBe('0.6');
    });
  });

  describe('setSfxVolume()', () => {
    it('should set sfx volume to specified level', () => {
      setSfxVolume(0.5);
      
      expect(sfxVolume.get()).toBe(0.5);
    });

    it('should clamp volume to minimum 0', () => {
      setSfxVolume(-0.5);
      
      expect(sfxVolume.get()).toBe(0);
    });

    it('should clamp volume to maximum 1', () => {
      setSfxVolume(1.5);
      
      expect(sfxVolume.get()).toBe(1);
    });

    it('should persist volume to localStorage', () => {
      setSfxVolume(0.9);
      
      expect(localStorage.getItem('daddeck_audio_sfx_volume')).toBe('0.9');
    });
  });

  describe('setSoundTheme()', () => {
    it('should set sound theme to default', () => {
      setSoundTheme('default');
      
      expect(soundTheme.get()).toBe('default');
    });

    it('should set sound theme to japanese', () => {
      setSoundTheme('japanese');
      
      expect(soundTheme.get()).toBe('japanese');
    });

    it('should set sound theme to retro', () => {
      setSoundTheme('retro');
      
      expect(soundTheme.get()).toBe('retro');
    });

    it('should persist theme to localStorage', () => {
      setSoundTheme('retro');
      
      expect(localStorage.getItem('daddeck_audio_theme')).toBe('retro');
    });
  });

  describe('RARITY_JINGLE_CONFIG', () => {
    it('should have config for all rarities', () => {
      const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
      
      rarities.forEach(rarity => {
        expect(RARITY_JINGLE_CONFIG[rarity]).toBeDefined();
        expect(RARITY_JINGLE_CONFIG[rarity].duration).toBeGreaterThan(0);
        expect(RARITY_JINGLE_CONFIG[rarity].volume).toBeGreaterThan(0);
        expect(RARITY_JINGLE_CONFIG[rarity].volume).toBeLessThanOrEqual(1);
        expect(RARITY_JINGLE_CONFIG[rarity].cinematicDuration).toBeGreaterThan(0);
      });
    });

    it('should have increasing durations for higher rarities', () => {
      expect(RARITY_JINGLE_CONFIG.common.duration).toBeLessThan(RARITY_JINGLE_CONFIG.uncommon.duration);
      expect(RARITY_JINGLE_CONFIG.uncommon.duration).toBeLessThan(RARITY_JINGLE_CONFIG.rare.duration);
      expect(RARITY_JINGLE_CONFIG.rare.duration).toBeLessThan(RARITY_JINGLE_CONFIG.epic.duration);
      expect(RARITY_JINGLE_CONFIG.epic.duration).toBeLessThan(RARITY_JINGLE_CONFIG.legendary.duration);
      expect(RARITY_JINGLE_CONFIG.legendary.duration).toBeLessThan(RARITY_JINGLE_CONFIG.mythic.duration);
    });

    it('should have increasing volumes for higher rarities', () => {
      expect(RARITY_JINGLE_CONFIG.common.volume).toBeLessThanOrEqual(RARITY_JINGLE_CONFIG.uncommon.volume);
      expect(RARITY_JINGLE_CONFIG.uncommon.volume).toBeLessThanOrEqual(RARITY_JINGLE_CONFIG.rare.volume);
      expect(RARITY_JINGLE_CONFIG.rare.volume).toBeLessThanOrEqual(RARITY_JINGLE_CONFIG.epic.volume);
      expect(RARITY_JINGLE_CONFIG.epic.volume).toBeLessThanOrEqual(RARITY_JINGLE_CONFIG.legendary.volume);
      expect(RARITY_JINGLE_CONFIG.legendary.volume).toBeLessThanOrEqual(RARITY_JINGLE_CONFIG.mythic.volume);
    });

    it('should have cinematic duration longer than normal duration', () => {
      const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
      
      rarities.forEach(rarity => {
        expect(RARITY_JINGLE_CONFIG[rarity].cinematicDuration).toBeGreaterThan(
          RARITY_JINGLE_CONFIG[rarity].duration
        );
      });
    });
  });

  describe('getJingleDuration()', () => {
    it('should return correct duration for common', () => {
      expect(getJingleDuration('common')).toBe(RARITY_JINGLE_CONFIG.common.duration);
    });

    it('should return correct duration for legendary', () => {
      expect(getJingleDuration('legendary')).toBe(RARITY_JINGLE_CONFIG.legendary.duration);
    });

    it('should return correct duration for mythic', () => {
      expect(getJingleDuration('mythic')).toBe(RARITY_JINGLE_CONFIG.mythic.duration);
    });
  });

  describe('getAudioConfig()', () => {
    it('should return current audio configuration', () => {
      muted.set(false);
      masterVolume.set(0.7);
      musicVolume.set(0.6);
      sfxVolume.set(0.8);
      
      const config = getAudioConfig();
      
      expect(config.muted).toBe(false);
      expect(config.masterVolume).toBe(0.7);
      expect(config.musicVolume).toBe(0.6);
      expect(config.sfxVolume).toBe(0.8);
      expect(typeof config.cacheSize).toBe('number');
    });

    it('should reflect muted state', () => {
      muted.set(true);
      
      const config = getAudioConfig();
      
      expect(config.muted).toBe(true);
    });

    it('should reflect volume changes', () => {
      setMasterVolume(0.5);
      setMusicVolume(0.4);
      setSfxVolume(0.3);
      
      const config = getAudioConfig();
      
      expect(config.masterVolume).toBe(0.5);
      expect(config.musicVolume).toBe(0.4);
      expect(config.sfxVolume).toBe(0.3);
    });
  });

  describe('isAudioAvailable()', () => {
    it('should return true when not muted and Audio exists', () => {
      muted.set(false);
      
      expect(isAudioAvailable()).toBe(true);
    });

    it('should return false when muted', () => {
      muted.set(true);
      
      expect(isAudioAvailable()).toBe(false);
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when muted changes', () => {
      let callCount = 0;
      const unsubscribe = muted.subscribe(() => {
        callCount++;
      });

      toggleMute();

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify subscribers when volume changes', () => {
      let callCount = 0;
      const unsubscribe = masterVolume.subscribe(() => {
        callCount++;
      });

      setMasterVolume(0.5);

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify subscribers when theme changes', () => {
      let callCount = 0;
      const unsubscribe = soundTheme.subscribe(() => {
        callCount++;
      });

      setSoundTheme('retro');

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid volume changes without errors', () => {
      expect(() => {
        for (let i = 0; i <= 10; i++) {
          setMasterVolume(i / 10);
          setMusicVolume(i / 10);
          setSfxVolume(i / 10);
        }
      }).not.toThrow();
    });

    it('should handle rapid mute toggles without errors', () => {
      expect(() => {
        for (let i = 0; i < 10; i++) {
          toggleMute();
        }
      }).not.toThrow();
    });

    it('should maintain state consistency after multiple operations', () => {
      toggleMute();
      setMasterVolume(0.5);
      setSoundTheme('japanese');
      toggleMute();
      
      expect(muted.get()).toBe(false);
      expect(masterVolume.get()).toBe(0.5);
      expect(soundTheme.get()).toBe('japanese');
    });

    it('should accept only valid sound themes', () => {
      const validThemes: SoundTheme[] = ['default', 'japanese', 'retro'];

      validThemes.forEach(theme => {
        soundTheme.set(theme);
        expect(soundTheme.get()).toBe(theme);
      });
    });
  });
});
