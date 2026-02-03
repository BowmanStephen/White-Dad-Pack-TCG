<script lang="ts">
  /**
   * Offline Banner Component
   *
   * Displays a non-intrusive banner when the user is offline.
   * Automatically shows/hides based on network status.
   *
   * Features:
   * - Auto-shows when offline detected
   * - Auto-hides when connection restored
   * - Shows queue count if requests are pending
   * - Dismissible with localStorage preference
   */

  import { onMount, onDestroy } from 'svelte';
  import { getNetworkDetector, type NetworkInfo, NETWORK_EVENTS } from '@/lib/network/network-detector';
  import { getRequestQueue, type RequestQueue } from '@/lib/network/request-queue';

  // Component state
  let visible = $state(false);
  let networkInfo = $state<NetworkInfo | null>(null);
  let queueCount = $state(0);
  let dismissed = $state(false);
  let reconnecting = $state(false);

  // Network detector and queue
  let networkDetector: ReturnType<typeof getNetworkDetector>;
  let requestQueue: RequestQueue;

  // Cleanup functions for event listeners
  const unsubscribers: Array<() => void> = [];

  onMount(() => {
    // Initialize network detector
    networkDetector = getNetworkDetector();
    requestQueue = getRequestQueue(networkDetector);

    // Check initial status
    if (networkDetector.isOffline() || networkDetector.isUnstable()) {
      showBanner(networkDetector.getNetworkInfo());
    }

    // Listen for offline events
    const unsubscribeOffline = networkDetector.addListener(
      NETWORK_EVENTS.OFFLINE,
      handleOffline as EventListener
    );
    unsubscribers.push(unsubscribeOffline);

    // Listen for unstable events
    const unsubscribeUnstable = networkDetector.addListener(
      NETWORK_EVENTS.UNSTABLE,
      handleUnstable as EventListener
    );
    unsubscribers.push(unsubscribeUnstable);

    // Listen for online events
    const unsubscribeOnline = networkDetector.addListener(
      NETWORK_EVENTS.ONLINE,
      handleOnline as EventListener
    );
    unsubscribers.push(unsubscribeOnline);

    // Update queue count periodically
    const interval = setInterval(() => {
      queueCount = requestQueue.getStats().total;
    }, 1000);

    unsubscribers.push(() => clearInterval(interval));
  });

  onDestroy(() => {
    // Clean up all event listeners
    unsubscribers.forEach((unsub) => unsub());
  });

  function handleOffline(event: Event) {
    const customEvent = event as CustomEvent<NetworkInfo>;
    showBanner(customEvent.detail);
  }

  function handleUnstable(event: Event) {
    const customEvent = event as CustomEvent<NetworkInfo>;
    showBanner(customEvent.detail);
  }

  function handleOnline() {
    hideBanner();
    reconnecting = false;
  }

  function showBanner(info: NetworkInfo) {
    // Check if user dismissed this session
    if (dismissed) {
      return;
    }

    networkInfo = info;
    visible = true;

    // Log for debugging
    console.log('[OfflineBanner] Showing banner:', info);
  }

  function hideBanner() {
    visible = false;
    networkInfo = null;
  }

  function handleDismiss() {
    dismissed = true;
    hideBanner();

    // Save preference to localStorage (optional)
    try {
      localStorage.setItem('daddeck-offline-banner-dismissed', Date.now().toString());
    } catch (error) {
      console.error('[OfflineBanner] Failed to save dismissal:', error);
    }
  }

  async function handleRetry() {
    reconnecting = true;

    // Trigger queue processing
    const stats = await requestQueue.processQueue();

    console.log('[OfflineBanner] Queue processed:', stats);

    // Check if we're back online
    setTimeout(() => {
      if (networkDetector.isOnline()) {
        handleOnline();
      } else {
        reconnecting = false;
      }
    }, 2000);
  }

  // Get icon based on status
  function getIcon(): string {
    if (networkInfo?.status === 'unstable') {
      // Warning icon for unstable
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    }

    // Offline icon
    return 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0';
  }

  // Get message based on status
  function getMessage(): string {
    if (networkInfo?.status === 'unstable') {
      return 'Connection unstable. Some features may be slow.';
    }

    if (queueCount > 0) {
      return `You're offline. ${queueCount} request${queueCount === 1 ? '' : 's'} will sync when you reconnect.`;
    }

    return "You're offline. Your data is safe and will sync when you reconnect.";
  }
</script>

{#if visible}
  <div
    class="offline-banner"
    role="alert"
    aria-live="polite"
    class:banner-warning={networkInfo?.status === 'unstable'}
  >
    <div class="banner-content">
      <!-- Icon -->
      <svg
        class="banner-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d={getIcon()}
        />
      </svg>

      <!-- Message -->
      <div class="banner-message">
        <p class="message-text">{getMessage()}</p>
        {#if reconnecting}
          <p class="retry-text">
            <svg class="animate-spin inline w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Attempting to reconnect...
          </p>
        {/if}
      </div>

      <!-- Actions -->
      <div class="banner-actions">
        {#if !reconnecting}
          <button
            onclick={handleRetry}
            class="retry-btn"
            disabled={networkInfo?.status === 'offline'}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </button>
        {/if}

        <button onclick={handleDismiss} class="dismiss-btn" aria-label="Dismiss">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  .offline-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-bottom: 2px solid #991b1b;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.3s ease-out;
  }

  .offline-banner.banner-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-bottom-color: #b45309;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .banner-content {
    max-width: 7xl;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .banner-icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    color: white;
  }

  .banner-message {
    flex: 1;
    min-width: 0;
  }

  .message-text {
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.25;
  }

  .retry-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.75rem;
    margin: 0.25rem 0 0 0;
    display: flex;
    align-items: center;
  }

  .banner-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .retry-btn,
  .dismiss-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    gap: 0.5rem;
  }

  .retry-btn {
    background: white;
    color: #dc2626;
  }

  .retry-btn:hover:not(:disabled) {
    background: #f3f4f6;
    transform: scale(1.05);
  }

  .retry-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dismiss-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem;
  }

  .dismiss-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .banner-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .banner-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .message-text {
      font-size: 0.8125rem;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .offline-banner {
      background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
    }

    .offline-banner.banner-warning {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    }

    .retry-btn {
      background: #1f2937;
      color: white;
    }

    .retry-btn:hover:not(:disabled) {
      background: #374151;
    }
  }
</style>
