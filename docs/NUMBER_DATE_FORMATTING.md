# Number and Date Formatting Guide

## Overview

This document describes the locale-aware number and date formatting system implemented in `src/lib/utils/formatters.ts`. The system uses the JavaScript Intl API to automatically format numbers and dates according to the user's selected locale (e.g., English vs. Spanish).

## Features

### Number Formatting
- **Locale-aware separators**: Uses commas (en-US) or periods (es-ES) for thousands
- **Percentage formatting**: Automatically formats decimal values as percentages
- **Signed numbers**: Special formatting for luck percentages (+/- indicators)
- **Card stats**: Optimized for 0-100 stat values (no decimals)

### Date Formatting
- **Absolute dates**: Full date and time formatting
- **Relative time**: "5 minutes ago", "2 days ago", etc.
- **Locale-aware**: Translates relative time strings automatically

## API Reference

### `formatStat(value, options?, locale?)`

Format a generic number with locale-aware formatting.

**Parameters:**
- `value` (number): The number to format
- `options?` (Intl.NumberFormatOptions): Optional Intl options
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted number string

**Examples:**
```typescript
formatStat(95)           // "95" (en-US) or "95" (es-ES)
formatStat(1234.56)      // "1,234.56" (en-US) or "1.234,56" (es-ES)
formatStat(1000000)      // "1,000,000" (en-US) or "1.000.000" (es-ES)
```

---

### `formatPercentage(value, options?, locale?)`

Format a percentage with locale-aware formatting.

**Parameters:**
- `value` (number): The decimal value (0-1) or percentage (0-100)
- `options?` (Intl.NumberFormatOptions): Optional Intl options
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted percentage string

**Examples:**
```typescript
formatPercentage(0.856)  // "85.6%" (en-US) or "85,6%" (es-ES)
formatPercentage(85.6)   // "85.6%" (en-US) or "85,6%" (es-ES)
formatPercentage(1.0)    // "100.0%" (en-US) or "100,0%" (es-ES)
```

---

### `formatDate(date, options?, locale?)`

Format a date with locale-aware formatting.

**Parameters:**
- `date` (Date): The date to format
- `options?` (Intl.DateTimeFormatOptions): Optional Intl options
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted date string

**Examples:**
```typescript
formatDate(new Date())                                    // "1/18/2026" (en-US) or "18/1/2026" (es-ES)
formatDate(new Date(), { month: 'short', day: 'numeric' }) // "Jan 18" (en-US) or "18 ene" (es-ES)
```

---

### `formatDateTime(date, options?, locale?)`

Format a date and time with locale-aware formatting.

**Parameters:**
- `date` (Date): The date to format
- `options?` (Intl.DateTimeFormatOptions): Optional Intl options
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted date and time string

**Examples:**
```typescript
formatDateTime(new Date())  // "1/18/2026, 12:30:45 AM" (en-US) or "18/1/2026, 0:30:45" (es-ES)
```

---

### `formatRelativeTime(value, unit, locale?)`

Format a relative time (e.g., "5 minutes ago", "2 days ago").

**Parameters:**
- `value` (number): The time value (negative for past)
- `unit` (Intl.RelativeTimeFormatUnit): The time unit (second, minute, hour, day, week, month, year)
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted relative time string

**Examples:**
```typescript
formatRelativeTime(-5, 'minute')  // "5 minutes ago" (en-US) or "hace 5 minutos" (es-ES)
formatRelativeTime(-2, 'day')     // "2 days ago" (en-US) or "hace 2 días" (es-ES)
formatRelativeTime(-1, 'week')    // "1 week ago" (en-US) or "hace 1 semana" (es-ES)
```

---

### `formatTimestamp(date, locale?)`

Format a timestamp as relative time (convenience function).

**Parameters:**
- `date` (Date): The date to format
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted relative time string

**Examples:**
```typescript
formatTimestamp(new Date(Date.now() - 300000))      // "5 minutes ago"
formatTimestamp(new Date(Date.now() - 86400000))    // "1 day ago"
formatTimestamp(new Date(Date.now() - 5000))        // "just now"
```

**Logic:**
- Less than 10 seconds: "just now" / "ahora mismo"
- Less than 1 hour: "X minutes ago" / "hace X minutos"
- Less than 1 day: "X hours ago" / "hace X horas"
- Less than 1 week: "X days ago" / "hace X días"
- Less than 1 month: "X weeks ago" / "hace X semanas"
- Less than 1 year: "X months ago" / "hace X meses"
- Otherwise: "X years ago" / "hace X años"

---

### `formatCardCount(count, locale?)`

Format a card count with locale-aware formatting.

**Parameters:**
- `count` (number): The number of cards
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted count string (no decimals)

**Examples:**
```typescript
formatCardCount(1234)  // "1,234" (en-US) or "1.234" (es-ES)
formatCardCount(0)     // "0"
```

---

### `formatPackCount(count, locale?)`

Format a pack count with locale-aware formatting.

**Parameters:**
- `count` (number): The number of packs
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted count string (no decimals)

**Examples:**
```typescript
formatPackCount(56)    // "56"
formatPackCount(1000)  // "1,000" (en-US) or "1.000" (es-ES)
```

