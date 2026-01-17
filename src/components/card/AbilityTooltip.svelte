<script lang="ts">
  import type { CardAbility, Rarity } from '../../types';
  import { RARITY_CONFIG, type Card } from '../../types';
  import { onMount, onDestroy, tick } from 'svelte';

  export let ability: CardAbility;
  export let triggerElement: HTMLElement;
  export let cardRarity: Rarity;
  export let delay: number = 500; // 500ms delay before showing

  let visible = false;
  let tooltipElement: HTMLDivElement;
  let position = { top: '0px', left: '0px' };
  let showTimeout: ReturnType<typeof setTimeout> | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  $: rarityConfig = RARITY_CONFIG[cardRarity];

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

    // Calculate position (above the trigger by default)
    let top = triggerRect.top + scrollY - tooltipRect.height - 12;
    let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);

    // Prevent going off the top
    if (top < 10) {
      top = triggerRect.bottom + scrollY + 12;
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

  // Format ability description with rich text support
  function formatDescription(text: string): string {
    // Bold keywords (words in ALL CAPS or with special formatting)
    text = text.replace(/\b([A-Z]{2,})\b/g, '<strong>$1</strong>');

    // Highlight ability triggers (e.g., "Flip a coin", "When X happens")
    text = text.replace(/(When |Whenever |If |At the beginning of )/gi, '<strong class="text-blue-300">$1</strong>');

    return text;
  }

  // Extract examples from ability description (if any)
  function getExamples(text: string): string[] {
    const exampleMatches = text.match(/Example[s]?: (.+?)(?:\.|$)/gi);
    if (exampleMatches) {
      return exampleMatches.map(e => e.replace(/Example[s]?: /i, '').replace(/\.$/, ''));
    }
    return [];
  }
</script>

{#if visible}
  <div
    bind:this={tooltipElement}
    class="ability-tooltip fixed z-50 pointer-events-none"
    style="top: {position.top}; left: {position.left};"
    role="tooltip"
    aria-live="polite"
  >
    <div
      class="rounded-lg shadow-2xl border-2 max-w-xs"
      style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98)); border-color: {rarityConfig.color}; box-shadow: 0 8px 32px {rarityConfig.glowColor}66, 0 0 16px {rarityConfig.glowColor}44;"
    >
      <!-- Ability name header -->
      <div
        class="px-3 py-2 rounded-t-lg border-b"
        style="background: {rarityConfig.color}22; border-color: {rarityConfig.color}44;"
      >
        <h4 class="text-sm font-black" style="color: {rarityConfig.color};">
          {ability.name}
        </h4>
      </div>

      <!-- Ability description -->
      <div class="px-3 py-2.5">
        <p
          class="text-xs leading-relaxed text-slate-200"
          style="text-shadow: 0 1px 2px rgba(0,0,0,0.5);"
        >
          {@html formatDescription(ability.description)}
        </p>

        <!-- Examples section (if any) -->
        {#if getExamples(ability.description).length > 0}
          <div class="mt-2 pt-2 border-t border-white/10">
            <p class="text-[10px] font-bold text-slate-400 mb-1">EXAMPLE{getExamples(ability.description).length > 1 ? 'S' : ''}:</p>
            {#each getExamples(ability.description) as example}
              <p class="text-[10px] text-slate-300 italic pl-2 border-l-2" style="border-color: {rarityConfig.color};">
                "{example}"
              </p>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Rarity indicator -->
      <div
        class="px-3 py-1.5 rounded-b-lg flex items-center justify-between"
        style="background: {rarityConfig.color}11;"
      >
        <span class="text-[9px] font-bold uppercase tracking-wider" style="color: {rarityConfig.color};">
          {rarityConfig.name} Ability
        </span>
        <span class="text-[9px] text-slate-500">Tap & hold on mobile</span>
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
  .ability-tooltip {
    animation: tooltip-fade-in 0.2s ease-out;
    will-change: opacity, transform;
  }

  @keyframes tooltip-fade-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .ability-tooltip {
      animation: none !important;
    }
  }
</style>
