<script lang="ts">
  import { onMount } from 'svelte';
  import type { Card } from '@/types';

  interface Props {
    card: Card;
    show?: boolean;
    delay?: number;
  }

  let {
    card,
    show = true,
    delay = 0,
  }: Props = $props();

  let visible = $state(false);
  let animate = $state(false);

  onMount(() => {
    // Start animation after delay
    const timer = setTimeout(() => {
      if (show) {
        visible = true;
        // Trigger scale animation after a brief delay
        setTimeout(() => {
          animate = true;
        }, 50);
      }
    }, delay);

    return () => clearTimeout(timer);
  });

  const isVisible = $derived(show && visible);
</script>

{#if isVisible}
  <div
    class="new-badge"
    class:animate={animate}
    role="status"
    aria-live="assertive"
    aria-atomic="true"
    aria-label="New card discovery"
  >
    <svg class="sparkle-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
    </svg>
    <span class="badge-text">NEW!</span>
    <svg class="sparkle-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
    </svg>
  </div>
{/if}

<style>
  .new-badge {
    position: absolute;
    top: -12px;
    right: -12px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    border-radius: 20px;
    box-shadow:
      0 4px 12px rgba(245, 158, 11, 0.5),
      0 0 20px rgba(239, 68, 68, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: scale(0);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
  }

  .new-badge.animate {
    transform: scale(1);
    /* badgePulse infinite animation REMOVED for performance */
  }

  .badge-text {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.1em;
    color: white;
    text-shadow:
      0 1px 2px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(255, 255, 255, 0.5);
  }

  .sparkle-icon {
    width: 12px;
    height: 12px;
    color: #fef3c7;
    /* filter and animation REMOVED for performance */
  }

  @keyframes badgePop {
    0% {
      transform: scale(0) rotate(-10deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(5deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes badgePulse {
    0%, 100% {
      box-shadow:
        0 4px 12px rgba(245, 158, 11, 0.5),
        0 0 20px rgba(239, 68, 68, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
    50% {
      box-shadow:
        0 4px 16px rgba(245, 158, 11, 0.7),
        0 0 30px rgba(239, 68, 68, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }
  }

  @keyframes sparkleRotate {
    0% {
      transform: rotate(0deg) scale(1);
    }
    50% {
      transform: rotate(180deg) scale(1.1);
    }
    100% {
      transform: rotate(360deg) scale(1);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .new-badge {
      transition: transform 0.2s ease-out;
    }

    .sparkle-icon {
      animation: none;
    }

    .new-badge.animate {
      animation: badgePop 0.3s ease-out;
    }
  }
</style>
