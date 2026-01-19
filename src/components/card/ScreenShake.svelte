<script lang="ts">
  import { onMount } from 'svelte';
  import { screenShakeEnabled } from '../../stores/ui';
  import { isReducedMotion } from '../../stores/motion';

  interface Props {
    active?: boolean;
    intensity?: 'subtle' | 'moderate' | 'intense';
    duration?: number;
  }

  let { active = false, intensity = 'subtle', duration = 300 }: Props = $props();

  // Reactive state synced from Nanostores
  let shakeEnabled = $state(true);
  let reducedMotion = $state(isReducedMotion.get());

  // Subscribe to Nanostores on mount
  onMount(() => {
    const unsubscribers = [
      screenShakeEnabled.subscribe((value) => { shakeEnabled = value; }),
      isReducedMotion.subscribe((value: boolean) => { reducedMotion = value; }),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  });

  // Intensity configurations (CSS translate oscillation)
  const intensityConfig = {
    subtle: {
      x: '2px',
      y: '2px',
      rotate: '1deg',
    },
    moderate: {
      x: '4px',
      y: '4px',
      rotate: '2deg',
    },
    intense: {
      x: '6px',
      y: '6px',
      rotate: '3deg',
    },
  };

  // Screen shake is disabled if user prefers reduced motion OR has disabled it in settings
  let shouldShake = $derived(active && shakeEnabled && !reducedMotion);
  let config = $derived(intensityConfig[intensity]);
</script>

{#if shouldShake}
  <div
    class="screen-shake-overlay fixed inset-0 pointer-events-none z-50"
    style="
      --shake-x: {config.x};
      --shake-y: {config.y};
      --shake-rotate: {config.rotate};
      animation-duration: {duration}ms;
    "
    aria-hidden="true"
  ></div>
{/if}

<style>
  .screen-shake-overlay {
    animation: screen-shake ease-in-out;
  }

  @keyframes screen-shake {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    10% {
      transform: translate(var(--shake-x), var(--shake-y)) rotate(var(--shake-rotate));
    }
    20% {
      transform: translate(calc(var(--shake-x) * -1), calc(var(--shake-y) * -1)) rotate(calc(var(--shake-rotate) * -1));
    }
    30% {
      transform: translate(var(--shake-x), calc(var(--shake-y) * -1)) rotate(var(--shake-rotate));
    }
    40% {
      transform: translate(calc(var(--shake-x) * -1), var(--shake-y)) rotate(calc(var(--shake-rotate) * -1));
    }
    50% {
      transform: translate(var(--shake-x), var(--shake-y)) rotate(var(--shake-rotate));
    }
    60% {
      transform: translate(calc(var(--shake-x) * -1), calc(var(--shake-y) * -1)) rotate(calc(var(--shake-rotate) * -1));
    }
    70% {
      transform: translate(var(--shake-x), calc(var(--shake-y) * -1)) rotate(var(--shake-rotate));
    }
    80% {
      transform: translate(calc(var(--shake-x) * -1), var(--shake-y)) rotate(calc(var(--shake-rotate) * -1));
    }
    90% {
      transform: translate(var(--shake-x), var(--shake-y)) rotate(var(--shake-rotate));
    }
    100% {
      transform: translate(0, 0) rotate(0deg);
    }
  }

  /* Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .screen-shake-overlay {
      animation: none !important;
    }
  }
</style>
