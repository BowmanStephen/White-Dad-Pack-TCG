<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    getNextRecentlyUnlocked,
    clearRecentlyUnlocked,
  } from '../../stores/achievements';
  import type { Achievement } from '../../types';
  import { ACHIEVEMENT_RARITY_CONFIG } from '../../types';

  // Props
  export let show = false;
  export let onClose = () => {};

  // Current achievement to display
  let currentAchievement: Achievement | null = null;
  let isVisible = false;
  let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  // Animation states
  let slideIn = false;
  let pulse = false;

  // Screen reader announcement
  let announcement = '';
  $: if (currentAchievement && isVisible) {
    announcement = `Achievement unlocked: ${currentAchievement.name}. ${currentAchievement.description}`;
  }

  // Load next achievement when popup opens
  $: if (show && !currentAchievement) {
    loadNextAchievement();
  }

  // Close when show becomes false
  $: if (!show && currentAchievement) {
    cleanup();
  }

  function loadNextAchievement() {
    currentAchievement = getNextRecentlyUnlocked();

    if (currentAchievement) {
      // Trigger slide-in animation
      isVisible = true;
      slideIn = true;

      // Pulse effect for higher rarities
      if (currentAchievement.rarity === 'gold' || currentAchievement.rarity === 'platinum') {
        pulse = true;
      }

      // Auto-close after 5 seconds
      autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 5000);
    } else {
      // No more achievements, close popup
      onClose();
    }
  }

  function handleClose() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    slideIn = false;

    // Wait for slide-out animation before cleaning up
    setTimeout(() => {
      cleanup();
      // Try loading next achievement
      loadNextAchievement();
      if (!currentAchievement) {
        onClose();
      }
    }, 300);
  }

  function cleanup() {
    isVisible = false;
    slideIn = false;
    pulse = false;
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }

  function handleShare() {
    if (!currentAchievement) return;

    // Generate badge data URL
    const badgeDataUrl = generateAchievementBadge(currentAchievement);

    if (badgeDataUrl) {
      // Create a temporary link to download the badge
      const link = document.createElement('a');
      link.href = badgeDataUrl;
      link.download = `achievement-${currentAchievement.id}.svg`;
      link.click();
    }
  }

  function generateAchievementBadge(achievement: Achievement): string | null {
    const width = 400;
    const height = 200;
    const rarityConfig = ACHIEVEMENT_RARITY_CONFIG[achievement.rarity];

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="${rarityConfig.bgColor}" rx="12"/>
        <rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${rarityConfig.borderColor}" stroke-width="4" rx="10"/>
        <text x="30" y="${height / 2}" font-size="48" text-anchor="middle" dominant-baseline="middle">${achievement.icon}</text>
        <text x="100" y="${height / 2 - 20}" font-size="24" font-weight="bold" fill="#1f2937">${achievement.name}</text>
        <text x="100" y="${height / 2 + 15}" font-size="14" fill="#374151">${achievement.description}</text>
        <text x="${width - 60}" y="${height - 20}" font-size="12" fill="#4b5563" text-anchor="end">DadDeck™</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }

  // Clean up on destroy
  onDestroy(() => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
  });
</script>

<!-- Live region for screen reader announcements -->
<div aria-live="assertive" aria-atomic="true" class="sr-only" role="alert">
  {announcement}
</div>

