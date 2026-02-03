<!--
InstallPrompt.svelte

PWA install prompt component (PWA-001).

Features:
- Detects if app is installable (beforeinstallprompt event)
- Tracks visit count in localStorage
- Shows install banner after 3 visits
- Handles PWA installation
- Tracks installation status
- Dismissible banner with smooth animations
- Keyboard accessible (Escape to dismiss, Enter to install)
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { persistentAtom } from '@/lib/utils/persistent';
  import { subscribeToStores } from '@/lib/utils/store-helpers';

  // Track visit count
  export const visitCount = persistentAtom<number>(
    'daddeck-visit-count',
    0,
    {
      encode: (value) => JSON.stringify(value),
      decode: (value) => {
        try {
          return JSON.parse(value);
        } catch {
          return 0;
        }
      },
    }
  );

  // Track whether PWA is installed
  export const isInstalled = persistentAtom<boolean>(
    'daddeck-pwa-installed',
    false,
    {
      encode: (value) => JSON.stringify(value),
      decode: (value) => {
        try {
          return JSON.parse(value);
        } catch {
          return false;
        }
      },
    }
  );

  // Track whether user dismissed install prompt
  export const installDismissed = persistentAtom<boolean>(
    'daddeck-install-dismissed',
    false,
    {
      encode: (value) => JSON.stringify(value),
      decode: (value) => {
        try {
          return JSON.parse(value);
        } catch {
          return false;
        }
      },
    }
  );

  // Local state
  let isVisible = $state(false);
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  let isInstallable = $state(false);
  let visits = $state(visitCount.get());
  let installed = $state(isInstalled.get());
  let dismissed = $state(installDismissed.get());
  let unsubscribeStores: (() => void) | null = null;

  // Increment visit count on mount
  onMount(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    unsubscribeStores = subscribeToStores([
      { store: visitCount, onUpdate: (value) => { visits = value; } },
      { store: isInstalled, onUpdate: (value) => { installed = value; } },
      { store: installDismissed, onUpdate: (value) => { dismissed = value; } },
    ]);

    // Don't show if already installed
    if (installed) {
      return () => {
        unsubscribeStores?.();
      };
    }

    // Increment visit count
    const nextVisits = visitCount.get() + 1;
    visitCount.set(nextVisits);

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if we should show the prompt (after 3 visits and not dismissed)
    checkShouldShowPrompt();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      unsubscribeStores?.();
    };
  });

  // Handle beforeinstallprompt event
  function handleBeforeInstallPrompt(event: Event) {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    event.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = event as BeforeInstallPromptEvent;

    // Update UI to show the prompt can be shown
    isInstallable = true;

    // Check if we should show the prompt
    checkShouldShowPrompt();
  }

  // Handle app installed event
  function handleAppInstalled() {
    // Update state to show app is installed
    isInstalled.set(true);
    isVisible = false;
    isInstallable = false;
    deferredPrompt = null;

    console.log('[PWA] DadDeck was installed');
  }

  // Check if we should show the prompt
  function checkShouldShowPrompt() {
    // Don't show if already installed or dismissed
    if (installed || dismissed) return;

    // Show after 3 visits if installable
    if (visits >= 3 && isInstallable && deferredPrompt) {
      // Show after a short delay for smooth experience
      setTimeout(() => {
        isVisible = true;
      }, 1000);
    }
  }

  // Handle install button click
  async function handleInstall() {
    if (!deferredPrompt) {
      console.warn('[PWA] No deferred prompt available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA] User response to install prompt: ${outcome}`);

    // Clear the deferred prompt
    deferredPrompt = null;

    if (outcome === 'accepted') {
      // User accepted the prompt
      isInstalled.set(true);
      isVisible = false;
      isInstallable = false;
    } else {
      // User dismissed the prompt
      isVisible = false;
    }
  }

  // Handle dismiss button
  function handleDismiss() {
    isVisible = false;

    // Mark as dismissed so we don't show again
    installDismissed.set(true);
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!isVisible) return;

    switch (event.key) {
      case 'Escape':
        handleDismiss();
        break;
      case 'Enter':
        if (event.target instanceof HTMLButtonElement) {
          handleInstall();
        }
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isVisible && isInstallable}
  <div
    class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up"
    role="dialog"
    aria-labelledby="pwa-install-title"
    aria-describedby="pwa-install-description"
  >
    <div class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl p-6 text-white">
      <div class="flex items-start gap-4">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg
              class="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h2
            id="pwa-install-title"
            class="text-xl font-bold mb-1"
          >
            Install DadDeck™
          </h2>
          <p
            id="pwa-install-description"
            class="text-sm text-white/90 mb-4"
          >
            Install our app for the best experience. Open packs anytime, even offline!
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-2 bg-white text-amber-600 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-amber-600"
              onclick={handleInstall}
            >
              Install
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-amber-600"
              onclick={handleDismiss}
            >
              Not now
            </button>
          </div>
        </div>

        <!-- Close button -->
        <button
          type="button"
          class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-amber-600"
          onclick={handleDismiss}
          aria-label="Close"
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
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
