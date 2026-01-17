<script lang="ts">
/**
 * LanguageSelector.svelte
 * Interactive language selector with Nanostores integration
 */

import { onMount } from 'svelte';
import { localeStore, loadTranslations, LOCALES, type SupportedLocale } from '@/i18n';

export let className = '';

let currentLocale: SupportedLocale = 'en';
let isOpen = false;

onMount(() => {
  // Initialize from store
  currentLocale = localeStore.get();

  // Subscribe to locale changes
  const unsubscribe = localeStore.subscribe((locale) => {
    currentLocale = locale;
  });

  return () => unsubscribe();
});

async function handleLocaleChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const newLocale = select.value as SupportedLocale;

  if (newLocale !== currentLocale) {
    localeStore.set(newLocale);
    await loadTranslations(newLocale);

    // Reload to apply translations throughout the app
    window.location.reload();
  }
}

function toggleDropdown() {
  isOpen = !isOpen;
}

function selectLocale(locale: SupportedLocale) {
  if (locale !== currentLocale) {
    localeStore.set(locale);
    loadTranslations(locale);
    window.location.reload();
  }
  isOpen = false;
}
</script>

<div class="language-selector {className}">
  <button
    class="language-selector__button"
    on:click={toggleDropdown}
    aria-label="Select language"
    aria-expanded={isOpen}
  >
    <span class="language-selector__icon">🌐</span>
    <span class="language-selector__current">{LOCALES[currentLocale].nativeName}</span>
    <svg class="language-selector__arrow" class:rotate={isOpen} width="12" height="12" viewBox="0 0 12 12">
      <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  {#if isOpen}
    <div class="language-selector__dropdown">
      {#each Object.entries(LOCALES) as [code, { name, nativeName }]}
        <button
          class="language-selector__option"
          class:active={code === currentLocale}
          on:click={() => selectLocale(code as SupportedLocale)}
        >
          <span class="language-selector__option-native">{nativeName}</span>
          <span class="language-selector__option-name">{name}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .language-selector {
    position: relative;
    display: inline-block;
  }

  .language-selector__button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
  }

  .language-selector__button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .language-selector__button:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }

  .language-selector__icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  .language-selector__current {
    font-weight: 500;
  }

  .language-selector__arrow {
    transition: transform 0.2s ease;
  }

  .language-selector__arrow.rotate {
    transform: rotate(180deg);
  }

  .language-selector__dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 200px;
    background: #1f2937;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    z-index: 1000;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .language-selector__option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .language-selector__option:last-child {
    border-bottom: none;
  }

  .language-selector__option:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .language-selector__option.active {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
  }

  .language-selector__option-native {
    font-weight: 500;
  }

  .language-selector__option-name {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  /* Click outside handler */
  :global(body) {
    --click-outside-ignore: ".language-selector";
  }
</style>
