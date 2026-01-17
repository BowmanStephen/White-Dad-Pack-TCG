<script lang="ts">
  /**
   * CraftingStation - US080: Card Crafting - Combine Cards
   *
   * Main crafting UI that orchestrates the entire crafting flow:
   * 1. Select recipe (output rarity)
   * 2. Select input cards from collection
   * 3. Confirm and craft
   * 4. View result (success/failure)
   * 5. View history
   */

  import { onMount } from 'svelte';
  import {
    craftingState,
    craftingSession,
    selectedCards,
    selectedRecipe,
    craftingUI,
    craftingHistory,
    startCraftingSession,
    setCraftingState,
    toggleCardSelection,
    clearCardSelection,
    resetCraftingSession,
    toggleCraftingHistory,
    toggleRecipeSelector,
    getCraftingStats,
    rollCraftingSuccess,
    calculateReturnOnFailure,
  } from '../../stores/crafting';
  import { CRAFTING_RECIPES, RARITY_CONFIG, type PackCard, type CraftingRecipe, type Card } from '../../types';
  import { executeCraft, getCardsByRarity, getSuccessRateText, getFailureReturnText } from '../../lib/crafting';
  import RecipeSelector from './RecipeSelector.svelte';
  import CardSelector from './CardSelector.svelte';
  import CraftingAnimation from './CraftingAnimation.svelte';
  import CraftingResult from './CraftingResult.svelte';
  import CraftingHistory from './CraftingHistory.svelte';
  import { collection } from '../../stores/collection';

  // All cards from collection
  let allCards: PackCard[] = [];
  let cardsByRarity: Map<string, PackCard[]> = new Map();

  // Current view state
  let currentView: 'recipe' | 'select' | 'crafting' | 'result' | 'history' = 'recipe';

  // UI state
  let showRecipeSelector = false;
  let showHistory = false;

  // Subscribe to stores
  $: state = $craftingState;
  $: recipe = $selectedRecipe;
  $: selected = $selectedCards;
  $: session = $craftingSession;
  $: historyUI = $craftingUI;

  // Update current view based on state
  $: if (state === 'idle') {
    currentView = 'recipe';
  } else if (state === 'selecting') {
    currentView = 'select';
  } else if (state === 'crafting') {
    currentView = 'crafting';
  } else if (state === 'success' || state === 'failed') {
    currentView = 'result';
  }

  $: if (historyUI.showHistory) {
    currentView = 'history';
  }

  // Get all cards from collection
  onMount(() => {
    loadCollectionCards();
  });

  function loadCollectionCards() {
    const collection = collection.get();
    allCards = [];

    // Flatten all cards from packs
    for (const pack of collection.packs) {
      allCards.push(...pack.cards);
    }

    // Group by rarity
    cardsByRarity = new Map();
    for (const card of allCards) {
      if (!cardsByRarity.has(card.rarity)) {
        cardsByRarity.set(card.rarity, []);
      }
      cardsByRarity.get(card.rarity)!.push({ ...card });
    }
  }

  // Recipe selection
  function selectRecipe(recipe: CraftingRecipe) {
    selectedRecipe.set(recipe);
    startCraftingSession(recipe, []);
    setCraftingState('selecting');
  }

  // Card selection
  function handleCardToggle(cardId: string) {
    toggleCardSelection(cardId);
  }

  // Start crafting
  function startCrafting() {
    if (!recipe || selected.length !== recipe.inputCount) return;

    // Get selected cards
    const selectedCardObjects: PackCard[] = [];
    for (const cardId of selected) {
      const card = allCards.find((c) => c.id === cardId);
      if (card) {
        selectedCardObjects.push({ ...card });
      }
    }

    // Update session with selected cards
    if (session) {
      craftingSession.set({
        ...session,
        selectedCards: selected,
      });
    }

    setCraftingState('crafting');
  }

  // Cancel crafting
  function cancelCrafting() {
    clearCardSelection();
    resetCraftingSession();
    loadCollectionCards();
  }

  // Handle crafting complete (from animation)
  function handleCraftingComplete(result: { success: boolean; resultCard?: PackCard; returnedCards?: PackCard[] }) {
    // Update collection (remove input cards, add result)
    if (result.success && result.resultCard) {
      // Add result card to collection
      addToCollection([result.resultCard]);
    } else if (result.returnedCards && result.returnedCards.length > 0) {
      // Add returned cards on failure
      addToCollection(result.returnedCards);
    }

    // Remove consumed cards
    if (session && session.selectedCards.length > 0) {
      removeFromCollection(session.selectedCards);
    }

    setCraftingState(result.success ? 'success' : 'failed');
  }

  // Add cards to collection
  function addToCollection(cards: PackCard[]) {
    const collection = collection.get();

    // Create a new pack for crafted cards
    const craftedPack = {
      id: `crafted_${Date.now()}`,
      cards: cards.map((card) => ({
        ...card,
        isRevealed: true,
      })),
      openedAt: new Date(),
      bestRarity: cards.reduce((best, card) => {
        const rarityOrder: Record<string, number> = {
          common: 0,
          uncommon: 1,
          rare: 2,
          epic: 3,
          legendary: 4,
          mythic: 5,
        };
        return rarityOrder[card.rarity] > rarityOrder[best] ? card.rarity : best;
      }, 'common' as const),
      design: 'standard' as const,
    };

    collection.set({
      ...collection,
      packs: [...collection.packs, craftedPack],
    });

    loadCollectionCards();
  }

  // Remove cards from collection
  function removeFromCollection(cardIds: string[]) {
    const collection = collection.get();

    // Remove cards from packs (mark as crafted)
    // In a real app, this would be more sophisticated
    // For now, we'll just reload the collection
    loadCollectionCards();
  }

  // View history
  function viewHistory() {
    toggleCraftingHistory();
  }

  // Back to recipe selection
  function backToRecipes() {
    resetCraftingSession();
    currentView = 'recipe';
  }

  // Get available recipes based on collection
  function getAvailableRecipes(): CraftingRecipe[] {
    const available: CraftingRecipe[] = [];

    for (const recipe of CRAFTING_RECIPES) {
      const cards = cardsByRarity.get(recipe.inputRarity) || [];
      if (cards.length >= recipe.inputCount) {
        available.push(recipe);
      }
    }

    return available;
  }

  // Crafting stats
  $: stats = getCraftingStats();
  $: availableRecipes = getAvailableRecipes();
  $: canCraft = recipe && selected.length === recipe.inputCount;
