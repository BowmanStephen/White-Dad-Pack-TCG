<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined';

  // Reactive state for online/offline status
  let isOnline = $state(isBrowser ? navigator.onLine : true);
  let showBanner = $state(false);

  // Update online status
  function updateOnlineStatus() {
    if (!isBrowser) return;

    const wasOffline = !isOnline;
    isOnline = navigator.onLine;

    // Show banner when transitioning from offline to online
    if (wasOffline && isOnline) {
      showBanner = true;
      setTimeout(() => {
        showBanner = false;
      }, 3000);
    }
  }

  onMount(() => {
    if (!isBrowser) return;

    // Set initial state
    isOnline = navigator.onLine;
    showBanner = !isOnline;

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  });
</script>

{#if !isOnline}
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg flex items-center justify-center gap-3 animate-slide-down"
    role="alert"
    aria-live="polite"
  >
    <svg
      class="w-5 h-5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01"
      />
    </svg>
    <span class="font-medium">You're offline. Some features may be limited.</span>
  </div>
{:else if showBanner}
  <div
    class="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white px-4 py-3 shadow-lg flex items-center justify-center gap-3 animate-slide-down"
    role="status"
    aria-live="polite"
  >
    <svg
      class="w-5 h-5 flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clip-rule="evenodd"
      />
    </svg>
    <span class="font-medium">You're back online! Syncing your collection...</span>
  </div>
{/if}

<style>
  @keyframes slide-down {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
</style>
