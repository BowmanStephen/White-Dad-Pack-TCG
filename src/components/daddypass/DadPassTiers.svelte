<script lang="ts">
  import type { DadPassSummary, DadPassTier, DadPassReward } from '@/types';
  import { DADPASS_TIERS } from '@/types';
  import { claimedRewards, dadPassSubscription, openRewardModal } from '@/stores/daddypass';

  export let summary: DadPassSummary;

  function getRewardIcon(reward: DadPassReward): string {
    return reward.icon;
  }

  function getRewardDescription(reward: DadPassReward): string {
    return reward.description;
  }

  function isTierUnlocked(tier: number): boolean {
    return tier <= summary.currentTier;
  }

  function isRewardClaimed(tier: number, rewardType: string): boolean {
    const rewardId = `${tier}-${rewardType}`;
    return claimedRewards.get().includes(rewardId);
  }

  function handleTierClick(tier: number) {
    if (isTierUnlocked(tier)) {
      openRewardModal(tier);
    }
  }

  function isFreeTier(tier: DadPassTier): boolean {
    return tier.isFreeTier;
  }
</script>

<div class="daddypass-tiers">
  <h2>Rewards Track</h2>
  <div class="tiers-container">
    {#each DADPASS_TIERS as tier (tier.tier)}
      <div
        class="tier-card"
        class:unlocked={isTierUnlocked(tier.tier)}
        class:locked={!isTierUnlocked(tier.tier)}
        class:free={isFreeTier(tier)}
        class:premium={!isFreeTier(tier)}
        on:click={() => handleTierClick(tier.tier)}
        role="button"
        tabindex="0"
      >
        <div class="tier-header">
          <div class="tier-number">
            <span class="tier-label">Tier</span>
            <span class="tier-value">{tier.tier}</span>
          </div>
          <div class="tier-badge" class:free-badge={isFreeTier(tier)} class:premium-badge={!isFreeTier(tier)}>
            {isFreeTier(tier) ? 'Free' : 'Premium'}
          </div>
        </div>

        <div class="tier-xp">
          <span class="xp-label">{tier.xpRequired} XP</span>
        </div>

        <div class="tier-rewards">
          {#each tier.rewards as reward}
            <div
              class="reward"
              class:claimed={isRewardClaimed(tier.tier, reward.rewardType)}
              class:unclaimed={isTierUnlocked(tier.tier) && !isRewardClaimed(tier.tier, reward.rewardType)}
              class:locked-reward={!isTierUnlocked(tier.tier)}
            >
              <span class="reward-icon">{getRewardIcon(reward)}</span>
              <span class="reward-description">{getRewardDescription(reward)}</span>
              {#if isRewardClaimed(tier.tier, reward.rewardType)}
                <span class="reward-status claimed-status">✓</span>
              {:else if isTierUnlocked(tier.tier)}
                <span class="reward-status available-status">!</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .daddypass-tiers {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .daddypass-tiers h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    color: #1f2937;
  }

  .tiers-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .tier-card {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .tier-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tier-card.locked {
    opacity: 0.6;
    background: #f9fafb;
  }

  .tier-card.locked:hover {
    transform: none;
  }

  .tier-card.unlocked {
    border-color: #fbbf24;
    background: #fffbeb;
  }

  .tier-card.unlocked.premium {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  }

  .tier-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .tier-number {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tier-label {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  .tier-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1f2937;
  }

  .tier-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .free-badge {
    background: #e5e7eb;
    color: #4b5563;
  }

  .premium-badge {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #78350f;
  }

  .tier-xp {
    margin-bottom: 1rem;
  }

  .xp-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
  }

  .tier-rewards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .reward {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    position: relative;
  }

  .reward.claimed {
    background: #dcfce7;
    color: #166534;
  }

  .reward.unclaimed {
    background: #fef3c7;
    color: #92400e;
    animation: pulse 2s ease-in-out infinite;
  }

  .reward.locked-reward {
    background: #f3f4f6;
    color: #9ca3af;
  }

  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(251, 191, 36, 0);
    }
  }

  .reward-icon {
    font-size: 1rem;
  }

  .reward-description {
    flex: 1;
    font-weight: 500;
  }

  .reward-status {
    font-size: 0.75rem;
    font-weight: 700;
  }

  .claimed-status {
    color: #166534;
  }

  .available-status {
    color: #f59e0b;
  }

  @media (max-width: 768px) {
    .daddypass-tiers {
      padding: 1rem;
    }

    .tiers-container {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .tier-card {
      padding: 0.75rem;
    }

    .tier-value {
      font-size: 1.25rem;
    }
  }
</style>
