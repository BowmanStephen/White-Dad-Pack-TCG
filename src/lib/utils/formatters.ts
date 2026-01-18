/**
 * Formatters - Internationalized number and date formatting
 *
 * Provides locale-aware formatting functions using Intl API.
 * Integrates with the i18n system in src/i18n/ for locale detection.
 */

type Locale = 'en-US' | 'es-ES';

/**
 * Get current locale from browser or localStorage
 * Falls back to 'en-US' if not available
 */
function getCurrentLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('daddeck-locale');
    if (saved === 'es') return 'es-ES';
    if (saved === 'en') return 'en-US';
  }
  return 'en-US';
}

/**
 * Format a number with locale-aware formatting
 *
 * @param value - The number to format
 * @param options - Intl.NumberFormat options (optional)
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted number string
 *
 * @example
 * formatStat(95) // "95" (en-US) or "95" (es-ES)
 * formatStat(1234.56) // "1,234.56" (en-US) or "1.234,56" (es-ES)
 */
export function formatStat(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: Locale
): string {
  const targetLocale = locale || getCurrentLocale();
  return new Intl.NumberFormat(targetLocale, options).format(value);
}

/**
 * Format a percentage with locale-aware formatting
 *
 * @param value - The decimal value (0-1) or percentage (0-100)
 * @param options - Intl.NumberFormat options (optional)
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.856) // "85.6%" (en-US) or "85,6%" (es-ES)
 * formatPercentage(85.6) // "85.6%" (en-US) or "85,6%" (es-ES)
 */
export function formatPercentage(
  value: number,
  options?: Omit<Intl.NumberFormatOptions, 'style'>,
  locale?: Locale
): string {
  const targetLocale = locale || getCurrentLocale();

  // If value is > 1, assume it's already a percentage (0-100)
  // If value is <= 1, assume it's a decimal (0-1) and multiply by 100
  const adjustedValue = value > 1 ? value : value * 100;

  return new Intl.NumberFormat(targetLocale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options,
  }).format(adjustedValue / 100);
}

/**
 * Format a date with locale-aware formatting
 *
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options (optional)
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()) // "1/18/2026" (en-US) or "18/1/2026" (es-ES)
 * formatDate(new Date(), { month: 'short', day: 'numeric' }) // "Jan 18" (en-US) or "18 ene" (es-ES)
 */
export function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
  locale?: Locale
): string {
  const targetLocale = locale || getCurrentLocale();
  return new Intl.DateTimeFormat(targetLocale, options).format(date);
}

/**
 * Format a date and time with locale-aware formatting
 *
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options (optional)
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime(new Date()) // "1/18/2026, 12:30:45 AM" (en-US) or "18/1/2026, 0:30:45" (es-ES)
 */
export function formatDateTime(
  date: Date,
  options?: Intl.DateTimeFormatOptions,
  locale?: Locale
): string {
  const targetLocale = locale || getCurrentLocale();

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  };

  return new Intl.DateTimeFormat(targetLocale, {
    ...defaultOptions,
    ...options,
  }).format(date);
}

/**
 * Format a relative time (e.g., "5 minutes ago", "2 days ago")
 *
 * Uses Intl.RelativeTimeFormat for locale-aware relative time formatting.
 *
 * @param value - The time value
 * @param unit - The time unit (second, minute, hour, day, week, month, year)
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted relative time string
 *
 * @example
 * formatRelativeTime(-5, 'minute') // "5 minutes ago" (en-US) or "hace 5 minutos" (es-ES)
 * formatRelativeTime(-2, 'day') // "2 days ago" (en-US) or "hace 2 días" (es-ES)
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale?: Locale
): string {
  const targetLocale = locale || getCurrentLocale();
  const rtf = new Intl.RelativeTimeFormat(targetLocale, { numeric: 'auto' });
  return rtf.format(value, unit);
}

/**
 * Format a timestamp as relative time (e.g., "5 minutes ago")
 *
 * Convenience function that calculates the difference between now and the given date.
 *
 * @param date - The date to format
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted relative time string
 *
 * @example
 * formatTimestamp(new Date(Date.now() - 300000)) // "5 minutes ago"
 * formatTimestamp(new Date(Date.now() - 86400000)) // "1 day ago"
 */
export function formatTimestamp(date: Date, locale?: Locale): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const targetLocale = locale || getCurrentLocale();

  // Use locale-specific messages for very recent times
  if (diffSeconds < 10) {
    // Just now - use i18n if available, otherwise fallback
    return targetLocale === 'es-ES' ? 'ahora mismo' : 'just now';
  }

  if (diffMinutes < 60) {
    return formatRelativeTime(-diffMinutes, 'minute', targetLocale);
  }

  if (diffHours < 24) {
    return formatRelativeTime(-diffHours, 'hour', targetLocale);
  }

  if (diffDays < 7) {
    return formatRelativeTime(-diffDays, 'day', targetLocale);
  }

  if (diffWeeks < 4) {
    return formatRelativeTime(-diffWeeks, 'week', targetLocale);
  }

  if (diffMonths < 12) {
    return formatRelativeTime(-diffMonths, 'month', targetLocale);
  }

  return formatRelativeTime(-diffYears, 'year', targetLocale);
}

/**
 * Format a card count with locale-aware formatting
 * Specialized formatter for card counts in collection/pack views.
 *
 * @param count - The number of cards
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted count string
 *
 * @example
 * formatCardCount(1234) // "1,234" (en-US) or "1.234" (es-ES)
 */
export function formatCardCount(count: number, locale?: Locale): string {
  return formatStat(count, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }, locale);
}

/**
 * Format a pack count with locale-aware formatting
 * Specialized formatter for pack counts.
 *
 * @param count - The number of packs
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted count string
 *
 * @example
 * formatPackCount(56) // "56" (en-US) or "56" (es-ES)
 */
export function formatPackCount(count: number, locale?: Locale): string {
  return formatCardCount(count, locale);
}

/**
 * Format a luck percentage with locale-aware formatting
 * Specialized formatter for luck percentages (+/- indicator)
 *
 * @param percentage - The percentage value (can be negative)
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted percentage string with +/- sign
 *
 * @example
 * formatLuckPercentage(15.5) // "+15.5%" (en-US) or "+15,5%" (es-ES)
 * formatLuckPercentage(-5.2) // "−5.2%" (en-US) or "−5,2%" (es-ES)
 */
export function formatLuckPercentage(percentage: number, locale?: Locale): string {
  const targetLocale = locale || getCurrentLocale();
  const formatted = formatStat(Math.abs(percentage), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }, targetLocale);

  const sign = percentage >= 0 ? '+' : '−'; // Use minus sign (U+2212) for negative
  return `${sign}${formatted}%`;
}

/**
 * Format a stat value (0-100) with locale-aware formatting
 * Specialized formatter for card stats.
 *
 * @param value - The stat value (0-100)
 * @param locale - Override locale (defaults to current locale)
 * @returns Formatted stat value string
 *
 * @example
 * formatCardStat(95) // "95" (en-US) or "95" (es-ES)
 */
export function formatCardStat(value: number, locale?: Locale): string {
  return formatStat(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }, locale);
}
