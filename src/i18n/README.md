# DadDeck™ i18n (Internationalization)

Complete internationalization support for DadDeck™ with English and Spanish translations.

## 🌍 Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Español

## 📁 File Structure

```
src/i18n/
├── README.md           # This documentation
├── index.ts            # Core i18n utilities
├── store.ts            # Nanostores integration
└── locales/
    ├── en.json         # English translations
    └── es.json         # Spanish translations
```

## 🚀 Usage

### Basic Translation

```typescript
import { t } from '@/i18n';

// Simple translation
const title = t('pack.title'); // => "DadDeck - The Ultimate White Dad Trading Card Simulator"

// With parameters
const message = t('pack.cardsReady', { count: 7 }); // => "Pack opened! 7 cards ready to reveal."
```

### Changing Language

```typescript
import { setLocale, changeLocale } from '@/i18n';

// Using direct function
setLocale('es');

// Using reactive store (for Svelte components)
changeLocale('es');
```

### Getting Current Language

```typescript
import { getLocale } from '@/i18n';

const currentLang = getLocale(); // => 'en' | 'es'
```

## 🔧 API Reference

### `t(key: string, params?: object): string`

Get a translated string by key.

**Parameters:**
- `key` - Translation key using dot notation (e.g., 'pack.title')
- `params` - Optional parameters for interpolation (e.g., `{ count: 7 }`)

**Returns:** Translated string

**Example:**
```typescript
t('common.loading')              // => "Loading..."
t('pack.collectionUpdated', { count: 5 })  // => "Collection Updated • 5 cards added"
```

### `setLocale(locale: Locale): void`

Set the current language and update localStorage.

**Parameters:**
- `locale` - Language code ('en' or 'es')

**Example:**
```typescript
setLocale('es');
```

### `getLocale(): Locale`

Get the current language code.

**Returns:** Current locale ('en' | 'es')

### `initI18n(locale?: Locale): void`

Initialize the i18n system. Automatically called on app load.

**Parameters:**
- `locale` - Optional initial locale (defaults to 'en')

### `detectLocale(): Promise<Locale>`

Auto-detect user's preferred language from browser settings and localStorage.

**Returns:** Detected locale code

## 📦 Translation Keys

### Structure

Translation keys are organized by feature/category using dot notation:

```json
{
  "common": { ... },
  "nav": { ... },
  "pack": { ... },
  "card": { ... },
  "collection": { ... },
  "share": { ... },
  "deck": { ... },
  "upgrade": { ... },
  "crafting": { ... },
  "trade": { ... },
  "achievements": { ... },
  "leaderboard": { ... },
  "settings": { ... },
  "errors": { ... },
  "offline": { ... },
  "accessibility": { ... }
}
```

### Common Keys

- `common.loading` - Loading state
- `common.error` - Generic error message
- `common.success` - Success message
- `common.cancel` - Cancel button text
- `common.confirm` - Confirm button text
- `common.share` - Share button text
- `common.download` - Download button text

### Feature-Specific Keys

Each feature has its own section:
- `pack.*` - Pack opening UI
- `card.*` - Card display and stats
- `collection.*` - Collection management
- `deck.*` - Deck building
- `trade.*` - Trading system
- `achievements.*` - Achievement system
- `leaderboard.*` - Leaderboards

## 🎨 UI Components

### LanguageSelector Component

Dropdown component for language selection:

```svelte
<script>
  import { LanguageSelector } from '@/components/common/LanguageSelector.svelte';
</script>

<LanguageSelector />
```

**Features:**
- Dropdown with available languages
- Flag emoji indicators (🇺🇸 English, 🇪🇸 Español)
- Keyboard navigation
- ARIA attributes for accessibility
- Mobile-responsive

## 🔧 Adding New Translations

1. **Add key to both language files:**

