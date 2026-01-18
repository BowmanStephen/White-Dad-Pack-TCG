<script lang="ts">
  import type { PackCard, SeasonId } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS, DAD_TYPE_NAMES, STAT_ICONS, STAT_NAMES, SEASON_PACK_CONFIG } from '../../types';
  import CardStats from './CardStats.svelte';
  import CardBack from './CardBack.svelte';
  import GenerativeCardArt from '../art/GenerativeCardArt.svelte';
  import AbilityTooltip from './AbilityTooltip.svelte';
  import { downloadCardImage, shareCardImage, checkShareSupport } from '../../lib/utils/image-generation';

  export let card: PackCard;
  export let isFlipped: boolean = false;
  export let showBack: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let interactive: boolean = true;
  export let enableShare: boolean = false;
  export let showUpgradeButton: boolean = false;
  export let onUpgradeClick: (() => void) | undefined = undefined;

  $: rarityConfig = RARITY_CONFIG[card.rarity];
  $: typeIcon = DAD_TYPE_ICONS[card.type];
  $: typeName = DAD_TYPE_NAMES[card.type];
  $: shareSupport = checkShareSupport();
  $: canShare = enableShare && shareSupport.webShareAPI && shareSupport.webShareFiles;
  const upgradeLevel = 0;

  const sizeClasses = {
    sm: 'w-48 h-[268px]',
    md: 'w-72 h-[403px]',
    lg: 'w-96 h-[537px]',
  };

  let mouseX = 0.5;
  let mouseY = 0.5;
  let cardElement: HTMLDivElement;
  let time = 0;
  let animationFrameId: number | null = null;
  let abilityElements: HTMLElement[] = [];

  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined';

  // Performance detection - disable effects on low-end devices
  let holoEffectsEnabled = true;
  let particleElements: HTMLSpanElement[] = [];

  if (isBrowser) {
    // Check for low-end device indicators
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 8; // Chrome-only API
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Disable holo effects on low-end devices
    // Criteria: mobile with < 4 cores OR < 4GB RAM
    holoEffectsEnabled = !(isMobile && (hardwareConcurrency < 4 || memory < 4));
  }

  function handleMouseMove(event: MouseEvent) {
    if (!interactive) return;

    const rect = cardElement.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / rect.width;
    mouseY = (event.clientY - rect.top) / rect.height;
  }

  function handleMouseEnter() {
    if (!interactive) return;
    isHovered = true;
  }

  function handleMouseLeave() {
    mouseX = 0.5;
    mouseY = 0.5;
    isHovered = false;
  }

  function animate(time: number) {
    if (card.isHolo && card.holoType === 'prismatic') {
      const t = time / 1000;
      if (interactive) {
        time = t;
      }
    }
    if (isBrowser) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  if (isBrowser) {
    animationFrameId = requestAnimationFrame(animate);
  }

  // Cleanup on destroy
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (animationFrameId !== null && isBrowser) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  $: rotateX = interactive ? (mouseY - 0.5) * (card.isHolo ? 30 : 20) : 0;
  $: rotateY = interactive ? (mouseX - 0.5) * (card.isHolo ? -30 : -20) : 0;

  function getRarityStars(rarity: string): number {
    const starMap: Record<string, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5,
      mythic: 6,
    };
    return starMap[rarity] || 1;
  }

  $: rarityStars = getRarityStars(card.rarity);

  // US086 - Season System: Get season color
  function getSeasonColor(seasonId: SeasonId): string {
    const seasonColors: Record<SeasonId, string> = {
      1: '#1e40af', // Base Set Blue
      2: '#dc2626', // Summer BBQ Red
      3: '#d97706', // Fall Foliage Orange
      4: '#0284c7', // Winter Blue
      5: '#16a34a', // Spring Green
      6: '#9333ea', // Season 6 Purple
      7: '#ec4899', // Season 7 Pink
      8: '#f59e0b', // Season 8 Amber
      9: '#10b981', // Season 9 Emerald
      10: '#6366f1', // Season 10 Indigo
    };
    return seasonColors[seasonId] || '#9ca3af';
  }

  $: cardBackground = (() => {
    switch(card.rarity) {
      case 'common':
      case 'uncommon':
        return 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)';
      case 'rare':
        return 'linear-gradient(to bottom right, #1e3a8a, #1e293b, #172554)';
      case 'epic':
        return 'linear-gradient(to bottom right, #581c87, #312e81, #3b0764)';
      case 'legendary':
        return 'linear-gradient(to bottom right, #78350f, #7c2d12, #450a0a)';
      case 'mythic':
        return 'linear-gradient(to bottom right, #831843, #701a75, #500724)';
      default:
        return 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)';
    }
  })();

  $: borderStyle = (() => {
    switch(card.rarity) {
      case 'common':
      case 'uncommon':
        return '4px solid #9ca3af';
      case 'rare':
        return '4px solid #fbbf24';
      case 'epic':
        return '4px solid #a855f7';
      case 'legendary':
        return '4px solid #f97316';
      case 'mythic':
        return '4px solid #ec4899';
      default:
        return '4px solid #9ca3af';
    }
  })();

  $: glowStyle = (() => {
    const baseGlow = rarityConfig.glowColor;
    switch(card.rarity) {
      case 'legendary':
      case 'mythic':
        return `0 0 30px ${baseGlow}, 0 0 60px ${baseGlow}55, 0 0 90px ${baseGlow}33, inset 0 0 30px rgba(0,0,0,0.5)`;
      case 'epic':
        return `0 0 25px ${baseGlow}, 0 0 50px ${baseGlow}55, inset 0 0 25px rgba(0,0,0,0.5)`;
      case 'rare':
        return `0 0 20px ${baseGlow}, 0 0 40px ${baseGlow}55, inset 0 0 20px rgba(0,0,0,0.5)`;
      default:
        return `0 0 15px ${baseGlow}, 0 0 30px ${baseGlow}55, inset 0 0 15px rgba(0,0,0,0.5)`;
    }
  })();

  // Determine if card should have base glow (rare+ only)
  $: hasBaseGlow = ['rare', 'epic', 'legendary', 'mythic'].includes(card.rarity);

  // Glow intensity levels for animation
  $: glowIntensity = rarityConfig.animationIntensity;
  $: glowColor = rarityConfig.glowColor;

  // Hover state tracking
  let isHovered = false;

  // Share functionality
  let isGeneratingImage = false;
  let shareError: string | null = null;

  async function handleDownload() {
    if (isGeneratingImage || !cardElement) return;
    isGeneratingImage = true;
    shareError = null;

    try {
      await downloadCardImage(card, cardElement, { scale: 2 });
    } catch (error) {
      console.error('Failed to download card image:', error);
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
        shareTitle: 'DadDeck™ Card',
        imageGeneration: { scale: 2 },
      });

      if (!success) {
        // Fallback to download if share API failed or was cancelled
        await handleDownload();
      }
    } catch (error) {
      console.error('Failed to share card image:', error);
      shareError = 'Failed to share image. Please try again.';
      isGeneratingImage = false;
    } finally {
      isGeneratingImage = false;
    }
  }
