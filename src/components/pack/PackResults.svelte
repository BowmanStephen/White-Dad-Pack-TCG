<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Pack, PackCard } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS } from '../../types';
  
  export let pack: Pack;
  export let stats: {
    totalCards: number;
    rarityBreakdown: Record<string, number>;
    holoCount: number;
    bestCard: PackCard;
  };
  
  const dispatch = createEventDispatcher();
  
  $: bestRarityConfig = RARITY_CONFIG[stats.bestCard.rarity];
  $: hasLegendaryOrBetter = stats.bestCard.rarity === 'legendary' || stats.bestCard.rarity === 'mythic';
  
  function handleOpenAnother() {
    dispatch('openAnother');
  }
  
  function handleGoHome() {
    dispatch('goHome');
  }
  
  // Get non-zero rarity counts for display
  $: rarityCounts = Object.entries(stats.rarityBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([rarity, count]) => ({
      rarity,
      count,
      config: RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG],
    }));
</script>

<div class="w-full max-w-4xl mx-auto">
  <!-- Header -->
  <div class="text-center mb-8">
    {#if hasLegendaryOrBetter}
      <div class="text-6xl mb-4 animate-bounce">🎉</div>
      <h2 
        class="text-3xl md:text-4xl font-bold mb-2"
        style="color: {bestRarityConfig.color};"
      >
        {stats.bestCard.rarity.toUpperCase()} PULL!
      </h2>
    {:else}
      <h2 class="text-3xl md:text-4xl font-bold mb-2 text-white">
        Pack Complete!
      </h2>
    {/if}
    <p class="text-slate-400">You opened {stats.totalCards} cards</p>
  </div>
  
  <!-- Best card highlight -->
  <div class="mb-8 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
    <h3 class="text-sm text-slate-400 mb-4 text-center">Best Pull</h3>
    <div class="flex items-center justify-center gap-6">
      <div 
        class="w-24 h-32 rounded-lg flex items-center justify-center text-4xl"
        style="
          background: linear-gradient(135deg, {bestRarityConfig.color}33, {bestRarityConfig.color}11);
          border: 2px solid {bestRarityConfig.color};
          box-shadow: 0 0 20px {bestRarityConfig.glowColor};
        "
      >
        {DAD_TYPE_ICONS[stats.bestCard.type]}
      </div>
      <div>
        <div 
          class="text-sm font-bold px-2 py-1 rounded inline-block mb-2"
          style="background: {bestRarityConfig.color}33; color: {bestRarityConfig.color};"
        >
          {bestRarityConfig.name}
          {#if stats.bestCard.isHolo}
            <span class="ml-1">✨ HOLO</span>
          {/if}
        </div>
        <h4 class="text-xl font-bold text-white">{stats.bestCard.name}</h4>
        <p class="text-slate-400 text-sm">{stats.bestCard.subtitle}</p>
      </div>
    </div>
  </div>
  
  <!-- All cards grid -->
  <div class="mb-8">
    <h3 class="text-sm text-slate-400 mb-4 text-center">All Cards</h3>
    <div class="grid grid-cols-4 md:grid-cols-7 gap-3">
      {#each pack.cards as card, i}
        {@const cardRarity = RARITY_CONFIG[card.rarity]}
        <div 
          class="aspect-[2.5/3.5] rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 hover:z-10 relative"
          style="
            border: 2px solid {cardRarity.color};
            box-shadow: 0 0 10px {cardRarity.glowColor};
          "
        >
          <div class="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center p-2">
            <span class="text-2xl mb-1">{DAD_TYPE_ICONS[card.type]}</span>
            <span class="text-[8px] text-white text-center leading-tight truncate w-full">{card.name}</span>
            {#if card.isHolo}
              <span class="text-[8px] text-pink-400">HOLO</span>
            {/if}
          </div>
          
          <!-- Rarity indicator -->
          <div 
            class="absolute top-1 right-1 w-2 h-2 rounded-full"
            style="background: {cardRarity.color};"
          ></div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Rarity breakdown -->
  <div class="mb-8 p-4 bg-slate-800/50 rounded-xl">
    <h3 class="text-sm text-slate-400 mb-3 text-center">Rarity Breakdown</h3>
    <div class="flex flex-wrap justify-center gap-4">
      {#each rarityCounts as { rarity, count, config }}
        <div class="flex items-center gap-2">
          <div 
            class="w-3 h-3 rounded-full"
            style="background: {config.color};"
          ></div>
          <span class="text-sm text-slate-300">
            {count}x {config.name}
          </span>
        </div>
      {/each}
      {#if stats.holoCount > 0}
        <div class="flex items-center gap-2">
          <span class="text-sm">✨</span>
          <span class="text-sm text-slate-300">
            {stats.holoCount}x Holographic
          </span>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Action buttons -->
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <button 
      class="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-400 hover:to-orange-400 active:scale-95 transition-all"
      on:click={handleOpenAnother}
    >
      <span class="mr-2">🎴</span>
      Open Another Pack
    </button>
    
    <button 
      class="px-8 py-4 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 active:scale-95 transition-all"
      on:click={handleGoHome}
    >
      Back to Home
    </button>
  </div>
  
  <!-- Share section (placeholder) -->
  <div class="mt-8 text-center">
    <p class="text-slate-500 text-sm">
      Share your pulls coming soon!
    </p>
  </div>
</div>
