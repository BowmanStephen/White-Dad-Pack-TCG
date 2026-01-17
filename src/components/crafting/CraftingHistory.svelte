<script lang="ts">
  /**
   * CraftingHistory - US080: Card Crafting - Combine Cards
   *
   * Displays the player's crafting history including
   * successful and failed crafts with statistics.
   */

  import { RARITY_CONFIG, type CraftingHistoryEntry } from '../../types';
  import { craftingHistory, getCraftingStats, clearCraftingHistory } from '../../stores/crafting';

  export let onClose: () => void;

  $: history = $craftingHistory;
  $: stats = getCraftingStats();

  function formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  function clearHistory() {
    if (confirm('Are you sure you want to clear your crafting history? This cannot be undone.')) {
      clearCraftingHistory();
    }
  }
</script>

<div class="crafting-history">
  <div class="history-header">
    <h2>Crafting History</h2>
    <button class="close-button" on:click={onClose}>×</button>
  </div>

  <!-- Stats Overview -->
  <div class="history-stats">
    <div class="history-stat">
      <span class="history-stat-value">{stats.totalAttempts}</span>
      <span class="history-stat-label">Total Crafts</span>
    </div>
    <div class="history-stat">
      <span class="history-stat-value">{stats.successfulCrafts}</span>
      <span class="history-stat-label">Successful</span>
    </div>
    <div class="history-stat">
      <span class="history-stat-value">{stats.failedCrafts}</span>
      <span class="history-stat-label">Failed</span>
    </div>
    <div class="history-stat">
      <span class="history-stat-value">{Math.round(stats.successRate * 100)}%</span>
      <span class="history-stat-label">Success Rate</span>
    </div>
  </div>

  <!-- Best Craft -->
  {#if stats.bestCraft}
    <div class="best-craft">
      <span class="best-craft-label">Best Craft:</span>
      <span class="best-craft-name" style="color: {RARITY_CONFIG[stats.bestCraft.rarity].color}">
        {stats.bestCraft.name}
      </span>
      <span class="best-craft-rarity" style="color: {RARITY_CONFIG[stats.bestCraft.rarity].color}">
        {RARITY_CONFIG[stats.bestCraft.rarity].name}
      </span>
      {#if stats.bestCraft.isHolo}
        <span class="best-craft-holo">✨</span>
      {/if}
    </div>
  {/if}

  <!-- History Entries -->
  <div class="history-entries">
    <h3>Recent Activity</h3>

    {#if history.entries.length === 0}
      <div class="no-history">
        <p>No crafting history yet.</p>
        <p>Start crafting to build your collection!</p>
      </div>
    {:else}
      <div class="entries-list">
        {#each history.entries as entry}
          <div
            class="history-entry"
            class:success={entry.success}
            class:failure={!entry.success}
          >
            <div class="entry-icon">
              {entry.success ? '✅' : '❌'}
            </div>

            <div class="entry-details">
              <div class="entry-recipe">{entry.recipe.name}</div>
              <div class="entry-meta">
                <span class="entry-time">{formatDate(entry.timestamp)}</span>
                <span class="entry-chance">{Math.round(entry.recipe.successRate * 100)}% success</span>
              </div>
            </div>

            <div class="entry-result">
              {#if entry.success && entry.result}
                <div class="result-card">
                  <div class="result-icon" style="color: {RARITY_CONFIG[entry.result.rarity].color}">
                    {entry.result.type === 'ITEM' ? '🎁' : '👨'}
                  </div>
                  <div class="result-info">
                    <span class="result-name">{entry.result.name}</span>
                    <span class="result-rarity" style="color: {RARITY_CONFIG[entry.result.rarity].color}">
                      {RARITY_CONFIG[entry.result.rarity].name}
                    </span>
                  </div>
                  {#if entry.result.isHolo}
                    <span class="result-holo">✨</span>
                  {/if}
                </div>
              {:else}
                <div class="result-failed">
                  <span class="failed-text">Failed</span>
                  {#if entry.recipe.failReturnRate}
                    <span class="failed-returned">
                      {Math.ceil(entry.recipe.inputCount * entry.recipe.failReturnRate)} returned
                    </span>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Actions -->
  <div class="history-actions">
    <button class="btn-secondary" on:click={clearHistory}>
      Clear History
    </button>
    <button class="btn-primary" on:click={onClose}>
      Close
    </button>
  </div>
</div>

<style>
  .crafting-history {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .history-header h2 {
    font-size: 1.75rem;
    margin: 0;
  }

  .close-button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 0.5rem;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .history-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }

  .history-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .history-stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .history-stat-label {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .best-craft {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(251, 191, 36, 0.1);
    border-radius: 0.75rem;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .best-craft-label {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .best-craft-name {
    font-size: 1rem;
    font-weight: 600;
  }

  .best-craft-rarity {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .best-craft-holo {
    font-size: 1rem;
  }

  .history-entries {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .history-entries h3 {
    font-size: 1.125rem;
    margin: 0;
  }

  .no-history {
    text-align: center;
    padding: 3rem;
    color: #9ca3af;
  }

  .no-history p {
    margin: 0.5rem 0;
  }

  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .history-entry {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }

  .history-entry.success {
    border-left: 3px solid #22c55e;
  }

  .history-entry.failure {
    border-left: 3px solid #ef4444;
  }

  .entry-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .entry-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .entry-recipe {
    font-weight: 600;
    color: white;
  }

  .entry-meta {
    display: flex;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .entry-result {
    flex-shrink: 0;
  }

  .result-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .result-icon {
    font-size: 1.5rem;
  }

  .result-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .result-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
  }

  .result-rarity {
    font-size: 0.625rem;
    font-weight: 500;
  }

  .result-holo {
    font-size: 0.75rem;
  }

  .result-failed {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    padding: 0.5rem 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 0.5rem;
  }

  .failed-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: #ef4444;
  }

  .failed-returned {
    font-size: 0.625rem;
    color: #9ca3af;
  }

  .history-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .btn-primary {
    background: linear-gradient(135deg, #fbbf24, #f97316);
    color: black;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  @media (max-width: 640px) {
    .crafting-history {
      padding: 1rem;
    }

    .history-stats {
      grid-template-columns: 1fr 1fr;
    }

    .history-entry {
      flex-direction: column;
      align-items: flex-start;
    }

    .history-actions {
      flex-direction: column;
    }
  }
</style>
