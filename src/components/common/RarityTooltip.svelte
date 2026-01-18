<script lang="ts">
  import type { Rarity, HoloVariant } from '../../types';
  import {
    RARITY_CONFIG,
    RARITY_DROP_RATES,
    HOLO_VARIANT_DESCRIPTIONS,
    HOLO_DROP_RATE
  } from '../../types';
  import { onMount, onDestroy, tick } from 'svelte';

  export let rarity: Rarity;
  export let triggerElement: HTMLElement;
  export let showHoloInfo: boolean = false; // Whether to show holo variant info
  export let holoVariant: HoloVariant = 'none';
  export let delay: number = 400; // 400ms delay before showing

  let visible = false;
  let tooltipElement: HTMLDivElement;
  let position = { top: '0px', left: '0px' };
  let showTimeout: ReturnType<typeof setTimeout> | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  $: rarityConfig = RARITY_CONFIG[rarity];
  $: dropRateInfo = RARITY_DROP_RATES[rarity];
  $: holoInfo = showHoloInfo ? HOLO_VARIANT_DESCRIPTIONS[holoVariant] : null;

  // Mobile touch handling
  let isMobile = false;
  let touchHoldTimeout: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    // Guard for SSR
    if (typeof window === 'undefined') return;

    // Check if mobile device
    isMobile = 'ontouchstart' in window;

    if (isMobile) {
      // Mobile: tap and hold to show
      triggerElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      triggerElement.addEventListener('touchend', handleTouchEnd);
      triggerElement.addEventListener('touchcancel', handleTouchEnd);
    } else {
      // Desktop: hover with delay
      triggerElement.addEventListener('mouseenter', handleMouseEnter);
      triggerElement.addEventListener('mouseleave', handleMouseLeave);
    }

    // Recalculate position on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
  });

  onDestroy(() => {
    // Guard for SSR
    if (typeof window === 'undefined') return;

    if (showTimeout) clearTimeout(showTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);
    if (touchHoldTimeout) clearTimeout(touchHoldTimeout);

    if (isMobile && triggerElement) {
      triggerElement.removeEventListener('touchstart', handleTouchStart);
      triggerElement.removeEventListener('touchend', handleTouchEnd);
      triggerElement.removeEventListener('touchcancel', handleTouchEnd);
    } else if (triggerElement) {
      triggerElement.removeEventListener('mouseenter', handleMouseEnter);
      triggerElement.removeEventListener('mouseleave', handleMouseLeave);
    }

    window.removeEventListener('scroll', updatePosition, true);
    window.removeEventListener('resize', updatePosition);
  });

  function handleMouseEnter() {
    if (showTimeout) clearTimeout(showTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);

    showTimeout = setTimeout(() => {
      visible = true;
      tick().then(updatePosition);
    }, delay);
  }

  function handleMouseLeave() {
    if (showTimeout) clearTimeout(showTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);

    hideTimeout = setTimeout(() => {
      visible = false;
    }, 100);
  }

  function handleTouchStart(e: TouchEvent) {
    if (touchHoldTimeout) clearTimeout(touchHoldTimeout);

    touchHoldTimeout = setTimeout(() => {
      visible = true;
      tick().then(updatePosition);

      // Vibrate for feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }, 400); // 400ms hold to show
  }

  function handleTouchEnd() {
    if (touchHoldTimeout) clearTimeout(touchHoldTimeout);

    // Hide on touch end
    visible = false;
  }

  function updatePosition() {
    if (!visible || !tooltipElement || !triggerElement) return;

    const tooltipRect = tooltipElement.getBoundingClientRect();
    const triggerRect = triggerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position above trigger element
    let top = triggerRect.top - tooltipRect.height - 12;
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

    // Keep tooltip within viewport bounds
    if (top < 8) {
      // Not enough space above, show below
      top = triggerRect.bottom + 12;
    }

    if (left < 8) {
      left = 8;
    } else if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }

    position = {
      top: `${top}px`,
      left: `${left}px`
    };
  }

  function formatProbability(prob: string): string {
    // Format probability strings for better readability
    return prob.replace(/\(/g, ' (').replace(/\)/g, ')');
  }
</script>

{#if visible}
  <div
    class="rarity-tooltip"
    style="top: {position.top}; left: {position.left};"
    bind:this={tooltipElement}
    role="tooltip"
    aria-live="polite"
  >
    <!-- Rarity Header -->
    <div class="tooltip-header" style="border-color: {rarityConfig.color}">
      <span class="tooltip-title" style="color: {rarityConfig.color}">
        {rarityConfig.name}
      </span>
      <div class="tooltip-glow" style="background: {rarityConfig.glowColor}"></div>
    </div>

    <!-- Drop Rate Information -->
    <div class="tooltip-content">
      <div class="tooltip-section">
        <div class="section-title">About This Rarity</div>
        <div class="section-text">{dropRateInfo.description}</div>
      </div>

      <div class="tooltip-section">
        <div class="section-title">Where It Drops</div>
        <div class="section-text">{dropRateInfo.slots}</div>
      </div>

      <div class="tooltip-section">
        <div class="section-title">Drop Chance</div>
        <div class="section-text highlight">{formatProbability(dropRateInfo.probability)}</div>
      </div>

      <div class="tooltip-section note">
        <div class="note-text">{dropRateInfo.note}</div>
      </div>

      <!-- Holo Variant Information (if applicable) -->
      {#if showHoloInfo && holoInfo}
        <div class="tooltip-divider"></div>
        <div class="tooltip-section">
          <div class="section-title holo-title">
            Holo Variant: {holoInfo.name}
          </div>
          <div class="section-text">{holoInfo.description}</div>
          <div class="holo-features">
            {#each holoInfo.features as feature}
              <div class="feature-item">• {feature}</div>
            {/each}
          </div>
          <div class="holo-chance">
            <span class="chance-label">Drop Rate:</span>
            <span class="chance-value">{holoInfo.chance}</span>
          </div>
        </div>
      {:else if showHoloInfo}
        <div class="tooltip-divider"></div>
        <div class="tooltip-section">
          <div class="section-title">About Holos</div>
          <div class="section-text">{HOLO_DROP_RATE.description}</div>
          <div class="holo-chance">
            <span class="chance-label">Overall Chance:</span>
            <span class="chance-value">{HOLO_DROP_RATE.chance}</span>
          </div>
          <div class="section-text small">{HOLO_DROP_RATE.note}</div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .rarity-tooltip {
    position: fixed;
    z-index: 10000;
    min-width: 280px;
    max-width: 340px;
    background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%);
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.5),
      0 10px 10px -5px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    overflow: hidden;
    animation: tooltipFadeIn 0.2s ease-out;
    pointer-events: none;
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tooltip-header {
    position: relative;
    padding: 12px 16px;
    border-bottom: 2px solid;
    background: rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  .tooltip-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.2;
    filter: blur(8px);
    pointer-events: none;
  }

  .tooltip-title {
    position: relative;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tooltip-content {
    padding: 14px 16px;
  }

  .tooltip-section {
    margin-bottom: 12px;
  }

  .tooltip-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #9ca3af;
    margin-bottom: 4px;
  }

  .holo-title {
    color: #fbbf24;
  }

  .section-text {
    font-size: 13px;
    line-height: 1.5;
    color: #e5e7eb;
  }

  .section-text.small {
    font-size: 12px;
    color: #9ca3af;
  }

  .section-text.highlight {
    font-weight: 600;
    color: #fbbf24;
  }

  .tooltip-section.note {
    padding: 8px 12px;
    background: rgba(251, 191, 36, 0.1);
    border-left: 3px solid #fbbf24;
    border-radius: 0 6px 6px 0;
  }

  .note-text {
    font-size: 12px;
    font-style: italic;
    color: #fcd34d;
  }

  .tooltip-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    margin: 14px 0;
  }

  .holo-features {
    margin: 10px 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .feature-item {
    font-size: 12px;
    color: #e5e7eb;
    padding-left: 8px;
  }

  .holo-chance {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(96, 165, 250, 0.1);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 6px;
    margin-top: 10px;
  }

  .chance-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #93c5fd;
  }

  .chance-value {
    font-size: 13px;
    font-weight: 700;
    color: #60a5fa;
  }

  /* Dark mode support */
  :global(.dark) .rarity-tooltip {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%);
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .rarity-tooltip {
      animation: none;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .rarity-tooltip {
      min-width: 260px;
      max-width: calc(100vw - 32px);
    }

    .tooltip-content {
      padding: 12px 14px;
    }

    .section-title {
      font-size: 10px;
    }

    .section-text {
      font-size: 12px;
    }
  }
</style>
