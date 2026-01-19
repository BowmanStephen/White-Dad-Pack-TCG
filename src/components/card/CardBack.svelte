<script lang="ts">
  import type { Rarity } from '../../types';

  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let isHolo: boolean = false;
  export let rarity: Rarity = 'common';

  const sizeClasses = {
    sm: 'w-48 h-[268px]',
    md: 'w-72 h-[403px]',
    lg: 'w-96 h-[537px]',
  };

  // Border color based on rarity
  $: borderColor = (() => {
    switch (rarity) {
      case 'common':
      case 'uncommon':
        return '#9ca3af';
      case 'rare':
        return '#fbbf24';
      case 'epic':
        return '#a855f7';
      case 'legendary':
        return '#f97316';
      case 'mythic':
        return '#ec4899';
      default:
        return '#9ca3af';
    }
  })();

  // Glow color based on rarity
  $: glowColor = (() => {
    switch (rarity) {
      case 'common':
      case 'uncommon':
        return 'rgba(156, 163, 175, 0.3)';
      case 'rare':
        return 'rgba(251, 191, 36, 0.3)';
      case 'epic':
        return 'rgba(168, 85, 247, 0.3)';
      case 'legendary':
        return 'rgba(249, 115, 22, 0.3)';
      case 'mythic':
        return 'rgba(236, 72, 153, 0.3)';
      default:
        return 'rgba(156, 163, 175, 0.3)';
    }
  })();

  // Holo overlay opacity
  $: holoOpacity = isHolo ? 0.4 : 0;

  // Pattern animation offset (subtle movement)
  let patternOffset = 0;

  import { onMount, onDestroy } from 'svelte';
  let animationFrame: number | null = null;

  function animatePattern() {
    patternOffset = (patternOffset + 0.1) % 20;
    animationFrame = requestAnimationFrame(animatePattern);
  }

  onMount(() => {
    animationFrame = requestAnimationFrame(animatePattern);
  });

  onDestroy(() => {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<div class="card-back-container {sizeClasses[size]} relative overflow-hidden" aria-hidden="true">
  <!-- SVG Card Back Design -->
  <svg
    viewBox="0 0 400 550"
    class="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <!-- Main background gradient -->
      <linearGradient id="backGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#334155;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
      </linearGradient>

      <!-- Diagonal stripe pattern -->
      <pattern id="stripePattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#1e293b"/>
        <path d="M0,20 L20,0" stroke="#475569" stroke-width="0.5" opacity="0.3"/>
      </pattern>

      <!-- Radial gradient for center highlight -->
      <radialGradient id="centerHighlight" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:0.15" />
        <stop offset="70%" style="stop-color:#fbbf24;stop-opacity:0.05" />
        <stop offset="100%" style="stop-color:#1e293b;stop-opacity:0" />
      </radialGradient>

      <!-- Corner decoration gradient -->
      <linearGradient id="cornerGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:0.8" />
        <stop offset="100%" style="stop-color:#d97706;stop-opacity:0.6" />
      </linearGradient>

      <!-- Logo glow filter -->
      <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <!-- Holographic rainbow gradient -->
      <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff0080;stop-opacity:0.6">
          <animate attributeName="stop-color" values="#ff0080;#8000ff;#0080ff;#00ffff;#00ff80;#80ff00;#ff8000;#ff0080" dur="4s" repeatCount="indefinite"/>
        </stop>
        <stop offset="50%" style="stop-color:#00ffff;stop-opacity:0.4">
          <animate attributeName="stop-color" values="#00ffff;#00ff80;#80ff00;#ff8000;#ff0080;#8000ff;#0080ff;#00ffff" dur="4s" repeatCount="indefinite"/>
        </stop>
        <stop offset="100%" style="stop-color:#ff8000;stop-opacity:0.6">
          <animate attributeName="stop-color" values="#ff8000;#ff0080;#8000ff;#0080ff;#00ffff;#00ff80;#80ff00;#ff8000" dur="4s" repeatCount="indefinite"/>
        </stop>
      </linearGradient>

      <!-- Holo sparkle pattern -->
      <pattern id="holoSparkle" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
        <circle cx="25" cy="25" r="1" fill="white" opacity="0.5">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0s"/>
        </circle>
        <circle cx="10" cy="40" r="0.5" fill="white" opacity="0.3">
          <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
        <circle cx="40" cy="10" r="0.5" fill="white" opacity="0.3">
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" begin="1s"/>
        </circle>
      </pattern>

      <!-- Inner shadow for depth -->
      <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feComponentTransfer in="SourceAlpha">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="3"/>
        <feOffset dx="2" dy="2" result="offsetblur"/>
        <feFlood flood-color="rgba(0,0,0,0.5)" result="color"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feComposite in2="SourceAlpha" operator="in" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode />
        </feMerge>
      </filter>
    </defs>

    <!-- Base background with pattern -->
    <rect width="400" height="550" fill="url(#backGradient)"/>
    <rect width="400" height="550" fill="url(#stripePattern)" opacity="0.5"/>

    <!-- Center highlight -->
    <circle cx="200" cy="275" r="200" fill="url(#centerHighlight)"/>

    <!-- Outer border (rarity-colored) -->
    <rect x="2" y="2" width="396" height="546" rx="12" ry="12"
          fill="none" stroke={borderColor} stroke-width="4"
          filter="url(#logoGlow)"/>

    <!-- Decorative inner borders -->
    <rect x="12" y="12" width="376" height="526" rx="8" ry="8"
          fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.3"/>
    <rect x="18" y="18" width="364" height="514" rx="6" ry="6"
          fill="none" stroke="#fbbf24" stroke-width="0.5" opacity="0.2"/>
    <rect x="24" y="24" width="352" height="502" rx="4" ry="4"
          fill="none" stroke="#fbbf24" stroke-width="0.25" opacity="0.1"/>

    <!-- Corner decorations -->
    <g opacity="0.8">
      <!-- Top left -->
      <path d="M 12,12 L 12,40 Q 12,45 17,45 L 45,45 L 45,42 L 17,42 Q 15,42 15,40 L 15,12 Z"
            fill="url(#cornerGold)"/>
      <!-- Top right -->
      <path d="M 388,12 L 388,40 Q 388,45 383,45 L 355,45 L 355,42 L 383,42 Q 385,42 385,40 L 385,12 Z"
            fill="url(#cornerGold)"/>
      <!-- Bottom left -->
      <path d="M 12,538 L 12,510 Q 12,505 17,505 L 45,505 L 45,508 L 17,508 Q 15,508 15,510 L 15,538 Z"
            fill="url(#cornerGold)"/>
      <!-- Bottom right -->
      <path d="M 388,538 L 388,510 Q 388,505 383,505 L 355,505 L 355,508 L 383,508 Q 385,508 385,510 L 385,538 Z"
            fill="url(#cornerGold)"/>
    </g>

    <!-- Center logo design -->
    <g filter="url(#logoGlow)">
      <!-- Outer ring -->
      <circle cx="200" cy="275" r="80" fill="none" stroke="#fbbf24" stroke-width="2" opacity="0.6"/>
      <circle cx="200" cy="275" r="75" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.4"/>

      <!-- Tie icon (dad symbol) -->
      <g transform="translate(200, 260)">
        <!-- Tie shape -->
        <path d="M -15,-25 L 15,-25 L 20,-15 L 5,0 L 5,35 L -5,35 L -5,0 L -20,-15 Z"
              fill="#fbbf24" opacity="0.9"/>
        <!-- Tie knot -->
        <rect x="-8" y="-30" width="16" height="8" rx="2" fill="#fbbf24"/>
        <!-- Collar left -->
        <path d="M -20,-15 Q -25,-20 -30,-15 L -20,-5 Z" fill="#fbbf24" opacity="0.7"/>
        <!-- Collar right -->
        <path d="M 20,-15 Q 25,-20 30,-15 L 20,-5 Z" fill="#fbbf24" opacity="0.7"/>
      </g>

      <!-- "DadDeck™" text -->
      <text x="200" y="330" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="32" font-weight="900" fill="#fbbf24">
        DadDeck<tspan font-size="20">™</tspan>
      </text>

      <!-- "SERIES 1" text -->
      <text x="200" y="355" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#94a3b8" letter-spacing="4">
        SERIES 1
      </text>
    </g>

    <!-- Bottom tagline -->
    <text x="200" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-style="italic" fill="#64748b">
      "Collect Every Dad"
    </text>

    <!-- Small corner icons -->
    <g fill="#fbbf24" opacity="0.5">
      <!-- Grill icon (top left) -->
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="16" height="12" rx="1" stroke="#fbbf24" stroke-width="1" fill="none"/>
        <line x1="3" y1="0" x2="3" y2="12" stroke="#fbbf24" stroke-width="0.5"/>
        <line x1="6" y1="0" x2="6" y2="12" stroke="#fbbf24" stroke-width="0.5"/>
        <line x1="9" y1="0" x2="9" y2="12" stroke="#fbbf24" stroke-width="0.5"/>
        <line x1="12" y1="0" x2="12" y2="12" stroke="#fbbf24" stroke-width="0.5"/>
      </g>

      <!-- Remote icon (top right) -->
      <g transform="translate(354, 30)">
        <rect x="0" y="0" width="10" height="16" rx="2" stroke="#fbbf24" stroke-width="1" fill="none"/>
        <circle cx="5" cy="4" r="1.5" fill="#fbbf24"/>
        <circle cx="5" cy="8" r="1.5" fill="#fbbf24"/>
        <circle cx="5" cy="12" r="1.5" fill="#fbbf24"/>
      </g>

      <!-- Beer icon (bottom left) -->
      <g transform="translate(30, 504)">
        <path d="M 3,0 L 13,0 L 13,12 L 3,12 Z" stroke="#fbbf24" stroke-width="1" fill="none"/>
        <path d="M 13,3 L 17,3 L 17,7 L 13,7" stroke="#fbbf24" stroke-width="1" fill="none"/>
        <line x1="3" y1="3" x2="13" y2="3" stroke="#fbbf24" stroke-width="0.5"/>
        <line x1="3" y1="6" x2="13" y2="6" stroke="#fbbf24" stroke-width="0.5"/>
        <line x1="3" y1="9" x2="13" y2="9" stroke="#fbbf24" stroke-width="0.5"/>
      </g>

      <!-- Tool icon (bottom right) -->
      <g transform="translate(356, 504)">
        <path d="M 8,0 L 10,6 L 8,12 L 6,12 L 4,6 L 6,0 Z" stroke="#fbbf24" stroke-width="1" fill="none"/>
        <circle cx="7" cy="14" r="2" stroke="#fbbf24" stroke-width="1" fill="none"/>
      </g>
    </g>

    <!-- Holographic overlay (only if isHolo is true) -->
    {#if isHolo}
      <g opacity={holoOpacity}>
        <!-- Rainbow gradient overlay -->
        <rect width="400" height="550" fill="url(#holoGradient)" style="mix-blend-mode: color-dodge;"/>

        <!-- Sparkle pattern -->
        <rect width="400" height="550" fill="url(#holoSparkle)" style="mix-blend-mode: overlay;"/>

        <!-- Diagonal sheen -->
        <rect width="400" height="550" fill="url(#holoGradient)" opacity="0.3"
              transform="rotate(45, 200, 275)" style="mix-blend-mode: screen;">
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite"/>
        </rect>
      </g>
    {/if}

    <!-- Vignette effect for depth -->
    <rect width="400" height="550" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="40" opacity="0.5"/>

    <!-- Glossy overlay (subtle) -->
    <rect width="400" height="550" fill="url(#centerHighlight)" opacity="0.1"/>
  </svg>

  <!-- CSS-based border glow (rarity-matched) -->
  <div class="absolute inset-0 pointer-events-none rounded-xl" style="box-shadow: 0 0 20px {glowColor}, inset 0 0 20px rgba(0,0,0,0.5);"></div>
</div>

<style>
  .card-back-container {
    border-radius: 12px;
    overflow: hidden;
  }
</style>
