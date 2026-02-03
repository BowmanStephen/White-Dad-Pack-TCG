<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PackCard } from '@/types';
  import { RARITY_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS } from '@/types';
  import { collection } from '@/stores/collection';
  import { isDetailModalOpen, detailModalCard, closeDetailModal } from '@/stores/card-detail-modal';
  import { subscribeToStores } from '@/lib/utils/store-helpers';
  import EnhancedCardStats from '@components/card/EnhancedCardStats.svelte';
  import GenerativeCardArt from '@components/art/GenerativeCardArt.svelte';
  import { isSpecialCardType, getSpecialCardTypeLabel, hasCardStats } from '@/lib/card-types';

  // Subscribe to store
  let isOpen = $state(isDetailModalOpen.get());
  let card = $state<PackCard | null>(detailModalCard.get());

  // Deck state (stubbed - feature archived)
  let showDeckSelector = $state(false);
  let deckActionMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

  // Derived state
  let ownedCount = $state(0);
  let packHistory = $state<Array<{ packId: string; packNumber: number; openedAt: Date }>>([]);
  let upgradeLevel = $state(0); // TODO: Integrate with upgrade system
  let modalElement = $state<HTMLDivElement | null>(null);
  let hasKeyListener = false;

  // Get card ownership info from collection
  function loadCardInfo() {
    const currentCollection = collection.get();

    // Count how many copies of this card are owned
    ownedCount = 0;
    const nextHistory: Array<{ packId: string; packNumber: number; openedAt: Date }> = [];

    currentCollection.packs.forEach((pack, packIndex) => {
      const packNumber = packIndex + 1;
      const cardsInPack = pack.cards.filter(c => c.id === card?.id);

      if (cardsInPack.length > 0) {
        ownedCount += cardsInPack.length;
        nextHistory.push({
          packId: pack.id,
          packNumber,
          openedAt: pack.openedAt,
        });
      }
    });

    packHistory = nextHistory;
  }

  // Load card info when component mounts or card changes
  $effect(() => {
    if (isOpen && card) {
      loadCardInfo();
    }
  });

  // Keyboard handler
  function handleKeyDown(event: KeyboardEvent) {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      closeDetailModal();
    }
  }

  // Add to deck (stubbed - feature archived)
  function handleAddToDeck() {
    showDeckMessage('error', 'Deck building feature coming soon!');
  }

  // Select a deck and add the card (stubbed)
  function selectDeckAndAdd(deckId: string) {
    showDeckSelector = false;
  }

  // Create new deck and add card (stubbed)
  function createDeckAndAdd() {
    showDeckSelector = false;
    showDeckMessage('error', 'Deck building feature coming soon!');
  }

  // Show deck action message with auto-dismiss
  function showDeckMessage(type: 'success' | 'error', text: string) {
    deckActionMessage = { type, text };
    setTimeout(() => {
      deckActionMessage = null;
    }, 3000);
  }

  // Close deck selector when clicking outside
  function closeDeckSelector() {
    showDeckSelector = false;
  }

  let unsubscribeStores: (() => void) | null = null;

  // Setup listeners
  onMount(() => {
    unsubscribeStores = subscribeToStores([
      { store: isDetailModalOpen, onUpdate: (v) => { isOpen = v; } },
      { store: detailModalCard, onUpdate: (v) => { card = v; } },
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

  // Prevent body scroll when modal is open
  $effect(() => {
    if (isOpen) {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }
  });

  // Helper functions
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

  function isStatlessCard(type: string): boolean {
    return isSpecialCardType(type) && type !== 'EVOLUTION' && type !== 'ITEM';
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
</script>

{#if isOpen && card}
  <div
    class="modal-backdrop"
    bind:this={modalElement}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-card-name"
    tabindex="-1"
  >
    <button
      class="modal-overlay"
      onclick={closeDetailModal}
      aria-label="Close card details"
      type="button"
    ></button>
    <div class="modal-container">
      <!-- Close Button -->
      <button
        class="modal-close"
        onclick={closeDetailModal}
        aria-label="Close card details"
        type="button"
      >
        ✕
      </button>

      <div class="modal-content">
        <!-- Left Side: Card Display -->
        <div class="card-display">
          <div
            class="card-image"
            style="--rarity-color: {RARITY_CONFIG[card.rarity].color}; --rarity-glow: {RARITY_CONFIG[card.rarity].glowColor};"
          >
            <!-- Card Background -->
            <div class="card-bg" style="background: {getCardBackground(card.rarity)};">
              <!-- Full-size artwork -->
              <div class="artwork">
                <GenerativeCardArt
                  card={card}
                  width={400}
                  height={400}
                  showName={false}
                  alt={card.name}
                />
              </div>

              <!-- Holo overlay -->
              {#if card.isHolo}
                <div class="holo-overlay"></div>
              {/if}

              <!-- Card name overlay -->
              <div class="card-name-overlay">
                <h2 id="modal-card-name" class="card-title">{card.name}</h2>
                <p class="card-subtitle">{card.subtitle}</p>
              </div>

              <!-- Rarity indicator -->
              <div class="rarity-badge" style="background: {RARITY_CONFIG[card.rarity].color};">
                {RARITY_CONFIG[card.rarity].name}
                {#if card.isHolo}
                  <span class="holo-indicator">✨</span>
                {/if}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Card Details -->
        <div class="info-panel">
          <!-- Ownership Section -->
          <div class="ownership-section">
            <h3 class="section-title">Ownership</h3>
            <div class="ownership-info">
              <div class="info-row">
                <span class="info-label">You own:</span>
                <span class="info-value">{ownedCount} {ownedCount === 1 ? 'copy' : 'copies'}</span>
              </div>

              {#if packHistory.length > 0}
                <div class="info-row">
                  <span class="info-label">Pulled in packs:</span>
                  <span class="info-value">
                    {#each packHistory.slice(0, 5) as pack}
                      <span class="pack-number">#{pack.packNumber}</span>
                    {/each}
                    {#if packHistory.length > 5}
                      <span class="more-packs">+{packHistory.length - 5} more</span>
                    {/if}
                  </span>
                </div>
              {/if}

              {#if upgradeLevel > 0}
                <div class="info-row">
                  <span class="info-label">Upgrade level:</span>
                  <span class="info-value upgrade-badge">Level {upgradeLevel}</span>
                </div>
              {/if}
            </div>
          </div>

          <!-- Card Details Section -->
          <div class="details-section">
            <h3 class="section-title">Card Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Type</span>
                <span class="detail-value">
                  <span class="type-icon">{DAD_TYPE_ICONS[card.type]}</span>
                  {DAD_TYPE_NAMES[card.type]}
                </span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Rarity</span>
                <span class="detail-value" style="color: {RARITY_CONFIG[card.rarity].color};">
                  {RARITY_CONFIG[card.rarity].name}
                </span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Card Number</span>
                <span class="detail-value">#{card.cardNumber.toString().padStart(3, '0')}/{card.totalInSeries}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Series</span>
                <span class="detail-value">{card.series}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Artist</span>
                <span class="detail-value">{card.artist}</span>
              </div>

              {#if card.isHolo}
                <div class="detail-item">
                  <span class="detail-label">Holo Variant</span>
                  <span class="detail-value holo-badge">
                    ✨ {getHoloVariantName(card.holoType)}
                  </span>
                </div>
              {/if}
            </div>
          </div>

          <!-- Flavor Text -->
          {#if card.flavorText}
            <div class="flavor-section">
              <h3 class="section-title">Flavor Text</h3>
              <p class="flavor-text">"{card.flavorText}"</p>
            </div>
          {/if}

          <!-- Card Stats -->
          {#if hasCardStats(card.type)}
            <div class="stats-section">
              <h3 class="section-title">Stats</h3>
              <EnhancedCardStats
                {card}
                showComparison={false}
                showRatings={true}
              />
            </div>
          {:else}
            <div class="statless-section">
              <p class="statless-text">{getSpecialCardTypeLabel(card.type)} Card</p>
              <p class="statless-subtext">Effect-based abilities</p>
            </div>
          {/if}

          <!-- Actions -->
          <div class="actions-section">
            {#if ownedCount > 0}
              <div class="deck-action-container">
                <button
                  class="action-button action-button-primary"
                  onclick={handleAddToDeck}
                  style="--button-color: {RARITY_CONFIG[card.rarity].color};"
                >
                  <span aria-hidden="true">🃏</span>
                  {activeDeck ? `Add to "${activeDeck.name}"` : 'Add to Deck'}
                </button>

                <!-- Deck Selector Dropdown -->
                {#if showDeckSelector}
                  <div class="deck-selector-dropdown">
                    <div class="deck-selector-header">
                      <span>Select a deck</span>
                      <button class="deck-selector-close" onclick={closeDeckSelector}>✕</button>
                    </div>
                    <div class="deck-selector-list">
                      {#each allDecks as deck}
                        <button
                          class="deck-selector-item"
                          onclick={() => selectDeckAndAdd(deck.id)}
                        >
                          <span class="deck-name">{deck.name}</span>
                          <span class="deck-card-count">{deck.cards.length} cards</span>
                        </button>
                      {/each}
                      {#if !deckLimitReached}
                        <button
                          class="deck-selector-item deck-selector-new"
                          onclick={createDeckAndAdd}
                        >
                          <span>+ Create New Deck</span>
                        </button>
                      {/if}
                    </div>
                  </div>
                {/if}

                <!-- Feedback Message -->
                {#if deckActionMessage}
                  <div class="deck-action-message deck-action-message-{deckActionMessage.type}">
                    {deckActionMessage.text}
                  </div>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Pack History Details -->
          {#if packHistory.length > 0}
            <div class="pack-history-section">
              <h3 class="section-title">Pack History</h3>
              <div class="pack-history-list">
                {#each packHistory as pack}
                  <div class="pack-history-item">
                    <span class="pack-history-number">Pack #{pack.packNumber}</span>
                    <span class="pack-history-date">{formatDate(pack.openedAt)}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Keyboard Hints -->
      <div class="keyboard-hints" aria-hidden="true">
        <span class="hint">Esc to close</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
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

  .modal-overlay {
    position: absolute;
    inset: 0;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1200px;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .modal-close {
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

  .modal-close:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: #ef4444;
    transform: scale(1.1);
  }

  .modal-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
  }

  @media (max-width: 1024px) {
    .modal-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      max-height: calc(100vh - 5rem);
    }
  }

  /* Card Display */
  .card-display {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card-image {
    position: relative;
    width: 100%;
    max-width: 500px;
    aspect-ratio: 1 / 1.2;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 0 60px var(--rarity-glow), 0 0 120px var(--rarity-glow)55;
  }

  .card-bg {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .artwork {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .artwork :global(canvas) {
    width: 100% !important;
    height: 100% !important;
  }

  .holo-overlay {
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

  .card-title {
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0.25rem 0 0 0;
    font-style: italic;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  }

  .rarity-badge {
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
  .info-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 1rem;
    backdrop-filter: blur(8px);
  }

  .section-title {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    font-weight: 700;
    color: #fbbf24;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Ownership Section */
  .ownership-section {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  .ownership-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .info-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
  }

  .info-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .pack-number {
    padding: 0.25rem 0.5rem;
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.5);
    border-radius: 0.375rem;
    font-size: 0.75rem;
    color: #fbbf24;
  }

  .more-packs {
    font-size: 0.75rem;
    color: #64748b;
  }

  .upgrade-badge {
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border-radius: 9999px;
    font-size: 0.75rem;
  }

  /* Details Section */
  .details-section {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .detail-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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
    gap: 0.375rem;
  }

  .type-icon {
    font-size: 0.875rem;
  }

  .holo-badge {
    background: linear-gradient(135deg, #ec4899, #a855f7);
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
  }

  /* Flavor Section */
  .flavor-section {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  .flavor-text {
    margin: 0;
    font-size: 0.875rem;
    color: #94a3b8;
    font-style: italic;
    text-align: center;
    line-height: 1.5;
  }

  /* Stats Section */
  .stats-section {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  .statless-section {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    border: 1px solid rgba(71, 85, 105, 0.2);
    text-align: center;
  }

  .statless-text {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    color: #94a3b8;
    font-weight: 600;
  }

  .statless-subtext {
    margin: 0;
    font-size: 0.75rem;
    color: #64748b;
  }

  /* Actions Section */
  .actions-section {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    width: 100%;
  }

  .action-button-primary {
    background: linear-gradient(135deg, var(--button-color), var(--button-color)dd);
    color: white;
    box-shadow: 0 4px 12px var(--button-color)44;
  }

  .action-button-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px var(--button-color)55;
  }

  /* Deck Action Container */
  .deck-action-container {
    position: relative;
    width: 100%;
  }

  /* Deck Selector Dropdown */
  .deck-selector-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.5rem;
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    overflow: hidden;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    animation: slideDown 0.15s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .deck-selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .deck-selector-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    font-size: 0.875rem;
    transition: color 0.2s;
  }

  .deck-selector-close:hover {
    color: #ef4444;
  }

  .deck-selector-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .deck-selector-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(71, 85, 105, 0.2);
    color: white;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
  }

  .deck-selector-item:hover {
    background: rgba(251, 191, 36, 0.1);
  }

  .deck-selector-item:last-child {
    border-bottom: none;
  }

  .deck-selector-new {
    color: #22c55e;
    font-weight: 600;
  }

  .deck-selector-new:hover {
    background: rgba(34, 197, 94, 0.1);
  }

  .deck-name {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .deck-card-count {
    font-size: 0.75rem;
    color: #64748b;
  }

  /* Deck Action Message */
  .deck-action-message {
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    animation: fadeInOut 3s ease-in-out;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-4px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-4px); }
  }

  .deck-action-message-success {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    color: #22c55e;
  }

  .deck-action-message-error {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #ef4444;
  }

  /* Pack History Section */
  .pack-history-section {
    max-height: 300px;
    overflow-y: auto;
  }

  .pack-history-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pack-history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
    border: 1px solid rgba(71, 85, 105, 0.2);
  }

  .pack-history-number {
    font-size: 0.875rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .pack-history-date {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  /* Keyboard Hints */
  .keyboard-hints {
    display: flex;
    justify-content: center;
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

  /* Accessibility: Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .modal-backdrop,
    .modal-close,
    .action-button,
    .holo-overlay {
      animation: none !important;
      transition: none !important;
    }
  }

  /* Scrollbar styling */
  .info-panel::-webkit-scrollbar,
  .modal-content::-webkit-scrollbar,
  .pack-history-section::-webkit-scrollbar {
    width: 8px;
  }

  .info-panel::-webkit-scrollbar-track,
  .modal-content::-webkit-scrollbar-track,
  .pack-history-section::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .info-panel::-webkit-scrollbar-thumb,
  .modal-content::-webkit-scrollbar-thumb,
  .pack-history-section::-webkit-scrollbar-thumb {
    background: rgba(71, 85, 105, 0.5);
    border-radius: 4px;
  }

  .info-panel::-webkit-scrollbar-thumb:hover,
  .modal-content::-webkit-scrollbar-thumb:hover,
  .pack-history-section::-webkit-scrollbar-thumb:hover {
    background: rgba(71, 85, 105, 0.7);
  }
</style>
