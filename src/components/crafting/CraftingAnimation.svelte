<script lang="ts">
  /**
   * CraftingAnimation - US080: Card Crafting - Combine Cards
   *
   * Fusing animation that plays during crafting.
   * Shows cards merging together with particle effects.
   */

  import { onMount, onDestroy } from 'svelte';
  import { RARITY_CONFIG, type CraftingRecipe, type PackCard, type Card } from '../../types';
  import { executeCraft, rollCraftingSuccess } from '../../lib/crafting';
  import { getAllCards } from '../../lib/cards/database';

  export let recipe: CraftingRecipe;
  export let selected: string[];
  export let onComplete: (result: { success: boolean; resultCard?: PackCard; returnedCards?: PackCard[] }) => void;

  let animationContainer: HTMLDivElement;
  let animationFrameId: number | null = null;
  let particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number }> = [];
  let phase: 'converge' | 'fuse' | 'reveal' = 'converge';
  let progress = 0;
  let showResult = false;
  let success = false;
  let resultCard: PackCard | null = null;

  // Animation timing
  const CONVERGE_DURATION = 1500;
  const FUSE_DURATION = 1000;
  const REVEAL_DURATION = 1500;
  let startTime: number;

  onMount(() => {
    startTime = performance.now();
    requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  });

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;

    if (elapsed < CONVERGE_DURATION) {
      phase = 'converge';
      progress = elapsed / CONVERGE_DURATION;
    } else if (elapsed < CONVERGE_DURATION + FUSE_DURATION) {
      phase = 'fuse';
      progress = (elapsed - CONVERGE_DURATION) / FUSE_DURATION;

      // Generate particles during fuse
      if (Math.random() < 0.3) {
        generateParticle();
      }
    } else if (elapsed < CONVERGE_DURATION + FUSE_DURATION + REVEAL_DURATION) {
      phase = 'reveal';
      progress = (elapsed - CONVERGE_DURATION - FUSE_DURATION) / REVEAL_DURATION;

      if (!showResult) {
        // Execute crafting and show result
        executeCrafting();
        showResult = true;
      }
    } else {
      // Animation complete
      completeAnimation();
      return;
    }

    updateParticles();
    animationFrameId = requestAnimationFrame(animate);
  }

  function executeCrafting() {
    // Get the actual card objects
    const allCards = getAllCards();
    const inputCards: PackCard[] = [];
    for (const cardId of selected) {
      const baseCard = allCards.find((c) => c.id === cardId);
      if (baseCard) {
        inputCards.push({
          ...baseCard,
          isRevealed: true,
          isHolo: Math.random() < 0.1,
          holoType: 'none',
        });
      }
    }

    // Execute the craft
    const result = executeCraft(recipe, inputCards, allCards);

    success = result.success;
    resultCard = result.resultCard || null;
  }

  function generateParticle() {
    const container = animationContainer;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Spawn particles from center moving outward
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;

    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 30 + Math.random() * 30,
    });
  }

  function updateParticles() {
    particles = particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      // Slow down over time
      p.vx *= 0.98;
      p.vy *= 0.98;

      return p.life < p.maxLife;
    });
  }

  function completeAnimation() {
    const returnedCards = success ? undefined : [];

    if (!success && recipe.failReturnRate) {
      // Calculate returned cards
      const allCards = getAllCards();
      const returnCount = Math.ceil(recipe.inputCount * recipe.failReturnRate);
      for (let i = 0; i < returnCount && i < selected.length; i++) {
        const cardId = selected[i];
        const baseCard = allCards.find((c) => c.id === cardId);
        if (baseCard) {
          returnedCards!.push({
            ...baseCard,
            isRevealed: true,
            isHolo: false,
            holoType: 'none',
          });
        }
      }
    }

    onComplete({
      success,
      resultCard: resultCard ?? undefined,
      returnedCards: returnedCards?.length > 0 ? returnedCards : undefined,
    });
  }

  // Calculate card positions for converge phase
  function getCardPosition(index: number, total: number) {
    const radius = 150;
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;

    // Converge toward center based on progress
    const convergeFactor = 1 - progress;
    const x = Math.cos(angle) * radius * convergeFactor;
    const y = Math.sin(angle) * radius * convergeFactor;

    return { x, y };
  }
</script>

