<script lang="ts">
   import { createEventDispatcher } from 'svelte';
   import { importDeckFromCode, validateDeckCardsInCollection } from '@/lib/deck/sharing';
   import { collection } from '@/stores/collection';
   import { createNewDeck, updateDeckInfo, addCard, clearCurrentDeck } from '@/stores/deck';
   import { showToast } from '@/stores/ui';
   import type { DeckImportResult } from '@/lib/deck/sharing';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  const dispatch = createEventDispatcher();

  let deckCode = $state('');
  let importResult = $state<DeckImportResult | null>(null);
  let isImporting = $state(false);
  let validationError = $state<string | null>(null);

  let userCollectionCards = $derived(new Set($collection.cards.map(c => c.id)));

  function close() {
    open = false;
    dispatch('close');
  }

  async function importDeck() {
    // Reset state
    validationError = null;
    importResult = null;
    isImporting = true;

    // Trim input
    deckCode = deckCode.trim();

    // Validate input
    if (!deckCode) {
      validationError = 'Please enter a deck code.';
      isImporting = false;
      return;
    }

    // Import deck
    const result = importDeckFromCode(deckCode);
    importResult = result;
    isImporting = false;

    if (!result.success) {
      return;
    }
  }

  function confirmImport() {
    if (!importResult?.success || !importResult.deck) {
      return;
    }

    // Create new deck
    createNewDeck(importResult.deck.name || 'Imported Deck', importResult.deck.description);

     // Add cards to deck
     if (importResult.deck.cards) {
       for (const deckCard of importResult.deck.cards) {
         try {
           addCard(deckCard.card, deckCard.count);
         } catch (error) {
           showToast(`Failed to add card ${deckCard.card.name}. Please try again.`, 'error');
         }
       }
     }

    // Close modal
    close();

    // Reset state
    deckCode = '';
    importResult = null;
    validationError = null;

    // Notify parent
    dispatch('imported');
  }

  function validateCollection() {
    if (!deckCode) {
      return;
    }

    const validation = validateDeckCardsInCollection(deckCode, userCollectionCards);

    if (validation.missingCards.length === 0) {
      validationError = null;
    } else {
      validationError = `You're missing ${validation.missingCards.length} card(s) from your collection.`;
    }

    return validation;
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm"
      on:click={close}
      role="presentation"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Import Deck</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Paste a deck code to import a deck from a friend or the community
          </p>
        </div>
        <button
          on:click={close}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[70vh]">
        <!-- Input -->
        <div class="space-y-4">
          <div>
            <label for="deck-code" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deck Code
            </label>
            <p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Paste the deck code (starts with "DadDeckv1|") or share link
            </p>
            <textarea
              id="deck-code"
              bind:value={deckCode}
              placeholder="DadDeckv1|eyJ..."
              class="w-full px-4 py-3 text-sm font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 dark:text-white resize-none"
              rows="4"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              on:click={importDeck}
              disabled={isImporting || !deckCode}
              class="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {#if isImporting}
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </span>
              {:else}
                Import Deck
              {/if}
            </button>

            <button
              on:click={validateCollection}
              disabled={!deckCode}
              class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Collection
            </button>
          </div>
        </div>

        <!-- Validation Error -->
        {#if validationError}
          <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Collection Check</p>
                <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{validationError}</p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Import Result -->
        {#if importResult}
          {#if importResult.success}
            <!-- Success -->
            <div class="mt-6 space-y-4">
              <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-green-800 dark:text-green-200">Deck Found!</p>
                    <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                      "{importResult.deck?.name}" with {importResult.deck?.cards.length} unique cards
                    </p>
                  </div>
                </div>
              </div>

              <!-- Deck Preview -->
              {#if importResult.deck}
                <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {importResult.deck.name}
                  </h3>
                  {#if importResult.deck.description}
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {importResult.deck.description}
                    </p>
                  {/if}

                  <!-- Card List -->
                  <div class="space-y-2 max-h-60 overflow-y-auto">
                    {#each importResult.deck.cards as deckCard}
                      <div class="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div class="flex items-center gap-3">
                          <span class="font-mono text-gray-600 dark:text-gray-400">{deckCard.count}x</span>
                          <div>
                            <p class="font-medium text-gray-900 dark:text-white">{deckCard.card.name}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{deckCard.card.rarity} {deckCard.card.type}</p>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Warnings -->
              {#if importResult.warnings.length > 0}
                <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warnings</p>
                      <ul class="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {#each importResult.warnings as warning}
                          <li>• {warning}</li>
                        {/each}
                      </ul>
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Confirm Button -->
              <button
                on:click={confirmImport}
                class="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
              >
                Add to My Decks
              </button>
            </div>

          {:else}
            <!-- Error -->
            <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-red-800 dark:text-red-200">Import Failed</p>
                  <ul class="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                    {#each importResult.errors as error}
                      <li>• {error}</li>
                    {/each}
                  </ul>
                </div>
              </div>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <button
          on:click={() => {
            deckCode = '';
            importResult = null;
            validationError = null;
          }}
          class="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm"
        >
          Clear Form
        </button>
        <button
          on:click={close}
          class="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
