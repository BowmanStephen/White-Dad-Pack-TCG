<script lang="ts">
  import { notifications } from '../../stores/notifications';
  import ToastItem from './ToastItem.svelte';
  import { onMount } from 'svelte';

  // Position of notification container
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

  const positionClasses: Record<typeof position, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  $: positionClass = positionClasses[position];
  $: toasts = $notifications;
  $: hasToasts = toasts.length > 0;

  onMount(() => {
    // Initialize push notification permission check
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't auto-request, let user opt-in
      console.log('Notifications available but permission not requested');
    }
  });
</script>

{#if hasToasts}
  <div
    class="notification-container fixed z-50 flex flex-col gap-2 pointer-events-none {positionClass}"
    role="region"
    aria-label="Notifications"
    aria-live="polite"
  >
    {#each toasts as notification (notification.id)}
      <ToastItem {notification} />
    {/each}
  </div>
{/if}

<style>
  .notification-container {
    max-width: 400px;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  /* Custom scrollbar for notification container */
  .notification-container::-webkit-scrollbar {
    width: 6px;
  }

  .notification-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .notification-container::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }

  .notification-container::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.8);
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .notification-container {
      left: 0.5rem !important;
      right: 0.5rem !important;
      max-width: none;
    }
  }
</style>