<div class="crafting-animation" bind:this={animationContainer}>
  <!-- Background Glow -->
  <div
    class="fusion-glow"
    class:converge={phase === 'converge'}
    class:fusing={phase === 'fuse'}
    class:revealing={phase === 'reveal'}
    style="background: radial-gradient(circle, {RARITY_CONFIG[recipe.outputRarity].glowColor} 0%, transparent 70%)"
  ></div>

  <!-- Cards Converging -->
  {#if phase === 'converge'}
    <div class="converging-cards">
      {#each selected as cardId, index}
        {@const pos = getCardPosition(index, selected.length)}
        <div
          class="converging-card"
          style="transform: translate({pos.x}px, {pos.y}px) scale({1 - progress * 0.3}); opacity: {1 - progress * 0.5}"
        >
          <div class="mini-card" style="border-color: {RARITY_CONFIG[recipe.inputRarity].color}">
            <span class="mini-card-icon">👨</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Fusion Effect -->
  {#if phase === 'fuse'}
    <div class="fusion-effect" style="transform: scale({0.5 + progress * 0.5}); opacity: {progress}">
      <div class="fusion-core" style="border-color: {RARITY_CONFIG[recipe.outputRarity].color}">
        <div class="fusion-inner" style="background: {RARITY_CONFIG[recipe.outputRarity].color}"></div>
      </div>
    </div>
  {/if}

  <!-- Result Reveal -->
  {#if phase === 'reveal' && showResult}
    <div
      class="result-reveal"
      style="transform: scale({progress}); opacity: {Math.min(progress * 2, 1)}"
    >
      {#if success && resultCard}
        <div class="success-message">
          <div class="success-icon">✨</div>
          <div class="success-text">Crafting Successful!</div>
          <div class="result-rarity" style="color: {RARITY_CONFIG[resultCard.rarity].color}">
            {RARITY_CONFIG[resultCard.rarity].name}
          </div>
        </div>
        <div class="result-card" style="border-color: {RARITY_CONFIG[resultCard.rarity].color}">
          <div class="result-card-art">
            <span class="result-card-icon">{resultCard.type === 'ITEM' ? '🎁' : '👨'}</span>
          </div>
          <div class="result-card-name">{resultCard.name}</div>
          {#if resultCard.isHolo}
            <div class="result-holo">✨ Holo ✨</div>
          {/if}
        </div>
      {:else}
        <div class="failure-message">
          <div class="failure-icon">💨</div>
          <div class="failure-text">Crafting Failed</div>
          {#if recipe.failReturnRate}
            <div class="return-info">
              {Math.ceil(recipe.inputCount * recipe.failReturnRate)} cards returned
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Particles -->
  <svg class="particles" viewBox="0 0 400 400">
    {#each particles as particle (particle)}
      <circle
        cx={particle.x}
        cy={particle.y}
        r={2 * (1 - particle.life / particle.maxLife)}
        fill={RARITY_CONFIG[recipe.outputRarity].color}
        opacity={1 - particle.life / particle.maxLife}
      />
    {/each}
  </svg>
</div>

<style>
  .crafting-animation {
    position: relative;
    width: 100%;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .fusion-glow {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.5s ease;
  }

  .fusion-glow.converge {
    opacity: 0.3;
    animation: pulse 1s ease-in-out infinite;
  }

  .fusion-glow.fusing {
    opacity: 0.6;
    width: 300px;
    height: 300px;
    animation: pulse 0.5s ease-in-out infinite;
  }

  .fusion-glow.revealing {
    opacity: 0.8;
    width: 500px;
    height: 500px;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .converging-cards {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .converging-card {
    position: absolute;
    transition: all 0.1s linear;
  }

  .mini-card {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0.5rem;
    border: 2px solid;
  }

  .mini-card-icon {
    font-size: 1.5rem;
  }

  .fusion-effect {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fusion-core {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 4px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .fusion-inner {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    animation: glow 0.5s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from { opacity: 0.6; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1.1); }
  }

  .result-reveal {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .success-message,
  .failure-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  .success-icon,
  .failure-icon {
    font-size: 4rem;
  }

  .success-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #22c55e;
  }

  .failure-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ef4444;
  }

  .result-rarity {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .return-info {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .result-card {
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 1rem;
    border: 3px solid;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .result-card-art {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.75rem;
  }

  .result-card-icon {
    font-size: 4rem;
  }

  .result-card-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: white;
  }

  .result-holo {
    font-size: 0.875rem;
    color: #fbbf24;
  }

  .particles {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
