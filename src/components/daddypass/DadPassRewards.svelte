<script lang="ts">
  import type { DadPassReward } from '@/types';

  export let rewards: DadPassReward[];
  export let onClaimAll: () => void;
  export let onClaimReward: (tier: number, rewardType: string) => void;
  export let processing = false;

  function handleClaimAll() {
    if (!processing) {
      onClaimAll();
    }
  }

  function handleClaimSingle(reward: DadPassReward) {
    if (!processing) {
      onClaimReward(reward.tier, reward.rewardType);
    }
  }
</script>

<div class="daddypass-rewards">
  <div class="rewards-header">
    <h2>Claim Your Rewards</h2>
    <button
      class="claim-all-btn"
      on:click={handleClaimAll}
      disabled={processing}
    >
      <span class="btn-icon">🎁</span>
      <span class="btn-text">Claim All ({rewards.length})</span>
    </button>
  </div>

  <div class="rewards-list">
    {#each rewards as reward (reward.rewardType)}
      <div class="reward-card">
        <div class="reward-info">
          <span class="reward-icon">{reward.icon}</span>
          <div class="reward-details">
            <span class="reward-tier">Tier {reward.tier}</span>
            <span class="reward-description">{reward.description}</span>
          </div>
        </div>
        <button
          class="claim-btn"
          on:click={() => handleClaimSingle(reward)}
          disabled={processing}
        >
          {processing ? 'Claiming...' : 'Claim'}
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .daddypass-rewards {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    border: 2px solid #fbbf24;
  }

  .rewards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .rewards-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #78350f;
  }

  .claim-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.4);
  }

  .claim-all-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.6);
  }

  .claim-all-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    font-size: 1.25rem;
  }

  .rewards-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .reward-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .reward-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .reward-icon {
    font-size: 2rem;
  }

  .reward-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .reward-tier {
    font-size: 0.75rem;
    font-weight: 700;
    color: #f59e0b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .reward-description {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .claim-btn {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #78350f;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .claim-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(251, 191, 36, 0.4);
  }

  .claim-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .daddypass-rewards {
      padding: 1rem;
    }

    .rewards-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .reward-card {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .claim-btn {
      width: 100%;
    }
  }
</style>
