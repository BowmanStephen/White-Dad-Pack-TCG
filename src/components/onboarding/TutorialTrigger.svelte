<!--
TutorialTrigger.svelte

Renders a child element with data-tutorial attribute for tutorial targeting.
This component marks elements that should be highlighted during tutorial steps.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    id: string;
    highlight?: boolean;
    pulse?: boolean;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  }

  // Tutorial target ID (e.g., "pack-button", "collection-link")
  let {
    id,
    highlight = false,
    pulse = true,
    onclick,
    children,
  }: Props = $props();

  let element = $state<HTMLElement | null>(null);

  onMount(() => {
    if (element) {
      // Add data-tutorial attribute for targeting
      element.setAttribute('data-tutorial', id);

      // Add ARIA label for screen readers
      element.setAttribute('aria-label', `Tutorial step: ${id}`);
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    if (!element || !onclick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      element.click();
    }
  }
</script>

{#if highlight}
  {#if onclick}
    <span
      bind:this={element}
      class="tutorial-target"
      class:pulse={pulse}
      onclick={onclick}
      onkeydown={handleKeydown}
      role="button"
      tabindex="0"
    >
      {@render children?.()}
    </span>
  {:else}
    <span
      bind:this={element}
      class="tutorial-target"
      class:pulse={pulse}
    >
      {@render children?.()}
    </span>
  {/if}
{:else}
  {#if onclick}
    <span
      bind:this={element}
      onclick={onclick}
      onkeydown={handleKeydown}
      role="button"
      tabindex="0"
    >
      {@render children?.()}
    </span>
  {:else}
    <span bind:this={element}>
      {@render children?.()}
    </span>
  {/if}
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
