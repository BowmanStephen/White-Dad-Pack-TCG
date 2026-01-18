/**
 * i18n Store - Nanostores integration for internationalization
 *
 * This provides reactive locale state for Svelte components.
 */

import { atom } from 'nanostores';
import type { Locale } from './index';
import { t, setLocale, getLocale, detectLocale, getAvailableLocales, getLocaleName } from './index';

// Reactive locale state
export const locale = atom<Locale>('en');

// Initialize locale from browser/localStorage on client
if (typeof window !== 'undefined') {
  detectLocale().then((detectedLocale) => {
    setLocale(detectedLocale);
    locale.set(detectedLocale);
  });
}

/**
 * Change the current locale and update the store
 */
export function changeLocale(newLocale: Locale): void {
  setLocale(newLocale);
  locale.set(newLocale);
}

/**
 * Get the current locale from the store
 */
export function getCurrentLocale(): Locale {
  return locale.get();
}

/**
 * Get available locales
 */
export { getAvailableLocales };

/**
 * Get locale display name
 */
export { getLocaleName };

/**
 * Translation function (re-exported for convenience)
 */
export { t };

// Re-export types
export type { Locale } from './index';
