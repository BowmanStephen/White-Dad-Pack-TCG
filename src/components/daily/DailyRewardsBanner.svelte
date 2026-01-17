<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    dailyRewards,
    canClaimToday,
    timeUntilNextClaim,
    getCountdownString,
    claimDailyReward,
    getDailyRewardsSummary,
    getNextRewardTier,
    getNextStreakBonus,
  } from '../../stores/daily-rewards';

  // State
  let showModal = $state(false);
  let countdown = $state('');
  let canClaim = $state(false);
  let summary = $state(getDailyRewardsSummary());
  let nextReward = $state(getNextRewardTier(summary.currentStreak));
  let nextBonus = $state(getNextStreakBonus());
  let justClaimed = $state(false);

  // Countdown timer interval
  let countdownInterval: number;

  // Update countdown display
  function updateCountdown() {
    countdown = getCountdownString();
    canClaim = canClaimToday.get();
  }

  // Handle claim button click
  function handleClaimClick() {
    showModal = true;
  }

  // Handle close modal
  function handleCloseModal() {
    showModal = false;
  }

  // Handle reward claimed
  function handleRewardClaimed() {
    justClaimed = true;
    summary = getDailyRewardsSummary();
    nextReward = getNextRewardTier(summary.currentStreak);
    nextBonus = getNextStreakBonus();
    updateCountdown();

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Daily Reward Claimed!', {
        body: `You claimed: ${nextReward.description}`,
        icon: '/icon.png',
      });
    }

    // Reset just claimed state after animation
    setTimeout(() => {
      justClaimed = false;
    }, 2000);

    handleCloseModal();
  }

  onMount(() => {
    // Initialize state
    updateCountdown();

    // Update countdown every second
    countdownInterval = window.setInterval(updateCountdown, 1000);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Subscribe to store changes
    const unsubscribe = dailyRewards.subscribe(() => {
      summary = getDailyRewardsSummary();
      nextReward = getNextRewardTier(summary.currentStreak);
      nextBonus = getNextStreakBonus();
      updateCountdown();
    });

    onDestroy(() => {
      clearInterval(countdownInterval);
      unsubscribe();
    });
  });
</script>

<div
  class="daily-rewards-banner {canClaim ? 'claimable' : ''} {justClaimed ? 'just-claimed' : ''}"
  role="banner"
  aria-label="Daily rewards banner"
>
  <div class="banner-content">
    <!-- Left side: Current streak -->
    <div class="streak-info">
      <div class="streak-icon">🔥</div>
      <div class="streak-details">
        <div class="streak-count">{summary.currentStreak} Day Streak</div>
        <div class="streak-best">Best: {summary.longestStreak} days</div>
      </div>
    </div>

    <!-- Center: Next reward info -->
    <div class="reward-info">
      <div class="reward-icon">{nextReward.icon}</div>
      <div class="reward-details">
        <div class="reward-title">{canClaim ? 'Reward Ready!' : 'Next Reward'}</div>
        <div class="reward-description">{nextReward.description}</div>
      </div>
    </div>

    <!-- Right side: Claim button or countdown -->
    <div class="action-area">
      {#if canClaim}
        <button
          class="claim-button"
          on click={handleClaimClick}
          aria-label="Claim daily reward"
        >
          <span class="claim-text">Claim Reward</span>
          <span class="claim-icon">🎁</span>
        </button>
      {:else}
        <div class="countdown-area">
          <div class="countdown-label">Available in</div>
          <div class="countdown-timer">{countdown}</div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Streak bonus indicator -->
  {#if nextBonus}
    <div class="streak-bonus">
      <span class="bonus-icon">⭐</span>
      <span class="bonus-text"
        >{nextBonus.threshold - summary.currentStreak} days until {nextBonus.description}</span
      >
    </div>
  {/if}
</div>

{#if showModal}
  <DailyRewardsModal onClose={handleCloseModal} onClaimed={handleRewardClaimed} />
{/if}

<style>
  .daily-rewards-banner {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
    border: 2px solid rgba(251, 191, 36, 0.5);
    border-radius: 12px;
    padding: 16px 20px;
    margin: 16px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }

  .daily-rewards-banner.claimable {
    border-color: #fbbf24;
    box-shadow:
      0 0 20px rgba(251, 191, 36, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.15);
    animation: pulse 2s infinite;
  }

  .daily-rewards-banner.just-claimed {
    border-color: #22c55e;
    box-shadow:
      0 0 20px rgba(34, 197, 94, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow:
        0 0 20px rgba(251, 191, 36, 0.4),
        0 4px 12px rgba(0, 0, 0, 0.15);
    }
    50% {
      box-shadow:
        0 0 30px rgba(251, 191, 36, 0.6),
        0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  /* Streak Info */
  .streak-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 150px;
  }

  .streak-icon {
    font-size: 32px;
    line-height: 1;
  }

  .streak-details {
    display: flex;
    flex-direction: column;
  }

  .streak-count {
    font-size: 16px;
    font-weight: 700;
    color: #fbbf24;
  }

  .streak-best {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Reward Info */
  .reward-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 2;
    min-width: 200px;
  }

  .reward-icon {
    font-size: 32px;
    line-height: 1;
  }

  .reward-details {
    display: flex;
    flex-direction: column;
  }

  .reward-title {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
  }

  .reward-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Action Area */
  .action-area {
    flex: 0 0 auto;
  }

  .claim-button {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    transition: all 0.2s ease;
  }

  .claim-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
  }

  .claim-button:active {
    transform: translateY(0);
  }

  .claim-icon {
    font-size: 20px;
  }

  .countdown-area {
    text-align: center;
  }

  .countdown-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
  }

  .countdown-timer {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    font-family: 'Courier New', monospace;
    background: rgba(0, 0, 0, 0.3);
    padding: 8px 16px;
    border-radius: 6px;
  }

  /* Streak Bonus */
  .streak-bonus {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }

  .bonus-icon {
    font-size: 16px;
  }

  .bonus-text {
    font-weight: 500;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .banner-content {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }

    .streak-info,
    .reward-info {
      flex: none;
      min-width: auto;
    }

    .action-area {
      width: 100%;
    }

    .claim-button {
      width: 100%;
      justify-content: center;
    }

    .countdown-area {
      width: 100%;
    }
  }
</style>
