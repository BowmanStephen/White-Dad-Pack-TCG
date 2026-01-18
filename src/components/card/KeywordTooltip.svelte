<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { AbilityKeyword } from '@/lib/mechanics/keywords';
  import { getKeywordDefinition, formatKeywordForDisplay } from '@/lib/mechanics/keywords';

  // Props
  export let keyword: AbilityKeyword;
  export let value?: number | string;
  export let triggerElement: HTMLElement;

  // State
  let visible = $state(false);
  let tooltip: HTMLElement;
  let position = $state({ top: 0, left: 0 });
  let hoverDelay: NodeJS.Timeout;

  // Get keyword definition
  const def = getKeywordDefinition(keyword);
  const displayText = formatKeywordForDisplay(keyword, value);

  // Show tooltip on hover (desktop)
  function handleMouseEnter() {
    // 400ms delay before showing tooltip (prevents accidental triggers)
    hoverDelay = setTimeout(() => {
      visible = true;
      updatePosition();
    }, 400);
  }

  function handleMouseLeave() {
    clearTimeout(hoverDelay);
    visible = false;
  }

  // Position tooltip to stay within viewport
  function updatePosition() {
    if (!triggerElement || !tooltip) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default position: above trigger element
    let top = triggerRect.top - tooltipRect.height - 8;
    let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

    // Adjust if tooltip would go off top of screen
    if (top < 8) {
      top = triggerRect.bottom + 8; // Show below instead
    }

    // Adjust if tooltip would go off left edge
    if (left < 8) {
      left = 8;
    }

    // Adjust if tooltip would go off right edge
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }

    position = { top, left };
  }

  // Set up event listeners on trigger element
  onMount(() => {
    if (triggerElement) {
      triggerElement.addEventListener('mouseenter', handleMouseEnter);
      triggerElement.addEventListener('mouseleave', handleMouseLeave);
      triggerElement.addEventListener('focus', handleMouseEnter);
      triggerElement.addEventListener('blur', handleMouseLeave);
    }
  });

  // Clean up event listeners
  onDestroy(() => {
    if (triggerElement) {
      triggerElement.removeEventListener('mouseenter', handleMouseEnter);
      triggerElement.removeEventListener('mouseleave', handleMouseLeave);
      triggerElement.removeEventListener('focus', handleMouseEnter);
      triggerElement.removeEventListener('blur', handleMouseLeave);
    }
    clearTimeout(hoverDelay);
  });

  // Recalculate position on window resize
  function handleResize() {
    if (visible) {
      updatePosition();
    }
  }

  onMount(() => {
    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>

{#if visible}
  <div
    bind:this={tooltip}
    class="keyword-tooltip"
    style="position: fixed; top: {position.top}px; left: {position.left}px; z-index: 10000;"
    role="tooltip"
    aria-live="polite"
  >
    <div class="tooltip-header">
      <span class="tooltip-keyword">{displayText}</span>
      <span class="tooltip-category">{def.category.toUpperCase()}</span>
    </div>

    <div class="tooltip-body">
      <p class="tooltip-description">{def.description}</p>

      {#if def.detailedExplanation}
        <p class="tooltip-detailed">{def.detailedExplanation}</p>
      {/if}

      {#if def.example}
        <div class="tooltip-example">
          <span class="example-label">Example:</span>
          <span class="example-text">{def.example}</span>
        </div>
      {/if}

      {#if def.statUsed}
        <div class="tooltip-stat">
          <span class="stat-label">Scales with:</span>
          <span class="stat-value">{def.statUsed.replace(/([A-Z])/g, ' $1').trim()}</span>
        </div>
      {/if}
    </div>

    <div class="tooltip-corner accent-tl"></div>
    <div class="tooltip-corner accent-br"></div>
  </div>
{/if}

<style>
  .keyword-tooltip {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 12px;
    min-width: 280px;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    animation: tooltip-fade-in 0.2s ease-out;
    pointer-events: none; /* Prevent tooltip from blocking mouse events */
  }

  @keyframes tooltip-fade-in {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #334155;
  }

  .tooltip-keyword {
    font-size: 0.875rem;
    font-weight: 700;
    color: #60a5fa;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tooltip-category {
    font-size: 0.65rem;
    font-weight: 600;
    color: #94a3b8;
    background: #1e293b;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .tooltip-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tooltip-description {
    font-size: 0.8rem;
    font-weight: 500;
    color: #e2e8f0;
    margin: 0;
    line-height: 1.4;
  }

  .tooltip-detailed {
    font-size: 0.75rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
  }

  .tooltip-example {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 4px;
    padding: 6px 8px;
    background: #0f172a;
    border-radius: 4px;
    border-left: 2px solid #3b82f6;
  }

  .example-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #60a5fa;
    text-transform: uppercase;
  }

  .example-text {
    font-size: 0.75rem;
    color: #cbd5e1;
    font-family: 'Courier New', monospace;
  }

  .tooltip-stat {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 4px;
  }

  .stat-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #f59e0b;
  }

  .stat-value {
    font-size: 0.7rem;
    color: #fbbf24;
  }

  .tooltip-corner {
    position: absolute;
    width: 8px;
    height: 8px;
  }

  .accent-tl {
    top: -1px;
    left: -1px;
    border-top: 2px solid #60a5fa;
    border-left: 2px solid #60a5fa;
  }

  .accent-br {
    bottom: -1px;
    right: -1px;
    border-bottom: 2px solid #60a5fa;
    border-right: 2px solid #60a5fa;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .keyword-tooltip {
      animation: none;
    }
  }
</style>
