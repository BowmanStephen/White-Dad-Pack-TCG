import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  $themeMode,
  $isDarkMode,
  setThemeMode,
  toggleTheme,
  getEffectiveTheme,
  type ThemeMode
} from '@/stores/theme';

/**
 * Theme Store Test Suite
 *
 * Tests theme store logic (without DOM dependencies)
 */

describe('Theme Store', () => {
  beforeEach(() => {
    // Reset stores to initial state
    $themeMode.set('auto');
    $isDarkMode.set(false);
  });

  describe('Initial State', () => {
    it('should default to auto mode', () => {
      expect($themeMode.get()).toBe('auto');
    });

    it('should have dark mode computed from theme mode', () => {
      expect($isDarkMode.get()).toBe(false);
    });
  });

  describe('setThemeMode()', () => {
    it('should set theme mode to light', () => {
      setThemeMode('light');

      expect($themeMode.get()).toBe('light');
      expect($isDarkMode.get()).toBe(false);
    });

    it('should set theme mode to dark', () => {
      setThemeMode('dark');

      expect($themeMode.get()).toBe('dark');
      expect($isDarkMode.get()).toBe(true);
    });

    it('should set theme mode to auto', () => {
      setThemeMode('auto');

      expect($themeMode.get()).toBe('auto');
    });
  });

  describe('toggleTheme()', () => {
    it('should toggle from light to dark', () => {
      $themeMode.set('light');
      $isDarkMode.set(false);

      toggleTheme();

      expect($themeMode.get()).toBe('dark');
      expect($isDarkMode.get()).toBe(true);
    });

    it('should toggle from dark to light', () => {
      $themeMode.set('dark');
      $isDarkMode.set(true);

      toggleTheme();

      expect($themeMode.get()).toBe('light');
      expect($isDarkMode.get()).toBe(false);
    });

    it('should toggle from auto to dark when system is light', () => {
      $themeMode.set('auto');
      $isDarkMode.set(false); // System is light

      toggleTheme();

      expect($themeMode.get()).toBe('dark');
      expect($isDarkMode.get()).toBe(true);
    });

    it('should toggle from auto to light when system is dark', () => {
      $themeMode.set('auto');
      $isDarkMode.set(true); // System is dark

      toggleTheme();

      expect($themeMode.get()).toBe('light');
      expect($isDarkMode.get()).toBe(false);
    });
  });

  describe('getEffectiveTheme()', () => {
    it('should return dark when dark mode is active', () => {
      $isDarkMode.set(true);

      expect(getEffectiveTheme()).toBe('dark');
    });

    it('should return light when light mode is active', () => {
      $isDarkMode.set(false);

      expect(getEffectiveTheme()).toBe('light');
    });

    it('should return light in auto mode when system is light', () => {
      $themeMode.set('auto');
      $isDarkMode.set(false);

      expect(getEffectiveTheme()).toBe('light');
    });

    it('should return dark in auto mode when system is dark', () => {
      $themeMode.set('auto');
      $isDarkMode.set(true);

      expect(getEffectiveTheme()).toBe('dark');
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when theme mode changes', () => {
      let callCount = 0;
      const unsubscribe = $themeMode.subscribe(() => {
        callCount++;
      });

      setThemeMode('dark');

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify subscribers when dark mode changes', () => {
      let callCount = 0;
      const unsubscribe = $isDarkMode.subscribe(() => {
        callCount++;
      });

      setThemeMode('dark');

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme changes without errors', () => {
      expect(() => {
        setThemeMode('light');
        setThemeMode('dark');
        setThemeMode('auto');
        toggleTheme();
        toggleTheme();
      }).not.toThrow();
    });

    it('should maintain theme state across multiple operations', () => {
      setThemeMode('dark');
      expect($themeMode.get()).toBe('dark');

      toggleTheme();
      expect($themeMode.get()).toBe('light');

      setThemeMode('auto');
      expect($themeMode.get()).toBe('auto');
    });
  });

  describe('Theme Mode Values', () => {
    it('should accept valid theme modes', () => {
      expect(() => setThemeMode('light')).not.toThrow();
      expect(() => setThemeMode('dark')).not.toThrow();
      expect(() => setThemeMode('auto')).not.toThrow();
    });

    it('should only allow valid theme modes', () => {
      const validModes: ThemeMode[] = ['light', 'dark', 'auto'];

      validModes.forEach(mode => {
        $themeMode.set(mode);
        expect($themeMode.get()).toBe(mode);
      });
    });
  });
});
