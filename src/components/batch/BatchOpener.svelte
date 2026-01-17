<script lang="ts">
  import { onDestroy } from 'svelte';
  import {
    batchState,
    batchProgress,
    batchPacks,
    batchSummary,
    batchError,
    batchConfig,
    isBatchRunning,
    isBatchComplete,
    startBatch,
    cancelBatch,
    resetBatch,
    reviewPack,
    exitReviewMode,
    nextReviewPack,
    prevReviewPack,
    reviewingPack,
    reviewingPackIndex,
  } from '../../stores/batch';
  import { RARITY_CONFIG, type BatchConfig } from '../../types';
  import Button from '../common/Button.astro';
  import BatchResults from './BatchResults.svelte';
  import BatchReview from './BatchReview.svelte';

  // Local state
  let showConfirmation = $state(false);
  let selectedPackCount = $state(10);
  let fastForwardEnabled = $state(true);
  let autoSaveEnabled = $state(true);

  // Predefined pack counts
  const packOptions = [1, 5, 10, 25, 50];

  // Computed values from stores
  const progress = $derived(batchProgress.get());
  const state = $derived(batchState.get());
  const summary = $derived(batchSummary.get());
  const error = $derived(batchError.get());
  const running = $derived(isBatchRunning.get());
  const complete = $derived(isBatchComplete.get());
  const packs = $derived(batchPacks.get());
  const config = $derived(batchConfig.get());
  const currentReviewingPack = $derived(reviewingPack.get());
  const reviewIndex = $derived(reviewingPackIndex.get());

  /**
   * Show confirmation dialog
   */
  function showStartConfirmation() {
    showConfirmation = true;
  }

  /**
   * Start batch opening
   */
  async function handleStartBatch() {
    const batchConfig: BatchConfig = {
      totalPacks: selectedPackCount,
      fastForward: fastForwardEnabled,
      autoSave: autoSaveEnabled,
    };

    showConfirmation = false;
    await startBatch(batchConfig);
  }

  /**
   * Cancel batch opening
   */
  function handleCancel() {
    cancelBatch();
    showConfirmation = false;
  }

  /**
   * Reset and go back to start
   */
  function handleReset() {
    resetBatch();
    showConfirmation = false;
    selectedPackCount = 10;
    fastForwardEnabled = true;
    autoSaveEnabled = true;
  }

  /**
   * Review a specific pack
   */
  function handleReviewPack(index: number) {
    reviewPack(index);
  }

  /**
   * Cleanup on unmount
   */
  onDestroy(() => {
    // Cancel any running batch when component unmounts
    if (running) {
      cancelBatch();
    }
  });
</script>

