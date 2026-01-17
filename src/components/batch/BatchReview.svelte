<script lang="ts">
  import type { Pack } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import Card from '../card/Card.svelte';

  interface Props {
    pack: Pack;
    packIndex: number;
    totalPacks: number;
    onExit: () => void;
    onNext: () => void;
    onPrev: () => void;
  }

  const { pack, packIndex, totalPacks, onExit, onNext, onPrev }: Props = $props();

  function getRarityColorClass(rarity: string): string {
    const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
    return config?.color || '#9ca3af';
  }
</script>

<div class="batch-review">
  <!-- Review Header -->
  <div class="review-header">
    <button onclick={onExit} class="back-button">
      ← Back to Summary
    </button>
    <h1 class="review-title">Pack #{packIndex + 1}</h1>
    <div class="pack-counter">
      {packIndex + 1} / {totalPacks}
    </div>
  </div>

  <!-- Pack Info -->
  <div class="pack-info-bar">
    <div class="info-item">
      <span class="info-label">Cards</span>
      <span class="info-value">{pack.cards.length}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Best Pull</span>
      <span
        class="info-value"
        style="color: {getRarityColorClass(pack.bestRarity)}"
      >
        {RARITY_CONFIG[pack.bestRarity].name}
      </span>
    </div>
    <div class="info-item">
      <span class="info-label">Holo</span>
      <span class="info-value">{pack.cards.filter((c) => c.isHolo).length}</span>
    </div>
  </div>

  <!-- Cards Grid -->
  <div class="cards-container">
    <div class="cards-grid">
      {#each pack.cards as card, index}
        <div class="card-wrapper" class:holo={card.isHolo}>
          <div class="card-number">#{index + 1}</div>
          <Card {card} />
          {#if card.isHolo}
            <div class="holo-badge">✨ Holo</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Navigation -->
  <div class="review-navigation">
    <button
      onclick={onPrev}
      class="nav-button"
      disabled={packIndex === 0}
      class:disabled={packIndex === 0}
    >
      ← Previous Pack
    </button>
    <button
      onclick={onNext}
      class="nav-button"
      disabled={packIndex === totalPacks - 1}
      class:disabled={packIndex === totalPacks - 1}
    >
      {packIndex === totalPacks - 1 ? 'Finish Review' : 'Next Pack →'}
    </button>
  </div>

  <!-- Keyboard Hints -->
  <div class="keyboard-hints">
    <span class="hint">← → Navigate</span>
    <span class="hint">Esc Exit</span>
  </div>
</div>

<style>
  .batch-review {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: #f8fafc;
    padding: 1rem;
  }

  /* Header */
  .review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: rgba(30, 41, 59, 0.8);
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .back-button {
    padding: 0.5rem 1rem;
    background: rgba(51, 65, 85, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.5rem;
    color: #e2e8f0;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: rgba(71, 85, 105, 0.8);
  }

  .review-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f8fafc;
    flex: 1;
    text-align: center;
  }

  .pack-counter {
    padding: 0.5rem 1rem;
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 0.5rem;
    color: #fbbf24;
    font-weight: 600;
  }

  /* Pack Info Bar */
  .pack-info-bar {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem;
    background: rgba(30, 41, 59, 0.6);
    border-radius: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .info-label {
    color: #94a3b8;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    color: #f8fafc;
    font-size: 1.25rem;
    font-weight: 700;
  }

  /* Cards Container */
  .cards-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 0;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    width: 100%;
  }

  .card-wrapper {
    position: relative;
    padding: 0.5rem;
    background: rgba(30, 41, 59, 0.6);
    border: 2px solid rgba(148, 163, 184, 0.2);
    border-radius: 1rem;
    transition: all 0.2s ease;
  }

  .card-wrapper:hover {
    border-color: rgba(148, 163, 184, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }

  .card-wrapper.holo {
    border-color: rgba(251, 191, 36, 0.3);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.1);
  }

  .card-wrapper.holo:hover {
    box-shadow: 0 0 30px rgba(251, 191, 36, 0.2);
  }

  .card-number {
    position: absolute;
    top: -8px;
    left: -8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 50%;
    border: 2px solid rgba(148, 163, 184, 0.2);
  }

  .holo-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    color: #0f172a;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  }

  /* Navigation */
  .review-navigation {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(30, 41, 59, 0.8);
    border-top: 1px solid rgba(148, 163, 184, 0.1);
    margin-top: 2rem;
  }

  .nav-button {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    border: none;
    border-radius: 0.5rem;
    color: #0f172a;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-button:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .nav-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(51, 65, 85, 0.8);
    color: #94a3b8;
  }

  /* Keyboard Hints */
  .keyboard-hints {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem;
    margin-top: 1rem;
  }

  .hint {
    padding: 0.25rem 0.75rem;
    background: rgba(51, 65, 85, 0.5);
    border-radius: 0.25rem;
    color: #94a3b8;
    font-size: 0.8rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .review-header {
      flex-direction: column;
      text-align: center;
    }

    .review-title {
      order: -1;
      font-size: 1.25rem;
    }

    .cards-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .pack-info-bar {
      gap: 1rem;
    }

    .info-value {
      font-size: 1rem;
    }

    .review-navigation {
      flex-direction: column;
    }

    .nav-button {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .cards-grid {
      grid-template-columns: 1fr;
    }

    .keyboard-hints {
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
  }
</style>
