<script lang="ts">
  import { startCraftingSession, toggleRecipeFavorite, discoveredRecipesWithFavoriteStatus, favoriteRecipesOnly } from '@/stores/crafting';
  import type { CraftingRecipe } from '@/types/crafting';
  import type { Rarity } from '@/types';

  // Filter mode state
  let showFavoritesOnly = $state(false);

  // Rarity order for sorting
  const rarityOrder: Record<Rarity, number> = {
    common: 0,
    uncommon: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    mythic: 5,
  };

  // Get recipes based on filter mode (using $derived)
  const displayedRecipes = $derived(
    showFavoritesOnly ? $favoriteRecipesOnly : $discoveredRecipesWithFavoriteStatus
  );

  // Sort recipes by output rarity (using $derived)
  const sortedRecipes = $derived(
    [...displayedRecipes].sort((a, b) => {
      return rarityOrder[a.outputRarity] - rarityOrder[b.outputRarity];
    })
  );

  // Separate discovered and undiscovered (using $derived)
  const discoveredRecipes = $derived(
    showFavoritesOnly
      ? sortedRecipes
      : sortedRecipes.filter((r: any) => r.isDiscovered)
  );

  const undiscoveredRecipes = $derived(
    showFavoritesOnly
      ? []
      : sortedRecipes.filter((r: any) => !r.isDiscovered)
  );

  function handleRecipeSelect(recipeId: string) {
    startCraftingSession(recipeId);
  }

  function handleToggleFavorite(event: Event, recipeId: string) {
    event.stopPropagation(); // Prevent card selection when clicking star
    toggleRecipeFavorite(recipeId);
  }

  // Get rarity color
  function getRarityColor(rarity: Rarity): string {
    const colors: Record<Rarity, string> = {
      common: 'from-gray-500 to-gray-600',
      uncommon: 'from-blue-500 to-blue-600',
      rare: 'from-yellow-500 to-yellow-600',
      epic: 'from-purple-500 to-purple-600',
      legendary: 'from-orange-500 to-orange-600',
      mythic: 'from-pink-500 to-pink-600',
    };
    return colors[rarity];
  }
</script>

<div class="recipe-selector">
  <!-- Favorites Filter Toggle -->
  <div class="mb-6 flex items-center justify-between">
    <h2 class="text-2xl font-bold text-white">
      {showFavoritesOnly ? 'Favorite Recipes' : 'Discovered Recipes'}
    </h2>
    <button
      on:click={() => showFavoritesOnly = !showFavoritesOnly}
      class="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-700"
    >
      {#if showFavoritesOnly}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Show All
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        Show Favorites
      {/if}
    </button>
  </div>

  <!-- Discovered Recipes -->
  <div class="mb-8">
    {#if discoveredRecipes.length === 0}
      <p class="text-gray-400">
        {showFavoritesOnly
          ? 'No favorite recipes yet. Click the star icon to add recipes to your favorites!'
          : 'No recipes discovered yet. Start crafting to unlock new recipes!'}
      </p>
    {:else}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each discoveredRecipes as recipe}
          <div
            on:click={() => handleRecipeSelect(recipe.id)}
            on:keypress={(e) => e.key === 'Enter' && handleRecipeSelect(recipe.id)}
            role="button"
            tabindex="0"
            class="group relative overflow-hidden rounded-lg bg-gradient-to-br {getRarityColor(recipe.outputRarity)}
              p-1 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer"
          >
            <!-- Favorite Star Button -->
            <button
              on:click={(e) => handleToggleFavorite(e, recipe.id)}
              on:keypress={(e) => e.key === 'Enter' && handleToggleFavorite(e, recipe.id)}
              class="absolute right-2 top-2 z-10 rounded-full bg-slate-900/80 p-1.5 transition-all duration-200 hover:bg-slate-900 hover:scale-110"
              aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 {recipe.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-400'}"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>

            <div class="bg-slate-900 p-4 h-full pr-12">
              <!-- Recipe Header -->
              <div class="mb-3">
                <h3 class="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-500 transition-all">
                  {recipe.name}
                </h3>
                <p class="text-sm text-gray-400">{recipe.description}</p>
              </div>

              <!-- Recipe Stats -->
              <div class="space-y-2 text-sm">
                <!-- Input -->
                <div class="flex items-center justify-between rounded-lg bg-slate-800 p-2">
                  <span class="text-gray-400">Input:</span>
                  <span class="font-semibold text-white">
                    {recipe.inputCount}× {recipe.inputRarity}
                  </span>
                </div>

                <!-- Output -->
                <div class="flex items-center justify-between rounded-lg bg-slate-800 p-2">
                  <span class="text-gray-400">Output:</span>
                  <span class="font-semibold text-white">
                    {recipe.outputCount}× {recipe.outputRarity}
                  </span>
                </div>

                <!-- Success Rate -->
                <div class="rounded-lg bg-slate-800 p-2">
                  <div class="mb-1 flex items-center justify-between">
                    <span class="text-gray-400">Success Rate:</span>
                    <span class="font-semibold text-white">
                      {(recipe.successRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style="width: {recipe.successRate * 100}%"
                    ></div>
                  </div>
                </div>

                {#if recipe.failReturnRate}
                  <div class="flex items-center justify-between rounded-lg bg-slate-800 p-2">
                    <span class="text-gray-400">Fail Return:</span>
                    <span class="font-semibold text-yellow-400">
                      {(recipe.failReturnRate * 100).toFixed(0)}%
                    </span>
                  </div>
                {/if}
              </div>

              <!-- Craft Button -->
              <button class="mt-4 w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2 font-bold text-white shadow-md transition-all duration-200 hover:from-amber-400 hover:to-orange-400 active:scale-95">
                Craft
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Undiscovered Recipes -->
  {#if undiscoveredRecipes.length > 0}
    <div>
      <h2 class="mb-4 text-2xl font-bold text-white">Undiscovered Recipes</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each undiscoveredRecipes as recipe}
          <div class="relative overflow-hidden rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 p-4">
            <!-- Locked Icon -->
            <div class="mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span class="font-semibold text-gray-500">Undiscovered Recipe</span>
            </div>

            <!-- Hint -->
            <p class="mb-3 text-sm text-gray-400 italic">
              "{recipe.hint}"
            </p>

            <!-- Partial Info -->
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
                <span class="text-gray-500">Input:</span>
                <span class="font-semibold text-gray-500">???</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-slate-900/50 p-2">
                <span class="text-gray-500">Output:</span>
                <span class="font-semibold text-gray-500">
                  ???
                </span>
              </div>
            </div>

            <!-- Rarity Badge (Output Only) -->
            <div class="mt-3 text-center">
              <span class="inline-block rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                {recipe.outputRarity}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
