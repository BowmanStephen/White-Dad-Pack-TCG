<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import type { Pack } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import Card from '../card/Card.svelte';
  import CardSkeleton from '../loading/CardSkeleton.svelte';
  import ParticleEffects from '../card/ParticleEffects.svelte';
  import FadeIn from '../loading/FadeIn.svelte';
  import { playCardReveal, playCinematicCardReveal, playNewDiscoverySound } from '../../stores/audio';
  import ConfettiEffects from '../card/ConfettiEffects.svelte';
  import ScreenShake from '../card/ScreenShake.svelte';
  import NewBadge from '../card/NewBadge.svelte';
  import * as uiStore from '../../stores/ui';
  import { markCardAsDiscovered, discoveryProgressText } from '../../stores/discovered';
  import { fastForward } from '../../stores/ui';

  export let pack: Pack;
  export let currentIndex: number;
  export let revealedIndices: Set<number>;

  const dispatch = createEventDispatcher();

  $: currentCard = pack.cards[currentIndex];
  $: isCurrentRevealed = revealedIndices.has(currentIndex);
  $: progress = `${currentIndex + 1}/${pack.cards.length}`;
  $: allRevealed = revealedIndices.size >= pack.cards.length;
  $: rarityConfig = currentCard ? RARITY_CONFIG[currentCard.rarity] : RARITY_CONFIG.common;

  // PACK-025: Track new discoveries for first-time pull effects
  let isNewDiscovery = false;
  let showNewBadge = false;

  // Screen reader announcement for card reveals
  let announcement = '';
  $: if (isCurrentRevealed && currentCard) {
    const holoText = currentCard.isHolo ? ` holographic${currentCard.holoType !== 'standard' ? ' ' + currentCard.holoType : ''}` : '';
    announcement = `Card ${currentIndex + 1} of ${pack.cards.length}: ${currentCard.name}, ${RARITY_CONFIG[currentCard.rarity].name}${holoText}. ${currentCard.subtitle || ''}`;
  }

  // Cinematic mode configuration
  $: cinematicConfig = uiStore.getCinematicConfig();
  $: isCinematic = uiStore.$cinematicMode.get() === 'cinematic';

  // Camera zoom state for cinematic reveals
  let cameraZoomActive = false;
  let cardScale = 1;

  let autoRevealActive = false;
  let particlesActive = false;
  let confettiActive = false;
  let screenShakeActive = false;
  let discoveryConfettiActive = false; // PACK-025: Separate confetti for new discoveries
  let autoRevealTimers: number[] = [];

  // Debounced reveal using requestAnimationFrame for smoother 60fps
  let rafId: number | null = null;

  // PACK-026: Calculate reveal delay based on rarity (longer for rarer cards)
  // PACK-028: Apply fast-forward multiplier (2x speed when enabled)
  $: baseDelay = 300;
  $: rarityDelay = currentCard ? {
    common: 300,
    uncommon: 400,
    rare: 600,
    epic: 800,
    legendary: 1000,
    mythic: 1500,
  }[currentCard.rarity] || 300 : 300;
  $: fastForwardMultiplier = $fastForward ? 2 : 1;
  $: revealDelay = rarityDelay / (cinematicConfig.speedMultiplier * fastForwardMultiplier);

  // PACK-026: Animation class based on rarity
  $: revealAnimationClass = currentCard ? {
    common: 'animate-reveal-common',
    uncommon: 'animate-reveal-uncommon',
    rare: 'animate-reveal-rare',
    epic: 'animate-reveal-epic',
    legendary: 'animate-reveal-legendary',
    mythic: 'animate-reveal-mythic',
  }[currentCard.rarity] || 'animate-reveal-common' : 'animate-reveal-common';

  // PACK-025: Check and track new discovery
  function checkNewDiscovery(card: typeof currentCard): boolean {
    if (!card) return false;
    const newlyDiscovered = markCardAsDiscovered(card);
    if (newlyDiscovered) {
      isNewDiscovery = true;
      showNewBadge = true;
      // Trigger discovery confetti burst (separate from rarity confetti)
      discoveryConfettiActive = true;
      setTimeout(() => { discoveryConfettiActive = false; }, 3000);
      // PACK-025: Play celebratory "ding!" sound for new discovery
      playNewDiscoverySound();
    } else {
      isNewDiscovery = false;
      showNewBadge = false;
    }
    return newlyDiscovered;
  }

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
        const card = pack.cards[index];
        const cardRarity = card?.rarity;

        // PACK-025: Check for new discovery and trigger effects
        if (card) {
          checkNewDiscovery(card);
        }

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
      const card = currentCard;
      const cardRarity = card?.rarity;

      // PACK-025: Check for new discovery and trigger effects
      if (card) {
        checkNewDiscovery(card);
      }

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
      const card = currentCard;
      const cardRarity = card?.rarity;

      // PACK-025: Check for new discovery and trigger effects
      if (card) {
        checkNewDiscovery(card);
      }

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
  let touchStartTime = 0;
  let isSwipe = false;
  let isTap = false;

  function handleTouchStart(event: TouchEvent) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
    isSwipe = false;
    isTap = false;
  }

  function handleTouchMove(event: TouchEvent) {
    // Detect if user is swiping (moved more than 10px in any direction)
    const deltaX = Math.abs(event.touches[0].clientX - touchStartX);
    const deltaY = Math.abs(event.touches[0].clientY - touchStartY);

    if (deltaX > 10 || deltaY > 10) {
      isSwipe = true;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    // Cancel auto-reveal on touch interaction
    stopAutoRevealSequence();

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const deltaTime = Date.now() - touchStartTime;

    // Detect tap (short duration, minimal movement)
    if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      isTap = true;
      handleCardClick();
      return;
    }

    // Handle swipes (movement > 50px)
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe - navigate cards
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
    } else {
      // Vertical swipe - swipe up to skip all reveals
      if (deltaY < -minSwipeDistance) {
        handleSkip();
      }
    }
  }

  function handleCardNavigatorClick(cardIndex: number) {
    // Cancel auto-reveal when user clicks a card navigator dot
    stopAutoRevealSequence();

    // Dispatch event to navigate to the specific card
    dispatch('goToCard', { cardIndex });
  }
