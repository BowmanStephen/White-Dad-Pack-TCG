<script lang="ts">
  import { onMount } from 'svelte';
  import { tradeHistory, sentTrades, receivedTrades } from '@/stores/trade';
  import type { TradeHistoryEntry, TradeStatus } from '@/types/trading-crafting';

  const FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'sent', label: 'Sent' },
    { value: 'received', label: 'Received' },
    { value: 'history', label: 'Completed' },
  ] as const;

  const RARITY_CLASS_MAP: Record<string, string> = {
    common: 'text-gray-400',
    uncommon: 'text-blue-400',
    rare: 'text-yellow-400',
    epic: 'text-purple-400',
    legendary: 'text-orange-400',
    mythic: 'text-pink-400',
  };

  const STATUS_CLASS_MAP: Record<string, string> = {
    pending: 'text-yellow-400',
    accepted: 'text-green-400',
    rejected: 'text-red-400',
    cancelled: 'text-gray-400',
  };

  type TradeHistoryEntryDisplay = Omit<TradeHistoryEntry, 'status'> & {
    status: TradeStatus;
  };

  // UI state
  let history = $state<TradeHistoryEntry[]>([]);
  let sent = $state([...sentTrades.get()]);
  let received = $state([...receivedTrades.get()]);
  let filter = $state<'all' | 'sent' | 'received' | 'history'>('all');
  let isLoading = $state(true);

  onMount(() => {
    // Subscribe to trade stores
    const unsubHistory = tradeHistory.subscribe((value) => {
      history = [...value];
      isLoading = false;
    });

    const unsubSent = sentTrades.subscribe((value) => {
      sent = [...value];
    });

    const unsubReceived = receivedTrades.subscribe((value) => {
      received = [...value];
    });

    // Cleanup on unmount
    return () => {
      unsubHistory();
      unsubSent();
      unsubReceived();
    };
  });

  function getFilteredEntries(): TradeHistoryEntryDisplay[] {
    const sentEntries = sent.map(toSentHistoryEntry);
    const receivedEntries = received.map(toReceivedHistoryEntry);

    switch (filter) {
      case 'sent':
        return sentEntries;
      case 'received':
        return receivedEntries;
      case 'history':
        return history;
      case 'all':
      default:
        return [...sentEntries, ...receivedEntries, ...history].sort(
          (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
        );
    }
  }

  let filteredEntries = $derived(getFilteredEntries());

  function toSentHistoryEntry(
    trade: typeof sent[number]
  ): TradeHistoryEntryDisplay {
    return {
      id: trade.id,
      completedAt: trade.createdAt,
      partnerName: trade.senderName,
      givenCards: trade.offeredCards,
      receivedCards: trade.requestedCards,
      status: trade.status,
    };
  }

  function toReceivedHistoryEntry(
    trade: typeof received[number]
  ): TradeHistoryEntryDisplay {
    return {
      id: trade.id,
      completedAt: trade.createdAt,
      partnerName: trade.senderName,
      givenCards: trade.requestedCards,
      receivedCards: trade.offeredCards,
      status: trade.status,
    };
  }

  function getRarityColor(rarity: string): string {
    return RARITY_CLASS_MAP[rarity] || RARITY_CLASS_MAP.common;
  }

  function getStatusColor(status: string): string {
    return STATUS_CLASS_MAP[status] || STATUS_CLASS_MAP.pending;
  }
</script>

<div class="trade-history">
  <!-- Filters -->
  <div class="filters">
    {#each FILTER_OPTIONS as option}
      <button
        onclick={() => filter = option.value}
        class:active={filter === option.value}
        class="filter-btn"
      >
        {option.label}
      </button>
    {/each}
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading trade history...</p>
    </div>
  {:else if filteredEntries.length === 0}
    <!-- Empty State -->
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
      <h3>No Trade History</h3>
      <p>
        {#if filter === 'all'}
          You haven't made any trades yet. Create your first trade offer to get started!
        {:else if filter === 'sent'}
          You haven't sent any trade offers yet.
        {:else if filter === 'received'}
          You haven't received any trade offers yet.
        {:else}
          No completed trades yet.
        {/if}
      </p>
      {#if filter !== 'sent'}
        <a href="/trade" class="btn-primary">Create Trade Offer</a>
      {/if}
    </div>
  {:else}
    <!-- Trade Entries -->
    <div class="history-list">
      {#each filteredEntries as entry}
        <div class="history-entry">
          <div class="entry-header">
            <div class="entry-info">
              <h4 class="partner-name">{entry.partnerName}</h4>
              <p class="entry-date">
                {new Date(entry.completedAt).toLocaleDateString()} at {new Date(entry.completedAt).toLocaleTimeString()}
              </p>
            </div>
            <div class="entry-status">
              <span class={getStatusColor(entry.status)}>
                {entry.status}
              </span>
            </div>
          </div>

          <div class="entry-content">
            <!-- Cards Given -->
            <div class="cards-section">
              <h5>Cards Given</h5>
              {#if entry.givenCards.length > 0}
                <div class="cards-list">
                  {#each entry.givenCards as card}
                    <div class="card-item">
                      <span class="card-name">{card.name}</span>
                      <span class="card-rarity {getRarityColor(card.rarity)}">{card.rarity}</span>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="empty-cards">None</p>
              {/if}
            </div>

            <!-- Cards Received -->
            <div class="cards-section">
              <h5>Cards Received</h5>
              {#if entry.receivedCards.length > 0}
                <div class="cards-list">
                  {#each entry.receivedCards as card}
                    <div class="card-item">
                      <span class="card-name">{card.name}</span>
                      <span class="card-rarity {getRarityColor(card.rarity)}">{card.rarity}</span>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="empty-cards">None</p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .trade-history {
    padding: 1rem 0;
  }

  .filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: #1f2937;
    border: 1px solid #374151;
    color: #9ca3af;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    background-color: #374151;
    color: #e5e7eb;
  }

  .filter-btn.active {
    background-color: #f59e0b;
    border-color: #f59e0b;
    color: #111827;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: #9ca3af;
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid #374151;
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #9ca3af;
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
    margin: 0 auto 1rem;
    color: #4b5563;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    margin-bottom: 1.5rem;
  }

  .btn-primary {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    color: white;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .history-entry {
    background-color: #111827;
    border: 1px solid #374151;
    border-radius: 0.75rem;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .history-entry:hover {
    border-color: #4b5563;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .entry-info h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 0.25rem;
  }

  .entry-date {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .entry-status {
    flex-shrink: 0;
  }

  .entry-status span {
    padding: 0.25rem 0.75rem;
    background-color: #1f2937;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .entry-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .cards-section h5 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background-color: #1f2937;
    border-radius: 0.375rem;
  }

  .card-name {
    font-size: 0.875rem;
    color: #e5e7eb;
  }

  .card-rarity {
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .empty-cards {
    font-size: 0.875rem;
    color: #6b7280;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
    }

    .filter-btn {
      width: 100%;
    }

    .entry-content {
      grid-template-columns: 1fr;
    }
  }
</style>
