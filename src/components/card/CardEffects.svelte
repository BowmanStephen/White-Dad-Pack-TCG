<script lang="ts">
  import type { PackCard } from '../../types';
  import { RARITY_CONFIG } from '../../types';

  export let card: PackCard;
  export let isHovered: boolean = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';

  $: rarityConfig = RARITY_CONFIG[card.rarity];
  $: hasBaseGlow = ['rare', 'epic', 'legendary', 'mythic'].includes(card.rarity);
  $: glowIntensity = rarityConfig.animationIntensity;
  $: glowColor = rarityConfig.glowColor;

  // Performance detection - disable effects on low-end devices
  let holoEffectsEnabled = true;

  if (typeof window !== 'undefined') {
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 8;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    holoEffectsEnabled = !(isMobile && (hardwareConcurrency < 4 || memory < 4));
  }

  // Calculate glow style based on rarity
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
      case 'uncommon':
        return `0 0 15px ${baseGlow}, 0 0 30px ${baseGlow}55, inset 0 0 15px rgba(0,0,0,0.5)`;
      default:
        return 'none';
    }
  })();
</script>

<!-- Rarity-based glow effects container -->
<div
  class="card-effects-container"
  class:has-glow={hasBaseGlow || isHovered}
  class:glow-pulse={hasBaseGlow || isHovered}
  class:glow-hovered={isHovered}
  style="
    --rarity-glow: {rarityConfig.glowColor};
    --glow-intensity: {glowIntensity};
    --glow-color: {glowColor};
  "
>
  <!-- Corner accents (rare+) -->
  {#if ['rare', 'epic', 'legendary', 'mythic'].includes(card.rarity)}
    <div class="corner-accel top-left" style="background: linear-gradient(135deg, {rarityConfig.color}44 0%, transparent 60%);"></div>
    <div class="corner-accel top-right" style="background: linear-gradient(-135deg, {rarityConfig.color}44 0%, transparent 60%);"></div>
    <div class="corner-accel bottom-left" style="background: linear-gradient(45deg, {rarityConfig.color}44 0%, transparent 60%);"></div>
    <div class="corner-accel bottom-right" style="background: linear-gradient(-45deg, {rarityConfig.color}44 0%, transparent 60%);"></div>
  {/if}

  <!-- Sparkle particles (holo cards only) -->
  {#if card.isHolo && holoEffectsEnabled && rarityConfig.particleCount > 0}
    <div class="particles-container">
      {#each Array(rarityConfig.particleCount) as _, i}
        <span
          class="sparkle"
          style="
            left: {((i * 137.5) % 100)}%;
            top: {((i * 73.7) % 100)}%;
            font-size: {Math.random() * 8 + 4}px;
            animation-delay: {i * 0.15}s;
            opacity: {Math.random() * 0.6 + 0.2};
            text-shadow: 0 0 4px {rarityConfig.glowColor};
          "
        >✦</span>
      {/each}
    </div>
  {/if}

  <!-- Box shadow glow effect -->
  {#if hasBaseGlow || isHovered}
    <div class="glow-overlay" style="box-shadow: {glowStyle};"></div>
  {/if}
</div>

<style>
  .card-effects-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;
  }

  .corner-accel {
    position: absolute;
    width: 4rem;
    height: 4rem;
    pointer-events: none;
  }

  .corner-accel.top-left {
    top: 0;
    left: 0;
  }

  .corner-accel.top-right {
    top: 0;
    right: 0;
  }

  .corner-accel.bottom-left {
    bottom: 0;
    left: 0;
  }

  .corner-accel.bottom-right {
    bottom: 0;
    right: 0;
  }

  .particles-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 10;
  }

  .sparkle {
    position: absolute;
    color: white;
    animation: sparkle 2s ease-in-out infinite;
    will-change: transform, opacity;
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 0;
      transform: scale(0) translate(0, 0);
    }
    50% {
      opacity: 1;
      transform: scale(1) translate(0, -5px);
    }
  }

  .glow-overlay {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }

  /* Rarity glow effect with pulse animation */
  .has-glow {
    animation: rarity-glow-pulse 3s ease-in-out infinite;
    will-change: box-shadow;
    transform: translateZ(0);
  }

  /* Enhanced glow on hover */
  .glow-hovered {
    animation: rarity-glow-hover 1.5s ease-in-out infinite;
  }

  @keyframes rarity-glow-pulse {
    0%, 100% {
      box-shadow:
        0 0 calc(15px * var(--glow-intensity)) var(--glow-color),
        0 0 calc(30px * var(--glow-intensity)) var(--glow-color)88,
        0 0 calc(45px * var(--glow-intensity)) var(--glow-color)66,
        inset 0 0 calc(20px * var(--glow-intensity)) rgba(0,0,0,0.5);
    }
    50% {
      box-shadow:
        0 0 calc(20px * var(--glow-intensity)) var(--glow-color),
        0 0 calc(40px * var(--glow-intensity)) var(--glow-color)aa,
        0 0 calc(60px * var(--glow-intensity)) var(--glow-color)77,
        inset 0 0 calc(25px * var(--glow-intensity)) rgba(0,0,0,0.5);
    }
  }

  @keyframes rarity-glow-hover {
    0%, 100% {
      box-shadow:
        0 0 calc(25px * var(--glow-intensity)) var(--glow-color),
        0 0 calc(50px * var(--glow-intensity)) var(--glow-color)cc,
        0 0 calc(75px * var(--glow-intensity)) var(--glow-color)99,
        inset 0 0 calc(30px * var(--glow-intensity)) rgba(0,0,0,0.4);
    }
    50% {
      box-shadow:
        0 0 calc(35px * var(--glow-intensity)) var(--glow-color),
        0 0 calc(70px * var(--glow-intensity)) var(--glow-color)ee,
        0 0 calc(105px * var(--glow-intensity)) var(--glow-color)bb,
        inset 0 0 calc(40px * var(--glow-intensity)) rgba(0,0,0,0.4);
    }
  }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .sparkle,
    .has-glow,
    .glow-hovered {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
