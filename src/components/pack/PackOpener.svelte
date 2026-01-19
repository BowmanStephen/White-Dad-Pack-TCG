<script lang="ts">
  import { onMount } from 'svelte';
  import type { Pack, PackState, PackType, DadType, PackCard } from '@/types';
  import type { AppError } from '@lib/utils/errors';
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
    currentTearAnimation as currentTearAnimationStore,
  } from '@/stores/pack';
  import PackAnimation from './PackAnimation.svelte';
  import PackResults from './PackResults.svelte';
  import PackSkeleton from '../loading/PackSkeleton.svelte';
  import ErrorDisplay from '../common/ErrorDisplay.svelte';
  import ErrorMessage from '../common/ErrorMessage.svelte';
  import RateLimitBanner from './RateLimitBanner.svelte';


  // Reactive state using Svelte 5 runes
  let currentPack = $state<Pack | null>(null);
  let packState = $state<PackState>('idle');
  let currentCardIndex = $state<number>(0);
  let revealedCards = $state<Set<number>>(new Set());
  let packStats = $state<{
    totalCards: number;
    rarityBreakdown: Record<string, number>;
    holoCount: number;
    bestCard: PackCard;
  } | null>(null);
  let packError = $state<AppError | null>(null);
  let storageError = $state<AppError | null>(null);
  let currentTearAnimation = $state<'standard' | 'slow' | 'explosive'>('standard');

  // Track selected pack type (PACK-001)
  let selectedPackType: PackType = $state<PackType>('standard');
  let selectedThemeType: DadType | undefined = $state<DadType | undefined>();
  let showPackSelector = $state<boolean>(false);

  // Subscribe to Nanostores and sync to Svelte 5 state on mount
  onMount(() => {
    // Subscribe to all stores - this is the correct way to sync Nanostores with Svelte 5
    const unsubscribers = [
      packStore.subscribe((value) => { currentPack = value; }),
      packStateStore.subscribe((value) => { packState = value; }),
      currentCardIndexStore.subscribe((value) => { currentCardIndex = value; }),
      revealedCardsStore.subscribe((value) => { revealedCards = value; }),
      packStatsStore.subscribe((value) => { packStats = value; }),
      packErrorStore.subscribe((value) => { packError = value as AppError | null; }),
      storageErrorStore.subscribe((value) => { storageError = value as AppError | null; }),
      currentTearAnimationStore.subscribe((value) => { currentTearAnimation = value; }),
    ];

    // Start opening a pack with default settings
    openNewPack(selectedPackType, selectedThemeType);

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
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

  function handlePackTypeSelect(packType: PackType, themeType?: DadType) {
    selectedPackType = packType;
    selectedThemeType = themeType;
  }

  function handleOpenPack() {
    openNewPack(selectedPackType, selectedThemeType);
    showPackSelector = false;
  }

  function handleOpenAnother() {
    // Show pack selector for "Open Another"
    showPackSelector = true;
  }

  function handleGoHome() {
    window.location.href = '/';
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    // Prevent default behavior for navigation keys to avoid scrolling
    const navigationKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape'];
    if (navigationKeys.includes(event.key)) {
      event.preventDefault();
    }

    if (packState === 'cards_ready' || packState === 'revealing') {
      // Cancel auto-reveal on any keyboard interaction
      stopAutoReveal();

      switch (event.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
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
  <div class="fixed top-0 left-0 right-0 z-50 p-4" data-testid="error-message">
    <ErrorMessage error={storageError} compact={true} />
  </div>
{/if}

<!-- SEC-002: Rate limit banner (appears below storage warning) -->
<RateLimitBanner />

<div class="min-h-screen flex flex-col items-center justify-center p-4">
  <!-- PACK-028: Animation controls (skip/fast-forward) - top right -->
  <div class="fixed top-4 right-4 z-40">
    <AnimationControls />
  </div>

  <!-- Cinematic mode toggle (US083) - below animation controls -->
  <div class="fixed top-44 right-4 z-40">
    <CinematicToggle />
  </div>

  {#if showPackSelector}
    <!-- Pack type selector (PACK-001) -->
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Select Pack Type</h1>
        <p class="text-slate-400">Choose your pack style</p>
      </div>

      <PackTypeSelector
        onPackTypeSelect={handlePackTypeSelect}
        disabled={packState === 'generating'}
      />

      <div class="flex justify-center gap-4 mt-6">
        <button
          onclick={handleOpenPack}
          disabled={packState === 'generating'}
          class="btn-primary"
          type="button"
        >
          Open Pack
        </button>
        <button
          onclick={() => showPackSelector = false}
          class="btn-secondary"
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>

  {:else if packState === 'idle'}
    <!-- Idle state - waiting to open -->
    <div class="text-center">
      <div class="text-4xl mb-4">📦</div>
      <p class="text-slate-400">Ready to open a pack...</p>
    </div>

  {:else if packState === 'generating'}
    <!-- Generating state - pack skeleton with shimmer -->
    <PackSkeleton data-testid="pack-skeleton" />

  {:else if packError}
    <!-- Error state - use friendly error display -->
    <div data-testid="error-display">
      <ErrorDisplay
        error={packError}
        onDismiss={() => {
          packErrorStore.set(null);
        }}
      />
    </div>

  {:else if packState === 'pack_animate' && currentPack}
    <!-- Pack opening animation -->
    <PackAnimation
      data-testid="pack-animation"
      bestRarity={currentPack.bestRarity}
      design={currentPack.design}
      tearAnimation={currentTearAnimation}
      on:complete={completePackAnimationHandler}
      on:skip={skipToResultsHandler}
    />

  {:else if (packState === 'cards_ready' || packState === 'revealing') && currentPack}
    <!-- Card reveal phase -->
    <CardRevealer
      data-testid="card-revealer"
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
    <div class="results-container" data-testid="pack-results">
      <PackResults
        pack={currentPack}
        stats={packStats}
        on:openAnother={handleOpenAnother}
        on:goHome={handleGoHome}
      />
    </div>
  {/if}
</div>

<style>
  .results-container {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
