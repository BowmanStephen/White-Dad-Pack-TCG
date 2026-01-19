<!--
TutorialAutoStart.svelte

Automatically starts the first-time tutorial for new users.
Should be loaded on every page to check if tutorial is needed.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import {
    isTutorialCompleted,
    autoStartTutorial,
  } from '@/stores/tutorial';

  onMount(() => {
    // Only run on client-side (after hydration)
    if (typeof window === 'undefined') return;

    // Only auto-start on the landing page and if not already completed
    const isLandingPage = window.location.pathname === '/';

    // Check if user has completed the first-time tutorial
    if (!isTutorialCompleted('first_time')) {
      // Auto-start tutorial after a short delay on landing page
      if (isLandingPage) {
        setTimeout(() => {
          autoStartTutorial();
        }, 1500); // Wait 1.5 seconds to let page load
      }
    }
  });
</script>

<!-- This component doesn't render anything visible -->
