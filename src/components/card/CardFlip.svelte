<script lang="ts">
  import type { PackCard } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import Card from './Card.svelte';
  import CardBack from './CardBack.svelte';

  export let card: PackCard;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let interactive: boolean = true;
  export let flipDuration: number = 600; // milliseconds
  export let autoFlip: boolean = false;
  export let autoFlipDelay: number = 300; // milliseconds before auto-flip

  // Flip state
  let isFlipped = false;

  // Touch device detection
  let isTouchDevice = false;

  if (typeof window !== 'undefined') {
    isTouchDevice = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }

  // Auto-flip logic
  import { onMount } from 'svelte';

  onMount(() => {
    if (autoFlip && !isFlipped) {
      setTimeout(() => {
        flip();
      }, autoFlipDelay);
    }
  });

  // Flip function
  function flip() {
    isFlipped = !isFlipped;
  }

  // Public flip method for parent components
  export function flipCard() {
    flip();
  }

  // Export flip state
  export { isFlipped };

  // Size classes matching Card component
  const sizeClasses = {
    sm: 'w-48 h-[268px]',
    md: 'w-72 h-[403px]',
    lg: 'w-96 h-[537px]',
  };
</script>

<div
  class="card-flip-container {sizeClasses[size]}"
  class:cursor-pointer={interactive}
  class:cursor-default={!interactive}
  on:click={interactive ? flip : undefined}
  on:keydown={(e) => interactive && (e.key === ' ' || e.key === 'Enter') && flip()}
  role="button"
  aria-label="Click to flip card"
  tabindex="0"
>
  <div
    class="card-flip-inner"
    class:flipped={isFlipped}
    style="transition-duration: {flipDuration}ms;"
  >
    <!-- Card Front (initially hidden, shown after flip) -->
    <div class="card-flip-front">
      <Card
        {card}
        {size}
        interactive={false}
        showBack={false}
        isFlipped={false}
        enableLightbox={false}
      />
    </div>

    <!-- Card Back (initially visible) -->
    <div class="card-flip-back">
      <CardBack {size} isHolo={card.isHolo} rarity={card.rarity} />
    </div>
  </div>
</div>

<style>
  .card-flip-container {
    perspective: 1200px;
    position: relative;
  }

  .card-flip-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform;
    transform-style: preserve-3d;
    will-change: transform;
  }

  .card-flip-inner.flipped {
    transform: rotateY(180deg);
  }

  .card-flip-front,
  .card-flip-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 12px;
    overflow: hidden;
  }

  /* Front face - initially facing away (hidden) */
  .card-flip-front {
    transform: rotateY(180deg);
  }

  /* Back face - initially facing user (visible) */
  .card-flip-back {
    transform: rotateY(0deg);
  }

  /* When flipped, front is visible and back is hidden */
  .card-flip-inner.flipped .card-flip-front {
    transform: rotateY(0deg);
  }

  .card-flip-inner.flipped .card-flip-back {
    transform: rotateY(-180deg);
  }

  /* Cursor styles */
  .cursor-pointer {
    cursor: pointer;
  }

  .cursor-default {
    cursor: default;
  }

  /* Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .card-flip-inner {
      transition: none;
    }
  }
</style>
