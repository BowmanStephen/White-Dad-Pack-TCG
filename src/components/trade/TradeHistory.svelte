<script lang="ts">
  import { onMount } from 'svelte';
  import type { TradeHistoryEntry } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS } from '../../types';
  import {
    tradeStore,
    getTradeHistory,
    getPendingTrades,
    clearTradeHistory,
  } from '../../stores/trade';

  // State
  let isInitialized = $state(false);
  let activeTab = $state<'pending' | 'history'>('pending');
  let tradeHistory: TradeHistoryEntry[] = $state([]);

  // Pending trades
  let sentTrades = $state([]);
  let receivedTrades = $state([]);

  // Subscribe to trade store
  $effect(() => {
    const unsubscribe = tradeStore.subscribe((state) => {
      tradeHistory = state.tradeHistory;
      sentTrades = state.sentTrades;
      receivedTrades = state.receivedTrades;
    });
    return unsubscribe;
  });

  onMount(() => {
    // Load data
    tradeHistory = getTradeHistory();
    const pending = getPendingTrades();
    sentTrades = pending.sent;
    receivedTrades = pending.received;

    isInitialized = true;
  });

  // Switch tabs
  function switchTab(tab: 'pending' | 'history') {
    activeTab = tab;
  }

  // Clear history
  function handleClearHistory() {
    if (confirm('Are you sure you want to clear your trade history? This cannot be undone.')) {
      clearTradeHistory();
    }
  }

  // Get rarity color
  function getRarityColor(rarity: string): string {
    return RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.color || '#9ca3af';
  }

  // Get dad type icon
  function getDadTypeIcon(type: string): string {
    return DAD_TYPE_ICONS[type as keyof typeof DAD_TYPE_ICONS] || '🎴';
  }

  // Format date
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  // Count total pending trades
  function getTotalPending(): number {
    return sentTrades.length + receivedTrades.length;
  }
</script>