</script>

<!-- Live region for screen reader announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only" role="status">
  {announcement}
</div>

<div
  class="flex flex-col items-center gap-6 w-full max-w-lg"
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
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
    <!-- PACK-025: Discovery progress -->
    <span class="text-slate-400 text-sm font-mono">{$discoveryProgressText}</span>
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
          <!-- PACK-025: Discovery confetti burst for first-time pulls -->
          {#if isNewDiscovery}
            <ConfettiEffects rarity="legendary" active={discoveryConfettiActive} />
          {/if}

          <!-- Confetti effects for legendary+ cards (enhanced in cinematic) -->
          <ConfettiEffects rarity={currentCard.rarity} active={confettiActive} />

          <!-- Rarity-specific particle effects on reveal (enhanced in cinematic) -->
          <ParticleEffects
            rarity={currentCard.rarity}
            active={particlesActive}
            duration={1500 / cinematicConfig.speedMultiplier}
          />

          <!-- PACK-025: NEW! badge for first-time discoveries -->
          {#if currentCard}
            <NewBadge card={currentCard} show={showNewBadge} delay={200} />
          {/if}

          <!-- Legendary/Mythic burst effect -->
          {#if currentCard.rarity === 'legendary' || currentCard.rarity === 'mythic'}
            <div
              class="absolute inset-0 rounded-xl animate-legendary-burst pointer-events-none"
              class:animate-cinematic-burst={isCinematic}
              style="background: radial-gradient(circle, {rarityConfig.color}66 0%, transparent 70%);"
            ></div>
          {/if}

          <!-- PACK-026: Rarity-specific reveal animation -->
          <div class={revealAnimationClass}>
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

  <!-- PACK-028: Animation control buttons -->
  <div class="flex flex-col items-center gap-3">
    <!-- Fast-forward toggle button -->
    <button
      class="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg transition-colors {$fastForward ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-400'} hover:bg-amber-500/30"
      on:click={() => {
        $fastForward = !$fastForward;
      }}
      aria-label={$fastForward ? 'Disable fast forward' : 'Enable fast forward'}
      aria-pressed={$fastForward}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span class="text-sm font-semibold">2x Speed</span>
      {#if $fastForward}
        <span class="text-xs bg-amber-500 text-black px-2 py-0.5 rounded font-bold">ON</span>
      {/if}
    </button>

    <!-- Skip to results button -->
    <button
      class="min-h-[44px] px-4 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      on:click={handleSkip}
    >
      Skip to results
    </button>

    <!-- Swipe hint -->
    <div class="text-slate-600 text-xs flex items-center gap-1">
      <svg class="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
      Swipe up to skip
    </div>
  </div>

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
        on:click={() => handleCardNavigatorClick(i)}
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
  /* PACK-026: Rarity-specific reveal animations */

  /* Common: Simple flip (0.3s) */
  .animate-reveal-common {
    animation: revealCommon 0.3s ease-out;
    will-change: transform;
  }

  @keyframes revealCommon {
    0% {
      transform: scale(0.95) rotateY(-90deg);
      opacity: 0;
    }
    100% {
      transform: scale(1) rotateY(0deg);
      opacity: 1;
    }
  }

  /* Uncommon: Flip + blue glow (0.4s) */
  .animate-reveal-uncommon {
    animation: revealUncommon 0.4s ease-out;
    will-change: transform, box-shadow;
  }

  @keyframes revealUncommon {
    0% {
      transform: scale(0.9) rotateY(-90deg);
      opacity: 0;
      box-shadow: 0 0 0 rgba(96, 165, 250, 0);
    }
    50% {
      box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
    }
    100% {
      transform: scale(1) rotateY(0deg);
      opacity: 1;
      box-shadow: 0 0 10px rgba(96, 165, 250, 0.2);
    }
  }

  /* Rare: Flip + gold particles + glow (0.6s) */
  .animate-reveal-rare {
    animation: revealRare 0.6s ease-out;
    will-change: transform, box-shadow;
  }

  @keyframes revealRare {
    0% {
      transform: scale(0.85) rotateY(-90deg) scale(0.8);
      opacity: 0;
      box-shadow: 0 0 0 rgba(251, 191, 36, 0);
    }
    40% {
      transform: scale(1.1) rotateY(0deg);
      box-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
    }
    70% {
      transform: scale(0.95) rotateY(0deg);
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
    }
    100% {
      transform: scale(1) rotateY(0deg);
      opacity: 1;
      box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
    }
  }

  /* Epic: Flip + purple particles + screen shake (0.8s) */
  .animate-reveal-epic {
    animation: revealEpic 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform, box-shadow;
  }

  @keyframes revealEpic {
    0% {
      transform: scale(0.8) rotateY(-90deg) translateX(-20px);
      opacity: 0;
      box-shadow: 0 0 0 rgba(168, 85, 247, 0);
    }
    30% {
      transform: scale(1.2) rotateY(45deg) translateX(10px);
      box-shadow: 0 0 40px rgba(168, 85, 247, 0.7);
    }
    60% {
      transform: scale(0.9) rotateY(0deg) translateX(-5px);
      box-shadow: 0 0 25px rgba(168, 85, 247, 0.5);
    }
    100% {
      transform: scale(1) rotateY(0deg) translateX(0);
      opacity: 1;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
    }
  }

  /* Legendary: Flip + orange particles + screen shake + delay (1.0s) */
  .animate-reveal-legendary {
    animation: revealLegendary 1.0s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform, box-shadow, filter;
  }

  @keyframes revealLegendary {
    0% {
      transform: scale(0.7) rotateY(-90deg) scale(0.6);
      opacity: 0;
      box-shadow: 0 0 0 rgba(249, 115, 22, 0);
      filter: brightness(1);
    }
    20% {
      opacity: 0;
      transform: scale(0.7) rotateY(-90deg) scale(0.6);
    }
    40% {
      transform: scale(1.3) rotateY(90deg);
      box-shadow: 0 0 50px rgba(249, 115, 22, 0.8);
      filter: brightness(1.2);
    }
    70% {
      transform: scale(0.85) rotateY(0deg);
      box-shadow: 0 0 30px rgba(249, 115, 22, 0.6);
      filter: brightness(1.1);
    }
    100% {
      transform: scale(1) rotateY(0deg);
      opacity: 1;
      box-shadow: 0 0 25px rgba(249, 115, 22, 0.5);
      filter: brightness(1);
    }
  }

  /* Mythic: Flip + rainbow particles + screen shake + delay + fanfare (1.5s) */
  .animate-reveal-mythic {
    animation: revealMythic 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform, box-shadow, filter;
  }

  @keyframes revealMythic {
    0% {
      transform: scale(0.5) rotateY(-180deg) rotate(0deg) scale(0.4);
      opacity: 0;
      box-shadow: 0 0 0 rgba(236, 72, 153, 0);
      filter: brightness(1) hue-rotate(0deg);
    }
    15% {
      opacity: 0;
      transform: scale(0.5) rotateY(-180deg) rotate(0deg) scale(0.4);
    }
    35% {
      transform: scale(1.4) rotateY(90deg) rotate(180deg) scale(1.2);
      box-shadow: 0 0 60px rgba(236, 72, 153, 1);
      filter: brightness(1.5) hue-rotate(90deg);
    }
    60% {
      transform: scale(0.8) rotateY(0deg) rotate(360deg) scale(0.9);
      box-shadow: 0 0 40px rgba(236, 72, 153, 0.8);
      filter: brightness(1.3) hue-rotate(180deg);
    }
    85% {
      transform: scale(1.05) rotateY(0deg) rotate(360deg);
      box-shadow: 0 0 30px rgba(236, 72, 153, 0.6);
      filter: brightness(1.1) hue-rotate(270deg);
    }
    100% {
      transform: scale(1) rotateY(0deg) rotate(360deg);
      opacity: 1;
      box-shadow: 0 0 25px rgba(236, 72, 153, 0.5);
      filter: brightness(1) hue-rotate(360deg);
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