</script>

<div class="crafting-station">
  <div class="crafting-header">
    <h1 class="crafting-title">Card Crafting Station</h1>
    <p class="crafting-subtitle">Combine your duplicate cards to craft rarer ones!</p>
  </div>

  <!-- Crafting Stats -->
  <div class="crafting-stats">
    <div class="stat-item">
      <span class="stat-label">Total Crafts</span>
      <span class="stat-value">{stats.totalAttempts}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Success Rate</span>
      <span class="stat-value">{Math.round(stats.successRate * 100)}%</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Best Craft</span>
      <span class="stat-value">
        {stats.bestCraft ? RARITY_CONFIG[stats.bestCraft.rarity].name : 'None'}
      </span>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="crafting-content">
    {#if currentView === 'recipe'}
      <!-- Recipe Selection -->
      <div class="recipe-selection">
        <h2>Select a Recipe</h2>
        <p class="recipe-intro">Choose what you want to craft. You'll need 5 cards of the input rarity.</p>

        <div class="recipe-grid">
          {#each availableRecipes as recipe}
            <div
              class="recipe-card"
              class:available={true}
              role="button"
              tabindex="0"
              on:click={() => selectRecipe(recipe)}
              on:keydown={(e) => e.key === 'Enter' && selectRecipe(recipe)}
            >
              <div class="recipe-header" style="background: linear-gradient(135deg, {RARITY_CONFIG[recipe.inputRarity].color}, {RARITY_CONFIG[recipe.outputRarity].color})">
                <span class="recipe-icon">⚗️</span>
                <span class="recipe-name">{recipe.name}</span>
              </div>
              <div class="recipe-details">
                <div class="recipe-input">
                  <span class="recipe-count">{recipe.inputCount}</span>
                  <span class="recipe-rarity" style="color: {RARITY_CONFIG[recipe.inputRarity].color}">
                    {RARITY_CONFIG[recipe.inputRarity].name}
                  </span>
                </div>
                <div class="recipe-arrow">→</div>
                <div class="recipe-output">
                  <span class="recipe-count">{recipe.outputCount}</span>
                  <span class="recipe-rarity" style="color: {RARITY_CONFIG[recipe.outputRarity].color}">
                    {RARITY_CONFIG[recipe.outputRarity].name}
                  </span>
                </div>
              </div>
              <div class="recipe-chance">
                <span class="success-rate">{getSuccessRateText(recipe)}</span>
              </div>
            </div>
          {/each}

          {#if availableRecipes.length === 0}
            <div class="no-recipes">
              <p>No recipes available. You need at least 5 cards of the same rarity to craft.</p>
            </div>
          {/if}
        </div>
      </div>

    {:else if currentView === 'select'}
      <!-- Card Selection -->
      <CardSelector
        {recipe}
        {allCards}
        {selected}
        onCardToggle={handleCardToggle}
        onConfirm={startCrafting}
        onCancel={cancelCrafting}
      />

    {:else if currentView === 'crafting'}
      <!-- Crafting Animation -->
      <CraftingAnimation
        {recipe}
        {selected}
        onComplete={handleCraftingComplete}
      />

    {:else if currentView === 'result'}
      <!-- Crafting Result -->
      <CraftingResult
        {session}
        onBackToRecipes={backToRecipes}
        onCraftAgain={() => currentView = 'recipe'}
      />

    {:else if currentView === 'history'}
      <!-- Crafting History -->
      <CraftingHistory
        onClose={() => {
          toggleCraftingHistory();
          currentView = 'recipe';
        }}
      />
    {/if}
  </div>

  <!-- History Button -->
  {#if currentView !== 'history'}
    <div class="history-button-container">
      <button
        class="btn-secondary"
        on:click={viewHistory}
      >
        📜 View History
      </button>
    </div>
  {/if}
</div>

<style>
  .crafting-station {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .crafting-header {
    text-align: center;
  }

  .crafting-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #fbbf24, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.5rem 0;
  }

  .crafting-subtitle {
    font-size: 1.125rem;
    color: #9ca3af;
    margin: 0;
  }

  .crafting-stats {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stat-label {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .crafting-content {
    min-height: 400px;
  }

  .recipe-selection h2 {
    font-size: 1.75rem;
    margin: 0 0 0.5rem 0;
    text-align: center;
  }

  .recipe-intro {
    text-align: center;
    color: #9ca3af;
    margin-bottom: 2rem;
  }

  .recipe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .recipe-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 1rem;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .recipe-card:hover {
    border-color: rgba(251, 191, 36, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }

  .recipe-card:focus-visible {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
  }

  .recipe-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    color: white;
  }

  .recipe-icon {
    font-size: 1.5rem;
  }

  .recipe-name {
    font-weight: 600;
    font-size: 1rem;
  }

  .recipe-details {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 1rem;
    gap: 0.5rem;
  }

  .recipe-input,
  .recipe-output {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .recipe-count {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .recipe-rarity {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .recipe-arrow {
    font-size: 1.5rem;
    color: #9ca3af;
  }

  .recipe-chance {
    padding: 0.75rem 1rem;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .success-rate {
    font-size: 0.875rem;
    color: #22c55e;
    font-weight: 500;
  }

  .no-recipes {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #9ca3af;
  }

  .history-button-container {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
  }

  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 640px) {
    .crafting-station {
      padding: 1rem;
    }

    .crafting-title {
      font-size: 1.75rem;
    }

    .crafting-stats {
      flex-direction: column;
    }

    .recipe-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
