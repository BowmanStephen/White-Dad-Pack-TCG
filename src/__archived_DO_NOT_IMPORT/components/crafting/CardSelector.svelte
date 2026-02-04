<script lang="ts">
  import { collection } from '@/stores/collection';
  import { craftingSession } from '@/stores/crafting';
  import { selectCard, deselectCard } from '@/stores/crafting';
  import type { Rarity } from '@/types';
  import Card from '@/components/card/Card.svelte';

  export let requiredRarity: Rarity;
  export let requiredCount: number;

  // Filter cards by required rarity
  $: eligibleCards = $collection?.cards.filter(
    (card) => card.rarity === requiredRarity
  ) || [];

  // Get selected card IDs from session
  $: selectedCardIds = $craftingSession?.selectedCards || [];

  // Check if card is selected
  function isCardSelected(cardId: string): boolean {
    return selectedCardIds.includes(cardId);
  }

  // Check if selection is complete
  $: isSelectionComplete = selectedCardIds.length >= requiredCount;

  // Get remaining count needed
  $: remainingCount = requiredCount - selectedCardIds.length;

  // Handle card click
  function handleCardClick(cardId: string) {
    if (isCardSelected(cardId)) {
      deselectCard(cardId);
    } else if (!isSelectionComplete) {
      selectCard(cardId);
    }
  }

  // Rarity color mapping
  const rarityColors: Record<Rarity, string> = {
    common: 'border-gray-400',
    uncommon: 'border-blue-400',
    rare: 'border-yellow-500',
    epic: 'border-purple-500',
    legendary: 'border-orange-500',
    mythic: 'border-pink-500',
  };
</script>

<div class="card-selector">
  <!-- Selection Counter -->
  <div class="mb-4 rounded-lg bg-slate-800 p-4">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-white">Select Materials</h3>
      <span class="text-sm text-gray-400">
        {selectedCardIds.length} / {requiredCount} selected
      </span>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-slate-700">
      <div
        class="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
        style="width: {(selectedCardIds.length / requiredCount) * 100}%"
      ></div>
    </div>
    {#if remainingCount > 0}
      <p class="mt-2 text-sm text-gray-400">
        Select {remainingCount} more {requiredRarity} {remainingCount === 1 ? 'card' : 'cards'}
      </p>
    {:else}
      <p class="mt-2 text-sm text-green-400">Selection complete! Ready to craft.</p>
    {/if}
  </div>

  <!-- Card Grid -->
  {#if eligibleCards.length === 0}
    <div class="rounded-lg bg-slate-800 p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-gray-400">No {requiredRarity} cards in your collection</p>
      <p class="mt-2 text-sm text-gray-500">Open more packs to get materials!</p>
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {#each eligibleCards as card (card.id)}
        <div
          class="relative cursor-pointer transition-all duration-200 {isCardSelected(card.id)
            ? 'ring-4 ring-amber-500 scale-105'
            : 'hover:scale-102'}"
          on:click={() => handleCardClick(card.id)}
          role="button"
          tabindex="0"
          on:keypress={(e) => e.key === 'Enter' && handleCardClick(card.id)}
          aria-label="Select {card.name}"
          aria-pressed={isCardSelected(card.id)}
        >
          <Card {card} />
          {#if isCardSelected(card.id)}
            <div class="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
