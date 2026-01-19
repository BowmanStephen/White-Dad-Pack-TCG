<script lang="ts">
  import type { Rarity } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import { getParticleMultiplier, getCinematicConfig } from '../../stores/ui';
  import { isReducedMotion } from '../../stores/motion';
  import { onDestroy } from 'svelte';
  import { createThrottledRAF, rafSchedule } from '../../lib/utils/performance';

  interface Props {
    rarity: Rarity;
    active?: boolean;
    duration?: number;
  }

  let { rarity, active = false, duration = 1500 }: Props = $props();

  const config = RARITY_CONFIG[rarity];
  const baseParticleCount = config.particleCount;

  // Get both quality and cinematic multipliers for enhanced effects
  const qualityMultiplier = $derived(getParticleMultiplier());
  const cinematicConfig = $derived(getCinematicConfig());

  // PACK-057: Check reduced motion state
  const reducedMotion = $derived(isReducedMotion.get());

  // Combined multiplier: cinematic mode doubles particles on top of quality setting
  // PACK-057: Reduce to 0 when reduced motion is enabled
  const combinedMultiplier = $derived(reducedMotion ? 0 : (qualityMultiplier * cinematicConfig.particleMultiplier));

  // Mobile performance cap - prevent frame drops on mid-tier devices
  // Mythic cards can hit 160 particles with max settings, which drops frames
  const MAX_PARTICLES_MOBILE = 120;

  // Reactive particle count based on quality AND cinematic settings
  let particleCount = $state(
    Math.min(
      Math.floor(baseParticleCount * combinedMultiplier),
      MAX_PARTICLES_MOBILE
    )
  );

  // PACK-VFX-027: Object pooling for particle reuse
  // Pre-allocate particle objects to reduce garbage collection pressure
  const PARTICLE_POOL_SIZE = 150; // Maximum particles across all rarities
  const particlePool: Array<{ id: number; x: number; y: number; vx: number; vy: number; size: number; delay: number; color: string }> = [];

  // Initialize particle pool once
  for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
    particlePool.push({
      id: i,
      x: 50,
      y: 50,
      vx: 0,
      vy: 0,
      size: 4,
      delay: 0,
      color: '#ffffff',
    });
  }

  // PACK-VFX-008: Color interpolation for mythic rarity
  // Prismatic rainbow effect transitioning through all 6 rarity colors
  function getMythicParticleColor(index: number): string {
    const colors = [
      '#6b7280', // common (gray)
      '#3b82f6', // uncommon (blue)
      '#d97706', // rare (amber)
      '#9333ea', // epic (purple)
      '#ea580c', // legendary (orange)
      '#db2777', // mythic (pink)
    ];

    // Each particle cycles through colors based on its index
    const colorIndex = index % colors.length;
    return colors[colorIndex];
  }

  let particles: Array<{ id: number; x: number; y: number; vx: number; vy: number; size: number; delay: number; color: string }> = [];

  // PACK-VFX-027: Track RAF loop for smooth 60fps updates
  let rafLoop: ReturnType<typeof createThrottledRAF> | null = null;
  let animationStartTime = 0;

  // Regenerate particles when settings change
  $effect(() => {
    const multiplier = getParticleMultiplier() * getCinematicConfig().particleMultiplier;
    particleCount = Math.min(
      Math.floor(baseParticleCount * multiplier),
      MAX_PARTICLES_MOBILE
    );

    if (particleCount > 0) {
      // PACK-VFX-027: Use object pooling - reuse particle objects instead of creating new ones
      particles = particlePool.slice(0, particleCount).map((particle, i) => {
        // PACK-VFX-008: Use prismatic color interpolation for mythic rarity
        const particleColor = rarity === 'mythic'
          ? getMythicParticleColor(i)
          : (Math.random() > 0.5 ? config.color : config.glowColor.replace(/[^,]+(?=\))/, '0.8'));

        // Update existing particle object instead of creating new one
        particle.x = 50;
        particle.y = 50;
        particle.vx = (Math.random() - 0.5) * 40;
        particle.vy = (Math.random() - 0.5) * 40;
        particle.size = Math.random() * 6 + 2;
        particle.delay = Math.random() * 300;
        particle.color = particleColor;

        return particle;
      });

      // PACK-VFX-027: Start RAF loop for smooth 60fps updates
      animationStartTime = performance.now();
      rafLoop = createThrottledRAF((deltaTime) => {
        // Track animation progress for cleanup
        const elapsed = performance.now() - animationStartTime;
        if (elapsed > duration + 500) {
          // Animation complete, stop RAF loop
          rafLoop?.stop();
        }
      }, 60);
      rafLoop.start();

    } else {
      particles = [];
      rafLoop?.stop();
    }

    // Return cleanup function to stop effect tracking after unmount
    return () => {
      particles = [];
      particleCount = 0;
      rafLoop?.stop();
    };
  });

  // Ensure cleanup on component destroy
  onDestroy(() => {
    rafLoop?.stop();
    particles = [];
    particleCount = 0;
  });
</script>

{#if active && particleCount > 0}
  <div class="particle-container absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
    {#each particles as particle (particle.id)}
      <div
        class="particle"
        style="
          left: {particle.x}%;
          top: {particle.y}%;
          width: {particle.size}px;
          height: {particle.size}px;
          background: {particle.color};
          box-shadow: 0 0 {particle.size * 2}px {particle.color};
          animation-delay: {particle.delay}ms;
          --vx: {particle.vx}%;
          --vy: {particle.vy}%;
          animation-duration: {duration}ms;
        "
      ></div>
    {/each}
  </div>
{/if}

<style>
  .particle-container {
    /* CSS containment for performance optimization */
    contain: layout style paint;
    /* Prevent the browser from recalculating layout outside this container */
  }

  .particle {
    position: absolute;
    border-radius: 50%;
    opacity: 0;
    transform: translate(-50%, -50%);
    animation: particle-burst ease-out forwards;
    will-change: transform, opacity;
    /* GPU acceleration hint */
    transform: translateZ(0);
  }

  /* Reduce box-shadow calculations for mobile performance */
  @media (max-width: 768px) {
    .particle {
      box-shadow: 0 0 2px currentColor;
    }
  }

  @keyframes particle-burst {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
    /* PACK-VFX-007: Fade-in effect over first 20% (0.3s of 1.5s duration) */
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.5);
    }
    100% {
      opacity: 0;
      transform: translate(calc(-50% + var(--vx)), calc(-50% + var(--vy))) scale(0);
    }
  }
</style>
