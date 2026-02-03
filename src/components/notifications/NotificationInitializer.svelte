<script lang="ts">
  import { initializeStreakNotifications } from '@/lib/notifications/streak';

  // Initialize streak notifications on app load
  $effect(() => {
    try {
      initializeStreakNotifications();
      console.log('[STREAK NOTIFICATIONS] System initialized');
    } catch (error) {
      console.error('[STREAK NOTIFICATIONS] Failed to initialize:', error);
    }
  });
</script>

<!-- This component has no UI - it only initializes the notification system -->
