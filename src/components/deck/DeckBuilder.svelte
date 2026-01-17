<script lang="ts">
  import { decks, currentDeck, selectedDeckId, createNewDeck, deleteDeck, duplicateDeck, updateDeck, setCurrentDeck, exportDeck } from '@/stores/deck';
  import { collection } from '@/stores/collection';
  import type { Card, Deck } from '@/types';
  import { getAllCards } from '@/lib/cards/database';
  import DeckSelector from './DeckSelector.svelte';
  import DeckCardList from './DeckCardList.svelte';
  import DeckStats from './DeckStats.svelte';

  // Get all cards once
  const ALL_CARDS = getAllCards();

  // UI State
  let showCreateModal = false;
  let showShareModal = false;
  let showCollection = false;
  let newDeckName = '';
  let newDeckDescription = '';
  let shareText = '';
  let copiedToClipboard = false;

  // Subscribe to stores
  $: allDecks = $decks;
  $: currentDeckData = $currentDeck;
  $: selectedId = $selectedDeckId;
  $: collectionData = $collection;

  // Get available cards from collection
  $: availableCards = getAllCardsFromCollection();

  function getAllCardsFromCollection(): Card[] {
    const uniqueCardIds = collectionData.metadata.uniqueCards;
    return ALL_CARDS.filter(card => uniqueCardIds.includes(card.id));
  }

  // Create new deck
  function handleCreateDeck() {
    if (!newDeckName.trim()) return;

    const result = createNewDeck(newDeckName.trim(), newDeckDescription.trim() || undefined);
    if (result.success) {
      showCreateModal = false;
      newDeckName = '';
      newDeckDescription = '';
    } else {
      alert(result.error || 'Failed to create deck');
    }
  }

  // Delete deck
  function handleDeleteDeck(deckId: string) {
    if (confirm('Are you sure you want to delete this deck? This cannot be undone.')) {
      deleteDeck(deckId);
    }
  }

  // Duplicate deck
  function handleDuplicateDeck(deckId: string) {
    const result = duplicateDeck(deckId);
    if (result.success) {
      // Select the new deck
      setCurrentDeck(result.deck?.id || null);
    } else {
      alert(result.error || 'Failed to duplicate deck');
    }
  }

  // Select deck
  function handleSelectDeck(deckId: string) {
    setCurrentDeck(deckId);
  }

  // Update deck cards
  function handleUpdateCard(cardId: string, count: number) {
    if (!currentDeckData) return;

    updateDeck(currentDeckData.id, {
      cards: currentDeckData.cards.map(dc =>
        dc.cardId === cardId ? { ...dc, count } : dc
      )
    });
  }

  // Remove card from deck
  function handleRemoveCard(cardId: string) {
    if (!currentDeckData) return;

    updateDeck(currentDeckData.id, {
      cards: currentDeckData.cards.filter(dc => dc.cardId !== cardId)
    });
  }

  // Add card to deck
  function handleAddCard(card: Card) {
    if (!currentDeckData) {
      alert('Please create or select a deck first');
      return;
    }

    // Check if card already in deck
    const existing = currentDeckData.cards.find(dc => dc.cardId === card.id);
    if (existing && existing.count >= 4) {
      alert('Maximum of 4 copies per card');
      return;
    }

    updateDeck(currentDeckData.id, {
      cards: existing
        ? currentDeckData.cards.map(dc =>
            dc.cardId === card.id ? { ...dc, count: Math.min(dc.count + 1, 4) } : dc
          )
        : [...currentDeckData.cards, { cardId: card.id, card, count: 1 }]
    });
  }

  // Update deck metadata
  function handleUpdateMetadata() {
    if (!currentDeckData) return;

    updateDeck(currentDeckData.id, {
      name: currentDeckData.name,
      description: currentDeckData.description
    });
  }

  // Export deck
  function handleExportDeck() {
    if (!currentDeckData) return;

    shareText = exportDeck(currentDeckData.id);
    showShareModal = true;
  }

  // Copy to clipboard
  async function handleCopyToClipboard() {
    if (!shareText) return;

    try {
      await navigator.clipboard.writeText(shareText);
      copiedToClipboard = true;
      setTimeout(() => {
        copiedToClipboard = false;
      }, 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  }
</script>

<div class="deck-builder">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Deck Builder</h1>
    <p class="text-gray-600 dark:text-gray-400 mt-1">
      Create and manage your decks. Organize cards strategically.
    </p>
  </div>

  <!-- Deck Selector -->
  <div class="mb-6">
    <DeckSelector
      decks={allDecks}
      selectedDeckId={selectedId}
      onCreateNew={() => (showCreateModal = true)}
      onSelectDeck={handleSelectDeck}
      onDeleteDeck={handleDeleteDeck}
      onDuplicateDeck={handleDuplicateDeck}
    />
  </div>

  {#if currentDeckData}
    <!-- Current Deck -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Deck Cards -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Deck Info -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <input
                type="text"
                bind:value={currentDeckData.name}
                on:change={handleUpdateMetadata}
                class="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors w-full"
                placeholder="Deck Name"
              />
              <textarea
                bind:value={currentDeckData.description}
                on:change={handleUpdateMetadata}
                class="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none transition-colors w-full resize-none"
                rows="1"
                placeholder="Add a description..."
              ></textarea>
            </div>
            <button
              on:click={handleExportDeck}
              class="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>

          <!-- Toggle Collection View -->
          <button
            on:click={() => (showCollection = !showCollection)}
            class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {showCollection ? 'Hide' : 'Show'} Collection
            <svg
              class="w-5 h-5 transition-transform {showCollection ? 'rotate-180' : ''}"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Collection View (for adding cards) -->
        {#if showCollection}
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Collection</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {#each availableCards as card}
                <button
                  on:click={() => handleAddCard(card)}
                  class="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-left"
                  title={card.name}
                >
                  <div class="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {card.name}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {card.rarity}
                  </div>
                </button>
              {/each}
              {#if availableCards.length === 0}
                <div class="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  No cards in collection. Open some packs first!
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Deck Cards List -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cards in Deck</h3>
          <DeckCardList
            deck={currentDeckData}
            onUpdate={handleUpdateCard}
            onRemove={handleRemoveCard}
          />
        </div>
      </div>

      <!-- Deck Stats -->
      <div class="lg:col-span-1">
        <div class="sticky top-4">
          <DeckStats stats={currentDeckData.stats} />
        </div>
      </div>
    </div>
  {:else}
    <!-- No Deck Selected -->
    <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No deck selected</h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        Select an existing deck or create a new one to get started.
      </p>
    </div>
  {/if}
</div>

<!-- Create Deck Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" on:click={() => (showCreateModal = false)}>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6" on:click|stopPropagation>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Create New Deck</h2>

      <div class="space-y-4">
        <div>
          <label for="deck-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Deck Name *
          </label>
          <input
            id="deck-name"
            type="text"
            bind:value={newDeckName}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="My Awesome Deck"
            maxlength="50"
          />
        </div>

        <div>
          <label for="deck-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            id="deck-description"
            bind:value={newDeckDescription}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            rows="3"
            placeholder="What's this deck about?"
            maxlength="200"
          ></textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          on:click={() => (showCreateModal = false)}
          class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          on:click={handleCreateDeck}
          disabled={!newDeckName.trim()}
          class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          Create Deck
        </button>
      </div>

      {#if allDecks.length >= 10}
        <p class="mt-4 text-sm text-amber-600 dark:text-amber-400 text-center">
          ⚠️ Maximum of 10 decks reached. Delete an existing deck to create a new one.
        </p>
      {/if}
    </div>
  </div>
{/if}

<!-- Share Modal -->
{#if showShareModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" on:click={() => (showShareModal = false)}>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6" on:click|stopPropagation>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Share Deck</h2>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Copy this deck list to share with others:
      </p>

      <div class="relative">
        <textarea
          readonly
          bind:value={shareText}
          class="w-full h-64 px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
        ></textarea>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          on:click={handleCopyToClipboard}
          class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {copiedToClipboard ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          on:click={() => (showShareModal = false)}
          class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
