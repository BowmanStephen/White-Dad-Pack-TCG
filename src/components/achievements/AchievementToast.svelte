<script lang="ts">
  import { onMount } from 'svelte';
  import { currentToast as currentToastStore } from '@/stores/achievements';
  import { ACHIEVEMENT_RARITY_CONFIG, type Achievement, type AchievementRarity } from '@/types';
  import { fly } from 'svelte/transition';

  // Confetti particle interface
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    color: string;
    size: number;
    alpha: number;
  }

  // Current toast being displayed
  let toast: Achievement | null = null;
  let showing = false;

  // Confetti particles array
  let particles: Particle[] = [];
  let confettiActive = false;
  let animationFrame: number | null = null;

  // Subscribe to current toast
  onMount(() => {
    const unsubscribe = currentToastStore.subscribe((value) => {
      toast = value;

      if (value) {
        showing = true;

        // Trigger confetti for rare achievements
        if (value.rarity === 'gold' || value.rarity === 'platinum') {
          triggerConfetti();
        }
      } else {
        showing = false;
        stopConfetti();
      }
    });

    return () => {
      unsubscribe();
      stopConfetti();
      // Cleanup animation frame on unmount
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  });

  // Get rarity configuration
  $: rarityConfig = toast ? ACHIEVEMENT_RARITY_CONFIG[toast.rarity] : null;

  /**
   * Trigger confetti burst effect
   */
  function triggerConfetti() {
    confettiActive = true;
    particles = [];

    const config = toast ? ACHIEVEMENT_RARITY_CONFIG[toast.rarity] : ACHIEVEMENT_RARITY_CONFIG.gold;

    // Create particles based on rarity (more for platinum)
    const particleCount = toast?.rarity === 'platinum' ? 60 : 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(config));
    }

    // Start animation loop
    animateConfetti();

    // Stop confetti after 2.5 seconds
    setTimeout(() => {
      confettiActive = false;
    }, 2500);
  }

  /**
   * Create a single confetti particle
   */
  function createParticle(config: typeof ACHIEVEMENT_RARITY_CONFIG[AchievementRarity]): Particle {
    // Random colors based on rarity
    const colors = [
      config.color,
      config.borderColor,
      '#ffffff',
      config.glowColor.replace('0.', '1.'),
    ];

    return {
      x: Math.random() * 400, // Position from center (400 = toast width)
      y: -20 - Math.random() * 50, // Start above toast
      vx: (Math.random() - 0.5) * 10, // Random horizontal velocity
      vy: Math.random() * 5 + 2, // Downward velocity
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      alpha: 1,
    };
  }

  /**
   * Animate confetti particles
   */
  function animateConfetti() {
    if (!confettiActive) {
      particles = [];
      return;
    }

    // Update particles
    particles = particles.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.2, // Gravity
      rotation: p.rotation + p.rotationSpeed,
      alpha: Math.max(0, p.alpha - 0.008), // Fade out
    })).filter(p => p.alpha > 0 && p.y < 400); // Remove invisible/off-screen particles

    // Continue animation
    if (particles.length > 0) {
      animationFrame = requestAnimationFrame(animateConfetti);
    }
  }

  /**
   * Stop confetti animation
   */
  function stopConfetti() {
    confettiActive = false;
    particles = [];
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  /**
   * Get rarity icon
   */
  function getRarityIcon(rarity: AchievementRarity): string {
    switch (rarity) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '🏆';
    }
  }
</script>

{#if showing && toast && rarityConfig}
  <div
    class="achievement-toast-container"
    style="border-color: {rarityConfig.borderColor}; background: {rarityConfig.bgColor};"
    transition:fly="{{ y: -50, duration: 400 }}"
  >
    <!-- Confetti overlay -->
    {#if particles.length > 0}
      <div class="confetti-overlay">
        <svg class="confetti-canvas" viewBox="0 0 400 200">
          {#each particles as particle}
            <rect
              x={particle.x}
              y={particle.y}
              width={particle.size}
              height={particle.size}
              fill={particle.color}
              opacity={particle.alpha}
              transform="rotate({particle.rotation} {particle.x + particle.size / 2} {particle.y + particle.size / 2})"
            />
          {/each}
        </svg>
      </div>
    {/if}

    <!-- Toast content -->
    <div class="toast-content">
      <!-- Icon and rarity badge -->
      <div class="toast-header">
        <div
          class="toast-icon"
          style="color: {rarityConfig.color}; text-shadow: 0 0 20px {rarityConfig.glowColor};"
        >
          {getRarityIcon(toast.rarity)}
        </div>
        <div class="toast-rarity" style="color: {rarityConfig.color};">
          {rarityConfig.name}
        </div>
      </div>

      <!-- Achievement name and description -->
      <div class="toast-body">
        <h3 class="toast-name" style="color: {rarityConfig.color};">
          {toast.name}
        </h3>
        <p class="toast-description">
          {toast.description}
        </p>
      </div>

      <!-- Achievement icon -->
      {#if toast.icon}
        <div class="toast-achievement-icon">
          {toast.icon}
        </div>
      {/if}
    </div>

    <!-- Glow effect -->
    <div class="toast-glow" style="background: radial-gradient(circle, {rarityConfig.glowColor} 0%, transparent 70%);"></div>
  </div>
{/if}

<style>
  .achievement-toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 320px;
    max-width: 400px;
    border-width: 3px;
    border-style: solid;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    overflow: visible;
    pointer-events: none; /* Allow clicks to pass through */
  }

  .confetti-overlay {
    position: absolute;
    top: -50px;
    left: -50px;
    right: -50px;
    bottom: -50px;
    pointer-events: none;
    overflow: visible;
  }

  .confetti-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }

  .toast-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toast-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .toast-icon {
    font-size: 48px;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    animation: bounce 0.6s ease-out;
  }

  @keyframes bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  .toast-rarity {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
  }

  .toast-body {
    flex: 1;
  }

  .toast-name {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
    line-height: 1.2;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .toast-description {
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
    color: #ffffff;
    opacity: 0.95;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .toast-achievement-icon {
    font-size: 32px;
    opacity: 0.9;
  }

  .toast-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    pointer-events: none;
    opacity: 0.5;
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .achievement-toast-container {
      top: 10px;
      right: 10px;
      left: 10px;
      min-width: auto;
      max-width: none;
    }

    .toast-icon {
      font-size: 36px;
    }

    .toast-name {
      font-size: 16px;
    }

    .toast-description {
      font-size: 13px;
    }

    .toast-achievement-icon {
      font-size: 24px;
    }
  }
</style>
