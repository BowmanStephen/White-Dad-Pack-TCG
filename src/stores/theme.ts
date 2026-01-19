import { atom } from 'nanostores';
import { onMount } from 'svelte';
import { onBrowser } from '@/lib/utils/browser';

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'auto';

// LocalStorage key
const THEME_KEY = 'daddeck_theme';

// Get initial theme from localStorage or system preference
function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';

  const saved = localStorage.getItem(THEME_KEY);
  if (saved && ['light', 'dark', 'auto'].includes(saved)) {
    return saved as ThemeMode;
  }

  return 'auto'; // Default to system preference
}

// Theme mode store
export const $themeMode = atom<ThemeMode>(getInitialTheme());
export const themeMode = $themeMode;

// Computed dark mode state (derived from theme mode + system preference)
export const $isDarkMode = atom<boolean>(false);
export const isDarkMode = $isDarkMode;

// Media query for system preference
let darkModeQuery: MediaQueryList | null = null;

/**
 * Check system color scheme preference
 */
function getSystemDarkMode(): boolean {
  if (typeof window === 'undefined') return false;

  if (!darkModeQuery) {
    darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }

  return darkModeQuery.matches;
}

/**
 * Update dark mode state based on current theme mode and system preference
 */
function updateDarkModeState(): void {
  const mode = $themeMode.get();

  if (mode === 'auto') {
    $isDarkMode.set(getSystemDarkMode());
  } else {
    $isDarkMode.set(mode === 'dark');
  }

  // Apply class to document for CSS
  onBrowser(() => {
    const isDark = $isDarkMode.get();
    document.documentElement.classList.toggle('dark', isDark);
  });
}

/**
 * Set theme mode
 */
export function setThemeMode(mode: ThemeMode): void {
  $themeMode.set(mode);

  // Persist to localStorage
  onBrowser(() => {
    localStorage.setItem(THEME_KEY, mode);
  });

  updateDarkModeState();
}

/**
 * Toggle between light and dark (cycling through auto if needed)
 */
export function toggleTheme(): void {
  const current = $themeMode.get();
  const isDark = $isDarkMode.get();

  // If currently dark, go to light. If light, go to dark.
  // If auto, toggle based on current computed state.
  if (current === 'auto') {
    setThemeMode(isDark ? 'light' : 'dark');
  } else if (current === 'dark') {
    setThemeMode('light');
  } else {
    setThemeMode('dark');
  }
}

/**
 * Get the effective theme (resolves 'auto' to actual theme)
 */
export function getEffectiveTheme(): 'light' | 'dark' {
  return $isDarkMode.get() ? 'dark' : 'light';
}

/**
 * Initialize theme system
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return;

  // Set up system preference listener
  darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // Listen for system theme changes
  darkModeQuery.addEventListener('change', () => {
    // Only update if in auto mode
    if ($themeMode.get() === 'auto') {
      updateDarkModeState();
    }
  });

  // Initialize dark mode state
  updateDarkModeState();
}

// Initialize theme when module loads
if (typeof window !== 'undefined') {
  initializeTheme();
}

/**
 * Svelte action to initialize theme on mount
 * Use this in root components to ensure theme is applied
 */
export function initTheme(node: HTMLElement) {
  // Apply current theme class immediately
  updateDarkModeState();

  return {
    destroy() {
      // Clean up listeners if needed
    }
  };
}
