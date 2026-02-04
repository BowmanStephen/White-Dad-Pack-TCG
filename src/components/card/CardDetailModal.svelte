<script lang="ts">
import type { PackCard } from '@/types';
import { RARITY_CONFIG, DAD_TYPE_ICONS, DAD_TYPE_NAMES } from '@/types';
import { closeLightbox, nextCard, prevCard } from '@/stores/lightbox';
import { isSpecialCardType, getSpecialCardTypeLabel } from '@/lib/card-types';
import RadarChart from '@components/card/RadarChart.svelte';
import GenerativeCardArt from '@components/art/GenerativeCardArt.svelte';
import AbilityTooltip from '@components/card/AbilityTooltip.svelte';

interface Props {
  card: PackCard;
  currentIndex: number;
  totalCards: number;
}

let { card, currentIndex, totalCards }: Props = $props();

const rarityConfig = $derived(RARITY_CONFIG[card.rarity]);
const typeIcon = $derived(DAD_TYPE_ICONS[card.type]);
const typeName = $derived(DAD_TYPE_NAMES[card.type]);

let modalElement: HTMLDivElement | null = null;
let abilityElements: HTMLElement[] = [];

// Close modal on backdrop click
function handleBackdropClick() {
  closeLightbox();
}

// Close modal on Escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeLightbox();
  }
}

// Type guards for special card types
function isStatlessCard(type: string): boolean {
  return isSpecialCardType(type) && type !== 'EVOLUTION' && type !== 'ITEM';
}

// Format card number with leading zeros
function formatCardNumber(num: number, total: number): string {
  return `${num.toString().padStart(3, '0')}/${total}`;
}

// Get season color
function getSeasonColor(seasonId: number): string {
  const seasonColors: Record<number, string> = {
    1: '#1e40af',
    2: '#dc2626',
    3: '#d97706',
    4: '#0284c7',
    5: '#16a34a',
    6: '#9333ea',
    7: '#ec4899',
    8: '#f59e0b',
    9: '#10b981',
    10: '#6366f1',
  };
  return seasonColors[seasonId] || '#9ca3af';
}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Modal Backdrop -->
<div
  class="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  bind:this={modalElement}
  tabindex="-1"
