<script lang="ts">
  import { onMount } from 'svelte';

  /**
   * PageLoader Component
   *
   * Provides visual feedback during page transitions with:
   * - Progress bar at the top of the page
   * - Fade transition effects between routes
   *
   * Usage: Include in BaseLayout.astro for global page transition support
   */

  // Loading state
  let isLoading = $state(false);
  let progress = $state(0);

  // Fade transition state
  let isFadingOut = $state(false);
  let isFadingIn = $state(false);

  // Animation configuration
  const PROGRESS_DURATION = 300; // ms to fill progress bar
  const FADE_OUT_DURATION = 150; // ms for fade out
  const FADE_IN_DURATION = 200; // ms for fade in

  onMount(() => {
    // Listen for navigation events
    const handleNavigationStart = () => {
      startLoading();
    };

    const handleNavigationEnd = () => {
      stopLoading();
    };

    // Intercept link clicks
    document.addEventListener('click', interceptLinkClick);

    // Listen for browser navigation
    window.addEventListener('popstate', handleNavigationStart);

    // Listen for Astro page view transitions (if available)
    if ('navigation' in window) {
      (window as any).navigation.addEventListener('navigate', (event: any) => {
        if (!event.canIntercept) return;
        handleNavigationStart();
      });
    }

    return () => {
      document.removeEventListener('click', interceptLinkClick);
      window.removeEventListener('popstate', handleNavigationStart);
    };
  });

  /**
   * Intercept link clicks to trigger loading state
   * Only for same-origin links (not external)
   */
  function interceptLinkClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const link = target.closest('a');

    if (!link) return;

    // Skip if:
    // - Same page anchor
    // - External link
    // - Has target="_blank"
    // - Has download attribute
    // - Has data-no-load attribute
    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      link.hasAttribute('data-no-load')
    ) {
      return;
    }

    // Check if same origin
    const linkUrl = new URL(href, window.location.origin);
    if (linkUrl.origin !== window.location.origin) {
      return;
    }

    // Trigger loading state
    startLoading();
  }

  /**
   * Start the loading animation
   */
  function startLoading() {
    if (isLoading) return;

    isLoading = true;
    progress = 0;

    // Animate progress bar
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      if (!isLoading) return;

      const elapsed = currentTime - startTime;
      progress = Math.min((elapsed / PROGRESS_DURATION) * 100, 95);

      if (progress < 95) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Stop the loading animation and fade in
   */
  function stopLoading() {
    if (!isLoading) return;

    // Complete progress bar
    progress = 100;

    // Small delay then fade out
    setTimeout(() => {
      isLoading = false;
      progress = 0;
    }, 50);
  }

  /**
   * Get progress bar color based on completion
   */
  function getProgressColor(): string {
    if (progress < 30) return '#fbbf24'; // amber-400
    if (progress < 60) return '#f59e0b'; // amber-500
    return '#d97706'; // amber-600
  }
</script>

<!-- Progress Bar -->
<div
  class="page-loader-container"
  class:loading={isLoading}
  aria-hidden="true"
>
  <div
    class="page-loader-bar"
    style="width: {progress}%; background: {getProgressColor()};"
  ></div>
</div>

<!-- Fade Overlay (optional, for dramatic transitions) -->
{#if isLoading}
  <div class="page-fade-overlay"></div>
{/if}

<style>
  /* Progress Bar Container */
  .page-loader-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 9999;
    pointer-events: none;
    background: transparent;
  }

  /* Progress Bar */
  .page-loader-bar {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    transition: width 0.1s linear, background 0.3s ease;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
    will-change: width;
  }

  /* Fade Overlay */
  .page-fade-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.3);
    backdrop-filter: blur(2px);
    animation: fadeIn 0.15s ease;
    pointer-events: none;
    z-index: 9998;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .page-loader-bar {
      transition: none;
    }

    .page-fade-overlay {
      animation: none;
    }
  }
</style>
