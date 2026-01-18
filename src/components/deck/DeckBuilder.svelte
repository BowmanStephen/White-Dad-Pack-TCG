<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Card, Deck, DeckCard } from '@/types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS } from '@/types';
  import {
    currentDeck,
    decks,
    createNewDeck,
    loadDeck,
    saveCurrentDeck,
    deleteDeck,
    duplicateDeck,
    addCard,
    removeCard,
    setCardCount,
    updateDeckInfo,
    clearCurrentDeck,
    deckValidation,
    isDeckLimitReached
  } from '@/stores/deck';
  import { collection } from '@/stores/collection';
  import { t } from '@/i18n';
  import DeckStats from './DeckStats.svelte';
  import GenerativeCardArt from '../art/GenerativeCardArt.svelte';

  // View state
  let view: 'list' | 'edit' | 'create' = 'list';
  let draggedCard: Card | null = null;
  let draggedOverSlot: string | null = null;
  let selectedCards: Set<string> = new Set();
  let showAddModal = false;
  let deckName = '';
  let deckDescription = '';
  let searchQuery = '';
  let filterRarity: string | null = null;
  let errorMessage = '';

  // Reactive state
  let currentDeckData = null;
  let allDecks = [];
  let validation = { isValid: true, errors: [], warnings: [] };
  let limitReached = false;
  let userCollection = { cards: [] };

  let unsubscribes = [];

  onMount(() => {
    // Subscribe to stores only in browser
    const unsubCurrentDeck = currentDeck.subscribe((value) => currentDeckData = value);
    const unsubDecks = decks.subscribe((value) => allDecks = value);
    const unsubValidation = deckValidation.subscribe((value) => validation = value);
    const unsubLimit = isDeckLimitReached.subscribe((value) => limitReached = value);
    const unsubCollection = collection.subscribe((value) => userCollection = value);

    unsubscribes = [
      unsubCurrentDeck,
      unsubDecks,
      unsubValidation,
      unsubLimit,
      unsubCollection
    ];

    // Auto-create first deck if none exist
    if (allDecks.length === 0) {
      handleCreateDeck();
    }
  });

  onDestroy(() => {
    // Clean up subscriptions
    unsubscribes.forEach(unsub => unsub?.());
  });

  // Filter collection cards for adding to deck
  $: if (typeof window !== 'undefined') {
    availableCards = userCollection && userCollection.cards
      ? userCollection.cards.filter(card => {
          const matchesSearch = !searchQuery ||
            card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (card.flavorText && card.flavorText.toLowerCase().includes(searchQuery.toLowerCase()));

          const matchesRarity = !filterRarity || card.rarity === filterRarity;

          return matchesSearch && matchesRarity;
        })
      : [];
  }

  let availableCards = [];

  function handleCreateDeck() {
    try {
      if (limitReached) {
        errorMessage = $t('deck.errors.maxDecksReached');
        return;
      }

      createNewDeck($t('deck.newDeckTitle'));
      deckName = $currentDeck?.name || '';
      deckDescription = $currentDeck?.description || '';
      view = 'create';
      errorMessage = '';
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : $t('deck.errors.createFailed');
    }
  }

  function handleSelectDeck(deckId: string) {
    loadDeck(deckId);
    deckName = $currentDeck?.name || '';
    deckDescription = $currentDeck?.description || '';
    view = 'edit';
    errorMessage = '';
  }

  function handleSaveDeck() {
    try {
      updateDeckInfo(deckName, deckDescription);
      saveCurrentDeck();
      view = 'list';
      errorMessage = '';
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : $t('deck.errors.saveFailed');
    }
  }

  function handleDeleteDeck(deckId: string, event: Event) {
    event.stopPropagation();
    if (confirm($t('deck.confirmDelete'))) {
      deleteDeck(deckId);
      if ($currentDeck?.id === deckId) {
        clearCurrentDeck();
        view = 'list';
      }
    }
  }

  function handleDuplicateDeck(deckId: string, event: Event) {
    event.stopPropagation();
    try {
      duplicateDeck(deckId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : $t('deck.errors.duplicateFailed');
    }
  }

  function handleAddCard(card: Card) {
    try {
      addCard(card);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : $t('deck.errors.addCardFailed');
      // Clear error after 3 seconds
      setTimeout(() => errorMessage = '', 3000);
    }
  }

  function handleRemoveCard(cardId: string) {
    removeCard(cardId);
  }

  function handleCardCountChange(cardId: string, newCount: number) {
    setCardCount(cardId, newCount);
  }

  function handleDragStart(card: Card, event: DragEvent) {
    draggedCard = card;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    if (draggedCard) {
      handleAddCard(draggedCard);
      draggedCard = null;
    }
  }

  function handleDragEnd() {
    draggedCard = null;
  }

  function cancelEdit() {
    clearCurrentDeck();
    view = 'list';
    deckName = '';
    deckDescription = '';
    errorMessage = '';
  }

  function getCardCount(cardId: string): number {
    const card = currentDeckData?.cards.find(dc => dc.cardId === cardId);
    return card?.count || 0;
  }
</script>

<div class="deck-builder">
  {#if errorMessage}
    <div class="error-banner">
      <span class="error-icon">⚠️</span>
      <span>{errorMessage}</span>
      <button on:click={() => errorMessage = ''} class="error-close">×</button>
    </div>
  {/if}

  <!-- Deck List View -->
  {#if view === 'list'}
    <div class="deck-list">
      <div class="deck-list-header">
        <h1 class="deck-list-title">{$t('deck.title')}</h1>
        <button
          on:click={handleCreateDeck}
          disabled={limitReached}
          class="btn-primary"
          class:disabled={limitReached}
        >
          {limitReached ? $t('deck.maxDecksReached') : $t('deck.createNew')}
        </button>
      </div>

      {#if allDecks.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🃏</div>
          <h2>{$t('deck.noDecks')}</h2>
          <p>{$t('deck.noDecksDescription')}</p>
          <button on:click={handleCreateDeck} class="btn-primary">
            {$t('deck.createFirst')}
          </button>
        </div>
      {:else}
        <div class="decks-grid">
          {#each allDecks as deck (deck.id)}
            <div
              class="deck-card"
              on:click={() => handleSelectDeck(deck.id)}
              role="button"
              tabindex="0"
              on:keypress={(e) => e.key === 'Enter' && handleSelectDeck(deck.id)}
            >
              <div class="deck-card-header">
                <h3 class="deck-name">{deck.name}</h3>
                <div class="deck-actions">
                  <button
                    on:click={(e) => handleDuplicateDeck(deck.id, e)}
                    class="btn-icon"
                    title={$t('deck.duplicate')}
                  >
                    📋
                  </button>
                  <button
                    on:click={(e) => handleDeleteDeck(deck.id, e)}
                    class="btn-icon btn-danger"
                    title={$t('deck.delete')}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div class="deck-card-body">
                <div class="deck-stats-compact">
                  <div class="mini-stat">
                    <span class="mini-stat-label">{$t('deck.stats.totalCards')}</span>
                    <span class="mini-stat-value">{deck.stats.totalCards}</span>
                  </div>
                  <div class="mini-stat">
                    <span class="mini-stat-label">{$t('deck.stats.uniqueCards')}</span>
                    <span class="mini-stat-value">{deck.stats.uniqueCards}</span>
                  </div>
                </div>

                {#if deck.description}
                  <p class="deck-description">{deck.description}</p>
                {/if}

                <div class="deck-rarity-preview">
                  {#each Object.entries(deck.stats.rarityBreakdown) as [rarity, count]}
                    {#if count > 0}
                      <div
                        class="rarity-dot"
                        style="background-color: {RARITY_CONFIG[rarity].color}"
                        title="{RARITY_CONFIG[rarity].label}: {count}"
                      ></div>
                    {/if}
                  {/each}
                </div>
              </div>

              <div class="deck-card-footer">
                <span class="deck-date">
                  {$t('deck.lastUpdated')}: {new Date(deck.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  <!-- Deck Edit/Create View -->
  {:else}
    <div class="deck-editor">
      <div class="editor-header">
        <button on:click={cancelEdit} class="btn-secondary">
          ← {$t('deck.back')}
        </button>
        <h1 class="editor-title">
          {view === 'create' ? $t('deck.createNew') : $t('deck.editDeck')}
        </h1>
        <button
          on:click={handleSaveDeck}
          disabled={!validation.isValid}
          class="btn-primary"
          class:disabled={!validation.isValid}
        >
          {$t('deck.save')}
        </button>
      </div>

      <div class="editor-content">
        <!-- Left Panel: Deck Info & Cards -->
        <div class="editor-main">
          <!-- Deck Metadata -->
          <div class="editor-section">
            <h2 class="section-title">{$t('deck.deckInfo')}</h2>
            <div class="form-group">
              <label for="deck-name">{$t('deck.name')}</label>
              <input
                id="deck-name"
                type="text"
                bind:value={deckName}
                placeholder={$t('deck.namePlaceholder')}
                class="input-field"
                maxlength="50"
              />
            </div>
            <div class="form-group">
              <label for="deck-description">{$t('deck.description')}</label>
              <textarea
                id="deck-description"
                bind:value={deckDescription}
                placeholder={$t('deck.descriptionPlaceholder')}
                class="textarea-field"
                rows="3"
                maxlength="200"
              ></textarea>
            </div>

            {#if validation.errors.length > 0 || validation.warnings.length > 0}
              <div class="validation-messages">
                {#each validation.errors as error}
                  <div class="validation-error">
                    <span class="validation-icon">❌</span>
                    {error}
                  </div>
                {/each}
                {#each validation.warnings as warning}
                  <div class="validation-warning">
                    <span class="validation-icon">⚠️</span>
                    {warning}
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Deck Cards -->
          <div class="editor-section">
            <div class="section-header">
              <h2 class="section-title">{$t('deck.cardsInDeck')}</h2>
              <button on:click={() => showAddModal = true} class="btn-secondary">
                + {$t('deck.addCards')}
              </button>
            </div>

            {#if !currentDeckData || currentDeckData.cards.length === 0}
              <div class="empty-deck">
                <div class="empty-icon">📭</div>
                <p>{$t('deck.emptyDeck')}</p>
                <button on:click={() => showAddModal = true} class="btn-primary">
                  {$t('deck.addCards')}
                </button>
              </div>
            {:else}
              <div class="deck-cards-list">
                {#each currentDeckData.cards as deckCard (deckCard.cardId)}
                  {@const card = deckCard.card}
                  <div
                    class="deck-card-item"
                    draggable="true"
                    on:dragstart={(e) => handleDragStart(card, e)}
                    on:dragend={handleDragEnd}
                  >
                    <div class="card-preview">
                      <GenerativeCardArt {card} size="sm" />
                    </div>

                    <div class="card-info">
                      <div class="card-name">
                        <span class="type-icon">{DAD_TYPE_ICONS[card.type]}</span>
                        {card.name}
                      </div>
                      <div class="card-meta">
                        <span
                          class="rarity-badge"
                          style="background-color: {RARITY_CONFIG[card.rarity].color}"
                        >
                          {RARITY_CONFIG[card.rarity].label}
                        </span>
                        <span class="card-stats">
                          {$t('deck.stats.totalCards')}: {card.stats.dadJoke + card.stats.grillSkill}
                        </span>
                      </div>
                    </div>

                    <div class="card-controls">
                      <button
                        on:click={() => handleCardCountChange(deckCard.cardId, deckCard.count - 1)}
                        disabled={deckCard.count <= 1}
                        class="btn-counter"
                      >
                        −
                      </button>
                      <span class="card-count">{deckCard.count}</span>
                      <button
                        on:click={() => handleCardCountChange(deckCard.cardId, deckCard.count + 1)}
                        disabled={deckCard.count >= 4}
                        class="btn-counter"
                      >
                        +
                      </button>
                      <button
                        on:click={() => handleRemoveCard(deckCard.cardId)}
                        class="btn-icon btn-danger"
                        title={$t('deck.remove')}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Right Panel: Stats & Add Cards -->
        <div class="editor-sidebar">
          <!-- Deck Statistics -->
          {#if currentDeckData && currentDeckData.stats}
            <div class="editor-section">
              <h2 class="section-title">{$t('deck.stats.title')}</h2>
              <DeckStats stats={currentDeckData.stats} compact={true} />
            </div>
          {/if}

          <!-- Drop Zone -->
          <div
            class="drop-zone"
            on:dragover={handleDragOver}
            on:drop={handleDrop}
            class:dragging={draggedCard !== null}
          >
            <div class="drop-zone-content">
              <div class="drop-zone-icon">📥</div>
              <p class="drop-zone-text">{$t('deck.dragCardsHere')}</p>
              <p class="drop-zone-hint">{$t('deck.dragCardsHint')}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Cards Modal -->
      {#if showAddModal}
        <div class="modal-overlay" on:click={() => showAddModal = false}>
          <div class="modal-content" on:click|stopPropagation>
            <div class="modal-header">
              <h2 class="modal-title">{$t('deck.addCards')}</h2>
              <button on:click={() => showAddModal = false} class="btn-icon">×</button>
            </div>

            <div class="modal-body">
              <!-- Search and Filter -->
              <div class="card-filters">
                <input
                  type="text"
                  bind:value={searchQuery}
                  placeholder={$t('deck.searchCards')}
                  class="input-field"
                />
                <select bind:value={filterRarity} class="select-field">
                  <option value="">{$t('deck.allRarities')}</option>
                  {#each Object.entries(RARITY_CONFIG) as [rarity, config]}
                    <option value={rarity}>{config.label}</option>
                  {/each}
                </select>
              </div>

              <!-- Available Cards -->
              <div class="available-cards-grid">
                {#each availableCards as card (card.id)}
                  <div
                    class="available-card"
                    draggable="true"
                    on:dragstart={(e) => handleDragStart(card, e)}
                    on:dragend={handleDragEnd}
                    on:click={() => handleAddCard(card)}
                  >
                    <GenerativeCardArt {card} size="sm" />
                    <div class="available-card-info">
                      <div class="available-card-name">{card.name}</div>
                      <div
                        class="available-card-rarity"
                        style="color: {RARITY_CONFIG[card.rarity].color}"
                      >
                        {RARITY_CONFIG[card.rarity].label}
                      </div>
                    </div>
                    <div class="available-card-count">
                      {getCardCount(card.id)}/4
                    </div>
                  </div>
                {/each}

                {#if availableCards.length === 0}
                  <div class="no-cards">
                    <p>{$t('deck.noCardsFound')}</p>
                  </div>
                {/if}
              </div>
            </div>

            <div class="modal-footer">
              <button on:click={() => showAddModal = false} class="btn-secondary">
                {$t('deck.close')}
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .deck-builder {
    min-height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  /* Error Banner */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    border-radius: 8px;
    color: white;
    font-weight: 500;
  }

  .error-icon {
    font-size: 1.25rem;
  }

  .error-close {
    margin-left: auto;
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .error-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Deck List */
  .deck-list {
    max-width: 1400px;
    margin: 0 auto;
  }

  .deck-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .deck-list-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #f8fafc;
    margin: 0;
  }

  .decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .deck-card {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .deck-card:hover {
    border-color: #3b82f6;
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .deck-card-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
  }

  .deck-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0;
  }

  .deck-actions {
    display: flex;
    gap: 0.5rem;
  }

  .deck-card-body {
    margin-bottom: 1rem;
  }

  .deck-stats-compact {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .mini-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .mini-stat-label {
    font-size: 0.625rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .mini-stat-value {
    font-size: 1rem;
    font-weight: 600;
    color: #f8fafc;
  }

  .deck-description {
    font-size: 0.875rem;
    color: #94a3b8;
    margin-bottom: 0.75rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .deck-rarity-preview {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .rarity-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .deck-card-footer {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .deck-date {
    font-size: 0.75rem;
    color: #64748b;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    color: #f8fafc;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }

  /* Deck Editor */
  .deck-editor {
    max-width: 1600px;
    margin: 0 auto;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
  }

  .editor-title {
    font-size: 2rem;
    font-weight: 700;
    color: #f8fafc;
    margin: 0;
  }

  .editor-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
  }

  .editor-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .editor-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .editor-section {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0 0 1rem 0;
  }

  /* Form Elements */
  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #cbd5e1;
    margin-bottom: 0.5rem;
  }

  .input-field,
  .textarea-field,
  .select-field {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #f8fafc;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .input-field:focus,
  .textarea-field:focus,
  .select-field:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.08);
  }

  .textarea-field {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  /* Validation Messages */
  .validation-messages {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .validation-error,
  .validation-warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .validation-error {
    background: rgba(220, 38, 38, 0.1);
    color: #fca5a5;
  }

  .validation-warning {
    background: rgba(234, 179, 8, 0.1);
    color: #fde047;
  }

  /* Deck Cards List */
  .empty-deck {
    text-align: center;
    padding: 3rem 1rem;
  }

  .empty-deck .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-deck p {
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .deck-cards-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .deck-card-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s;
    cursor: grab;
  }

  .deck-card-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .deck-card-item:active {
    cursor: grabbing;
  }

  .card-preview {
    flex-shrink: 0;
  }

  .card-info {
    flex: 1;
    min-width: 0;
  }

  .card-name {
    font-size: 1rem;
    font-weight: 600;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .type-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .rarity-badge {
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
    color: white;
    font-size: 0.625rem;
    text-transform: uppercase;
  }

  .card-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-counter {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #f8fafc;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-counter:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .btn-counter:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .card-count {
    min-width: 2rem;
    text-align: center;
    font-weight: 600;
    color: #f8fafc;
  }

  /* Drop Zone */
  .drop-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 2rem;
    background: rgba(59, 130, 246, 0.05);
    border: 2px dashed rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    transition: all 0.3s;
  }

  .drop-zone.dragging {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
  }

  .drop-zone-content {
    text-align: center;
  }

  .drop-zone-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .drop-zone-text {
    font-size: 1rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 0.25rem;
  }

  .drop-zone-hint {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 12px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  /* Card Filters */
  .card-filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .available-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .available-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    cursor: grab;
    transition: all 0.2s;
  }

  .available-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: #3b82f6;
  }

  .available-card:active {
    cursor: grabbing;
  }

  .available-card-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .available-card-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
  }

  .available-card-rarity {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .available-card-count {
    font-size: 0.75rem;
    color: #94a3b8;
    text-align: center;
  }

  .no-cards {
    grid-column: 1 / -1;
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
  }

  /* Buttons */
  .btn-primary,
  .btn-secondary,
  .btn-icon {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
  }

  .btn-primary:disabled,
  .btn-primary.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #f8fafc;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .btn-icon {
    width: 2rem;
    height: 2rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: #94a3b8;
    font-size: 1rem;
  }

  .btn-icon:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f8fafc;
  }

  .btn-icon.btn-danger:hover {
    background: rgba(220, 38, 38, 0.2);
    color: #fca5a5;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .editor-content {
      grid-template-columns: 1fr;
    }

    .editor-sidebar {
      order: -1;
    }
  }

  @media (max-width: 768px) {
    .deck-builder {
      padding: 1rem;
    }

    .deck-list-header,
    .editor-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .decks-grid {
      grid-template-columns: 1fr;
    }

    .card-filters {
      flex-direction: column;
    }

    .available-cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .deck-card-item {
      flex-wrap: wrap;
    }

    .card-controls {
      flex-wrap: wrap;
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
