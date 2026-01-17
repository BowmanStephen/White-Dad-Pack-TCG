<script lang="ts">
  import { onMount } from 'svelte';
  import type { DailyReward } from '../../types';
  import {
    dailyRewards,
    claimDailyReward,
    getDailyRewardsSummary,
    DAILY_REWARD_TIERS,
    STREAK_BONUSES,
    getStreakBonus,
  } from '../../stores/daily-rewards';

  // Props
  interface Props {
    onClose: () => void;
    onClaimed: () => void;
  }

  let { onClose, onClaimed }: Props = $props();

  // State
  let claiming = $state(false);
  let claimed = $state(false);
  let summary = $state(getDailyRewardsSummary());
  let rewards = $state<DailyReward[]>([]);
  let currentBonus = $state(1.0);

  onMount(() => {
    // Load current state
    const state = dailyRewards.get();
    rewards = state.rewards;
    currentBonus = getStreakBonus(state.currentStreak);
  });

  // Handle claim
  async function handleClaim() {
    if (claiming || claimed) return;

    claiming = true;

    // Simulate claim delay for animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const reward = claimDailyReward();

    claiming = false;

    if (reward) {
      claimed = true;
      onClaimed();

      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }

  // Get day suffix (1st, 2nd, 3rd, etc.)
  function getDaySuffix(day: number): string {
    if (day === 1) return 'st';
    if (day === 2) return 'nd';
    if (day === 3) return 'rd';
    return 'th';
  }
</script>

<div class="modal-overlay" on click={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-content" on click={(e) => e.stopPropagation()}>
    <!-- Close button -->
    <button class="close-button" on click={onClose} aria-label="Close modal">
      ✕
    </button>

    <!-- Header -->
    <div class="modal-header">
      <div class="header-icon">🎁</div>
      <h2 id="modal-title" class="header-title">Daily Rewards</h2>
      <p class="header-subtitle">Claim your daily pack bonus!</p>
    </div>

    <!-- Streak info -->
    <div class="streak-display">
      <div class="streak-flame">🔥</div>
      <div class="streak-info">
        <div class="streak-number">{summary.currentStreak}</div>
        <div class="streak-label">Day Streak</div>
      </div>
      {#if currentBonus > 1.0}
        <div class="streak-bonus-badge">×{currentBonus.toFixed(1)} Bonus</div>
      {/if}
    </div>

    <!-- Rewards calendar -->
    <div class="rewards-calendar">
      {#each rewards as reward (reward.day)}
        <div
          class="reward-day {reward.claimed ? 'claimed' : ''} {!claimed && reward.day ===
          (summary.currentStreak % 7) + 1
            ? 'current'
            : ''}"
        >
          <div class="day-number">{reward.day}{getDaySuffix(reward.day)}</div>
          <div class="day-icon">{DAILY_REWARD_TIERS[reward.day - 1].icon}</div>
          <div class="day-description">{DAILY_REWARD_TIERS[reward.day - 1].description}</div>
          {#if reward.claimed}
            <div class="day-status claimed">✓ Claimed</div>
          {:else}
            <div class="day-status available">Today!</div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Streak bonuses -->
    {#if summary.currentStreak < 100}
      <div class="bonuses-section">
        <h3 class="bonuses-title">Streak Bonuses</h3>
        <div class="bonuses-list">
          {#each STREAK_BONUSES as bonus}
            <div
              class="bonus-item {summary.currentStreak >= bonus.threshold ? 'unlocked' : 'locked'}"
            >
              <div class="bonus-icon">⭐</div>
              <div class="bonus-details">
                <div class="bonus-description">{bonus.description}</div>
                <div class="bonus-requirement">{bonus.threshold} day streak</div>
              </div>
              <div class="bonus-multiplier">×{bonus.multiplier.toFixed(1)}</div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Claim button -->
    <div class="modal-footer">
      {#if claimed}
        <div class="success-message">
          <span class="success-icon">✓</span>
          <span class="success-text">Reward Claimed!</span>
        </div>
      {:else}
        <button
          class="claim-button {claiming ? 'claiming' : ''}"
          on click={handleClaim}
          disabled={claiming}
          aria-label="Claim daily reward"
        >
          {#if claiming}
            <span class="spinner"></span>
            <span>Claiming...</span>
          {:else}
            <span class="claim-icon">🎁</span>
            <span>Claim Daily Reward</span>
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
    border: 2px solid rgba(251, 191, 36, 0.5);
    border-radius: 16px;
    padding: 24px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    font-size: 20px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }

  /* Header */
  .modal-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .header-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .header-title {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 8px 0;
  }

  .header-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  /* Streak Display */
  .streak-display {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .streak-flame {
    font-size: 48px;
    animation: flicker 1s infinite alternate;
  }

  @keyframes flicker {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.1);
    }
  }

  .streak-info {
    text-align: center;
  }

  .streak-number {
    font-size: 36px;
    font-weight: 700;
    color: #fbbf24;
  }

  .streak-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .streak-bonus-badge {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #1f2937;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 14px;
  }

  /* Rewards Calendar */
  .rewards-calendar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .reward-day {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    transition: all 0.2s ease;
  }

  .reward-day.current {
    border-color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  }

  .reward-day.claimed {
    opacity: 0.6;
  }

  .day-number {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
  }

  .day-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .day-description {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8px;
  }

  .day-status {
    font-size: 10px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
  }

  .day-status.claimed {
    background: rgba(34, 197, 94, 0.3);
    color: #22c55e;
  }

  .day-status.available {
    background: rgba(251, 191, 36, 0.3);
    color: #fbbf24;
  }

  /* Bonuses Section */
  .bonuses-section {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }

  .bonuses-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 12px 0;
  }

  .bonuses-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bonus-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .bonus-item.unlocked {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .bonus-icon {
    font-size: 24px;
  }

  .bonus-details {
    flex: 1;
  }

  .bonus-description {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .bonus-requirement {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .bonus-multiplier {
    font-size: 16px;
    font-weight: 700;
    color: #fbbf24;
  }

  /* Footer */
  .modal-footer {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .claim-button {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    transition: all 0.2s ease;
    width: 100%;
  }

  .claim-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
  }

  .claim-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .claim-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .claim-button.claiming {
    pointer-events: none;
  }

  .claim-icon {
    font-size: 24px;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(31, 41, 55, 0.3);
    border-top-color: #1f2937;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .success-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(34, 197, 94, 0.2);
    border: 2px solid #22c55e;
    border-radius: 12px;
    padding: 16px;
    animation: successPop 0.5s ease;
  }

  @keyframes successPop {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .success-icon {
    font-size: 32px;
  }

  .success-text {
    font-size: 20px;
    font-weight: 700;
    color: #22c55e;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .modal-content {
      padding: 20px;
    }

    .rewards-calendar {
      grid-template-columns: repeat(2, 1fr);
    }

    .streak-display {
      flex-direction: column;
      gap: 12px;
    }
  }
</style>
