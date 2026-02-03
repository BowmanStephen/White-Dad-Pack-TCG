<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Pack, Rarity } from '@/types';
  import { RARITY_CONFIG } from '@/types';
  import Card from '@components/card/Card.svelte';
  import { formatTimestamp } from '@/lib/utils/formatters';

  interface Props {
    pack: Pack;
    expanded?: boolean;
    ontoggle?: (() => void) | undefined;
  }

  let {
    pack,
    expanded = false,
    ontoggle,
  }: Props = $props();

  const dispatch = createEventDispatcher();

  // Get best card from pack
  function getBestCard() {
    const rarityOrder: Record<Rarity, number> = {
      common: 0,
      uncommon: 1,
      rare: 2,
      epic: 3,
      legendary: 4,
      mythic: 5,
    };

    return pack.cards.reduce((best, card) => {
      if (!best || rarityOrder[card.rarity] > rarityOrder[best.rarity]) {
        return card;
      }
      return best;
    });
  }

  function toggleExpand() {
    if (ontoggle) {
      ontoggle();
    } else {
      dispatch('toggle');
    }
  }

  const bestCard = $derived(getBestCard());
  const bestRarityConfig = $derived(RARITY_CONFIG[pack.bestRarity]);
  const timeAgo = $derived(formatTimestamp(pack.openedAt));
  const cardCount = $derived(pack.cards.length);
  const holoCount = $derived(pack.cards.filter(c => c.isHolo).length);
</script>

<div class="pack-entry" class:expanded={expanded}>
  <button
    class="pack-summary"
    onclick={toggleExpand}
    aria-expanded={expanded}
    aria-label="Pack opened {timeAgo}, containing {cardCount} cards"
  >
    <div class="pack-left">
      <div class="pack-timestamp" aria-label="Opened {timeAgo}">
        <span class="timestamp-text">{timeAgo}</span>
      </div>
      <div class="pack-details">
        <span class="card-count">{cardCount} cards</span>
        {#if holoCount > 0}
          <span class="holo-count" title="Holographic cards">✨ {holoCount}</span>
        {/if}
      </div>
    </div>

    <div class="pack-right">
      <div
        class="best-card-indicator"
        style="--rarity-color: {bestRarityConfig.color}"
        title="Best card: {bestCard.name}"
      >
        <span class="best-card-icon">★</span>
        <span class="best-card-rarity">{bestRarityConfig.name}</span>
      </div>
      <span class="expand-icon" class:rotated={expanded}>▼</span>
    </div>
  </button>

  {#if expanded}
    <div class="pack-cards" role="list" aria-label="Cards in this pack">
      {#each pack.cards as card (card.id)}
        <div class="pack-card-item" role="listitem">
          <Card
            {card}
            size="sm"
            interactive={false}
            isFlipped={false}
            showBack={false}
            enableShare={false}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .pack-entry {
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .pack-entry:hover {
    border-color: rgba(251, 191, 36, 0.3);
    background: rgba(15, 23, 42, 0.9);
  }

  .pack-entry.expanded {
    border-color: rgba(251, 191, 36, 0.5);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.1);
  }

  .pack-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    gap: 1rem;
  }

  .pack-summary:hover {
    background: rgba(30, 41, 59, 0.5);
  }

  .pack-left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .pack-timestamp {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
  }

  .timestamp-text {
    display: block;
  }

  .pack-details {
    display: flex;
    gap: 0.75rem;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .card-count {
    font-weight: 500;
  }

  .holo-count {
    color: #ec4899;
    font-weight: 600;
  }

  .pack-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .best-card-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.375rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--rarity-color);
  }

  .best-card-icon {
    font-size: 0.8rem;
  }

  .expand-icon {
    color: #64748b;
    font-size: 0.6rem;
    transition: transform 0.2s ease;
  }

  .expand-icon.rotated {
    transform: rotate(180deg);
  }

  .pack-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 1rem;
    border-top: 1px solid rgba(71, 85, 105, 0.2);
    background: rgba(0, 0, 0, 0.2);
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (min-width: 640px) {
    .pack-cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .pack-cards {
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
  }

  .pack-card-item {
    display: flex;
    justify-content: center;
  }
</style>
