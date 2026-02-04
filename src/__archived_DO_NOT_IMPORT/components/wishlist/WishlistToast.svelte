<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import type { PackCard } from '@/types';
  import { RARITY_CONFIG } from '@/types';

  // Props
  export let cards: PackCard[] = [];
  export let show: boolean = false;
  export let onClose: () => void = () => {};

  // Auto-dismiss after 5 seconds
  let timeoutId: number | null = null;

  onMount(() => {
    if (show && timeoutId === null) {
      timeoutId = window.setTimeout(() => {
        handleClose();
      }, 5000);
    }

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  });

  function handleClose() {
    show = false;
    onClose();
  }
</script>

{#if show && cards.length > 0}
  <div
    class="wishlist-toast-container"
    transition:fly="{{ y: -50, duration: 400 }}"
  >
    <!-- Toast content -->
    <div class="toast-content">
      <!-- Star icon -->
      <div class="toast-icon">
        ⭐
      </div>

      <!-- Message -->
      <div class="toast-body">
        <h3 class="toast-title">
          {cards.length === 1 ? 'Wishlist Card Pulled!' : 'Wishlist Cards Pulled!'}
        </h3>
        <p class="toast-description">
          {#each cards as card, i}
            {#if i > 0}, {/if}
            <span class="card-name" style="color: {RARITY_CONFIG[card.rarity].color};">
              {card.name}
            </span>
          {/each}
        </p>
      </div>

      <!-- Close button -->
      <button
        on:click={handleClose}
        class="toast-close"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>

    <!-- Glow effect -->
    <div class="toast-glow"></div>
  </div>
{/if}

<style>
  .wishlist-toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 320px;
    max-width: 400px;
    background: linear-gradient(135deg, #f59e0b22, #d9770622);
    border: 2px solid #f59e0b;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
    animation: slideIn 0.4s ease-out, glow-pulse 2s ease-in-out infinite;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes glow-pulse {
    0%, 100% {
      box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
    }
    50% {
      box-shadow: 0 8px 48px rgba(245, 158, 11, 0.5);
    }
  }

  .toast-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toast-icon {
    font-size: 40px;
    line-height: 1;
    animation: starBounce 0.6s ease-out;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  @keyframes starBounce {
    0%, 100% {
      transform: scale(1) rotate(0deg);
    }
    50% {
      transform: scale(1.3) rotate(10deg);
    }
  }

  .toast-body {
    flex: 1;
  }

  .toast-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 4px 0;
    line-height: 1.2;
    color: #f59e0b;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .toast-description {
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
    color: #ffffff;
  }

  .card-name {
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .toast-close {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .toast-close:active {
    transform: scale(0.95);
  }

  .toast-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    pointer-events: none;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
    opacity: 0.5;
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .wishlist-toast-container {
      top: 10px;
      right: 10px;
      left: 10px;
      min-width: auto;
      max-width: none;
    }

    .toast-icon {
      font-size: 32px;
    }

    .toast-title {
      font-size: 14px;
    }

    .toast-description {
      font-size: 13px;
    }
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .wishlist-toast-container,
    .toast-icon,
    .toast-close {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
