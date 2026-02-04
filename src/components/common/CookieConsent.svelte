<!--
  CookieConsent.svelte
  GDPR-compliant cookie consent banner
-->

<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import {
  cookiePreferences,
  acceptAllCookies,
  declineCookies,
  saveCookiePreferences,
  type CookiePreferences,
} from '@/stores/cookies';

let showBanner = $state(false);
let showSettings = $state(false);

// Local state for category toggles
let analyticsEnabled = $state(false);
let marketingEnabled = $state(false);

let unsubscribe: (() => void) | null = null;

onMount(() => {
  // Auto-accept for automation testing
  if (navigator.webdriver || new URLSearchParams(window.location.search).get('autoplay') === '1') {
    acceptAllCookies();
    return;
  }

  // Subscribe to store to properly sync with persisted value
  unsubscribe = cookiePreferences.subscribe((prefs: CookiePreferences) => {
    showBanner = prefs.consent === 'pending';
    analyticsEnabled = prefs.categories.analytics;
    marketingEnabled = prefs.categories.marketing;
  });
});

onDestroy(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Handle Escape key to dismiss
function handleKeydown(event: KeyboardEvent) {
  if (!showBanner) return;
  if (event.key === 'Escape') {
    event.stopPropagation();
    handleDecline();
  }
}

function handleAcceptAll() {
  acceptAllCookies();
}

function handleDecline() {
  declineCookies();
}

function handleSavePreferences() {
  saveCookiePreferences({
    analytics: analyticsEnabled,
    marketing: marketingEnabled,
  });
  showSettings = false;
}

function openSettings() {
  showSettings = true;
}

function closeSettings() {
  showSettings = false;
}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if showBanner}
  <div
    class="cookie-banner fixed bottom-0 left-0 right-0 z-[1000] bg-slate-900/95 backdrop-blur-sm border-t border-amber-500/30 shadow-2xl"
    role="dialog"
    aria-labelledby="cookie-title"
    aria-describedby="cookie-description"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <!-- Message -->
        <div class="flex-1 space-y-2">
          <h2 id="cookie-title" class="text-lg font-bold text-amber-400">Cookie Settings</h2>
          <p id="cookie-description" class="text-sm text-slate-300">
            We use cookies to enhance your experience. You can customize your preferences below.
          </p>
        </div>

        <!-- Actions -->
        {#if !showSettings}
          <div class="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onclick={handleDecline}
              class="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors"
              type="button"
            >
              Decline
            </button>
            <button
              onclick={openSettings}
              class="px-4 py-2 text-sm font-semibold text-slate-900 bg-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              type="button"
            >
              Customize
            </button>
            <button
              onclick={handleAcceptAll}
              class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg shadow-lg hover:shadow-xl transition-all"
              type="button"
            >
              Accept All
            </button>
          </div>
        {:else}
          <div class="flex flex-col gap-4 w-full md:w-auto md:min-w-[400px]">
            <!-- Analytics Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-200">Analytics</p>
                <p class="text-xs text-slate-400">Help us improve by sharing usage data</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  bind:checked={analyticsEnabled}
                  aria-label="Enable analytics cookies"
                />
                <div
                  class="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"
                ></div>
              </label>
            </div>

            <!-- Marketing Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-200">Marketing</p>
                <p class="text-xs text-slate-400">Receive personalized recommendations</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  bind:checked={marketingEnabled}
                  aria-label="Enable marketing cookies"
                />
                <div
                  class="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"
                ></div>
              </label>
            </div>

            <!-- Necessary Cookies (Always On) -->
            <div class="flex items-center justify-between opacity-50">
              <div>
                <p class="text-sm font-semibold text-slate-200">Necessary</p>
                <p class="text-xs text-slate-400">Required for the site to function</p>
              </div>
              <div
                class="w-11 h-6 bg-amber-500 rounded-full relative"
                aria-label="Necessary cookies always enabled"
              >
                <div class="absolute top-[2px] end-[2px] bg-white rounded-full h-5 w-5"></div>
              </div>
            </div>

            <!-- Save/Cancel Buttons -->
            <div class="flex gap-3 pt-2">
              <button
                onclick={closeSettings}
                class="flex-1 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onclick={handleSavePreferences}
                class="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg shadow-lg hover:shadow-xl transition-all"
                type="button"
              >
                Save Preferences
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
.cookie-banner {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
