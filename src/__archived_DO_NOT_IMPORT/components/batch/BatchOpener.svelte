<script lang="ts">
  import { onMount } from 'svelte';
  import type { BatchState, BatchProgress, BatchConfig, Pack } from '@/types';
  import {
    batchState as batchStateStore,
    batchProgress as batchProgressStore,
    currentBatchPack as currentBatchPackStore,
    batchConfig as batchConfigStore,
    startBatch,
    cancelBatch,
    resetBatch,
  } from '@/stores/batch';
  import Card from '../card/Card.svelte';
  import { t } from '@/i18n';

  // Reactive state using Svelte 5 runes
  let batchState = $state<BatchState>('idle');
  let batchProgress = $state<BatchProgress>({
    currentPack: 0,
    totalPacks: 0,
    cardsOpened: 0,
    totalCards: 0,
    percentage: 0,
  });
  let currentPack = $state<Pack | null>(null);
  let batchConfig = $state<BatchConfig>({
    totalPacks: 10,
    fastForward: true,
    autoSave: true,
  });

  // Local UI state
  let showConfig = $state<boolean>(true);
  let selectedPackCount = $state<number>(10);
  let mounted = $state<boolean>(false);

  // Subscribe to Nanostores only after mount
  onMount(() => {
    mounted = true;

    const unsubscribers = [
      batchStateStore.subscribe((value) => { batchState = value; }),
      batchProgressStore.subscribe((value) => { batchProgress = value; }),
      currentBatchPackStore.subscribe((value) => { currentPack = value; }),
      batchConfigStore.subscribe((value) => { batchConfig = value; }),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  });

  // Actions
  async function handleStartBatch() {
    showConfig = false;
    await startBatch({
      totalPacks: selectedPackCount,
      fastForward: true,
      autoSave: true,
    });
  }

  function handleCancelBatch() {
    cancelBatch();
    showConfig = true;
  }

  function handleReset() {
    resetBatch();
    showConfig = true;
  }

  // Pack count options
  const packCountOptions = [5, 10, 20, 50, 100];
</script>

{#if !mounted}
  <!-- Loading state during SSR -->
  <div class="batch-opener-container">
    <div class="text-center p-8">
      <p>Loading...</p>
    </div>
  </div>
{:else}
  <div class="batch-opener-container">
    {#if showConfig}
      <!-- Configuration Screen -->
      <div class="batch-config">
        <h2 class="text-2xl font-bold text-center mb-6">{$t('batch.openMultiple')}</h2>

        <div class="config-section">
          <label class="block text-sm font-medium mb-2">{$t('batch.selectCount')}</label>
          <div class="pack-count-grid">
            {#each packCountOptions as count}
              <button
                class="pack-count-btn {selectedPackCount === count ? 'selected' : ''}"
                onclick={() => selectedPackCount = count}
              >
                {count}
              </button>
            {/each}
          </div>
        </div>

        <div class="info-box">
          <p class="text-sm">{$t('batch.fastForwardInfo')}</p>
        </div>

        <button
          class="btn-primary w-full mt-6"
          onclick={handleStartBatch}
        >
          {$t('batch.openPacks', { count: selectedPackCount })}
        </button>
      </div>

    {:else if batchState === 'preparing' || batchState === 'opening'}
      <!-- Opening Screen with Progress -->
      <div class="batch-opening">
        <div class="progress-section">
          <div class="progress-header">
            <h3 class="text-xl font-bold">{$t('batch.opening')}</h3>
            <span class="progress-text">
              {batchProgress.currentPack} / {batchProgress.totalPacks}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="progress-bar-container">
            <div
              class="progress-bar"
              style="width: {batchProgress.percentage}%"
            ></div>
          </div>

          <p class="text-center text-sm mt-2">
            {$t('batch.progress', {
              current: batchProgress.currentPack,
              total: batchProgress.totalPacks
            })}
          </p>

          <!-- Stats -->
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{batchProgress.cardsOpened}</span>
              <span class="stat-label">{$t('batch.cardsOpened')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{batchProgress.percentage}%</span>
              <span class="stat-label">{$t('batch.complete')}</span>
            </div>
          </div>

          <!-- Current Pack Preview -->
          {#if currentPack}
            <div class="current-pack-preview">
              <h4 class="text-sm font-semibold mb-2">{$t('batch.currentPack')}</h4>
              <div class="card-preview-grid">
                {#each currentPack.cards as card}
                  <div class="mini-card">
                    <span class="rarity-dot rarity-{card.rarity}"></span>
                    <span class="text-xs">{card.name}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Cancel Button -->
        <button
          class="btn-secondary w-full mt-6"
          onclick={handleCancelBatch}
        >
          {$t('batch.cancel')}
        </button>
      </div>

    {:else if batchState === 'paused'}
      <!-- Paused Screen -->
      <div class="batch-paused">
        <h3 class="text-xl font-bold text-center mb-4">{$t('batch.paused')}</h3>

        <div class="paused-info">
          <p class="text-center">
            {$t('batch.pausedInfo', {
              opened: batchProgress.currentPack,
              total: batchProgress.totalPacks
            })}
          </p>
        </div>

        <div class="button-group">
          <button
            class="btn-primary"
            onclick={() => startBatch()}
          >
            {$t('batch.resume')}
          </button>
          <button
            class="btn-secondary"
            onclick={handleReset}
          >
            {$t('batch.reset')}
          </button>
        </div>
      </div>

    {:else if batchState === 'complete' || batchState === 'reviewing'}
      <!-- Complete Screen - Will be handled by BatchResults component -->
      <div class="batch-complete">
        <h3 class="text-xl font-bold text-center mb-4">{$t('batch.complete')}</h3>
        <p class="text-center mb-6">
          {$t('batch.completeInfo', {
            count: batchProgress.currentPack
          })}
        </p>
        <button
          class="btn-primary w-full"
          onclick={handleReset}
        >
          {$t('batch.newBatch')}
        </button>
      </div>

    {/if}
  </div>
{/if}

<style>
  .batch-opener-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }

  /* Configuration Screen */
  .batch-config {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .config-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pack-count-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }

  .pack-count-btn {
    aspect-ratio: 1;
    border: 2px solid #374151;
    border-radius: 0.5rem;
    background: #1f2937;
    color: #f9fafb;
    font-weight: bold;
    font-size: 1.125rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .pack-count-btn:hover {
    border-color: #f59e0b;
    background: #374151;
  }

  .pack-count-btn.selected {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .info-box {
    padding: 1rem;
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 0.5rem;
  }

  /* Opening Screen */
  .batch-opening {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: #1f2937;
    border-radius: 0.75rem;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress-text {
    font-size: 1.25rem;
    font-weight: bold;
    color: #f59e0b;
  }

  .progress-bar-container {
    width: 100%;
    height: 1rem;
    background: #374151;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
    transition: width 0.3s ease;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-item {
    text-align: center;
    padding: 0.75rem;
    background: #374151;
    border-radius: 0.5rem;
  }

  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #f59e0b;
  }

  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  /* Current Pack Preview */
  .current-pack-preview {
    padding: 1rem;
    background: #374151;
    border-radius: 0.5rem;
  }

  .card-preview-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .mini-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    background: #1f2937;
    border-radius: 0.25rem;
    font-size: 0.625rem;
  }

  .rarity-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
  }

  .rarity-dot.rarity-common { background: #9ca3af; }
  .rarity-dot.rarity-uncommon { background: #3b82f6; }
  .rarity-dot.rarity-rare { background: #eab308; }
  .rarity-dot.rarity-epic { background: #a855f7; }
  .rarity-dot.rarity-legendary { background: #f97316; }
  .rarity-dot.rarity-mythic { background: #ec4899; }

  /* Paused Screen */
  .batch-paused {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .paused-info {
    padding: 1.5rem;
    background: #1f2937;
    border-radius: 0.75rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  .button-group button {
    flex: 1;
  }

  /* Complete Screen */
  .batch-complete {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
