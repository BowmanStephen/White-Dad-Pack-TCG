<script lang="ts">
  import type { Rarity, HoloVariant } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import { onMount, onDestroy } from 'svelte';
  import RarityTooltip from './RarityTooltip.svelte';

  export let rarity: Rarity;
  export let holoVariant: HoloVariant = 'none';
  export let showHoloInfo: boolean = false; // Whether to show holo variant info in tooltip
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showLabel: boolean = false; // Whether to show text label

  let badgeElement: HTMLElement;
  let showTooltip = false;

  $: rarityConfig = RARITY_CONFIG[rarity];
  $: isHolo = holoVariant !== 'none';

  // Toggle tooltip on click (for accessibility)
  function handleClick() {
    showTooltip = !showTooltip;
  }

  // Handle keyboard interaction
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showTooltip = !showTooltip;
    }
  }

  // Close tooltip on escape
  function handleGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && showTooltip) {
      showTooltip = false;
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleGlobalKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleGlobalKeydown);
    }
  });
</script>

<div
  class="rarity-badge size-{size} {isHolo ? 'holo' : ''}"
  style="background: {rarityConfig.glowColor}; border-color: {rarityConfig.borderColor}"
  bind:this={badgeElement}
  on:click={handleClick}
  on:keydown={handleKeydown}
  tabindex="0"
  role="button"
  aria-label="{rarityConfig.name} rarity - click for more information"
  aria-describedby={showTooltip ? 'rarity-tooltip' : undefined}
>
  {#if showLabel}
    <span class="badge-label" style="color: {rarityConfig.color}">
      {rarityConfig.name}
    </span>
  {/if}

  <div class="badge-indicator" style="background: {rarityConfig.color}"></div>

  {#if isHolo}
    <div class="holo-sparkle" style="background: {rarityConfig.color}"></div>
    <div class="holo-sparkle holo-sparkle-2" style="background: {rarityConfig.color}"></div>
  {/if}

  {#if showTooltip && badgeElement}
    <RarityTooltip
      {rarity}
      {holoVariant}
      {showHoloInfo}
      triggerElement={badgeElement}
    />
  {/if}
</div>

<style>
  .rarity-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 2px solid;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .rarity-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .rarity-badge:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  /* Size variants */
  .size-sm {
    padding: 4px 8px;
    font-size: 11px;
  }

  .size-md {
    padding: 6px 12px;
    font-size: 13px;
  }

  .size-lg {
    padding: 8px 16px;
    font-size: 15px;
  }

  .badge-label {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .badge-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 8px currentColor;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }

  /* Holo effects */
  .rarity-badge.holo {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    box-shadow:
      0 0 20px rgba(255, 255, 255, 0.1),
      inset 0 0 20px rgba(255, 255, 255, 0.05);
  }

  .holo-sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    animation: sparkle 3s ease-in-out infinite;
    pointer-events: none;
  }

  .holo-sparkle-2 {
    top: 20%;
    right: 15%;
    animation-delay: 1.5s;
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 0;
      transform: scale(0);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Dark mode */
  :global(.dark) .rarity-badge {
    background: rgba(0, 0, 0, 0.6);
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .badge-indicator {
      animation: none;
    }

    .holo-sparkle {
      animation: none;
      opacity: 0.5;
    }

    .rarity-badge:hover {
      transform: none;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .rarity-badge {
      padding: 5px 10px;
      font-size: 12px;
    }

    .badge-indicator {
      width: 6px;
      height: 6px;
    }
  }
</style>
