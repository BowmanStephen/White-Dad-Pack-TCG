<script lang="ts">
  import { onMount } from 'svelte';
  import type { TradeOffer, TradeCard } from '../../types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS } from '../../types';
  import {
    acceptTrade,
    rejectTrade,
    isTradeExpired,
  } from '../../stores/trade';

  // Props
  interface Props {
    trade: TradeOffer;
  }

  let { trade }: Props = $props();

  // State
  let isProcessing = $state(false);
  let actionMessage = $state('');
  let actionType: 'accept' | 'reject' | null = $state(null);

  // Check if trade is expired
  let expired = $state(isTradeExpired(trade));

  onMount(() => {
    // Check expiration periodically
    const checkInterval = setInterval(() => {
      expired = isTradeExpired(trade);
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  });

  // Accept trade
  async function handleAccept() {
    if (isProcessing) return;

    isProcessing = true;
    actionType = 'accept';
    actionMessage = 'Processing trade...';

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = acceptTrade(trade.id);

    if (result.success) {
      actionMessage = 'Trade accepted! Cards have been added to your collection.';
      // Redirect after showing success message
      setTimeout(() => {
        window.location.href = '/trade';
      }, 2000);
    } else {
      actionMessage = result.error || 'Failed to accept trade';
      actionType = null;
      isProcessing = false;
    }
  }

  // Reject trade
  async function handleReject() {
    if (isProcessing) return;

    isProcessing = true;
    actionType = 'reject';
    actionMessage = 'Rejecting trade...';

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = rejectTrade(trade.id);

    if (result.success) {
      actionMessage = 'Trade rejected.';
      // Redirect after showing message
      setTimeout(() => {
        window.location.href = '/trade';
      }, 2000);
    } else {
      actionMessage = result.error || 'Failed to reject trade';
      actionType = null;
      isProcessing = false;
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
    }).format(date);
  }

  // Format time until expiration
  function getTimeUntilExpiration(): string {
    if (expired) return 'Expired';

    const now = new Date();
    const diff = trade.expiresAt.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Less than 1 hour remaining';
    }
  }
</script>