<div class="trade-history">
  <div class="trade-history-header">
    <h2 class="trade-history-title">Trade Center</h2>
    <p class="trade-history-subtitle">
      Manage your trade offers and view trade history
    </p>
  </div>

  <!-- Tabs -->
  <div class="trade-tabs">
    <button
      class="trade-tab"
      class:active={activeTab === 'pending'}
      on:click={() => switchTab('pending')}
    >
      <span class="tab-label">Pending Trades</span>
      {#if getTotalPending() > 0}
        <span class="tab-badge">{getTotalPending()}</span>
      {/if}
    </button>
    <button
      class="trade-tab"
      class:active={activeTab === 'history'}
      on:click={() => switchTab('history')}
    >
      <span class="tab-label">Trade History</span>
    </button>
  </div>

  <!-- Pending Trades Tab -->
  {#if activeTab === 'pending'}
    <div class="pending-trades">
      {#if sentTrades.length > 0 || receivedTrades.length > 0}
        <!-- Sent Trades -->
        {#if sentTrades.length > 0}
          <div class="trade-section">
            <h3 class="trade-section-title">Trades You've Sent</h3>
            <div class="trade-list">
              {#each sentTrades as trade}
                <div class="trade-item sent">
                  <div class="trade-item-header">
                    <div class="trade-partner">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>To: {trade.senderName}</span>
                    </div>
                    <span class="trade-date">{formatDate(trade.createdAt)}</span>
                  </div>

                  <div class="trade-item-exchange">
                    <div class="trade-cards-summary">
                      <span class="trade-cards-label">Offering:</span>
                      <div class="trade-cards-mini">
                        {#each trade.offeredCards.slice(0, 3) as card}
                          <span class="mini-card" style:color={getRarityColor(card.rarity)} title={card.name}>
                            {getDadTypeIcon(card.type)}
                          </span>
                        {/each}
                        {#if trade.offeredCards.length > 3}
                          <span class="mini-card-more">+{trade.offeredCards.length - 3}</span>
                        {/if}
                      </div>
                    </div>

                    <div class="trade-cards-summary">
                      <span class="trade-cards-label">Requesting:</span>
                      <div class="trade-cards-mini">
                        {#each trade.requestedCards.slice(0, 3) as card}
                          <span class="mini-card" style:color={getRarityColor(card.rarity)} title={card.name}>
                            {getDadTypeIcon(card.type)}
                          </span>
                        {/each}
                        {#if trade.requestedCards.length > 3}
                          <span class="mini-card-more">+{trade.requestedCards.length - 3}</span>
                        {/if}
                      </div>
                    </div>
                  </div>

                  <div class="trade-item-actions">
                    <span class="trade-status pending">Awaiting Response</span>
                    <a href="/trade?d={generateTradeURLFromTrade(trade)}" class="view-offer-link">
                      Resend Offer
                    </a>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Received Trades -->
        {#if receivedTrades.length > 0}
          <div class="trade-section">
            <h3 class="trade-section-title">Trades You've Received</h3>
            <div class="trade-list">
              {#each receivedTrades as trade}
                <div class="trade-item received">
                  <div class="trade-item-header">
                    <div class="trade-partner">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>From: {trade.senderName}</span>
                    </div>
                    <span class="trade-date">{formatDate(trade.createdAt)}</span>
                  </div>

                  <div class="trade-item-exchange">
                    <div class="trade-cards-summary">
                      <span class="trade-cards-label">You'll Receive:</span>
                      <div class="trade-cards-mini">
                        {#each trade.offeredCards.slice(0, 3) as card}
                          <span class="mini-card" style:color={getRarityColor(card.rarity)} title={card.name}>
                            {getDadTypeIcon(card.type)}
                          </span>
                        {/each}
                        {#if trade.offeredCards.length > 3}
                          <span class="mini-card-more">+{trade.offeredCards.length - 3}</span>
                        {/if}
                      </div>
                    </div>

                    <div class="trade-cards-summary">
                      <span class="trade-cards-label">You'll Give:</span>
                      <div class="trade-cards-mini">
                        {#each trade.requestedCards.slice(0, 3) as card}
                          <span class="mini-card" style:color={getRarityColor(card.rarity)} title={card.name}>
                            {getDadTypeIcon(card.type)}
                          </span>
                        {/each}
                        {#if trade.requestedCards.length > 3}
                          <span class="mini-card-more">+{trade.requestedCards.length - 3}</span>
                        {/if}
                      </div>
                    </div>
                  </div>

                  <div class="trade-item-actions">
                    <a href="/trade/view/{trade.id}" class="view-offer-link primary">
                      View Offer
                    </a>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {:else}
        <!-- Empty State -->
        <div class="empty-state">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3>No Pending Trades</h3>
          <p>You don't have any pending trades. Create a trade offer to get started!</p>
          <a href="/trade/create" class="create-trade-button">Create Trade Offer</a>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Trade History Tab -->
    <div class="history-trades">
      {#if tradeHistory.length > 0}
        <div class="history-header">
          <h3 class="history-title">Completed Trades</h3>
          <button class="clear-history-button" on:click={handleClearHistory}>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear History
          </button>
        </div>

        <div class="history-list">
          {#each tradeHistory as entry}
            <div class="history-item" class:accepted={entry.status === 'accepted'} class:rejected={entry.status === 'rejected'}>
              <div class="history-item-header">
                <div class="history-partner">
                  {#if entry.status === 'accepted'}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  {:else}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  {/if}
                  <span>{entry.partnerName}</span>
                </div>
                <span class="history-date">{formatDate(entry.completedAt)}</span>
              </div>

              <div class="history-exchange">
                {#if entry.status === 'accepted'}
                  <div class="history-cards">
                    <span class="history-cards-label received">Received:</span>
                    <div class="history-cards-mini">
                      {#each entry.receivedCards.slice(0, 4) as card}
                        <span class="mini-card" style:color={getRarityColor(card.rarity)} title={card.name}>
                          {getDadTypeIcon(card.type)}
                        </span>
                      {/each}
                      {#if entry.receivedCards.length > 4}
                        <span class="mini-card-more">+{entry.receivedCards.length - 4}</span>
                      {/if}
                    </div>
                  </div>

                  <div class="history-cards">
                    <span class="history-cards-label given">Given:</span>
                    <div class="history-cards-mini">
                      {#each entry.givenCards.slice(0, 4) as card}
                        <span class="mini-card" style:color={getRarityColor(card.rarity)} title={card.name}>
                          {getDadTypeIcon(card.type)}
                        </span>
                      {/each}
                      {#if entry.givenCards.length > 4}
                        <span class="mini-card-more">+{entry.givenCards.length - 4}</span>
                      {/if}
                    </div>
                  </div>
                {:else}
                  <div class="history-rejected">
                    <span class="history-status rejected">Trade Rejected</span>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <!-- Empty State -->
        <div class="empty-state">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>No Trade History</h3>
          <p>Completed trades will appear here. Start trading to build your history!</p>
          <a href="/trade/create" class="create-trade-button">Create Trade Offer</a>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .trade-history {
    max-width: 64rem;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .trade-history-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .trade-history-title {
    font-size: 2rem;
    font-weight: 800;
    color: #f8fafc;
    margin-bottom: 0.5rem;
  }

  .trade-history-subtitle {
    font-size: 1rem;
    color: #94a3b8;
  }

  .trade-tabs {
    display: flex;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.5);
    padding: 0.25rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }

  .trade-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    color: #94a3b8;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .trade-tab.active {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
  }

  .trade-tab:hover:not(.active) {
    color: #f8fafc;
  }

  .tab-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 0.5rem;
    background: rgba(251, 191, 36, 0.2);
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .pending-trades,
  .history-trades {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .trade-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .trade-section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0;
  }

  .trade-list,
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .trade-item,
  .history-item {
    padding: 1.25rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    transition: border-color 0.2s ease;
  }

  .trade-item:hover {
    border-color: rgba(71, 85, 105, 0.5);
  }

  .history-item.accepted {
    border-color: rgba(34, 197, 94, 0.3);
  }

  .history-item.rejected {
    border-color: rgba(239, 68, 68, 0.3);
  }

  .trade-item-header,
  .history-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .trade-partner,
  .history-partner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
  }

  .trade-item.sent .trade-partner {
    color: #fbbf24;
  }

  .trade-item.received .trade-partner {
    color: #22c55e;
  }

  .history-item.accepted .history-partner {
    color: #22c55e;
  }

  .history-item.rejected .history-partner {
    color: #fca5a5;
  }

  .trade-date,
  .history-date {
    font-size: 0.75rem;
    color: #64748b;
  }

  .trade-item-exchange,
  .history-exchange {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 0.375rem;
    margin-bottom: 1rem;
  }

  .history-exchange {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .trade-cards-summary,
  .history-cards {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .history-cards {
    flex-wrap: wrap;
  }

  .trade-cards-label,
  .history-cards-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    flex-shrink: 0;
  }

  .history-cards-label.received {
    color: #22c55e;
  }

  .history-cards-label.given {
    color: #fbbf24;
  }

  .trade-cards-mini,
  .history-cards-mini {
    display: flex;
    gap: 0.25rem;
  }

  .mini-card {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    font-size: 1.125rem;
    background: rgba(30, 41, 59, 0.5);
    border-radius: 0.25rem;
  }

  .mini-card-more {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    background: rgba(30, 41, 59, 0.5);
    border-radius: 0.25rem;
  }

  .trade-item-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .trade-status.pending {
    font-size: 0.75rem;
    font-weight: 600;
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  .view-offer-link {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.375rem;
    transition: all 0.2s ease;
  }

  .view-offer-link:hover {
    color: #f8fafc;
    background: rgba(71, 85, 105, 0.1);
  }

  .view-offer-link.primary {
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.3);
  }

  .view-offer-link.primary:hover {
    background: rgba(34, 197, 94, 0.1);
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .history-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0;
  }

  .clear-history-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.375rem;
    color: #fca5a5;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-history-button:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .history-rejected {
    width: 100%;
    text-align: center;
  }

  .history-status.rejected {
    font-size: 0.875rem;
    font-weight: 600;
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 4rem 2rem;
    text-align: center;
    background: rgba(30, 41, 59, 0.3);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
  }

  .empty-state svg {
    color: #475569;
  }

  .empty-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0;
  }

  .empty-state p {
    color: #94a3b8;
    margin: 0;
  }

  .create-trade-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    border: none;
    border-radius: 0.5rem;
    color: #0f172a;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .create-trade-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  /* Mobile Responsive */
  @media (max-width: 640px) {
    .trade-item-header,
    .history-item-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .history-exchange {
      flex-direction: column;
    }

    .history-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }
</style>
