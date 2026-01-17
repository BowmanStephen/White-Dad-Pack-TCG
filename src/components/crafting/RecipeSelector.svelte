<script lang="ts">
  /**
   * RecipeSelector - US080: Card Crafting - Combine Cards
   *
   * Modal/dialog for selecting a crafting recipe.
   * This is a simplified version that's shown as an overlay.
   */

  import { RARITY_CONFIG, CRAFTING_RECIPES, type CraftingRecipe } from '../../types';
  import { getSuccessRateText, getFailureReturnText } from '../../lib/crafting';

  export let isOpen = false;
  export let onSelect: (recipe: CraftingRecipe) => void;
  export let onClose: () => void;
  export let availableRecipes: CraftingRecipe[] = [];

  function handleSelect(recipe: CraftingRecipe) {
    onSelect(recipe);
    onClose();
  }
</script>

{#if isOpen}
  <div class="recipe-selector-overlay" on:click={onClose}>
    <div class="recipe-selector-modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Select Crafting Recipe</h2>
        <button class="close-button" on:click={onClose}>×</button>
      </div>

      <div class="modal-body">
        <p class="modal-intro">Choose what you want to craft. Each recipe requires 5 cards of the input rarity.</p>

        <div class="recipe-list">
          {#each CRAFTING_RECIPES as recipe}
            {@const isAvailable = availableRecipes.some(r => r.id === recipe.id)}
            <div
              class="recipe-option"
              class:available={isAvailable}
              class:unavailable={!isAvailable}
              role="button"
              tabindex="0"
              on:click={() => isAvailable && handleSelect(recipe)}
              on:keydown={(e) => e.key === 'Enter' && isAvailable && handleSelect(recipe)}
            >
              <div class="recipe-option-header">
                <div class="recipe-option-icon" style="background: linear-gradient(135deg, {RARITY_CONFIG[recipe.inputRarity].color}, {RARITY_CONFIG[recipe.outputRarity].color})">
                  ⚗️
                </div>
                <div class="recipe-option-info">
                  <span class="recipe-option-name">{recipe.name}</span>
                  <span class="recipe-option-desc">{recipe.description}</span>
                </div>
                {#if isAvailable}
                  <span class="recipe-option-status available">Available</span>
                {:else}
                  <span class="recipe-option-status unavailable">Need Cards</span>
                {/if}
              </div>

              <div class="recipe-option-details">
                <div class="recipe-option-input">
                  <span class="option-count">{recipe.inputCount}</span>
                  <span class="option-rarity" style="color: {RARITY_CONFIG[recipe.inputRarity].color}">
                    {RARITY_CONFIG[recipe.inputRarity].name}
                  </span>
                </div>
                <div class="recipe-option-arrow">→</div>
                <div class="recipe-option-output">
                  <span class="option-count">{recipe.outputCount}</span>
                  <span class="option-rarity" style="color: {RARITY_CONFIG[recipe.outputRarity].color}">
                    {RARITY_CONFIG[recipe.outputRarity].name}
                  </span>
                </div>
              </div>

              <div class="recipe-option-chance">
                <span class="success-chance">{getSuccessRateText(recipe)}</span>
                <span class="fail-return">{getFailureReturnText(recipe)}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .recipe-selector-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .recipe-selector-modal {
    background: #1a1a2e;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header h2 {
    font-size: 1.5rem;
    margin: 0;
  }

  .close-button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 0.5rem;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .modal-intro {
    text-align: center;
    color: #9ca3af;
    margin: 0;
  }

  .recipe-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .recipe-option {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 0.75rem;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .recipe-option.available {
    border-color: rgba(34, 197, 94, 0.3);
  }

  .recipe-option.available:hover {
    border-color: #22c55e;
    background: rgba(34, 197, 94, 0.05);
  }

  .recipe-option.unavailable {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .recipe-option-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .recipe-option-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    font-size: 1.25rem;
  }

  .recipe-option-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
  }

  .recipe-option-name {
    font-weight: 600;
    color: white;
  }

  .recipe-option-desc {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .recipe-option-status {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .recipe-option-status.available {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .recipe-option-status.unavailable {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .recipe-option-details {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .recipe-option-input,
  .recipe-option-output {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .option-count {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
  }

  .option-rarity {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .recipe-option-arrow {
    font-size: 1.25rem;
    color: #9ca3af;
  }

  .recipe-option-chance {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
  }

  .success-chance {
    color: #22c55e;
    font-weight: 500;
  }

  .fail-return {
    color: #9ca3af;
  }

  @media (max-width: 640px) {
    .recipe-selector-modal {
      max-height: 90vh;
    }

    .modal-header {
      padding: 1rem;
    }

    .modal-body {
      padding: 1rem;
    }

    .recipe-option-details {
      flex-direction: column;
      gap: 0.5rem;
    }

    .recipe-option-arrow {
      transform: rotate(90deg);
    }
  }
</style>
