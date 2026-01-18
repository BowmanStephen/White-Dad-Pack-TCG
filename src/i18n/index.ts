/**
 * i18n (Internationalization) Configuration and Utilities
 *
 * This module provides translation support for DadDeck™.
 *
 * Supported Languages:
 * - English (en) - Default
 * - Spanish (es)
 *
 * Usage:
 * ```typescript
 * import { t, setLocale, getLocale } from '@/i18n';
 *
 * // Simple translation
 * const title = t('pack.title');
 *
 * // Translation with parameters
 * const message = t('pack.cardsReady', { count: 7 });
 *
 * // Change language
 * setLocale('es');
 *
 * // Get current language
 * const currentLocale = getLocale();
 * ```
 */

import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

export type Locale = 'en' | 'es';
export type TranslationKey = string;
export type TranslationParams = Record<string, string | number>;

// Translation cache
let translations: Record<string, any> = {};
let currentLocale: Locale = 'en';

// All translations loaded statically
const allTranslations: Record<Locale, Record<string, any>> = {
  en: enTranslations,
  es: esTranslations,
};

/**
 * Deeply get a nested value from an object using a dot-notation path
 *
 * @example
 * getValue({ a: { b: { c: 1 } } }, 'a.b.c') // => 1
 */
function getValue(obj: Record<string, any>, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}

/**
 * Replace parameters in a translation string
 *
 * @example
 * interpolate("Hello {name}!", { name: "World" }) // => "Hello World!"
 */
function interpolate(template: string, params: TranslationParams): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key]?.toString() ?? '';
  });
}

/**
 * Initialize the i18n system with a specific locale
 *
 * @param locale - The locale to initialize (default: 'en')
 */
export function initI18n(locale: Locale = 'en'): void {
  currentLocale = locale;
  translations = allTranslations[locale] || allTranslations.en;

  // Store locale preference in localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('daddeck-locale', locale);
      document.documentElement.lang = locale;
    } catch (error) {
      console.warn('[i18n] Failed to save locale preference:', error);
    }
  }
}

/**
 * Get a translation string by key
 *
 * @param key - The translation key (e.g., 'pack.title')
 * @param params - Optional parameters for interpolation
 * @returns The translated string, or the key if not found
 *
 * @example
 * t('pack.title') // => "DadDeck - The Ultimate White Dad Trading Card Simulator"
 * t('pack.cardsReady', { count: 7 }) // => "Pack opened! 7 cards ready to reveal."
 */
export function t(key: TranslationKey, params?: TranslationParams): string {
  const translation = getValue(translations, key);

  if (!translation) {
    console.warn(`[i18n] Translation key not found: "${key}"`);
    return key; // Return the key as fallback
  }

  if (params) {
    return interpolate(translation, params);
  }

  return translation;
}

/**
 * Set the current locale
 *
 * @param locale - The locale to switch to
 */
export function setLocale(locale: Locale): void {
  if (locale === currentLocale) return;

  initI18n(locale);
}

/**
 * Get the current locale
 *
 * @returns The current locale code
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Detect the user's preferred locale from browser settings
 *
 * @returns The detected locale, or 'en' as fallback
 */
export async function detectLocale(): Promise<Locale> {
  if (typeof window === 'undefined') return 'en';

  // Check localStorage first
  const savedLocale = localStorage.getItem('daddeck-locale') as Locale;
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
    return savedLocale;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (browserLang === 'en' || browserLang === 'es') {
    return browserLang;
  }

  return 'en'; // Default fallback
}

/**
 * Get all available locales
 *
 * @returns Array of available locale codes
 */
export function getAvailableLocales(): Locale[] {
  return ['en', 'es'];
}

/**
 * Get locale display name
 *
 * @param locale - The locale code
 * @returns The display name (e.g., 'English', 'Español')
 */
export function getLocaleName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: 'English',
    es: 'Español',
  };
  return names[locale] || locale;
}

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  detectLocale().then((locale) => {
    initI18n(locale);
  });
}
