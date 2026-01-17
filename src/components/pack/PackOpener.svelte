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

  // Load initial values from stores
  function loadFromStores() {
    const values = getStoreValues();
    currentPack = values.currentPack;
    packState = values.packState;
    currentCardIndex = values.currentCardIndex;
    revealedCards = values.revealedCards;
    packStats = values.packStats;
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
  {#if packState === 'idle' || packState === 'generating'}
    <!-- Loading state -->
    <div class="text-center">
      <div class="text-4xl mb-4 animate-bounce">📦</div>
      <p class="text-slate-400">Preparing your pack...</p>
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
