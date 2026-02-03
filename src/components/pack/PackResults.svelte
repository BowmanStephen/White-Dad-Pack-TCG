<script lang="ts">
import { createEventDispatcher } from 'svelte';
import type { Pack, PackCard } from '@/types';
import { RARITY_CONFIG, DAD_TYPE_ICONS, RARITY_ORDER } from '@/types';
import { fade, fly, scale } from 'svelte/transition';
import { backOut, elasticOut } from 'svelte/easing';
import { shareToTwitter } from '@lib/utils/image-generation';
import { calculatePackQuality } from '@lib/utils/pack-quality';
import { showToast } from '@/stores/ui';
import { collection } from '@/stores/collection';
import Card from '../card/Card.svelte';
import ConfettiEffects from '../card/ConfettiEffects.svelte';
import ParticleEffects from '../card/ParticleEffects.svelte';
import ScreenShake from '../card/ScreenShake.svelte';
import CardInspectModal from './CardInspectModal.svelte';
import CardRevealer from './CardRevealer.svelte';
import { revealedCards, currentCardIndex } from '@/stores/pack';

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

let inspectCard = $state<PackCard | null>(null);
let inspectIndex = $state(0);
let showDetails = $state(false); // Toggle for pack quality details

const DAD_MESSAGES = [
  "Now that's what I call a power move, champ!",
  'Legendary! This pull is more satisfying than a perfectly edged lawn.',
  "Son, you've got the spark. Now let's go check the tire pressure.",
  "I'm not saying I'm proud, but I'm definitely not disappointed.",
  "Whoa! That's a rare one. Don't tell your mother I let you stay up this late.",
  "Incredible. Almost as good as my '92 Varsity touchdown.",
  "That's it. You're the new Grill Master.",
  "Mythic?! Call the neighbors, we're having a block party.",
];

const dadMessage = $derived(DAD_MESSAGES[Math.floor(Math.random() * DAD_MESSAGES.length)]);
const bestRarityConfig = $derived(RARITY_CONFIG[stats.bestCard.rarity]);
const hasLegendaryOrBetter = $derived(
  stats.bestCard.rarity === 'legendary' || stats.bestCard.rarity === 'mythic'
);

// Sort cards: common first, rare+ last (save the best for last during reveal)
// This creates anticipation as the pack reveals from lowest to highest rarity
const sortedCards = $derived(
  [...pack.cards].sort((a, b) => {
    // Sort by rarity ASCENDING (common first, legendary last)
    const rarityDiff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    // Within same rarity, non-holo before holo
    if (a.isHolo && !b.isHolo) return 1;
    if (!a.isHolo && b.isHolo) return -1;
    return 0;
  })
);

// Get slam intensity based on rarity (used for entrance animation scale)
function getSlamIntensity(rarity: string): { y: number; scale: number; duration: number } {
  switch (rarity) {
    case 'mythic':
      return { y: 80, scale: 1.3, duration: 600 };
    case 'legendary':
      return { y: 60, scale: 1.2, duration: 550 };
    case 'epic':
      return { y: 40, scale: 1.15, duration: 500 };
    case 'rare':
      return { y: 30, scale: 1.1, duration: 450 };
    case 'uncommon':
      return { y: 20, scale: 1.05, duration: 400 };
    default:
      return { y: 15, scale: 1.0, duration: 350 };
  }
}

// Stagger delay increases for higher rarities (more anticipation)
const BASE_STAGGER_MS = 100;
function getCardDelay(index: number, rarity: string): number {
  const baseDelay = 800; // Start after pack info loads
  const staggerDelay = index * BASE_STAGGER_MS;
  // Add extra delay for rare+ cards to build suspense
  const rarityBonus = RARITY_ORDER[rarity] >= RARITY_ORDER.rare ? 150 : 0;
  return baseDelay + staggerDelay + rarityBonus;
}

const hasPrevious = $derived(inspectIndex > 0);
const hasNext = $derived(inspectIndex < sortedCards.length - 1);

