<script lang="ts">
  import type { BatchSummary, Pack } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import type { Card } from '../../types';
  import Card from '../card/Card.svelte';

  interface Props {
    summary: BatchSummary | null;
    packs: Pack[];
    onReset: () => void;
    onReview: (index: number) => void;
  }

  const { summary, packs, onReset, onReview }: Props = $props();

  // Format duration as MM:SS
  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  // Get rarity color class
  function getRarityColorClass(rarity: string): string {
    const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
    return config?.color || '#9ca3af';
  }
</script>

<div class="batch-results">
  <div class="results-header">
    <h1 class="results-title">Batch Complete!</h1>
    <p class="results-subtitle">
      Opened {summary?.packsOpened} packs in {formatDuration(summary?.duration || 0)}
    </p>
  </div>

  <!-- Summary Stats -->
  <div class="summary-stats">
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-info">
        <span class="stat-label">Packs Opened</span>
        <span class="stat-value">{summary?.packsOpened}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🃏</div>
      <div class="stat-info">
        <span class="stat-label">Total Cards</span>
        <span class="stat-value">{summary?.totalCards}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">✨</div>
      <div class="stat-info">
        <span class="stat-label">Holo Cards</span>
        <span class="stat-value">{summary?.holoCount}</span>
      </div>
    </div>
  </div>

  <!-- Rarity Breakdown -->
  <div class="rarity-breakdown">
    <h2 class="section-title">Rarity Breakdown</h2>
    <div class="rarity-list">
      {#each Object.entries(summary?.rarityBreakdown || {}) as [rarity, count]}
        {#if count > 0}
          <div class="rarity-item">
            <div
              class="rarity-indicator"
              style="background-color: {getRarityColorClass(rarity)}"
            ></div>
            <span class="rarity-name">{RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.name || rarity}</span>
            <span class="rarity-count">{count}</span>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Best Pulls -->
  {#if summary && summary.bestPulls.length > 0}
    <div class="best-pulls">
      <h2 class="section-title">Best Pulls</h2>
      <div class="cards-grid">
        {#each summary.bestPulls as card, index}
          <div class="best-pull-card" class:rank-{index + 1}>
            <div class="rank-badge">{index + 1}</div>
            <!-- Mini card display -->
            <div class="mini-card">
              <div class="mini-card-header">
                <span class="mini-card-name">{card.name}</span>
                <span
                  class="mini-card-rarity"
                  style="color: {getRarityColorClass(card.rarity)}"
                >
                  {RARITY_CONFIG[card.rarity].name}
                </span>
              </div>
              <div class="mini-card-type">{card.type}</div>
              {#if card.isHolo}
                <div class="mini-card-holo">✨</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Pack List -->
  <div class="pack-list">
    <h2 class="section-title">All Packs</h2>
    <div class="packs-grid">
      {#each packs as pack, index}
        <div class="pack-item" onclick={() => onReview(index)}>
          <div class="pack-number">#{index + 1}</div>
          <div class="pack-info">
            <span class="pack-count">{pack.cards.length} cards</span>
            <span
              class="pack-best-rarity"
              style="color: {getRarityColorClass(pack.bestRarity)}"
            >
              {RARITY_CONFIG[pack.bestRarity].name}
            </span>
          </div>
          <div class="pack-arrow">→</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Actions -->
  <div class="results-actions">
    <button onclick={onReset} class="btn-secondary">
      Open More Packs
    </button>
  </div>
</div>

<style>
  .batch-results {
    width: 100%;
    max-width: 900px;
    padding: 2rem 1rem;
  }

  .results-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .results-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .results-subtitle {
    font-size: 1.25rem;
    color: #94a3b8;
  }

  /* Summary Stats */
  .summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 1rem;
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-label {
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .stat-value {
    color: #f8fafc;
    font-size: 1.75rem;
    font-weight: 700;
  }

  /* Rarity Breakdown */
  .rarity-breakdown {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #f8fafc;
    margin-bottom: 1rem;
  }

  .rarity-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .rarity-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(51, 65, 85, 0.5);
    border-radius: 0.5rem;
  }

  .rarity-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .rarity-name {
    flex: 1;
    color: #e2e8f0;
    font-weight: 500;
  }

  .rarity-count {
    color: #f8fafc;
    font-weight: 700;
    font-size: 1.1rem;
  }

  /* Best Pulls */
  .best-pulls {
    margin-bottom: 3rem;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .best-pull-card {
    position: relative;
    padding: 1.5rem;
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid rgba(148, 163, 184, 0.2);
    border-radius: 1rem;
    text-align: center;
  }

  .best-pull-card.rank-1 {
    border-color: #fbbf24;
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  }

  .best-pull-card.rank-2 {
    border-color: #c0c0c0;
    box-shadow: 0 0 20px rgba(192, 192, 192, 0.3);
  }

  .best-pull-card.rank-3 {
    border-color: #cd7f32;
    box-shadow: 0 0 20px rgba(205, 127, 50, 0.3);
  }

  .rank-badge {
    position: absolute;
    top: -10px;
    left: -10px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    color: #0f172a;
    font-weight: 700;
    border-radius: 50%;
    font-size: 0.9rem;
  }

  .mini-card {
    padding: 1rem;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 0.5rem;
    position: relative;
  }

  .mini-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .mini-card-name {
    color: #f8fafc;
    font-weight: 600;
    font-size: 0.95rem;
    text-align: left;
  }

  .mini-card-rarity {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .mini-card-type {
    color: #94a3b8;
    font-size: 0.85rem;
  }

  .mini-card-holo {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1rem;
  }

  /* Pack List */
  .pack-list {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 3rem;
  }

  .packs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .pack-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(51, 65, 85, 0.5);
    border: 2px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pack-item:hover {
    background: rgba(71, 85, 105, 0.5);
    border-color: rgba(148, 163, 184, 0.3);
    transform: translateY(-2px);
  }

  .pack-number {
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .pack-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .pack-count {
    color: #e2e8f0;
    font-size: 0.9rem;
  }

  .pack-best-rarity {
    font-weight: 600;
    font-size: 0.85rem;
  }

  .pack-arrow {
    color: #94a3b8;
    font-size: 1.25rem;
    margin-top: 0.25rem;
  }

  /* Actions */
  .results-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    color: #0f172a;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .btn-secondary {
    background: rgba(51, 65, 85, 0.8);
    color: #e2e8f0;
    border: 2px solid rgba(148, 163, 184, 0.2);
  }

  .btn-secondary:hover {
    background: rgba(71, 85, 105, 0.8);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .results-title {
      font-size: 2rem;
    }

    .summary-stats {
      grid-template-columns: 1fr;
    }

    .cards-grid {
      grid-template-columns: 1fr;
    }

    .packs-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
