<!--
TutorialTrigger.svelte

Renders a child element with data-tutorial attribute for tutorial targeting.
This component marks elements that should be highlighted during tutorial steps.
-->
<script lang="ts">
  import { onMount } from 'svelte';

  export let id: string; // Tutorial target ID (e.g., "pack-button", "collection-link")
  export let highlight: boolean = false; // Whether to add visual highlight
  export let pulse: boolean = true; // Whether to pulse the highlight

  let element: HTMLElement;

  onMount(() => {
    if (element) {
      // Add data-tutorial attribute for targeting
      element.setAttribute('data-tutorial', id);

      // Add ARIA label for screen readers
      element.setAttribute('aria-label', `Tutorial step: ${id}`);
    }
  });
</script>

{#if highlight}
  <span
    bind:this={element}
    class="tutorial-target"
    class:pulse={pulse}
    on:click
  >
    <slot />
  </span>
{:else}
  <span bind:this={element} on:click>
    <slot />
  </span>
{/if}

<style>
  .tutorial-target {
    position: relative;
  }

  .pulse {
    animation: tutorial-pulse 2s ease-in-out infinite;
  }

  @keyframes tutorial-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0px rgba(250, 204, 21, 0);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(250, 204, 21, 0.3);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .pulse {
      animation: none;
    }
  }
</style>
