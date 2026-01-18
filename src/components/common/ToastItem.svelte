<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { NotificationType } from '../../types';

  interface Props {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
  }

  let { id, message, type, duration = 3000 }: Props = $props();

  let visible = $state(false);
  let isExiting = $state(false);
  let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

  // Icon mapping for each notification type
  const icons: Record<NotificationType, string> = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠',
    achievement: '🏆',
  };

  // Color mapping for each notification type
  const colors: Record<NotificationType, { bg: string; border: string; text: string }> = {
    success: {
      bg: 'rgba(34, 197, 94, 0.95)',
      border: 'rgba(34, 197, 94, 0.5)',
      text: '#ffffff',
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.95)',
      border: 'rgba(239, 68, 68, 0.5)',
      text: '#ffffff',
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.95)',
      border: 'rgba(59, 130, 246, 0.5)',
      text: '#ffffff',
    },
    warning: {
      bg: 'rgba(251, 191, 36, 0.95)',
      border: 'rgba(251, 191, 36, 0.5)',
      text: '#000000',
    },
    achievement: {
      bg: 'rgba(168, 85, 247, 0.95)',
      border: 'rgba(168, 85, 247, 0.5)',
      text: '#ffffff',
    },
  };

  onMount(() => {
    // Trigger slide-in animation
    requestAnimationFrame(() => {
      visible = true;
    });

    // Auto-dismiss after duration
    if (duration > 0) {
      autoDismissTimer = setTimeout(() => {
        dismiss();
      }, duration);
    }
  });

  onDestroy(() => {
    // Cleanup auto-dismiss timer
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
  });

  function dismiss() {
    isExiting = true;
    // Wait for exit animation to complete
    setTimeout(() => {
      const { removeToast } = require('../../stores/ui');
      removeToast(id);
    }, 300); // Match CSS transition duration
  }

  function handleMouseEnter() {
    // Pause auto-dismiss on hover
    // Could implement pausing the timer here if needed
  }

  function handleMouseLeave() {
    // Resume auto-dismiss timer
    // Could implement resuming the timer here if needed
  }
</script>

<div
  class="toast-item"
  class:visible
  class:exiting={isExiting}
  style="--toast-bg: {colors[type].bg}; --toast-border: {colors[type].border}; --toast-text: {colors[type].text};"
  role="alert"
  aria-live="polite"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <span class="toast-icon" aria-hidden="true">{icons[type]}</span>
  <span class="toast-message">{message}</span>
  <button
    class="toast-close"
    on:click={dismiss}
    aria-label="Dismiss notification"
    type="button"
  >
    ✕
  </button>
</div>

<style>
  .toast-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--toast-bg);
    border: 2px solid var(--toast-border);
    border-radius: 0.75rem;
    color: var(--toast-text);
    font-size: 0.9375rem;
    line-height: 1.4;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    opacity: 0;
    transform: translateX(100%);
    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
    will-change: opacity, transform;
    pointer-events: auto;
    cursor: pointer;
    min-width: 300px;
    max-width: 450px;
  }

  .toast-item.visible {
    opacity: 1;
    transform: translateX(0);
  }

  .toast-item.exiting {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
    transition: opacity 0.3s ease-in, transform 0.3s ease-in;
  }

  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1.125rem;
    font-weight: bold;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }

  .toast-message {
    flex: 1;
    word-break: break-word;
  }

  .toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    color: inherit;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
    flex-shrink: 0;
  }

  .toast-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .toast-close:active {
    transform: scale(0.95);
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .toast-item {
      transition: opacity 0.2s ease;
      transform: none;
    }

    .toast-item.visible {
      transform: none;
    }

    .toast-item.exiting {
      transform: none;
    }

    .toast-close:hover {
      transform: none;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .toast-item {
      min-width: calc(100vw - 2rem);
      max-width: calc(100vw - 2rem);
      padding: 0.875rem 1rem;
      font-size: 0.875rem;
    }

    .toast-icon,
    .toast-close {
      width: 1.25rem;
      height: 1.25rem;
      font-size: 1rem;
    }
  }
</style>
