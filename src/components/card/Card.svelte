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
  let time = 0;
  
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
  
  // Animate time for prismatic effects
  function animate(time: number) {
    if (card.isHolo && card.holoType === 'prismatic') {
      const t = time / 1000;
      // Add subtle movement
      if (interactive) {
        time = t;
      }
    }
    requestAnimationFrame(animate);
  }
  
  requestAnimationFrame(animate);
  
  // Calculate rotation based on mouse position (enhanced for holo)
  $: rotateX = interactive ? (mouseY - 0.5) * (card.isHolo ? 30 : 20) : 0;
  $: rotateY = interactive ? (mouseX - 0.5) * (card.isHolo ? -30 : -20) : 0;
  
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
        
        <!-- Enhanced holographic overlays -->
        {#if card.isHolo}
          <!-- Standard holo: rainbow gradient sheen -->
          {#if card.holoType === 'standard'}
            <div 
              class="absolute inset-0 pointer-events-none z-10 holo-sheen"
              style="
                background: linear-gradient(
                  {mouseX * 360}deg,
                  rgba(255, 0, 0, 0.2),
                  rgba(255, 127, 0, 0.18),
                  rgba(255, 255, 0, 0.2),
                  rgba(0, 255, 0, 0.18),
                  rgba(0, 0, 255, 0.2),
                  rgba(75, 0, 130, 0.18),
                  rgba(148, 0, 211, 0.2)
                );
                mix-blend-mode: color-dodge;
              "
            ></div>
            <div 
              class="absolute inset-0 pointer-events-none z-10"
              style="
                background: radial-gradient(
                  circle at {mouseX * 100}% {mouseY * 100}%,
                  rgba(255, 255, 255, 0.4) 0%,
                  transparent 50%
                );
              "
            ></div>
          {/if}
          
          <!-- Reverse holo: sparkle effects only on background -->
          {#if card.holoType === 'reverse'}
            <div 
              class="absolute inset-0 pointer-events-none z-10"
              style="
                background: linear-gradient(
                  135deg,
                  transparent 40%,
                  rgba(255, 255, 255, 0.1) 50%,
                  transparent 60%
                );
              "
            ></div>
            <div 
              class="absolute inset-0 pointer-events-none z-10"
              style="
                background: radial-gradient(
                  circle at {mouseX * 100}% {mouseY * 100}%,
                  rgba(255, 255, 255, 0.5) 0%,
                  transparent 40%
                );
              "
            ></div>
          {/if}
          
          <!-- Full art holo: intense rainbow with sparkle -->
          {#if card.holoType === 'full_art'}
            <div 
              class="absolute inset-0 pointer-events-none z-10"
              style="
                background: linear-gradient(
                  {time * 0.05}deg,
                  rgba(255, 0, 0, 0.25),
                  rgba(255, 127, 0, 0.22),
                  rgba(255, 255, 0, 0.25),
                  rgba(0, 255, 0, 0.22),
                  rgba(0, 0, 255, 0.25),
                  rgba(75, 0, 130, 0.22),
                  rgba(148, 0, 211, 0.25)
                );
                mix-blend-mode: color-dodge;
                animation: holo-sheen 8s linear infinite;
              "
            ></div>
            <div 
              class="absolute inset-0 pointer-events-none z-10"
              style="
                background: radial-gradient(
                  circle at {mouseX * 100}% {mouseY * 100}%,
                  rgba(255, 255, 255, 0.5) 0%,
                  transparent 50%
                );
              "
            ></div>
          {/if}
          
          <!-- Prismatic holo: multi-color shifting -->
          {#if card.holoType === 'prismatic'}
            <div 
              class="absolute inset-0 pointer-events-none z-10 prismatic-holo"
              style="
                background: linear-gradient(
                  {time * 0.1}deg,
                  rgba(255, 0, 128, 0.3),
                  rgba(128, 0, 255, 0.28),
                  rgba(0, 128, 255, 0.3),
                  rgba(0, 255, 255, 0.28),
                  rgba(0, 255, 128, 0.3),
                  rgba(128, 255, 0, 0.28),
                  rgba(255, 255, 0, 0.3),
                  rgba(255, 128, 0, 0.28)
                );
                mix-blend-mode: color-dodge;
              "
            ></div>
            <div 
              class="absolute inset-0 pointer-events-none z-10"
              style="
                background: radial-gradient(
                  circle at {mouseX * 100}% {mouseY * 100}%,
                  rgba(255, 255, 255, 0.6) 0%,
                  transparent 40%
                );
              "
            ></div>
          {/if}
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
        <div class="relative z-20 mx-3 mt-3 aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700">
          <!-- Actual card artwork -->
          <img 
            src={card.artwork}
            alt={card.name}
            class="w-full h-full object-cover"
            loading="lazy"
            style="filter: drop-shadow(0 0 10px {rarityConfig.glowColor});"
          />
          
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
  
  /* Holo sheen animations */
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
  
  /* Glow pulse for legendary+ cards */
  .legendary-glow {
    animation: glow-pulse 3s ease-in-out infinite;
  }
  
  @keyframes glow-pulse {
    0%, 100% { 
      box-shadow: 0 0 20px var(--rarity-glow), 0 0 40px var(--rarity-glow);
    }
    50% { 
      box-shadow: 0 0 30px var(--rarity-glow), 0 0 60px var(--rarity-glow), 0 0 80px var(--rarity-glow);
    }
  }
  
  /* Sparkle animation for prismatic */
  .sparkle {
    animation: sparkle 2s ease-in-out infinite;
  }
  
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
  }
</style>
