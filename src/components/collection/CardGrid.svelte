<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CollectionDisplayCard, PackCard } from '../../types';
  import Card from '../card/Card.svelte';
  import RarityBadge from '../card/RarityBadge.svelte';
  import CollectionGridSkeleton from '../loading/CollectionGridSkeleton.svelte';
  import FadeIn from '../loading/FadeIn.svelte';
  import { formatCardCount } from '../../lib/collection/utils';
  import { calculateVisibleRange, getTotalHeight, getEstimatedCardHeight } from '../../lib/utils/virtual-scroll';

  // Props
  interface Props {
    displayedCards: CollectionDisplayCard[];
    selectedForCompare: PackCard[];
    isLoading: boolean;
  }

  let {
    displayedCards,
    selectedForCompare,
    isLoading,
  }: Props = $props();

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    cardClick: { card: PackCard; event: MouseEvent | KeyboardEvent };
    toggleCardSelection: { card: PackCard };
  }>();

  // Virtual scroll state
  let scrollTop = $state(0);
  let virtualState = $state({
    startIndex: 0,
    endIndex: 0,
    offsetY: 0,
    visibleItems: [] as number[],
  });
  let scrollContainer: HTMLDivElement;

  // Update virtual scroll state based on container dimensions
  function updateVirtualScroll() {
    if (!scrollContainer) return;

    const cardHeight = getEstimatedCardHeight();
    const containerHeight = scrollContainer.clientHeight;

    virtualState = calculateVisibleRange(scrollTop, {
      itemCount: displayedCards.length,
      itemHeight: cardHeight,
      containerHeight: containerHeight,
      bufferItems: 5,
    });
  }

  // Handle scroll events
  function handleScroll(e: Event) {
    const target = e.currentTarget as HTMLDivElement;
    scrollTop = target.scrollTop;
    updateVirtualScroll();
  }

  // Check if a card is currently selected for comparison
  function isCardSelected(card: PackCard): boolean {
    return selectedForCompare.some(c => c.id === card.id);
  }

  // Get selection badge number (1 or 2) for display
  function getSelectionNumber(card: PackCard): number | null {
    const index = selectedForCompare.findIndex(c => c.id === card.id);
    return index === -1 ? null : index + 1;
  }

  // Handle card click
  function handleCardClick(card: PackCard, event: MouseEvent | KeyboardEvent) {
    event.stopPropagation();
    dispatch('cardClick', { card, event });
  }

  // Toggle card selection for comparison
  function toggleCardSelection(card: PackCard, event: MouseEvent) {
    event.stopPropagation();
    dispatch('toggleCardSelection', { card });
  }

  // React to displayedCards changes - update virtual scroll
  $effect(() => {
    // Trigger when displayedCards changes
    displayedCards;
    updateVirtualScroll();
  });

  // Setup resize listener
  import { onMount } from 'svelte';

  onMount(() => {
    const handleResize = () => {
      updateVirtualScroll();
    };

    window.addEventListener('resize', handleResize);
    updateVirtualScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

{#if isLoading}
  <!-- Show skeleton while initially loading -->
  <CollectionGridSkeleton count={12} />
{:else if displayedCards.length > 0}
  <FadeIn duration={300}>
    <!-- Virtual Scroll Container -->
    <div
      bind:this={scrollContainer}
      class="scroll-container"
      onscroll={handleScroll}
      role="region"
      aria-label="Card collection grid"
    >
      <!-- Spacer to create total height -->
      <div
        class="scroll-spacer"
        style="height: {getTotalHeight({
          itemCount: displayedCards.length,
          itemHeight: getEstimatedCardHeight(),
          containerHeight: scrollContainer?.clientHeight || 600,
        })}px;"
      ></div>

      <!-- Virtual viewport with offset -->
      <div class="virtual-viewport" style="transform: translateY({virtualState.offsetY}px);">
        <div class="card-grid" class:animate-sort={true}>
          {#each virtualState.visibleItems as index (index)}
            {@const card = displayedCards[index]}
            {@const isSelected = isCardSelected(card)}
            {@const selectionNum = getSelectionNumber(card)}
            <div
              class="card-wrapper"
              class:has-duplicate={card.duplicateCount > 1}
              class:selected={isSelected}
              onclick={(e) => handleCardClick(card, e)}
              role="button"
              tabindex="0"
              aria-label="View {card.name} in lightbox"
              onkeydown={(e) => e.key === 'Enter' && handleCardClick(card, e)}
            >
              <Card
                {card}
                size="md"
                interactive={false}
                isFlipped={false}
                showBack={false}
                enableShare={false}
              />
              <!-- Rarity Badge (PACK-017) -->
              <RarityBadge rarity={card.rarity} isHolo={card.isHolo} />
              {#if card.duplicateCount > 1}
                <div class="duplicate-badge">
                  {formatCardCount(card.duplicateCount)}
                </div>
              {/if}
              <!-- Zoom Indicator (appears on hover - US082) -->
              <div class="zoom-badge">
                <span class="zoom-icon">🔍</span>
              </div>
              <!-- Compare Button (appears on hover) -->
              <button
                class="compare-badge"
                class:selected={isSelected}
                onclick={(e) => toggleCardSelection(card, e)}
                aria-label="Select for comparison"
                title="Select for comparison"
              >
                {#if isSelected}
                  <span class="compare-number">{selectionNum}</span>
                  <span class="compare-icon">✓</span>
                {:else}
                  <span class="compare-icon">⚔️</span>
                {/if}
              </button>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </FadeIn>

  <!-- End message for virtual scroll -->
  {#if displayedCards.length > 0}
    <div class="end-message">
      <p>🎉 Showing {virtualState.visibleItems.length} of {displayedCards.length} cards</p>
    </div>
  {/if}
{/if}

<style>
  /* Virtual Scroll Container */
  .scroll-container {
    position: relative;
    overflow-y: auto;
    max-height: calc(100vh - 400px); /* Leave room for filters */
    overflow-x: hidden;
  }

  .scroll-spacer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    pointer-events: none;
  }

  .virtual-viewport {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    will-change: transform;
  }

  /* Card Grid - Responsive with 2/4/6 columns */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 0.75rem;
  }

  /* Mobile landscape (3 columns) */
  @media (min-width: 480px) and (max-width: 767px) {
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding: 1rem;
    }
  }

  /* Tablet: 4 columns */
  @media (min-width: 768px) {
    .card-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      padding: 1.25rem;
    }

    .scroll-container {
      max-height: calc(100vh - 350px);
    }
  }

  /* Small desktop: 5 columns */
  @media (min-width: 1024px) {
    .card-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .scroll-container {
      max-height: calc(100vh - 300px);
    }
  }

  /* Large desktop: 6 columns */
  @media (min-width: 1280px) {
    .card-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 1.75rem;
      padding: 1.75rem;
    }
  }

  /* Extra large screens: 7 columns for ultra-wide displays */
  @media (min-width: 1536px) {
    .card-grid {
      grid-template-columns: repeat(7, 1fr);
      gap: 2rem;
      padding: 2rem;
    }
  }

  /* Card wrapper - ensures cards scale with grid */
  .card-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4; /* Standard trading card ratio */
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .card-wrapper :global(.card-perspective) {
    width: 100% !important;
    height: 100% !important;
  }

  /* Make card content responsive */
  .card-wrapper :global(.card-container) {
    width: 100%;
    height: 100%;
  }

  .card-wrapper:hover {
    transform: scale(1.05);
    z-index: 5;
  }

  .card-wrapper:focus {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
    border-radius: 0.5rem;
  }

  .duplicate-badge {
    position: absolute;
    bottom: -0.5rem;
    right: -0.5rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 9999px;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    z-index: 10;
    min-width: 2rem;
    text-align: center;
  }

  /* Zoom Badge (US082 - Lightbox indicator) */
  .zoom-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    width: 2rem;
    height: 2rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 15;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
  }

  .card-wrapper:hover .zoom-badge {
    opacity: 1;
    transform: scale(1);
  }

  .zoom-icon {
    font-size: 0.875rem;
    line-height: 1;
  }

  /* Card reordering animation */
  .card-grid.animate-sort .card-wrapper {
    animation: cardReorder 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes cardReorder {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .end-message {
    display: flex;
    justify-content: center;
    padding: 1rem;
    color: #94a3b8;
    font-size: 0.875rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 0.5rem;
    margin-top: 1rem;
  }

  /* Compare badge styles */
  .card-wrapper.selected :global(.card-perspective) {
    border-radius: 0.5rem;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.6);
  }

  .compare-badge {
    position: absolute;
    top: -0.5rem;
    left: -0.5rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: 2px solid white;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    z-index: 20;
    opacity: 0;
    transform: scale(0.8);
  }

  .card-wrapper:hover .compare-badge,
  .compare-badge.selected {
    opacity: 1;
    transform: scale(1);
  }

  .compare-badge:hover {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    transform: scale(1.1);
  }

  .compare-badge.selected {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
    }
    50% {
      box-shadow: 0 4px 16px rgba(251, 191, 36, 0.7);
    }
  }

  .compare-icon {
    line-height: 1;
  }

  .compare-number {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 14px;
    height: 14px;
    background: #ef4444;
    border-radius: 50%;
    font-size: 0.625rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid white;
  }
</style>
