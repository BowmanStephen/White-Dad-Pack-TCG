<script lang="ts">
  import type { Rarity } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import { getParticleMultiplier, getCinematicConfig } from '../../stores/ui';
  import { isReducedMotion } from '../../stores/motion';
  import { onDestroy } from 'svelte';

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
  let particles: Array<{ id: number; x: number; y: number; vx: number; vy: number; size: number; delay: number; color: string }> = [];

  // Track cleanup function for effect
  let cleanupEffect: (() => void) | null = null;

  // Regenerate particles when settings change
  $effect(() => {
    const multiplier = getParticleMultiplier() * getCinematicConfig().particleMultiplier;
    particleCount = Math.min(
      Math.floor(baseParticleCount * multiplier),
      MAX_PARTICLES_MOBILE
    );

    if (particleCount > 0) {
      particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: 50,
        y: 50,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        size: Math.random() * 6 + 2,
        delay: Math.random() * 300,
        color: Math.random() > 0.5 ? config.color : config.glowColor.replace(/[^,]+(?=\))/, '0.8'),
      }));
    } else {
      particles = [];
    }

    // Return cleanup function to stop effect tracking after unmount
    return () => {
      particles = [];
      particleCount = 0;
    };
  });

  // Ensure cleanup on component destroy
  onDestroy(() => {
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
