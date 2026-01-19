<script lang="ts">
  import { onMount, tick } from 'svelte';

  export let delay: number = 0;
  export let duration: number = 300;
  export let visible: boolean = true;

  let mounted = false;

  onMount(async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    await tick();
    mounted = true;
  });
</script>

{#if visible}
  <div
    class="fade-in-wrapper"
    class:mounted={mounted}
    style="--fade-duration: {duration}ms;"
  >
    <slot />
  </div>
{/if}

<style>
  .fade-in-wrapper {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity var(--fade-duration) ease-out, transform var(--fade-duration) ease-out;
    will-change: opacity, transform;
  }

  .fade-in-wrapper.mounted {
    opacity: 1;
    transform: translateY(0);
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .fade-in-wrapper {
      transition: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
