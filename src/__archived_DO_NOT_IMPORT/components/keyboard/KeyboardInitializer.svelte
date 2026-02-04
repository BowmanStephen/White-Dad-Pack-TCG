<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '@/lib/utils/browser';
  import { initializeShortcuts } from '@/lib/keyboard/shortcuts';

  onMount(() => {
    // Only initialize in browser environment
    if (browser) {
      initializeShortcuts();
      console.log('[Keyboard] Shortcuts system initialized');
    }
  });
</script>

<!-- This component initializes the keyboard shortcuts system -->
<!-- It has no visual output, just sets up the global keyboard event listeners -->
