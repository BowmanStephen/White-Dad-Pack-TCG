<script lang="ts">
  import type { Rarity } from '@/types';

  interface Props {
    size?: 'sm' | 'md' | 'lg';
    rarity?: Rarity;
  }

  let { size = 'md', rarity = 'common' }: Props = $props();

  const sizeClasses = {
    sm: 'w-48 h-[268px]',
    md: 'w-72 h-[403px]',
    lg: 'w-96 h-[537px]',
  };

  // Approximate border colors based on rarity
  const borderColors = {
    common: '#475569',
    uncommon: '#60a5fa',
    rare: '#fbbf24',
    epic: '#a855f7',
    legendary: '#f97316',
    mythic: '#ec4899',
  };

  const borderColor = $derived(borderColors[rarity]);
</script>

<div class="card-skeleton {sizeClasses[size]}" aria-hidden="true" role="presentation">
  <!-- Card background with shimmer -->
  <div class="skeleton-shimmer" style="border-color: {borderColor};">
    <!-- Top bar placeholder -->
    <div class="skeleton-top-bar">
      <div class="skeleton-type-badge"></div>
      <div class="skeleton-stars"></div>
    </div>

    <!-- Card name placeholder -->
    <div class="skeleton-name">
      <div class="skeleton-title"></div>
      <div class="skeleton-subtitle"></div>
    </div>

    <!-- Artwork placeholder -->
    <div class="skeleton-artwork">
      <div class="skeleton-artwork-inner"></div>
    </div>

    <!-- Stats placeholder -->
    <div class="skeleton-stats">
      {#each Array(4) as _}
        <div class="skeleton-stat-row">
          <div class="skeleton-stat-bar"></div>
        </div>
      {/each}
    </div>

    <!-- Flavor text placeholder -->
    <div class="skeleton-flavor"></div>

    <!-- Footer placeholder -->
    <div class="skeleton-footer">
      <div class="skeleton-footer-left"></div>
      <div class="skeleton-footer-center"></div>
      <div class="skeleton-footer-right"></div>
    </div>
  </div>
</div>

<style>
  .card-skeleton {
    perspective: 1200px;
  }

  .skeleton-shimmer {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a);
    border: 4px solid var(--border-color, #475569);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  }

  /* Shimmer animation overlay */
  .skeleton-shimmer::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 20%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0.03) 80%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
    will-change: transform;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(200%);
    }
  }

  /* Top bar */
  .skeleton-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent);
  }

  .skeleton-type-badge {
    width: 4rem;
    height: 1.5rem;
    background: rgba(71, 85, 105, 0.5);
    border-radius: 9999px;
  }

  .skeleton-stars {
    display: flex;
    gap: 0.125rem;
  }

  .skeleton-stars::before,
  .skeleton-stars::after {
    content: '';
    display: block;
    width: 0.625rem;
    height: 0.625rem;
    background: rgba(71, 85, 105, 0.5);
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  }

  /* Card name */
  .skeleton-name {
    padding: 0 0.75rem;
    margin-top: 0.25rem;
    text-align: center;
  }

  .skeleton-title {
    width: 80%;
    height: 1.125rem;
    margin: 0 auto 0.25rem;
    background: rgba(71, 85, 105, 0.5);
    border-radius: 0.25rem;
  }

  .skeleton-subtitle {
    width: 60%;
    height: 0.75rem;
    margin: 0 auto;
    background: rgba(71, 85, 105, 0.4);
    border-radius: 0.25rem;
  }

  /* Artwork */
  .skeleton-artwork {
    margin: 0.75rem;
    aspect-ratio: 1 / 1;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .skeleton-artwork-inner {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(71, 85, 105, 0.3) 0%,
      rgba(51, 65, 85, 0.2) 50%,
      rgba(71, 85, 105, 0.3) 100%
    );
  }

  /* Stats */
  .skeleton-stats {
    padding: 0 0.75rem;
    margin-top: 0.75rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .skeleton-stat-row {
    height: 0.625rem;
    background: rgba(71, 85, 105, 0.4);
    border-radius: 9999px;
    overflow: hidden;
  }

  .skeleton-stat-bar {
    width: 70%;
    height: 100%;
    background: rgba(148, 163, 184, 0.3);
    border-radius: 9999px;
  }

  /* Flavor text */
  .skeleton-flavor {
    margin: 0.5rem 0.75rem;
    height: 2.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
  }

  /* Footer */
  .skeleton-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3), transparent);
  }

  .skeleton-footer-left,
  .skeleton-footer-center,
  .skeleton-footer-right {
    height: 0.625rem;
    background: rgba(71, 85, 105, 0.5);
    border-radius: 0.25rem;
  }

  .skeleton-footer-left {
    width: 2rem;
  }

  .skeleton-footer-center {
    width: 2.5rem;
  }

  .skeleton-footer-right {
    width: 1.5rem;
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .skeleton-shimmer::before {
      animation: none;
    }
  }
</style>
