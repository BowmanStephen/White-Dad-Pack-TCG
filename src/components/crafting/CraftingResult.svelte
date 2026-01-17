<script lang="ts">
  /**
   * CraftingResult - US080: Card Crafting - Combine Cards
   *
   * Displays the result of a crafting attempt (success or failure)
   */

  import { RARITY_CONFIG, type CraftingSession } from '../../types';

  export let session: CraftingSession | null;
  export let onBackToRecipes: () => void;
  export let onCraftAgain: () => void;

  $: isSuccess = session?.status === 'success';
  $: resultCard = session?.result;
  $: recipe = session?.recipe;
  $: returnedCount = recipe?.failReturnRate
    ? Math.ceil(recipe.inputCount * recipe.failReturnRate)
    : 0;
</script>

<div class="crafting-result">
  {#if isSuccess && resultCard}
    <!-- Success State -->
    <div class="result-container success">
      <div class="result-header">
        <div class="result-icon success-icon">✨</div>
        <h2 class="result-title">Crafting Successful!</h2>
        <p class="result-subtitle">You crafted a new card!</p>
      </div>

      <div class="result-card-display">
        <div class="result-card" style="border-color: {RARITY_CONFIG[resultCard.rarity].color}; box-shadow: 0 0 30px {RARITY_CONFIG[resultCard.rarity].glowColor}">
          <div class="card-artwork">
            <span class="card-artwork-icon">{resultCard.type === 'ITEM' ? '🎁' : '👨'}</span>
          </div>
          <div class="card-details">
            <div class="card-name">{resultCard.name}</div>
            <div class="card-subtitle">{resultCard.subtitle}</div>
            <div class="card-rarity" style="color: {RARITY_CONFIG[resultCard.rarity].color}">
              {RARITY_CONFIG[resultCard.rarity].name}
            </div>
            <div class="card-type">
              <span class="type-icon">{resultCard.type === 'ITEM' ? '🎁' : '👨'}</span>
              <span class="type-name">{resultCard.type}</span>
            </div>
          </div>
          {#if resultCard.isHolo}
            <div class="card-holo-badge">✨ Holo</div>
          {/if}
        </div>

        <!-- Card Stats Preview -->
        <div class="card-stats-preview">
          <h3>Card Stats</h3>
          <div class="stats-grid">
            <div class="stat">
              <span class="stat-label">Dad Joke</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: {resultCard.stats.dadJoke}%"></div>
              </div>
            </div>
            <div class="stat">
              <span class="stat-label">Grill Skill</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: {resultCard.stats.grillSkill}%"></div>
              </div>
            </div>
            <div class="stat">
              <span class="stat-label">Fix-It</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: {resultCard.stats.fixIt}%"></div>
              </div>
            </div>
            <div class="stat">
              <span class="stat-label">Nap Power</span>
              <div class="stat-bar">
                <div class="stat-fill" style="width: {resultCard.stats.napPower}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn-secondary" on:click={onBackToRecipes}>
          Back to Recipes
        </button>
        <button class="btn-primary" on:click={onCraftAgain}>
          Craft Again
        </button>
      </div>
    </div>

  {:else}
    <!-- Failure State -->
    <div class="result-container failure">
      <div class="result-header">
        <div class="result-icon failure-icon">💨</div>
        <h2 class="result-title">Crafting Failed</h2>
        <p class="result-subtitle">
          The crafting attempt was unsuccessful.
        </p>
        {#if returnedCount > 0}
          <p class="return-info">
            {returnedCount} of {recipe?.inputCount} cards have been returned to your collection.
          </p>
        {:else}
          <p class="return-info">
            All cards were consumed in the failed attempt.
          </p>
        {/if}
      </div>

      <div class="failure-details">
        <div class="failure-stats">
          <div class="failure-stat">
            <span class="failure-stat-label">Recipe</span>
            <span class="failure-stat-value">{recipe?.name}</span>
          </div>
          <div class="failure-stat">
            <span class="failure-stat-label">Success Chance</span>
            <span class="failure-stat-value">{recipe ? Math.round(recipe.successRate * 100) : 0}%</span>
          </div>
          {#if returnedCount > 0}
            <div class="failure-stat">
              <span class="failure-stat-label">Cards Returned</span>
              <span class="failure-stat-value">{returnedCount}</span>
            </div>
          {/if}
        </div>

        <div class="failure-message">
          <p>Don't give up! Try again with more cards.</p>
          <p class="failure-tip">💡 Tip: Higher rarity crafts have lower success rates but better rewards!</p>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn-secondary" on:click={onBackToRecipes}>
          Back to Recipes
        </button>
        <button class="btn-primary" on:click={onCraftAgain}>
          Try Again
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .crafting-result {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }

  .result-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 600px;
    width: 100%;
  }

  .result-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
  }

  .result-icon {
    font-size: 4rem;
  }

  .success-icon {
    animation: bounce 0.5s ease;
  }

  .failure-icon {
    animation: shake 0.5s ease;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }

  .result-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }

  .result-container.success .result-title {
    color: #22c55e;
  }

  .result-container.failure .result-title {
    color: #ef4444;
  }

  .result-subtitle {
    font-size: 1.125rem;
    color: #9ca3af;
    margin: 0;
  }

  .return-info {
    font-size: 0.875rem;
    color: #fbbf24;
    margin: 0.5rem 0 0 0;
  }

  .result-card-display {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result-card {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 1rem;
    border: 3px solid;
    position: relative;
  }

  .card-artwork {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.75rem;
    flex-shrink: 0;
  }

  .card-artwork-icon {
    font-size: 4rem;
  }

  .card-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .card-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .card-rarity {
    font-size: 1rem;
    font-weight: 600;
  }

  .card-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .type-icon {
    font-size: 1rem;
  }

  .card-holo-badge {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, #fbbf24, #f97316);
    color: black;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .card-stats-preview h3 {
    font-size: 1rem;
    margin: 0 0 1rem 0;
    color: #9ca3af;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .stat-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    overflow: hidden;
  }

  .stat-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f97316);
    border-radius: 9999px;
    transition: width 0.3s ease;
  }

  .failure-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 1rem;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .failure-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .failure-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }

  .failure-stat-label {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .failure-stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
  }

  .failure-message {
    text-align: center;
  }

  .failure-message p {
    margin: 0.5rem 0;
    color: #9ca3af;
  }

  .failure-tip {
    font-size: 0.875rem;
    color: #fbbf24;
  }

  .result-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn-primary,
  .btn-secondary {
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

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  @media (max-width: 640px) {
    .result-card {
      flex-direction: column;
      align-items: center;
    }

    .card-artwork {
      width: 100px;
      height: 100px;
    }

    .card-artwork-icon {
      font-size: 3rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .result-actions {
      flex-direction: column;
    }
  }
</style>
