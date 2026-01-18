<script lang="ts">
  import { onMount } from 'svelte';
  import type { BatchSummary, Pack } from '@/types';
  import {
    batchPacks as batchPacksStore,
    batchSummary as batchSummaryStore,
    batchState as batchStateStore,
    reviewBatchResults,
    resetBatch,
  } from '@/stores/batch';
  import Card from '../card/Card.svelte';
  import { t } from '@/i18n';

  // Reactive state using Svelte 5 runes
  let batchPacks = $state<Pack[]>([]);
  let batchSummary = $state<BatchSummary | null>(null);
  let showAllCards = $state<boolean>(false);
  let selectedRarity = $state<string>('all');

  // Subscribe to Nanostores
  onMount(() => {
    const unsubscribers = [
      batchPacksStore.subscribe((value) => { batchPacks = value; }),
      batchSummaryStore.subscribe((value) => { batchSummary = value; }),
    ];

    // Mark batch as being reviewed
    reviewBatchResults();

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  });

  // Filter cards by rarity
  const allCards = $derived(
    batchPacks.flatMap(pack => pack.cards)
  );

  const filteredCards = $derived(
    selectedRarity === 'all'
      ? allCards
      : allCards.filter(card => card.rarity === selectedRarity)
  );

  // Get rarity breakdown for filter
  const rarityBreakdown = $derived(
    batchSummary?.rarityBreakdown || {}
  );

  // Format duration
  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  }

  // Handle reset
  function handleReset() {
    resetBatch();
  }
</script>

<div class="batch-results-container">
  {#if batchSummary}
    <!-- Summary Section -->
    <div class="summary-section">
      <h2 class="text-2xl font-bold text-center mb-4">{$t('batch.resultsTitle')}</h2>

      <!-- Key Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{batchSummary.packsOpened}</span>
          <span class="stat-label">{$t('batch.packsOpened')}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{batchSummary.totalCards}</span>
          <span class="stat-label">{$t('batch.totalCards')}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{batchSummary.holoCount}</span>
          <span class="stat-label">{$t('batch.holoCount')}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{formatDuration(batchSummary.duration)}</span>
          <span class="stat-label">{$t('batch.duration')}</span>
        </div>
      </div>

      <!-- Rarity Breakdown -->
      <div class="rarity-breakdown">
        <h3 class="text-lg font-bold mb-3">{$t('batch.rarityBreakdown')}</h3>
        <div class="rarity-grid">
          {#each Object.entries(rarityBreakdown) as [rarity, count]}
            {#if count > 0}
              <div class="rarity-item rarity-{rarity}">
                <span class="rarity-name">{rarity}</span>
                <span class="rarity-count">{count}</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Best Pulls -->
      {#if batchSummary.bestPulls.length > 0}
        <div class="best-pulls">
          <h3 class="text-lg font-bold mb-3">{$t('batch.bestPulls')}</h3>
          <div class="best-pulls-grid">
            {#each batchSummary.bestPulls as card (card.id)}
              <div class="best-pull-card">
                <Card {card} size="small" />
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- All Cards Section -->
    <div class="all-cards-section">
      <div class="section-header">
        <h3 class="text-lg font-bold">{$t('batch.allCards')}</h3>

        <!-- Rarity Filter -->
        <div class="filter-buttons">
          <button
            class="filter-btn {selectedRarity === 'all' ? 'active' : ''}"
            onclick={() => selectedRarity = 'all'}
          >
            All
          </button>
          {#each Object.entries(rarityBreakdown) as [rarity, count]}
            {#if count > 0}
              <button
                class="filter-btn rarity-{rarity} {selectedRarity === rarity ? 'active' : ''}"
                onclick={() => selectedRarity = rarity}
              >
                {rarity} ({count})
              </button>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="cards-grid">
        {#each filteredCards as card (card.id)}
          <div class="card-item">
            <Card {card} size="small" />
          </div>
        {/each}
      </div>

      <p class="text-center text-sm mt-4">
        {filteredCards.length} {selectedRarity === 'all' ? 'total' : selectedRarity} cards
      </p>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button
        class="btn-secondary"
        onclick={handleReset}
      >
        {$t('batch.newBatch')}
      </button>
    </div>
  {:else}
    <p class="text-center">{$t('batch.noResults')}</p>
  {/if}
</div>

<style>
  .batch-results-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  /* Summary Section */
  .summary-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem;
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    border-radius: 0.75rem;
    text-align: center;
    border: 2px solid #f59e0b;
  }

  .stat-value {
    display: block;
    font-size: 2.5rem;
    font-weight: bold;
    color: #f59e0b;
  }

  .stat-label {
    display: block;
    font-size: 0.875rem;
    color: #9ca3af;
  }

  /* Rarity Breakdown */
  .rarity-breakdown {
    padding: 1.5rem;
    background: #1f2937;
    border-radius: 0.75rem;
  }

  .rarity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
  }

  .rarity-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-weight: 500;
  }

  .rarity-item.rarity-common { background: #374151; }
  .rarity-item.rarity-uncommon { background: #1e3a5f; border: 1px solid #3b82f6; }
  .rarity-item.rarity-rare { background: #423503; border: 1px solid #eab308; }
  .rarity-item.rarity-epic { background: #3b1f5e; border: 1px solid #a855f7; }
  .rarity-item.rarity-legendary { background: #5c280d; border: 1px solid #f97316; }
  .rarity-item.rarity-mythic { background: #5c1a4a; border: 1px solid #ec4899; }

  .rarity-name {
    text-transform: capitalize;
  }

  .rarity-count {
    font-weight: bold;
  }

  /* Best Pulls */
  .best-pulls {
    padding: 1.5rem;
    background: #1f2937;
    border-radius: 0.75rem;
  }

  .best-pulls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .best-pull-card {
    padding: 0.5rem;
    background: #374151;
    border-radius: 0.5rem;
  }

  /* All Cards Section */
  .all-cards-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .filter-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #374151;
    border-radius: 0.5rem;
    background: #1f2937;
    color: #f9fafb;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    border-color: #f59e0b;
  }

  .filter-btn.active {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .card-item {
    padding: 0.5rem;
    background: #374151;
    border-radius: 0.5rem;
  }

  /* Actions */
  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .best-pulls-grid,
    .cards-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .section-header {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-buttons {
      justify-content: center;
    }
  }
</style>
