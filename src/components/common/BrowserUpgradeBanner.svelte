<script lang="ts">
  import { onMount } from 'svelte';
  import {
    checkBrowserSupport,
    getBrowserSupportMessage,
    getCurrentBrowserUpgradeUrl,
  } from '@/lib/utils/browser-support';

  interface Props {
    dismissible?: boolean;
  }

  let { dismissible = true }: Props = $props();

  let showBanner = $state(false);
  let supportMessage = $state('');
  let upgradeUrl = $state('');

  onMount(() => {
    // Check browser support on mount
    const support = checkBrowserSupport();
    supportMessage = getBrowserSupportMessage();
    upgradeUrl = getCurrentBrowserUpgradeUrl();

    // Show banner if there are issues
    if (!support.isSupported || supportMessage) {
      showBanner = true;
    }
  });

  function dismiss() {
    if (dismissible) {
      showBanner = false;
      // Store dismissal in sessionStorage (persists for session only)
      try {
        sessionStorage.setItem('browser-banner-dismissed', 'true');
      } catch (e) {
        // Silently fail if sessionStorage unavailable
      }
    }
  }

  function shouldShowBanner(): boolean {
    // Check if previously dismissed this session
    try {
      const dismissed = sessionStorage.getItem('browser-banner-dismissed');
      if (dismissed === 'true' && dismissible) {
        return false;
      }
    } catch (e) {
      // Silently fail if sessionStorage unavailable
    }
    return showBanner;
  }
</script>

{#if shouldShowBanner()}
  <div
    role="alert"
    aria-live="polite"
    class="browser-upgrade-banner fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 shadow-lg"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <div class="flex items-start gap-3 flex-1">
        <!-- Warning Icon -->
        <svg
          class="w-6 h-6 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <!-- Message -->
        <div class="flex-1">
          <p class="font-semibold text-sm md:text-base">
            Browser Update Recommended
          </p>
          <p class="text-sm mt-1 opacity-95">
            {supportMessage}
            <a
              href={upgradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="underline font-semibold hover:text-white/80 transition-colors"
            >
              Download the latest version
            </a>
            for the best experience.
          </p>
        </div>
      </div>

      <!-- Dismiss Button (if dismissible) -->
      {#if dismissible}
        <button
          onclick={dismiss}
          type="button"
          class="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600"
          aria-label="Dismiss message"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      {/if}
    </div>
  </div>

  <!-- Spacer to prevent content jump -->
  <div class="h-20"></div>
{/if}

<style>
  .browser-upgrade-banner {
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
</style>
