<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    isLightboxOpen,
    currentCard,
    currentIndex,
    cardList,
    nextCard,
    prevCard,
    closeLightbox,
    hasNextCard,
    hasPrevCard,
    isCardFlipped,
    toggleCardFlip,
    cardViewMode,
    setCardViewMode,
    resetCardView,
  } from '@/stores/lightbox';
  import { subscribeToStores } from '@/lib/utils/store-helpers';
  import { RARITY_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS, STAT_NAMES, STAT_ICONS } from '@/types';
  import type { PackCard } from '@/types';
  import GenerativeCardArt from '@components/art/GenerativeCardArt.svelte';
  import Card from '@components/card/Card.svelte';
  import Card3DFlip from '@components/card/Card3DFlip.svelte';
  import CardSetInfo from '@components/card/CardSetInfo.svelte';
  import EnhancedCardStats from '@components/card/EnhancedCardStats.svelte';
  import CardCollectionContext from '@components/card/CardCollectionContext.svelte';
  import ZoomableCardModal from '@components/card/ZoomableCardModal.svelte';
  import { isSpecialCardType, getSpecialCardTypeLabel, hasCardStats } from '@/lib/card-types';
  import { downloadCardImage, shareCardImage, checkShareSupport } from '@/lib/utils/image-generation';

  // Subscribe to store changes using Svelte 5 runes
  let isOpen = $state(isLightboxOpen.get());
  let card = $state<PackCard | null>(currentCard.get());
  let cards = $state(cardList.get());
  let index = $state(currentIndex.get());
  let isFlipped = $state(isCardFlipped.get());
  let viewMode = $state(cardViewMode.get());
  const progress = $derived(cards.length === 0 ? '0 of 0' : `${index + 1} of ${cards.length}`);

  // Share support check
  let shareSupport = $derived(checkShareSupport());
  let canShare = $derived(shareSupport.webShareAPI && shareSupport.webShareFiles);

  // Share/download state
  let isGeneratingImage = $state(false);
  let shareError = $state<string | null>(null);
  let lightboxElement = $state<HTMLDivElement | null>(null);
  let cardImageElement = $state<HTMLDivElement | null>(null);
  let hasKeyListener = $state(false);

  // View tab state
  let activeTab: 'details' | 'stats' | 'set' = $state('details');

  // Zoom modal state
  let isZoomOpen = $state(false);

  // Handle tab switch
  function switchTab(tab: 'details' | 'stats' | 'set') {
    activeTab = tab;
  }

  // Open zoom modal
  function openZoomModal() {
    isZoomOpen = true;
  }

  // Close zoom modal
  function closeZoomModal() {
    isZoomOpen = false;
  }

  // Keyboard navigation
  function handleKeyDown(event: KeyboardEvent) {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        if (hasPrevCard()) prevCard();
        break;
      case 'ArrowRight':
        if (hasNextCard()) nextCard();
        break;
      case 'f':
      case 'F':
      case ' ':
        // Space or F to flip
        event.preventDefault();
        toggleCardFlip();
        break;
    }
  }

  // Handle card click to flip (PACK-036)
  function handleCardClick() {
    toggleCardFlip();
  }

  // Download functionality
  async function handleDownload() {
    if (isGeneratingImage || !card || !cardImageElement) return;
    isGeneratingImage = true;
    shareError = null;

    try {
      await downloadCardImage(card, cardImageElement, { scale: 2 });
    } catch (error) {
      shareError = 'Failed to download card image. Please try again.';
    } finally {
      isGeneratingImage = false;
    }
  }

  // Share functionality
  async function handleShare() {
    if (isGeneratingImage || !card || !cardImageElement) return;
    isGeneratingImage = true;
    shareError = null;

    try {
      const success = await shareCardImage(card, cardImageElement, {
        shareTitle: 'DadDeck™ Card',
        imageGeneration: { scale: 2 },
      });

      if (!success) {
        await handleDownload();
      }
    } catch (error) {
      shareError = 'Failed to share card image. Please try again.';
      isGeneratingImage = false;
    } finally {
      isGeneratingImage = false;
    }
  }

  let unsubscribeStores: (() => void) | null = null;

  // Setup keyboard listener + store subscriptions
  onMount(() => {
    unsubscribeStores = subscribeToStores([
      { store: isLightboxOpen, onUpdate: (v) => { isOpen = v; } },
      { store: currentCard, onUpdate: (v) => { card = v; } },
      { store: cardList, onUpdate: (v) => { cards = v; } },
      { store: currentIndex, onUpdate: (v) => { index = v; } },
      { store: isCardFlipped, onUpdate: (v) => { isFlipped = v; } },
      { store: cardViewMode, onUpdate: (v) => { viewMode = v; } },
    ]);

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      hasKeyListener = true;
    }
  });

  onDestroy(() => {
    if (unsubscribeStores) {
      unsubscribeStores();
    }
    if (hasKeyListener && typeof document !== 'undefined') {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  // Prevent body scroll when lightbox is open
  $effect(() => {
    if (isOpen && typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  });

  function getHoloVariantName(holoType: string): string {
    const names: Record<string, string> = {
      none: 'Non-Holo',
      standard: 'Standard Holo',
      reverse: 'Reverse Holo',
      full_art: 'Full Art Holo',
      prismatic: 'Prismatic Holo',
    };
    return names[holoType] || holoType;
  }
</script>

{#if isOpen && card}
  <div
    class="lightbox-backdrop"
    bind:this={lightboxElement}
    role="dialog"
    aria-modal="true"
    aria-labelledby="lightbox-card-name"
    tabindex="-1"
  >
    <button
      class="lightbox-overlay"
      onclick={closeLightbox}
      aria-label="Close lightbox"
      type="button"
    ></button>
    <div class="lightbox-container">
      <!-- Close Button -->
      <button
        class="lightbox-close"
        onclick={closeLightbox}
        aria-label="Close lightbox"
      >
        ✕
      </button>

      <!-- Main Content Area -->
      <div class="lightbox-content">
        <!-- Navigation Buttons -->
        {#if hasPrevCard()}
          <button
            class="lightbox-nav lightbox-nav-prev"
            onclick={prevCard}
            aria-label="Previous card"
          >
            ‹
          </button>
        {/if}

        {#if hasNextCard()}
          <button
            class="lightbox-nav lightbox-nav-next"
            onclick={nextCard}
            aria-label="Next card"
          >
            ›
          </button>
        {/if}

        <!-- PACK-036: Card Display with Flip Animation -->
        <div class="lightbox-card-display">
          <div
            class="lightbox-card-wrapper"
            onclick={handleCardClick}
            role="button"
            tabindex="0"
            aria-label="Click to flip card"
            onkeydown={(e) => e.key === 'Enter' && handleCardClick()}
          >
            <div
              class="lightbox-card-inner"
              class:flipped={isFlipped}
              bind:this={cardImageElement}
            >
              <!-- Card Front -->
              <div class="lightbox-card-face">
                <Card
                  {card}
                  size="lg"
                  interactive={false}
                  enableLightbox={false}
                  enableShare={false}
                  showBack={false}
                  isFlipped={false}
                  cardList={cards}
                  cardIndex={index}
                />
              </div>

              <!-- Card Back -->
              <div class="lightbox-card-face lightbox-card-back">
                <Card
                  {card}
                  size="lg"
                  interactive={false}
                  enableLightbox={false}
                  enableShare={false}
                  showBack={true}
                  isFlipped={true}
                  cardList={cards}
                  cardIndex={index}
                />
              </div>
            </div>
          </div>

          <!-- Flip hint -->
          <div class="flip-hint" class:flipped-hint={isFlipped}>
            {isFlipped ? 'Click to see front' : 'Click to see back'}
          </div>
        </div>

        <!-- Info Panel -->
        <div class="lightbox-info-panel" style="--rarity-color: {RARITY_CONFIG[card.rarity].color}; --rarity-glow: {RARITY_CONFIG[card.rarity].glowColor};">
          <!-- Progress Indicator -->
          <div class="lightbox-progress">
            {progress}
          </div>

          <!-- Tab Navigation -->
          <div class="tab-navigation">
            <button
              class="tab-btn"
              class:active={activeTab === 'details'}
              onclick={() => switchTab('details')}
              aria-pressed={activeTab === 'details'}
            >
              <span class="tab-icon">📋</span>
              <span class="tab-label">Details</span>
            </button>
            <button
              class="tab-btn"
              class:active={activeTab === 'stats'}
              onclick={() => switchTab('stats')}
              aria-pressed={activeTab === 'stats'}
            >
              <span class="tab-icon">📊</span>
              <span class="tab-label">Stats</span>
            </button>
            <button
              class="tab-btn"
              class:active={activeTab === 'set'}
              onclick={() => switchTab('set')}
              aria-pressed={activeTab === 'set'}
            >
              <span class="tab-icon">🃏</span>
              <span class="tab-label">Set Info</span>
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Details Tab -->
            {#if activeTab === 'details'}
              <div class="card-details-section">
                <div class="detail-row">
                  <span class="detail-label">Type</span>
                  <span class="detail-value">
                    <span class="type-icon">{DAD_TYPE_ICONS[card.type]}</span>
                    {DAD_TYPE_NAMES[card.type]}
                  </span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Rarity</span>
                  <span class="detail-value" style="color: {RARITY_CONFIG[card.rarity].color};">
                    {RARITY_CONFIG[card.rarity].name}
                  </span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Card Number</span>
                  <span class="detail-value">#{card.cardNumber.toString().padStart(3, '0')}/{card.totalInSeries}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Series</span>
                  <span class="detail-value">{card.series}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Artist</span>
                  <span class="detail-value">{card.artist}</span>
                </div>

                {#if card.isHolo}
                  <div class="detail-row">
                    <span class="detail-label">Holo Variant</span>
                    <span class="detail-value holo-badge">
                      ✨ {getHoloVariantName(card.holoType)}
                    </span>
                  </div>
                {/if}
              </div>

              <!-- Flavor Text -->
              <div class="flavor-text-section">
                <p class="flavor-text">"{card.flavorText}"</p>
              </div>

              <!-- Collection Context -->
              <CardCollectionContext
                {card}
                ownedCount={1}
                firstPullDate={new Date()}
                onAddToDeck={() => console.log('Add to deck:', card.name)}
                onStartTrade={() => console.log('Start trade:', card.name)}
              />
            {/if}

            <!-- Stats Tab -->
            {#if activeTab === 'stats'}
              <EnhancedCardStats
                {card}
                showComparison={true}
                showRatings={true}
              />
            {/if}

            <!-- Set Info Tab -->
            {#if activeTab === 'set'}
              <CardSetInfo
                {card}
                ownedCount={1}
                seriesTotal={card.totalInSeries || 50}
              />
            {/if}
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button
              class="quick-action-btn"
              onclick={openZoomModal}
              aria-label="Zoom view"
            >
              <span class="action-icon">🔍</span>
              <span class="action-text">Zoom</span>
            </button>
            <button
              class="quick-action-btn"
              onclick={() => setCardViewMode(viewMode === '3d' ? 'default' : '3d')}
              class:active={viewMode === '3d'}
              aria-label="3D view"
              aria-pressed={viewMode === '3d'}
            >
              <span class="action-icon">🎲</span>
              <span class="action-text">3D</span>
            </button>
            <button
              class="quick-action-btn"
              onclick={toggleCardFlip}
              aria-label="Flip card"
            >
              <span class="action-icon">🔄</span>
              <span class="action-text">Flip</span>
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="lightbox-actions">
            {#if canShare}
              <button
                class="action-button action-button-primary"
                onclick={handleShare}
                disabled={isGeneratingImage}
                class:opacity-50={isGeneratingImage}
                class:cursor-not-allowed={isGeneratingImage}
                style="--button-color: {RARITY_CONFIG[card.rarity].color};"
                aria-label="Share {card.name} card"
              >
                {#if isGeneratingImage}
                  <span class="animate-spin" aria-hidden="true">⟳</span>
                  <span>Generating...</span>
                {:else}
                  <span aria-hidden="true">📤</span>
                  <span>Share</span>
                {/if}
              </button>
            {/if}

            <button
              class="action-button action-button-secondary"
              onclick={handleDownload}
              disabled={isGeneratingImage}
              class:opacity-50={isGeneratingImage}
              class:cursor-not-allowed={isGeneratingImage}
              style="--button-color: {RARITY_CONFIG[card.rarity].color};"
              aria-label="Download {card.name} card"
            >
              {#if isGeneratingImage}
                <span class="animate-spin" aria-hidden="true">⟳</span>
                <span>Generating...</span>
              {:else}
                <span aria-hidden="true">💾</span>
                <span>Download</span>
              {/if}
            </button>
          </div>

          {#if shareError}
            <div class="share-error">{shareError}</div>
          {/if}
        </div>
      </div>

      <!-- Keyboard Hints -->
      <div class="keyboard-hints" aria-hidden="true">
        <span class="hint">← → to navigate</span>
        <span class="hint">F / Space to flip</span>
        <span class="hint">Esc to close</span>
      </div>
    </div>

    <!-- 3D View Modal -->
    {#if viewMode === '3d'}
      <div class="view-3d-overlay">
        <div class="view-3d-container">
          <button class="view-3d-close" onclick={() => setCardViewMode('default')} aria-label="Close 3D view">
            ✕
          </button>
          <Card3DFlip
            {card}
            autoRotate={false}
            interactive={true}
            showParticles={true}
          />
          <div class="view-3d-hint">Drag or swipe to flip • Space to toggle</div>
        </div>
      </div>
    {/if}

    <!-- Zoom Modal -->
    <ZoomableCardModal
      {card}
      isOpen={isZoomOpen}
      onClose={closeZoomModal}
      maxZoom={3}
      minZoom={1}
    />
  </div>
{/if}

<style>
  .lightbox-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(8px);
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .lightbox-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1400px;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .lightbox-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .lightbox-close {
    position: absolute;
    top: -3rem;
    right: 0;
    width: 3rem;
    height: 3rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
  }

  .lightbox-close:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: #ef4444;
    transform: scale(1.1);
  }

  .lightbox-content {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2rem;
    align-items: center;
    max-height: calc(100vh - 4rem);
  }

  @media (max-width: 1024px) {
    .lightbox-content {
      grid-template-columns: 1fr;
      gap: 1rem;
      max-height: calc(100vh - 5rem);
      overflow-y: auto;
    }
  }

  /* Navigation Buttons */
  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 3.5rem;
    height: 3.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 5;
    line-height: 1;
  }

  .lightbox-nav:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.1);
  }

  .lightbox-nav-prev {
    left: -4rem;
  }

  .lightbox-nav-next {
    right: -4rem;
  }

  @media (max-width: 1024px) {
    .lightbox-nav-prev {
      left: 0.5rem;
    }

    .lightbox-nav-next {
      right: 0.5rem;
    }
  }

  /* PACK-036: Card Display with Flip Animation */
  .lightbox-card-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .lightbox-card-wrapper {
    position: relative;
    width: 100%;
    max-width: 500px;
    cursor: pointer;
    perspective: 1200px;
  }

  .lightbox-card-inner {
    position: relative;
    width: 100%;
    transform-style: preserve-3d;
    transition: transform 0.3s ease-out; /* PACK-036: 0.3s ease-out timing */
    will-change: transform;
  }

  .lightbox-card-inner.flipped {
    transform: rotateY(180deg);
  }

  .lightbox-card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .lightbox-card-back {
    transform: rotateY(180deg);
  }

  .flip-hint {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #94a3b8;
    background: rgba(15, 23, 42, 0.8);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    border: 1px solid rgba(71, 85, 105, 0.3);
    transition: all 0.3s ease;
  }

  .flip-hint.flipped-hint {
    background: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.4);
    color: #fbbf24;
  }

  /* Info Panel */
  .lightbox-info-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 1rem;
    backdrop-filter: blur(8px);
    min-width: 300px;
    max-height: 100%;
    overflow-y: auto;
  }

  @media (max-width: 1024px) {
    .lightbox-info-panel {
      min-width: auto;
    }
  }

  .lightbox-progress {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  /* Tab Navigation */
  .tab-navigation {
    display: flex;
    gap: 0.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.2);
  }

  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .tab-btn.active {
    background: var(--rarity-color);
    color: white;
    border-color: var(--rarity-color);
  }

  .tab-icon {
    font-size: 0.875rem;
  }

  .tab-label {
    font-weight: 500;
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 0;
  }

  /* Quick Actions */
  .quick-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 0;
    border-top: 1px solid rgba(71, 85, 105, 0.2);
    border-bottom: 1px solid rgba(71, 85, 105, 0.2);
  }

  .quick-action-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.625rem 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .quick-action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateY(-2px);
  }

  .quick-action-btn.active {
    background: var(--rarity-color);
    border-color: var(--rarity-color);
    color: white;
  }

  .quick-action-btn .action-icon {
    font-size: 1.25rem;
  }

  .quick-action-btn .action-text {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* 3D View Overlay */
  .view-3d-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  .view-3d-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .view-3d-close {
    position: absolute;
    top: -3rem;
    right: -3rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-3d-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .view-3d-hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(0, 0, 0, 0.5);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
  }

  @media (max-width: 640px) {
    .tab-navigation {
      gap: 0.25rem;
    }

    .tab-btn {
      padding: 0.375rem 0.5rem;
      font-size: 0.6875rem;
    }

    .tab-label {
      display: none;
    }

    .tab-icon {
      font-size: 1rem;
    }

    .quick-actions {
      gap: 0.375rem;
    }

    .quick-action-btn {
      padding: 0.5rem 0.375rem;
    }

    .view-3d-close {
      top: -2rem;
      right: 0;
    }
  }

  .card-details-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .detail-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .type-icon {
    font-size: 1rem;
    line-height: 1;
  }

  .holo-badge {
    background: linear-gradient(135deg, #ec4899, #a855f7);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
  }

  .flavor-text-section {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
    border: 1px solid rgba(71, 85, 105, 0.2);
  }

  .flavor-text {
    margin: 0;
    font-size: 0.875rem;
    color: #94a3b8;
    font-style: italic;
    text-align: center;
    line-height: 1.5;
  }

  .lightbox-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .action-button-primary {
    background: linear-gradient(135deg, var(--button-color), var(--button-color)dd);
    color: white;
    box-shadow: 0 4px 12px var(--button-color)44;
  }

  .action-button-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px var(--button-color)55;
  }

  .action-button-secondary {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    color: white;
  }

  .action-button-secondary:hover:not(:disabled) {
    background: rgba(51, 65, 85, 0.8);
    border-color: var(--button-color);
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .share-error {
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    border-radius: 0.5rem;
    color: #ef4444;
    font-size: 0.75rem;
    text-align: center;
  }

  .keyboard-hints {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding-top: 1rem;
    flex-wrap: wrap;
  }

  .hint {
    font-size: 0.75rem;
    color: #64748b;
    background: rgba(15, 23, 42, 0.8);
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    border: 1px solid rgba(71, 85, 105, 0.3);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  /* Accessibility: Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .lightbox-backdrop,
    .lightbox-close,
    .lightbox-nav,
    .action-button,
    .lightbox-card-inner,
    .flip-hint {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
