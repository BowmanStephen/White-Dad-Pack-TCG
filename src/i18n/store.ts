/**
 * i18n Store - Locale State Management Stub
 * 
 * Minimal implementation for locale state management.
 * When full i18n is implemented, this will manage locale switching
 * and translation loading.
 */

import { atom } from 'nanostores';

export type Locale = 'en' | 'es';

// Available locales
const AVAILABLE_LOCALES: Locale[] = ['en'];

// Locale names for display
const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

// Current locale store
export const locale = atom<Locale>('en');

/**
 * Set the current locale
 */
export function setLocale(newLocale: Locale): void {
  if (AVAILABLE_LOCALES.includes(newLocale)) {
    locale.set(newLocale);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('daddeck-locale', newLocale);
    }
  }
}

/**
 * Change locale (alias for setLocale)
 */
export function changeLocale(newLocale: Locale): void {
  setLocale(newLocale);
}

/**
 * Get the display name for a locale
 */
export function getLocaleName(localeCode: Locale): string {
  return LOCALE_NAMES[localeCode] || localeCode;
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): Locale[] {
  return [...AVAILABLE_LOCALES];
}

/**
 * Get the current locale value
 */
export function getCurrentLocale(): Locale {
  return locale.get();
}

/**
 * Initialize locale from localStorage or browser settings
 */
export function initLocale(): void {
  if (typeof window === 'undefined') return;
  
  // Try localStorage first
  const saved = localStorage.getItem('daddeck-locale') as Locale | null;
  if (saved && AVAILABLE_LOCALES.includes(saved)) {
    locale.set(saved);
    return;
  }
  
  // Try browser language
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (AVAILABLE_LOCALES.includes(browserLang)) {
    locale.set(browserLang);
  }
}
