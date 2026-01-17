<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    $currentPack as currentPack,
    $packState as packState,
    $currentCardIndex as currentCardIndex,
    $revealedCards as revealedCards,
    $allCardsRevealed as allCardsRevealed,
    $packStats as packStats,
    openNewPack,
    completePackAnimation,
    revealCurrentCard,
    nextCard,
    prevCard,
    skipToResults,
    resetPack,
    showResults
  } from '../../stores/pack';
  import PackAnimation from './PackAnimation.svelte';
  import CardRevealer from './CardRevealer.svelte';
  import PackResults from './PackResults.svelte';
  
  // Start pack opening on mount
  onMount(() => {
    openNewPack();
  });
  
  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if ($packState === 'cards_ready' || $packState === 'revealing') {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          if (!$currentPack?.cards[$currentCardIndex]?.isRevealed) {
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
  
  function handleOpenAnother() {
    openNewPack();
  }
  
  function handleGoHome() {
    window.location.href = '/';
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen flex flex-col items-center justify-center p-4">
  {#if $packState === 'idle' || $packState === 'generating'}
    <!-- Loading state -->
    <div class="text-center">
      <div class="text-4xl mb-4 animate-bounce">📦</div>
      <p class="text-slate-400">Preparing your pack...</p>
    </div>
    
  {:else if $packState === 'pack_animate'}
    <!-- Pack opening animation -->
    <PackAnimation 
      on:complete={completePackAnimation}
      on:skip={skipToResults}
      bestRarity={$currentPack?.bestRarity || 'common'}
    />
    
  {:else if $packState === 'cards_ready' || $packState === 'revealing'}
    <!-- Card reveal phase -->
    {#if $currentPack}
      <CardRevealer 
        pack={$currentPack}
        currentIndex={$currentCardIndex}
        revealedIndices={$revealedCards}
        on:reveal={revealCurrentCard}
        on:next={nextCard}
        on:prev={prevCard}
        on:skip={skipToResults}
        on:results={showResults}
      />
    {/if}
    
  {:else if $packState === 'results'}
    <!-- Results screen -->
    {#if $currentPack && $packStats}
      <PackResults 
        pack={$currentPack}
        stats={$packStats}
        on:openAnother={handleOpenAnother}
        on:goHome={handleGoHome}
      />
    {/if}
  {/if}
</div>