`src/i18n/locales/en.json`:
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is a new feature"
  }
}
```

`src/i18n/locales/es.json`:
```json
{
  "myFeature": {
    "title": "Mi Función",
    "description": "Esta es una nueva función"
  }
}
```

2. **Use in components:**

```svelte
<script>
  import { t } from '@/i18n';
</script>

<h1>{t('myFeature.title')}</h1>
<p>{t('myFeature.description')}</p>
```

## 🌐 Adding New Languages

1. **Create new translation file:**

`src/i18n/locales/fr.json`:
```json
{
  "common": {
    "loading": "Chargement...",
    ...
  },
  ...
}
```

2. **Update types:**

`src/i18n/index.ts`:
```typescript
export type Locale = 'en' | 'es' | 'fr';
```

3. **Add to translations object:**

```typescript
import frTranslations from './locales/fr.json';

const allTranslations: Record<Locale, Record<string, any>> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
};
```

4. **Update LanguageSelector component:**

Add the new locale to `getAvailableLocales()` and add flag emoji.

## 📱 Browser Language Detection

The i18n system automatically:

1. Checks localStorage for saved preference
2. Falls back to browser `navigator.language`
3. Defaults to 'en' if no match found

**Example:**
- User with `es-ES` browser → Automatically loads Spanish
- User with `en-US` browser → Automatically loads English
- User with `fr-FR` browser → Falls back to English

## ♿ Accessibility

All UI strings include accessibility translations:

- `accessibility.skipToContent` - Skip navigation link
- `accessibility.openPackButton` - ARIA labels for pack opening
- `accessibility.cardReveal` - Card reveal instructions
- `accessibility.nextCard` - Next card navigation
- `accessibility.previousCard` - Previous card navigation

## 🎯 Best Practices

1. **Use translation keys for all user-facing text**
   - Never hardcode strings in components
   - Use `t()` function for all UI text

2. **Organize keys by feature**
   - Group related translations together
   - Use consistent naming conventions

3. **Provide context in comments**
   - Add notes for translators about context
   - Document parameter requirements

4. **Test both languages**
   - Verify UI layout works with longer text
   - Check for truncation or overflow issues
   - Test RTL layout if adding RTL languages

5. **Handle parameters safely**
   - Always provide fallback values
   - Use meaningful parameter names

## 🔍 Troubleshooting

### Translation Not Showing

**Problem:** Translation key appears instead of translated text

**Solution:**
1. Check key exists in both en.json and es.json
2. Verify dot notation is correct (e.g., 'pack.title' not 'packTitle')
3. Check browser console for warnings

### Language Not Switching

**Problem:** Language selector doesn't change language

**Solution:**
1. Check localStorage is enabled
2. Verify both locale files are present
3. Check browser console for errors

### Layout Issues with Spanish

**Problem:** UI breaks when displaying Spanish text

**Solution:**
1. Spanish text can be 20-30% longer than English
2. Use flexible layouts (flex/grid, not fixed widths)
3. Test with longest possible translations
4. Use `text-overflow: ellipsis` for long text

## 📚 Related Files

- `src/layouts/BaseLayout.astro` - Initializes i18n system
- `src/components/common/Navigation.svelte` - Contains LanguageSelector
- `src/components/common/LanguageSelector.svelte` - Language dropdown UI
- `src/i18n/store.ts` - Nanostores integration

## 🔄 Future Enhancements

Potential improvements:

1. **Pluralization Support** - Handle singular/plural forms
2. **Date/Number Formatting** - Locale-specific formats
3. **More Languages** - French, German, Portuguese, etc.
4. **Language Routing** - URL-based language selection (/es/pack)
5. **Translation Loading** - Lazy loading for smaller bundle size
6. **Missing Key Detection** - Development mode warnings

## 📞 Support

For issues or questions:
1. Check this README first
2. Review existing translation files for examples
3. Test in both languages before committing
4. Verify build succeeds: `bun run build`

---

**Last Updated:** January 18, 2026
