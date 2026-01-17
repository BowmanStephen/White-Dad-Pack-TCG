<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Pack, PackCard } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS } from '../../types';
  import { fade, fly, scale } from 'svelte/transition';
  import { backOut, elasticOut } from 'svelte/easing';
  
  export let pack: Pack;
  export let stats: {
    totalCards: number;
    rarityBreakdown: Record<string, number>;
    holoCount: number;
    bestCard: PackCard;
  };
  
  const dispatch = createEventDispatcher();
  
  let copied = false;
  let copyTimeout: ReturnType<typeof setTimeout>;
  let canNativeShare = false;

  onMount(() => {
    canNativeShare = !!navigator.share;
  });
  
  $: bestRarityConfig = RARITY_CONFIG[stats.bestCard.rarity];
  $: hasLegendaryOrBetter = stats.bestCard.rarity === 'legendary' || stats.bestCard.rarity === 'mythic';
  
  function handleOpenAnother() {
    dispatch('openAnother');
  }
  
  function handleGoHome() {
    dispatch('goHome');
  }

  function shareOnX() {
    const text = `I just pulled a ${stats.bestCard.isHolo ? 'Holographic ' : ''}${bestRarityConfig.name} ${stats.bestCard.name} in DadDeck™! 🎴✨\n\nOpen your own pack at:`;
    const url = window.location.origin;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, '_blank');
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
  
  // Get non-zero rarity counts for display
  $: rarityCounts = Object.entries(stats.rarityBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([rarity, count]) => ({
      rarity,
      count,
      config: RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG],
    }));
</script>

