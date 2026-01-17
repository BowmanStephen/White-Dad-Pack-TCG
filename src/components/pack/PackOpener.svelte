<script lang="ts">
  import { onMount } from 'svelte';
  import type { Pack, PackState } from '../../types';
  import { getStoreValues } from '../../lib/stores/svelte-helpers';
  import PackAnimation from './PackAnimation.svelte';
  import CardRevealer from './CardRevealer.svelte';
  import PackResults from './PackResults.svelte';

  // Reactive state using Svelte 5 runes
  let currentPack = $state<Pack | null>(null);
  let packState = $state<PackState>('idle');
  let currentCardIndex = $state<number>(0);
  let revealedCards = $state<Set<number>>(new Set());
  let packStats = $state<any>(null);
  let packError = $state<string | null>(null);

  // Load initial values from stores
  function loadFromStores() {
    const values = getStoreValues();
    currentPack = values.currentPack;
    packState = values.packState;
    currentCardIndex = values.currentCardIndex;
    revealedCards = values.revealedCards;
    packStats = values.packStats;
    packError = values.packError ?? null;
  }

  // Start pack opening on mount
  onMount(() => {
    // Import dynamically to avoid SSR issues
    import('../../stores/pack').then(({ openNewPack }) => {
      openNewPack();

      // Subscribe to store changes
      const unsubscribe = import('../../lib/stores/svelte-helpers').then(({ subscribeToStores }) => {
        return subscribeToStores((values) => {
          loadFromStores();
        });
      });

      return () => {
        unsubscribe.then(unsub => unsub());
      };
    });
  });

  // Actions
  function completePackAnimation() {
    import('../../stores/pack').then(({ completePackAnimation }) => {
      completePackAnimation();
      loadFromStores();
    });
  }

  function skipToResults() {
    import('../../stores/pack').then(({ skipToResults, stopAutoReveal }) => {
      stopAutoReveal();
      skipToResults();
      loadFromStores();
    });
  }

  function revealCurrentCard() {
    import('../../stores/pack').then(({ revealCurrentCard }) => {
      revealCurrentCard();
      loadFromStores();
    });
  }

  function nextCard() {
    import('../../stores/pack').then(({ nextCard }) => {
      nextCard();
      loadFromStores();
    });
  }

  function prevCard() {
    import('../../stores/pack').then(({ prevCard }) => {
      prevCard();
      loadFromStores();
    });
  }

  function handleOpenAnother() {
    import('../../stores/pack').then(({ openNewPack }) => {
      openNewPack();
      setTimeout(() => loadFromStores(), 150);
    });
  }

  function handleGoHome() {
    window.location.href = '/';
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (packState === 'cards_ready' || packState === 'revealing') {
      // Cancel auto-reveal on any keyboard interaction
      import('../../stores/pack').then(({ stopAutoReveal }) => {
        stopAutoReveal();
      });

      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          if (!currentPack?.cards[currentCardIndex]?.isRevealed) {
            revealCurrentCard();
          } else {
            nextCard();
          }
          break;
        case 'ArrowLeft':
          prevCard();
          break;
        case 'Escape':
          skipToResults();
          break;
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen flex flex-col items-center justify-center p-4">
  {#if packState === 'idle'}
    <!-- Idle state - waiting to open -->
    <div class="text-center">
      <div class="text-4xl mb-4">📦</div>
      <p class="text-slate-400">Ready to open a pack...</p>
    </div>

  {:else if packState === 'generating'}
    <!-- Generating state - loading spinner -->
    <div class="text-center">
      <!-- CSS Spinner -->
      <div class="relative w-16 h-16 mx-auto mb-6">
        <div class="absolute inset-0 rounded-full border-4 border-slate-700"></div>
        <div class="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <!-- Pack icon in center -->
        <div class="absolute inset-0 flex items-center justify-center text-2xl">📦</div>
      </div>
      <p class="text-slate-300 text-lg mb-2">Generating your pack...</p>
      <p class="text-slate-500 text-sm">Rolling for rarities...</p>
    </div>

  {:else if packError}
    <!-- Error state -->
    <div class="text-center max-w-md">
      <div class="text-5xl mb-4">⚠️</div>
      <h2 class="text-xl text-red-400 mb-2">Pack Generation Failed</h2>
      <p class="text-slate-400 mb-6">{packError}</p>
      <button
        onclick={handleOpenAnother}
        class="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>

  {:else if packState === 'pack_animate' && currentPack}
    <!-- Pack opening animation -->
    <PackAnimation
      bestRarity={currentPack.bestRarity}
      on:complete={completePackAnimation}
      on:skip={skipToResults}
    />

  {:else if (packState === 'cards_ready' || packState === 'revealing') && currentPack}
    <!-- Card reveal phase -->
    <CardRevealer
      pack={currentPack}
      currentIndex={currentCardIndex}
      revealedIndices={revealedCards}
      on:reveal={revealCurrentCard}
      on:next={nextCard}
      on:prev={prevCard}
      on:skip={skipToResults}
      on:results={() => {
        import('../../stores/pack').then(({ showResults }) => {
          showResults();
          loadFromStores();
        });
      }}
    />

  {:else if packState === 'results' && currentPack && packStats}
    <!-- Results screen -->
    <PackResults
      pack={currentPack}
      stats={packStats}
      on:openAnother={handleOpenAnother}
      on:goHome={handleGoHome}
    />
  {/if}
</div>
