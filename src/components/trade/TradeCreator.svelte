<script lang="ts">
  import { onMount } from 'svelte';
  import type { PackCard, TradeCard } from '../../types';
  import {
    tradeStore,
    getCollectionCards,
    startNewTrade,
    addOfferedCard,
    removeOfferedCard,
    addRequestedCard,
    removeRequestedCard,
    setSenderName,
    setTradeMessage,
    clearCurrentTrade,
    generateTradeURL,
    finalizeTrade,
  } from '../../stores/trade';
  import { RARITY_CONFIG, DAD_TYPE_ICONS } from '../../types';

  // State
  let isInitialized = $state(false);
  let collectionCards: PackCard[] = $state([]);
  let selectedOfferTab = $state(0); // 0 = offered, 1 = requested
  let senderName = $state('');
  let tradeMessage = $state('');
  let generatedURL = $state('');
  let showURLCopied = $state(false);
  let errorMessage = $state('');

  // Computed state from store
  let currentTrade = $state(tradeStore.get().currentTrade);

  // Subscribe to trade store changes
  $effect(() => {
    const unsubscribe = tradeStore.subscribe((state) => {
      currentTrade = state.currentTrade;
      if (state.currentTrade?.senderName) {
        senderName = state.currentTrade.senderName;
      }
      if (state.currentTrade?.message) {
        tradeMessage = state.currentTrade.message;
      }
    });
    return unsubscribe;
  });

  onMount(() => {
    // Load collection cards
    collectionCards = getCollectionCards() as PackCard[];

    // Start new trade if none exists
    if (!currentTrade) {
      startNewTrade();
    }

    isInitialized = true;
  });

  // Handle sender name change
  $effect(() => {
    if (senderName) {
      setSenderName(senderName);
    }
  });

  // Handle message change
  $effect(() => {
    if (tradeMessage) {
      setTradeMessage(tradeMessage);
    }
  });

  // Add card to offer or request based on selected tab
  function addCard(card: PackCard) {
    if (selectedOfferTab === 0) {
      if (currentTrade?.offeredCards && currentTrade.offeredCards.length >= 6) {
        errorMessage = 'Maximum 6 cards allowed per side';
        setTimeout(() => (errorMessage = ''), 3000);
        return;
      }
      addOfferedCard(card);
    } else {
      if (currentTrade?.requestedCards && currentTrade.requestedCards.length >= 6) {
        errorMessage = 'Maximum 6 cards allowed per side';
        setTimeout(() => (errorMessage = ''), 3000);
        return;
      }
      addRequestedCard(card);
    }
  }

  // Remove card from offer
  function removeOffered(cardId: string) {
    removeOfferedCard(cardId);
  }

  // Remove card from request
  function removeRequested(cardId: string) {
    removeRequestedCard(cardId);
  }

  // Cancel trade creation
  function cancelTrade() {
    clearCurrentTrade();
    startNewTrade();
    senderName = '';
    tradeMessage = '';
    generatedURL = '';
  }

  // Generate trade URL
  function handleGenerateURL() {
    errorMessage = '';

    if (!senderName.trim()) {
      errorMessage = 'Please enter your name';
      return;
    }

    if (!currentTrade?.offeredCards || currentTrade.offeredCards.length === 0) {
      errorMessage = 'Please add at least one card to offer';
      return;
    }

    if (!currentTrade?.requestedCards || currentTrade.requestedCards.length === 0) {
      errorMessage = 'Please add at least one card to request';
      return;
    }

    // Finalize trade
    const result = finalizeTrade();

    if (!result.success) {
      errorMessage = result.error || 'Failed to create trade';
      return;
    }

    // Generate URL
    generatedURL = generateTradeURL();
  }

  // Copy URL to clipboard
  async function copyURL() {
    if (!generatedURL) return;

    try {
      await navigator.clipboard.writeText(generatedURL);
      showURLCopied = true;
      setTimeout(() => (showURLCopied = false), 2000);
    } catch {
      errorMessage = 'Failed to copy URL to clipboard';
    }
  }

  // Check if card is already in offer
  function isInOffer(cardId: string): boolean {
    return currentTrade?.offeredCards?.some((c) => c.id === cardId) || false;
  }

  // Check if card is already in request
  function isInRequest(cardId: string): boolean {
    return currentTrade?.requestedCards?.some((c) => c.id === cardId) || false;
  }

  // Get rarity color
  function getRarityColor(rarity: string): string {
    return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || '#9ca3af';
  }

  // Get dad type icon
  function getDadTypeIcon(type: string): string {
    return DAD_TYPE_ICONS[type as keyof typeof DAD_TYPE_ICONS] || '🎴';
  }
</script>

