<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Pack } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import Card from '../card/Card.svelte';
  
  export let pack: Pack;
  export let currentIndex: number;
  export let revealedIndices: Set<number>;
  
  const dispatch = createEventDispatcher();
  
  $: currentCard = pack.cards[currentIndex];
  $: isCurrentRevealed = revealedIndices.has(currentIndex);
  $: progress = `${currentIndex + 1}/${pack.cards.length}`;
  $: allRevealed = revealedIndices.size >= pack.cards.length;
  $: rarityConfig = currentCard ? RARITY_CONFIG[currentCard.rarity] : RARITY_CONFIG.common;
  
  function handleCardClick() {
    if (!isCurrentRevealed) {
      dispatch('reveal');
    } else if (currentIndex < pack.cards.length - 1) {
      dispatch('next');
    } else {
      dispatch('results');
    }
  }
  
  function handlePrev() {
    dispatch('prev');
  }
  
  function handleNext() {
    if (!isCurrentRevealed) {
      dispatch('reveal');
    } else {
      dispatch('next');
    }
  }
  
  function handleSkip() {
    dispatch('skip');
  }
  
  // Touch handling for swipe
  let touchStartX = 0;
  let touchStartY = 0;
  
  function handleTouchStart(event: TouchEvent) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }
  
  function handleTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  }
</script>

<div 
  class="flex flex-col items-center gap-6 w-full max-w-lg"
  on:touchstart={handleTouchStart}
  on:touchend={handleTouchEnd}
>
  <!-- Progress indicator -->
  <div class="flex items-center gap-4 w-full">
    <div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
      <div 
        class="h-full bg-amber-500 transition-all duration-300"
        style="width: {((currentIndex + 1) / pack.cards.length) * 100}%;"
      ></div>
    </div>
    <span class="text-slate-400 text-sm font-mono">{progress}</span>
  </div>
  
  <!-- Card display -->
  <div 
    class="relative cursor-pointer"
    on:click={handleCardClick}
    on:keydown={(e) => e.key === ' ' && handleCardClick()}
    role="button"
    tabindex="0"
  >
    {#if currentCard}
      <!-- Rarity burst effect on reveal -->
      {#if isCurrentRevealed && (currentCard.rarity === 'legendary' || currentCard.rarity === 'mythic')}
        <div 
          class="absolute inset-0 rounded-xl animate-legendary-burst pointer-events-none"
          style="background: radial-gradient(circle, {rarityConfig.color}66 0%, transparent 70%);"
        ></div>
      {/if}
      
      <div class:animate-card-reveal={isCurrentRevealed}>
        <Card 
          card={currentCard}
          isFlipped={!isCurrentRevealed}
          size="lg"
          interactive={isCurrentRevealed}
        />
      </div>
    {/if}
    
    <!-- Tap hint -->
    {#if !isCurrentRevealed}
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="bg-black/50 px-4 py-2 rounded-lg text-white text-sm animate-pulse">
          Tap to reveal
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Navigation buttons -->
  <div class="flex items-center gap-4">
    <button 
      class="p-3 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      on:click={handlePrev}
      disabled={currentIndex === 0}
      aria-label="Previous card"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <button 
      class="px-6 py-3 rounded-lg font-bold transition-all"
      class:bg-amber-500={!isCurrentRevealed}
      class:hover:bg-amber-400={!isCurrentRevealed}
      class:bg-slate-700={isCurrentRevealed && currentIndex < pack.cards.length - 1}
      class:hover:bg-slate-600={isCurrentRevealed && currentIndex < pack.cards.length - 1}
      class:bg-green-500={isCurrentRevealed && currentIndex === pack.cards.length - 1}
      class:hover:bg-green-400={isCurrentRevealed && currentIndex === pack.cards.length - 1}
      on:click={handleCardClick}
    >
      {#if !isCurrentRevealed}
        Reveal Card
      {:else if currentIndex < pack.cards.length - 1}
        Next Card
      {:else}
        View Results
      {/if}
    </button>
    
    <button 
      class="p-3 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      on:click={handleNext}
      disabled={currentIndex === pack.cards.length - 1 && !isCurrentRevealed}
      aria-label="Next card"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
  
  <!-- Skip button -->
  <button 
    class="text-slate-500 hover:text-slate-300 text-sm transition-colors"
    on:click={handleSkip}
  >
    Skip to results
  </button>
  
  <!-- Card dots indicator -->
  <div class="flex gap-2">
    {#each pack.cards as card, i}
      {@const isRevealed = revealedIndices.has(i)}
      {@const isCurrent = i === currentIndex}
      {@const cardRarity = RARITY_CONFIG[card.rarity]}
      <button
        class="w-3 h-3 rounded-full transition-all"
        class:scale-125={isCurrent}
        style="
          background: {isRevealed ? cardRarity.color : '#475569'};
          box-shadow: {isCurrent ? `0 0 10px ${isRevealed ? cardRarity.color : '#475569'}` : 'none'};
        "
        on:click={() => dispatch('next') /* TODO: implement goToCard */}
        aria-label="Card {i + 1}"
      ></button>
    {/each}
  </div>
</div>

<style>
  .animate-card-reveal {
    animation: cardReveal 0.6s ease-out;
  }
  
  @keyframes cardReveal {
    0% {
      transform: scale(0.9);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .animate-legendary-burst {
    animation: legendaryBurst 0.8s ease-out forwards;
  }
  
  @keyframes legendaryBurst {
    0% {
      transform: scale(0.5);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
</style>
