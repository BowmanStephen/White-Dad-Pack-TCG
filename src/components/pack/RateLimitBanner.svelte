<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { rateLimitStatus } from '@/stores/pack';
  import type { RateLimitStatus } from '@/types/security';

  // Reactive state
  let status = $state<RateLimitStatus>({
    remaining: 10,
    resetAt: new Date(),
    isBlocked: false,
  });

  // Countdown timer for cooldown
  let countdown = $state<number>(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // Subscribe to rate limit status
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    // Subscribe to rate limit status changes
    unsubscribe = rateLimitStatus.subscribe((value) => {
      status = value;

      // Start countdown if blocked
      if (value.isBlocked && value.retryAfter) {
        startCountdown(value.retryAfter);
      } else {
        stopCountdown();
      }
    });

    // Initial status check
    status = rateLimitStatus.get();
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    stopCountdown();
  });

  function startCountdown(seconds: number) {
    countdown = seconds;
    stopCountdown();

    timerInterval = setInterval(() => {
      countdown -= 1;

      if (countdown <= 0) {
        stopCountdown();
        // Refresh rate limit status when countdown expires
        status = rateLimitStatus.get();
      }
    }, 1000);
  }

  function stopCountdown() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Format countdown as MM:SS
  function formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Calculate warning level based on remaining packs
  function getWarningLevel(): 'safe' | 'warning' | 'danger' {
    if (status.remaining <= 2) return 'danger';
    if (status.remaining <= 4) return 'warning';
    return 'safe';
  }

  // Calculate progress percentage
  function getProgressPercentage(): number {
    return (status.remaining / 10) * 100;
  }
</script>

{#if status.isBlocked}
  <!-- Blocked state - red banner with countdown -->
  <div class="rate-limit-banner rate-limit-blocked">
    <div class="rate-limit-icon">⏳</div>
    <div class="rate-limit-content">
      <div class="rate-limit-title">Rate Limit Reached</div>
      <div class="rate-limit-message">
        You've opened too many packs. Please wait {formatCountdown(countdown)} before opening more.
      </div>
    </div>
  </div>
{:else if getWarningLevel() !== 'safe'}
  <!-- Warning state - yellow/orange banner -->
  <div class="rate-limit-banner rate-limit-warning">
    <div class="rate-limit-icon">⚠️</div>
    <div class="rate-limit-content">
      <div class="rate-limit-title">
        {status.remaining} packs remaining this minute
      </div>
      <div class="rate-limit-progress">
        <div
          class="rate-limit-progress-bar"
          class:rate-limit-progress-danger={getWarningLevel() === 'danger'}
          class:rate-limit-progress-warning={getWarningLevel() === 'warning'}
          style="width: {getProgressPercentage()}%"
        ></div>
      </div>
    </div>
  </div>
{/if}

<style>
  .rate-limit-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    animation: slideDown 0.3s ease-out;
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

  .rate-limit-blocked {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white;
  }

  .rate-limit-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .rate-limit-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .rate-limit-content {
    flex: 1;
    min-width: 0;
  }

  .rate-limit-title {
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 0.25rem;
  }

  .rate-limit-message {
    font-size: 0.8125rem;
    line-height: 1.25rem;
    opacity: 0.95;
  }

  .rate-limit-progress {
    width: 100%;
    height: 0.5rem;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 9999px;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .rate-limit-progress-bar {
    height: 100%;
    background: white;
    border-radius: 9999px;
    transition: width 0.3s ease-out;
  }

  .rate-limit-progress-danger {
    background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
  }

  .rate-limit-progress-warning {
    background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .rate-limit-banner {
      padding: 0.75rem 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .rate-limit-icon {
      font-size: 1.25rem;
    }

    .rate-limit-title {
      font-size: 0.8125rem;
    }

    .rate-limit-message {
      font-size: 0.75rem;
    }
  }
</style>
