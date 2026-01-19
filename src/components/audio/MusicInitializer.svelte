<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeMusic } from '@/lib/audio/music';

  /**
   * Music Initializer Component
   *
   * Initializes the background music system when the app loads.
   * The music doesn't auto-play - it waits for user interaction
   * to comply with browser autoplay policies.
   */

  onMount(() => {
    // Initialize the music system singleton
    initializeMusic();

    console.debug('[Music] Background music system initialized');
  });
</script>

<!-- This component has no UI - it just initializes the music system -->
