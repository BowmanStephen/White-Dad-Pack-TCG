<script lang="ts">
  import { onMount } from 'svelte';
  import type { PackCard } from '@/types';
  import { RARITY_CONFIG } from '@/types';
  import GenerativeCardArt from '../art/GenerativeCardArt.svelte';
  import ParticleEffects from './ParticleEffects.svelte';

  // Props
  export let card: PackCard;
  export let autoRotate: boolean = false;
  export let interactive: boolean = true;
  export let showParticles: boolean = true;

  // State
  let isFlipped = $state(false);
  let rotationY = $state(0);
  let rotationX = $state(0);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let showFlipParticles = $state(false);
  let touchStartX = $state(0);
  let touchStartY = $state(0);
  let isDragging = $state(false);
  let dragStartRotation = $state(0);

  // Container ref for size/position
  let containerElement: HTMLDivElement;
  let cardElement: HTMLDivElement;

  // Get rarity config for styling
  $: rarityConfig = RARITY_CONFIG[card.rarity];

  /**
   * Handle mouse move for interactive tilt (parallax effect)
   */
  function handleMouseMove(e: MouseEvent) {
    if (!interactive || !containerElement) return;

    const rect = containerElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    mouseX = e.clientX - rect.left - centerX;
    mouseY = e.clientY - rect.top - centerY;

    // Subtle tilt effect when not dragging
    if (!isDragging) {
      rotationY = (mouseX / centerX) * 15; // Max 15 degree tilt
      rotationX = (mouseY / centerY) * -15; // Max 15 degree tilt (inverted)
    }
  }

  /**
   * Handle mouse leave - reset tilt
   */
  function handleMouseLeave() {
    if (!isDragging) {
      rotationY = 0;
      rotationX = 0;
    }
  }

  /**
   * Handle mouse down - start drag to flip
   */
  function handleMouseDown(e: MouseEvent) {
    if (!interactive) return;
    isDragging = true;
    dragStartRotation = rotationY;
    touchStartX = e.clientX;
  }

  /**
   * Handle mouse move during drag
   */
  function handleMouseMoveDrag(e: MouseEvent) {
    if (!isDragging || !interactive) return;

    const deltaX = e.clientX - touchStartX;
    const dragThreshold = 50;

    // Check if drag should trigger flip
    if (Math.abs(deltaX) > dragThreshold) {
      // Flip based on direction
      if (deltaX > 0 && isFlipped) {
        flipCard(); // Drag right while flipped = flip back
      } else if (deltaX < 0 && !isFlipped) {
        flipCard(); // Drag left while not flipped = flip
      }
      isDragging = false;
    }
  }

  /**
   * Handle mouse up - end drag
   */
  function handleMouseUp() {
    isDragging = false;
  }

  /**
   * Handle touch start
   */
  function handleTouchStart(e: TouchEvent) {
    if (!interactive) return;
    isDragging = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  /**
   * Handle touch move
   */
  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || !interactive) return;

    const deltaX = e.touches[0].clientX - touchStartX;
    const dragThreshold = 50;

    if (Math.abs(deltaX) > dragThreshold) {
      if (deltaX > 0 && isFlipped) {
        flipCard();
      } else if (deltaX < 0 && !isFlipped) {
        flipCard();
      }
      isDragging = false;
    }
  }

  /**
   * Handle touch end
   */
  function handleTouchEnd() {
    isDragging = false;
  }

  /**
   * Flip the card with animation and particles
   */
  function flipCard() {
    isFlipped = !isFlipped;

    // Trigger particle effect on flip
    if (showParticles) {
      showFlipParticles = true;
      setTimeout(() => {
        showFlipParticles = false;
      }, 1000);
    }

    // Rotate 180 degrees for the flip effect
    rotationY = isFlipped ? 180 : 0;
  }

  /**
   * Handle click to flip (alternative to drag)
   */
  function handleClick() {
    if (interactive && !isDragging) {
      flipCard();
    }
  }

  /**
   * Handle keyboard input for flip (Space or F key)
   */
  function handleKeyDown(e: KeyboardEvent) {
    if (!interactive) return;

    if (e.code === 'Space' || e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      flipCard();
    }
  }

  /**
   * Get gyroscope tilt data (mobile)
   */
  onMount(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      // Request permission for iOS 13+
      if ('requestPermission' in DeviceOrientationEvent) {
        // iOS - would need user gesture to request permission
        // For now, we rely on standard device orientation
      }

      const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
        if (!interactive || isDragging) return;

        const alpha = event.alpha || 0; // Z axis
        const beta = event.beta || 0; // X axis
        const gamma = event.gamma || 0; // Y axis

        // Subtle tilt based on device orientation
        rotationY = gamma * 0.5; // Max 45 degrees
        rotationX = beta * 0.5; // Max 45 degrees
      };

      window.addEventListener('deviceorientation', handleDeviceOrientation);

      return () => {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      };
    }
  });

  // Get holo type for back display
  function getHoloVariantName(holoType: string): string {
    const names: Record<string, string> = {
      none: 'Non-Holo',
      standard: 'Standard Holo',
      reverse: 'Reverse Holo',
      full_art: 'Full Art Holo',
      prismatic: 'Prismatic Holo',
    };
    return names[holoType] || holoType;
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<!-- Card Container -->
<div
  class="card-3d-container"
  bind:this={containerElement}
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}
  role="button"
  tabindex="0"
  aria-label={`${card.name} card. ${isFlipped ? 'Card is flipped. ' : ''}Click or drag to flip. Space to toggle.`}
  on:click={handleClick}
  on:keydown={handleKeyDown}
