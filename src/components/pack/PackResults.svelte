<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Pack, PackCard } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS } from '../../types';
  import { fade, fly, scale } from 'svelte/transition';
  import { backOut, elasticOut } from 'svelte/easing';
  import { downloadPackImage, sharePackImage, shareToTwitter } from '../../lib/utils/image-generation';
  import { openModal } from '../../stores/ui';
  import ShareModal from '../common/ShareModal.svelte';
  import Card from '../card/Card.svelte';
  import ConfettiEffects from '../card/ConfettiEffects.svelte';
  import ParticleEffects from '../card/ParticleEffects.svelte';
  import ScreenShake from '../card/ScreenShake.svelte';
  import { collection } from '../../stores/collection';

  interface Props {
    pack: Pack;
    stats: {
      totalCards: number;
      rarityBreakdown: Record<string, number>;
      holoCount: number;
      bestCard: PackCard;
    };
  }

  let { pack, stats }: Props = $props();

  const dispatch = createEventDispatcher();

  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout>;
  let canNativeShare = $state(false);
  let inspectCard = $state<PackCard | null>(null);
  let inspectIndex = $state(0);
  let isGeneratingPackImage = $state(false);
  let packImageShareSuccess = $state(false);
  let inspectModalElement = $state<HTMLElement>();
  let previouslyFocusedElement: HTMLElement | null = null;
  let isCardFlipped = $state(false);
  let flippedCardStates = $state(new Map<string, boolean>());

  // Rarity order for sorting (mythic first, common last)
  const RARITY_ORDER: Record<string, number> = {
    mythic: 6,
    legendary: 5,
    epic: 4,
    rare: 3,
    uncommon: 2,
    common: 1,
  };

  // Dad Approval Messages for big pulls
  const DAD_MESSAGES = [
    "Now that's what I call a power move, champ!",
    "Legendary! This pull is more satisfying than a perfectly edged lawn.",
    "Son, you've got the spark. Now let's go check the tire pressure.",
    "I'm not saying I'm proud, but I'm definitely not disappointed.",
    "Whoa! That's a rare one. Don't tell your mother I let you stay up this late.",
    "Incredible. Almost as good as my '92 Varsity touchdown.",
    "That's it. You're the new Grill Master.",
    "Mythic?! Call the neighbors, we're having a block party."
  ];

  const dadMessage = $derived(DAD_MESSAGES[Math.floor((pack.id.length % DAD_MESSAGES.length))]);

  // Navigate to previous card in inspection modal
  function goToPreviousCard() {
    if (inspectIndex > 0) {
      inspectIndex -= 1;
      inspectCard = sortedCards[inspectIndex];
      // Restore flip state for the new card
      isCardFlipped = flippedCardStates.get(inspectCard.id) || false;
    }
  }

  // Navigate to next card in inspection modal
  function goToNextCard() {
    if (inspectIndex < sortedCards.length - 1) {
      inspectIndex += 1;
      inspectCard = sortedCards[inspectIndex];
      // Restore flip state for the new card
      isCardFlipped = flippedCardStates.get(inspectCard.id) || false;
    }
  }

  // Sort cards by rarity (descending: mythic → common)
  const sortedCards = $derived([...pack.cards].sort((a, b) => {
    const rarityDiff = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    // Secondary sort: holo cards first
    if (a.isHolo && !b.isHolo) return -1;
    if (!a.isHolo && b.isHolo) return 1;
    return 0;
  }));

  // Check if previous card is available
  const hasPrevious = $derived(inspectIndex > 0);

  // Check if next card is available
  const hasNext = $derived(inspectIndex < sortedCards.length - 1);

  onMount(() => {
    canNativeShare = !!navigator.share;
  });

  // Focus trap for inspect modal
  function handleInspectModalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeInspect();
      return;
    }

    // Arrow key navigation
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPreviousCard();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNextCard();
    }

    if (e.key === 'Tab' && inspectModalElement) {
      const focusableElements = inspectModalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  const bestRarityConfig = $derived(RARITY_CONFIG[stats.bestCard.rarity]);
  const hasLegendaryOrBetter = $derived(stats.bestCard.rarity === 'legendary' || stats.bestCard.rarity === 'mythic');

  // Check if a card is new to the collection
  function isCardNew(cardId: string) {
    // Note: Since the pack is added to collection BEFORE results, we need to check if it's the ONLY instance
    // But uniqueCards in store is just a list of IDs.
    // For MVP, we can assume if it's in the pack, it was either just added or already there.
    // A better way would be to track "new" status during pack generation.
    // For now, we'll just check if it's in the unique list.
    return collection.get().metadata.uniqueCards.includes(cardId);
  }

  function handleOpenAnother() {
    dispatch('openAnother');
  }

  function handleGoHome() {
    dispatch('goHome');
  }

  function handleCardInspect(card: PackCard) {
    previouslyFocusedElement = document.activeElement as HTMLElement;
    inspectIndex = sortedCards.findIndex(c => c.id === card.id);
    inspectCard = card;
    isCardFlipped = flippedCardStates.get(card.id) || false;
    setTimeout(() => {
      inspectModalElement?.focus();
    }, 50);
  }

  function toggleCardFlip() {
    isCardFlipped = !isCardFlipped;
    if (inspectCard) {
      flippedCardStates.set(inspectCard.id, isCardFlipped);
    }
  }

  function closeInspect() {
    inspectCard = null;
    if (previouslyFocusedElement) {
      setTimeout(() => {
        previouslyFocusedElement?.focus();
      }, 50);
    }
  }

  function shareOnX() {
    const text = `I just pulled a ${stats.bestCard.isHolo ? 'Holographic ' : ''}${bestRarityConfig.name} ${stats.bestCard.name} in DadDeck™! 🎴✨\n\nOpen your own pack at:`;
    shareToTwitter(text);
  }

  function openShareModal() {
    openModal('share');
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      copied = true;
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DadDeck™ - The Ultimate White Dad Trading Card Simulator',
          text: `I just pulled a ${stats.bestCard.isHolo ? 'Holographic ' : ''}${bestRarityConfig.name} ${stats.bestCard.name}! Check out my DadDeck™ pulls.`,
          url: window.location.origin,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }

  async function handleSharePackImage() {
    isGeneratingPackImage = true;
    try {
      const success = await sharePackImage(pack.cards);
      if (success) {
        packImageShareSuccess = true;
        setTimeout(() => {
          packImageShareSuccess = false;
        }, 2000);
      } else {
        await downloadPackImage(pack.cards);
      }
    } catch (error) {
      console.error('Pack image generation failed:', error);
    } finally {
      isGeneratingPackImage = false;
    }
  }

  const rarityCounts = $derived(Object.entries(stats.rarityBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([rarity, count]) => ({
      rarity,
      count,
      config: RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG],
    })));
