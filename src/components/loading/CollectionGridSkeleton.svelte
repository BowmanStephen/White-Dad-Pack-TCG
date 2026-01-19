<script lang="ts">
  import CardSkeleton from './CardSkeleton.svelte';

  export let count: number = 6;
  export let columns: number = 2;

  // Calculate grid columns based on screen size
  $: gridColumns = {
    mobile: 'grid-cols-2',
    tablet: 'md:grid-cols-4',
    desktop: 'lg:grid-cols-6',
  };
</script>

<!-- Skeleton grid that matches the card grid layout -->
<div class="collection-grid-skeleton" aria-hidden="true" role="presentation">
  <div
    class="skeleton-grid {gridColumns.mobile} {gridColumns.tablet} {gridColumns.desktop}"
    style="--skeleton-count: {count};"
  >
    {#each Array(count) as _, i}
      <div class="skeleton-item" style="--skeleton-index: {i};">
        <CardSkeleton size="md" />
      </div>
    {/each}
  </div>

  <!-- Loading indicator below grid -->
  <div class="skeleton-loading">
    <div class="skeleton-spinner"></div>
    <span class="skeleton-text">Loading collection...</span>
  </div>
</div>

<style>
  .collection-grid-skeleton {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .skeleton-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  /* Tablet: 4 columns */
  @media (min-width: 768px) {
    .skeleton-grid {
      gap: 1.5rem;
    }
  }

  /* Desktop: 6 columns */
  @media (min-width: 1024px) {
    .skeleton-grid {
      gap: 2rem;
    }
  }

  /* Staggered fade-in animation for skeleton items */
  .skeleton-item {
    animation: skeletonFadeIn 0.4s ease-out both;
    animation-delay: calc(var(--skeleton-index) * 0.05s);
  }

  @keyframes skeletonFadeIn {
    0% {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Loading indicator */
  .skeleton-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem;
  }

  .skeleton-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba(251, 191, 36, 0.2);
    border-top-color: #fbbf24;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .skeleton-text {
    color: #94a3b8;
    font-size: 0.875rem;
    animation: textPulse 1.5s ease-in-out infinite;
  }

  @keyframes textPulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .skeleton-item {
      animation: none;
      opacity: 1;
    }

    .skeleton-spinner {
      animation: none;
    }

    .skeleton-text {
      animation: none;
    }
  }
</style>