{#if show && currentAchievement}
  <div
    class="achievement-popup-overlay"
    class:visible={isVisible}
    on:click={handleClose}
    role="presentation"
  >
    <div
      class="achievement-popup"
      class:slide-in={slideIn}
      class:pulse={pulse}
      style="--achievement-color: {ACHIEVEMENT_RARITY_CONFIG[currentAchievement.rarity].color};
             --achievement-border: {ACHIEVEMENT_RARITY_CONFIG[currentAchievement.rarity].borderColor};
             --achievement-glow: {ACHIEVEMENT_RARITY_CONFIG[currentAchievement.rarity].glowColor};"
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-title"
    >
      <!-- Close button -->
      <button class="close-btn" on:click={handleClose} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          />
        </svg>
      </button>

      <!-- Achievement icon -->
      <div class="achievement-icon">{currentAchievement.icon}</div>

      <!-- Achievement info -->
      <div class="achievement-info">
        <div class="achievement-rarity">
          <span
            class="rarity-badge"
            style="background-color: var(--achievement-color); border-color: var(--achievement-border);"
          >
            {currentAchievement.rarity.charAt(0).toUpperCase() + currentAchievement.rarity.slice(1)}
          </span>
        </div>

        <h2 id="achievement-title" class="achievement-title">{currentAchievement.name}</h2>

        <p class="achievement-description">{currentAchievement.description}</p>

        {#if currentAchievement.maxProgress}
          <div class="achievement-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                style="width: {((currentAchievement.progress || 0) / currentAchievement.maxProgress) * 100}%; background-color: var(--achievement-color);"
              ></div>
            </div>
            <span class="progress-text"
              >{currentAchievement.progress || 0} / {currentAchievement.maxProgress}</span
            >
          </div>
        {/if}

        <!-- Share button -->
        <button class="share-btn" on:click={handleShare}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M13.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11 2.5a2.5 2.5 0 114.956.5H11zM4.5 6A1.5 1.5 0 106 7.5 1.5 1.5 0 004.5 6zM2 7.5a2.5 2.5 0 114.956.5H2zm8.5 2A1.5 1.5 0 1012 11a1.5 1.5 0 00-1.5-1.5zM8 11a2.5 2.5 0 114.956.5H8z"
            />
          </svg>
          Share Badge
        </button>
      </div>

      <!-- Confetti effect (CSS-only) -->
      <div class="confetti-container">
        <div class="confetti confetti-1"></div>
        <div class="confetti confetti-2"></div>
        <div class="confetti confetti-3"></div>
        <div class="confetti confetti-4"></div>
        <div class="confetti confetti-5"></div>
      </div>
    </div>
  </div>
{/if}

<style>
  .achievement-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .achievement-popup-overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .achievement-popup {
    position: relative;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border: 4px solid var(--achievement-border);
    border-radius: 16px;
    padding: 32px;
    max-width: 480px;
    width: 90%;
    box-shadow:
      0 0 30px var(--achievement-glow),
      0 10px 40px rgba(0, 0, 0, 0.5);
    transform: translateY(-50px) scale(0.9);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
  }

  .achievement-popup.slide-in {
    transform: translateY(0) scale(1);
  }

  .achievement-popup.pulse {
    animation: pulse 0.5s ease-in-out 3;
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow:
        0 0 30px var(--achievement-glow),
        0 10px 40px rgba(0, 0, 0, 0.5);
    }
    50% {
      box-shadow:
        0 0 50px var(--achievement-glow),
        0 0 80px var(--achievement-glow),
        0 10px 40px rgba(0, 0, 0, 0.5);
    }
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    padding: 8px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #f3f4f6;
  }

  .achievement-icon {
    font-size: 64px;
    text-align: center;
    margin-bottom: 16px;
    animation: bounce 0.6s ease;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  .achievement-info {
    text-align: center;
  }

  .achievement-rarity {
    margin-bottom: 12px;
  }

  .rarity-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--achievement-color);
    border: 2px solid var(--achievement-border);
    color: #1f2937;
  }

  .achievement-title {
    font-size: 28px;
    font-weight: 700;
    color: #f9fafb;
    margin: 0 0 8px 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  .achievement-description {
    font-size: 16px;
    color: #d1d5db;
    margin: 0 0 16px 0;
  }

  .achievement-progress {
    margin: 16px 0;
  }

  .progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--achievement-color);
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 12px;
    color: #9ca3af;
  }

  .share-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #f3f4f6;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .share-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* Confetti */
  .confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    border-radius: 12px;
  }

  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--achievement-color);
    opacity: 0;
  }

  .confetti-1 {
    top: 10%;
    left: 10%;
    animation: confetti-fall 3s ease-in-out infinite;
    animation-delay: 0s;
  }

  .confetti-2 {
    top: 10%;
    right: 10%;
    animation: confetti-fall 3s ease-in-out infinite;
    animation-delay: 0.2s;
    background: #fbbf24;
  }

  .confetti-3 {
    top: 30%;
    left: 20%;
    animation: confetti-fall 3s ease-in-out infinite;
    animation-delay: 0.4s;
    background: #60a5fa;
  }

  .confetti-4 {
    top: 30%;
    right: 20%;
    animation: confetti-fall 3s ease-in-out infinite;
    animation-delay: 0.6s;
    background: #a855f7;
  }

  .confetti-5 {
    top: 50%;
    left: 50%;
    animation: confetti-fall 3s ease-in-out infinite;
    animation-delay: 0.8s;
    background: #f97316;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(-10px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(500px) rotate(360deg);
      opacity: 0;
    }
  }

  /* Responsive */
  @media (max-width: 640px) {
    .achievement-popup {
      padding: 24px;
      max-width: 95%;
    }

    .achievement-icon {
      font-size: 48px;
    }

    .achievement-title {
      font-size: 22px;
    }

    .achievement-description {
      font-size: 14px;
    }
  }
</style>
