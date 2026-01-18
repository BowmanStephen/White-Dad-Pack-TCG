<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeStreakNotifications } from '@/lib/notifications/streak';

  // Initialize streak notifications on app load
  onMount(() => {
    try {
      initializeStreakNotifications();
      console.log('[STREAK NOTIFICATIONS] System initialized');
    } catch (error) {
      console.error('[STREAK NOTIFICATIONS] Failed to initialize:', error);
    }
  });
</script>

<!-- This component has no UI - it only initializes the notification system -->