// Check if all cards have been revealed (for card-by-card reveal flow)
const allRevealed = $derived(revealedCards.get().size >= pack.cards.length);
const currentCardIdx = $derived(currentCardIndex.get());
const revealedCardSet = $derived(revealedCards.get());

const rarityCounts = $derived(
  Object.entries(stats.rarityBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([rarity, count]) => ({
      rarity,
      count,
      config: RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG],
    }))
);

const packQuality = $derived(calculatePackQuality(pack.cards));

// PERF: Cache unique cards set once instead of calling collection.get() on every card render
const uniqueCardsSet = $derived(new Set(collection.get().metadata.uniqueCards));

function isCardNew(cardId: string) {
  return uniqueCardsSet.has(cardId);
}

function goToPreviousCard() {
  if (inspectIndex > 0) {
    inspectIndex -= 1;
    inspectCard = sortedCards[inspectIndex];
  }
}

function goToNextCard() {
  if (inspectIndex < sortedCards.length - 1) {
    inspectIndex += 1;
    inspectCard = sortedCards[inspectIndex];
  }
}

function handleCardInspect(card: PackCard) {
  inspectIndex = sortedCards.findIndex(c => c.id === card.id);
  inspectCard = card;
}

function closeInspect() {
  inspectCard = null;
}

function shareOnX() {
  const text = `I just pulled a ${stats.bestCard.isHolo ? 'Holographic ' : ''}${bestRarityConfig.name} ${stats.bestCard.name} in DadDeck™! 🎴✨\n\nOpen your own pack at:`;
  shareToTwitter(text);
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.origin);
    showToast('Link copied!', 'success');
  } catch {
    showToast('Failed to copy link.', 'error');
  }
}

function handleOpenAnother() {
  dispatch('openAnother');
}

function handleGoHome() {
  dispatch('goHome');
}

function handleGoCollection() {
  dispatch('goCollection');
}
</script>

<!-- Celebration Effects -->
<ScreenShake active={hasLegendaryOrBetter} intensity="moderate" />
<ConfettiEffects rarity={stats.bestCard.rarity} active={hasLegendaryOrBetter} />

