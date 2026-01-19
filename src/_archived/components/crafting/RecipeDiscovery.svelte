<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { discoveredRecipes, undiscoveredRecipesList } from '@/stores/crafting';
  import type { CraftingRecipe } from '@/types/crafting';

  // Props
  export let showHints = true;
  export let autoDismiss = true;
  export let dismissDelay = 5000; // 5 seconds

  // Local state
  let newlyDiscoveredRecipe: CraftingRecipe | null = null;
  let showCelebration = false;
  let showHintsPanel = false;

  // Listen for recipe discovery events
  function handleRecipeDiscovery(event: CustomEvent) {
    const { recipe } = event.detail;
    newlyDiscoveredRecipe = recipe;
    showCelebration = true;

    // Auto-dismiss celebration after delay
    if (autoDismiss) {
      setTimeout(() => {
        showCelebration = false;
        newlyDiscoveredRecipe = null;
      }, dismissDelay);
    }
  }

  onMount(() => {
    window.addEventListener('recipe-discovered', handleRecipeDiscovery as EventListener);
  });

  onDestroy(() => {
    window.removeEventListener('recipe-discovered', handleRecipeDiscovery as EventListener);
  });

  // Computed: undiscovered recipes with hints
  $: undiscoveredRecipes = $undiscoveredRecipesList;

  // Get hint for a recipe
  function getHint(recipeId: string): string {
    const hints: Record<string, string> = {
      common_to_uncommon: 'Sometimes combining the basics leads to something better...',
      uncommon_to_rare: 'Quality begets quality. Five of the same tier might refine into something greater.',
      rare_to_epic: 'Great risk, great reward. Half the materials lost on failure, but the prize is sweet.',
      epic_to_legendary: 'Only the finest materials can forge legends. The path is treacherous.',
      legendary_to_mythic: 'Transcendence itself. The ultimate fusion, with the greatest risk.',
      common_to_rare_direct: 'Quantity can sometimes substitute for quality. A direct, albeit risky, path.',
      mixed_rare_batch: 'Different rarities can harmonize. Uncommon and Rare together might create Epic results.',
      holo_boost: 'The shine of holo cards carries power. Infuse your crafting with holographic essence.',
    };
    return hints[recipeId] || '???';
  }

  function dismissCelebration() {
    showCelebration = false;
    newlyDiscoveredRecipe = null;
  }

  function toggleHintsPanel() {
    showHintsPanel = !showHintsPanel;
  }
</script>

<!-- Recipe Discovery Celebration -->
{#if showCelebration && newlyDiscoveredRecipe}
  <div class="celebration-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div class="celebration-content relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-1 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500">
      <div class="bg-slate-900 rounded-xl p-8 text-center max-w-md">
        <!-- Close button -->
        <button
          on:click={dismissCelebration}
          class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close celebration"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Icon -->
        <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <!-- Title -->
        <h2 class="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          Recipe Discovered!
        </h2>

        <!-- Recipe Name -->
        <p class="mb-2 text-2xl font-semibold text-white">
          {newlyDiscoveredRecipe.name}
        </p>

        <!-- Description -->
        <p class="mb-4 text-gray-300">
          {newlyDiscoveredRecipe.description}
        </p>

        <!-- Stats -->
        <div class="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div class="rounded-lg bg-slate-800 p-3">
            <p class="text-gray-400">Input</p>
            <p class="text-lg font-semibold text-white">
              {newlyDiscoveredRecipe.inputCount}× {newlyDiscoveredRecipe.inputRarity}
            </p>
          </div>
          <div class="rounded-lg bg-slate-800 p-3">
            <p class="text-gray-400">Output</p>
            <p class="text-lg font-semibold text-white">
              {newlyDiscoveredRecipe.outputCount}× {newlyDiscoveredRecipe.outputRarity}
            </p>
          </div>
        </div>

        <!-- Success Rate -->
        <div class="mb-6 rounded-lg bg-slate-800 p-3">
          <p class="text-gray-400">Success Rate</p>
          <div class="mt-2 h-3 overflow-hidden rounded-full bg-slate-700">
            <div
              class="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style="width: {newlyDiscoveredRecipe.successRate * 100}%"
            ></div>
          </div>
          <p class="mt-1 text-lg font-semibold text-white">
            {(newlyDiscoveredRecipe.successRate * 100).toFixed(0)}%
          </p>
        </div>

        <!-- Dismiss button -->
        <button
          on:click={dismissCelebration}
          class="btn-primary w-full"
        >
          Awesome!
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Recipe Hints Panel -->
{#if showHints && undiscoveredRecipes.length > 0}
  <div class="hints-panel mb-6">
    <button
      on:click={toggleHintsPanel}
      class="mb-4 flex w-full items-center justify-between rounded-lg bg-slate-800 p-4 hover:bg-slate-700 transition-colors"
    >
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <div class="text-left">
          <p class="font-semibold text-white">Recipe Hints</p>
          <p class="text-sm text-gray-400">{undiscoveredRecipes.length} undiscovered recipes</p>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 transform text-gray-400 transition-transform {showHintsPanel ? 'rotate-180' : ''}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {#if showHintsPanel}
      <div class="mt-2 space-y-2">
        {#each undiscoveredRecipes as recipe}
          <div class="rounded-lg bg-slate-800/50 p-4 border border-slate-700">
            <div class="mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="font-semibold text-white">Undiscovered Recipe</p>
            </div>
            <p class="text-gray-300 italic">"{getHint(recipe.id)}"</p>
            <div class="mt-2 flex gap-4 text-sm text-gray-400">
              <span>🔒 {recipe.inputCount}× {recipe.inputRarity}</span>
              <span>→ {recipe.outputRarity}</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
