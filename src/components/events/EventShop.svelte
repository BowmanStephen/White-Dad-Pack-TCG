<!--
/**
 * Event Shop Component (US099 - Live Events)
 *
 * Displays event shop where players can spend event currency
 * on exclusive items including cards, packs, and cosmetics.
 */
<script lang="ts">
  import { currentEvent, currentEventCurrency, canAffordItem, spendEventCurrency, getItemStock } from '../../stores/events';

  $: event = $currentEvent;
  $: currency = $currentEventCurrency;

  function handlePurchase(itemId: string) {
    if (canAffordItem(itemId)) {
      const success = spendEventCurrency(itemId);
      if (success) {
        // Trigger purchase success animation/sound
        console.log('Purchased item:', itemId);
      }
    }
  }
</script>

{#if event && event.eventShopEnabled}
  <div
    class="event-shop"
    style:--event-primary={event.theme.primaryColor}
    style:--event-secondary={event.theme.secondaryColor}
    style:--event-accent={event.theme.accentColor}
    style:--event-bg={event.theme.backgroundColor}
  >
    <div class="event-shop-header">
      <h2 class="event-shop-title">
        <span class="event-icon">{event.theme.icon}</span>
        Event Shop
      </h2>
      <div class="currency-display">
        <span class="currency-amount">{currency?.balance || 0}</span>
        <span class="currency-label">Tokens</span>
      </div>
    </div>

    <div class="event-shop-items">
      {#each event.eventShopItems as item (item.id)}
        <div
          class="shop-item"
          class:can-afford={canAffordItem(item.id)}
          class:cannot-afford={!canAffordItem(item.id)}
        >
          <div class="shop-item-icon">{item.icon}</div>
          <div class="shop-item-info">
            <h3 class="shop-item-name">{item.name}</h3>
            <p class="shop-item-description">{item.description}</p>
            {#if item.isLimited}
              <span class="item-badge limited">Limited</span>
            {/if}
          </div>
          <div class="shop-item-price">
            <span class="price-amount">{item.cost}</span>
            <span class="price-currency">Tokens</span>
          </div>
          <button
            class="shop-item-purchase-button"
            disabled={!canAffordItem(item.id)}
            on:click={() => handlePurchase(item.id)}
          >
            {canAffordItem(item.id) ? 'Purchase' : 'Not Enough'}
          </button>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .event-shop {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .event-shop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  .event-shop-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
    margin: 0;
  }

  .event-icon {
    font-size: 2rem;
  }

  .currency-display {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
  }

  .currency-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .currency-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .event-shop-items {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .shop-item {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .shop-item.can-afford {
    border-color: rgba(251, 191, 36, 0.3);
  }

  .shop-item.cannot-afford {
    opacity: 0.6;
  }

  .shop-item:hover.can-afford {
    border-color: rgba(251, 191, 36, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .shop-item-icon {
    font-size: 3rem;
    text-align: center;
  }

  .shop-item-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .shop-item-name {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .shop-item-description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .item-badge {
    display: inline-block;
    font-size: 0.625rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    text-transform: uppercase;
    width: fit-content;
  }

  .item-badge.limited {
    background: #ef4444;
    color: white;
  }

  .shop-item-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .price-amount {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .price-currency {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .shop-item-purchase-button {
    background: #fbbf24;
    color: #1f2937;
    font-size: 0.875rem;
    font-weight: 700;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .shop-item-purchase-button:hover:not(:disabled) {
    background: #f59e0b;
    transform: scale(1.02);
  }

  .shop-item-purchase-button:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .event-shop {
      padding: 1.25rem;
    }

    .event-shop-items {
      grid-template-columns: 1fr;
    }

    .event-shop-title {
      font-size: 1.375rem;
    }

    .currency-amount {
      font-size: 1.25rem;
    }
  }
</style>
-->
