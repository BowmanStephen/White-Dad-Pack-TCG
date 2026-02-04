<script lang="ts">
  import { craftingSession, craftingState, cancelCraftingSession } from '@/stores/crafting';
  import type { PackCard } from '@/types';
  import Card from '@/components/card/Card.svelte';

  // Get result from session
  $: result = $craftingSession?.result || null;
  $: success = !!result;
  $: recipe = $craftingSession?.recipe;

  function handleContinue() {
    cancelCraftingSession();
  }

  function handleRetry() {
    // Reset session to selecting state
    if ($craftingSession) {
      craftingSession.set({
        ...$craftingSession,
        selectedCards: [],
        status: 'selecting',
      });
      craftingState.set('selecting');
    }
  }
</script>

<div class="crafting-result fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
  <div class="w-full max-w-lg p-8">
    <div class="rounded-2xl bg-slate-900 border-2 {success ? 'border-green-500' : 'border-red-500'} p-8 shadow-2xl">
      <!-- Header -->
      <div class="mb-6 text-center">
        {#if success}
          <div class="mb-4 flex justify-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            Crafting Successful!
          </h2>
          <p class="mt-2 text-gray-300">You've crafted a new card!</p>
        {:else}
          <div class="mb-4 flex justify-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
            Crafting Failed
          </h2>
          <p class="mt-2 text-gray-300">
            The materials were lost in the process.
            {#if recipe?.failReturnRate}
              {(recipe.failReturnRate * 100).toFixed(0)}% of materials have been returned.
            {/if}
          </p>
        {/if}
      </div>

      <!-- Result Card -->
      {#if success && result}
        <div class="mb-6 flex justify-center">
          <div class="transform scale-125">
            <Card card={result} />
          </div>
        </div>

        <!-- Card Stats -->
        <div class="mb-6 rounded-lg bg-slate-800 p-4">
          <h3 class="mb-3 text-lg font-semibold text-white">{result.name}</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Rarity:</span>
              <span class="font-semibold text-white capitalize">{result.rarity}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Type:</span>
              <span class="font-semibold text-white">{result.type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Holo:</span>
              <span class="font-semibold {result.isHolo ? 'text-amber-400' : 'text-gray-500'}">
                {result.isHolo ? '✨ Yes' : 'No'}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Dad Joke:</span>
              <span class="font-semibold text-white">{result.stats.dadJoke}</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- Recipe Info -->
      {#if recipe}
        <div class="mb-6 rounded-lg bg-slate-800 p-4">
          <h3 class="mb-2 text-sm font-semibold text-gray-400">Recipe Used</h3>
          <p class="text-lg font-semibold text-white">{recipe.name}</p>
          <p class="text-sm text-gray-400">{recipe.description}</p>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex gap-4">
        {#if !success}
          <button
            on:click={handleRetry}
            class="btn-secondary flex-1"
          >
            Try Again
          </button>
        {/if}
        <button
          on:click={handleContinue}
          class="btn-primary flex-1"
        >
          {success ? 'Awesome!' : 'Continue'}
        </button>
      </div>
    </div>
  </div>
</div>
