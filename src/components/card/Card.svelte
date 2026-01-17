<script lang="ts">
  import type { PackCard } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS, DAD_TYPE_NAMES, STAT_ICONS, STAT_NAMES } from '../../types';
  import CardStats from './CardStats.svelte';
  import { downloadCardImage, shareCardImage, checkShareSupport } from '../../lib/utils/image-generation';

  export let card: PackCard;
  export let isFlipped: boolean = false;
  export let showBack: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let interactive: boolean = true;
  export let enableShare: boolean = false;

  $: rarityConfig = RARITY_CONFIG[card.rarity];
  $: typeIcon = DAD_TYPE_ICONS[card.type];
  $: typeName = DAD_TYPE_NAMES[card.type];
  $: shareSupport = checkShareSupport();
  $: canShare = enableShare && shareSupport.webShareAPI && shareSupport.webShareFiles;

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

  // Check if we're in browser environment
  const isBrowser = typeof window !== 'undefined' && typeof requestAnimationFrame !== 'undefined';

  function handleMouseMove(event: MouseEvent) {
    if (!interactive) return;

    const rect = cardElement.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / rect.width;
    mouseY = (event.clientY - rect.top) / rect.height;
  }

  function handleMouseLeave() {
    mouseX = 0.5;
    mouseY = 0.5;
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
  on:mouseleave={handleMouseLeave}
  role="img"
  aria-label="{card.name} - {rarityConfig.name} {typeName}"
>
  <div
    class="card-3d w-full h-full relative"
    class:card-flipped={isFlipped && showBack}
    style="
      transform: perspective(1000px) rotateX({rotateX}deg) rotateY({rotateY}deg);
      --rarity-color: {rarityConfig.color};
      --rarity-glow: {rarityConfig.glowColor};
    "
  >
    <!-- Card Front -->
    <div
      class="card-face absolute inset-0 overflow-hidden"
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
      {#if card.isHolo}
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

      <!-- Top bar -->
      <div class="relative z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/40 to-transparent">
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold" style="background: {rarityConfig.color}33; color: {rarityConfig.color};">
          <span>{typeIcon}</span>
          <span>{typeName}</span>
        </div>
        <div class="flex gap-0.5">
          {#each Array(rarityStars) as _, i}
            <span class="text-xs" style="color: {rarityConfig.color}; text-shadow: 0 0 5px {rarityConfig.glowColor};">★</span>
          {/each}
        </div>
      </div>

      <!-- Card name -->
      <div class="relative z-20 text-center px-3 mt-1">
        <h3 class="text-lg font-black text-white leading-tight" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">{card.name}</h3>
        <p class="text-xs text-slate-300 italic" style="text-shadow: 0 1px 2px rgba(0,0,0,0.5);">{card.subtitle}</p>
      </div>

      <!-- Artwork area -->
      <div class="relative z-20 mx-3 mt-3 aspect-square rounded-xl overflow-hidden shadow-2xl" style="box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 20px {rarityConfig.glowColor}33;">
        <img
          src={card.artwork}
          alt={card.name}
          class="w-full h-full object-cover"
          loading="lazy"
          style="filter: drop-shadow(0 0 8px {rarityConfig.glowColor});"
        />
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

      <!-- Footer -->
      <div class="absolute bottom-0 left-0 right-0 z-20 px-3 py-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
        <div class="flex justify-between items-center text-[10px] text-slate-400">
          <span>#{card.cardNumber.toString().padStart(3, '0')}/{card.totalInSeries}</span>
          <span>SERIES {card.series}</span>
          <span>{card.artist}</span>
        </div>
      </div>
    </div>

    <!-- Card Back -->
    {#if showBack}
      <div
        class="card-face card-back absolute inset-0 overflow-hidden"
        style="border: 4px solid #475569; box-shadow: 0 0 20px rgba(71, 85, 105, 0.3), inset 0 0 20px rgba(0,0,0,0.5);"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
          <!-- Back pattern -->
          <div class="absolute inset-4 border-2 border-amber-500/20 rounded-xl"></div>
          <div class="absolute inset-6 border border-amber-500/10 rounded-lg"></div>

          <!-- Center logo -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-3xl font-black mb-2 tracking-tight">
              <span class="text-amber-400">Dad</span><span class="text-white">Deck</span>
            </div>
            <div class="text-slate-500 text-xs font-bold tracking-widest">SERIES 1</div>
            <div class="mt-4 text-4xl drop-shadow-lg">👔</div>
          </div>

          <!-- Corner decorations -->
          <div class="absolute top-4 left-4 text-amber-500/30 text-2xl">◆</div>
          <div class="absolute top-4 right-4 text-amber-500/30 text-2xl">◆</div>
          <div class="absolute bottom-4 left-4 text-amber-500/30 text-2xl">◆</div>
          <div class="absolute bottom-4 right-4 text-amber-500/30 text-2xl">◆</div>
        </div>
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
      >
        {#if isGeneratingImage}
          <span class="animate-spin">⟳</span>
          <span>Generating...</span>
        {:else}
          <span>📤</span>
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
    >
      {#if isGeneratingImage}
        <span class="animate-spin">⟳</span>
        <span>Generating...</span>
      {:else}
        <span>💾</span>
        <span>Download</span>
      {/if}
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
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
  }

  .prismatic-holo {
    animation: prismatic-shift 6s linear infinite;
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

  .legendary-glow {
    animation: glow-pulse 3s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px var(--rarity-glow), 0 0 40px var(--rarity-glow); }
    50% { box-shadow: 0 0 30px var(--rarity-glow), 0 0 60px var(--rarity-glow), 0 0 80px var(--rarity-glow); }
  }

  .sparkle {
    animation: sparkle 2s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
  }
</style>
