<script lang="ts">
  import { onMount } from 'svelte';
  import type { Pack, PackState } from '../../types';
  import type { AppError } from '../../lib/utils/errors';
  import {
    openNewPack,
    completePackAnimation,
    skipToResults,
    stopAutoReveal,
    revealCurrentCard,
    nextCard,
    prevCard,
    resetPack,
    showResults,
    currentPack as packStore,
    packState as packStateStore,
    currentCardIndex as currentCardIndexStore,
    revealedCards as revealedCardsStore,
    packStats as packStatsStore,
    packError as packErrorStore,
    storageError as storageErrorStore,
  } from '../../stores/pack';
  import PackAnimation from './PackAnimation.svelte';
  import CardRevealer from './CardRevealer.svelte';
  import PackResults from './PackResults.svelte';
  import PackSkeleton from '../loading/PackSkeleton.svelte';
  import FadeIn from '../loading/FadeIn.svelte';
  import ErrorDisplay from '../common/ErrorDisplay.svelte';
  import ErrorMessage from '../common/ErrorMessage.svelte';
  import CinematicToggle from '../common/CinematicToggle.svelte';

  // Reactive state using Svelte 5 runes
  let currentPack = $state<Pack | null>(null);
  let packState = $state<PackState>('idle');
  let currentCardIndex = $state<number>(0);
  let revealedCards = $state<Set<number>>(new Set());
  let packStats = $state<any>(null);
  let packError = $state<AppError | null>(null);
  let storageError = $state<AppError | null>(null);

  // Auto-sync Nanostores to Svelte 5 state using $effect
  $effect(() => {
    currentPack = packStore.get();
  });

  $effect(() => {
    packState = packStateStore.get();
  });

  $effect(() => {
    currentCardIndex = currentCardIndexStore.get();
  });

  $effect(() => {
    revealedCards = revealedCardsStore.get();
  });

  $effect(() => {
    packStats = packStatsStore.get();
  });

  $effect(() => {
    packError = packErrorStore.get() as AppError | null;
  });

  $effect(() => {
    storageError = storageErrorStore.get() as AppError | null;
  });

  // Start pack opening on mount
  onMount(() => {
    openNewPack();
  });

  // Actions (reactivity is now automatic via $effect)
  function completePackAnimationHandler() {
    completePackAnimation();
  }

  function skipToResultsHandler() {
    stopAutoReveal();
    skipToResults();
  }

  function revealCurrentCardHandler() {
    revealCurrentCard();
  }

  function nextCardHandler() {
    nextCard();
  }

  function prevCardHandler() {
    prevCard();
  }

  function handleOpenAnother() {
    openNewPack();
  }

  function handleGoHome() {
    window.location.href = '/';
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (packState === 'cards_ready' || packState === 'revealing') {
      // Cancel auto-reveal on any keyboard interaction
      stopAutoReveal();

      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          if (!currentPack?.cards[currentCardIndex]?.isRevealed) {
            revealCurrentCardHandler();
          } else {
            nextCardHandler();
          }
          break;
        case 'ArrowLeft':
          prevCardHandler();
          break;
        case 'Escape':
          skipToResultsHandler();
          break;
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Live region for screen reader announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="pack-announcer" role="status">
  {#if packState === 'generating'}
    Generating your pack. Please wait.
  {:else if packState === 'pack_animate'}
    Opening pack. Get ready for your cards!
  {:else if packState === 'cards_ready'}
    Pack opened! {currentPack?.cards.length || 0} cards ready to reveal.
  {:else if packState === 'revealing'}
    Revealing card {currentCardIndex + 1} of {currentPack?.cards.length || 0}.
  {:else if packState === 'results'}
    All cards revealed! View your results.
  {:else if packState === 'idle'}
    Ready to open a pack.
  {/if}
</div>

<!-- Error announcement (assertive for immediate attention) -->
{#if packError}
  <div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert" id="error-announcer">
    Error: {packError.title}. {packError.message}
  </div>
{/if}

<!-- Storage warning (non-modal, appears at top) -->
{#if storageError && !packError}
  <div class="fixed top-0 left-0 right-0 z-50 p-4">
    <ErrorMessage error={storageError} compact={true} />
  </div>
{/if}

<div class="min-h-screen flex flex-col items-center justify-center p-4">
  <!-- Cinematic mode toggle (US083) -->
  <div class="fixed top-4 right-4 z-40">
    <CinematicToggle />
  </div>

  {#if packState === 'idle'}
    <!-- Idle state - waiting to open -->
    <div class="text-center">
      <div class="text-4xl mb-4">📦</div>
      <p class="text-slate-400">Ready to open a pack...</p>
    </div>

  {:else if packState === 'generating'}
    <!-- Generating state - pack skeleton with shimmer -->
    <PackSkeleton />

  {:else if packError}
    <!-- Error state - use friendly error display -->
    <ErrorDisplay
      error={packError}
      onDismiss={() => {
        packErrorStore.set(null);
      }}
    />

  {:else if packState === 'pack_animate' && currentPack}
    <!-- Pack opening animation -->
    <PackAnimation
      bestRarity={currentPack.bestRarity}
      design={currentPack.design}
      on:complete={completePackAnimationHandler}
      on:skip={skipToResultsHandler}
    />

  {:else if (packState === 'cards_ready' || packState === 'revealing') && currentPack}
    <!-- Card reveal phase -->
    <CardRevealer
      pack={currentPack}
      currentIndex={currentCardIndex}
      revealedIndices={revealedCards}
      on:reveal={revealCurrentCardHandler}
      on:next={nextCardHandler}
      on:prev={prevCardHandler}
      on:skip={skipToResultsHandler}
      on:results={() => {
        showResults();
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
