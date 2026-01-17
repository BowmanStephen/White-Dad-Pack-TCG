<script lang="ts">
  /**
   * CardSelector - US080: Card Crafting - Combine Cards
   *
   * Grid-based card selection interface for crafting.
   * Users select exactly N cards of the required rarity.
   */

  import { RARITY_CONFIG, type PackCard, type CraftingRecipe } from '../../types';
  import { getCardsByRarity } from '../../lib/crafting';

  export let recipe: CraftingRecipe;
  export let allCards: PackCard[];
  export let selected: string[];
  export let onCardToggle: (cardId: string) => void;
  export let onConfirm: () => void;
  export let onCancel: () => void;

  // Filter cards by required rarity
  $: availableCards = getCardsByRarity(allCards, recipe.inputRarity);
  $: selectedCount = selected.length;
  $: requiredCount = recipe.inputCount;
  $: canConfirm = selectedCount === requiredCount;

  // Selection progress
  $: progress = (selectedCount / requiredCount) * 100;
</script>

<div class="card-selector">
  <div class="selector-header">
    <h2>Select Cards to Craft</h2>
    <p class="selector-subtitle">
      Select {requiredCount} <span style="color: {RARITY_CONFIG[recipe.inputRarity].color}">
        {RARITY_CONFIG[recipe.inputRarity].name}
      </span> cards to craft 1 <span style="color: {RARITY_CONFIG[recipe.outputRarity].color}">
        {RARITY_CONFIG[recipe.outputRarity].name}
      </span> card
    </p>

    <!-- Progress Bar -->
    <div class="progress-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          style="width: {progress}%; background: {RARITY_CONFIG[recipe.outputRarity].color}"
        ></div>
      </div>
      <span class="progress-text">{selectedCount} / {requiredCount} selected</span>
    </div>
  </div>

  <!-- Recipe Info -->
  <div class="recipe-info">
    <div class="recipe-recipe">
      <span class="recipe-label">Recipe:</span>
      <span class="recipe-value">{recipe.name}</span>
    </div>
    <div class="recipe-success">
      <span class="recipe-label">Success Rate:</span>
      <span class="recipe-value">{Math.round(recipe.successRate * 100)}%</span>
    </div>
    {#if recipe.failReturnRate}
      <div class="recipe-return">
        <span class="recipe-label">On Failure:</span>
        <span class="recipe-value">
          {Math.ceil(requiredCount * recipe.failReturnRate)} cards returned
        </span>
      </div>
    {/if}
  </div>

  <!-- Card Grid -->
  <div class="card-grid">
    {#each availableCards as card (card.id)}
      <div
        class="card-item"
        class:selected={selected.includes(card.id)}
        role="button"
        tabindex="0"
        on:click={() => onCardToggle(card.id)}
        on:keydown={(e) => e.key === 'Enter' && onCardToggle(card.id)}
      >
        <div class="card-mini">
          <div class="card-mini-art" style="border-color: {RARITY_CONFIG[card.rarity].color}">
            <span class="card-mini-icon">{card.type === 'ITEM' ? '🎁' : '👨'}</span>
          </div>
          <div class="card-mini-info">
            <span class="card-mini-name">{card.name}</span>
            <span class="card-mini-rarity" style="color: {RARITY_CONFIG[card.rarity].color}">
              {RARITY_CONFIG[card.rarity].name}
            </span>
          </div>
          {#if card.isHolo}
            <span class="card-mini-holo">✨</span>
          {/if}
        </div>
        {#if selected.includes(card.id)}
          <div class="card-selected-badge">✓</div>
        {/if}
      </div>
    {/each}

    {#if availableCards.length === 0}
      <div class="no-cards">
        <p>No cards available of this rarity.</p>
        <p>Open more packs to get {RARITY_CONFIG[recipe.inputRarity].name} cards!</p>
      </div>
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="selector-actions">
    <button
      class="btn btn-secondary"
      on:click={onCancel}
    >
      Cancel
    </button>
    <button
      class="btn btn-primary"
      class:disabled={!canConfirm}
      disabled={!canConfirm}
      on:click={onConfirm}
    >
      Craft {RARITY_CONFIG[recipe.outputRarity].name}
    </button>
  </div>
</div>

<style>
  .card-selector {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .selector-header {
    text-align: center;
  }

  .selector-header h2 {
    font-size: 1.75rem;
    margin: 0 0 0.5rem 0;
  }

  .selector-subtitle {
    font-size: 1rem;
    color: #9ca3af;
    margin: 0 0 1rem 0;
  }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .progress-bar {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 9999px;
  }

  .progress-text {
    font-size: 0.875rem;
    color: #9ca3af;
    min-width: 60px;
    text-align: right;
  }

  .recipe-info {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .recipe-recipe,
  .recipe-success,
  .recipe-return {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .recipe-label {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .recipe-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #fbbf24;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .card-item {
    position: relative;
    cursor: pointer;
    border-radius: 0.75rem;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.02);
  }

  .card-item:hover {
    border-color: rgba(251, 191, 36, 0.3);
    transform: translateY(-2px);
  }

  .card-item.selected {
    border-color: #fbbf24;
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  }

  .card-item:focus-visible {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
  }

  .card-mini {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .card-mini-art {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
    border: 2px solid;
    font-size: 1.5rem;
  }

  .card-mini-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .card-mini-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-mini-rarity {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .card-mini-holo {
    font-size: 1rem;
  }

  .card-selected-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fbbf24;
    color: black;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.875rem;
  }

  .no-cards {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem;
    color: #9ca3af;
  }

  .no-cards p {
    margin: 0.5rem 0;
  }

  .selector-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .btn-primary {
    background: linear-gradient(135deg, #fbbf24, #f97316);
    color: black;
  }

  .btn-primary:hover:not(.disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .card-grid {
      grid-template-columns: 1fr;
    }

    .recipe-info {
      flex-direction: column;
      gap: 0.75rem;
    }

    .selector-actions {
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }
  }
</style>
