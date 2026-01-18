<script lang="ts">
  import { onMount } from 'svelte';
  import {
    loadTradeFromUrl,
    currentTrade,
    acceptTrade,
    rejectTrade,
  } from '@/stores/trade';
  import type { TradeOffer } from '@/types/trading-crafting';

  // Props
  interface Props {
    offerData: string;
  }

  let { offerData }: Props = $props();

  const RARITY_CLASS_MAP: Record<string, string> = {
    common: 'text-gray-400 border-gray-400',
    uncommon: 'text-blue-400 border-blue-400',
    rare: 'text-yellow-400 border-yellow-400',
    epic: 'text-purple-400 border-purple-400',
    legendary: 'text-orange-400 border-orange-400',
    mythic: 'text-pink-400 border-pink-400',
  };

  // UI state
  let loading = $state(true);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
  let isProcessing = $state(false);

  onMount(() => {
    try {
      const trade = loadTradeFromUrl(offerData);

      if (!trade) {
        error = 'Invalid trade offer URL';
        loading = false;
        return;
      }

      if (isTradeExpired(trade)) {
        error = 'This trade offer has expired';
        loading = false;
        return;
      }

      loading = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load trade offer';
      loading = false;
    }
  });

  /**
   * Accept the trade offer
   */
  async function handleAccept(): Promise<void> {
    if (!$currentTrade) {
      return;
    }

    try {
      isProcessing = true;
      acceptTrade($currentTrade.id);
      success = 'Trade accepted! Cards have been added to your collection.';
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to accept trade';
      success = null;
    } finally {
      isProcessing = false;
    }
  }

  /**
   * Reject the trade offer
   */
  async function handleReject(): Promise<void> {
    if (!$currentTrade) {
      return;
    }

    try {
      isProcessing = true;
      rejectTrade($currentTrade.id);
      success = 'Trade rejected';
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to reject trade';
      success = null;
    } finally {
      isProcessing = false;
    }
  }

  function isTradeExpired(trade: TradeOffer): boolean {
    return trade.expiresAt < new Date();
  }

  function getRarityColor(rarity: string): string {
    return RARITY_CLASS_MAP[rarity] || RARITY_CLASS_MAP.common;
  }
</script>

<div class="trade-offer-viewer">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading trade offer...</p>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
  {:else if success}
    <div class="alert alert-success">
      <span>{success}</span>
      <a href="/trade" class="btn-secondary">Create New Trade</a>
    </div>
  {:else if $currentTrade}
    <div class="trade-details">
      <!-- Trade Header -->
      <div class="trade-header">
        <div class="trade-info">
          <h3>Trade Offer from {$currentTrade.senderName}</h3>
          <p class="trade-date">
            Created: {new Date($currentTrade.createdAt).toLocaleDateString()}
          </p>
          {#if $currentTrade.message}
            <p class="trade-message">"{$currentTrade.message}"</p>
          {/if}
        </div>
        <div class="trade-status">
          <span class="status-badge status-{$currentTrade.status}">
            {$currentTrade.status}
          </span>
        </div>
      </div>

      <!-- Trade Content -->
      <div class="trade-content">
        <!-- Cards Being Offered -->
        <div class="trade-section">
          <h4>Cards Being Offered</h4>
          <div class="card-grid">
            {#each $currentTrade.offeredCards as card}
              <div class="trade-card">
                <div class="card-name">{card.name}</div>
                <div class="card-meta">
                  <span class="card-rarity {getRarityColor(card.rarity)}">{card.rarity}</span>
                  <span class="card-type">{card.type}</span>
                  {#if card.isHolo}
                    <span class="card-holo">✨ Holo</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Cards Being Requested -->
        <div class="trade-section">
          <h4>Cards Being Requested</h4>
          <div class="card-grid">
            {#each $currentTrade.requestedCards as card}
              <div class="trade-card">
                <div class="card-name">{card.name}</div>
                <div class="card-meta">
                  <span class="card-rarity {getRarityColor(card.rarity)}">{card.rarity}</span>
                  <span class="card-type">{card.type}</span>
                  {#if card.isHolo}
                    <span class="card-holo">✨ Holo</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Trade Actions -->
      {#if $currentTrade.status === 'pending'}
        <div class="trade-actions">
          <button
            onclick={handleAccept}
            disabled={isProcessing}
            class="btn-primary"
          >
            {#if isProcessing}
              Processing...
            {:else}
              Accept Trade
            {/if}
          </button>
          <button
            onclick={handleReject}
            disabled={isProcessing}
            class="btn-secondary"
          >
            Reject Trade
          </button>
        </div>
      {:else}
        <div class="trade-complete">
          <p class="complete-message">
            This trade has been {$currentTrade.status}
          </p>
        </div>
      {/if}

      <!-- Expiry Notice -->
      <div class="expiry-notice">
        <p>
          This offer expires on {new Date($currentTrade.expiresAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .trade-offer-viewer {
    padding: 1rem 0;
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

  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .alert-error {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    color: #ef4444;
  }

  .alert-success {
    background-color: rgba(34, 197, 94, 0.1);
    border: 1px solid #22c55e;
    color: #22c55e;
    flex-direction: column;
    text-align: center;
  }

  .trade-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .trade-header {
    background-color: #111827;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 1rem;
  }

  .trade-info h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 0.5rem;
  }

  .trade-date {
    color: #9ca3af;
    font-size: 0.875rem;
  }

  .trade-message {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: #1f2937;
    border-left: 3px solid #f59e0b;
    border-radius: 0.25rem;
    color: #e5e7eb;
    font-style: italic;
  }

  .trade-status {
    flex-shrink: 0;
  }

  .status-badge {
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .status-pending {
    background-color: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid #f59e0b;
  }

  .status-accepted {
    background-color: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid #22c55e;
  }

  .status-rejected {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid #ef4444;
  }

  .status-cancelled {
    background-color: rgba(107, 114, 128, 0.1);
    color: #9ca3af;
    border: 1px solid #9ca3af;
  }

  .trade-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .trade-section {
    background-color: #111827;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .trade-section h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 1rem;
  }

  .card-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .trade-card {
    background-color: #1f2937;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    padding: 1rem;
    transition: all 0.2s;
  }

  .trade-card:hover {
    border-color: #f59e0b;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
  }

  .card-name {
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 0.5rem;
  }

  .card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .card-rarity {
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .card-type {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .card-holo {
    padding: 0.125rem 0.5rem;
    background-color: rgba(168, 85, 247, 0.1);
    border: 1px solid #a855f7;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: #a855f7;
  }

  .trade-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    padding: 1rem 0;
  }

  .trade-complete {
    text-align: center;
    padding: 1rem;
  }

  .complete-message {
    color: #9ca3af;
    font-size: 1.125rem;
  }

  .expiry-notice {
    text-align: center;
    padding: 1rem;
    background-color: rgba(245, 158, 11, 0.05);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 0.5rem;
  }

  .expiry-notice p {
    color: #f59e0b;
    font-size: 0.875rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: #374151;
    color: #e5e7eb;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #4b5563;
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .trade-header {
      flex-direction: column;
    }

    .trade-content {
      grid-template-columns: 1fr;
    }

    .trade-actions {
      flex-direction: column;
    }
  }
</style>
