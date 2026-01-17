/**
 * i18n Configuration and Utilities
 * Internationalization system for DadDeck™
 */

import { atom, map } from 'nanostores';

// Supported languages
export type SupportedLocale = 'en' | 'es' | 'fr' | 'de';

export const LOCALES: Record<SupportedLocale, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  de: { name: 'German', nativeName: 'Deutsch' },
};

// RTL languages (for future expansion)
export const RTL_LOCALES: SupportedLocale[] = [];

// Current locale store (persisted in localStorage)
export const localeStore = atom<SupportedLocale>('en');

// Initialize locale from localStorage or browser detection
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('daddeck-locale') as SupportedLocale;
  if (saved && LOCALES[saved]) {
    localeStore.set(saved);
  } else {
    // Detect from browser
    const browserLang = navigator.language.split('-')[0] as SupportedLocale;
    if (LOCALES[browserLang]) {
      localeStore.set(browserLang);
    }
  }
}

// Persist locale changes
localeStore.subscribe((locale) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('daddeck-locale', locale);
    document.documentElement.lang = locale;

    // Update RTL attribute
    const isRTL = RTL_LOCALES.includes(locale);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }
});

// Translation cache
let translations: Record<string, Record<string, string>> = {};

/**
 * Load translations for a specific locale
 */
export async function loadTranslations(locale: SupportedLocale): Promise<Record<string, string>> {
  if (translations[locale]) {
    return translations[locale];
  }

  try {
    const module = await import(`./locales/${locale}.json`);
    translations[locale] = module.default;
    return module.default;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // Fall back to English
    if (locale !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
}

/**
 * Get a translation string by key
 * Supports nested keys with dot notation (e.g., 'ui.open_pack')
 */
export function t(key: string, locale?: SupportedLocale): string {
  const currentLocale = locale || localeStore.get();
  const dict = translations[currentLocale];

  if (!dict) {
    return key; // Return key if translations not loaded
  }

  // Support nested keys with dot notation
  const value = key.split('.').reduce((obj, k) => obj?.[k], dict as any);

  if (value === undefined || value === null) {
    // Fall back to English if key not found
    if (currentLocale !== 'en' && translations['en']) {
      const fallback = key.split('.').reduce((obj, k) => obj?.[k], translations['en'] as any);
      return fallback || key;
    }
    return key;
  }

  return value;
}

/**
 * Reactive translation helper for Svelte components
 */
export function useTranslations() {
  return {
    t: (key: string) => t(key),
    locale: localeStore.get(),
    setLocale: (locale: SupportedLocale) => {
      localeStore.set(locale);
      loadTranslations(locale);
    },
  };
}

// Initialize with English translations
loadTranslations('en');
