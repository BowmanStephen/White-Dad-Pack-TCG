<script lang="ts">
  import type { PackCard } from '@/types';
  import { RARITY_CONFIG } from '@/types';

  // Props
  interface Props {
    card: PackCard;
    ownedCount?: number;
    firstPullDate?: Date | null;
    isFavorite?: boolean;
    isWishlisted?: boolean;
    onToggleFavorite?: (() => void) | null;
    onToggleWishlist?: (() => void) | null;
    onAddToDeck?: (() => void) | null;
    onStartTrade?: (() => void) | null;
  }

  let {
    card,
    ownedCount = 1,
    firstPullDate = null,
    isFavorite = false,
    isWishlisted = false,
    onToggleFavorite = null,
    onToggleWishlist = null,
    onAddToDeck = null,
    onStartTrade = null,
  }: Props = $props();

  // State
  let showActions = $state(false);

  // Get rarity config
  let rarityConfig = $derived(RARITY_CONFIG[card.rarity]);

  // Format date
  function formatDate(date: Date | null): string {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  // Calculate days since first pull
  function getDaysSincePull(date: Date | null): number {
    if (!date) return 0;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  let daysSincePull = $derived(getDaysSincePull(firstPullDate));

  // Ownership status
  let ownershipStatus = $derived(ownedCount === 0
    ? { label: 'Not Owned', color: '#64748b', icon: '❌' }
    : ownedCount === 1
      ? { label: 'Owned', color: '#22c55e', icon: '✓' }
      : ownedCount < 4
        ? { label: 'Owned ×' + ownedCount, color: '#3b82f6', icon: '✓✓' }
        : { label: 'Owned ×' + ownedCount, color: '#a855f7', icon: '🔥' });

  // Trade availability
  let canTrade = $derived(ownedCount > 1);
  let tradableCount = $derived(Math.max(0, ownedCount - 1));

  // Holo status
  let holoStatus = $derived(card.isHolo
    ? { label: card.holoType || 'Standard', color: '#ec4899', icon: '✨' }
    : { label: 'Non-Holo', color: '#64748b', icon: '' });
</script>

<div
  class="collection-context"
  style="--rarity-color: {rarityConfig.color}; --rarity-glow: {rarityConfig.glowColor};"
>
  <!-- Main Stats Row -->
  <div class="stats-row">
    <!-- Ownership -->
    <div class="stat-item">
      <div class="stat-icon" style="color: {ownershipStatus.color};">
        {ownershipStatus.icon}
      </div>
      <div class="stat-content">
        <span class="stat-label">Status</span>
        <span class="stat-value" style="color: {ownershipStatus.color};">
          {ownershipStatus.label}
        </span>
      </div>
    </div>

    <!-- First Pull Date -->
    {#if firstPullDate}
      <div class="stat-item">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <span class="stat-label">First Pulled</span>
          <span class="stat-value">{formatDate(firstPullDate)}</span>
          {#if daysSincePull > 0}
            <span class="stat-sub">{daysSincePull} days ago</span>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Holo Status -->
    <div class="stat-item">
      <div class="stat-icon" style="color: {holoStatus.color};">
        {holoStatus.icon || '◇'}
      </div>
      <div class="stat-content">
        <span class="stat-label">Variant</span>
        <span class="stat-value" style="color: {holoStatus.color};">
          {holoStatus.label}
        </span>
      </div>
    </div>

    <!-- Trade Status -->
    {#if canTrade}
      <div class="stat-item tradable">
        <div class="stat-icon">🔄</div>
        <div class="stat-content">
          <span class="stat-label">Available</span>
          <span class="stat-value">{tradableCount} for trade</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="actions-row">
    <!-- Favorite Toggle -->
    {#if onToggleFavorite}
      <button
        class="action-btn"
        class:active={isFavorite}
        onclick={onToggleFavorite}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={isFavorite}
      >
        <span class="action-icon">{isFavorite ? '❤️' : '🤍'}</span>
        <span class="action-label">{isFavorite ? 'Favorited' : 'Favorite'}</span>
      </button>
    {/if}

    <!-- Wishlist Toggle -->
    {#if onToggleWishlist && ownedCount === 0}
      <button
        class="action-btn"
        class:active={isWishlisted}
        onclick={onToggleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={isWishlisted}
      >
        <span class="action-icon">{isWishlisted ? '⭐' : '☆'}</span>
        <span class="action-label">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
      </button>
    {/if}

    <!-- Add to Deck -->
    {#if onAddToDeck && ownedCount > 0}
      <button
        class="action-btn primary"
        onclick={onAddToDeck}
        aria-label="Add to deck"
      >
        <span class="action-icon">🃏</span>
        <span class="action-label">Add to Deck</span>
      </button>
    {/if}

    <!-- Start Trade -->
    {#if onStartTrade && canTrade}
      <button
        class="action-btn trade"
        onclick={onStartTrade}
        aria-label="Start trade"
      >
        <span class="action-icon">🔄</span>
        <span class="action-label">Trade</span>
      </button>
    {/if}
  </div>

  <!-- Quick Info -->
  {#if ownedCount > 0}
    <div class="quick-info">
      <div class="info-chip">
        <span class="chip-icon">📊</span>
        <span class="chip-text">Rarity: {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}</span>
      </div>
      <div class="info-chip">
        <span class="chip-icon">🏷️</span>
        <span class="chip-text">#{card.cardNumber.toString().padStart(3, '0')}</span>
      </div>
      {#if card.series}
        <div class="info-chip">
          <span class="chip-icon">📦</span>
          <span class="chip-text">Series {card.series}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .collection-context {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Stats Row */
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .stat-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex: 1;
    min-width: 120px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .stat-item.tradable {
    border-color: #3b82f644;
    background: rgba(59, 130, 246, 0.1);
  }

  .stat-icon {
    font-size: 18px;
    line-height: 1;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.4);
  }

  .stat-value {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .stat-sub {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Actions Row */
  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateY(-1px);
  }

  .action-btn.active {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
    color: #ef4444;
  }

  .action-btn.primary {
    background: var(--rarity-color);
    border-color: var(--rarity-color);
    color: white;
  }

  .action-btn.primary:hover {
    filter: brightness(1.1);
    box-shadow: 0 0 12px var(--rarity-glow);
  }

  .action-btn.trade {
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .action-btn.trade:hover {
    background: #3b82f6;
    color: white;
  }

  .action-icon {
    font-size: 14px;
  }

  .action-label {
    font-weight: 600;
  }

  /* Quick Info */
  .quick-info {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .info-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }

  .chip-icon {
    font-size: 12px;
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .stats-row {
      flex-direction: column;
      gap: 8px;
    }

    .stat-item {
      min-width: 100%;
    }

    .actions-row {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
