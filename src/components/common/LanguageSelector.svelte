<script lang="ts">
  import { onMount } from 'svelte';
  import { locale, changeLocale, getAvailableLocales, getLocaleName, type Locale } from '@/i18n/store';

  let isOpen = $state(false);
  let buttonElement: HTMLElement;

  // Get current locale value from store
  let currentLocale = $state<Locale>('en');

  // Subscribe to locale changes
  onMount(() => {
    const unsubscribe = locale.subscribe((value) => {
      currentLocale = value;
    });

    return () => {
      unsubscribe();
    };
  });

  const availableLocales = getAvailableLocales();

  function handleLocaleSelect(newLocale: Locale) {
    changeLocale(newLocale);
    isOpen = false;
    buttonElement?.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
      buttonElement?.focus();
    }
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function closeDropdown() {
    isOpen = false;
  }
</script>

<div class="relative language-selector">
  <button
    bind:this={buttonElement}
    on:click={toggleDropdown}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
    }}
    class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-white/10 uppercase tracking-widest text-xs"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-label="Select language"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
    <span>{getLocaleName(currentLocale)}</span>
    <svg
      class="w-3 h-3 transition-transform duration-200"
      class:rotate-180={isOpen}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>

  {#if isOpen}
    <div
      on:click={closeDropdown}
      on:keydown={handleKeydown}
      role="listbox"
      class="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl z-50"
      style="min-width: 200px;"
    >
      <div class="p-2">
        {#each availableLocales as loc}
          <button
            on:click={(e) => {
              e.stopPropagation();
              handleLocaleSelect(loc);
            }}
            role="option"
            aria-selected={currentLocale === loc}
            class="locale-option {currentLocale === loc ? 'active' : ''}"
            tabindex="0"
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLocaleSelect(loc);
              }
            }}
          >
            <span class="text-lg">{loc === 'en' ? '🇺🇸' : '🇪🇸'}</span>
            <span>{getLocaleName(loc)}</span>
            {#if currentLocale === loc}
              <svg class="w-4 h-4 ml-auto text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .locale-option {
    @apply w-full text-left px-4 py-3 rounded-lg transition-all font-bold uppercase tracking-widest text-xs flex items-center gap-3 text-slate-300 hover:bg-white/5;
  }

  .locale-option.active {
    @apply bg-white/10 text-white;
  }

  /* Close dropdown when clicking outside */
  :global(:focus-visible) {
    outline: 2px solid white;
    outline-offset: 2px;
  }
</style>
