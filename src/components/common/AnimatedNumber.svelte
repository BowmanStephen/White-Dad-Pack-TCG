<script lang="ts">
  import { onDestroy } from 'svelte';
  import { isReducedMotion } from '@/stores/motion';

  interface Props {
    value: number;
    duration?: number;
    decimals?: number;
    showSign?: boolean;
    colorChange?: boolean;
    className?: string;
  }

  let {
    value,
    duration = 500,
    decimals = 0,
    showSign = false,
    colorChange = true,
    className = ''
  }: Props = $props();

  let displayValue = $state(0);
  let previousValue = $state(0);
  let direction: 'up' | 'down' | 'neutral' = $state('neutral');
  let animationFrame: number | null = null;
  let startTime: number | null = null;
  let startValue = 0;

  function animate(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);

    // Easing function for smooth animation (ease-out cubic)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (value - startValue) * easeOut;

    displayValue = currentValue;

    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      displayValue = value;
      direction = 'neutral';
    }
  }

  function startAnimation() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    // Check if reduced motion is enabled
    if (isReducedMotion.get()) {
      // Skip animation for reduced motion
      displayValue = value;
      direction = 'neutral';
      return;
    }

    // Determine direction
    if (value > previousValue) {
      direction = 'up';
    } else if (value < previousValue) {
      direction = 'down';
    } else {
      direction = 'neutral';
    }

    // Start animation
    startValue = displayValue;
    startTime = null;
    animationFrame = requestAnimationFrame(animate);
    previousValue = value;
  }

  // Watch for value changes
  $effect(() => {
    const diff = value - displayValue;
    if (Math.abs(diff) > 0.0001) { // Only animate if significant change
      startAnimation();
    }
  });

  // Format the display value
  const formattedValue = $derived(
    displayValue.toFixed(decimals)
  );

  // Add sign if needed
  const signedValue = $derived(
    showSign && value > 0 ? `+${formattedValue}` : formattedValue
  );

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<span
  class="animated-number {direction} {className}"
  class:color-change={colorChange}
>
  {signedValue}
</span>

<style>
  .animated-number {
    display: inline-block;
    transition: color 0.3s ease;
  }

  .color-change.up {
    color: #22c55e; /* Green for increase */
  }

  .color-change.down {
    color: #ef4444; /* Red for decrease */
  }

  .color-change.neutral {
    color: inherit;
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .animated-number {
      transition: none;
    }
  }
</style>
