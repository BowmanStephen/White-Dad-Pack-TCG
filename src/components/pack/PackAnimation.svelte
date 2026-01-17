<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Rarity } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import * as uiStore from '../../stores/ui';

  export let bestRarity: Rarity = 'common';

  const dispatch = createEventDispatcher();

  let phase: 'appear' | 'glow' | 'tear' | 'burst' = 'appear';
  let packElement: HTMLDivElement;
  let animationFrameId: number | null = null;
  let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
  let reducedMotion = false;

  $: rarityConfig = RARITY_CONFIG[bestRarity];
  $: glowColor = rarityConfig.glowColor;
  $: particleCount = reducedMotion ? 0 : rarityConfig.particleCount;

  // Animation timing (1.5-2 second total duration)
  const PHASE_DURATIONS = {
    appear: 400,   // Pack appears with scale
    glow: 600,     // Glow intensifies
    tear: 500,     // Tear animation
    burst: 300,    // Final burst and fade
  };

  // Total: 1.8 seconds (within 1.5-2s requirement)

  onMount(() => {
    // Subscribe to reduced motion preference
    const unsubscribe = uiStore.$prefersReducedMotion.subscribe((value) => {
      reducedMotion = value;
    });

    // Start animation
    runAnimation();

    // Cleanup function
    return () => {
      unsubscribe();
      // Cleanup animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  });

  async function runAnimation() {
    // Phase 1: Pack appears (with ease-out)
    phase = 'appear';
    await delay(PHASE_DURATIONS.appear);

    // Phase 2: Pack glows (builds anticipation)
    phase = 'glow';
    await delay(PHASE_DURATIONS.glow);

    // Phase 3: Pack tears open (the main event)
    phase = 'tear';

    // Sound effect placeholder
    // TODO: Add sound effect here
    // Example: playSound('pack-tear');
    // Sound should trigger at the exact moment of tear

    // Initialize particles for burst phase
    if (!reducedMotion) {
      initParticles();
      animateParticles();
    }

    await delay(PHASE_DURATIONS.tear);

    // Phase 4: Burst and fade
    phase = 'burst';
    await delay(PHASE_DURATIONS.burst);

    // Stop particle animation
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

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

  // Particle system for tear burst (60fps optimized)
  function initParticles() {
    particles = [];
    const count = particleCount || 10;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        alpha: 1,
      });
    }
  }

  function animateParticles() {
    if (phase !== 'burst') return;

    // Update particle positions
    particles = particles.map(p => ({
      ...p,
      x: p.x + p.vx * 0.3,
      y: p.y + p.vy * 0.3,
      alpha: p.alpha - 0.02,
      size: p.size * 0.98,
    })).filter(p => p.alpha > 0);

    if (particles.length > 0 && phase === 'burst') {
      animationFrameId = requestAnimationFrame(animateParticles);
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
  <!-- Glow effect (builds anticipation) -->
  <div
    class="absolute inset-0 rounded-2xl blur-3xl transition-all duration-300 ease-out"
    class:opacity-0={phase === 'appear'}
    class:opacity-40={phase === 'glow'}
    class:opacity-80={phase === 'tear' || phase === 'burst'}
    class:scale-125={phase === 'tear'}
    class:scale-150={phase === 'burst'}
    style:background={glowColor}
  ></div>

  <!-- Pack container -->
  <div
    class="relative w-64 h-96 md:w-80 md:h-[480px] transition-all duration-300 ease-out"
    class:scale-0={phase === 'appear'}
    class:scale-100={phase === 'glow'}
    class:scale-105={phase === 'tear'}
    class:scale-110={phase === 'burst'}
    class:opacity-0={phase === 'burst'}
    style:animation={phase === 'appear' ? 'packAppear 0.4s ease-out forwards' : 'none'}
  >
    <!-- Pack wrapper with shake during tear -->
    <div
      class="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200 ease-out"
      class:animate-pack-shake={phase === 'tear'}
    >
      <!-- Pack background -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-4 rounded-2xl transition-all duration-300 ease-out"
        style:border-color={phase === 'tear' || phase === 'burst' ? rarityConfig.color : 'rgba(251, 191, 36, 0.5)'}
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
            class="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-6 border-2 transition-all duration-300 ease-out"
            style:background="linear-gradient(135deg, {rarityConfig.color}33, {rarityConfig.color}11)"
            style:border-color="{rarityConfig.color}66"
          >
            <span class="text-6xl md:text-7xl">👔</span>
          </div>

          <!-- Pack info -->
          <div class="text-center">
            <div class="text-white font-bold text-lg">BOOSTER PACK</div>
            <div class="text-slate-400 text-sm">7 Cards Inside</div>
          </div>
        </div>

        <!-- Shimmer effect (anticipation) -->
        <div
          class="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
          class:opacity-0={phase === 'appear' || phase === 'burst'}
          class:opacity-100={phase === 'glow' || phase === 'tear'}
          class:animate-shimmer={phase === 'glow' || phase === 'tear'}
          style="background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%); background-size: 200% 100%;"
        ></div>

        <!-- SVG Tear effect overlay -->
        {#if phase === 'tear' || phase === 'burst'}
          <div class="absolute inset-0 pointer-events-none">
            <svg
              viewBox="0 0 400 600"
              class="w-full h-full"
              style="overflow: visible;"
            >
              <!-- Tear line from top to bottom with jagged edges -->
              <path
                d="M 200 0 L 195 100 L 205 150 L 192 200 L 208 250 L 193 300 L 207 350 L 194 400 L 206 450 L 195 500 L 205 600"
                fill="none"
                stroke={rarityConfig.color}
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="animate-tear-line"
                style="filter: drop-shadow(0 0 8px {rarityConfig.color});"
              />
              <!-- Tear flare effect -->
              <circle
                cx="200"
                cy="300"
                r="{phase === 'burst' ? 150 : 0}"
                fill={rarityConfig.color}
                fill-opacity="0.3"
                class="transition-all duration-300 ease-out"
              />
            </svg>
          </div>
        {/if}

        <!-- White flash on tear -->
        {#if phase === 'tear'}
          <div class="absolute inset-0 bg-white/30 animate-flash-ease-out"></div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Particle burst (60fps optimized) -->
  {#if (phase === 'tear' || phase === 'burst') && !reducedMotion}
    <div class="absolute inset-0 pointer-events-none">
      {#each particles as particle, i}
        <div
          class="absolute rounded-full"
          style:left="{particle.x}%"
          style:top="{particle.y}%"
          style:width="{particle.size}px"
          style:height="{particle.size}px"
          style:background={rarityConfig.color}
          style:opacity={particle.alpha}
          style:transform="translate(-50%, -50%)"
        ></div>
      {/each}
    </div>
  {/if}

  <!-- Skip hint -->
  <div class="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-slate-500 text-sm transition-opacity duration-300"
       class:opacity-0={phase === 'burst'}>
    Click or press Space to skip
  </div>
</div>

<style>
  /* Pack appear animation - ease-out timing */
  @keyframes packAppear {
    from {
      transform: scale(0) rotate(-15deg);
      opacity: 0;
    }
    to {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  /* Pack shake animation - ease-out timing */
  .animate-pack-shake {
    animation: packShake 0.5s ease-out;
  }

  @keyframes packShake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) rotate(-0.5deg); }
    20%, 40%, 60%, 80% { transform: translateX(4px) rotate(0.5deg); }
  }

  /* Shimmer effect - ease-in-out for smooth looping */
  .animate-shimmer {
    animation: shimmer 1s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Flash effect - ease-out for smooth fade */
  .animate-flash-ease-out {
    animation: flashEaseOut 0.3s ease-out forwards;
  }

  @keyframes flashEaseOut {
    0% { opacity: 0; }
    30% { opacity: 1; }
    100% { opacity: 0; }
  }

  /* Tear line animation - ease-out */
  .animate-tear-line {
    animation: tearLineDraw 0.5s ease-out forwards;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }

  @keyframes tearLineDraw {
    to {
      stroke-dashoffset: 0;
    }
  }

  /* Performance optimization - only animate transform and opacity */
  .animate-pack-shake,
  .animate-shimmer,
  .animate-flash-ease-out,
  .animate-tear-line {
    will-change: transform, opacity;
  }
</style>
