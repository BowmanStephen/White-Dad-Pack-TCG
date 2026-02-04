<script lang="ts">
  /**
   * UpgradeInitializer.svelte
   *
   * Initializes the upgrade store on app load by loading
   * upgrade data from localStorage.
   */

  import { onMount } from 'svelte';
  import { initializeUpgradeStore } from '@/stores/upgrade';

  onMount(() => {
    initializeUpgradeStore();
  });
</script>

<!-- This component has no UI -->
