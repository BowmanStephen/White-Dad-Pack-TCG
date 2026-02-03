<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PackCard } from '@/types';
  import { RARITY_CONFIG } from '@/types';
  import GenerativeCardArt from '../art/GenerativeCardArt.svelte';
  import { zoomLevel, setZoomLevel } from '@/stores/lightbox';

  // Props
  interface Props {
    card: PackCard;
    isOpen?: boolean;
    onClose?: () => void;
    maxZoom?: number;
    minZoom?: number;
  }

  let { card, isOpen = false, onClose = () => {}, maxZoom = 3, minZoom = 1 }: Props = $props();

  // State
  let zoom = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isPanning = $state(false);
  let startX = $state(0);
  let startY = $state(0);
  let startPanX = $state(0);
  let startPanY = $state(0);

  // Touch state for pinch zoom
  let initialPinchDistance = $state(0);
  let initialZoom = $state(1);

  // Container refs
  let containerRef = $state<HTMLDivElement | null>(null);
  let imageRef = $state<HTMLDivElement | null>(null);

  // Get rarity config
  let rarityConfig = $derived(RARITY_CONFIG[card.rarity]);

  // Sync with store
  $effect(() => {
    setZoomLevel(zoom);
  });

  // Reset on close
  $effect(() => {
    if (!isOpen) {
      zoom = 1;
      panX = 0;
      panY = 0;
      isPanning = false;
    }
  });

  // Calculate zoom percentage for display
  let zoomPercent = $derived(Math.round(zoom * 100));

  // Check if panning is allowed (only when zoomed in)
  let canPan = $derived(zoom > 1);

  // ============================================================================
  // MOUSE EVENTS
  // ============================================================================

  function handleWheel(e: WheelEvent) {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));

    // Zoom toward cursor position
    if (containerRef) {
      const rect = containerRef.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Adjust pan to zoom toward cursor
      if (newZoom > zoom) {
        panX -= x * 0.1;
        panY -= y * 0.1;
      } else {
        panX *= newZoom / zoom;
        panY *= newZoom / zoom;
      }
    }

    zoom = newZoom;
  }

  function handleMouseDown(e: MouseEvent) {
    if (!canPan) return;
    e.preventDefault();
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
    startPanX = panX;
    startPanY = panY;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isPanning || !canPan) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Limit panning based on zoom level
    const maxPan = (zoom - 1) * 150;
    panX = Math.max(-maxPan, Math.min(maxPan, startPanX + deltaX));
    panY = Math.max(-maxPan, Math.min(maxPan, startPanY + deltaY));
  }

  function handleMouseUp() {
    isPanning = false;
  }

  // ============================================================================
  // TOUCH EVENTS
  // ============================================================================

  function getTouchDistance(e: TouchEvent): number {
    if (e.touches.length < 2) return 0;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      // Pinch zoom start
      initialPinchDistance = getTouchDistance(e);
      initialZoom = zoom;
    } else if (e.touches.length === 1 && canPan) {
      // Pan start
      isPanning = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startPanX = panX;
      startPanY = panY;
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getTouchDistance(e);
      const scale = currentDistance / initialPinchDistance;
      zoom = Math.max(minZoom, Math.min(maxZoom, initialZoom * scale));
    } else if (e.touches.length === 1 && isPanning && canPan) {
      // Pan
      e.preventDefault();
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;

      const maxPan = (zoom - 1) * 150;
      panX = Math.max(-maxPan, Math.min(maxPan, startPanX + deltaX));
      panY = Math.max(-maxPan, Math.min(maxPan, startPanY + deltaY));
    }
  }

  function handleTouchEnd() {
    isPanning = false;
    initialPinchDistance = 0;
  }

  // ============================================================================
  // CONTROLS
  // ============================================================================

  function zoomIn() {
    zoom = Math.min(maxZoom, zoom + 0.5);
  }

  function zoomOut() {
    zoom = Math.max(minZoom, zoom - 0.5);
  }

  function resetZoom() {
    zoom = 1;
    panX = 0;
    panY = 0;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        zoomIn();
        break;
      case '-':
      case '_':
        zoomOut();
        break;
      case '0':
        resetZoom();
        break;
      case 'ArrowUp':
        if (canPan) panY = Math.min((zoom - 1) * 150, panY + 20);
        break;
      case 'ArrowDown':
        if (canPan) panY = Math.max(-(zoom - 1) * 150, panY - 20);
        break;
      case 'ArrowLeft':
        if (canPan) panX = Math.min((zoom - 1) * 150, panX + 20);
        break;
      case 'ArrowRight':
        if (canPan) panX = Math.max(-(zoom - 1) * 150, panX - 20);
        break;
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mouseup', handleMouseUp);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  });
</script>

{#if isOpen}
  <!-- Backdrop -->
  <button
    class="zoom-modal-backdrop"
    onclick={onClose}
    aria-label="Close zoom modal"
    type="button"
  ></button>

  <!-- Modal -->
  <div
    class="zoom-modal"
    style="--rarity-color: {rarityConfig.color}; --rarity-glow: {rarityConfig.glowColor};"
    role="dialog"
    aria-modal="true"
    aria-label="Zoomable card view for {card.name}"
  >
    <!-- Header -->
    <div class="zoom-header">
      <h2 class="zoom-title">{card.name}</h2>
      <button class="close-btn" onclick={onClose} aria-label="Close">
        <span>✕</span>
      </button>
    </div>

    <!-- Card Container -->
    <button
      class="zoom-container"
      bind:this={containerRef}
      onwheel={handleWheel}
      onmousedown={handleMouseDown}
      onmousemove={handleMouseMove}
      ontouchstart={handleTouchStart}
      ontouchmove={handleTouchMove}
      ontouchend={handleTouchEnd}
      class:panning={isPanning}
      class:can-pan={canPan}
      aria-label="Zoomable card artwork. Use mouse wheel to zoom, drag to pan."
      type="button"
    >
      <div
        class="zoom-content"
        bind:this={imageRef}
        style="transform: scale({zoom}) translate({panX / zoom}px, {panY / zoom}px);"
      >
        <!-- Card Artwork -->
        <div class="card-artwork-wrapper">
          {#if card.artwork && !card.artwork.includes('placeholder')}
            <img src={card.artwork} alt={card.name} class="card-image" draggable="false" />
          {:else}
            <div class="generative-art-wrapper">
              <GenerativeCardArt cardId={card.id} rarity={card.rarity} size={450} />
            </div>
          {/if}

          <!-- Holo overlay -->
          {#if card.isHolo}
            <div class="holo-overlay"></div>
          {/if}
        </div>
      </div>
    </button>

    <!-- Controls -->
    <div class="zoom-controls">
      <button class="zoom-btn" onclick={zoomOut} disabled={zoom <= minZoom} aria-label="Zoom out">
        <span>−</span>
      </button>

      <div class="zoom-indicator">
        <div class="zoom-bar">
          <div class="zoom-bar-fill" style="width: {((zoom - minZoom) / (maxZoom - minZoom)) * 100}%;"></div>
        </div>
        <span class="zoom-percent">{zoomPercent}%</span>
      </div>

      <button class="zoom-btn" onclick={zoomIn} disabled={zoom >= maxZoom} aria-label="Zoom in">
        <span>+</span>
      </button>

      <button class="reset-btn" onclick={resetZoom} disabled={zoom === 1 && panX === 0 && panY === 0} aria-label="Reset zoom">
        <span>⟲</span>
      </button>
    </div>

    <!-- Instructions -->
    <div class="zoom-instructions">
      <span class="instruction">🖱️ Scroll to zoom</span>
      <span class="divider">•</span>
      <span class="instruction">✋ Drag to pan</span>
      <span class="divider">•</span>
      <span class="instruction">📱 Pinch to zoom</span>
    </div>
  </div>
{/if}

<style>
  /* Backdrop */
  .zoom-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(12px);
    z-index: 1000;
    animation: fadeIn 0.2s ease;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Modal */
  .zoom-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    max-width: 90vw;
    max-height: 90vh;
    z-index: 1001;
    animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  /* Header */
  .zoom-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(15, 23, 42, 0.95);
    border-radius: 16px 16px 0 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: none;
  }

  .zoom-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--rarity-color);
    margin: 0;
    text-shadow: 0 0 12px var(--rarity-glow);
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  /* Container */
  .zoom-container {
    position: relative;
    width: 500px;
    height: 650px;
    max-width: 80vw;
    max-height: 60vh;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0;
    appearance: none;
    overflow: hidden;
    cursor: grab;
    touch-action: none;
  }

  .zoom-container.panning {
    cursor: grabbing;
  }

  .zoom-container.can-pan {
    cursor: grab;
  }

  .zoom-container:not(.can-pan) {
    cursor: zoom-in;
  }

  /* Content */
  .zoom-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.05s ease-out;
    will-change: transform;
  }

  /* Card Artwork */
  .card-artwork-wrapper {
    position: relative;
    width: 400px;
    height: 550px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 0 20px rgba(0, 0, 0, 0.5),
      0 0 40px var(--rarity-glow);
    border: 2px solid var(--rarity-color);
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
    pointer-events: none;
  }

  .generative-art-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Holo overlay */
  .holo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 20%,
      rgba(255, 0, 128, 0.1) 40%,
      rgba(0, 128, 255, 0.1) 60%,
      rgba(255, 255, 255, 0.1) 80%,
      transparent 100%
    );
    mix-blend-mode: overlay;
    pointer-events: none;
    animation: holoShift 4s ease-in-out infinite;
  }

  @keyframes holoShift {
    0%,
    100% {
      opacity: 0.5;
      transform: translateX(-10%) rotate(0deg);
    }
    50% {
      opacity: 0.8;
      transform: translateX(10%) rotate(2deg);
    }
  }

  /* Controls */
  .zoom-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: none;
  }

  .zoom-btn,
  .reset-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: white;
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .zoom-btn:hover:not(:disabled),
  .reset-btn:hover:not(:disabled) {
    background: var(--rarity-color);
    border-color: var(--rarity-color);
    transform: scale(1.05);
  }

  .zoom-btn:disabled,
  .reset-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .zoom-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
  }

  .zoom-bar {
    width: 80px;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .zoom-bar-fill {
    height: 100%;
    background: var(--rarity-color);
    border-radius: 3px;
    transition: width 0.1s ease;
  }

  .zoom-percent {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
    min-width: 40px;
    text-align: right;
  }

  /* Instructions */
  .zoom-instructions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(15, 23, 42, 0.95);
    border-radius: 0 0 16px 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: none;
  }

  .instruction {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  .divider {
    color: rgba(255, 255, 255, 0.2);
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .zoom-modal {
      max-width: 95vw;
    }

    .zoom-container {
      width: 100%;
      height: 500px;
      max-height: 50vh;
    }

    .card-artwork-wrapper {
      width: 300px;
      height: 420px;
    }

    .zoom-title {
      font-size: 16px;
    }

    .zoom-btn,
    .reset-btn {
      width: 36px;
      height: 36px;
      font-size: 18px;
    }

    .zoom-instructions {
      flex-wrap: wrap;
      gap: 4px;
    }

    .instruction {
      font-size: 10px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .zoom-modal-backdrop,
    .zoom-modal {
      animation: none;
    }

    .zoom-content {
      transition: none;
    }

    .holo-overlay {
      animation: none;
      opacity: 0.5;
    }
  }
</style>
