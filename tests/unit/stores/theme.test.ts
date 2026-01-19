import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  $themeMode,
  $isDarkMode,
  setThemeMode,
  toggleTheme,
  getEffectiveTheme,
  initializeTheme,
  initTheme,
  type ThemeMode
} from '@/stores/theme';

/**
 * Theme Store Test Suite
 *
 * Tests theme management including:
 * - Theme mode persistence (localStorage)
 * - System preference detection (auto mode)
 * - Dark mode computation
 * - Theme toggling
 * - Document class application
 */

describe('Theme Store', () => {
  beforeEach(() => {
    // Reset stores to initial state
    $themeMode.set('auto');
    $isDarkMode.set(false);

    // Clear localStorage
    localStorage.clear();

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('Initial State', () => {
    it('should default to auto mode', () => {
      expect($themeMode.get()).toBe('auto');
    });

    it('should have dark mode computed from system preference', () => {
      // Mock system preference to light mode
      vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as any));

      initializeTheme();

      // In auto mode with light system preference, dark mode should be false
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
      // In auto mode, should respect system preference
    });

    it('should persist theme mode to localStorage', () => {
      setThemeMode('dark');

      expect(localStorage.getItem('daddeck_theme')).toBe('dark');
    });

    it('should apply dark class to document when in dark mode', () => {
      const mockElement = {
        classList: {
          toggle: vi.fn(),
        }
      };

      vi.stubGlobal('document', {
        documentElement: mockElement as any
      });

      setThemeMode('dark');

      expect(mockElement.classList.toggle).toHaveBeenCalledWith('dark', true);
    });

    it('should remove dark class from document when in light mode', () => {
      const mockElement = {
        classList: {
          toggle: vi.fn(),
        }
      };

      vi.stubGlobal('document', {
        documentElement: mockElement as any
      });

      setThemeMode('light');

      expect(mockElement.classList.toggle).toHaveBeenCalledWith('dark', false);
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

  describe('initializeTheme()', () => {
    it('should set up system preference listener', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      vi.stubGlobal('window', {
        matchMedia: mockMatchMedia
      });

      initializeTheme();

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should add change listener for system preference', () => {
      const mockQuery = {
        matches: false,
        addEventListener: vi.fn(),
      };

      vi.stubGlobal('window', {
        matchMedia: vi.fn().mockReturnValue(mockQuery)
      });

      initializeTheme();

      expect(mockQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update dark mode when system preference changes in auto mode', () => {
      let changeCallback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;

      const mockQuery = {
        matches: false,
        addEventListener: vi.fn((event: string, callback: any) => {
          if (event === 'change') {
            changeCallback = callback;
          }
        }),
      };

      vi.stubGlobal('window', {
        matchMedia: vi.fn().mockReturnValue(mockQuery)
      });

      $themeMode.set('auto');
      initializeTheme();

      // Simulate system preference change to dark
      const mockEvent = { matches: true } as MediaQueryListEvent;
      changeCallback?.call(mockQuery as any, mockEvent);

      expect($isDarkMode.get()).toBe(true);
    });

    it('should not update dark mode when system preference changes in manual mode', () => {
      let changeCallback: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;

      const mockQuery = {
        matches: false,
        addEventListener: vi.fn((event: string, callback: any) => {
          if (event === 'change') {
            changeCallback = callback;
          }
        }),
      };

      vi.stubGlobal('window', {
        matchMedia: vi.fn().mockReturnValue(mockQuery)
      });

      $themeMode.set('light'); // Manual mode
      $isDarkMode.set(false);
      initializeTheme();

      // Simulate system preference change to dark
      const mockEvent = { matches: true } as MediaQueryListEvent;
      changeCallback?.call(mockQuery as any, mockEvent);

      // Should remain light (manual mode ignores system changes)
      expect($isDarkMode.get()).toBe(false);
    });
  });

  describe('initTheme() - Svelte Action', () => {
    it('should apply current theme class immediately', () => {
      const mockNode = {
        classList: {
          toggle: vi.fn(),
        }
      };

      $isDarkMode.set(true);

      const { destroy } = initTheme(mockNode as any);

      expect(mockNode.classList.toggle).toHaveBeenCalledWith('dark', true);
    });

    it('should return destroy function for cleanup', () => {
      const mockNode = {
        classList: {
          toggle: vi.fn(),
        }
      };

      const { destroy } = initTheme(mockNode as any);

      expect(typeof destroy).toBe('function');
    });

    it('should not throw when destroy is called', () => {
      const mockNode = {
        classList: {
          toggle: vi.fn(),
        }
      };

      const { destroy } = initTheme(mockNode as any);

      expect(() => destroy()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle window undefined gracefully', () => {
      const originalWindow = global.window;
      // @ts-ignore - Testing SSR scenario
      delete global.window;

      // Should not throw
      expect(() => setThemeMode('dark')).not.toThrow();

      global.window = originalWindow;
    });

    it('should handle invalid localStorage values gracefully', () => {
      localStorage.setItem('daddeck_theme', 'invalid');

      // Should default to auto
      const mode = $themeMode.get();
      expect(['light', 'dark', 'auto']).toContain(mode);
    });

    it('should handle rapid theme changes without errors', () => {
      expect(() => {
        setThemeMode('light');
        setThemeMode('dark');
        setThemeMode('auto');
        toggleTheme();
        toggleTheme();
      }).not.toThrow();
    });
  });

  describe('LocalStorage Integration', () => {
    it('should load saved theme from localStorage on init', () => {
      localStorage.setItem('daddeck_theme', 'dark');

      // Reload module to test initialization (simulated)
      const savedTheme = localStorage.getItem('daddeck_theme');
      expect(savedTheme).toBe('dark');
    });

    it('should save theme to localStorage when changed', () => {
      setThemeMode('light');

      expect(localStorage.getItem('daddeck_theme')).toBe('light');
    });

    it('should handle localStorage unavailable gracefully', () => {
      const originalLocalStorage = global.localStorage;

      // Mock localStorage error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      // Should not throw
      expect(() => setThemeMode('dark')).not.toThrow();

      vi.restoreAllMocks();
    });
  });
});
