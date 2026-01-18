<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeMotionSettings } from '../../stores/motion';

  /**
   * Motion Settings Initializer
   *
   * Initializes motion preference detection on app mount.
   * - Detects system prefers-reduced-motion setting
   * - Loads saved user preference from LocalStorage
   * - Sets up listener for system preference changes
   *
   * PACK-057: Accessibility - Reduced Motion
   */

  onMount(() => {
    // Initialize motion settings on app load
    initializeMotionSettings();
  });
</script>

<!-- This component has no UI -->
