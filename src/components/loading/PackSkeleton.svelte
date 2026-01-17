<script lang="ts">
  // Pack skeleton component for showing while pack is being generated
  // Displays an animated pack placeholder with shimmer effect
</script>

<div class="pack-skeleton" aria-hidden="true" role="presentation">
  <!-- Pack outer container -->
  <div class="pack-outer">
    <!-- Shimmer overlay -->
    <div class="pack-shimmer"></div>

    <!-- Pack design elements -->
    <div class="pack-design">
      <!-- Logo area -->
      <div class="pack-logo">
        <div class="pack-logo-text skeleton-pulse"></div>
      </div>

      <!-- Center icon -->
      <div class="pack-icon skeleton-pulse"></div>

      <!-- Decorative corners -->
      <div class="pack-corner pack-corner-tl"></div>
      <div class="pack-corner pack-corner-tr"></div>
      <div class="pack-corner pack-corner-bl"></div>
      <div class="pack-corner pack-corner-br"></div>

      <!-- Border accents -->
      <div class="pack-border pack-border-1"></div>
      <div class="pack-border pack-border-2"></div>
    </div>
  </div>

  <!-- Loading text below pack -->
  <div class="pack-loading-text">
    <div class="loading-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</div>

<style>
  .pack-skeleton {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .pack-outer {
    position: relative;
    width: 200px;
    height: 280px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.1);
    overflow: hidden;
  }

  /* Shimmer animation overlay */
  .pack-shimmer {
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
    animation: packShimmer 2s infinite;
    will-change: transform;
  }

  @keyframes packShimmer {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(200%);
    }
  }

  .pack-design {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  /* Logo area */
  .pack-logo {
    margin-bottom: 2rem;
  }

  .pack-logo-text {
    width: 120px;
    height: 32px;
    background: linear-gradient(90deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.3));
    border-radius: 8px;
  }

  /* Center icon */
  .pack-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.25));
    border-radius: 50%;
    margin-bottom: 2rem;
  }

  /* Decorative corners */
  .pack-corner {
    position: absolute;
    width: 32px;
    height: 32px;
    background: rgba(251, 191, 36, 0.2);
  }

  .pack-corner-tl {
    top: 16px;
    left: 16px;
    border-top-left-radius: 8px;
  }

  .pack-corner-tr {
    top: 16px;
    right: 16px;
    border-top-right-radius: 8px;
  }

  .pack-corner-bl {
    bottom: 16px;
    left: 16px;
    border-bottom-left-radius: 8px;
  }

  .pack-corner-br {
    bottom: 16px;
    right: 16px;
    border-bottom-right-radius: 8px;
  }

  /* Border accents */
  .pack-border {
    position: absolute;
    background: rgba(251, 191, 36, 0.15);
  }

  .pack-border-1 {
    top: 50%;
    left: 16px;
    right: 16px;
    height: 2px;
    transform: translateY(-50%);
  }

  .pack-border-2 {
    left: 50%;
    top: 50%;
    width: 2px;
    transform: translate(-50%, -50%);
    height: 120px;
  }

  /* Pulse animation for pack elements */
  .skeleton-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  /* Loading text */
  .pack-loading-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .loading-dots {
    display: flex;
    gap: 0.375rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    background: #fbbf24;
    border-radius: 50%;
    animation: dotBounce 1.4s ease-in-out infinite;
  }

  .dot:nth-child(1) {
    animation-delay: 0s;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes dotBounce {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .pack-shimmer,
    .skeleton-pulse,
    .dot {
      animation: none !important;
    }

    .dot {
      opacity: 0.6;
    }
  }
</style>
