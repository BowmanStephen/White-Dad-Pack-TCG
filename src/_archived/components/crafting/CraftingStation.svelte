<script lang="ts">
  import { craftingSession, craftingState, executeCraft, cancelCraftingSession } from '@/stores/crafting';
  import { collection } from '@/stores/collection';
  import RecipeDiscovery from './RecipeDiscovery.svelte';
  import RecipeSelector from './RecipeSelector.svelte';
  import CardSelector from './CardSelector.svelte';
  import CraftingAnimation from './CraftingAnimation.svelte';
  import CraftingResult from './CraftingResult.svelte';
  import type { PackCard } from '@/types';

  // Check if user has cards to craft with
  let hasCardsToCraft = $state(false);

  // Handle crafting execution
  async function handleCraft() {
    const session = $craftingSession;
    if (!session || session.selectedCards.length !== session.recipe.inputCount) return;

    // Get selected cards from collection
    const selectedCards: PackCard[] = [];
    for (const cardId of session.selectedCards) {
      const card = $collection?.cards.find((c) => c.id === cardId);
      if (card) {
        selectedCards.push(card);
      }
    }

    if (selectedCards.length === session.recipe.inputCount) {
      await executeCraft(selectedCards);
    }
  }

  // Handle cancel
  function handleCancel() {
    cancelCraftingSession();
  }

  // Handle animation complete
  function handleAnimationComplete() {
    // State will be updated by executeCraft
  }

  // Check if ready to craft
  $: canCraft = $craftingSession &&
    $craftingSession.selectedCards.length === $craftingSession.recipe.inputCount;

  // Get current state
  $: state = $craftingState;

  // Check if user has cards for crafting
  $: hasCardsToCraft = $collection && $collection.cards && $collection.cards.length > 0;
</script>

<div class="crafting-station">
  <!-- Recipe Discovery Component (Hints & Celebrations) -->
  <RecipeDiscovery />

  <!-- Main Content -->
  <div class="rounded-2xl bg-slate-900 border border-slate-700 p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-white mb-2">Crafting Station</h1>
      <p class="text-gray-400">Combine cards to create new, more powerful cards. Discover new recipes through experimentation!</p>
    </div>

    <!-- State Machine -->
    {#if !hasCardsToCraft && state === 'idle'}
      <!-- Empty Crafting State -->
      <div class="empty-crafting-state">
        <div class="empty-icon">🔮</div>
        <h2 class="empty-title">No cards to craft with!</h2>
        <p class="empty-description">
          You need cards in your collection before you can start crafting. Open some packs to gather materials!
        </p>
        <div class="crafting-features">
          <div class="feature-item">
            <span class="feature-icon">📦</span>
            <div class="feature-content">
              <span class="feature-title">Open Packs</span>
              <span class="feature-desc">Get cards from booster packs</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">⚗️</span>
            <div class="feature-content">
              <span class="feature-title">Combine Cards</span>
              <span class="feature-desc">5 cards → 1 better card</span>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎲</span>
            <div class="feature-content">
              <span class="feature-title">Risk & Reward</span>
              <span class="feature-desc">Some recipes have 50% success rate</span>
            </div>
          </div>
        </div>
        <a href="/pack" class="empty-cta">
          <span class="cta-icon">🚀</span>
          <span class="cta-text">Open Packs First</span>
        </a>
        <p class="empty-hint">Crafting allows you to combine lower-rarity cards into higher-rarity cards</p>
      </div>
    {:else if state === 'idle'}
      <!-- Recipe Selection -->
      <RecipeSelector />

    {:else if state === 'selecting'}
      <!-- Card Selection -->
      <div class="mb-6">
        <button
          on:click={handleCancel}
          class="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Recipes
        </button>
      </div>

      {#if $craftingSession}
        <div class="mb-6 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-4">
          <h3 class="text-xl font-bold text-white mb-2">
            {$craftingSession.recipe.name}
          </h3>
          <p class="text-gray-300 mb-4">{$craftingSession.recipe.description}</p>
          <div class="flex gap-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-gray-400">Input:</span>
              <span class="font-semibold text-white">
                {$craftingSession.recipe.inputCount}× {$craftingSession.recipe.inputRarity}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">Output:</span>
              <span class="font-semibold text-white">
                {$craftingSession.recipe.outputCount}× {$craftingSession.recipe.outputRarity}
              </span>
            </div>
          </div>
        </div>

        <CardSelector
          requiredRarity={$craftingSession.recipe.inputRarity}
          requiredCount={$craftingSession.recipe.inputCount}
        />

        <!-- Craft Button -->
        {#if canCraft}
          <div class="mt-6">
            <button
              on:click={handleCraft}
              class="btn-primary w-full text-lg py-4"
            >
              <span class="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                Craft Now
              </span>
            </button>
          </div>
        {/if}
      {/if}

    {:else if state === 'crafting'}
      <!-- Crafting Animation -->
      <CraftingAnimation onComplete={handleAnimationComplete} />

    {:else if state === 'success' || state === 'failed'}
      <!-- Crafting Result -->
      <CraftingResult />
    {/if}
  </div>

  <!-- Crafting History -->
  {#if state === 'idle'}
    <div class="mt-8 rounded-lg bg-slate-900 border border-slate-700 p-6">
      <h2 class="text-xl font-bold text-white mb-4">Crafting Statistics</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-lg bg-slate-800 p-4 text-center">
          <p class="text-2xl font-bold text-white">0</p>
          <p class="text-sm text-gray-400">Total Crafts</p>
        </div>
        <div class="rounded-lg bg-slate-800 p-4 text-center">
          <p class="text-2xl font-bold text-green-400">0</p>
          <p class="text-sm text-gray-400">Successes</p>
        </div>
        <div class="rounded-lg bg-slate-800 p-4 text-center">
          <p class="text-2xl font-bold text-red-400">0</p>
          <p class="text-sm text-gray-400">Failures</p>
        </div>
        <div class="rounded-lg bg-slate-800 p-4 text-center">
          <p class="text-2xl font-bold text-amber-400">0%</p>
          <p class="text-sm text-gray-400">Success Rate</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .empty-crafting-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .empty-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .empty-title {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #a855f7, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .empty-description {
    font-size: 1.125rem;
    color: #94a3b8;
    margin-bottom: 2.5rem;
    max-width: 600px;
    line-height: 1.6;
  }

  .crafting-features {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2.5rem;
    max-width: 700px;
    width: 100%;
  }

  @media (min-width: 640px) {
    .crafting-features {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 0.75rem;
    transition: all 0.3s;
    text-align: left;
    flex: 1;
    min-width: 200px;
  }

  .feature-item:hover {
    background: rgba(168, 85, 247, 0.2);
    border-color: rgba(168, 85, 247, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.2);
  }

  .feature-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .feature-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .feature-title {
    font-size: 1rem;
    font-weight: 700;
    color: #e2e8f0;
  }

  .feature-desc {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .empty-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #a855f7, #6366f1);
    color: white;
    font-weight: 700;
    font-size: 1.125rem;
    border-radius: 0.75rem;
    text-decoration: none;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
  }

  .empty-cta:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.5);
  }

  .cta-icon {
    font-size: 1.25rem;
  }

  .empty-hint {
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: #64748b;
    font-style: italic;
  }
</style>