<div class="batch-opener">
  {#if state === 'idle' || state === 'paused'}
    <!-- Initial State / Paused State -->
    <div class="batch-start-screen">
      <div class="batch-header">
        <h1 class="batch-title">Open Multiple Packs</h1>
        <p class="batch-subtitle">
          Open multiple packs at once with fast-forward mode
        </p>
      </div>

      {#if error}
        <div class="batch-error">
          <span class="error-icon">⚠️</span>
          <span class="error-message">{error}</span>
        </div>
      {/if}

      {#if state === 'paused'}
        <div class="paused-info">
          <h2>Batch Paused</h2>
          <p>
            Opened {progress.currentPack} of {progress.totalPacks} packs before
            cancelling.
          </p>
          <div class="paused-actions">
            <button onclick={handleReset} class="btn-secondary">
              Start Over
            </button>
          </div>
        </div>
      {:else}
        <div class="batch-options">
          <!-- Pack Count Selection -->
          <div class="option-group">
            <label class="option-label">Number of Packs</label>
            <div class="pack-count-options">
              {#each packOptions as count}
                <button
                  class="pack-count-btn"
                  class:active={selectedPackCount === count}
                  onclick={() => (selectedPackCount = count)}
                >
                  {count}
                </button>
              {/each}
            </div>
          </div>

          <!-- Fast Forward Toggle -->
          <div class="option-group">
            <label class="option-label">Options</label>
            <div class="toggle-options">
              <label class="toggle-option">
                <input
                  type="checkbox"
                  bind:checked={fastForwardEnabled}
                  class="toggle-checkbox"
                />
                <span class="toggle-label">
                  <span class="toggle-title">Fast-Forward Mode</span>
                  <span class="toggle-description"
                    >Skip animations for faster opening</span
                  >
                </span>
              </label>

              <label class="toggle-option">
                <input
                  type="checkbox"
                  bind:checked={autoSaveEnabled}
                  class="toggle-checkbox"
                />
                <span class="toggle-label">
                  <span class="toggle-title">Auto-Save to Collection</span>
                  <span class="toggle-description"
                    >Automatically save all opened packs</span
                  >
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Start Button -->
        <div class="start-actions">
          <button onclick={showStartConfirmation} class="btn-primary">
            Open {selectedPackCount} {selectedPackCount === 1 ? 'Pack' : 'Packs'}
          </button>
        </div>
      {/if}
    </div>
  {:else if showConfirmation}
    <!-- Confirmation Dialog -->
    <div class="confirmation-dialog">
      <div class="confirmation-content">
        <h2>Confirm Batch Opening</h2>
        <p>Are you sure you want to open {selectedPackCount} packs?</p>

        <div class="confirmation-details">
          <div class="detail-item">
            <span class="detail-label">Packs to Open:</span>
            <span class="detail-value">{selectedPackCount}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total Cards:</span>
            <span class="detail-value">{selectedPackCount * 6}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Fast-Forward:</span>
            <span class="detail-value"
              >{fastForwardEnabled ? 'Enabled' : 'Disabled'}</span
            >
          </div>
          <div class="detail-item">
            <span class="detail-label">Auto-Save:</span>
            <span class="detail-value">{autoSaveEnabled ? 'Yes' : 'No'}</span>
          </div>
        </div>

        <div class="confirmation-actions">
          <button onclick={() => (showConfirmation = false)} class="btn-secondary">
            Cancel
          </button>
          <button onclick={handleStartBatch} class="btn-primary">
            Start Opening
          </button>
        </div>
      </div>
    </div>
  {:else if running}
    <!-- Opening State - Progress Screen -->
    <div class="batch-progress-screen">
      <div class="progress-header">
        <h2 class="progress-title">Opening Packs</h2>
        <p class="progress-subtitle">
          Pack {progress.currentPack} of {progress.totalPacks}
        </p>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: {progress.percentage}%"
          ></div>
        </div>
        <div class="progress-percentage">{Math.round(progress.percentage)}%</div>
      </div>

      <!-- Stats -->
      <div class="progress-stats">
        <div class="stat-item">
          <span class="stat-label">Cards Opened</span>
          <span class="stat-value">{progress.cardsOpened}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Cards</span>
          <span class="stat-value">{progress.totalCards}</span>
        </div>
      </div>

      <!-- Cancel Button -->
      <div class="progress-actions">
        <button onclick={handleCancel} class="btn-secondary">
          Cancel
        </button>
      </div>

      {#if error}
        <div class="batch-error">
          <span class="error-icon">⚠️</span>
          <span class="error-message">{error}</span>
        </div>
      {/if}
    </div>
  {:else if complete && state !== 'reviewing'}
    <!-- Complete State - Results Summary -->
    <BatchResults
      summary={summary}
      packs={packs}
      onReset={handleReset}
      onReview={(index) => handleReviewPack(index)}
    />
  {:else if state === 'reviewing' && currentReviewingPack}
    <!-- Review Mode - Individual Pack Review -->
    <BatchReview
      pack={currentReviewingPack}
      packIndex={reviewIndex}
      totalPacks={packs.length}
      onExit={exitReviewMode}
      onNext={nextReviewPack}
      onPrev={prevReviewPack}
    />
  {/if}
</div>

<style>
  .batch-opener {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: #f8fafc;
  }

  /* Start Screen */
  .batch-start-screen {
    max-width: 600px;
    width: 100%;
  }

  .batch-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .batch-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .batch-subtitle {
    font-size: 1.1rem;
    color: #94a3b8;
  }

  /* Options */
  .batch-options {
    background: rgba(30, 41, 59, 0.8);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  .option-group {
    margin-bottom: 1.5rem;
  }

  .option-group:last-child {
    margin-bottom: 0;
  }

  .option-label {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 0.75rem;
  }

  .pack-count-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .pack-count-btn {
    flex: 1;
    min-width: 60px;
    padding: 0.75rem 1rem;
    background: rgba(51, 65, 85, 0.8);
    border: 2px solid rgba(148, 163, 184, 0.2);
    border-radius: 0.5rem;
    color: #e2e8f0;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pack-count-btn:hover {
    background: rgba(71, 85, 105, 0.8);
    border-color: rgba(148, 163, 184, 0.3);
  }

  .pack-count-btn.active {
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    border-color: #fbbf24;
    color: #0f172a;
  }

  .toggle-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .toggle-option {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(51, 65, 85, 0.5);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .toggle-option:hover {
    background: rgba(71, 85, 105, 0.5);
  }

  .toggle-checkbox {
    margin-top: 0.25rem;
    width: 1.25rem;
    height: 1.25rem;
    accent-color: #fbbf24;
  }

  .toggle-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .toggle-title {
    font-weight: 600;
    color: #e2e8f0;
  }

  .toggle-description {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  /* Actions */
  .start-actions {
    display: flex;
    justify-content: center;
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

  /* Paused State */
  .paused-info {
    text-align: center;
    padding: 2rem;
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 1rem;
    margin-bottom: 2rem;
  }

  .paused-info h2 {
    font-size: 1.5rem;
    color: #ef4444;
    margin-bottom: 0.5rem;
  }

  .paused-info p {
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .paused-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  /* Error */
  .batch-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .error-icon {
    font-size: 1.5rem;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.9rem;
  }

  /* Confirmation Dialog */
  .confirmation-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    padding: 1rem;
  }

  .confirmation-content {
    background: #1e293b;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .confirmation-content h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #f8fafc;
  }

  .confirmation-content > p {
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }

  .confirmation-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(51, 65, 85, 0.5);
    border-radius: 0.5rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-label {
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .detail-value {
    color: #f8fafc;
    font-weight: 600;
  }

  .confirmation-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  /* Progress Screen */
  .batch-progress-screen {
    max-width: 600px;
    width: 100%;
    text-align: center;
  }

  .progress-header {
    margin-bottom: 2rem;
  }

  .progress-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #f8fafc;
  }

  .progress-subtitle {
    font-size: 1.25rem;
    color: #94a3b8;
  }

  .progress-bar-container {
    margin-bottom: 2rem;
  }

  .progress-bar {
    height: 2rem;
    background: rgba(51, 65, 85, 0.8);
    border-radius: 1rem;
    overflow: hidden;
    position: relative;
    border: 2px solid rgba(148, 163, 184, 0.2);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24 0%, #f97316 100%);
    transition: width 0.3s ease;
    position: relative;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .progress-percentage {
    margin-top: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .progress-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .stat-item {
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
    font-size: 1.5rem;
    font-weight: 700;
  }

  .progress-actions {
    display: flex;
    justify-content: center;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .batch-title {
      font-size: 2rem;
    }

    .progress-title {
      font-size: 1.5rem;
    }

    .pack-count-btn {
      min-width: 50px;
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
    }

    .progress-stats {
      gap: 1rem;
    }

    .stat-value {
      font-size: 1.25rem;
    }
  }
</style>
