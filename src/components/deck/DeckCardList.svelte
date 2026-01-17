<script lang="ts">
  import { RARITY_CONFIG, RARITY_ORDER, DAD_TYPE_NAMES } from '@/types';
  import type { Deck, DeckCard } from '@/types';

  export let deck: Deck;
  export let readonly: boolean = false;

  // Emit events for parent component
  export let onUpdate: (cardId: string, count: number) => void = () => {};
  export let onRemove: (cardId: string) => void = () => {};

  // Sort cards by rarity (rarest first), then by name
  function sortCards(a: DeckCard, b: DeckCard): number {
    const rarityDiff = RARITY_ORDER[b.card.rarity] - RARITY_ORDER[a.card.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return a.card.name.localeCompare(b.card.name);
  }

  // Get rarity color for border
  function getRarityColor(rarity: string): string {
    return RARITY_CONFIG[rarity]?.color || '#9ca3af';
  }

  // Handle count change
  function handleCountChange(cardId: string, newCount: number) {
    if (newCount <= 0) {
      onRemove(cardId);
    } else {
      onUpdate(cardId, Math.min(newCount, 4));
    }
  }
</script>

<div class="deck-card-list">
  {#if deck.cards.length === 0}
    <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No cards in deck</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Add cards from your collection to get started.</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each [...deck.cards].sort(sortCards) as deckCard (deckCard.cardId)}
        {@const rarity = deckCard.card.rarity}
        {@const config = RARITY_CONFIG[rarity]}

        <div
          class="deck-card-item flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 transition-all hover:shadow-md"
          style="border-color: {getRarityColor(rarity)}"
        >
          <!-- Card Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="font-semibold text-gray-900 dark:text-white truncate">{deckCard.card.name}</h4>
              <span
                class="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                style="background-color: {config.color}"
              >
                {config.name}
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{deckCard.card.subtitle}</p>
            <div class="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
              <span>{DAD_TYPE_NAMES[deckCard.card.type]}</span>
              <span>•</span>
              <span>{deckCard.card.series}.{deckCard.card.cardNumber}</span>
            </div>
          </div>

          <!-- Count Controls -->
          {#if !readonly}
            <div class="flex items-center gap-2">
              <button
                on:click={() => handleCountChange(deckCard.cardId, deckCard.count - 1)}
                disabled={deckCard.count <= 1}
                class="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease count"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>

              <span class="w-8 text-center font-semibold text-gray-900 dark:text-white">
                {deckCard.count}
              </span>

              <button
                on:click={() => handleCountChange(deckCard.cardId, deckCard.count + 1)}
                disabled={deckCard.count >= 4}
                class="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase count"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>

              <button
                on:click={() => onRemove(deckCard.cardId)}
                class="w-8 h-8 flex items-center justify-center rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                aria-label="Remove card"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          {:else}
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">x{deckCard.count}</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .deck-card-item {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
