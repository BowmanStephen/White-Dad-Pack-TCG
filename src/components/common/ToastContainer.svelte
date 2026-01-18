<script lang="ts">
  import { toasts, type NotificationType } from '../../stores/ui';
  import ToastItem from './ToastItem.svelte';

  // Maximum number of toasts to show at once
  const MAX_TOASTS = 5;

  // Auto-dismiss duration (can be overridden per toast)
  const DEFAULT_DURATION = 4000;

  // Enhanced toast interface matching the store
  interface Toast {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
  }

  // Get current toasts from store, limited to MAX_TOASTS
  $: displayToasts = $toasts.slice(-MAX_TOASTS);
</script>

<div class="toast-container" role="region" aria-label="Notifications" aria-live="polite">
  {#each displayToasts as toast (toast.id)}
    <ToastItem
      id={toast.id}
      message={toast.message}
      type={toast.type}
      duration={toast.duration ?? DEFAULT_DURATION}
    />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    overflow-x: visible;
    padding: 0.5rem;
  }

  /* Custom scrollbar for toast container */
  .toast-container::-webkit-scrollbar {
    width: 6px;
  }

  .toast-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  .toast-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }

  .toast-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .toast-container {
      top: auto;
      bottom: 1rem;
      right: 1rem;
      left: 1rem;
      max-height: 50vh;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .toast-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .toast-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
    }

    .toast-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .toast-item {
      transform: none !important;
    }
  }
</style>