</script>

<!-- Celebration Effects -->
<ScreenShake active={hasLegendaryOrBetter} intensity="moderate" />
<ConfettiEffects rarity={stats.bestCard.rarity} active={hasLegendaryOrBetter} />

<div class="w-full max-w-4xl mx-auto pb-20 px-4">
  <!-- Header -->
  <div class="text-center mb-12">
    {#if hasLegendaryOrBetter}
      <div 
        class="text-7xl mb-6 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
        in:scale={{ duration: 800, delay: 200, easing: elasticOut, start: 0.5 }}
      >
        {stats.bestCard.rarity === 'mythic' ? '👑' : '🎉'}
      </div>
      <div class="relative inline-block">
        <h2 
          class="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic animate-pulse"
          style="
            color: {bestRarityConfig.color};
            text-shadow: 0 0 30px {bestRarityConfig.glowColor}, 0 0 60px {bestRarityConfig.glowColor}44;
          "
          in:fly={{ y: 40, duration: 800, delay: 300 }}
        >
          {stats.bestCard.rarity} PULL!
        </h2>
        <div class="absolute -top-6 -right-6 rotate-12 bg-amber-400 text-black text-xs font-black px-2 py-1 rounded shadow-lg animate-bounce">
          DAD APPROVED
        </div>
      </div>
      <p class="text-slate-300 text-xl font-medium italic max-w-lg mx-auto mb-2" in:fade={{ duration: 600, delay: 500 }}>
        "{dadMessage}"
      </p>
    {:else}
      <h2 
        class="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight"
        in:fly={{ y: 20, duration: 600 }}
      >
        Pack Complete!
      </h2>
    {/if}
    <p class="text-slate-400 font-bold uppercase tracking-widest text-sm" in:fade={{ duration: 600, delay: 400 }}>
      Collection Updated • {stats.totalCards} cards added
    </p>
  </div>
  
  <!-- Best card highlight -->
  <div 
    class="mb-16 relative group"
    in:fly={{ y: 40, duration: 800, delay: 600, easing: backOut }}
  >
    <!-- Background Celebration Glow -->
    <div 
      class="absolute inset-0 blur-[100px] opacity-30 -z-10 transition-all duration-1000 group-hover:opacity-50"
      style="background: {bestRarityConfig.color};"
    ></div>

    <div class="p-1 md:p-10 bg-slate-900/90 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <!-- Animated Shimmer Background for Rare Pulls -->
      {#if hasLegendaryOrBetter}
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
      {/if}

      <div class="absolute top-0 right-0 p-6 opacity-5 text-9xl pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500">
        {DAD_TYPE_ICONS[stats.bestCard.type]}
      </div>

      <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 text-center opacity-70">Signature Best Pull</h3>
      
      <div class="flex flex-col md:flex-row items-center justify-center gap-12">
        <div class="relative card-container">
          <ParticleEffects rarity={stats.bestCard.rarity} active={true} />
          
          <div class="relative z-10 transition-transform duration-500 group-hover:scale-105">
            <Card card={stats.bestCard} size="lg" interactive={true} />
          </div>

          {#if isCardNew(stats.bestCard.id)}
            <div class="absolute -top-4 -left-4 z-30 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black px-4 py-2 rounded-lg shadow-xl rotate-[-10deg] animate-pulse">
              NEW!
            </div>
          {/if}
        </div>

        <div class="text-center md:text-left z-10 flex-1 max-w-md">
          <div 
            class="text-sm font-black px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-4 uppercase tracking-widest shadow-lg"
            style="background: {bestRarityConfig.color}; color: white;"
          >
            <span>★</span>
            {bestRarityConfig.name}
            {#if stats.bestCard.isHolo}
              <span class="ml-1 opacity-80">✨ HOLO</span>
            {/if}
          </div>
          
          <h4 class="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter leading-none">{stats.bestCard.name}</h4>
          <p class="text-slate-300 text-xl mb-8 leading-relaxed font-medium opacity-90">{stats.bestCard.subtitle}</p>
          
          <!-- Share buttons for best pull -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-4">
            <button
              on:click={openShareModal}
              class="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-xl hover:shadow-white/10 uppercase tracking-wider text-sm"
              title="Share your pull"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              Share Pull
            </button>

            <button
              on:click={copyLink}
              class="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800/50 backdrop-blur text-white font-bold rounded-xl hover:bg-slate-700 transition-all active:scale-95 border border-white/10 uppercase tracking-widest text-xs"
              title="Copy Link"
            >
              {#if copied}
                <span in:scale={{ duration: 200 }} class="text-green-400">Copied!</span>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Link
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- All cards grid -->
  <div
    class="mb-16"
    in:fade={{ duration: 600, delay: 800 }}
  >
    <div class="flex items-center gap-4 mb-8">
      <div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center whitespace-nowrap">Full Pack Contents</h3>
      <div class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
    </div>

    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 md:gap-6">
      {#each sortedCards as card, i}
        {@const cardRarity = RARITY_CONFIG[card.rarity]}
        <div
          role="button"
          tabindex="0"
          aria-label="Inspect {card.name}"
          class="aspect-[2.5/3.5] rounded-xl overflow-hidden cursor-pointer transform transition-all hover:scale-110 hover:-translate-y-2 hover:z-20 relative group"
          style="
            border: 2px solid {cardRarity.color}44;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          "
          in:fly={{ y: 20, duration: 400, delay: 900 + (i * 60) }}
          on:click={() => handleCardInspect(card)}
          on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardInspect(card);
            }
          }}
        >
          <div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-3">
            <span class="text-4xl mb-3 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">{DAD_TYPE_ICONS[card.type]}</span>
            <span class="text-[10px] font-black text-slate-100 text-center leading-tight w-full line-clamp-2 uppercase tracking-tighter">{card.name}</span>
            
            {#if card.isHolo}
              <div class="absolute top-2 left-2">
                <span class="text-[8px] px-1.5 py-0.5 bg-pink-500 text-white rounded font-black italic shadow-lg">HOLO</span>
              </div>
            {/if}

            {#if isCardNew(card.id)}
              <div class="absolute top-2 right-2">
                <div class="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                <div class="absolute inset-0 w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            {/if}
          </div>

          <!-- Rarity indicator bar -->
          <div
            class="absolute bottom-0 left-0 right-0 h-1"
            style="background: {cardRarity.color};"
          ></div>

          <!-- Hover overlay sheen -->
          <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Rarity breakdown & Stats -->
  <div 
    class="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6"
    in:fade={{ duration: 600, delay: 1100 }}
  >
    <div class="p-8 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm">
      <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Distribution</h3>
      <div class="flex flex-wrap gap-3">
        {#each rarityCounts as { rarity, count, config }}
          <div class="flex items-center gap-3 bg-slate-800/40 px-4 py-2.5 rounded-xl border border-white/5 transition-colors hover:bg-slate-800/60">
            <div 
              class="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
              style="background: {config.color}; color: {config.color};"
            ></div>
            <span class="text-sm font-black text-slate-200 uppercase tracking-wider">
              {count}x {config.name}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <div class="p-8 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm flex flex-col justify-center items-center text-center">
      {#if stats.holoCount > 0}
        <div class="text-5xl mb-3 animate-bounce">✨</div>
        <div class="text-2xl font-black text-white italic uppercase tracking-tighter">
          {stats.holoCount} Holographic {stats.holoCount === 1 ? 'Pull' : 'Pulls'}!
        </div>
        <p class="text-slate-400 text-sm mt-2 font-medium">That's some high-tier dad energy, champ.</p>
      {:else}
        <div class="text-5xl mb-3 grayscale">👔</div>
        <div class="text-2xl font-black text-white italic uppercase tracking-tighter">
          Solid Effort, Kid.
        </div>
        <p class="text-slate-400 text-sm mt-2 font-medium">Consistency is the hallmark of a great dad.</p>
      {/if}
    </div>
  </div>
  
  <!-- Action buttons -->
  <div 
    class="flex flex-col sm:flex-row gap-6 justify-center"
    in:fly={{ y: 30, duration: 600, delay: 1300 }}
  >
    <button 
      class="group relative px-12 py-6 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
      on:click={handleOpenAnother}
    >
      <div class="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      <div class="flex items-center justify-center relative z-10">
        <span class="text-2xl mr-4 group-hover:rotate-12 transition-transform">📦</span>
        <span>Open Another Pack</span>
      </div>
    </button>
    
    <button
      class="px-12 py-6 bg-slate-800 text-slate-400 font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-700 hover:text-white active:scale-95 transition-all border border-white/5"
      on:click={handleGoHome}
    >
      Back to Street
    </button>
  </div>
</div>

<!-- Card Inspection Modal -->
{#if inspectCard}
  {@const inspectRarity = RARITY_CONFIG[inspectCard.rarity]}
  <div
    bind:this={inspectModalElement}
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
    in:fade={{ duration: 300 }}
    out:fade={{ duration: 200 }}
    on:click={closeInspect}
    on:keydown={handleInspectModalKeydown}
    role="dialog"
    aria-modal="true"
    aria-label="Card details for {inspectCard.name}"
    tabindex="-1"
  >
    <div
      class="relative max-w-5xl w-full max-h-[95vh] overflow-y-auto"
      in:scale={{ duration: 400, easing: backOut }}
      out:scale={{ duration: 200 }}
      on:click|stopPropagation
    >
      <!-- Close button -->
      <button
        on:click={closeInspect}
        class="fixed top-8 right-8 text-white/50 hover:text-white text-5xl font-light transition-colors z-50"
        aria-label="Close card details"
      >
        ×
      </button>

      <!-- Navigation -->
      <div class="fixed top-1/2 left-4 -translate-y-1/2 hidden md:block z-40">
        <button
          on:click={goToPreviousCard}
          disabled={!hasPrevious}
          class="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-0 transition-all backdrop-blur"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="fixed top-1/2 right-4 -translate-y-1/2 hidden md:block z-40">
        <button
          on:click={goToNextCard}
          disabled={!hasNext}
          class="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-0 transition-all backdrop-blur"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-12 items-center lg:items-center px-4 md:px-20 pb-10">
        <div class="flex-shrink-0 card-container relative">
          {#if isCardNew(inspectCard.id)}
            <div class="absolute -top-6 -right-6 z-30 bg-blue-500 text-white font-black px-6 py-2 rounded-xl shadow-2xl rotate-12 scale-110">
              NEW COLLECTION!
            </div>
          {/if}
          <Card card={inspectCard} size="lg" interactive={true} enableShare={true} />
        </div>

        <div class="flex-1 w-full text-white">
          <div 
            class="text-xs font-black px-3 py-1 rounded-full inline-block mb-4 uppercase tracking-[0.2em] shadow-lg"
            style="background: {inspectRarity.color}; color: white;"
          >
            {inspectRarity.name} Pull
          </div>
          
          <h2 class="text-5xl md:text-6xl font-black mb-6 tracking-tighter" style="color: white;">
            {inspectCard.name}
          </h2>

          {#if inspectCard.flavorText}
            <blockquote class="text-slate-300 italic mb-10 text-2xl leading-relaxed opacity-80 border-l-8 pl-8" style="border-color: {inspectRarity.color};">
              "{inspectCard.flavorText}"
            </blockquote>
          {/if}

          <!-- Stats & Info -->
          <div class="grid grid-cols-2 gap-4 mb-10">
            <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Identity</h3>
              <div class="flex items-center gap-3">
                <span class="text-4xl">{DAD_TYPE_ICONS[inspectCard.type]}</span>
                <div>
                  <div class="font-black text-white uppercase text-sm tracking-widest">{inspectCard.type.replace('_', ' ')}</div>
                  <div class="text-xs text-slate-400">Class Type</div>
                </div>
              </div>
            </div>
            
            <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Serial</h3>
              <div class="text-2xl font-black text-white">#{inspectCard.cardNumber.toString().padStart(3, '0')}</div>
              <div class="text-xs text-slate-400 font-bold">Collector Number</div>
            </div>
          </div>

          <div class="flex flex-wrap gap-4 mt-auto opacity-40">
            <span class="text-[10px] font-bold uppercase tracking-widest">Artist: {inspectCard.artist}</span>
            <span class="text-[10px] font-bold uppercase tracking-widest">Series: {inspectCard.series}</span>
            <span class="text-[10px] font-bold uppercase tracking-widest">Year: 2024</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Share Modal -->
<ShareModal cards={pack.cards} packImageElement={null} />

<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-20deg); }
    100% { transform: translateX(200%) skewX(-20deg); }
  }

  :global(body) {
    overflow-x: hidden;
  }

  .card-container {
    perspective: 1500px;
    filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));
  }
</style>