>
  <button
    class="absolute inset-0 bg-transparent border-0 p-0"
    onclick={handleBackdropClick}
    aria-label="Close card details"
    type="button"
  ></button>
  <!-- Modal Content -->
  <div
    class="relative z-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border-2"
    style="border-color: {rarityConfig.color}; box-shadow: 0 0 60px {rarityConfig.glowColor}44;"
  >
    <!-- Close Button -->
    <button
      onclick={closeLightbox}
      class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 hover:scale-110 active:scale-95"
      aria-label="Close card details"
    >
      <span class="text-2xl" aria-hidden="true">&times;</span>
    </button>

    <!-- Navigation Header -->
    {#if totalCards > 1}
      <div
        class="sticky top-0 z-10 px-6 py-3 bg-black/30 backdrop-blur-md border-b border-white/10"
      >
        <div class="flex items-center justify-between text-sm">
          <button
            onclick={prevCard}
            class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
            aria-label="Previous card"
          >
            ← Previous
          </button>

          <span class="text-white font-semibold">
            {currentIndex + 1} of {totalCards}
          </span>

          <button
            onclick={nextCard}
            class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === totalCards - 1}
            aria-label="Next card"
          >
            Next →
          </button>
        </div>
      </div>
    {/if}

    <!-- Card Display -->
    <div class="p-8">
      <!-- Card Header -->
      <div class="text-center mb-6">
        <div
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
          style="background: {rarityConfig.color}22; border: 1px solid {rarityConfig.color}55;"
        >
          <span class="text-xl" aria-hidden="true">{typeIcon}</span>
          <span class="text-sm font-bold" style="color: {rarityConfig.color};">{typeName}</span>
          <span class="text-xs text-slate-400">•</span>
          <span class="text-sm font-bold" style="color: {rarityConfig.color};"
            >{rarityConfig.name}</span
          >
        </div>

        <h1
          id="modal-title"
          class="text-4xl font-black text-white mb-2"
          style="text-shadow: 0 4px 8px rgba(0,0,0,0.5);"
        >
          {card.name}
        </h1>
        <p class="text-lg text-slate-300 italic">{card.subtitle}</p>
      </div>

      <!-- Card Artwork (Large) -->
      <div class="flex justify-center mb-8">
        <div
          class="relative w-[400px] h-[400px] rounded-2xl overflow-hidden shadow-2xl"
          style="box-shadow: 0 8px 30px rgba(0,0,0,0.6), 0 0 40px {rarityConfig.glowColor}44;"
        >
          <GenerativeCardArt {card} width={400} height={400} showName={false} alt={card.name} />
          {#if card.isHolo}
            <div
              class="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white"
              style="box-shadow: 0 2px 8px rgba(0,0,0,0.4);"
            >
              HOLO
            </div>
          {/if}
        </div>
      </div>

      <!-- Full Stats Section -->
      {#if !isStatlessCard(card.type)}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>Stats</span>
          </h2>
          <div class="bg-black/30 rounded-xl p-6 border border-white/10 flex justify-center">
            <RadarChart stats={card.stats} rarity={card.rarity} size={220} />
          </div>
        </div>
      {:else}
        <div class="mb-8 text-center py-6 bg-black/20 rounded-xl border border-white/10">
          <p class="text-lg text-slate-300 font-semibold">
            {getSpecialCardTypeLabel(card.type)} Card
          </p>
          <p class="text-sm text-slate-500 mt-2">Effect-based card with no stat values</p>
        </div>
      {/if}

      <!-- Flavor Text (Prominent) -->
      <div class="mb-8">
        <div
          class="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-8 border-l-4"
          style="border-color: {rarityConfig.color};"
        >
          <div
            class="absolute top-4 left-4 text-6xl opacity-20"
            style="color: {rarityConfig.color};"
            aria-hidden="true"
          >
            "
          </div>
          <p class="relative text-xl text-slate-200 italic leading-relaxed text-center">
            {card.flavorText}
          </p>
          <div
            class="absolute bottom-4 right-4 text-6xl opacity-20"
            style="color: {rarityConfig.color};"
            aria-hidden="true"
          >
            "
          </div>
        </div>
      </div>

      <!-- Abilities Section -->
      {#if card.abilities && card.abilities.length > 0}
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚡</span>
            <span>Abilities</span>
          </h2>
          <div class="grid gap-4">
            {#each card.abilities as ability, index}
              <div class="ability-indicator" bind:this={abilityElements[index]}>
                <div
                  class="bg-black/30 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg"
                      style="background: {rarityConfig.color}22;"
                    >
                      <span class="text-xl" aria-hidden="true">⚡</span>
                    </div>
                    <div class="flex-grow">
                      <h3 class="text-lg font-bold text-white mb-2">{ability.name}</h3>
                      <p class="text-slate-300">{ability.description}</p>
                    </div>
                  </div>
                </div>
                <AbilityTooltip
                  {ability}
                  triggerElement={abilityElements[index]}
                  cardRarity={card.rarity}
                  delay={300}
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Card Information Footer -->
      <div class="bg-black/40 rounded-xl p-6 border border-white/10">
        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>ℹ️</span>
          <span>Card Identity</span>
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-slate-400">Collector #:</span>
            <span class="ml-2 text-white font-semibold"
              >#{formatCardNumber(card.cardNumber, card.totalInSeries)}</span
            >
          </div>
          <div>
            <span class="text-slate-400">Series:</span>
            <span class="ml-2 text-white font-semibold">{card.series}</span>
          </div>
          {#if card.seasonId}
            <div>
              <span class="text-slate-400">Season:</span>
              <span class="ml-2 font-semibold" style="color: {getSeasonColor(card.seasonId)};"
                >S{card.seasonId}</span
              >
            </div>
          {/if}
          <div>
            <span class="text-slate-400">Artist:</span>
            <span class="ml-2 text-white font-semibold">{card.artist}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="sticky bottom-0 px-8 py-4 bg-black/40 backdrop-blur-md border-t border-white/10">
      <button
        onclick={closeLightbox}
        class="w-full px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95"
        style="background: linear-gradient(135deg, {rarityConfig.color}, {rarityConfig.color}dd); box-shadow: 0 4px 12px {rarityConfig.glowColor}44;"
      >
        Close
      </button>
    </div>
  </div>
</div>

<style>
/* Custom scrollbar for modal content */
div[class*='overflow-y-auto']::-webkit-scrollbar {
  width: 8px;
}

div[class*='overflow-y-auto']::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

div[class*='overflow-y-auto']::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

div[class*='overflow-y-auto']::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Ability indicator positioning */
.ability-indicator {
  position: relative;
  display: block;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  button {
    transform: none !important;
  }
}
</style>