<div class="w-full max-w-4xl mx-auto pb-20">
  <!-- Header -->
  <div class="text-center mb-8">
    {#if hasLegendaryOrBetter}
      <div 
        class="text-6xl mb-4"
        in:scale={{ duration: 600, delay: 200, easing: elasticOut, start: 0.5 }}
      >
        🎉
      </div>
      <h2 
        class="text-4xl md:text-5xl font-black mb-2 tracking-tight uppercase italic"
        style="
          color: {bestRarityConfig.color};
          text-shadow: 0 0 20px {bestRarityConfig.glowColor};
        "
        in:fly={{ y: 20, duration: 600, delay: 300 }}
      >
        {stats.bestCard.rarity} PULL!
      </h2>
    {:else}
      <h2 
        class="text-3xl md:text-4xl font-bold mb-2 text-white"
        in:fly={{ y: 20, duration: 600 }}
      >
        Pack Complete!
      </h2>
    {/if}
    <p class="text-slate-400" in:fade={{ duration: 600, delay: 400 }}>
      You opened {stats.totalCards} cards
    </p>
  </div>
  
  <!-- Best card highlight -->
  <div 
    class="mb-12 relative group"
    in:fly={{ y: 30, duration: 800, delay: 500, easing: backOut }}
  >
    <!-- Background Glow Effect -->
    <div 
      class="absolute inset-0 blur-3xl opacity-20 -z-10 transition-opacity group-hover:opacity-30"
      style="background: {bestRarityConfig.color};"
    ></div>

    <div class="p-8 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-0 right-0 p-4 opacity-5 text-8xl pointer-events-none">
        {DAD_TYPE_ICONS[stats.bestCard.type]}
      </div>

      <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 text-center">Best Pull</h3>
      
      <div class="flex flex-col md:flex-row items-center justify-center gap-8">
        <div class="relative">
          <!-- Card reflection/glow -->
          <div 
            class="absolute -inset-4 blur-xl opacity-40 animate-pulse"
            style="background: {bestRarityConfig.color};"
          ></div>
          
          <div 
            class="w-32 h-44 md:w-40 md:h-56 rounded-xl flex items-center justify-center text-6xl relative z-10 overflow-hidden"
            style="
              background: linear-gradient(135deg, {bestRarityConfig.color}44, {bestRarityConfig.color}11);
              border: 3px solid {bestRarityConfig.color};
              box-shadow: 0 0 30px {bestRarityConfig.glowColor};
            "
          >
            <!-- Holo sheen for the highlight if applicable -->
            {#if stats.bestCard.isHolo}
              <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            {/if}
            {DAD_TYPE_ICONS[stats.bestCard.type]}
          </div>
        </div>

        <div class="text-center md:text-left z-10">
          <div 
            class="text-xs font-black px-3 py-1 rounded-full inline-block mb-3 uppercase tracking-wider"
            style="background: {bestRarityConfig.color}22; color: {bestRarityConfig.color}; border: 1px solid {bestRarityConfig.color}44;"
          >
            {bestRarityConfig.name}
            {#if stats.bestCard.isHolo}
              <span class="ml-1">✨ HOLO</span>
            {/if}
          </div>
          <h4 class="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">{stats.bestCard.name}</h4>
          <p class="text-slate-400 text-lg mb-6">{stats.bestCard.subtitle}</p>
          
          <!-- Share buttons for best pull -->
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button 
              on:click={shareOnX}
              class="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-all active:scale-95 text-sm"
              title="Share on X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              Share Pull
            </button>
            
            <button 
              on:click={copyLink}
              class="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all active:scale-95 text-sm border border-slate-700"
              title="Copy Link"
            >
              {#if copied}
                <span in:scale={{ duration: 200 }} class="text-green-400">Copied!</span>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Link
              {/if}
            </button>

            {#if canNativeShare}
              <button 
                on:click={handleNativeShare}
                class="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all active:scale-95 border border-slate-700"
                title="More Share Options"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- All cards grid -->
  <div 
    class="mb-12"
    in:fade={{ duration: 600, delay: 700 }}
  >
    <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 text-center">Your Pack</h3>
    <div class="grid grid-cols-4 md:grid-cols-7 gap-4">
      {#each pack.cards as card, i}
        {@const cardRarity = RARITY_CONFIG[card.rarity]}
        <div 
          class="aspect-[2.5/3.5] rounded-xl overflow-hidden cursor-pointer transform transition-all hover:scale-110 hover:z-20 relative group"
          style="
            border: 2px solid {cardRarity.color}66;
            box-shadow: 0 0 15px {cardRarity.glowColor}22;
          "
          in:fly={{ y: 20, duration: 400, delay: 800 + (i * 50) }}
        >
          <div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-3">
            <span class="text-3xl mb-2 group-hover:scale-110 transition-transform">{DAD_TYPE_ICONS[card.type]}</span>
            <span class="text-[10px] font-bold text-slate-300 text-center leading-tight w-full line-clamp-2">{card.name}</span>
            {#if card.isHolo}
              <div class="absolute top-1 left-1">
                <span class="text-[8px] px-1 bg-pink-500/20 text-pink-400 rounded-sm font-black italic">HOLO</span>
              </div>
            {/if}
          </div>
          
          <!-- Rarity indicator -->
          <div 
            class="absolute bottom-1 right-1 w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]"
            style="background: {cardRarity.color}; color: {cardRarity.color};"
          ></div>

          <!-- Hover sheen -->
          <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Rarity breakdown & Stats -->
  <div 
    class="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4"
    in:fade={{ duration: 600, delay: 1000 }}
  >
    <div class="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
      <h3 class="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Rarity Distribution</h3>
      <div class="flex flex-wrap gap-4">
        {#each rarityCounts as { rarity, count, config }}
          <div class="flex items-center gap-3 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
            <div 
              class="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
              style="background: {config.color}; color: {config.color};"
            ></div>
            <span class="text-sm font-bold text-slate-200">
              {count}x {config.name}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <div class="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col justify-center items-center text-center">
      {#if stats.holoCount > 0}
        <div class="text-3xl mb-1">✨</div>
        <div class="text-xl font-black text-white italic uppercase tracking-tight">
          {stats.holoCount} Holographic {stats.holoCount === 1 ? 'Pull' : 'Pulls'}!
        </div>
        <p class="text-slate-500 text-xs mt-1">That's some high-tier dad energy.</p>
      {:else}
        <div class="text-3xl mb-1">👔</div>
        <div class="text-xl font-black text-white italic uppercase tracking-tight">
          Solid Pulls, champ.
        </div>
        <p class="text-slate-500 text-xs mt-1">Consistency is the hallmark of a great dad.</p>
      {/if}
    </div>
  </div>
  
  <!-- Action buttons -->
  <div 
    class="flex flex-col sm:flex-row gap-4 justify-center"
    in:fly={{ y: 20, duration: 600, delay: 1200 }}
  >
    <button 
      class="group relative px-10 py-5 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 text-white font-black uppercase tracking-wider rounded-xl shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(249,115,22,0.6)] active:scale-95 transition-all overflow-hidden"
      on:click={handleOpenAnother}
    >
      <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      <div class="flex items-center justify-center relative z-10">
        <span class="text-2xl mr-3 group-hover:rotate-12 transition-transform">🎴</span>
        <span>Open Another Pack</span>
      </div>
    </button>
    
    <button 
      class="px-10 py-5 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider rounded-xl hover:bg-slate-700 hover:text-white active:scale-95 transition-all border border-slate-700"
      on:click={handleGoHome}
    >
      Back to Home
    </button>
  </div>
</div>

<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(200%) rotate(45deg); }
  }
</style>

