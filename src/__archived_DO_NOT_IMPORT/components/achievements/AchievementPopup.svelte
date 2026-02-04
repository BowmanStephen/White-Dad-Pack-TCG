<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { currentToast, hideCurrentToast } from '@/stores/achievements';
  import type { Achievement } from '@/types';
  import { ACHIEVEMENT_RARITY_CONFIG } from '@/types';

  // Duration for auto-dismiss (5 seconds per acceptance criteria)
  const DISMISS_DURATION = 5000;

  let show = $state(false);
  let isExiting = $state(false);
  let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let particles: Particle[] = [];
  let animationFrameId: number | null = null;

  // Reactive to current toast changes
  $effect(() => {
    const toast = $currentToast;
    if (toast) {
      showPopup();
    } else {
      hidePopup();
    }
  });

  // Show popup with animation
  function showPopup() {
    show = true;
    isExiting = false;
    startConfetti();

    // Auto-dismiss after 5 seconds
    if (autoDismissTimer) clearTimeout(autoDismissTimer);
    autoDismissTimer = setTimeout(() => {
      manuallyDismiss();
    }, DISMISS_DURATION);
  }

  // Hide popup with animation
  function hidePopup() {
    isExiting = true;
    setTimeout(() => {
      show = false;
      stopConfetti();
    }, 300); // Wait for exit animation
  }

  // Manual dismiss (user click)
  function manuallyDismiss() {
    if (autoDismissTimer) clearTimeout(autoDismissTimer);
    hideCurrentToast();
  }

  // Confetti particle class
  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;

    constructor(canvas: HTMLCanvasElement, rarity: Achievement['rarity']) {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;

      // Explosion velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      // Rarity-based colors
      const config = ACHIEVEMENT_RARITY_CONFIG[rarity];
      const colors = [
        config.color,
        config.borderColor,
        config.glowColor,
        '#FFD700', // Gold accent
        '#FF6B6B', // Red accent
        '#4ECDC4', // Teal accent
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];

      this.size = 3 + Math.random() * 5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
      this.opacity = 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.1; // Gravity
      this.rotation += this.rotationSpeed;
      this.opacity -= 0.008; // Fade out
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }

    isDead() {
      return this.opacity <= 0 || this.y > 1000; // Off screen
    }
  }

  // Start confetti animation
  function startConfetti() {
    if (!$currentToast) return;

    particles = [];
    const particleCount = 50; // 50 particles for celebration

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas, $currentToast.rarity));
    }

    animateConfetti();
  }

  // Animate confetti
  function animateConfetti() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles = particles.filter(p => !p.isDead());
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    // Continue animation if particles remain
    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(animateConfetti);
    }
  }

  // Stop confetti animation
  function stopConfetti() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    particles = [];
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Cleanup on unmount
  onDestroy(() => {
    if (autoDismissTimer) clearTimeout(autoDismissTimer);
    stopConfetti();
  });

  // Initialize canvas
  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d')!;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
</script>

