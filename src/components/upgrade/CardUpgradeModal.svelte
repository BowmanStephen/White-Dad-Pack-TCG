<script lang="ts">
  import type { PackCard, CardStats, UpgradeEntry } from '../../types';
  import { RARITY_CONFIG } from '../../types';
  import { getUpgradeProgress, formatUpgradeEntry, calculateStatDifference } from '../../lib/upgrade';
  import { DEFAULT_UPGRADE_CONFIG } from '../../types';
  import Card from '../card/Card.svelte';

  interface Props {
    showModal: boolean;
    card: PackCard;
    currentLevel: number;
    upgradeHistory: UpgradeEntry[];
    duplicateCount: number;
    onUpgrade: () => Promise<{ success: boolean; error?: string; newLevel?: number }>;
  }

  let {
    showModal: showModalProp,
    card,
    currentLevel,
    upgradeHistory,
    duplicateCount,
    onUpgrade
  }: Props = $props();

  // Use local state for modal (two-way binding)
  let showModal = $state(showModalProp);

  // Watch for prop changes
  $effect(() => {
    showModal = showModalProp;
  });

  // UI state
  let isUpgrading = $state(false);
  let error = $state<string | null>(null);
  let success = $state(false);
  let showHistory = $state(false);

  // Computed values using $derived
  let canUpgrade = $derived(
    currentLevel < DEFAULT_UPGRADE_CONFIG.maxLevel &&
    duplicateCount >= DEFAULT_UPGRADE_CONFIG.costPerLevel
  );

  let isMaxed = $derived(currentLevel >= DEFAULT_UPGRADE_CONFIG.maxLevel);

  let progress = $derived(getUpgradeProgress(duplicateCount));

  let rarityConfig = $derived(RARITY_CONFIG[card.rarity]);

  // Calculate stats increase for next level
  let nextStatsIncrease = $derived(canUpgrade()
    ? {
        dadJoke: DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel,
        grillSkill: DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel,
        fixIt: DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel,
        napPower: DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel,
        remoteControl: DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel,
        thermostat: DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel,
        sockSandal: DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel,
        beerSnob: DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel,
      }
    : null
  );

  async function handleUpgrade() {
    if (!canUpgrade() || isUpgrading) return;

    isUpgrading = true;
    error = null;
    success = false;

    try {
      const result = await onUpgrade();

      if (result.success) {
        success = true;
        // Close modal after brief success display
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        error = result.error || 'Failed to upgrade card';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      isUpgrading = false;
    }
  }

  function closeModal() {
    showModal = false;
    error = null;
    success = false;
    showHistory = false;
  }

  function toggleHistory() {
    showHistory = !showHistory;
  }
</script>

<!-- Upgrade Modal -->
{#if showModal}
  <div class="modal-overlay" onclick={closeModal}>
    <div
      class="modal-content"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 id="upgrade-modal-title" class="modal-title">
            Upgrade {card.name}
          </h2>
          <div class="upgrade-badge" style="background: {rarityConfig().color}22; color: {rarityConfig().color};">
            Level {currentLevel}/{DEFAULT_UPGRADE_CONFIG.maxLevel}
            {#each Array(currentLevel) as _}
              <span class="star">★</span>
            {/each}
          </div>
        </div>
        <button class="modal-close" onclick={closeModal} aria-label="Close modal">
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        {#if error}
          <div class="alert alert-error" role="alert">
            <span class="alert-icon">⚠️</span>
            <span class="alert-message">{error}</span>
          </div>
        {/if}

        {#if success}
          <div class="alert alert-success" role="alert">
            <span class="alert-icon">✅</span>
            <span class="alert-message">Card upgraded successfully!</span>
          </div>
        {/if}

        <!-- Card Preview -->
        <div class="card-preview">
          <Card {card} size="md" interactive={false} />
        </div>

        <!-- Upgrade Info -->
        <div class="upgrade-info">
          {#if isMaxed()}
            <div class="maxed-notice">
              <span class="maxed-icon">👑</span>
              <div>
                <h3>Max Level Reached!</h3>
                <p>This card is fully upgraded at level {DEFAULT_UPGRADE_CONFIG.maxLevel}.</p>
              </div>
            </div>
          {:else if canUpgrade()}
            <div class="upgrade-available">
              <h3>Ready to Upgrade</h3>
              <p>
                Consume {DEFAULT_UPGRADE_CONFIG.costPerLevel} duplicates to increase all stats by
                +{DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel}
              </p>

              {#if nextStatsIncrease()}
                <div class="stats-preview">
                  <h4>Stat Increases:</h4>
                  <div class="stats-grid">
                    {#each Object.entries(nextStatsIncrease()) as [stat, value]}
                      <div class="stat-increase">
                        <span class="stat-name">{stat.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span class="stat-value text-green-400">+{value}</span>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              <button
                class="btn-upgrade"
                onclick={handleUpgrade}
                disabled={isUpgrading}
                style="background: linear-gradient(135deg, {rarityConfig().color}, {rarityConfig().color}dd);"
              >
                {#if isUpgrading}
                  <span class="animate-spin">⟳</span>
                  <span>Upgrading...</span>
                {:else}
                  <span>⚡</span>
                  <span>Upgrade to Level {currentLevel + 1}</span>
                {/if}
              </button>
            </div>
          {:else}
            <div class="upgrade-locked">
              <h3>Need More Duplicates</h3>
              <p>
                You have {duplicateCount}/{DEFAULT_UPGRADE_CONFIG.costPerLevel} duplicates required
                to upgrade.
              </p>

              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {progress().percentage}%; background: {rarityConfig().color};"
                ></div>
              </div>
              <div class="progress-text">
                {progress().current} / {progress().required} duplicates
              </div>
            </div>
          {/if}
        </div>

        <!-- Upgrade History -->
        {#if upgradeHistory.length > 0}
          <div class="upgrade-history">
            <button class="history-toggle" onclick={toggleHistory}>
              <span>📜</span>
              <span>Upgrade History ({upgradeHistory.length})</span>
              <span class="toggle-icon">{showHistory ? '▼' : '▶'}</span>
            </button>

            {#if showHistory}
              <div class="history-list">
                {#each upgradeHistory.slice().reverse() as entry}
                  <div class="history-entry">
                    <div class="entry-level">
                      Level {entry.fromLevel} → {entry.toLevel}
                    </div>
                    <div class="entry-date">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div class="entry-stats">
                      {#each Object.entries(calculateStatDifference(entry.statsBefore, entry.statsAfter)) as [stat, value]}
                        <span class="stat-diff text-green-400">+{value}</span>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    background: rgba(15, 23, 42, 0.6);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .upgrade-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid currentColor;
  }

  .star {
    font-size: 0.875rem;
  }

  .modal-close {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .modal-close:hover {
    color: white;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }

  .alert {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .alert-error {
    background: rgba(220, 38, 38, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .alert-success {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .alert-icon {
    font-size: 1.25rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .alert-message {
    font-size: 0.875rem;
    color: white;
    line-height: 1.4;
  }

  .card-preview {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .upgrade-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .upgrade-available h3,
  .upgrade-locked h3,
  .maxed-notice h3 {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.375rem 0;
  }

  .upgrade-available p,
  .upgrade-locked p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .stats-preview {
    padding: 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
  }

  .stats-preview h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin: 0 0 0.75rem 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .stat-increase {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
  }

  .stat-name {
    color: #94a3b8;
  }

  .stat-value {
    font-weight: 700;
  }

  .btn-upgrade {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: none;
    color: white;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-upgrade:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .btn-upgrade:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .maxed-notice {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 0.5rem;
  }

  .maxed-icon {
    font-size: 2rem;
  }

  .maxed-notice p {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0.25rem 0 0 0;
  }

  .upgrade-locked {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(71, 85, 105, 0.3);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
  }

  .progress-text {
    text-align: center;
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.5rem;
  }

  .upgrade-history {
    margin-top: 1rem;
  }

  .history-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .history-toggle:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(100, 116, 139, 0.5);
  }

  .toggle-icon {
    margin-left: auto;
    font-size: 0.75rem;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .history-entry {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    font-size: 0.75rem;
  }

  .entry-level {
    font-weight: 700;
    color: white;
  }

  .entry-date {
    color: #94a3b8;
  }

  .entry-stats {
    display: flex;
    gap: 0.25rem;
  }

  .stat-diff {
    font-weight: 700;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @media (max-width: 640px) {
    .modal-content {
      max-height: 95vh;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
