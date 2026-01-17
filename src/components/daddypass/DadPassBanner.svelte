<script lang="ts">
  import type { DadPassSummary } from '@/types';
  import { isDadPassActive, daysRemaining } from '@/stores/daddypass';

  export let summary: DadPassSummary;
  export let onPurchase: () => void;
  export let onDailyLogin: () => void;
  export let dailyRewardClaimed = false;

  const $isDadPassActive = isDadPassActive;
  const $daysRemaining = daysRemaining;
</script>

<div class="daddypass-banner" class:active={$isDadPassActive} class:inactive={!$isDadPassActive}>
  <div class="banner-content">
    <div class="banner-header">
      <h1>
        {#if $isDadPassActive}
          DadPass Active
        {:else}
          Get DadPass
        {/if}
      </h1>
      <div class="pass-icon">
        {#if $isDadPassActive}
          👑
        {:else}
          🔓
        {/if}
      </div>
    </div>

    {#if $isDadPassActive}
      <div class="active-info">
        <p class="tagline">30 days of premium rewards</p>
        <div class="stats">
          <div class="stat">
            <span class="stat-value">{$daysRemaining}</span>
            <span class="stat-label">Days Left</span>
          </div>
          <div class="stat">
            <span class="stat-value">{summary.currentTier}</span>
            <span class="stat-label">Current Tier</span>
          </div>
          <div class="stat">
            <span class="stat-value">{summary.claimableRewards}</span>
            <span class="stat-label">Rewards Available</span>
          </div>
        </div>

        {#if !dailyRewardClaimed}
          <button
            class="daily-login-btn"
            on:click={onDailyLogin}
            disabled={dailyRewardClaimed}
          >
            <span class="btn-icon">📅</span>
            <span class="btn-text">Claim Daily XP</span>
          </button>
        {:else}
          <p class="claimed-text">Daily XP claimed! Come back tomorrow.</p>
        {/if}

        {#if summary.autoRenew}
          <p class="autorenew-text">♻️ Auto-renew enabled</p>
        {/if}
      </div>
    {:else}
      <div class="inactive-info">
        <p class="tagline">$4.99 for 30 days of rewards</p>
        <ul class="features">
          <li>✨ Premium packs every 3 days</li>
          <li>🎁 Daily XP rewards</li>
          <li>💎 Exclusive cards at tiers 10 & 30</li>
          <li>🏷️ Exclusive titles & card backs</li>
        </ul>
        <button class="purchase-btn" on:click={onPurchase}>
          <span class="btn-icon">🛒</span>
          <span class="btn-text">Get DadPass - $4.99</span>
        </button>
      </div>
    {/if}
  </div>

  <div class="banner-decoration">
    <div class="sparkle sparkle-1"></div>
    <div class="sparkle sparkle-2"></div>
    <div class="sparkle sparkle-3"></div>
  </div>
</div>

<style>
  .daddypass-banner {
    position: relative;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .daddypass-banner.active {
    background: linear-gradient(135deg, #ffd700 0%, #ffec8b 50%, #ffd700 100%);
    border: 3px solid #b8860b;
  }

  .daddypass-banner.inactive {
    background: linear-gradient(135deg, #4b5563 0%, #6b7280 50%, #4b5563 100%);
    border: 3px solid #374151;
  }

  .banner-content {
    position: relative;
    z-index: 1;
  }

  .banner-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .banner-header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .active .banner-header h1 {
    color: #78350f;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.3);
  }

  .inactive .banner-header h1 {
    color: #f9fafb;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .pass-icon {
    font-size: 3rem;
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
  }

  .tagline {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
  }

  .active .tagline {
    color: #78350f;
  }

  .inactive .tagline {
    color: #d1d5db;
  }

  .stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 2rem;
    font-weight: 700;
  }

  .active .stat-value {
    color: #78350f;
  }

  .inactive .stat-value {
    color: #fbbf24;
  }

  .stat-label {
    display: block;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .active .stat-label {
    color: #92400e;
  }

  .inactive .stat-label {
    color: #d1d5db;
  }

  .features {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }

  .features li {
    font-size: 1.125rem;
    padding: 0.5rem 0;
    color: #f9fafb;
  }

  .purchase-btn,
  .daily-login-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .purchase-btn {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #78350f;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }

  .purchase-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(251, 191, 36, 0.6);
  }

  .daily-login-btn {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
  }

  .daily-login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(22, 163, 74, 0.6);
  }

  .daily-login-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    font-size: 1.5rem;
  }

  .claimed-text,
  .autorenew-text {
    font-size: 0.875rem;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .active .claimed-text,
  .active .autorenew-text {
    color: #92400e;
  }

  .banner-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    opacity: 0.6;
    animation: sparkle 2s ease-in-out infinite;
  }

  .sparkle-1 {
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .sparkle-2 {
    top: 30%;
    right: 15%;
    animation-delay: 0.5s;
  }

  .sparkle-3 {
    bottom: 20%;
    left: 20%;
    animation-delay: 1s;
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 0.2;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.5);
    }
  }

  @media (max-width: 768px) {
    .daddypass-banner {
      padding: 1.5rem;
    }

    .banner-header h1 {
      font-size: 1.75rem;
    }

    .pass-icon {
      font-size: 2rem;
    }

    .stats {
      gap: 1rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .purchase-btn,
    .daily-login-btn {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }
  }
</style>
