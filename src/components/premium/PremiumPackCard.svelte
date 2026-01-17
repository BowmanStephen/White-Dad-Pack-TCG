<!--
  Premium Pack Card (US093 - Monetization - Premium Packs)

  Displays premium pack options with purchase functionality.
  Shows boosted rates, pricing, and purchase button.
-->

<script lang="ts">
  import { premiumInventory, getActivePremiumPacks, openPurchaseModal } from '@/stores/premium';
  import { PREMIUM_PACK_VISUAL_CONFIG } from '@/types';
  import type { PremiumPackConfig } from '@/types';

  export let packConfig: PremiumPackConfig;

  // Get pack availability
  const inventory = premiumInventory.get();
  const hasPacks = inventory.availablePacks.includes(packConfig.id);
  const packCount = inventory.availablePacks.filter((id) => id === packConfig.id).length;

  // Visual configuration
  const visualConfig = PREMIUM_PACK_VISUAL_CONFIG;

  function handlePurchase() {
    openPurchaseModal();
  }
</script>

<div
  class="premium-pack-card"
  style:border-color="{visualConfig.borderColor}"
  style:box-shadow="0 0 {visualConfig.glowIntensity * 4}px rgba(255, 215, 0, 0.3)"
>
  <!-- Pack Header -->
  <div class="pack-header">
    <div class="pack-badge">PREMIUM</div>
    <h3 class="pack-name">{packConfig.name}</h3>
  </div>

  <!-- Pack Description -->
  <p class="pack-description">{packConfig.description}</p>

  <!-- Pack Features -->
  <div class="pack-features">
    <div class="feature">
      <span class="feature-icon">📦</span>
      <span class="feature-text">{packConfig.cardsPerPack} Cards</span>
    </div>
    <div class="feature">
      <span class="feature-icon">⭐</span>
      <span class="feature-text">Guaranteed {packConfig.rarityGuarantee.toUpperCase()}+</span>
    </div>
    <div class="feature">
      <span class="feature-icon">💎</span>
      <span class="feature-text">{packConfig.mythicChanceMultiplier}x Mythic Chance</span>
    </div>
    <div class="feature">
      <span class="feature-icon">✨</span>
      <span class="feature-text">{Math.round((packConfig.holoChanceMultiplier - 1) * 100)}% More Holo</span>
    </div>
  </div>

  <!-- Price Section -->
  <div class="price-section">
    {#if hasPacks}
      <div class="owned-badge">
        You own {packCount} {packCount === 1 ? 'pack' : 'packs'}
      </div>
    {:else}
      <div class="price">
        <span class="price-amount">${packConfig.price.toFixed(2)}</span>
        <span class="price-currency">{packConfig.currency}</span>
      </div>
    {/if}
  </div>

  <!-- Purchase Button -->
  {#if hasPacks}
    <button class="btn btn-owned" disabled>
      Owned ({packCount})
    </button>
  {:else}
    <button class="btn btn-purchase" on:click={handlePurchase}>
      <span class="btn-text">Buy Premium Pack</span>
      <span class="btn-price">${packConfig.price.toFixed(2)}</span>
    </button>
  {/if}

  <!-- Shimmer Effect -->
  {#if visualConfig.shimmerEffect}
    <div class="shimmer-effect"></div>
  {/if}
</div>

<style>
  .premium-pack-card {
    position: relative;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 3px solid;
    border-radius: 16px;
    padding: 24px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .premium-pack-card:hover {
    transform: translateY(-4px);
    box-shadow:
      0 0 {visualConfig.glowIntensity * 6}px rgba(255, 215, 0, 0.4),
      0 8px 24px rgba(0, 0, 0, 0.3) !important;
  }

  .pack-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .pack-badge {
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    color: #1a1a2e;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .pack-name {
    font-size: 20px;
    font-weight: 700;
    color: #ffd700;
    margin: 0;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .pack-description {
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 20px;
  }

  .pack-features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #cbd5e1;
  }

  .feature-icon {
    font-size: 16px;
  }

  .feature-text {
    font-weight: 500;
  }

  .price-section {
    margin-bottom: 16px;
  }

  .price {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .price-amount {
    font-size: 32px;
    font-weight: 800;
    color: #ffd700;
    line-height: 1;
  }

  .price-currency {
    font-size: 14px;
    color: #94a3b8;
    font-weight: 600;
  }

  .owned-badge {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
  }

  .btn {
    width: 100%;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-purchase {
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    color: #1a1a2e;
  }

  .btn-purchase:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffdd00 0%, #ffbb00 100%);
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  }

  .btn-purchase:active:not(:disabled) {
    transform: scale(0.98);
  }

  .btn-owned {
    background: #334155;
    color: #94a3b8;
    cursor: not-allowed;
  }

  .shimmer-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    animation: shimmer 3s infinite;
    pointer-events: none;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    50% {
      left: 100%;
    }
    100% {
      left: 100%;
    }
  }

  /* Rainbow holo border effect (10% chance) */
  .premium-pack-card.rainbow-holo {
    animation: rainbow-border 3s linear infinite;
  }

  @keyframes rainbow-border {
    0% {
      border-color: #ff0000;
    }
    17% {
      border-color: #ff8000;
    }
    33% {
      border-color: #ffff00;
    }
    50% {
      border-color: #00ff00;
    }
    67% {
      border-color: #0080ff;
    }
    83% {
      border-color: #8000ff;
    }
    100% {
      border-color: #ff0000;
    }
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .premium-pack-card {
      padding: 20px;
    }

    .pack-name {
      font-size: 18px;
    }

    .pack-features {
      grid-template-columns: 1fr;
    }

    .price-amount {
      font-size: 28px;
    }
  }
</style>
