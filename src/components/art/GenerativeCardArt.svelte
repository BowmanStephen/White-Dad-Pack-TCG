<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Card } from '../../types';
  import { generateCardArtwork } from '../../lib/art/generative-art';

  export let card: Card;
  export let width: number = 400;
  export let height: number = 400;
  export let showName: boolean = true;
  export let alt: string = card.name;

  let canvas: HTMLCanvasElement;
  let imageUrl: string = '';
  let isGenerating = true;
  let useFallback = false;
  let imageLoaded = false;
  let imageLoadingError = false;

  function generateArt() {
    // If card has artwork, we'll let the img tag handle it with lazy loading
    if (card.artwork && !useFallback) {
      isGenerating = false;
      imageLoaded = false;
      return;
    }

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous artwork
    ctx.clearRect(0, 0, width, height);

    // Generate new artwork and draw to canvas
    imageUrl = generateCardArtwork(card, { width, height, showName });

    // Load the image and draw it to canvas
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      isGenerating = false;
      imageLoaded = true;
    };
    img.src = imageUrl;
  }

  function handleImageLoad() {
    imageLoaded = true;
    imageLoadingError = false;
    isGenerating = false;
  }

  function handleImageError() {
    imageLoadingError = true;
    useFallback = true;
    imageLoaded = false;
    generateArt();
  }

  // Generate artwork on mount
  onMount(() => {
    generateArt();
  });

  // Cleanup
  onDestroy(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  });

  // Regenerate if card props change
  $: if (card.id && (canvas || card.artwork)) {
    if (card.artwork) useFallback = false;
    generateArt();
  }
</script>

<div class="generative-art-container relative overflow-hidden" style="width: {width}px; height: {height}px;">
  <canvas
    bind:this={canvas}
    {width}
    {height}
    class="generative-card-art absolute inset-0 w-full h-full"
    class:loading={isGenerating && !card.artwork}
    class:hidden={card.artwork && !useFallback && imageLoaded}
    aria-label={alt}
    aria-hidden={card.artwork && !useFallback && imageLoaded}
  ></canvas>

  {#if card.artwork && !useFallback}
    <img
      src={card.artwork}
      alt={alt}
      loading="lazy"
      decoding="async"
      class="absolute inset-0 z-10 w-full h-full object-cover transition-opacity duration-300"
      class:opacity-0={!imageLoaded}
      class:opacity-100={imageLoaded}
      onload={handleImageLoad}
      onerror={handleImageError}
    />
  {/if}
</div>

<style>
  .generative-card-art {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hidden {
    display: none;
  }

  .loading {
    opacity: 0.5;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: inherit;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }

    .transition-opacity {
      transition: none;
    }
  }
</style>
