<script lang="ts">
  import type { Rarity } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import { onMount, onDestroy } from 'svelte';

  export let rarity: Rarity;
  export let active: boolean = false;
  export let duration: number = 1500; // ms

  const config = RARITY_CONFIG[rarity];
  const particleCount = config.particleCount;

  let particles: Array<{ id: number; x: number; y: number; vx: number; vy: number; size: number; delay: number; color: string }> = [];

  onMount(() => {
    if (particleCount > 0) {
      particles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: 50, // Start from center (%)
        y: 50, // Start from center (%)
        vx: (Math.random() - 0.5) * 40, // Velocity X (%)
        vy: (Math.random() - 0.5) * 40, // Velocity Y (%)
        size: Math.random() * 6 + 2, // Particle size (px)
        delay: Math.random() * 300, // Stagger start (ms)
        color: Math.random() > 0.5 ? config.color : config.glowColor.replace(/[^,]+(?=\))/, '0.8'),
      }));
    }
  });

  onDestroy(() => {
    particles = [];
  });
</script>

{#if active && particleCount > 0}
  <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
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
      opacity: 1;
      transform: translate(-50%, -50%) scale(0);
    }
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