{#if show && $currentToast}
  <div
    class="achievement-popup-overlay"
    role="dialog"
    aria-labelledby="achievement-title"
    aria-describedby="achievement-description"
    on:click={manuallyDismiss}
  >
    <!-- Confetti canvas (full screen, behind popup) -->
    <canvas
      bind:this={canvas}
      class="confetti-canvas"
      aria-hidden="true"
    ></canvas>

    <!-- Achievement popup -->
    <div
      class="achievement-popup {isExiting ? 'exiting' : 'entering'}"
      class:rarity={$currentToast.rarity}
      on:click|stopPropagation
    >
      <!-- Trophy icon -->
      <div class="trophy-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Achievement content -->
      <div class="achievement-content">
        <h2 id="achievement-title" class="achievement-title">
          Achievement Unlocked!
        </h2>

        <div class="achievement-info">
          <div class="achievement-icon-wrapper">
            <img
              src={$currentToast.icon}
              alt=""
              class="achievement-icon"
            />
          </div>

          <div class="achievement-details">
            <h3 class="achievement-name">
              {$currentToast.name}
            </h3>

            {#if $currentToast.description}
              <p id="achievement-description" class="achievement-description">
                {$currentToast.description}
              </p>
            {/if}

            {#if $currentToast.maxProgress && $currentToast.maxProgress > 1}
              <div class="achievement-progress">
                <span class="progress-text">
                  {$currentToast.progress || 0}/{$currentToast.maxProgress}
                </span>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style="width: {(($currentToast.progress || 0) / $currentToast.maxProgress) * 100}%"
                  ></div>
                </div>
              </div>
            {/if}

            <!-- Rarity badge -->
            <div class="rarity-badge" aria-label="Rarity: {ACHIEVEMENT_RARITY_CONFIG[$currentToast.rarity].name}">
              {ACHIEVEMENT_RARITY_CONFIG[$currentToast.rarity].name}
            </div>
          </div>
        </div>

        <!-- Close button (also dismisses on click outside) -->
        <button
          class="close-button"
          on:click={manuallyDismiss}
          aria-label="Close achievement notification"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
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
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease-out;
  }

  .confetti-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .achievement-popup {
    position: relative;
    width: 90%;
    max-width: 500px;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }

  .achievement-popup.entering {
    animation: popupEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .achievement-popup.exiting {
    animation: popupExit 0.3s ease-out forwards;
  }

  /* Rarity-specific glow effects */
  .achievement-popup.bronze {
    border: 2px solid #cd7f32;
    box-shadow: 0 20px 60px rgba(205, 127, 50, 0.4), inset 0 0 20px rgba(205, 127, 50, 0.1);
  }

  .achievement-popup.silver {
    border: 2px solid #c0c0c0;
    box-shadow: 0 20px 60px rgba(192, 192, 192, 0.5), inset 0 0 20px rgba(192, 192, 192, 0.15);
  }

  .achievement-popup.gold {
    border: 2px solid #ffd700;
    box-shadow: 0 20px 60px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.2);
    animation: popupEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, shimmer 2s ease-in-out infinite;
  }

  .achievement-popup.platinum {
    border: 2px solid #e5e4e2;
    box-shadow: 0 20px 60px rgba(229, 228, 226, 0.7), inset 0 0 40px rgba(229, 228, 226, 0.25);
    animation: popupEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, prismatic 3s linear infinite;
  }

  .trophy-icon {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
    z-index: 1;
    animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .trophy-icon svg {
    width: 50px;
    height: 50px;
    color: #fff;
  }

  .achievement-content {
    padding: 3rem 2rem 2rem 2rem;
    position: relative;
  }

  .achievement-title {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
    color: #fbbf24;
    margin: 0 0 1.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  }

  .achievement-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .achievement-icon-wrapper {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .achievement-icon {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .achievement-details {
    flex: 1;
  }

  .achievement-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.5rem 0;
    line-height: 1.2;
  }

  .achievement-description {
    font-size: 0.9rem;
    color: #94a3b8;
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
  }

  .achievement-progress {
    margin: 0.75rem 0;
  }

  .progress-text {
    font-size: 0.85rem;
    color: #cbd5e1;
    display: block;
    margin-bottom: 0.25rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 3px;
    transition: width 0.3s ease-out;
  }

  .rarity-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .achievement-popup.bronze .rarity-badge {
    background: rgba(205, 127, 50, 0.2);
    color: #e5a85c;
  }

  .achievement-popup.silver .rarity-badge {
    background: rgba(192, 192, 192, 0.2);
    color: #e0e0e0;
  }

  .achievement-popup.gold .rarity-badge {
    background: rgba(255, 215, 0, 0.2);
    color: #ffe55c;
  }

  .achievement-popup.platinum .rarity-badge {
    background: rgba(229, 228, 226, 0.25);
    color: #f0eff0;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-out;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .close-button svg {
    width: 20px;
    height: 20px;
    color: #cbd5e1;
  }

  /* Animations */
  @keyframes popupEnter {
    0% {
      transform: scale(0.9) translateY(20px);
      opacity: 0;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  @keyframes popupExit {
    0% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
    100% {
      transform: scale(0.9) translateY(20px);
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes bounceIn {
    0% {
      transform: translateX(-50%) scale(0);
    }
    50% {
      transform: translateX(-50%) scale(1.1);
    }
    100% {
      transform: translateX(-50%) scale(1);
    }
  }

  @keyframes shimmer {
    0%, 100% {
      box-shadow: 0 20px 60px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.2);
    }
    50% {
      box-shadow: 0 20px 80px rgba(255, 215, 0, 0.8), inset 0 0 40px rgba(255, 215, 0, 0.3);
    }
  }

  @keyframes prismatic {
    0% {
      box-shadow: 0 20px 60px rgba(229, 228, 226, 0.7), inset 0 0 40px rgba(229, 228, 226, 0.25);
    }
    33% {
      box-shadow: 0 20px 60px rgba(255, 215, 0, 0.7), inset 0 0 40px rgba(255, 215, 0, 0.25);
    }
    66% {
      box-shadow: 0 20px 60px rgba(168, 85, 247, 0.7), inset 0 0 40px rgba(168, 85, 247, 0.25);
    }
    100% {
      box-shadow: 0 20px 60px rgba(229, 228, 226, 0.7), inset 0 0 40px rgba(229, 228, 226, 0.25);
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .achievement-popup {
      width: 95%;
      margin: 1rem;
    }

    .achievement-content {
      padding: 2.5rem 1.5rem 1.5rem 1.5rem;
    }

    .trophy-icon {
      width: 60px;
      height: 60px;
    }

    .trophy-icon svg {
      width: 40px;
      height: 40px;
    }

    .achievement-info {
      flex-direction: column;
      text-align: center;
    }

    .achievement-icon-wrapper {
      width: 100px;
      height: 100px;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .achievement-popup,
    .trophy-icon {
      animation: none !important;
    }

    .achievement-popup.entering {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
