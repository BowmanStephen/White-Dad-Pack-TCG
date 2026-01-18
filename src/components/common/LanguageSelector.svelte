<script lang="ts">
  /**
   * LanguageSelector Component
   * 
   * Placeholder for future internationalization (i18n) support.
   * Currently displays English only. When i18n is fully implemented,
   * this will allow users to switch between languages.
   * 
   * TODO: Implement full i18n system with:
   * - src/i18n/store.ts - Locale state management
   * - src/i18n/locales/en.json - English translations
   * - src/i18n/locales/es.json - Spanish translations
   */

  type Locale = 'en' | 'es';

  // Available languages
  const languages: { code: Locale; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    // { code: 'es', name: 'Español', flag: '🇪🇸' }, // Uncomment when i18n is implemented
  ];

  // Current locale (stored in localStorage for persistence)
  let currentLocale = $state<Locale>('en');

  // Load saved locale on mount
  $effect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daddeck-locale') as Locale | null;
      if (saved && languages.some(l => l.code === saved)) {
        currentLocale = saved;
      }
    }
  });

  // Change language
  function changeLanguage(newLocale: Locale) {
    currentLocale = newLocale;
    if (typeof window !== 'undefined') {
      localStorage.setItem('daddeck-locale', newLocale);
      // Future: Trigger i18n store update and page refresh/re-render
    }
  }

  // Get current language info
  let currentLanguage = $derived(languages.find((lang) => lang.code === currentLocale) || languages[0]);
</script>

<!-- Only render if multiple languages are available -->
{#if languages.length > 1}
  <div class="language-selector">
    <select
      class="language-select"
      value={currentLocale}
      onchange={(e) => changeLanguage((e.target as HTMLSelectElement).value as Locale)}
      aria-label="Select language"
    >
      {#each languages as lang}
        <option value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      {/each}
    </select>
  </div>
{/if}

<style>
  .language-selector {
    display: flex;
    align-items: center;
  }

  .language-select {
    appearance: none;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.5rem;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    color: #e2e8f0;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1.25rem;
    padding-right: 2.5rem;
  }

  .language-select:hover {
    background-color: rgba(51, 65, 85, 0.8);
    border-color: rgba(148, 163, 184, 0.3);
  }

  .language-select:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }

  /* Dark mode adjustments */
  :global(.dark) .language-select {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  :global(.dark) .language-select:hover {
    background-color: rgba(30, 41, 59, 0.8);
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .language-select {
      font-size: 0.8125rem;
      padding: 0.4375rem 2rem 0.4375rem 0.625rem;
    }
  }
</style>
