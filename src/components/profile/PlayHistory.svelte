<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, getRecentPacks } from '@/stores/collection';
  import type { Pack } from '@/types';
  import { RARITY_CONFIG, RARITY_ORDER } from '@/types';

  // Tab state
  type Tab = 'packs' | 'battles' | 'crafting';
  let activeTab = $state<Tab>('packs');

  // Data state
  let recentPacks = $state<Pack[]>([]);
  let isLoading = $state(true);

  // Load recent packs on mount
  onMount(() => {
    loadRecentPacks();
  });

  function loadRecentPacks() {
    try {
      // Get last 10 packs from collection
      recentPacks = getRecentPacks(10);
      isLoading = false;
    } catch (error) {
      console.error('[PlayHistory] Failed to load recent packs:', error);
      isLoading = false;
    }
  }

  // Get rarity color
  function getRarityColor(rarity: string): string {
    return RARITY_CONFIG[rarity]?.color || '#9ca3af';
  }

  // Format timestamp
  function formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  // Get best card from pack
  function getBestCard(pack: Pack) {
    if (!pack.cards || pack.cards.length === 0) return null;
    return pack.cards.reduce((best, card) => {
      const bestOrder = RARITY_ORDER[best.rarity] || 0;
      const cardOrder = RARITY_ORDER[card.rarity] || 0;
      return cardOrder > bestOrder ? card : best;
    });
  }
</script>

<div class="play-history-container">
  <!-- Tab Navigation -->
  <div class="tab-navigation">
    <button
      class="tab-button"
      class:active={activeTab === 'packs'}
      on:click={() => activeTab = 'packs'}
      aria-label="View pack history"
    >
      📦 Recent Packs
    </button>
    <button
      class="tab-button"
      class:active={activeTab === 'battles'}
      on:click={() => activeTab = 'battles'}
      aria-label="View battle history"
    >
      ⚔️ Battle History
    </button>
    <button
      class="tab-button"
      class:active={activeTab === 'crafting'}
      on:click={() => activeTab = 'crafting'}
      aria-label="View crafting history"
    >
      🔨 Crafting History
    </button>
  </div>

  <!-- Tab Content -->
  <div class="tab-content">
    {#if activeTab === 'packs'}
      <!-- Recent Packs Tab -->
      <div class="history-section">
        {#if isLoading}
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading pack history...</p>
          </div>
        {:else if recentPacks.length > 0}
          <div class="pack-history-list">
            {#each recentPacks as pack (pack.id)}
              <div class="history-entry pack-entry">
                <div class="entry-icon">
                  📦
                </div>
                <div class="entry-details">
                  <div class="entry-header">
                    <h4 class="entry-title">Pack Opened</h4>
                    <span class="entry-time">{formatTimestamp(pack.openedAt)}</span>
                  </div>
                  <div class="entry-summary">
                    {#if pack.bestRarity}
                      <span
                        class="rarity-badge"
                        style="background-color: {getRarityColor(pack.bestRarity)}20; color: {getRarityColor(pack.bestRarity)};"
                      >
                        {pack.bestRarity.toUpperCase()}
                      </span>
                    {/if}
                    <span class="card-count">{pack.cards.length} cards</span>
                    {#if pack.holoCount > 0}
                      <span class="holo-count">✨ {pack.holoCount} holo</span>
                    {/if}
                  </div>
                  {#if getBestCard(pack)}
                    {@const bestCard = getBestCard(pack)}
                    <div class="best-card">
                      <span class="best-card-label">Best Pull:</span>
                      <span class="best-card-name">{bestCard.name}</span>
                      {#if bestCard.isHolo}
                        <span class="holo-indicator">✨</span>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <p>No packs opened yet.</p>
            <a href="/pack" class="cta-link">Open your first pack →</a>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'battles'}
      <!-- Battle History Tab -->
      <div class="history-section">
        <div class="empty-state">
          <p>Battle history coming soon!</p>
          <p class="empty-hint">Deck battles will be available in a future update.</p>
        </div>
      </div>

    {:else if activeTab === 'crafting'}
      <!-- Crafting History Tab -->
      <div class="history-section">
        <div class="empty-state">
          <p>Crafting history coming soon!</p>
          <p class="empty-hint">Card crafting will be available in a future update.</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .play-history-container {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* Tab Navigation */
  .tab-navigation {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
    overflow-x: auto;
  }

  .tab-button {
    flex: 1;
    min-width: max-content;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px 8px 0 0;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .tab-button:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .tab-button.active {
    color: #f59e0b;
    background: transparent;
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    right: 0;
    height: 2px;
    background: #f59e0b;
    border-radius: 2px 2px 0 0;
  }

  /* Tab Content */
  .tab-content {
    min-height: 300px;
  }

  .history-section {
    width: 100%;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #6b7280;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Pack History List */
  .pack-history-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .history-entry {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: #f9fafb;
    border-radius: 12px;
    border-left: 4px solid #e5e7eb;
    transition: all 0.2s;
  }

  .pack-entry {
    border-left-color: #f59e0b;
  }

  .history-entry:hover {
    background: #f3f4f6;
    transform: translateX(4px);
  }

  .entry-icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .entry-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .entry-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .entry-time {
    font-size: 0.875rem;
    color: #6b7280;
    white-space: nowrap;
  }

  .entry-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .rarity-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .card-count,
  .holo-count {
    font-size: 0.875rem;
    color: #4b5563;
  }

  .holo-count {
    color: #8b5cf6;
    font-weight: 600;
  }

  .best-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .best-card-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 600;
  }

  .best-card-name {
    font-size: 0.875rem;
    font-weight: 700;
    color: #1f2937;
  }

  .holo-indicator {
    font-size: 0.875rem;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #6b7280;
    text-align: center;
  }

  .empty-state p {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
  }

  .empty-hint {
    font-size: 0.875rem !important;
    color: #9ca3af !important;
  }

  .cta-link {
    color: #f59e0b;
    text-decoration: none;
    font-weight: 600;
    margin-top: 1rem;
    transition: color 0.2s;
  }

  .cta-link:hover {
    color: #d97706;
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .play-history-container {
      padding: 1rem;
    }

    .tab-navigation {
      flex-direction: column;
      gap: 0.25rem;
    }

    .tab-button {
      width: 100%;
      border-radius: 8px;
    }

    .tab-button.active::after {
      display: none;
    }

    .tab-button.active {
      background: #fef3c7;
    }

    .entry-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .history-entry {
      padding: 1rem;
    }
  }
</style>
