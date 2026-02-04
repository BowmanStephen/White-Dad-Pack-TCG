<!--
TutorialAutoStart.svelte

Automatically starts the first-time tutorial for new users.
Should be loaded on every page to check if tutorial is needed.
Waits for welcome modal to be dismissed before starting.
-->
<script lang="ts">
import { onDestroy } from 'svelte';
import {
  isTutorialCompleted,
  autoStartTutorial,
  welcomeModalVisible,
  welcomeSeen,
} from '@/stores/tutorial';

let autoStartTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;

// Use $effect with proper cleanup
$effect(() => {
  // Only run on client-side (after hydration)
  if (typeof window === 'undefined') return;
  if (navigator.webdriver) return;

  // Only auto-start on the landing page
  const isLandingPage = window.location.pathname === '/';
  if (!isLandingPage) return;

  // Check if user has completed the first-time tutorial
  if (isTutorialCompleted('first_time')) return;

  // Subscribe to welcome modal visibility
  // Only start tutorial when welcome modal is dismissed
  unsubscribe = welcomeModalVisible.subscribe((isWelcomeOpen: boolean) => {
    // Clear any existing timer
    if (autoStartTimer) {
      clearTimeout(autoStartTimer);
      autoStartTimer = null;
    }

    // If welcome modal is open, don't start tutorial
    if (isWelcomeOpen) return;

    // If welcome has been seen (dismissed), start tutorial after delay
    if (welcomeSeen.get()) {
      autoStartTimer = setTimeout(() => {
        autoStartTutorial();
      }, 500); // Short delay after welcome is dismissed
    }
  });

  // Cleanup function for $effect
  return () => {
    if (autoStartTimer) {
      clearTimeout(autoStartTimer);
      autoStartTimer = null;
    }
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
});

// Additional cleanup on destroy
onDestroy(() => {
  if (autoStartTimer) {
    clearTimeout(autoStartTimer);
  }
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<!-- This component doesn't render anything visible -->
