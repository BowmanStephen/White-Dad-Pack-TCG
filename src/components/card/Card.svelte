<script lang="ts">
import type { PackCard, SeasonId } from '@/types';
import { RARITY_CONFIG, DAD_TYPE_ICONS, DAD_TYPE_NAMES } from '@/types';
import {
  isSpecialCardType,
  getSpecialCardTypeLabel,
  getSpecialCardIcon,
  getSpecialCardBorderColor,
} from '@lib/card-types';
import RadarChart from './RadarChart.svelte';
import CardBack from './CardBack.svelte';
import GenerativeCardArt from '../art/GenerativeCardArt.svelte';
import AbilityTooltip from './AbilityTooltip.svelte';
import { downloadCardImage, shareCardImage, checkShareSupport } from '@lib/utils/image-generation';
import { openLightbox } from '@/stores/lightbox';
import { getRandomJoke } from '@lib/jokes';

interface Props {
  card: PackCard;
  isFlipped?: boolean;
  showBack?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  enableShare?: boolean;
  enableLightbox?: boolean;
  cardList?: PackCard[];
  cardIndex?: number;
  useRandomJoke?: boolean;
}

let {
  card,
  isFlipped = false,
  showBack = true,
  size = 'md',
  interactive = true,
  enableShare = false,
  enableLightbox = true,
  cardList = [],
  cardIndex = 0,
  useRandomJoke = false,
}: Props = $props();

let rarityConfig = $derived(RARITY_CONFIG[card.rarity]);
let typeIcon = $derived(DAD_TYPE_ICONS[card.type]);
let typeName = $derived(DAD_TYPE_NAMES[card.type]);
let shareSupport = $state(checkShareSupport());
let canShare = $derived(enableShare && shareSupport.webShareAPI && shareSupport.webShareFiles);
let displayFlavorText = $derived(useRandomJoke ? getRandomJoke(card.type) : card.flavorText);

const sizeClasses = {
  sm: 'w-40 sm:w-48 max-w-full h-auto aspect-[5/7]',
  md: 'w-56 sm:w-72 max-w-full h-auto aspect-[5/7]',
  lg: 'w-64 sm:w-80 md:w-96 max-w-full h-auto aspect-[5/7]',
};

let cardElement: HTMLDivElement;
let isHovered = $state(false);

function handleMouseEnter() {
  if (!interactive) return;
  isHovered = true;
}

function handleMouseLeave() {
  isHovered = false;
}

let rarityStars = $derived(
  {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    mythic: 6,
  }[card.rarity] || 1
);

