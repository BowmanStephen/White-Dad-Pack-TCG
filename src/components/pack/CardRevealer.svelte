<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import type { Pack } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import Card from '../card/Card.svelte';
  import CardSkeleton from '../loading/CardSkeleton.svelte';
  import ParticleEffects from '../card/ParticleEffects.svelte';
  import FadeIn from '../loading/FadeIn.svelte';
  import { playCardReveal, playCinematicCardReveal } from '../../stores/audio';
  import ConfettiEffects from '../card/ConfettiEffects.svelte';
  import ScreenShake from '../card/ScreenShake.svelte';
  import * as uiStore from '../../stores/ui';

  export let pack: Pack;
  export let currentIndex: number;
  export let revealedIndices: Set<number>;

  const dispatch = createEventDispatcher();

  $: currentCard = pack.cards[currentIndex];
  $: isCurrentRevealed = revealedIndices.has(currentIndex);
  $: progress = `${currentIndex + 1}/${pack.cards.length}`;
  $: allRevealed = revealedIndices.size >= pack.cards.length;
  $: rarityConfig = currentCard ? RARITY_CONFIG[currentCard.rarity] : RARITY_CONFIG.common;

  // Cinematic mode configuration
  $: cinematicConfig = uiStore.getCinematicConfig();
  $: isCinematic = uiStore.$cinematicMode === 'cinematic';

  // Camera zoom state for cinematic reveals
  let cameraZoomActive = false;
  let cardScale = 1;

  let autoRevealActive = false;
  let particlesActive = false;
  let confettiActive = false;
  let screenShakeActive = false;
  let autoRevealTimers: number[] = [];

  // Debounced reveal using requestAnimationFrame for smoother 60fps
  let rafId: number | null = null;

  // Calculate reveal delay based on cinematic mode
  $: revealDelay = 300 / cinematicConfig.speedMultiplier;

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

        // Activate camera zoom for cinematic mode (except common/uncommon)
        if (cinematicConfig.zoomEnabled && ['rare', 'epic', 'legendary', 'mythic'].includes(cardRarity)) {
          cameraZoomActive = true;
          // Zoom in dramatically
          cardScale = cardRarity === 'mythic' || cardRarity === 'legendary' ? 1.3 : 1.15;
          // Reset zoom after animation
          setTimeout(() => {
            cameraZoomActive = false;
            cardScale = 1;
          }, 800 / cinematicConfig.speedMultiplier);
        }

        // Activate confetti for legendary+ cards (enhanced in cinematic)
        if (cardRarity === 'legendary' || cardRarity === 'mythic') {
          confettiActive = true;
          const confettiDuration = cinematicConfig.audioEnhanced ? 5000 : 3500;
          setTimeout(() => { confettiActive = false; }, confettiDuration / cinematicConfig.speedMultiplier);
        }

        // Activate screen shake for mythic cards only (epic moment!)
        if (cardRarity === 'mythic') {
          screenShakeActive = true;
          const shakeDuration = cinematicConfig.audioEnhanced ? 500 : 300;
          setTimeout(() => { screenShakeActive = false; }, shakeDuration);
        }

        // Play reveal sound based on card rarity (enhanced in cinematic)
        if (cardRarity) {
          if (cinematicConfig.audioEnhanced) {
            playCinematicCardReveal(cardRarity);
          } else {
            playCardReveal(cardRarity);
          }
        }

        dispatch('reveal');
        index++;

        // Use requestAnimationFrame for smoother timing (60fps aligned)
        rafId = requestAnimationFrame(() => {
          // Schedule next reveal after delay (slower in cinematic mode)
          if (index < pack.cards.length) {
            const timerId = window.setTimeout(revealNext, revealDelay);
            autoRevealTimers.push(timerId);
          } else {
            autoRevealActive = false;
          }
        });
      }
    };

    // Start the sequence with RAF for smooth initial timing
    rafId = requestAnimationFrame(() => {
      const timerId = window.setTimeout(revealNext, revealDelay);
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
    // Reset camera zoom
    cameraZoomActive = false;
    cardScale = 1;
  }

  function handleCardClick() {
    // Cancel auto-reveal on user interaction
    stopAutoRevealSequence();

    if (!isCurrentRevealed) {
      particlesActive = true;
      const cardRarity = currentCard?.rarity;

      // Activate camera zoom for cinematic mode
      if (cinematicConfig.zoomEnabled && ['rare', 'epic', 'legendary', 'mythic'].includes(cardRarity)) {
        cameraZoomActive = true;
        cardScale = cardRarity === 'mythic' || cardRarity === 'legendary' ? 1.3 : 1.15;
        setTimeout(() => {
          cameraZoomActive = false;
          cardScale = 1;
        }, 800 / cinematicConfig.speedMultiplier);
      }

      // Activate confetti for legendary+ cards (enhanced in cinematic)
      if (cardRarity === 'legendary' || cardRarity === 'mythic') {
        confettiActive = true;
        const confettiDuration = cinematicConfig.audioEnhanced ? 5000 : 3500;
        setTimeout(() => { confettiActive = false; }, confettiDuration / cinematicConfig.speedMultiplier);
      }

      // Activate screen shake for mythic cards only (epic moment!)
      if (cardRarity === 'mythic') {
        screenShakeActive = true;
        const shakeDuration = cinematicConfig.audioEnhanced ? 500 : 300;
        setTimeout(() => { screenShakeActive = false; }, shakeDuration);
      }

      // Play reveal sound based on card rarity (cinematic enhanced)
      if (cardRarity) {
        if (cinematicConfig.audioEnhanced) {
          playCinematicCardReveal(cardRarity);
        } else {
          playCardReveal(cardRarity);
        }
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

      // Activate camera zoom for cinematic mode
      if (cinematicConfig.zoomEnabled && ['rare', 'epic', 'legendary', 'mythic'].includes(cardRarity)) {
        cameraZoomActive = true;
        cardScale = cardRarity === 'mythic' || cardRarity === 'legendary' ? 1.3 : 1.15;
        setTimeout(() => {
          cameraZoomActive = false;
          cardScale = 1;
        }, 800 / cinematicConfig.speedMultiplier);
      }

      // Activate confetti for legendary+ cards (enhanced in cinematic)
      if (cardRarity === 'legendary' || cardRarity === 'mythic') {
        confettiActive = true;
        const confettiDuration = cinematicConfig.audioEnhanced ? 5000 : 3500;
        setTimeout(() => { confettiActive = false; }, confettiDuration / cinematicConfig.speedMultiplier);
      }

      // Activate screen shake for mythic cards only (epic moment!)
      if (cardRarity === 'mythic') {
        screenShakeActive = true;
        const shakeDuration = cinematicConfig.audioEnhanced ? 500 : 300;
        setTimeout(() => { screenShakeActive = false; }, shakeDuration);
      }

      // Play reveal sound based on card rarity (cinematic enhanced)
      if (cardRarity) {
        if (cinematicConfig.audioEnhanced) {
          playCinematicCardReveal(cardRarity);
        } else {
          playCardReveal(cardRarity);
        }
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
      <!-- Screen shake effect for mythic cards -->
      <ScreenShake active={screenShakeActive} intensity="subtle" duration={300} />

      <!-- Cinematic camera zoom effect (dramatic scale animation) -->
      {#if cameraZoomActive && isCurrentRevealed}
        <div
          class="absolute inset-0 pointer-events-none transition-transform ease-out"
          class:animate-cinematic-zoom={true}
          style="transform: scale({cardScale}); transform-origin: center center;"
        ></div>
      {/if}

      <!-- Card skeleton while loading (before reveal) -->
      {#if !isCurrentRevealed}
        <CardSkeleton size="lg" rarity={currentCard.rarity} />
      {:else}
        <!-- FadeIn wrapper for smooth reveal (slower in cinematic mode) -->
        <FadeIn duration={300 / cinematicConfig.speedMultiplier}>
          <!-- Confetti effects for legendary+ cards (enhanced in cinematic) -->
          <ConfettiEffects rarity={currentCard.rarity} active={confettiActive} />

          <!-- Rarity-specific particle effects on reveal (enhanced in cinematic) -->
          <ParticleEffects
            rarity={currentCard.rarity}
            active={particlesActive}
            duration={1500 / cinematicConfig.speedMultiplier}
          />

          <!-- Legendary/Mythic burst effect -->
          {#if currentCard.rarity === 'legendary' || currentCard.rarity === 'mythic'}
            <div
              class="absolute inset-0 rounded-xl animate-legendary-burst pointer-events-none"
              class:animate-cinematic-burst={isCinematic}
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

  /* Cinematic camera zoom animation (US083) */
  .animate-cinematic-zoom {
    animation: cinematicZoom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    will-change: transform;
  }

  @keyframes cinematicZoom {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1.3);
    }
  }

  /* Enhanced burst animation for cinematic mode */
  .animate-cinematic-burst {
    animation: cinematicBurst 1.2s ease-out forwards;
  }

  @keyframes cinematicBurst {
    0% {
      transform: scale(0.5);
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      transform: scale(3);
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
