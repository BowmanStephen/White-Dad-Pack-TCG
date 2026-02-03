<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    isOnline,
    queueCount,
    isProcessing,
    processResults,
    initOfflineDetection,
    processQueue,
    clearQueue
  } from '@/stores/offline';
  import { subscribeToStores } from '@/lib/utils/store-helpers';

  // Local state
  let showBackOnlineBanner = $state(false);
  let online = $state(isOnline.get());
  let queuedCount = $state(queueCount.get());
  let processing = $state(isProcessing.get());
  let results = $state(processResults.get());

  // Initialize offline detection on mount
  let cleanup: (() => void) | null = null;
  let unsubscribeStores: (() => void) | null = null;

  onMount(() => {
    cleanup = initOfflineDetection();

    // Show back online banner when transitioning from offline to online
    const unsubscribe = isOnline.subscribe((value) => {
      online = value;
      if (value && queueCount.get() > 0) {
        showBackOnlineBanner = true;
        setTimeout(() => {
          showBackOnlineBanner = false;
        }, 5000); // Show for 5 seconds
      }
    });

    unsubscribeStores = subscribeToStores([
      { store: queueCount, onUpdate: (value) => { queuedCount = value; } },
      { store: isProcessing, onUpdate: (value) => { processing = value; } },
      { store: processResults, onUpdate: (value) => { results = value; } },
    ]);

    return () => {
      cleanup?.();
      unsubscribe();
      unsubscribeStores?.();
    };
  });

  // Manual retry button
  function handleRetry() {
    if (online) {
      processQueue();
    }
  }

  // Clear failed actions
  function handleClearFailed() {
    clearQueue();
    processResults.set([]);
  }
</script>

{#if !online}
  <!-- Offline Banner -->
  <div
    class="offline-banner"
    role="alert"
    aria-live="polite"
  >
    <div class="banner-content">
      <!-- Offline Icon -->
      <svg
        class="offline-icon"
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

      <!-- Message -->
      <div class="banner-text">
        <p class="banner-title">You're offline</p>
        {#if queuedCount > 0}
          <p class="banner-subtitle">
            {queuedCount} {queuedCount === 1 ? 'action' : 'actions'} queued for retry
          </p>
        {:else}
          <p class="banner-subtitle">Some features may be limited</p>
        {/if}
      </div>

      <!-- Queue Status -->
      {#if queuedCount > 0}
        <div class="queue-status">
          <svg
            class="queue-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="queue-count">{queuedCount}</span>
        </div>
      {/if}
    </div>
  </div>
{:else if showBackOnlineBanner && queuedCount > 0}
  <!-- Back Online - Processing Queue Banner -->
  <div
    class="online-banner processing"
    role="status"
    aria-live="polite"
  >
    <div class="banner-content">
      <!-- Processing Icon -->
      {#if processing}
        <svg
          class="processing-icon spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
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
      {:else}
        <svg
          class="online-icon"
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
      {/if}

      <!-- Message -->
      <div class="banner-text">
        <p class="banner-title">
          {processing ? 'Syncing your collection...' : 'You\'re back online!'}
        </p>
        <p class="banner-subtitle">
          {processing
            ? `Processing ${queuedCount} queued action${queuedCount === 1 ? '' : 's'}`
            : `${queuedCount} queued action${queuedCount === 1 ? '' : 's'} to sync`}
        </p>
      </div>

      <!-- Actions -->
      <div class="banner-actions">
        {#if !processing}
          <button
            onclick={handleRetry}
            class="btn-retry"
            type="button"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry Now
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else if showBackOnlineBanner}
  <!-- Back Online - Success Banner -->
  <div
    class="online-banner success"
    role="status"
    aria-live="polite"
  >
    <div class="banner-content">
      <!-- Success Icon -->
      <svg
        class="online-icon"
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

      <!-- Message -->
      <div class="banner-text">
        <p class="banner-title">You're back online!</p>
        <p class="banner-subtitle">Everything is up to date</p>
      </div>
    </div>
  </div>
{/if}

<!-- Process Results Display (shows failures) -->
{#if results.length > 0}
  {@const failed = results.filter(r => !r.success)}
  {#if failed.length > 0}
    <div class="process-results">
      <div class="results-banner warning">
        <div class="banner-content">
          <svg
            class="warning-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="banner-text">
            <p class="banner-title">{queuedCount} action{queuedCount === 1 ? '' : 's'} failed</p>
            <p class="banner-subtitle">Some queued actions couldn't be completed</p>
          </div>
          <button
            onclick={handleClearFailed}
            class="btn-clear"
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  /* Banner container */
  .offline-banner,
  .online-banner,
  .results-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10001;
    padding: 0.75rem 1rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    animation: slide-down 0.3s ease-out;
  }

  /* Offline banner - red gradient */
  .offline-banner {
    background: linear-gradient(90deg, rgb(220, 38, 38), rgb(185, 28, 28));
    color: white;
  }

  /* Online banner - green gradient */
  .online-banner {
    background: linear-gradient(90deg, rgb(22, 163, 74), rgb(21, 128, 61));
    color: white;
  }

  /* Results banner - warning */
  .results-banner.warning {
    background: linear-gradient(90deg, rgb(234, 179, 8), rgb(202, 138, 4));
    color: rgb(15, 23, 42);
    top: 3.5rem; /* Position below online banner */
  }

  /* Banner content layout */
  .banner-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  /* Icons */
  .offline-icon,
  .online-icon,
  .processing-icon,
  .warning-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  /* Banner text */
  .banner-text {
    flex: 1;
  }

  .banner-title {
    font-weight: 600;
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.25rem;
  }

  .banner-subtitle {
    font-size: 0.75rem;
    margin: 0;
    line-height: 1rem;
    opacity: 0.9;
  }

  /* Queue status indicator */
  .queue-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .queue-icon {
    width: 0.875rem;
    height: 0.875rem;
  }

  .queue-count {
    font-weight: 700;
  }

  /* Banner actions */
  .banner-actions {
    display: flex;
    gap: 0.5rem;
  }

  /* Buttons */
  .btn-retry,
  .btn-clear {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 0.5rem;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }

  .btn-retry {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .btn-retry:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .btn-clear {
    background: rgba(15, 23, 42, 0.2);
    color: rgb(15, 23, 42);
  }

  .btn-clear:hover {
    background: rgba(15, 23, 42, 0.3);
  }

  /* Animations */
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

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .banner-content {
      flex-wrap: wrap;
    }

    .banner-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .results-banner.warning {
      top: 4.5rem;
    }
  }

  /* Dark mode support */
  :global(html.dark) .results-banner.warning {
    background: linear-gradient(90deg, rgb(161, 98, 7), rgb(133, 77, 14));
    color: white;
  }

  :global(html.dark) .btn-clear {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  :global(html.dark) .btn-clear:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>
