<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllCards } from '@/lib/cards/database';
  import {
    offeredCards,
    requestedCards,
    addOfferedCard,
    removeOfferedCard,
    addRequestedCard,
    removeRequestedCard,
    clearSelections,
    createTradeOffer,
    saveTradeOffer,
    getTradeOfferUrl,
    selectionValid,
    currentTrade,
  } from '@/stores/trade';
  import { collection } from '@/stores/collection';
  import type { CardInCollection } from '@/types/card';
  import type { TradeCard } from '@/types/trading-crafting';

  const MAX_CARDS_PER_SIDE = 6;
  const RARITY_OPTIONS = [
    { value: 'all', label: 'All Rarities' },
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'epic', label: 'Epic' },
    { value: 'legendary', label: 'Legendary' },
    { value: 'mythic', label: 'Mythic' },
  ];
  const RARITY_CLASS_MAP: Record<string, string> = {
    common: 'text-gray-400 border-gray-400',
    uncommon: 'text-blue-400 border-blue-400',
    rare: 'text-yellow-400 border-yellow-400',
    epic: 'text-purple-400 border-purple-400',
    legendary: 'text-orange-400 border-orange-400',
    mythic: 'text-pink-400 border-pink-400',
  };

  // UI state
  let showOfferedSelector = $state(false);
  let showRequestedSelector = $state(false);
  let showShareModal = $state(false);
  let shareUrl = $state('');
  let senderName = $state('');
  let tradeMessage = $state('');
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let isGenerating = $state(false);

  // Card databases
  let collectionCards = $state<CardInCollection[]>([]);
  let allCards = $state(getAllCards());

  // Filter states
  let offerSearchQuery = $state('');
  let offerRarityFilter = $state<string>('all');
  let requestSearchQuery = $state('');
  let requestRarityFilter = $state<string>('all');

  // Computed filtered lists
  let filteredOfferCards = $derived(
    filterCards(collectionCards, offerSearchQuery, offerRarityFilter)
  );

  let filteredRequestCards = $derived(
    filterCards(allCards, requestSearchQuery, requestRarityFilter)
  );

  onMount(() => {
    // Load collection cards
    const coll = collection.get();
    collectionCards = coll.cards || [];

    // Load sender name from localStorage if available
    const savedName = localStorage.getItem('daddeck-trade-name');
    if (savedName) {
      senderName = savedName;
    }
  });

  function filterCards<T extends { name: string; rarity: string }>(
    cards: T[],
    query: string,
    rarity: string
  ): T[] {
    const search = query.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesSearch = search.length === 0
        ? true
        : card.name.toLowerCase().includes(search);
      const matchesRarity = rarity === 'all' || card.rarity === rarity;
      return matchesSearch && matchesRarity;
    });
  }

  function isOfferedSelected(cardId: string): boolean {
    return $offeredCards.some((card) => card.id === cardId);
  }

  function isRequestedSelected(cardId: string): boolean {
    return $requestedCards.some((card) => card.id === cardId);
  }

  function toRequestedTradeCard(card: typeof allCards[0]): TradeCard {
    return {
      id: card.id,
      name: card.name,
      rarity: card.rarity,
      type: card.type,
      holoVariant: card.holoVariant || 'none',
      isHolo: false,
    };
  }

  /**
   * Add a card from collection to offer list
   */
  function handleAddOfferedCard(card: CardInCollection): void {
    addOfferedCard(card);
    error = null;
  }

  /**
   * Add a card from database to request list
   */
  function handleAddRequestedCard(card: typeof allCards[0]): void {
    addRequestedCard(toRequestedTradeCard(card));
    error = null;
  }

  /**
   * Generate trade offer and create shareable URL
   */
  async function handleCreateTradeOffer(): Promise<void> {
    error = null;
    success = null;

    // Validate sender name
    if (!senderName.trim()) {
      error = 'Please enter your name';
      return;
    }

    // Validate selections
    const offered = offeredCards.get();
    const requested = requestedCards.get();

    if (offered.length === 0) {
      error = 'Please select cards to offer';
      return;
    }

    if (requested.length === 0) {
      error = 'Please select cards to request';
      return;
    }

    try {
      isGenerating = true;

      // Save sender name
      localStorage.setItem('daddeck-trade-name', senderName.trim());

      // Create trade offer
      const tradeOffer = createTradeOffer(senderName.trim(), tradeMessage.trim() || undefined);

      // Save to sent trades
      saveTradeOffer(tradeOffer);

      // Generate share URL
      shareUrl = getTradeOfferUrl(tradeOffer);

      // Show share modal
      showShareModal = true;

      success = 'Trade offer created!';

      // Clear selections after successful creation
      // Note: We don't clear immediately so user can see what they created
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create trade offer';
    } finally {
      isGenerating = false;
    }
  }

  /**
   * Copy share URL to clipboard
   */
  async function handleCopyUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(shareUrl);
      success = 'URL copied to clipboard!';
      setTimeout(() => {
        success = null;
      }, 3000);
    } catch (err) {
      error = 'Failed to copy URL';
    }
  }

  /**
   * Clear all selections
   */
  function handleClearSelections(): void {
    clearSelections();
    error = null;
    success = null;
  }

  /**
   * Close share modal and clear selections
   */
  function handleCloseShareModal(): void {
    showShareModal = false;
    handleClearSelections();
  }

  /**
   * Get rarity color class
   */
  function getRarityColor(rarity: string): string {
    return RARITY_CLASS_MAP[rarity] || RARITY_CLASS_MAP.common;
  }
