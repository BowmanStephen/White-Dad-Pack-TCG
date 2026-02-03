<!--
Tutorial.svelte

Main tutorial orchestration component that manages the first-time user experience.
This is the entry point for the tutorial system as specified in ONBOARD-001.

Integrates:
- TutorialOverlay for visual display
- TutorialAutoStart for automatic triggering
- localStorage tracking for completion status

Usage:
  <Tutorial client:idle />

The tutorial will automatically:
1. Check if user has completed it (localStorage)
2. Auto-start after 1.5s on landing page if not completed
3. Guide user through pack opening, card reveal, and collection
4. Track completion status in localStorage
-->
<script lang="ts">
  import TutorialOverlay from '@components/onboarding/TutorialOverlay.svelte';

  // TutorialOverlay handles all the logic
  // This component is just an entry point as specified in ONBOARD-001
  // We use onMount to ensure we only run on client-side

  $effect(() => {
    console.log('[Tutorial] Tutorial component mounted');
  });
</script>

<!-- The TutorialOverlay handles all visual display -->
<TutorialOverlay />

<style>
  /* This component is a wrapper/orchestrator */
  /* All visual styling is handled by TutorialOverlay */
</style>
