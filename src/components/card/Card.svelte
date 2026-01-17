<script lang="ts">
  import type { PackCard } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS, DAD_TYPE_NAMES, STAT_ICONS, STAT_NAMES } from '../../types';
  import CardStats from './CardStats.svelte';
  
  export let card: PackCard;
  export let isFlipped: boolean = false;
  export let showBack: boolean = true;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let interactive: boolean = true;
  
  $: rarityConfig = RARITY_CONFIG[card.rarity];
  $: typeIcon = DAD_TYPE_ICONS[card.type];
  $: typeName = DAD_TYPE_NAMES[card.type];
  
  // Size classes
  const sizeClasses = {
    sm: 'w-48 h-[268px]',
    md: 'w-72 h-[403px]',
    lg: 'w-96 h-[537px]',
  };
  
  // Mouse position for holo effect
  let mouseX = 0.5;
  let mouseY = 0.5;
  let cardElement: HTMLDivElement;
  
  function handleMouseMove(event: MouseEvent) {
    if (!interactive || !card.isHolo) return;
    
    const rect = cardElement.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / rect.width;
    mouseY = (event.clientY - rect.top) / rect.height;
  }
  
  function handleMouseLeave() {
    mouseX = 0.5;
    mouseY = 0.5;
  }
  
  // Calculate rotation based on mouse position
  $: rotateX = interactive ? (mouseY - 0.5) * 20 : 0;
  $: rotateY = interactive ? (mouseX - 0.5) * -20 : 0;
  
  // Get number of stars based on rarity
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
      --mouse-x: {mouseX};
      --mouse-y: {mouseY};
    "
  >
    <!-- Card Front -->
    <div 
      class="card-face absolute inset-0 rounded-xl overflow-hidden"
      style="
        border: 3px solid {rarityConfig.color};
        box-shadow: 0 0 20px {rarityConfig.glowColor}, 0 0 40px {rarityConfig.glowColor};
      "
    >
      <!-- Card background -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
        
        <!-- Holographic overlay -->
        {#if card.isHolo}
          <div 
            class="absolute inset-0 pointer-events-none z-10"
            class:holo-standard={card.holoType === 'standard'}
            class:holo-prismatic={card.holoType === 'prismatic'}
            style="
              background: linear-gradient(
                {mouseX * 360}deg,
                rgba(255, 0, 0, 0.15),
                rgba(255, 127, 0, 0.15),
                rgba(255, 255, 0, 0.15),
                rgba(0, 255, 0, 0.15),
                rgba(0, 0, 255, 0.15),
                rgba(75, 0, 130, 0.15),
                rgba(148, 0, 211, 0.15)
              );
              mix-blend-mode: color-dodge;
            "
          ></div>
          <div 
            class="absolute inset-0 pointer-events-none z-10"
            style="
              background: radial-gradient(
                circle at {mouseX * 100}% {mouseY * 100}%,
                rgba(255, 255, 255, 0.3) 0%,
                transparent 50%
              );
            "
          ></div>
        {/if}
        
        <!-- Top bar -->
        <div class="relative z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/30 to-transparent">
          <!-- Type badge -->
          <div 
            class="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold"
            style="background: {rarityConfig.color}33; color: {rarityConfig.color};"
          >
            <span>{typeIcon}</span>
            <span>{typeName}</span>
          </div>
          
          <!-- Rarity stars -->
          <div class="flex gap-0.5">
            {#each Array(rarityStars) as _, i}
              <span class="text-xs" style="color: {rarityConfig.color};">★</span>
            {/each}
          </div>
        </div>
        
        <!-- Card name -->
        <div class="relative z-20 text-center px-3 mt-1">
          <h3 class="text-lg font-bold text-white leading-tight">{card.name}</h3>
          <p class="text-xs text-slate-400 italic">{card.subtitle}</p>
        </div>
        
        <!-- Artwork area -->
        <div class="relative z-20 mx-3 mt-3 aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
          <!-- Placeholder art -->
          <div 
            class="text-8xl opacity-80"
            style="filter: drop-shadow(0 0 20px {rarityConfig.glowColor});"
          >
            {typeIcon}
          </div>
          
          <!-- Holo badge -->
          {#if card.isHolo}
            <div class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              HOLO
            </div>
          {/if}
        </div>
        
        <!-- Stats section -->
        <div class="relative z-20 px-3 mt-3">
          <CardStats stats={card.stats} {rarityConfig} compact={size === 'sm'} />
        </div>
        
        <!-- Flavor text -->
        <div class="relative z-20 mx-3 mt-2 p-2 bg-black/20 rounded text-xs text-slate-300 italic leading-tight">
          "{card.flavorText}"
        </div>
        
        <!-- Footer -->
        <div class="absolute bottom-0 left-0 right-0 z-20 px-3 py-2 bg-gradient-to-t from-black/50 to-transparent">
          <div class="flex justify-between items-center text-[10px] text-slate-500">
            <span>#{card.cardNumber.toString().padStart(3, '0')}/{card.totalInSeries}</span>
            <span>Series {card.series}</span>
            <span>{card.artist}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Card Back -->
    {#if showBack}
      <div 
        class="card-face card-back absolute inset-0 rounded-xl overflow-hidden"
        style="
          border: 3px solid #475569;
          box-shadow: 0 0 10px rgba(71, 85, 105, 0.3);
        "
      >
        <div class="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700">
          <!-- Back pattern -->
          <div class="absolute inset-4 border-2 border-slate-500/30 rounded-lg"></div>
          <div class="absolute inset-8 border border-slate-500/20 rounded-lg"></div>
          
          <!-- Center logo -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-3xl font-bold mb-2">
              <span class="text-amber-400">Dad</span><span class="text-white">Deck</span>
            </div>
            <div class="text-slate-400 text-xs">SERIES 1</div>
            <div class="mt-4 text-4xl">👔</div>
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
  
  .holo-standard {
    animation: holo-shift 3s ease-in-out infinite;
  }
  
  .holo-prismatic {
    animation: prismatic-shift 2s linear infinite;
  }
  
  @keyframes holo-shift {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }
  
  @keyframes prismatic-shift {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
</style>
