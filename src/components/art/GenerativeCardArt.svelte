<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Card } from '@/types';
  import { generateCardArtwork } from '@/lib/art/generative-art';

  interface Props {
    card: Card;
    width?: number;
    height?: number;
    showName?: boolean;
    alt?: string;
  }

  let {
    card,
    width = 400,
    height = 400,
    showName = true,
    alt,
  }: Props = $props();

  const altText = $derived(alt ?? card.name);

  let canvas: HTMLCanvasElement | null = null;
  let imageUrl = $state('');
  let isGenerating = $state(true);
  let useFallback = $state(false);
  let imageLoaded = $state(false);
  let imageLoadingError = $state(false);

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

  // Cleanup
  onDestroy(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  });

  // Regenerate if card props change
  $effect(() => {
    if (card.id && (canvas || card.artwork)) {
      if (card.artwork) useFallback = false;
      generateArt();
    }
  });
</script>

<div class="generative-art-container relative overflow-hidden" style="width: {width}px; height: {height}px;">
  <canvas
    bind:this={canvas}
    {width}
    {height}
    class="generative-card-art absolute inset-0 w-full h-full"
    class:loading={isGenerating && !card.artwork}
    class:hidden={card.artwork && !useFallback && imageLoaded}
    aria-label={altText}
    aria-hidden={card.artwork && !useFallback && imageLoaded}
  ></canvas>

  {#if card.artwork && !useFallback}
    <img
      src={card.artwork}
      alt={altText}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
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

  @media (prefers-reduced-motion: reduce) {
    .transition-opacity {
      transition: none;
    }
  }
</style>
