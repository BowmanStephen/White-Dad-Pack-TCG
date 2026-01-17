<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    isLightboxOpen,
    currentCard,
    currentIndex,
    nextCard,
    prevCard,
    closeLightbox,
    hasNextCard,
    hasPrevCard,
    getProgress,
  } from '../../stores/lightbox';
  import { RARITY_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS, STAT_NAMES, STAT_ICONS } from '../../types';
  import type { PackCard } from '../../types';
  import GenerativeCardArt from '../art/GenerativeCardArt.svelte';
  import { downloadCardImage, shareCardImage, checkShareSupport } from '../../lib/utils/image-generation';

  // Subscribe to store changes
  $: isOpen = $isLightboxOpen;
  $: card = $currentCard;
  $: index = $currentIndex;
  $: progress = getProgress();

  // Share support check
  $: shareSupport = checkShareSupport();
  $: canShare = shareSupport.webShareAPI && shareSupport.webShareFiles;

  // Share/download state
  let isGeneratingImage = false;
  let shareError: string | null = null;
  let lightboxElement: HTMLDivElement;
  let cardImageElement: HTMLDivElement;

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
    }
  }

  // Click outside to close
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === lightboxElement) {
      closeLightbox();
    }
  }

  // Download functionality
  async function handleDownload() {
    if (isGeneratingImage || !card || !cardImageElement) return;
    isGeneratingImage = true;
    shareError = null;

    try {
      await downloadCardImage(card, cardImageElement, { scale: 2 });
    } catch (error) {
      console.error('Failed to download card image:', error);
      shareError = 'Failed to download image. Please try again.';
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
      console.error('Failed to share card image:', error);
      shareError = 'Failed to share image. Please try again.';
      isGeneratingImage = false;
    } finally {
      isGeneratingImage = false;
    }
  }

  // Setup keyboard listener
  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  // Prevent body scroll when lightbox is open
  $: if (isOpen) {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }
</script>

{#if isOpen && card}
  <div
    class="lightbox-backdrop"
    bind:this={lightboxElement}
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="lightbox-card-name"
  >
    <div class="lightbox-container">
      <!-- Close Button -->
      <button
        class="lightbox-close"
        on:click={closeLightbox}
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
            on:click={prevCard}
            aria-label="Previous card"
          >
            ‹
          </button>
        {/if}

        {#if hasNextCard()}
          <button
            class="lightbox-nav lightbox-nav-next"
            on:click={nextCard}
            aria-label="Next card"
          >
            ›
          </button>
        {/if}

        <!-- Card Display (Max Resolution) -->
        <div class="lightbox-card-display">
          <div
            class="lightbox-card-image"
            bind:this={cardImageElement}
            style="--rarity-color: {RARITY_CONFIG[card.rarity].color}; --rarity-glow: {RARITY_CONFIG[card.rarity].glowColor};"
          >
            <!-- Card Background -->
            <div class="card-bg-full" style="background: {getCardBackground(card.rarity)};">
              <!-- Full-size artwork -->
              <div class="artwork-full">
                <GenerativeCardArt
                  card={card}
                  width={800}
                  height={800}
                  showName={false}
                  alt={card.name}
                />
              </div>

              <!-- Holo overlay for full-screen effect -->
              {#if card.isHolo}
                <div class="holo-overlay-full"></div>
              {/if}

              <!-- Card name overlay -->
              <div class="card-name-overlay">
                <h2 id="lightbox-card-name" class="card-title-full">{card.name}</h2>
                <p class="card-subtitle-full">{card.subtitle}</p>
              </div>

              <!-- Rarity indicator -->
              <div class="rarity-badge-full" style="background: {RARITY_CONFIG[card.rarity].color};">
                {RARITY_CONFIG[card.rarity].name}
                {#if card.isHolo}
                  <span class="holo-indicator">✨</span>
                {/if}
              </div>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="lightbox-info-panel">
          <!-- Progress Indicator -->
          <div class="lightbox-progress">
            {progress}
          </div>

          <!-- Card Details -->
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

          <!-- Action Buttons -->
          <div class="lightbox-actions">
            {#if canShare}
              <button
                class="action-button action-button-primary"
                on:click={handleShare}
                disabled={isGeneratingImage}
                class:opacity-50={isGeneratingImage}
                class:cursor-not-allowed={isGeneratingImage}
                style="--button-color: {RARITY_CONFIG[card.rarity].color};"
              >
                {#if isGeneratingImage}
                  <span class="animate-spin">⟳</span>
                  <span>Generating...</span>
                {:else}
                  <span>📤</span>
                  <span>Share</span>
                {/if}
              </button>
            {/if}

            <button
              class="action-button action-button-secondary"
              on:click={handleDownload}
              disabled={isGeneratingImage}
              class:opacity-50={isGeneratingImage}
              class:cursor-not-allowed={isGeneratingImage}
              style="--button-color: {RARITY_CONFIG[card.rarity].color};"
            >
              {#if isGeneratingImage}
                <span class="animate-spin">⟳</span>
                <span>Generating...</span>
              {:else}
                <span>💾</span>
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
      <div class="keyboard-hints">
        <span class="hint">← → to navigate</span>
        <span class="hint">Esc to close</span>
      </div>
    </div>
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
    width: 100%;
    max-width: 1400px;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
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

  /* Card Display */
  .lightbox-card-display {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lightbox-card-image {
    position: relative;
    width: 100%;
    max-width: 600px;
    aspect-ratio: 1 / 1.2;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 0 60px var(--rarity-glow), 0 0 120px var(--rarity-glow)55;
  }

  .card-bg-full {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .artwork-full {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .artwork-full :global(canvas) {
    width: 100% !important;
    height: 100% !important;
  }

  .holo-overlay-full {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    animation: holo-shift 3s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes holo-shift {
    0%, 100% {
      opacity: 0.3;
      transform: translateX(-10%);
    }
    50% {
      opacity: 0.6;
      transform: translateX(10%);
    }
  }

  .card-name-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem 1.5rem 1rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
    text-align: center;
  }

  .card-title-full {
    font-size: 2rem;
    font-weight: 900;
    color: white;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  }

  .card-subtitle-full {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0.25rem 0 0 0;
    font-style: italic;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  }

  .rarity-badge-full {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-weight: 700;
    font-size: 0.875rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .holo-indicator {
    font-size: 1rem;
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
    .holo-overlay-full {
      animation: none !important;
      transition: none !important;
    }
  }
</style>

<script lang="ts">
  // Helper function for card background
  function getCardBackground(rarity: string): string {
    switch (rarity) {
      case 'common':
      case 'uncommon':
        return 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)';
      case 'rare':
        return 'linear-gradient(to bottom right, #1e3a8a, #1e293b, #172554)';
      case 'epic':
        return 'linear-gradient(to bottom right, #581c87, #312e81, #3b0764)';
      case 'legendary':
        return 'linear-gradient(to bottom right, #78350f, #7c2d12, #450a0a)';
      case 'mythic':
        return 'linear-gradient(to bottom right, #831843, #701a75, #500724)';
      default:
        return 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)';
    }
  }

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
