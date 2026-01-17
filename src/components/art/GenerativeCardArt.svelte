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

  function generateArt() {
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
    };
    img.src = imageUrl;
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
  $: if (card.id && canvas) {
    generateArt();
  }
</script>

<div class="generative-art-container" style="width: {width}px; height: {height}px;">
  <canvas
    bind:this={canvas}
    {width}
    {height}
    class="generative-card-art"
    class:loading={isGenerating}
    aria-label={alt}
  ></canvas>
</div>

<style>
  .generative-card-art {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  }
</style>