</script>

<div class="trade-creator-container">
  <div class="trade-creator-header">
    <h1>Create Trade Offer</h1>
    <p>Select cards from your collection to trade, and cards you'd like in return</p>
  </div>

  <!-- Error and Success Messages -->
  {#if error}
    <div class="alert alert-error">
      <span>{error}</span>
      <button on:click={() => error = null} class="alert-close">×</button>
    </div>
  {/if}

  {#if success}
    <div class="alert alert-success">
      <span>{success}</span>
      <button on:click={() => success = null} class="alert-close">×</button>
    </div>
  {/if}

  <!-- Sender Name Input -->
  <div class="form-group">
    <label for="sender-name">Your Name *</label>
    <input
      id="sender-name"
      type="text"
      bind:value={senderName}
      placeholder="Enter your name"
      class="input-field"
      maxlength={50}
    />
  </div>

  <!-- Trade Message (Optional) -->
  <div class="form-group">
    <label for="trade-message">Message (Optional)</label>
    <textarea
      id="trade-message"
      bind:value={tradeMessage}
      placeholder="Add a message for your trade partner..."
      class="textarea-field"
      rows={3}
      maxlength={200}
    ></textarea>
  </div>

  <!-- Selection Panels -->
  <div class="trade-panels">
    <!-- Cards to Offer Panel -->
    <div class="trade-panel">
      <div class="panel-header">
        <h2>Cards You're Offering</h2>
        <span class="card-count">{$offeredCards.length}/{MAX_CARDS_PER_SIDE}</span>
      </div>

      <div class="panel-content">
        {#if $offeredCards.length === 0}
          <div class="empty-state">
            <p>No cards selected</p>
            <button on:click={() => showOfferedSelector = true} class="btn-secondary">
              Select Cards to Offer
            </button>
          </div>
        {:else}
          <div class="selected-cards">
            {#each $offeredCards as card}
              <div class="card-item selected">
                <div class="card-info">
                  <span class="card-name">{card.name}</span>
                  <span class="card-rarity {getRarityColor(card.rarity)}">{card.rarity}</span>
                </div>
                <button on:click={() => removeOfferedCard(card.id)} class="btn-remove" aria-label="Remove card">
                  ×
                </button>
              </div>
            {/each}
          </div>
          <button on:click={() => showOfferedSelector = true} class="btn-secondary full-width">
            Add More Cards
          </button>
        {/if}
      </div>
    </div>

    <!-- Cards to Request Panel -->
    <div class="trade-panel">
      <div class="panel-header">
        <h2>Cards You're Requesting</h2>
        <span class="card-count">{$requestedCards.length}/{MAX_CARDS_PER_SIDE}</span>
      </div>

      <div class="panel-content">
        {#if $requestedCards.length === 0}
          <div class="empty-state">
            <p>No cards selected</p>
            <button on:click={() => showRequestedSelector = true} class="btn-secondary">
              Select Cards to Request
            </button>
          </div>
        {:else}
          <div class="selected-cards">
            {#each $requestedCards as card}
              <div class="card-item selected">
                <div class="card-info">
                  <span class="card-name">{card.name}</span>
                  <span class="card-rarity {getRarityColor(card.rarity)}">{card.rarity}</span>
                </div>
                <button on:click={() => removeRequestedCard(card.id)} class="btn-remove" aria-label="Remove card">
                  ×
                </button>
              </div>
            {/each}
          </div>
          <button on:click={() => showRequestedSelector = true} class="btn-secondary full-width">
            Add More Cards
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="action-buttons">
    <button
      on:click={handleCreateTradeOffer}
      disabled={!$selectionValid || isGenerating}
      class="btn-primary"
    >
      {#if isGenerating}
        Generating...
      {:else}
        Create Trade Offer
      {/if}
    </button>

    <button
      on:click={handleClearSelections}
      disabled={$offeredCards.length === 0 && $requestedCards.length === 0}
      class="btn-secondary"
    >
      Clear Selections
    </button>
  </div>

  <!-- Offered Card Selector Modal -->
  {#if showOfferedSelector}
    <div class="modal-backdrop" on:click={() => showOfferedSelector = false}>
      <div class="modal-content" on:click={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>Select Cards to Offer</h2>
          <button on:click={() => showOfferedSelector = false} class="modal-close">×</button>
        </div>

        <div class="modal-body">
          <!-- Filters -->
          <div class="filters">
            <input
              type="text"
              bind:value={offerSearchQuery}
              placeholder="Search cards..."
              class="input-field"
            />
            <select bind:value={offerRarityFilter} class="select-field">
              {#each RARITY_OPTIONS as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>

          <!-- Card List -->
          <div class="card-list">
            {#each filteredOfferCards as card}
              <div
                class="card-item {isOfferedSelected(card.id) ? 'disabled' : ''}"
                on:click={() => !isOfferedSelected(card.id) && handleAddOfferedCard(card)}
              >
                <div class="card-info">
                  <span class="card-name">{card.name}</span>
                  <span class="card-type">{card.type}</span>
                  <span class="card-rarity {getRarityColor(card.rarity)}">{card.rarity}</span>
                </div>
                {#if isOfferedSelected(card.id)}
                  <span class="card-status">Added</span>
                {:else}
                  <button class="btn-add">+</button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Requested Card Selector Modal -->
  {#if showRequestedSelector}
    <div class="modal-backdrop" on:click={() => showRequestedSelector = false}>
      <div class="modal-content" on:click={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>Select Cards to Request</h2>
          <button on:click={() => showRequestedSelector = false} class="modal-close">×</button>
        </div>

        <div class="modal-body">
          <!-- Filters -->
          <div class="filters">
            <input
              type="text"
              bind:value={requestSearchQuery}
              placeholder="Search cards..."
              class="input-field"
            />
            <select bind:value={requestRarityFilter} class="select-field">
              {#each RARITY_OPTIONS as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>

          <!-- Card List -->
          <div class="card-list">
            {#each filteredRequestCards as card}
              <div
                class="card-item {isRequestedSelected(card.id) ? 'disabled' : ''}"
                on:click={() => !isRequestedSelected(card.id) && handleAddRequestedCard(card)}
              >
                <div class="card-info">
                  <span class="card-name">{card.name}</span>
                  <span class="card-type">{card.type}</span>
                  <span class="card-rarity {getRarityColor(card.rarity)}">{card.rarity}</span>
                </div>
                {#if isRequestedSelected(card.id)}
                  <span class="card-status">Added</span>
                {:else}
                  <button class="btn-add">+</button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Share URL Modal -->
  {#if showShareModal}
    <div class="modal-backdrop" on:click={handleCloseShareModal}>
      <div class="modal-content share-modal" on:click={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>Trade Offer Created!</h2>
          <button on:click={handleCloseShareModal} class="modal-close">×</button>
        </div>

        <div class="modal-body">
          <p class="share-instructions">
            Share this URL with your trade partner to send them this offer:
          </p>

          <div class="share-url-container">
            <input
              type="text"
              readonly
              value={shareUrl}
              class="share-url-input"
            />
            <button on:click={handleCopyUrl} class="btn-primary">
              Copy URL
            </button>
          </div>

          <div class="trade-summary">
            <h3>Trade Summary</h3>
            <div class="summary-section">
              <h4>You're Offering:</h4>
              <ul>
                {#each $offeredCards as card}
                  <li>{card.name} ({card.rarity})</li>
                {/each}
              </ul>
            </div>
            <div class="summary-section">
              <h4>You're Requesting:</h4>
              <ul>
                {#each $requestedCards as card}
                  <li>{card.name} ({card.rarity})</li>
                {/each}
              </ul>
            </div>
          </div>

          <div class="modal-actions">
            <button on:click={handleCloseShareModal} class="btn-primary">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .trade-creator-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .trade-creator-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .trade-creator-header h1 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .trade-creator-header p {
    color: #9ca3af;
  }

  .alert {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .alert-error {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    color: #ef4444;
  }

  .alert-success {
    background-color: rgba(34, 197, 94, 0.1);
    border: 1px solid #22c55e;
    color: #22c55e;
  }

  .alert-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #e5e7eb;
  }

  .input-field,
  .textarea-field {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    background-color: #1f2937;
    color: #e5e7eb;
    font-size: 1rem;
  }

  .input-field:focus,
  .textarea-field:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }

  .trade-panels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .trade-panel {
    background-color: #1f2937;
    border: 1px solid #374151;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #111827;
    border-bottom: 1px solid #374151;
  }

  .panel-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .card-count {
    padding: 0.25rem 0.75rem;
    background-color: #374151;
    border-radius: 1rem;
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .panel-content {
    padding: 1rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: #9ca3af;
  }

  .empty-state p {
    margin-bottom: 1rem;
  }

  .selected-cards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .card-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: #111827;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .card-item:hover:not(.disabled) {
    border-color: #f59e0b;
    background-color: #1f2937;
  }

  .card-item.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .card-item.selected {
    border-color: #f59e0b;
  }

  .card-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .card-name {
    font-weight: 600;
    color: #e5e7eb;
  }

  .card-type {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .card-rarity {
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .btn-remove {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
  }

  .btn-remove:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }

  .btn-add {
    background-color: #22c55e;
    border: none;
    color: white;
    font-size: 1.25rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
  }

  .btn-add:hover {
    background-color: #16a34a;
  }

  .card-status {
    padding: 0.25rem 0.5rem;
    background-color: #22c55e;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
  }

  .full-width {
    width: 100%;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: #374151;
    color: #e5e7eb;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #4b5563;
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Modal Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background-color: #1f2937;
    border: 1px solid #374151;
    border-radius: 0.75rem;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .share-modal {
    max-width: 700px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #111827;
    border-bottom: 1px solid #374151;
  }

  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .modal-close {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
  }

  .modal-close:hover {
    background-color: #374151;
    color: #e5e7eb;
  }

  .modal-body {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
  }

  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .filters > * {
    flex: 1;
  }

  .select-field {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    background-color: #1f2937;
    color: #e5e7eb;
    font-size: 1rem;
    cursor: pointer;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
  }

  /* Share Modal Specific */
  .share-instructions {
    color: #9ca3af;
    margin-bottom: 1rem;
  }

  .share-url-container {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .share-url-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    background-color: #111827;
    color: #9ca3af;
    font-size: 0.875rem;
    font-family: monospace;
  }

  .trade-summary {
    background-color: #111827;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .trade-summary h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .summary-section {
    margin-bottom: 1rem;
  }

  .summary-section:last-child {
    margin-bottom: 0;
  }

  .summary-section h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #9ca3af;
  }

  .summary-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .summary-section li {
    padding: 0.25rem 0;
    color: #e5e7eb;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    .trade-panels {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
    }

    .filters {
      flex-direction: column;
    }

    .share-url-container {
      flex-direction: column;
    }
  }
</style>