<div class="trade-creator">
  <div class="trade-creator-header">
    <h2 class="trade-creator-title">Create Trade Offer</h2>
    <p class="trade-creator-subtitle">
      Select cards to trade and share with a friend
    </p>
  </div>

  <!-- Error Message -->
  {#if errorMessage}
    <div class="error-message">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{errorMessage}</span>
    </div>
  {/if}

  <!-- Success Message with URL -->
  {#if generatedURL}
    <div class="success-message">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Trade offer created! Share this URL:</span>
    </div>

    <div class="url-container">
      <input
        type="text"
        readonly
        value={generatedURL}
        class="url-input"
      />
      <button
        class="copy-button"
        on:click={copyURL}
        class:copied={showURLCopied}
      >
        {#if showURLCopied}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        {/if}
      </button>
    </div>

    <button class="new-trade-button" on:click={cancelTrade}>
      Create Another Trade
    </button>
  {:else}
    <!-- Trade Creation Form -->
    <div class="trade-form">
      <!-- Sender Info -->
      <div class="form-section">
        <label for="sender-name" class="form-label">Your Name</label>
        <input
          id="sender-name"
          type="text"
          bind:value={senderName}
          placeholder="Enter your name"
          class="form-input"
          maxlength={50}
        />
        <p class="form-hint">This will be shown to the person receiving your trade offer</p>
      </div>

      <!-- Message (Optional) -->
      <div class="form-section">
        <label for="trade-message" class="form-label">Message (Optional)</label>
        <textarea
          id="trade-message"
          bind:value={tradeMessage}
          placeholder="Add a message for your trading partner..."
          class="form-textarea"
          maxlength={200}
        ></textarea>
        <p class="form-hint">{tradeMessage.length}/200 characters</p>
      </div>

      <!-- Card Selection Tabs -->
      <div class="trade-tabs">
        <button
          class="trade-tab"
          class:active={selectedOfferTab === 0}
          on:click={() => (selectedOfferTab = 0)}
        >
          <span class="tab-label">
            You're Offering
            {currentTrade?.offeredCards ? ` (${currentTrade.offeredCards.length}/6)` : '(0/6)'}
          </span>
        </button>
        <button
          class="trade-tab"
          class:active={selectedOfferTab === 1}
          on:click={() => (selectedOfferTab = 1)}
        >
          <span class="tab-label">
            You're Requesting
            {currentTrade?.requestedCards ? ` (${currentTrade.requestedCards.length}/6)` : '(0/6)'}
          </span>
        </button>
      </div>

      <!-- Selected Cards Display -->
      <div class="selected-cards">
        <h3 class="selected-cards-title">
          {selectedOfferTab === 0 ? "Cards You're Offering" : "Cards You're Requesting"}
        </h3>

        {#if selectedOfferTab === 0 && currentTrade?.offeredCards && currentTrade.offeredCards.length > 0}
          <div class="selected-cards-grid">
            {#each currentTrade.offeredCards as card}
              <div class="selected-card">
                <div class="selected-card-info">
                  <span class="card-name">{card.name}</span>
                  <span class="card-rarity" style:color={getRarityColor(card.rarity)}>
                    {card.rarity}
                  </span>
                </div>
                <button
                  class="remove-card-button"
                  on:click={() => removeOffered(card.id)}
                  aria-label="Remove card"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        {:else if selectedOfferTab === 1 && currentTrade?.requestedCards && currentTrade.requestedCards.length > 0}
          <div class="selected-cards-grid">
            {#each currentTrade.requestedCards as card}
              <div class="selected-card">
                <div class="selected-card-info">
                  <span class="card-name">{card.name}</span>
                  <span class="card-rarity" style:color={getRarityColor(card.rarity)}>
                    {card.rarity}
                  </span>
                </div>
                <button
                  class="remove-card-button"
                  on:click={() => removeRequested(card.id)}
                  aria-label="Remove card"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <p class="no-cards-message">
            {selectedOfferTab === 0
              ? "No cards selected yet. Click cards from your collection below to add them to your offer."
              : "No cards selected yet. Click cards from your collection below to add them to your request."}
          </p>
        {/if}
      </div>

      <!-- Collection Cards for Selection -->
      <div class="collection-selection">
        <h3 class="collection-title">Your Collection</h3>
        <p class="collection-subtitle">
          Click a card to add it to {selectedOfferTab === 0 ? "your offer" : "your request"}
        </p>

        {#if collectionCards.length === 0}
          <p class="empty-message">No cards in your collection. Open some packs first!</p>
        {:else}
          <div class="collection-grid">
            {#each collectionCards.slice(0, 50) as card (card.packId + card.id)}
              <div
                class="collection-card"
                class:disabled={selectedOfferTab === 0 ? isInOffer(card.id) : isInRequest(card.id)}
                on:click={() => addCard(card)}
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === 'Enter' && addCard(card)}
                style:--rarity-color={getRarityColor(card.rarity)}
              >
                <div class="card-mini">
                  <div class="card-mini-icon">{getDadTypeIcon(card.type)}</div>
                  <div class="card-mini-name">{card.name}</div>
                  <div class="card-mini-rarity" style:color={getRarityColor(card.rarity)}>
                    {card.rarity}
                    {#if card.isHolo}
                      <span class="holo-indicator">✨</span>
                    {/if}
                  </div>
                </div>
                {#if selectedOfferTab === 0 ? isInOffer(card.id) : isInRequest(card.id)}
                  <div class="card-indicator">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          {#if collectionCards.length > 50}
            <p class="more-cards-hint">Showing first 50 cards</p>
          {/if}
        {/if}
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="cancel-button" on:click={cancelTrade}>
          Cancel
        </button>
        <button
          class="create-button"
          on:click={handleGenerateURL}
          disabled={!senderName || !currentTrade?.offeredCards?.length || !currentTrade?.requestedCards?.length}
        >
          Create Trade Offer
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .trade-creator {
    max-width: 64rem;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .trade-creator-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .trade-creator-title {
    font-size: 2rem;
    font-weight: 800;
    color: #f8fafc;
    margin-bottom: 0.5rem;
  }

  .trade-creator-subtitle {
    font-size: 1rem;
    color: #94a3b8;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    color: #fca5a5;
    margin-bottom: 1.5rem;
  }

  .success-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 0.5rem;
    color: #86efac;
    margin-bottom: 1.5rem;
  }

  .url-container {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .url-input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-family: monospace;
    font-size: 0.875rem;
  }

  .copy-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    border: none;
    border-radius: 0.5rem;
    color: #0f172a;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .copy-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .copy-button.copied {
    background: linear-gradient(135deg, #22c55e, #16a34a);
  }

  .new-trade-button {
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .new-trade-button:hover {
    background: rgba(71, 85, 105, 0.1);
    color: #f8fafc;
  }

  .trade-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
  }

  .form-input,
  .form-textarea {
    padding: 0.75rem 1rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    color: #f8fafc;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }

  .form-textarea {
    min-height: 80px;
    resize: vertical;
  }

  .form-hint {
    font-size: 0.75rem;
    color: #64748b;
  }

  .trade-tabs {
    display: flex;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.5);
    padding: 0.25rem;
    border-radius: 0.5rem;
  }

  .trade-tab {
    flex: 1;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    color: #94a3b8;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .trade-tab.active {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }

  .trade-tab:hover:not(.active) {
    color: #f8fafc;
  }

  .selected-cards {
    padding: 1.5rem;
    background: rgba(30, 41, 59, 0.3);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
  }

  .selected-cards-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 1rem;
  }

  .selected-cards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .selected-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.375rem;
  }

  .selected-card-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .card-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #f8fafc;
  }

  .card-rarity {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .remove-card-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    color: #ef4444;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .remove-card-button:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .no-cards-message {
    color: #64748b;
    font-size: 0.875rem;
    text-align: center;
    padding: 1rem;
  }

  .collection-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .collection-title {
    font-size: 1rem;
    font-weight: 600;
    color: #f8fafc;
  }

  .collection-subtitle {
    font-size: 0.875rem;
    color: #64748b;
  }

  .empty-message {
    color: #64748b;
    text-align: center;
    padding: 2rem;
  }

  .collection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .collection-card {
    position: relative;
    cursor: pointer;
    border-radius: 0.5rem;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .collection-card:hover:not(.disabled) {
    transform: translateY(-4px);
  }

  .collection-card.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .card-mini {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid var(--rarity-color, #475569);
    border-radius: 0.5rem;
    text-align: center;
  }

  .card-mini-icon {
    font-size: 1.5rem;
  }

  .card-mini-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #f8fafc;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-mini-rarity {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
  }

  .holo-indicator {
    font-size: 0.75rem;
  }

  .card-indicator {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background: rgba(34, 197, 94, 0.9);
    border-radius: 50%;
    color: white;
  }

  .more-cards-hint {
    font-size: 0.75rem;
    color: #64748b;
    text-align: center;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .cancel-button,
  .create-button {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button {
    background: transparent;
    border: 1px solid rgba(71, 85, 105, 0.3);
    color: #94a3b8;
  }

  .cancel-button:hover {
    background: rgba(71, 85, 105, 0.1);
    color: #f8fafc;
  }

  .create-button {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #0f172a;
  }

  .create-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .create-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