>
  <!-- 3D Flip Container -->
  <div
    class="card-3d-inner"
    style="
      --rotation-y: {rotationY}deg;
      --rotation-x: {rotationX}deg;
      --rarity-color: {rarityConfig.color};
      --rarity-glow: {rarityConfig.glowColor};
    "
    bind:this={cardElement}
  >
    <!-- Front Side -->
    <div class="card-face card-face-front">
      <div
        class="card-artwork-wrapper"
        style="box-shadow: 0 8px 30px rgba(0,0,0,0.6), 0 0 40px {rarityConfig.glowColor}44;"
      >
        <GenerativeCardArt
          {card}
          width={400}
          height={550}
          showName={false}
          alt={card.name}
        />

        <!-- Holo Badge -->
        {#if card.isHolo}
          <div
            class="holo-badge"
            style="background: linear-gradient(135deg, {rarityConfig.color}, {rarityConfig.glowColor}); box-shadow: 0 4px 12px {rarityConfig.glowColor}66;"
          >
            <span class="holo-badge-text">HOLO</span>
          </div>
        {/if}

        <!-- Interactive Hint -->
        {#if interactive && !isDragging}
          <div class="flip-hint">
            <span class="hint-text">← Drag or Click to Flip →</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Back Side -->
    <div class="card-face card-face-back">
      <div class="card-back-content">
        <!-- Back Design -->
        <div class="back-pattern" style="border-color: {rarityConfig.color};"></div>

        <!-- Card Info on Back -->
        <div class="back-info">
          <div class="back-title">DadDeck™</div>

          <div class="back-section">
            <div class="back-label">Card:</div>
            <div class="back-value">{card.name}</div>
          </div>

          <div class="back-section">
            <div class="back-label">Type:</div>
            <div class="back-value">{card.type.replace(/_/g, ' ')}</div>
          </div>

          <div class="back-section">
            <div class="back-label">Rarity:</div>
            <div class="back-value" style="color: {rarityConfig.color}; font-weight: bold;">
              {rarityConfig.name.toUpperCase()}
            </div>
          </div>

          {#if card.isHolo}
            <div class="back-section">
              <div class="back-label">Holo:</div>
              <div class="back-value">{getHoloVariantName(card.holoType)}</div>
            </div>
          {/if}

          <div class="back-section">
            <div class="back-label">Series:</div>
            <div class="back-value">#{card.series}</div>
          </div>

          <div class="back-section">
            <div class="back-label">Artist:</div>
            <div class="back-value">{card.artist}</div>
          </div>

          <div class="back-divider"></div>

          <div class="back-flavor">"{card.flavorText}"</div>

          <div class="back-hint">← Drag or Click to Flip Back →</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Particle Effects on Flip -->
  {#if showFlipParticles}
    <div class="particle-layer">
      <ParticleEffects
        count={card.rarity === 'mythic' ? 40 : card.rarity === 'legendary' ? 25 : card.rarity === 'epic' ? 15 : 10}
        color={rarityConfig.color}
        duration={1000}
      />
    </div>
  {/if}
</div>

<style>
  .card-3d-container {
    position: relative;
    width: 400px;
    height: 550px;
    cursor: grab;
    outline: none;
    user-select: none;
  }

  .card-3d-container:active {
    cursor: grabbing;
  }

  .card-3d-container:focus-visible {
    outline: 3px solid var(--rarity-color);
    outline-offset: 8px;
    border-radius: 20px;
  }

  /* 3D Perspective */
  .card-3d-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transform: rotateY(var(--rotation-y)) rotateX(var(--rotation-x));
  }

  /* Front and Back Faces */
  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    overflow: hidden;
  }

  .card-face-front {
    z-index: 2;
  }

  .card-face-back {
    transform: rotateY(180deg);
    background: linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(30, 30, 60, 0.95) 100%);
    border: 2px solid var(--rarity-color);
    z-index: 1;
  }

  /* Artwork Wrapper (Front) */
  .card-artwork-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 16px;
  }

  /* Holo Badge */
  .holo-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    color: white;
    letter-spacing: 1px;
    z-index: 10;
    backdrop-filter: blur(8px);
  }

  .holo-badge-text {
    display: block;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  /* Flip Hint */
  .flip-hint {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    white-space: nowrap;
    animation: pulse-hint 2s ease-in-out infinite;
  }

  @keyframes pulse-hint {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  /* Back Side Content */
  .card-back-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 24px;
    padding-bottom: 32px;
    color: white;
    text-align: center;
    justify-content: space-between;
    overflow: hidden;
  }

  .back-pattern {
    position: absolute;
    inset: 0;
    border: 3px dashed var(--rarity-color);
    border-radius: 12px;
    opacity: 0.3;
    margin: 12px;
    pointer-events: none;
  }

  .back-title {
    position: relative;
    z-index: 2;
    font-size: 24px;
    font-weight: 900;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 3px;
    background: linear-gradient(135deg, var(--rarity-color), var(--rarity-glow));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .back-section {
    position: relative;
    z-index: 2;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .back-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 4px;
  }

  .back-value {
    font-size: 14px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.9);
  }

  .back-divider {
    position: relative;
    z-index: 2;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--rarity-color),
      transparent
    );
    margin: 16px 0;
  }

  .back-flavor {
    position: relative;
    z-index: 2;
    font-size: 12px;
    font-style: italic;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .back-hint {
    position: relative;
    z-index: 2;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1px;
    animation: pulse-hint 2s ease-in-out infinite;
  }

  /* Particle Layer */
  .particle-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 100;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .card-3d-inner {
      transition: none;
    }

    .flip-hint,
    .back-hint {
      animation: none;
      opacity: 1;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .card-3d-container {
      width: 320px;
      height: 440px;
    }

    .back-content {
      padding: 16px 20px;
    }

    .flip-hint,
    .back-hint {
      font-size: 10px;
    }
  }
</style>
