<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import type { Pack } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import Card from '../card/Card.svelte';
  import CardSkeleton from '../loading/CardSkeleton.svelte';
  import ParticleEffects from '../card/ParticleEffects.svelte';
  import FadeIn from '../loading/FadeIn.svelte';
  import { playCardReveal } from '../../stores/audio';
  import ConfettiEffects from '../card/ConfettiEffects.svelte';

  export let pack: Pack;
  export let currentIndex: number;
  export let revealedIndices: Set<number>;

  const dispatch = createEventDispatcher();

  $: currentCard = pack.cards[currentIndex];
  $: isCurrentRevealed = revealedIndices.has(currentIndex);
  $: progress = `${currentIndex + 1}/${pack.cards.length}`;
  $: allRevealed = revealedIndices.size >= pack.cards.length;
  $: rarityConfig = currentCard ? RARITY_CONFIG[currentCard.rarity] : RARITY_CONFIG.common;

  let autoRevealActive = false;
  let particlesActive = false;
  let confettiActive = false;
  let autoRevealTimers: number[] = [];

  // Debounced reveal using requestAnimationFrame for smoother 60fps
  let rafId: number | null = null;

  // Start auto-reveal when component mounts and cards are ready
  onMount(() => {
    if (!isCurrentRevealed) {
      startAutoRevealSequence();
    }
  });

  onDestroy(() => {
    stopAutoRevealSequence();
    // Cleanup any pending RAF
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  });

  function startAutoRevealSequence() {
    autoRevealActive = true;
    let index = currentIndex;

    const revealNext = () => {
      if (!autoRevealActive || index >= pack.cards.length) {
        autoRevealActive = false;
        return;
      }

      if (!revealedIndices.has(index)) {
        particlesActive = true;
        const cardRarity = pack.cards[index]?.rarity;
        // Activate confetti for legendary+ cards
        if (cardRarity === 'legendary' || cardRarity === 'mythic') {
          confettiActive = true;
          // Auto-deactivate confetti after animation (handled internally by component)
          setTimeout(() => { confettiActive = false; }, 3500);
        }
        // Play reveal sound based on card rarity
        if (cardRarity) {
          playCardReveal(cardRarity);
        }
        dispatch('reveal');
        index++;

        // Use requestAnimationFrame for smoother timing (60fps aligned)
        rafId = requestAnimationFrame(() => {
          // Schedule next reveal after delay
          if (index < pack.cards.length) {
            const timerId = window.setTimeout(revealNext, 300);
            autoRevealTimers.push(timerId);
          } else {
            autoRevealActive = false;
          }
        });
      }
    };

    // Start the sequence with RAF for smooth initial timing
    rafId = requestAnimationFrame(() => {
      const timerId = window.setTimeout(revealNext, 300);
      autoRevealTimers.push(timerId);
    });
  }

  function stopAutoRevealSequence() {
    autoRevealActive = false;
    // Clear all pending timers
    autoRevealTimers.forEach(timerId => clearTimeout(timerId));
    autoRevealTimers = [];
    // Cancel pending RAF
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function handleCardClick() {
    // Cancel auto-reveal on user interaction
    stopAutoRevealSequence();

    if (!isCurrentRevealed) {
      particlesActive = true;
      const cardRarity = currentCard?.rarity;
      // Activate confetti for legendary+ cards
      if (cardRarity === 'legendary' || cardRarity === 'mythic') {
        confettiActive = true;
        setTimeout(() => { confettiActive = false; }, 3500);
      }
      // Play reveal sound based on card rarity
      if (cardRarity) {
        playCardReveal(cardRarity);
      }
      dispatch('reveal');
    } else if (currentIndex < pack.cards.length - 1) {
      dispatch('next');
    } else {
      dispatch('results');
    }
  }

  function handlePrev() {
    stopAutoRevealSequence();
    dispatch('prev');
  }

  function handleNext() {
    stopAutoRevealSequence();
    if (!isCurrentRevealed) {
      particlesActive = true;
      const cardRarity = currentCard?.rarity;
      // Activate confetti for legendary+ cards
      if (cardRarity === 'legendary' || cardRarity === 'mythic') {
        confettiActive = true;
        setTimeout(() => { confettiActive = false; }, 3500);
      }
      // Play reveal sound based on card rarity
      if (cardRarity) {
        playCardReveal(cardRarity);
      }
      dispatch('reveal');
    } else {
      dispatch('next');
    }
  }

  function handleSkip() {
    stopAutoRevealSequence();
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
    // Cancel auto-reveal on touch interaction
    stopAutoRevealSequence();

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
      <!-- Card skeleton while loading (before reveal) -->
      {#if !isCurrentRevealed}
        <CardSkeleton size="lg" rarity={currentCard.rarity} />
      {:else}
        <!-- FadeIn wrapper for smooth reveal -->
        <FadeIn duration={300}>
          <!-- Confetti effects for legendary+ cards -->
          <ConfettiEffects rarity={currentCard.rarity} active={confettiActive} />

          <!-- Rarity-specific particle effects on reveal -->
          <ParticleEffects
            rarity={currentCard.rarity}
            active={particlesActive}
            duration={1500}
          />

          <!-- Legendary/Mythic burst effect -->
          {#if currentCard.rarity === 'legendary' || currentCard.rarity === 'mythic'}
            <div
              class="absolute inset-0 rounded-xl animate-legendary-burst pointer-events-none"
              style="background: radial-gradient(circle, {rarityConfig.color}66 0%, transparent 70%);"
            ></div>
          {/if}

          <div class:animate-card-reveal={true}>
            <Card
              card={currentCard}
              isFlipped={false}
              size="lg"
              interactive={true}
            />
          </div>
        </FadeIn>
      {/if}
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
      class="p-3 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-[48px] min-h-[48px]"
      on:click={handlePrev}
      disabled={currentIndex === 0}
      aria-label="Previous card"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button
      class="px-6 py-3 rounded-lg font-bold transition-all min-h-[48px]"
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
      class="p-3 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-w-[48px] min-h-[48px]"
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
    class="min-h-[44px] px-4 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
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
        class="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-all flex items-center justify-center"
        class:scale-110={isCurrent}
        style="
          background: {isRevealed ? cardRarity.color : '#475569'};
          box-shadow: {isCurrent ? `0 0 10px ${isRevealed ? cardRarity.color : '#475569'}` : 'none'};
        "
        on:click={() => dispatch('next') /* TODO: implement goToCard */}
        aria-label="Card {i + 1}"
      >
        <span class="w-3 h-3 rounded-full block" style="
          background: {isRevealed ? cardRarity.color : '#475569'};
        "></span>
      </button>
    {/each}
  </div>
</div>

<style>
  .animate-card-reveal {
    animation: cardReveal 0.6s ease-out;
    will-change: transform;
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
    will-change: transform, opacity;
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

  /* GPU acceleration for card container */
  .relative.cursor-pointer {
    transform: translateZ(0);
  }

  /* Optimize progress bar animation */
  .transition-all.duration-300 {
    will-change: width;
  }
</style>
