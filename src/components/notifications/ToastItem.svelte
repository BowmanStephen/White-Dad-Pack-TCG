<script lang="ts">
  import { removeNotification } from '../../stores/notifications';
  import type { Notification } from '../../types';
  import { fly } from 'svelte/transition';

  export let notification: Notification;

  const iconMap: Record<Notification['type'], string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
    achievement: '🏆',
  };

  const typeColors: Record<Notification['type'], string> = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    achievement: 'text-purple-600',
  };

  const icon = notification.icon || iconMap[notification.type];
  const titleColor = typeColors[notification.type];
  const hasActions = notification.actions && notification.actions.length > 0;

  function handleAction(action: any) {
    action.action();
    removeNotification(notification.id);
  }

  function handleClose() {
    removeNotification(notification.id);
  }
</script>

<div
  class="flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 pointer-events-auto min-w-[320px] max-w-md bg-white dark:bg-gray-800"
  class:notification-success={notification.type === 'success'}
  class:notification-error={notification.type === 'error'}
  class:notification-info={notification.type === 'info'}
  class:notification-warning={notification.type === 'warning'}
  class:notification-achievement={notification.type === 'achievement'}
  transition:fly="{{ y: -50, duration: 300, easing: 'ease-out' }}"
  role="alert"
  aria-live="polite"
>
  <div class="flex-shrink-0 text-2xl" aria-hidden="true">
    {icon}
  </div>

  <div class="flex-1 min-w-0">
    <h3 class="font-semibold text-gray-900 dark:text-white text-sm {titleColor}">
      {notification.title}
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
      {notification.message}
    </p>

    {#if hasActions}
      <div class="flex gap-2 mt-3">
        {#each notification.actions as action}
          <button
            on:click={() => handleAction(action)}
            class:btn-primary={action.primary}
            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          >
            {action.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <button
    on:click={handleClose}
    class="flex-shrink-0 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    aria-label="Close notification"
  >
    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>

<style>
  .notification-success {
    border-left-color: #22c55e;
  }

  .notification-error {
    border-left-color: #ef4444;
  }

  .notification-info {
    border-left-color: #3b82f6;
  }

  .notification-warning {
    border-left-color: #eab308;
  }

  .notification-achievement {
    border-left-color: #a855f7;
  }

  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }

  :global(.dark) .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }

  button:not(.btn-primary) {
    @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
  }

  :global(.dark) button:not(.btn-primary) {
    @apply bg-gray-700 text-gray-300 hover:bg-gray-600;
  }
</style>
