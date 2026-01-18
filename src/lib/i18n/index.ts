/**
 * Internationalization (i18n) System (US092 - Localization - Multi-language)
 *
 * STUB IMPLEMENTATION - Feature not yet implemented
 *
 * This module provides internationalization support for multiple languages.
 * Currently a stub pending full implementation.
 *
 * Planned support:
 * - English, Spanish, French, German
 * - UI text translations
 * - Card name/description translations
 * - RTL language support (if needed)
 */

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de';

/**
 * Get the user's preferred locale from browser settings
 */
export function detectLocale(): SupportedLocale {
  // STUB: Returns English by default
  return 'en';
}

/**
 * Get translated text for a given key
 */
export function t(key: string, locale?: SupportedLocale): string {
  // STUB: Returns the key itself until translations are implemented
  return key;
}

/**
 * Set the application locale
 */
export function setLocale(locale: SupportedLocale): void {
  // STUB: Locale setting not yet implemented
  console.warn('[i18n] Locale setting not yet implemented:', locale);
}

/**
 * Format a number according to locale conventions
 */
export function formatNumber(value: number, locale?: SupportedLocale): string {
  // STUB: Returns default formatting
  return value.toString();
}
