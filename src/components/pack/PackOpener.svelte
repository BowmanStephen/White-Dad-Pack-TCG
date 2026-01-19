<script lang="ts">
  import { onMount } from 'svelte';
  import type { Pack, PackState, PackCard } from '@/types';
  import type { AppError } from '@lib/utils/errors';
  import {
    openNewPack,
    completePackAnimation,
    skipToResults,
    resetPack,
    currentPack as packStore,
    packState as packStateStore,
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
  let packStats = $state<{
    totalCards: number;
    rarityBreakdown: Record<string, number>;
    holoCount: number;
    bestCard: PackCard;
  } | null>(null);
  let packError = $state<AppError | null>(null);
  let storageError = $state<AppError | null>(null);
  let currentTearAnimation = $state<'standard' | 'slow' | 'explosive'>('standard');

  // MVP vertical slice: fixed pack settings

  // Subscribe to Nanostores and sync to Svelte 5 state on mount
  onMount(() => {
    // Subscribe to all stores - this is the correct way to sync Nanostores with Svelte 5
    const unsubscribers = [
      packStore.subscribe((value) => { currentPack = value; }),
      packStateStore.subscribe((value) => { packState = value; }),
      packStatsStore.subscribe((value) => { packStats = value; }),
      packErrorStore.subscribe((value) => { packError = value as AppError | null; }),
      storageErrorStore.subscribe((value) => { storageError = value as AppError | null; }),
      currentTearAnimationStore.subscribe((value) => { currentTearAnimation = value; }),
    ];

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  });

  // Actions
  function completePackAnimationHandler() {
    completePackAnimation();
  }

  function skipToResultsHandler() {
    skipToResults();
  }


  function handleGoHome() {
    window.location.href = '/';
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    const navigationKeys = [' ', 'Enter', 'Escape'];
    if (navigationKeys.includes(event.key)) {
      event.preventDefault();
    }

    // MVP vertical slice: skip out of the tear animation
    if (packState === 'pack_animate') {
      if (event.key === ' ' || event.key === 'Enter' || event.key === 'Escape') {
        skipToResultsHandler();
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
    {:else if packState === 'results'}
      Pack opened! View your results.
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

  {#if packState === 'idle'}
    <!-- Idle state (MVP): clear CTA to open a pack -->
    <div class="w-full max-w-md text-center">
      <div class="mb-8">
        <div class="text-5xl mb-4">📦</div>
        <h1 class="text-3xl font-black tracking-tight text-white">Open a Pack</h1>
        <p class="text-slate-400 mt-2">One tear. One reveal. Then your full results.</p>
      </div>

      <button
        onclick={() => openNewPack()}
        class="btn-primary w-full"
        type="button"
      >
        Open Pack
      </button>

      <div class="mt-4 text-xs text-slate-500">
        Tip: press Space/Enter to skip the tear.
      </div>
    </div>

  {:else if packState === 'generating'}
    <PackSkeleton />

  {:else if packError}
    <div data-testid="error-display">
      <ErrorDisplay
        error={packError}
        onDismiss={() => {
          packErrorStore.set(null);
        }}
      />
    </div>

  {:else if packState === 'pack_animate' && currentPack}
    <PackAnimation
      bestRarity={currentPack.bestRarity}
      design={currentPack.design}
      tearAnimation={currentTearAnimation}
      on:complete={completePackAnimationHandler}
      on:skip={skipToResultsHandler}
    />

  {:else if packState === 'results' && currentPack && packStats}
    <div class="results-container">
      <PackResults
        pack={currentPack}
        stats={packStats}
        on:openAnother={() => {
          resetPack();
        }}
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
