<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Rarity } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  
  export let bestRarity: Rarity = 'common';
  
  const dispatch = createEventDispatcher();
  
  let phase: 'appear' | 'glow' | 'hint' | 'tear' | 'emerge' = 'appear';
  let packElement: HTMLDivElement;
  
  $: rarityConfig = RARITY_CONFIG[bestRarity];
  $: glowColor = rarityConfig.glowColor;
  
  // Animation timing
  const PHASE_DURATIONS = {
    appear: 500,
    glow: 1000,
    hint: 300,
    tear: 800,
    emerge: 500,
  };
  
  onMount(() => {
    runAnimation();
  });
  
  async function runAnimation() {
    // Phase 1: Pack appears
    phase = 'appear';
    await delay(PHASE_DURATIONS.appear);
    
    // Phase 2: Pack glows
    phase = 'glow';
    await delay(PHASE_DURATIONS.glow);
    
    // Phase 3: Rarity hint
    phase = 'hint';
    await delay(PHASE_DURATIONS.hint);
    
    // Phase 4: Pack tears open
    phase = 'tear';
    await delay(PHASE_DURATIONS.tear);
    
    // Phase 5: Cards emerge
    phase = 'emerge';
    await delay(PHASE_DURATIONS.emerge);
    
    // Animation complete
    dispatch('complete');
  }
  
  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function handleClick() {
    dispatch('skip');
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter' || event.key === 'Escape') {
      dispatch('skip');
    }
  }
</script>

<div 
  class="relative cursor-pointer"
  bind:this={packElement}
  on:click={handleClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex="0"
  aria-label="Click to skip animation"
>
  <!-- Glow effect -->
  <div 
    class="absolute inset-0 rounded-2xl blur-3xl transition-all duration-500"
    class:opacity-0={phase === 'appear'}
    class:opacity-50={phase === 'glow'}
    class:opacity-100={phase === 'hint' || phase === 'tear'}
    class:scale-150={phase === 'tear' || phase === 'emerge'}
    style="background: {glowColor};"
  ></div>
  
  <!-- Pack container -->
  <div 
    class="relative w-64 h-96 md:w-80 md:h-[480px] transition-all duration-500"
    class:scale-0={phase === 'appear'}
    class:scale-100={phase !== 'appear' && phase !== 'emerge'}
    class:scale-110={phase === 'emerge'}
    class:opacity-0={phase === 'emerge'}
    style="animation: {phase === 'appear' ? 'packAppear 0.5s ease-out forwards' : 'none'};"
  >
    <!-- Pack wrapper -->
    <div 
      class="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300"
      class:animate-pack-shake={phase === 'tear'}
    >
      <!-- Pack background -->
      <div 
        class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-4 rounded-2xl transition-all duration-500"
        style="border-color: {phase === 'hint' || phase === 'tear' ? rarityConfig.color : 'rgba(251, 191, 36, 0.5)'};"
      >
        <!-- Inner pattern -->
        <div class="absolute inset-4 border-2 border-amber-500/30 rounded-xl"></div>
        
        <!-- Pack design -->
        <div class="absolute inset-0 flex flex-col items-center justify-center p-8">
          <!-- Logo area -->
          <div class="text-center mb-6">
            <div class="text-4xl md:text-5xl font-bold">
              <span class="text-amber-400">Dad</span><span class="text-white">Deck</span>
            </div>
            <div class="text-amber-400/80 text-sm mt-1">SERIES 1</div>
          </div>
          
          <!-- Pack art -->
          <div 
            class="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-6 border-2 transition-all duration-500"
            style="
              background: linear-gradient(135deg, {rarityConfig.color}33, {rarityConfig.color}11);
              border-color: {rarityConfig.color}66;
            "
          >
            <span class="text-6xl md:text-7xl">👔</span>
          </div>
          
          <!-- Pack info -->
          <div class="text-center">
            <div class="text-white font-bold text-lg">BOOSTER PACK</div>
            <div class="text-slate-400 text-sm">7 Cards Inside</div>
          </div>
        </div>
        
        <!-- Shimmer effect -->
        <div 
          class="absolute inset-0 pointer-events-none"
          class:animate-shimmer={phase === 'glow' || phase === 'hint'}
          style="
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
            background-size: 200% 100%;
          "
        ></div>
        
        <!-- Tear effect overlay -->
        {#if phase === 'tear'}
          <div class="absolute inset-0 bg-white/20 animate-flash"></div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Particles -->
  {#if phase === 'tear' || phase === 'emerge'}
    <div class="absolute inset-0 pointer-events-none">
      {#each Array(20) as _, i}
        <div 
          class="absolute w-2 h-2 rounded-full animate-particle"
          style="
            left: {50 + (Math.random() - 0.5) * 40}%;
            top: {50 + (Math.random() - 0.5) * 40}%;
            background: {rarityConfig.color};
            animation-delay: {i * 50}ms;
          "
        ></div>
      {/each}
    </div>
  {/if}
  
  <!-- Skip hint -->
  <div class="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-slate-500 text-sm">
    Click or press Space to skip
  </div>
</div>

<style>
  @keyframes packAppear {
    from {
      transform: scale(0) rotate(-10deg);
      opacity: 0;
    }
    to {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  .animate-pack-shake {
    animation: packShake 0.5s ease-in-out;
  }
  
  @keyframes packShake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-1deg); }
    20%, 40%, 60%, 80% { transform: translateX(5px) rotate(1deg); }
  }
  
  .animate-shimmer {
    animation: shimmer 1s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .animate-flash {
    animation: flash 0.3s ease-out forwards;
  }
  
  @keyframes flash {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  .animate-particle {
    animation: particleFloat 1s ease-out forwards;
  }
  
  @keyframes particleFloat {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(var(--tx, 0), var(--ty, -100px)) scale(0);
      opacity: 0;
    }
  }
</style>