{#if !allRevealed}
  <!-- Card-by-card reveal experience -->
  <div class="w-full max-w-4xl mx-auto pb-24 px-3 sm:px-4">
    <CardRevealer
      {pack}
      currentIndex={currentCardIdx}
      revealedIndices={revealedCardSet}
      on:complete={() => {
        /* All revealed, allRevealed becomes true automatically */
      }}
    />
  </div>
{:else}
  <!-- Full results display -->

  <div class="w-full max-w-4xl mx-auto pb-24 px-3 sm:px-4">
    <!-- Header -->
    <div class="text-center mb-8 sm:mb-12">
      {#if hasLegendaryOrBetter}
        <div
          class="text-5xl sm:text-7xl mb-4 sm:mb-6 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          in:scale={{ duration: 800, delay: 200, easing: elasticOut, start: 0.5 }}
        >
          {stats.bestCard.rarity === 'mythic' ? '👑' : '🎉'}
        </div>
        <div class="relative inline-block">
          <h2
            class="text-3xl sm:text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic animate-pulse"
            style="color: {bestRarityConfig.color}; text-shadow: 0 0 30px {bestRarityConfig.glowColor}, 0 0 60px {bestRarityConfig.glowColor}44;"
            in:fly={{ y: 40, duration: 800, delay: 300 }}
          >
            {stats.bestCard.rarity} PULL!
          </h2>
          <div
            class="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 rotate-12 bg-amber-400 text-black text-[10px] sm:text-xs font-black px-2 py-1 rounded shadow-lg animate-bounce"
          >
            DAD APPROVED
          </div>
        </div>
        <p
          class="text-slate-300 text-base sm:text-xl font-medium italic max-w-lg mx-auto mb-2 px-4"
          in:fade={{ duration: 600, delay: 500 }}
        >
          "{dadMessage}"
        </p>
      {:else}
        <h2
          class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight"
          in:fly={{ y: 20, duration: 600 }}
        >
          Pack Complete!
        </h2>
      {/if}
      <p
        class="text-slate-400 font-bold uppercase tracking-widest text-sm"
        in:fade={{ duration: 600, delay: 400 }}
      >
        Collection Updated • {stats.totalCards} cards added
      </p>
    </div>

    <!-- Pack Quality Summary (collapsible) -->
    <div class="mb-12" in:fly={{ y: 30, duration: 600, delay: 500 }}>
      <button
        class="w-full flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-slate-800/50 transition-colors"
        onclick={() => (showDetails = !showDetails)}
        aria-expanded={showDetails}
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center border-2"
            style="background: linear-gradient(135deg, {packQuality.grade.color}22, {packQuality
              .grade.color}44); border-color: {packQuality.grade.color};"
          >
            <span class="text-xl font-black" style="color: {packQuality.grade.color};"
              >{packQuality.grade.grade}</span
            >
          </div>
          <div class="text-left">
            <div class="text-white font-bold">Pack Grade: {packQuality.grade.label}</div>
            <div class="text-slate-400 text-sm">
              {packQuality.score} / {packQuality.maxPossibleScore} points
            </div>
          </div>
        </div>
        <svg
          class="w-5 h-5 text-slate-400 transition-transform"
          class:rotate-180={showDetails}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {#if showDetails}
        <div
          class="mt-2 p-6 bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-sm"
          in:fly={{ y: -10, duration: 200 }}
        >
          <p class="text-slate-400 text-sm mb-4">{packQuality.grade.description}</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-white/5 rounded-xl p-4 border border-white/5">
              <div class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                Base Score
              </div>
              <div class="text-white font-bold text-lg">{packQuality.baseScore} pts</div>
            </div>
            <div class="bg-white/5 rounded-xl p-4 border border-white/5">
              <div class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                Holo Bonus
              </div>
              <div class="text-white font-bold text-lg">+{packQuality.holoBonus} pts</div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Best Card Highlight -->
    <div
      class="mb-16 relative group"
      in:fly={{ y: 40, duration: 800, delay: 600, easing: backOut }}
    >
      <div
        class="absolute inset-0 blur-[100px] opacity-30 -z-10 transition-all duration-1000 group-hover:opacity-50"
        style="background: {bestRarityConfig.color};"
      ></div>
      <div
        class="p-4 sm:p-6 md:p-10 bg-slate-900/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {#if hasLegendaryOrBetter}
          <div
            class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"
          ></div>
        {/if}
        <div
          class="absolute top-0 right-0 p-6 opacity-5 text-9xl pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500"
        >
          {DAD_TYPE_ICONS[stats.bestCard.type]}
        </div>
        <h3
          class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 text-center opacity-70"
        >
          Signature Best Pull
        </h3>
        <div class="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-12">
          <div class="relative card-container flex-shrink-0">
            <ParticleEffects rarity={stats.bestCard.rarity} active={true} />
            <div class="relative z-10 transition-transform duration-500 group-hover:scale-105">
              <Card card={stats.bestCard} size="md" interactive={true} />
            </div>
            {#if isCardNew(stats.bestCard.id)}
              <div
                class="absolute -top-4 -left-4 z-30 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black px-4 py-2 rounded-lg shadow-xl rotate-[-10deg] animate-pulse"
              >
                NEW!
              </div>
            {/if}
          </div>
          <div class="text-center md:text-left z-10 flex-1 max-w-md px-2 sm:px-0">
            <div
              class="text-xs sm:text-sm font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full inline-flex items-center gap-2 mb-3 sm:mb-4 uppercase tracking-wider sm:tracking-widest shadow-lg"
              style="background: {bestRarityConfig.color}; color: white;"
            >
              <span>★</span>
              {bestRarityConfig.name}
              {#if stats.bestCard.isHolo}
                <span class="ml-1 opacity-80">✨ HOLO</span>
              {/if}
            </div>
            <h4
              class="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tighter leading-none"
            >
              {stats.bestCard.name}
            </h4>
            <p
              class="text-slate-300 text-sm sm:text-xl mb-4 sm:mb-8 leading-relaxed font-medium opacity-90"
            >
              {stats.bestCard.subtitle}
            </p>
            <div class="flex flex-col gap-2 sm:gap-3">
              <button
                onclick={shareOnX}
                class="px-4 sm:px-6 py-2.5 sm:py-3 bg-sky-500 text-white font-black rounded-lg sm:rounded-xl hover:bg-sky-600 transition-all active:scale-95 text-sm sm:text-base"
              >
                Share on X →
              </button>
              <button
                onclick={copyLink}
                class="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-800 text-slate-300 font-black rounded-lg sm:rounded-xl hover:bg-slate-700 transition-all text-sm sm:text-base"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rarity Breakdown & Stats -->
    <div
      class="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6"
      in:fade={{ duration: 600, delay: 1100 }}
    >
      <div class="p-8 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm">
        <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">
          Distribution
        </h3>
        <div class="flex flex-wrap gap-3">
          {#each rarityCounts as { rarity, count, config }}
            <div
              class="flex items-center gap-3 bg-slate-800/40 px-4 py-2.5 rounded-xl border border-white/5 transition-colors hover:bg-slate-800/60"
            >
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
      <div
        class="p-8 bg-slate-900/50 rounded-3xl border border-white/5 backdrop-blur-sm flex flex-col justify-center items-center text-center"
      >
        {#if stats.holoCount > 0}
          <div class="text-5xl mb-3 animate-bounce">✨</div>
          <div class="text-2xl font-black text-white italic uppercase tracking-tighter">
            {stats.holoCount} Holographic {stats.holoCount === 1 ? 'Pull' : 'Pulls'}!
          </div>
          <p class="text-slate-400 text-sm mt-2 font-medium">
            That's some high-tier dad energy, champ.
          </p>
        {:else}
          <div class="text-5xl mb-3 grayscale">👔</div>
          <div class="text-2xl font-black text-white italic uppercase tracking-tighter">
            Solid Effort, Kid.
          </div>
          <p class="text-slate-400 text-sm mt-2 font-medium">
            Consistency is the hallmark of a great dad.
          </p>
        {/if}
      </div>
    </div>

    <!-- All Cards Grid -->
    <div class="mb-16" in:fade={{ duration: 600, delay: 800 }}>
      <div class="flex items-center gap-4 mb-8">
        <div
          class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"
        ></div>
        <h3
          class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center whitespace-nowrap"
        >
          Full Pack Contents
        </h3>
        <div
          class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"
        ></div>
      </div>
      <div
        class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
      >
        {#each sortedCards as card, i}
          {@const cardRarity = RARITY_CONFIG[card.rarity]}
          {@const slam = getSlamIntensity(card.rarity)}
          {@const isHighRarity = RARITY_ORDER[card.rarity] >= RARITY_ORDER.rare}
          <div
            role="button"
            tabindex="0"
            aria-label="Inspect {card.name}"
            class="aspect-[2.5/3.5] rounded-xl overflow-hidden cursor-pointer transform transition-all hover:scale-110 hover:-translate-y-2 hover:z-20 relative group card-entrance"
            class:card-slam-rare={isHighRarity}
            style="border: 2px solid {cardRarity.color}44; box-shadow: 0 10px 20px rgba(0,0,0,0.3); --slam-scale: {slam.scale};"
            in:fly={{
              y: slam.y,
              duration: slam.duration,
              delay: getCardDelay(i, card.rarity),
              easing: backOut,
            }}
            onclick={() => handleCardInspect(card)}
            onkeydown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardInspect(card);
              }
            }}
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-3"
            >
              <span
                class="text-4xl mb-3 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6"
                >{DAD_TYPE_ICONS[card.type]}</span
              >
              <span
                class="text-[10px] font-black text-slate-100 text-center leading-tight w-full line-clamp-2 uppercase tracking-tighter"
                >{card.name}</span
              >
              {#if card.isHolo}
                <div class="absolute top-2 left-2">
                  <span
                    class="text-[8px] px-1.5 py-0.5 bg-pink-500 text-white rounded font-black italic shadow-lg"
                    >HOLO</span
                  >
                </div>
              {/if}
              {#if isCardNew(card.id)}
                <div class="absolute top-2 right-2">
                  <div class="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                  <div class="absolute inset-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              {/if}
            </div>
            <div
              class="absolute bottom-0 left-0 right-0 h-1"
              style="background: {cardRarity.color};"
            ></div>
            <div
              class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            ></div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Action Buttons -->
    <div
      class="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
      in:fly={{ y: 30, duration: 600, delay: 1300 }}
    >
      <button
        class="group relative px-6 sm:px-12 py-4 sm:py-6 bg-white text-slate-950 font-black uppercase tracking-wider sm:tracking-[0.2em] rounded-xl sm:rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden text-sm sm:text-base"
        onclick={handleOpenAnother}
      >
        <div
          class="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        ></div>
        <div class="flex items-center justify-center relative z-10">
          <span class="text-xl sm:text-2xl mr-3 sm:mr-4 group-hover:rotate-12 transition-transform"
            >📦</span
          >
          <span>Open Another Pack</span>
        </div>
      </button>
      <button
        class="px-6 sm:px-12 py-4 sm:py-6 bg-slate-800 text-slate-400 font-black uppercase tracking-wider sm:tracking-[0.2em] rounded-xl sm:rounded-2xl hover:bg-slate-700 hover:text-white active:scale-95 transition-all border border-white/5 text-sm sm:text-base"
        onclick={handleGoHome}
      >
        Back to Street
      </button>
      <button
        class="px-6 sm:px-12 py-4 sm:py-6 bg-transparent text-slate-200 font-black uppercase tracking-wider sm:tracking-[0.2em] rounded-xl sm:rounded-2xl hover:text-white active:scale-95 transition-all border border-amber-500/40 hover:border-amber-400 text-sm sm:text-base"
        onclick={handleGoCollection}
        data-testid="results-collection"
      >
        View Collection
      </button>
    </div>
  </div>

  <!-- Card Inspection Modal -->
  <CardInspectModal
    card={inspectCard}
    onClose={closeInspect}
    onPrevious={goToPreviousCard}
    onNext={goToNextCard}
    {hasPrevious}
    {hasNext}
  />
{/if}

<style>
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-20deg);
  }
  100% {
    transform: translateX(200%) skewX(-20deg);
  }
}

:global(body) {
  overflow-x: hidden;
}

.card-container {
  perspective: 1500px;
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5));
}

/* Staggered card entrance with slam effect */
.card-entrance {
  --slam-scale: 1;
  animation: cardSlam 0.3s ease-out forwards;
  animation-delay: inherit;
}

@keyframes cardSlam {
  0% {
    transform: scale(var(--slam-scale));
    filter: brightness(1.5);
  }
  50% {
    transform: scale(1.02);
    filter: brightness(1.2);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

/* Enhanced slam for rare+ cards */
.card-slam-rare {
  animation: cardSlamRare 0.4s ease-out forwards;
}

@keyframes cardSlamRare {
  0% {
    transform: scale(var(--slam-scale)) rotate(-2deg);
    filter: brightness(2) drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
  }
  30% {
    transform: scale(1.1) rotate(1deg);
    filter: brightness(1.5) drop-shadow(0 0 15px rgba(255, 255, 255, 0.5));
  }
  60% {
    transform: scale(1.02) rotate(-0.5deg);
    filter: brightness(1.2);
  }
  100% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1);
  }
}
</style>