---

### `formatLuckPercentage(percentage, locale?)`

Format a luck percentage with +/- sign.

**Parameters:**
- `percentage` (number): The percentage value (can be negative)
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted percentage string with +/- sign

**Examples:**
```typescript
formatLuckPercentage(15.5)   // "+15.5%" (en-US) or "+15,5%" (es-ES)
formatLuckPercentage(-5.2)   // "−5.2%" (en-US) or "−5,2%" (es-ES)
formatLuckPercentage(0)      // "+0.0%" (en-US) or "+0,0%" (es-ES)
```

**Note:** Uses minus sign (U+2212) for negative values, not hyphen.

---

### `formatCardStat(value, locale?)`

Format a card stat value (0-100) with locale-aware formatting.

**Parameters:**
- `value` (number): The stat value (0-100)
- `locale?` (Locale): Override locale (defaults to current locale)

**Returns:** Formatted stat value string (no decimals)

**Examples:**
```typescript
formatCardStat(95)   // "95"
formatCardStat(100)  // "100"
formatCardStat(0)    // "0"
```

---

## Usage in Components

### Svelte Components

```svelte
<script>
  import { formatCardStat, formatTimestamp } from '@/lib/utils/formatters';
  import { getCurrentLocale } from '@/i18n/store';

  export let stats: CardStats;
  export let openedAt: Date;

  // Use current locale automatically
  $: statDisplay = formatCardStat(stats.dadJoke);

  // Or override locale for testing
  $: timestampDisplay = formatTimestamp(openedAt, 'es');
</script>

<div>Stat: {statDisplay}</div>
<div>Opened: {timestampDisplay}</div>
```

### Reactive Locale Updates

The formatters automatically use the current locale from the i18n store:

```typescript
import { getCurrentLocale } from '@/i18n/store';
import { formatStat } from '@/lib/utils/formatters';

// When user changes language, these will use the new locale
const value1 = formatStat(1234); // Uses current locale automatically
const value2 = formatStat(1234, undefined, 'es'); // Force Spanish
```

---

## Implementation Details

### Locale Detection

The formatters use `getCurrentLocale()` from `@/i18n/store`, which:
1. Returns the locale from the reactive Nanostores atom
2. Automatically updates when user changes language
3. Falls back to 'en' if no locale is set

### Intl API Compatibility

The formatters use standard JavaScript Intl APIs:
- `Intl.NumberFormat` - Number formatting
- `Intl.DateTimeFormat` - Date formatting
- `Intl.RelativeTimeFormat` - Relative time formatting

**Browser Support:** All modern browsers (ES2018+)

### Performance Considerations

- **Formatter instances**: Created on-demand (not cached)
- **Locale lookups**: Fast (single atom store access)
- **No re-renders**: Formatters are pure functions

---

## Testing

Unit tests are located in `tests/unit/lib/utils/formatters.test.ts`:

```bash
# Run formatters tests
bun test tests/unit/lib/utils/formatters.test.ts
```

**Coverage:**
- ✅ Number formatting (integers, decimals, large numbers)
- ✅ Percentage formatting (decimals and direct percentages)
- ✅ Date formatting (absolute dates and datetimes)
- ✅ Relative time formatting (minutes, hours, days, weeks)
- ✅ Timestamp formatting (convenience function)
- ✅ Specialized formatters (card stats, luck percentages)

---

## Examples by Locale

### English (en-US)

```typescript
formatStat(1234.56)           // "1,234.56"
formatPercentage(0.856)       // "85.6%"
formatDate(new Date())        // "1/18/2026"
formatRelativeTime(-5, 'minute') // "5 minutes ago"
formatLuckPercentage(15.5)    // "+15.5%"
```

### Spanish (es-ES)

```typescript
formatStat(1234.56)           // "1.234,56"
formatPercentage(0.856)       // "85,6%"
formatDate(new Date())        // "18/1/2026"
formatRelativeTime(-5, 'minute') // "hace 5 minutos"
formatLuckPercentage(15.5)    // "+15,5%"
```

---

## Future Enhancements

### Potential Additions
1. **Currency formatting** - If real-money transactions are added
2. **Duration formatting** - "2h 30m" format for time periods
3. **Byte size formatting** - For download sizes or storage
4. **List formatting** - "A, B, and C" with locale-specific conjunctions
5. **Pluralization** - Using Intl.PluralRules for better plural handling

### Example Implementations

```typescript
// Currency (future)
formatCurrency(9.99, 'USD')  // "$9.99" (en-US) or "9,99 $" (es-ES)

// Duration (future)
formatDuration(9000)         // "2h 30m" or "2h 30min" (locale-specific)

// Byte size (future)
formatBytes(1048576)         // "1 MB" (en-US) or "1 Mo" (es-ES)
```

---

## See Also

- **I18N Implementation**: `I18N_IMPLEMENTATION.md` - Full i18n system documentation
- **Formatters Source**: `src/lib/utils/formatters.ts` - Implementation code
- **Formatters Tests**: `tests/unit/lib/utils/formatters.test.ts` - Unit tests

---

**Last Updated:** January 18, 2026
**Status:** ✅ Complete
**Version:** 1.0.0
