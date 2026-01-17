<!--
/**
 * Countdown Timer Component (US099 - Live Events)
 *
 * Live countdown timer for event end time.
 * Updates every second with formatted time remaining.
 */
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { eventTimeRemaining, formatTimeRemaining } from '../../stores/events';

  export let eventId: string;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let showLabel = true;
  export let compact = false;

  let timeRemaining = $eventTimeRemaining;
  let formattedTime = formatTimeRemaining(timeRemaining);
  let interval: ReturnType<typeof setInterval> | null = null;

  // Update countdown every second
  onMount(() => {
    interval = setInterval(() => {
      timeRemaining = $eventTimeRemaining;
      formattedTime = formatTimeRemaining(timeRemaining);
    }, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });

  // Size classes
  $: sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  }[size];

  $: labelClasses = {
    small: 'text-xs',
    medium: 'text-xs',
    large: 'text-sm'
  }[size];
</script>

<div class="countdown-timer {sizeClasses} {compact ? 'compact' : ''}">
  {#if showLabel && !compact}
    <span class="countdown-label {labelClasses}">Ends in</span>
  {/if}
  <span class="countdown-time" data-event-countdown={eventId}>
    {formattedTime}
  </span>
</div>

<style>
  .countdown-timer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .countdown-timer.small {
    font-size: 0.875rem;
  }

  .countdown-timer.medium {
    font-size: 1rem;
  }

  .countdown-timer.large {
    font-size: 1.25rem;
  }

  .countdown-label {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.8;
  }

  .countdown-time {
    color: inherit;
  }

  .countdown-timer.compact {
    gap: 0;
  }

  .countdown-timer.compact .countdown-time {
    font-size: 1em;
  }
</style>
-->