<div class="trade-offer-viewer">
  <!-- Expired Banner -->
  {#if expired}
    <div class="expired-banner">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l0 4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>This trade offer has expired</span>
    </div>
  {/if}

  <!-- Action Message -->
  {#if actionMessage}
    <div class="action-message" class:success={actionType === 'accept'} class:error={actionType === 'reject'}>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if actionType === 'accept'}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        {:else if actionType === 'reject'}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        {/if}
      </svg>
      <span>{actionMessage}</span>
    </div>
  {/if}

  <!-- Trade Header -->
  <div class="trade-header">
    <div class="trade-sender">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <div>
        <h2 class="sender-name">{trade.senderName}</h2>
        <p class="trade-date">Sent on {formatDate(trade.createdAt)}</p>
      </div>
    </div>
    <div class="trade-expiry" class:expired={expired}>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{getTimeUntilExpiration()}</span>
    </div>
  </div>

  <!-- Trade Message (if provided) -->
  {#if trade.message}
    <div class="trade-message">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
      <p>"{trade.message}"</p>
    </div>
  {/if}

  <!-- Trade Exchange -->
  <div class="trade-exchange">
    <!-- Cards Being Offered (You Receive) -->
    <div class="trade-side receive">
      <div class="trade-side-header">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>You'll Receive</h3>
        <span class="card-count">{trade.offeredCards.length} card{trade.offeredCards.length !== 1 ? 's' : ''}</span>
      </div>

      <div class="trade-cards">
        {#each trade.offeredCards as card}
          <div class="trade-card">
            <div class="trade-card-icon">
              {getDadTypeIcon(card.type)}
            </div>
            <div class="trade-card-info">
              <h4 class="trade-card-name">{card.name}</h4>
              <div class="trade-card-meta">
                <span class="trade-card-rarity" style:color={getRarityColor(card.rarity)}>
                  {card.rarity}
                </span>
                {#if card.isHolo}
                  <span class="trade-card-holo">✨ Holo</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Exchange Arrow -->
    <div class="exchange-arrow">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    </div>

    <!-- Cards Being Requested (You Give) -->
    <div class="trade-side give">
      <div class="trade-side-header">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>You'll Give</h3>
        <span class="card-count">{trade.requestedCards.length} card{trade.requestedCards.length !== 1 ? 's' : ''}</span>
      </div>

      <div class="trade-cards">
        {#each trade.requestedCards as card}
          <div class="trade-card">
            <div class="trade-card-icon">
              {getDadTypeIcon(card.type)}
            </div>
            <div class="trade-card-info">
              <h4 class="trade-card-name">{card.name}</h4>
              <div class="trade-card-meta">
                <span class="trade-card-rarity" style:color={getRarityColor(card.rarity)}>
                  {card.rarity}
                </span>
                {#if card.isHolo}
                  <span class="trade-card-holo">✨ Holo</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  {#if !expired && !isProcessing}
    <div class="trade-actions">
      <button
        class="action-button reject"
        on:click={handleReject}
        disabled={isProcessing}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Decline Trade
      </button>

      <button
        class="action-button accept"
        on:click={handleAccept}
        disabled={isProcessing}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Accept Trade
      </button>
    </div>
  {:else if expired}
    <div class="trade-expired-notice">
      <p>This trade offer has expired and is no longer available.</p>
      <a href="/trade" class="back-link">Back to Trades</a>
    </div>
  {/if}
</div>

<style>
  .trade-offer-viewer {
    max-width: 48rem;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .expired-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0.5rem;
    color: #fca5a5;
    margin-bottom: 2rem;
  }

  .action-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 0.5rem;
    color: #86efac;
    margin-bottom: 2rem;
  }

  .action-message.error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .trade-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .trade-sender {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #fbbf24;
  }

  .sender-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f8fafc;
    margin: 0;
  }

  .trade-date {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .trade-expiry {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #94a3b8;
    padding: 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.5);
    border-radius: 0.375rem;
  }

  .trade-expiry.expired {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.1);
  }

  .trade-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: rgba(251, 191, 36, 0.05);
    border-left: 3px solid #fbbf24;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }

  .trade-message svg {
    color: #fbbf24;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .trade-message p {
    margin: 0;
    color: #cbd5e1;
    font-style: italic;
  }

  .trade-exchange {
    display: flex;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .trade-side {
    flex: 1;
    padding: 1.5rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
  }

  .trade-side.receive {
    border-color: rgba(34, 197, 94, 0.3);
  }

  .trade-side.give {
    border-color: rgba(251, 191, 36, 0.3);
  }

  .trade-side-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .trade-side.receive .trade-side-header {
    color: #22c55e;
  }

  .trade-side.give .trade-side-header {
    color: #fbbf24;
  }

  .trade-side-header h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    flex: 1;
  }

  .card-count {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    background: rgba(71, 85, 105, 0.3);
    border-radius: 0.25rem;
  }

  .trade-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .trade-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 0.375rem;
  }

  .trade-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.5rem;
    background: rgba(30, 41, 59, 0.5);
    border-radius: 0.375rem;
  }

  .trade-card-info {
    flex: 1;
    min-width: 0;
  }

  .trade-card-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trade-card-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.125rem;
  }

  .trade-card-rarity {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .trade-card-holo {
    font-size: 0.75rem;
    font-weight: 600;
    color: #a855f7;
  }

  .exchange-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    padding: 1rem 0;
  }

  .trade-actions {
    display: flex;
    gap: 1rem;
  }

  .action-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button.reject {
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #fca5a5;
  }

  .action-button.reject:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.1);
  }

  .action-button.accept {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #f8fafc;
  }

  .action-button.accept:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .trade-expired-notice {
    text-align: center;
    padding: 2rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
  }

  .trade-expired-notice p {
    color: #94a3b8;
    margin: 0 0 1rem 0;
  }

  .back-link {
    display: inline-block;
    color: #fbbf24;
    text-decoration: none;
    font-weight: 600;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  /* Mobile Responsive */
  @media (max-width: 640px) {
    .trade-exchange {
      flex-direction: column;
    }

    .exchange-arrow {
      transform: rotate(90deg);
      padding: 0;
    }

    .trade-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .trade-actions {
      flex-direction: column;
    }
  }
</style>