</script>

<div
  class="card-perspective {sizeClasses[size]}"
  bind:this={cardElement}
  on:mousemove={handleMouseMove}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  role="img"
  aria-label="{card.name} - {rarityConfig.name} {typeName}"
>
  <div
    class="card-3d w-full h-full relative"
    class:card-flipped={isFlipped && showBack}
    class:glow-pulse={hasBaseGlow || isHovered}
    class:glow-hovered={isHovered}
    style="
      transform: perspective(1000px) rotateX({rotateX}deg) rotateY({rotateY}deg);
      --rarity-color: {rarityConfig.color};
      --rarity-glow: {rarityConfig.glowColor};
      --glow-intensity: {glowIntensity};
      --glow-color: {glowColor};
    "
  >
    <!-- Card Front -->
    <div
      class="card-face absolute inset-0 overflow-hidden {hasBaseGlow || isHovered ? 'card-glow' : ''}"
      style="border: {borderStyle}; box-shadow: {glowStyle};"
    >
      <!-- Card background -->
      <div class="absolute inset-0" style="background: {cardBackground};"></div>

      <!-- Corner accents -->
      {#if ['rare', 'epic', 'legendary', 'mythic'].includes(card.rarity)}
        <div class="absolute top-0 left-0 w-16 h-16" style="background: linear-gradient(135deg, {rarityConfig.color}44 0%, transparent 60%);"></div>
        <div class="absolute top-0 right-0 w-16 h-16" style="background: linear-gradient(-135deg, {rarityConfig.color}44 0%, transparent 60%);"></div>
        <div class="absolute bottom-0 left-0 w-16 h-16" style="background: linear-gradient(45deg, {rarityConfig.color}44 0%, transparent 60%);"></div>
        <div class="absolute bottom-0 right-0 w-16 h-16" style="background: linear-gradient(-45deg, {rarityConfig.color}44 0%, transparent 60%);"></div>
      {/if}

      <!-- Decorative inner borders -->
      <div class="absolute inset-1 border border-white/15 rounded-xl"></div>
      <div class="absolute inset-2 border border-white/8 rounded-lg"></div>
      <div class="absolute inset-3 border border-white/3 rounded-md"></div>

      <!-- Holographic overlay -->
      {#if card.isHolo && holoEffectsEnabled}
        {#if card.holoType === 'standard'}
          <div
            class="absolute inset-0 pointer-events-none z-10 holo-sheen"
            style="
              background: linear-gradient({mouseX * 360}deg, rgba(255,0,0,0.15), rgba(255,127,0,0.13), rgba(255,255,0,0.15), rgba(0,255,0,0.13), rgba(0,0,255,0.15), rgba(75,0,130,0.13), rgba(148,0,211,0.15));
              mix-blend-mode: color-dodge;
            "
          ></div>
          <div class="absolute inset-0 pointer-events-none z-10" style="background: radial-gradient(circle at {mouseX * 100}% {mouseY * 100}%, rgba(255,255,255,0.3) 0%, transparent 50%);"></div>
        {:else if card.holoType === 'reverse'}
          <div class="absolute inset-0 pointer-events-none z-10" style="background: linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.08) 50%, transparent 55%);"></div>
          <div class="absolute inset-0 pointer-events-none z-10" style="background: radial-gradient(circle at {mouseX * 100}% {mouseY * 100}%, rgba(255,255,255,0.4) 0%, transparent 45%);"></div>
        {:else if card.holoType === 'full_art'}
          <div
            class="absolute inset-0 pointer-events-none z-10"
            style="
              background: linear-gradient({time * 0.05}deg, rgba(255,0,0,0.2), rgba(255,127,0,0.18), rgba(255,255,0,0.2), rgba(0,255,0,0.18), rgba(0,0,255,0.2), rgba(75,0,130,0.18), rgba(148,0,211,0.2));
              mix-blend-mode: color-dodge;
              animation: holo-sheen 8s linear infinite;
            "
          ></div>
          <div class="absolute inset-0 pointer-events-none z-10" style="background: radial-gradient(circle at {mouseX * 100}% {mouseY * 100}%, rgba(255,255,255,0.4) 0%, transparent 50%);"></div>
        {:else if card.holoType === 'prismatic'}
          <div
            class="absolute inset-0 pointer-events-none z-10 prismatic-holo"
            style="
              background: linear-gradient({time * 0.1}deg, rgba(255,0,128,0.25), rgba(128,0,255,0.23), rgba(0,128,255,0.25), rgba(0,255,255,0.23), rgba(0,255,128,0.25), rgba(128,255,0,0.23), rgba(255,255,0,0.25), rgba(255,128,0,0.23));
              mix-blend-mode: color-dodge;
            "
          ></div>
          <div class="absolute inset-0 pointer-events-none z-10" style="background: radial-gradient(circle at {mouseX * 100}% {mouseY * 100}%, rgba(255,255,255,0.5) 0%, transparent 40%);"></div>
        {/if}
      {/if}

      <!-- Sparkle particles based on rarity -->
      {#if card.isHolo && holoEffectsEnabled && rarityConfig.particleCount > 0}
        <div class="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {#each Array(rarityConfig.particleCount) as _, i}
            <span
              class="sparkle absolute text-white"
              style="
                left: {((i * 137.5) % 100)}%;
                top: {((i * 73.7) % 100)}%;
                font-size: {Math.random() * 8 + 4}px;
                animation-delay: {i * 0.15}s;
                opacity: {Math.random() * 0.6 + 0.2};
                text-shadow: 0 0 4px {rarityConfig.glowColor};
              "
            >✦</span>
          {/each}
        </div>
      {/if}

      <!-- Top bar -->
      <div class="relative z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/40 to-transparent">
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold" style="background: {rarityConfig.color}33; color: {rarityConfig.color};">
          <span>{typeIcon}</span>
          <span>{typeName}</span>
        </div>
        <div class="flex gap-0.5 items-center">
          <!-- Rarity Stars -->
          <div class="flex gap-0.5">
            {#each Array(rarityStars) as _, i}
              <span class="text-xs" style="color: {rarityConfig.color}; text-shadow: 0 0 5px {rarityConfig.glowColor};">★</span>
            {/each}
          </div>
        </div>
      </div>

      <!-- Card name -->
      <div class="relative z-20 text-center px-3 mt-1">
        <h3 class="text-lg font-black text-white leading-tight" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">{card.name}</h3>
        <p class="text-xs text-slate-300 italic" style="text-shadow: 0 1px 2px rgba(0,0,0,0.5);">{card.subtitle}</p>
      </div>

      <!-- Artwork area -->
      <div class="relative z-20 mx-3 mt-3 aspect-square rounded-xl overflow-hidden shadow-2xl" style="box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 20px {rarityConfig.glowColor}33;">
        <div class="w-full h-full relative">
          <GenerativeCardArt
            card={card}
            width={300}
            height={300}
            showName={false}
            alt={card.name}
          />
        </div>
        {#if card.isHolo}
          <div class="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white" style="box-shadow: 0 2px 4px rgba(0,0,0,0.3);">HOLO</div>
        {/if}
      </div>

      <!-- Stats section -->
      <div class="relative z-20 px-3 mt-3">
        <CardStats stats={card.stats} {rarityConfig} compact={size === 'sm'} />
      </div>

      <!-- Flavor text -->
      <div class="relative z-20 mx-3 mt-2 p-2.5 bg-black/40 rounded-lg text-xs text-slate-300 italic leading-snug border border-white/5">
        "{card.flavorText}"
      </div>

      <!-- Abilities section -->
      {#if card.abilities && card.abilities.length > 0}
        <div class="relative z-20 mx-3 mt-2">
          <div class="flex flex-wrap gap-1.5">
            {#each card.abilities as ability, index}
              <div class="ability-indicator" bind:this={abilityElements[index]}>
                <button
                  class="ability-badge px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-200 border flex items-center gap-1 hover:scale-105 active:scale-95"
                  style="background: {rarityConfig.color}22; border-color: {rarityConfig.color}55; color: {rarityConfig.color};"
                  aria-label="View ability: {ability.name}"
                  aria-describedby="ability-tooltip-{card.id}-{index}"
                >
                  <span class="ability-icon">⚡</span>
                  <span class="ability-name truncate max-w-[80px]">{ability.name}</span>
                </button>
                <AbilityTooltip
                  ability={ability}
                  triggerElement={abilityElements[index]}
                  cardRarity={card.rarity}
                  delay={500}
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Footer -->
      <div class="absolute bottom-0 left-0 right-0 z-20 px-3 py-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
        <div class="flex justify-between items-center text-[10px] text-slate-400">
          <span>#{card.cardNumber.toString().padStart(3, '0')}/{card.totalInSeries}</span>
          <!-- Season Indicator (US086) -->
          {#if card.seasonId}
            <span class="season-badge" style="color: {getSeasonColor(card.seasonId)};">S{card.seasonId}</span>
          {/if}
          <span>SERIES {card.series}</span>
          <span>{card.artist}</span>
        </div>
      </div>
    </div>

    <!-- Card Back -->
    {#if showBack}
      <div class="card-face card-back absolute inset-0">
        <CardBack {size} isHolo={card.isHolo} rarity={card.rarity} />
      </div>
    {/if}
  </div>
</div>

<!-- Share/Download Button -->
{#if enableShare && !isFlipped}
  <div class="flex justify-center mt-4 gap-2">
    {#if canShare}
      <button
        on:click={handleShare}
        disabled={isGeneratingImage}
        class="px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center gap-2"
        class:opacity-50={isGeneratingImage}
        class:cursor-not-allowed={isGeneratingImage}
        style="background: linear-gradient(135deg, {rarityConfig.color}, {rarityConfig.color}dd); color: white; box-shadow: 0 4px 12px {rarityConfig.glowColor}44;"
        aria-label="Share {card.name} card"
      >
        {#if isGeneratingImage}
          <span class="animate-spin" aria-hidden="true">⟳</span>
          <span>Generating...</span>
        {:else}
          <span aria-hidden="true">📤</span>
          <span>Share</span>
        {/if}
      </button>
    {/if}
    <button
      on:click={handleDownload}
      disabled={isGeneratingImage}
      class="px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center gap-2"
      class:opacity-50={isGeneratingImage}
      class:cursor-not-allowed={isGeneratingImage}
      style="background: linear-gradient(135deg, {rarityConfig.color}, {rarityConfig.color}dd); color: white; box-shadow: 0 4px 12px {rarityConfig.glowColor}44;"
      aria-label="Download {card.name} card"
    >
      {#if isGeneratingImage}
        <span class="animate-spin" aria-hidden="true">⟳</span>
        <span>Generating...</span>
      {:else}
        <span aria-hidden="true">💾</span>
        <span>Download</span>
      {/if}
    </button>
  </div>
  {#if shareError}
    <div class="mt-2 text-center text-xs text-red-400">{shareError}</div>
  {/if}
{/if}

<!-- Upgrade Button (US085) -->
{#if showUpgradeButton && !isFlipped && onUpgradeClick}
  <div class="flex justify-center mt-3">
    <button
      on:click={onUpgradeClick}
      class="upgrade-btn px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center gap-2"
      style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);"
      aria-label="Upgrade {card.name}"
    >
      <span>⚡</span>
      <span>Upgrade Card</span>
      {#if upgradeLevel > 0}
        <span class="upgrade-badge" style="background: rgba(255,255,255,0.2); padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.625rem;">
          Lv.{upgradeLevel}
        </span>
      {/if}
    </button>
  </div>
{/if}

<style>
  .card-perspective {
    perspective: 1200px;
  }

  .card-3d {
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
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

  .holo-sheen {
    transition: background 0.3s ease-out;
    will-change: background;
  }

  .prismatic-holo {
    animation: prismatic-shift 6s linear infinite;
    will-change: filter, background;
  }

  @keyframes prismatic-shift {
    0% { filter: hue-rotate(0deg) brightness(1); }
    50% { filter: hue-rotate(180deg) brightness(1.1); }
    100% { filter: hue-rotate(360deg) brightness(1); }
  }

  @keyframes holo-sheen {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 0.9; }
  }

  /* Rarity glow effect with pulse animation */
  .card-glow {
    animation: rarity-glow-pulse 3s ease-in-out infinite;
    will-change: box-shadow;
    transform: translateZ(0); /* Force GPU layer */
  }

  /* Enhanced glow on hover */
  .glow-hovered .card-glow {
    animation: rarity-glow-hover 1.5s ease-in-out infinite;
  }

  @keyframes rarity-glow-pulse {
    0%, 100% {
      box-shadow:
        0 0 calc(15px * var(--glow-intensity)) var(--glow-color),
        0 0 calc(30px * var(--glow-intensity)) var(--glow-color)88,
        0 0 calc(45px * var(--glow-intensity)) var(--glow-color)66,
        inset 0 0 calc(20px * var(--glow-intensity)) rgba(0,0,0,0.5);
    }
    50% {
      box-shadow:
        0 0 calc(20px * var(--glow-intensity)) var(--glow-color),
        0 0 calc(40px * var(--glow-intensity)) var(--glow-color)aa,
        0 0 calc(60px * var(--glow-intensity)) var(--glow-color)77,
        inset 0 0 calc(25px * var(--glow-intensity)) rgba(0,0,0,0.5);
    }
  }

  @keyframes rarity-glow-hover {
    0%, 100% {
      box-shadow:
        0 0 calc(25px * var(--glow-intensity)) var(--glow-color),
        0 0 calc(50px * var(--glow-intensity)) var(--glow-color)cc,
        0 0 calc(75px * var(--glow-intensity)) var(--glow-color)99,
        inset 0 0 calc(30px * var(--glow-intensity)) rgba(0,0,0,0.4);
    }
    50% {
      box-shadow:
        0 0 calc(35px * var(--glow-intensity)) var(--glow-color),
        0 0 calc(70px * var(--glow-intensity)) var(--glow-color)ee,
        0 0 calc(105px * var(--glow-intensity)) var(--glow-color)bb,
        inset 0 0 calc(40px * var(--glow-intensity)) rgba(0,0,0,0.4);
    }
  }

  .sparkle {
    animation: sparkle 2s ease-in-out infinite;
    will-change: transform, opacity;
    pointer-events: none;
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 0;
      transform: scale(0) translate(0, 0);
    }
    50% {
      opacity: 1;
      transform: scale(1) translate(0, -5px);
    }
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .sparkle,
    .prismatic-holo,
    .card-glow,
    .holo-sheen {
      animation: none !important;
      transition: none !important;
    }
    .ability-badge {
      transform: none !important;
    }
  }

  /* Ability badge styles */
  .ability-badge {
    position: relative;
    cursor: help;
    will-change: transform;
  }

  .ability-badge:hover {
    box-shadow: 0 0 12px var(--rarity-glow);
  }

  .ability-icon {
    font-size: 10px;
    line-height: 1;
  }

  .ability-indicator {
    position: relative;
    display: inline-block;
  }

  /* Season Badge Styles (US086) */
  .season-badge {
    font-weight: 600;
    text-shadow: 0 0 4px currentColor;
  }
</style>
