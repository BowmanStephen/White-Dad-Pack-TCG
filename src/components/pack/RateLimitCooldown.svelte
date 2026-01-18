<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { packRateLimit, cooldownRemaining } from '../../stores/security';

  // Reactive state
  let remaining = $state<number>(0);
  let isBlocked = $state<boolean>(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  // Subscribe to stores
  onMount(() => {
    const unsubscribers = [
      packRateLimit.subscribe((status) => {
        isBlocked = status.isBlocked;
        remaining = cooldownRemaining.get();
      }),
    ];

    // Update countdown every second if blocked
    intervalId = setInterval(() => {
      if (isBlocked) {
        remaining = cooldownRemaining.get();
      }
    }, 1000);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      if (intervalId) clearInterval(intervalId);
    };
  });

  // Format seconds as MM:SS
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
</script>

{#if isBlocked && remaining > 0}
  <div class="rate-limit-cooldown">
    <div class="cooldown-content">
      <svg
        class="cooldown-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <div class="cooldown-text">
        <span class="cooldown-label">Rate limit reached</span>
        <span class="cooldown-timer">Wait {formatTime(remaining)} to open more</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .rate-limit-cooldown {
    padding: 1rem;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.75rem;
    margin: 1rem 0;
    animation: slideIn 0.3s ease-out;
  }

  .cooldown-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .cooldown-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: rgb(239, 68, 68);
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  .cooldown-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .cooldown-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(220, 38, 38);
  }

  .cooldown-timer {
    font-size: 0.875rem;
    font-weight: 400;
    color: rgb(153, 27, 27);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rate-limit-cooldown {
      animation: none;
    }
    .cooldown-icon {
      animation: none;
    }
  }
</style>
