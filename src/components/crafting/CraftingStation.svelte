<script lang="ts">
  import { craftingSession, craftingState, executeCraft, cancelCraftingSession } from '@/stores/crafting';
  import { collection } from '@/stores/collection';
  import RecipeDiscovery from './RecipeDiscovery.svelte';
  import RecipeSelector from './RecipeSelector.svelte';
  import CardSelector from './CardSelector.svelte';
  import CraftingAnimation from './CraftingAnimation.svelte';
  import CraftingResult from './CraftingResult.svelte';
  import type { PackCard } from '@/types';

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
    {#if state === 'idle'}
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
