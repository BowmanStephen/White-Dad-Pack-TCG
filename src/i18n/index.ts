/**
 * i18n Module - Internationalization Stub
 * 
 * This is a minimal implementation that returns English strings.
 * When full i18n is implemented, this will be replaced with a proper
 * translation system using locale files.
 */

import { readable } from 'svelte/store';

export type Locale = 'en' | 'es';

/**
 * Translation function stub
 * Returns the key as-is (or a readable version of it)
 * 
 * Usage: t('pack.title') -> 'Pack Title'
 */
export function t(key: string, params?: Record<string, string | number>): string {
  // Convert key to readable format
  // e.g., 'pack.openPack' -> 'Open Pack'
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Convert camelCase to Title Case
  const readable = lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  
  // Handle parameter interpolation
  if (params) {
    let result = readable;
    for (const [paramKey, value] of Object.entries(params)) {
      result = result.replace(`{${paramKey}}`, String(value));
    }
    return result;
  }
  
  return readable;
}

/**
 * Svelte store version of t() for reactive translations
 */
export const $t = readable(t);

/**
 * Format number according to locale
 */
export function formatNumber(value: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Locale = 'en'): string {
  return new Intl.DateTimeFormat(locale).format(date);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(locale, { style: 'percent' }).format(value);
}

// Re-export store types
export * from './store';
