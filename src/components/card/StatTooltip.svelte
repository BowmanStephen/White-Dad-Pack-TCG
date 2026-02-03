<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import type { CardStats, Rarity } from '@/types';
  import { RARITY_CONFIG, STAT_NAMES, STAT_DESCRIPTIONS, STAT_ICONS } from '@/types';

  interface Props {
    statKey: keyof CardStats;
    statValue: number;
    triggerElement: HTMLElement;
    cardRarity: Rarity;
    delay?: number;
  }

  let {
    statKey,
    statValue,
    triggerElement,
    cardRarity,
    delay = 400,
  }: Props = $props();

  let visible = $state(false);
  let tooltipElement = $state<HTMLDivElement | null>(null);
  let position = $state({ top: '0px', left: '0px' });
  let showTimeout: ReturnType<typeof setTimeout> | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  const rarityConfig = $derived(RARITY_CONFIG[cardRarity]);
  const statName = $derived(STAT_NAMES[statKey]);
  const statDescription = $derived(STAT_DESCRIPTIONS[statKey]);
  const statIcon = $derived(STAT_ICONS[statKey]);

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
    }, delay);
  }

  function handleTouchEnd() {
    if (touchHoldTimeout) clearTimeout(touchHoldTimeout);

    // Hide after a short delay
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      visible = false;
    }, 2000); // Stay visible for 2 seconds on mobile
  }

  function updatePosition() {
    if (!visible || !tooltipElement || !triggerElement) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Calculate position (prefer above, fall back to below)
    let top = triggerRect.top + scrollY - tooltipRect.height - 8;
    let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);

    // Prevent going off the top
    if (top < 10) {
      top = triggerRect.bottom + scrollY + 8;
    }

    // Prevent going off the left edge
    if (left < 10) {
      left = 10;
    }

    // Prevent going off the right edge
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    // Prevent going off the bottom
    if (top + tooltipRect.height > window.innerHeight + scrollY - 10) {
      top = window.innerHeight + scrollY - tooltipRect.height - 10;
    }

    position = { top: `${top}px`, left: `${left}px` };
  }

  // Get stat rating label
  function getStatRating(value: number): string {
    if (value >= 90) return 'Legendary';
    if (value >= 80) return 'Excellent';
    if (value >= 70) return 'Great';
    if (value >= 60) return 'Good';
    if (value >= 50) return 'Average';
    if (value >= 40) return 'Below Average';
    if (value >= 30) return 'Poor';
    return 'Terrible';
  }

  // Get stat rating color
  function getRatingColor(value: number): string {
    if (value >= 80) return rarityConfig.color;
    if (value >= 60) return '#22c55e'; // green
    if (value >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  }
</script>

{#if visible}
  <div
    bind:this={tooltipElement}
    class="stat-tooltip fixed z-50 pointer-events-none"
    style="top: {position.top}; left: {position.left};"
    role="tooltip"
    aria-live="polite"
  >
    <div
      class="rounded-lg shadow-2xl border-2 max-w-xs"
      style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98)); border-color: {rarityConfig.color}; box-shadow: 0 8px 32px {rarityConfig.glowColor}66, 0 0 16px {rarityConfig.glowColor}44;"
    >
      <!-- Stat name header -->
      <div
        class="px-3 py-2 rounded-t-lg border-b flex items-center gap-2"
        style="background: {rarityConfig.color}22; border-color: {rarityConfig.color}44;"
      >
        <span class="text-lg" aria-hidden="true">{statIcon}</span>
        <div class="flex-1">
          <h4 class="text-sm font-black" style="color: {rarityConfig.color};">
            {statName}
          </h4>
          <!-- WCAG AA: Increased contrast from text-slate-400 to text-slate-300 -->
          <p class="text-[10px] text-slate-300">Stat Value: <span class="font-mono font-bold text-white">{statValue}</span>/100</p>
        </div>
      </div>

      <!-- Stat description -->
      <div class="px-3 py-2.5">
        <!-- WCAG AA: Increased contrast from text-slate-200 to text-slate-100, removed text-shadow (not WCAG compliant) -->
        <p class="text-xs leading-relaxed text-slate-100">
          {statDescription}
        </p>
      </div>

      <!-- Stat rating -->
      <div
        class="px-3 py-2 rounded-b-lg flex items-center justify-between"
        style="background: {rarityConfig.color}11;"
      >
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-bold uppercase tracking-wider" style="color: {getRatingColor(statValue)};">
            {getStatRating(statValue)}
          </span>
          <div class="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full"
              style="width: {statValue}%; background: {getRatingColor(statValue)};"
            ></div>
          </div>
        </div>
        <!-- WCAG AA: Increased contrast from text-slate-500 to text-slate-400 -->
        <span class="text-[9px] text-slate-400">Tap & hold on mobile</span>
      </div>

      <!-- Decorative corner accents -->
      <div class="absolute top-0 left-0 w-3 h-3 rounded-tl-lg" style="background: {rarityConfig.color}44;"></div>
      <div class="absolute top-0 right-0 w-3 h-3 rounded-tr-lg" style="background: {rarityConfig.color}44;"></div>
      <div class="absolute bottom-0 left-0 w-3 h-3 rounded-bl-lg" style="background: {rarityConfig.color}44;"></div>
      <div class="absolute bottom-0 right-0 w-3 h-3 rounded-br-lg" style="background: {rarityConfig.color}44;"></div>
    </div>
  </div>
{/if}

<style>
  .stat-tooltip {
    animation: tooltip-fade-in 0.15s ease-out;
    will-change: opacity, transform;
  }

  @keyframes tooltip-fade-in {
    from {
      opacity: 0;
      transform: translateY(-2px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .stat-tooltip {
      animation: none !important;
    }
  }
</style>