function getSeasonColor(seasonId: SeasonId): string {
  const colors: Record<SeasonId, string> = {
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
  return colors[seasonId] || '#9ca3af';
}

let isStatlessCard = $derived(
  isSpecialCardType(card.type) && card.type !== 'EVOLUTION' && card.type !== 'ITEM'
);

// Rarity-based styling
let cardBackground = $derived(
  {
    common: 'linear-gradient(145deg, #1a1f2e 0%, #0f1419 50%, #1a1f2e 100%)',
    uncommon: 'linear-gradient(145deg, #0c2d4a 0%, #0a1929 50%, #0c2d4a 100%)',
    rare: 'linear-gradient(145deg, #3d2607 0%, #1a1005 50%, #3d2607 100%)',
    epic: 'linear-gradient(145deg, #2d1b4e 0%, #150d26 50%, #2d1b4e 100%)',
    legendary: 'linear-gradient(145deg, #4a1c0c 0%, #1f0c05 50%, #4a1c0c 100%)',
    mythic: 'linear-gradient(145deg, #4a1034 0%, #1f0616 50%, #4a1034 100%)',
  }[card.rarity] || 'linear-gradient(145deg, #1a1f2e 0%, #0f1419 50%, #1a1f2e 100%)'
);

let borderThickness = $derived(
  { common: '3px', uncommon: '3px', rare: '4px', epic: '5px', legendary: '6px', mythic: '8px' }[
    card.rarity
  ] || '3px'
);

let borderColors: Record<string, string> = {
  common: '#4a5568',
  uncommon: '#3b82f6',
  rare: '#fbbf24',
  epic: '#a855f7',
  legendary: '#f97316',
  mythic: '#ec4899',
};
let borderStyle = $derived(`${borderThickness} solid ${borderColors[card.rarity] || '#4a5568'}`);

let glowStyle = $derived(
  {
    legendary: `0 0 30px ${rarityConfig.glowColor}`,
    mythic: `0 0 30px ${rarityConfig.glowColor}`,
    epic: `0 0 20px ${rarityConfig.glowColor}`,
    rare: `0 0 15px ${rarityConfig.glowColor}`,
  }[card.rarity] || 'none'
);

let hasGlow = $derived(['rare', 'epic', 'legendary', 'mythic'].includes(card.rarity));

// Holo flash on reveal
let wasFlipped = $state(false);
let showFlash = $state(false);

$effect(() => {
  if (isFlipped && !wasFlipped && card.isHolo) {
    showFlash = true;
    setTimeout(() => (showFlash = false), 200);
    wasFlipped = true;
  } else if (!isFlipped) {
    wasFlipped = false;
    showFlash = false;
  }
});

// Holo gradient (inlined from HoloEffect)
let holoGradient = $derived(
  card.isHolo
    ? {
        standard:
          'linear-gradient(135deg, rgba(255,0,0,0.15), rgba(255,127,0,0.13), rgba(255,255,0,0.15), rgba(0,255,0,0.13), rgba(0,0,255,0.15), rgba(75,0,130,0.13), rgba(148,0,211,0.15))',
        reverse:
          'linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.08) 50%, transparent 55%)',
        full_art:
          'linear-gradient(135deg, rgba(255,0,0,0.2), rgba(255,127,0,0.18), rgba(255,255,0,0.2), rgba(0,255,0,0.18), rgba(0,0,255,0.2), rgba(75,0,130,0.18), rgba(148,0,211,0.2))',
        prismatic:
          'linear-gradient(135deg, rgba(255,0,128,0.25), rgba(128,0,255,0.23), rgba(0,128,255,0.25), rgba(0,255,255,0.23), rgba(0,255,128,0.25), rgba(128,255,0,0.23), rgba(255,255,0,0.25), rgba(255,128,0,0.23))',
      }[card.holoType || 'standard']
    : 'none'
);

// Share/Download
let isGeneratingImage = $state(false);
let shareError = $state<string | null>(null);

async function handleDownload() {
  if (isGeneratingImage || !cardElement) return;
  isGeneratingImage = true;
  shareError = null;
  try {
    await downloadCardImage(card, cardElement, { scale: 2 });
  } catch {
    shareError = 'Failed to download image. Please try again.';
  } finally {
    isGeneratingImage = false;
  }
}

async function handleShare() {
  if (isGeneratingImage || !cardElement) return;
  isGeneratingImage = true;
  shareError = null;
  try {
    const success = await shareCardImage(card, cardElement, {
      shareTitle: 'DadDeck Card',
      imageGeneration: { scale: 2 },
    });
    if (!success) await handleDownload();
  } catch {
    shareError = 'Failed to share image. Please try again.';
  } finally {
    isGeneratingImage = false;
  }
}

function handleCardClick() {
  if (!enableLightbox || !interactive) return;
  const cards = cardList.length > 0 ? cardList : [card];
  const index = cardList.length > 0 ? cardIndex : 0;
  openLightbox(card, cards, index);
}
</script>

<div
  class="card-perspective {sizeClasses[size]}"
  class:cursor-pointer={enableLightbox && interactive}
  bind:this={cardElement}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onclick={handleCardClick}
  role="img"
  aria-label="{card.name} - {rarityConfig.name} {typeName}"
>
  <div
    class="card-3d w-full h-full relative"
    class:card-flipped={isFlipped && showBack}
    class:card-lift={isHovered}
    style="--rarity-color: {rarityConfig.color}; --rarity-glow: {rarityConfig.glowColor};"
  >
    <!-- Card Front -->
    <div
      class="card-face absolute inset-0 overflow-hidden rounded-xl"
      class:mythic-prismatic={card.rarity === 'mythic'}
      style="border: {borderStyle}; box-shadow: {hasGlow || isHovered ? glowStyle : 'none'};"
    >
      {#if showFlash}
        <div class="holo-flash-overlay"></div>
      {/if}

      <!-- Background -->
      <div class="absolute inset-0" style="background: {cardBackground};"></div>

      <!-- Holo Effect (inlined) -->
      {#if card.isHolo}
        <div
          class="absolute inset-0 pointer-events-none z-10"
          style="background: {holoGradient}; mix-blend-mode: color-dodge; opacity: 0.7;"
        ></div>
        <div
          class="absolute inset-0 pointer-events-none z-10"
          style="background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 50%);"
        ></div>
      {/if}

      <!-- Special Card Type Badge -->
      {#if isSpecialCardType(card.type)}
        <div
          class="absolute top-2 right-2 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/80"
          style="border: 1.5px solid {getSpecialCardBorderColor(card.type)};"
        >
          <span class="text-sm">{getSpecialCardIcon(card.type)}</span>
          <span
            class="text-[10px] font-bold uppercase tracking-wider"
            style="color: {getSpecialCardBorderColor(
              card.type
            )}; font-family: var(--font-condensed);">{card.type}</span
          >
        </div>
      {/if}

      <!-- Header: Type & Rarity Stars -->
      <div class="relative z-20 flex items-center justify-between p-2.5 header-bar">
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-white"
          style="background: {rarityConfig.color}; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"
        >
          <span class="text-sm">{typeIcon}</span>
          <span class="uppercase tracking-wide" style="font-family: var(--font-condensed);"
            >{typeName}</span
          >
        </div>
        <div class="flex gap-0.5">
          {#each Array(rarityStars) as _, i}
            <span
              class="text-sm"
              style="color: {rarityConfig.color}; text-shadow: 0 0 8px {rarityConfig.glowColor};"
              >★</span
            >
          {/each}
        </div>
      </div>

      <!-- Artwork Frame -->
      <div class="relative z-20 mx-3 mt-2">
        <div
          class="p-[3px] rounded-lg"
          style="background: linear-gradient(145deg, {rarityConfig.color}88, {rarityConfig.color}22, {rarityConfig.color}88);"
        >
          <div
            class="rounded-md overflow-hidden aspect-[4/3]"
            style="box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5);"
          >
            <div class="w-full h-full relative bg-black">
              <GenerativeCardArt {card} width={300} height={225} showName={false} alt={card.name} />
            </div>
            {#if card.isHolo}
              <div
                class="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-extrabold text-white tracking-wider"
                style="background: linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4); font-family: var(--font-condensed);"
              >
                HOLO
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Card Name -->
      <div class="relative z-20 text-center px-3 mt-2">
        <h3
          class="text-2xl leading-none tracking-wide text-white uppercase"
          style="font-family: var(--font-scream); text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 20px {rarityConfig.glowColor}44;"
        >
          {card.name}
        </h3>
        <p
          class="text-xs text-slate-300 mt-0.5 tracking-wide uppercase"
          style="font-family: var(--font-condensed);"
        >
          {card.subtitle}
        </p>
      </div>

      <!-- Flavor Text -->
      <div
        class="relative z-20 mx-3 mt-2 bg-black/70 border-t border-b border-white/10 rounded-lg px-3 py-2.5"
      >
        <p
          class="text-[10px] leading-relaxed break-words text-slate-200 italic text-center"
          style="font-family: var(--font-body);"
        >
          "{displayFlavorText}"
        </p>
      </div>

      <!-- Stats -->
      <div class="relative z-20 px-3 mt-2">
        {#if !isStatlessCard}
          <RadarChart stats={card.stats} rarity={card.rarity} size={180} />
        {:else}
          <div
            class="text-xs text-slate-400 text-center py-2 font-semibold"
            style="font-family: var(--font-condensed);"
          >
            {getSpecialCardTypeLabel(card.type)} Card
            <div class="text-[10px] text-slate-500 mt-1">Effect-based abilities</div>
          </div>
        {/if}
      </div>

      <!-- Abilities -->
      {#if card.abilities && card.abilities.length > 0}
        <div class="relative z-20 mx-3 mt-2 flex flex-wrap gap-1.5 justify-center">
          {#each card.abilities as ability}
            {@const buttonId = `ability-${card.id}-${ability.name}`}
            <div class="relative inline-block">
              <button
                id={buttonId}
                class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 cursor-help"
                style="background: {rarityConfig.color}22; border: 1px solid {rarityConfig.color}66; color: {rarityConfig.color}; font-family: var(--font-condensed);"
                aria-label="View ability: {ability.name}"
              >
                <span>⚡</span>
                <span class="truncate max-w-[80px]">{ability.name}</span>
              </button>
              <AbilityTooltip
                {ability}
                triggerElement={null}
                cardRarity={card.rarity}
                delay={500}
              />
            </div>
          {/each}
        </div>
      {/if}

      <!-- Footer -->
      <div
        class="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent"
      >
        <div
          class="flex justify-between items-center px-3 py-2 text-[9px] text-slate-400 uppercase tracking-wide"
          style="font-family: var(--font-condensed);"
        >
          <span>#{card.cardNumber.toString().padStart(3, '0')}/{card.totalInSeries}</span>
          {#if card.seasonId}
            <span
              class="font-bold"
              style="color: {getSeasonColor(card.seasonId)}; text-shadow: 0 0 4px currentColor;"
              >S{card.seasonId}</span
            >
          {/if}
          <span>SERIES {card.series}</span>
          <span>{card.artist}</span>
        </div>
      </div>
    </div>

    <!-- Card Back -->
    {#if showBack}
      <div class="card-face card-back absolute inset-0 rounded-xl">
        <CardBack {size} isHolo={card.isHolo} rarity={card.rarity} />
      </div>
    {/if}
  </div>
</div>

<!-- Share/Download Buttons -->
{#if enableShare && !isFlipped}
  <div class="flex justify-center mt-4 gap-2">
    {#if canShare}
      <button
        onclick={handleShare}
        disabled={isGeneratingImage}
        class="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider text-white transition-all"
        class:opacity-50={isGeneratingImage}
        style="background: linear-gradient(135deg, {rarityConfig.color}, {rarityConfig.color}dd); font-family: var(--font-condensed);"
      >
        {isGeneratingImage ? 'GENERATING...' : 'SHARE'}
      </button>
    {/if}
    <button
      onclick={handleDownload}
      disabled={isGeneratingImage}
      class="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider text-white transition-all"
      class:opacity-50={isGeneratingImage}
      style="background: linear-gradient(135deg, {rarityConfig.color}, {rarityConfig.color}dd); font-family: var(--font-condensed);"
    >
      {isGeneratingImage ? 'GENERATING...' : 'DOWNLOAD'}
    </button>
  </div>
  {#if shareError}
    <div class="mt-2 text-center text-xs text-red-400">{shareError}</div>
  {/if}
{/if}

<style>
.card-perspective {
  perspective: 1200px;
}

.card-3d {
  transform-style: preserve-3d;
  transition: transform 0.15s ease-out;
}

.card-lift {
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 15px 30px rgba(0, 0, 0, 0.3) !important;
}

.card-face {
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

.card-flipped {
  transform: rotateY(180deg);
}

.header-bar {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
}

.holo-flash-overlay {
  position: absolute;
  inset: 0;
  background: white;
  animation: holo-flash 0.2s ease-out forwards;
  pointer-events: none;
  z-index: 50;
  border-radius: inherit;
}

@keyframes holo-flash {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

.mythic-prismatic {
  box-shadow:
    0 0 30px #ec4899,
    0 0 60px #ec489966 !important;
}

@media (prefers-reduced-motion: reduce) {
  .card-3d {
    transition: none;
  }
  .holo-flash-overlay {
    animation: none;
  }
}
</style>
