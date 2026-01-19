<script lang="ts">
  import { RARITY_CONFIG } from '../../types';
  import type { Rarity } from '../../types';

  // Props
  interface Props {
    rarity: Rarity;
    isHolo?: boolean;
  }

  let { rarity, isHolo = false }: Props = $props();
</script>

<div
  class="rarity-badge"
  class:holo={isHolo}
  style="--rarity-color: {RARITY_CONFIG[rarity].color}"
>
  <span class="badge-text">{RARITY_CONFIG[rarity].name.toUpperCase()}</span>
  {#if isHolo}
    <span class="sparkle">✨</span>
  {/if}
</div>

<style>
  .rarity-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: var(--rarity-color, #9ca3af);
    border: 2px solid white;
    border-radius: 0.375rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 10;
    min-width: 2.5rem;
    text-align: center;
    backdrop-filter: blur(4px);
  }

  .badge-text {
    display: block;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    line-height: 1;
  }

  /* Holo variant with sparkly effect */
  .rarity-badge.holo {
    background: linear-gradient(
      135deg,
      var(--rarity-color, #9ca3af),
      rgba(255, 255, 255, 0.3)
    );
    animation: shimmer 2s ease-in-out infinite;
  }

  .sparkle {
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 0.625rem;
    line-height: 1;
    animation: sparkle 1.5s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%, 100% {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    50% {
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.3),
        0 0 12px var(--rarity-color, rgba(156, 163, 175, 0.5));
    }
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.2);
    }
  }

  /* Responsive adjustments */
  @media (min-width: 768px) {
    .rarity-badge {
      top: 0.75rem;
      right: 0.75rem;
      padding: 0.375rem 0.625rem;
      min-width: 3rem;
    }

    .badge-text {
      font-size: 0.7rem;
    }

    .sparkle {
      font-size: 0.7rem;
      top: -6px;
      right: -6px;
    }
  }
</style>
