<script lang="ts">
  import type { Deck } from '@/types';

  export let decks: Deck[];
  export let selectedDeckId: string | null;
  export let onCreateNew: () => void;
  export let onSelectDeck: (deckId: string) => void;
  export let onDeleteDeck: (deckId: string) => void;
  export let onDuplicateDeck: (deckId: string) => void;

  let showDropdown = false;
  let dropdownElement: HTMLDivElement;

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function closeDropdown() {
    showDropdown = false;
  }

  function handleSelectDeck(deckId: string) {
    onSelectDeck(deckId);
    closeDropdown();
  }

  // Click outside to close
  function handleClickOutside(event: MouseEvent) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      closeDropdown();
    }
  }

  // Close dropdown when clicking outside
  if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  }
</script>

<div class="deck-selector" bind:this={dropdownElement}>
  <div class="relative">
    <!-- Deck Selection Button -->
    <button
      on:click={toggleDropdown}
      class="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
    >
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <div class="text-left">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedDeckId
              ? decks.find(d => d.id === selectedDeckId)?.name || 'Select Deck'
              : 'All Decks'}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {decks.length} / 10 decks
          </div>
        </div>
      </div>
      <svg
        class="w-5 h-5 text-gray-400 transition-transform {showDropdown ? 'rotate-180' : ''}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    {#if showDropdown}
      <div
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        role="listbox"
      >
        <!-- Create New Deck -->
        <button
          on:click={() => {
            onCreateNew();
            closeDropdown();
          }}
          class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-200 dark:border-gray-700"
          role="option"
        >
          <div class="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <div class="font-medium text-gray-900 dark:text-white">Create New Deck</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {decks.length >= 10 ? 'Deck limit reached' : 'Start a new deck'}
            </div>
          </div>
        </button>

        <!-- Deck List -->
        {#if decks.length > 0}
          <div class="py-1">
            {#each decks as deck (deck.id)}
              <div
                class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                role="option"
                aria-selected={selectedDeckId === deck.id}
                on:click={() => handleSelectDeck(deck.id)}
              >
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900 dark:text-white truncate">
                    {deck.name}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>{deck.stats.totalCards} cards</span>
                    <span>•</span>
                    <span>{deck.stats.uniqueCards} unique</span>
                  </div>
                  {#if deck.description}
                    <div class="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                      {deck.description}
                    </div>
                  {/if}
                </div>

                <!-- Deck Actions -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    on:click|stopPropagation={() => onDuplicateDeck(deck.id)}
                    class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    title="Duplicate deck"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    on:click|stopPropagation={() => onDeleteDeck(deck.id)}
                    class="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    title="Delete deck"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No decks yet. Create your first deck!
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
