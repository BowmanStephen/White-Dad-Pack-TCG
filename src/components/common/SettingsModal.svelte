<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { modalOpen, closeModal } from '@/stores/ui';
  import { trackEvent } from '@/stores/analytics';
  import {
    muted,
    toggleMute,
    masterVolume,
    setMasterVolume,
  } from '@/stores/audio';
  import {
    themeMode,
    setThemeMode,
    type ThemeMode,
  } from '@/stores/theme';
  import LanguageSelector from './LanguageSelector.svelte';
  import { onMount, onDestroy } from 'svelte';

  // Local reactive state
  let isOpen = false;
  let modalElement: HTMLElement;
  let previouslyFocusedElement: HTMLElement | null = null;
  let volumeValue = masterVolume.get();
  let isMuted = muted.get();
  let currentTheme: ThemeMode = themeMode.get();

  // Subscribe to modalOpen store (with cleanup)
  let unsubscribe: (() => void) | null = null;
  let unsubscribeMuted: (() => void) | null = null;
  let unsubscribeVolume: (() => void) | null = null;
  let unsubscribeTheme: (() => void) | null = null;

  onMount(() => {
    if (typeof window !== 'undefined') {
      unsubscribe = modalOpen.subscribe((value) => {
        isOpen = value === 'settings';
        if (isOpen) {
          // Store the previously focused element
          previouslyFocusedElement = document.activeElement as HTMLElement;
          // Focus the modal
          setTimeout(() => {
            modalElement?.focus();
          }, 50);
        } else if (previouslyFocusedElement) {
          // Return focus to the previously focused element
          setTimeout(() => {
            previouslyFocusedElement?.focus();
          }, 50);
        }
      });

      unsubscribeMuted = muted.subscribe((value) => {
        isMuted = value;
      });

      unsubscribeVolume = masterVolume.subscribe((value) => {
        volumeValue = value;
      });

      unsubscribeTheme = themeMode.subscribe((value) => {
        currentTheme = value;
      });
    }
  });

  // Clean up subscriptions on destroy
  onDestroy(() => {
    if (unsubscribe) unsubscribe();
    if (unsubscribeMuted) unsubscribeMuted();
    if (unsubscribeVolume) unsubscribeVolume();
    if (unsubscribeTheme) unsubscribeTheme();
  });

  // Focus trap for modal
  function handleModalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = modalElement?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  function handleClose() {
    closeModal();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const volume = parseFloat(target.value);
    setMasterVolume(volume);

    // Track volume change
    trackEvent({
      type: 'settings_change',
      data: {
        setting: 'volume',
        value: volume,
      },
    });
  }

  function handleMuteToggle() {
    toggleMute();

    // Track mute toggle
    trackEvent({
      type: 'settings_change',
      data: {
        setting: 'mute',
        value: !isMuted,
      },
    });
  }

  function handleThemeChange(theme: ThemeMode) {
    setThemeMode(theme);

    // Track theme change
    trackEvent({
      type: 'settings_change',
      data: {
        setting: 'theme',
        value: theme,
      },
    });
  }
</script>

{#if isOpen}
  <div
    bind:this={modalElement}
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 150 }}
    on:click={handleBackdropClick}
    on:keydown={handleModalKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-modal-title"
    tabindex="-1"
  >
    <div
      class="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto"
      in:scale={{ duration: 300, easing: backOut }}
      out:scale={{ duration: 150 }}
      on:click|stopPropagation
    >
      <!-- Close button -->
      <button
        on:click={handleClose}
        class="absolute top-4 right-4 p-3 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 min-w-[44px] min-h-[44px]"
        aria-label="Close settings modal"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Modal header -->
      <div class="p-6 pb-4 border-b border-slate-800">
        <h2 id="settings-modal-title" class="text-2xl font-bold text-white">
          Settings
        </h2>
        <p class="text-slate-400 text-sm mt-1">
          Customize your DadDeck™ experience
        </p>
      </div>

      <!-- Settings content -->
      <div class="p-6 space-y-6">
        <!-- Language -->
        <div>
          <label class="block text-sm font-medium text-white mb-3">
            Language
          </label>
          <LanguageSelector client:load />
        </div>

        <!-- Audio Settings -->
        <div>
          <label class="block text-sm font-medium text-white mb-3">
            Audio
          </label>
          
          <!-- Mute Toggle -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-300 text-sm">Mute Sounds</span>
            <button
              on:click={handleMuteToggle}
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {isMuted ? 'bg-blue-600' : 'bg-slate-600'}"
              aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              type="button"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {isMuted ? 'translate-x-6' : 'translate-x-1'}"
              />
            </button>
          </div>

          <!-- Volume Slider -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-slate-300 text-sm">Master Volume</span>
              <span class="text-slate-400 text-xs">{Math.round(volumeValue * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumeValue}
              on:input={handleVolumeChange}
              class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              disabled={isMuted}
            />
          </div>
        </div>

        <!-- Theme Settings -->
        <div>
          <label class="block text-sm font-medium text-white mb-3">
            Theme
          </label>
          <div class="flex gap-2">
            <button
              on:click={() => handleThemeChange('light')}
              class="flex-1 p-3 rounded-lg border transition-colors {currentTheme === 'light' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}"
              type="button"
            >
              Light
            </button>
            <button
              on:click={() => handleThemeChange('dark')}
              class="flex-1 p-3 rounded-lg border transition-colors {currentTheme === 'dark' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}"
              type="button"
            >
              Dark
            </button>
            <button
              on:click={() => handleThemeChange('auto')}
              class="flex-1 p-3 rounded-lg border transition-colors {currentTheme === 'auto' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}"
              type="button"
            >
              Auto
            </button>
          </div>
        </div>

        <!-- About Section -->
        <div class="pt-4 border-t border-slate-800">
          <h3 class="text-sm font-medium text-white mb-2">About DadDeck™</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            DadDeck™ is a free trading card game parodying suburban American
            dad culture through collectible cards.
          </p>
          <p class="text-slate-500 text-xs mt-2">Version 2.0.0</p>
        </div>
      </div>

      <!-- Footer note -->
      <div class="px-6 pb-6">
        <p class="text-slate-500 text-xs text-center">
          Press ESC or click outside to close
        </p>
      </div>
    </div>
  </div>
{/if}
