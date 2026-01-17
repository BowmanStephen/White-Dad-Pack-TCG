<script lang="ts">
  import { onMount } from 'svelte';
  import {
    dadPassSubscription,
    isDadPassActive,
    daysRemaining,
    currentTierData,
    nextTierData,
    tierProgress,
    claimableRewards,
    claimableCount,
    dadPassTiers,
    getDadPassSummary,
    processDailyLogin,
    purchaseDadPass,
    simulateDadPassPurchase,
    claimAllRewards,
    claimTierReward,
    setAutoRenew,
    openPurchaseModal,
    closePurchaseModal,
    setProcessing,
    setError,
  } from '@/stores/daddypass';
  import { premiumInventory } from '@/stores/premium';
  import { dailyRewards, initializeDailyRewards, claimDailyReward } from '@/stores/daily-rewards';
  import DadPassBanner from './DadPassBanner.svelte';
  import DadPassProgress from './DadPassProgress.svelte';
  import DadPassTiers from './DadPassTiers.svelte';
  import DadPassRewards from './DadPassRewards.svelte';
  import DadPassPurchaseModal from './DadPassPurchaseModal.svelte';

  let summary = getDadPassSummary();
  let showingPurchaseModal = false;
  let processing = false;
  let error: string | null = null;
  let successMessage: string | null = null;
  let dailyRewardClaimed = false;

  onMount(() => {
    initializeDailyRewards();
    summary = getDadPassSummary();
  });

  // Subscribe to store changes
  dadPassSubscription.subscribe(() => {
    summary = getDadPassSummary();
  });

  premiumInventory.subscribe(() => {
    // Refresh when premium inventory changes
  });

  async function handlePurchase(autoRenew: boolean) {
    try {
      processing = true;
      error = null;
      simulateDadPassPurchase(autoRenew);
      successMessage = 'DadPass activated! Welcome to the pass!';
      showingPurchaseModal = false;
    } catch (e) {
      error = 'Failed to purchase DadPass. Please try again.';
    } finally {
      processing = false;
    }
  }

  async function handleClaimAll() {
    try {
      processing = true;
      error = null;
      const rewards = claimAllRewards();
      successMessage = `Claimed ${rewards.length} rewards!`;
    } catch (e) {
      error = 'Failed to claim rewards. Please try again.';
    } finally {
      processing = false;
    }
  }

  async function handleClaimReward(tier: number, rewardType: string) {
    try {
      processing = true;
      error = null;
      claimTierReward(tier, rewardType);
    } catch (e) {
      error = 'Failed to claim reward. Please try again.';
    } finally {
      processing = false;
    }
  }

  function handleDailyLogin() {
    const result = processDailyLogin();
    if (result.tierIncreased) {
      successMessage = `Tier up! +${result.xpGained} XP`;
    } else if (result.premiumPackAwarded) {
      successMessage = `+${result.xpGained} XP, ${result.premiumPackAwarded} Premium Pack(s) awarded!`;
    } else {
      successMessage = `+${result.xpGained} XP`;
    }
    dailyRewardClaimed = true;
  }

  function handleToggleAutoRenew() {
    const sub = dadPassSubscription.get();
    setAutoRenew(!sub.autoRenew);
  }
</script>

<div class="daddypass-page">
  <DadPassBanner
    {summary}
    onPurchase={() => (showingPurchaseModal = true)}
    onDailyLogin={handleDailyLogin}
    {dailyRewardClaimed}
  />

  {#if summary.isActive}
    <DadPassProgress {summary} />
  {/if}

  <DadPassTiers {summary} />

  {#if summary.isActive && claimableCount.get() > 0}
    <DadPassRewards
      rewards={claimableRewards.get()}
      onClaimAll={handleClaimAll}
      onClaimReward={handleClaimReward}
      {processing}
    />
  {/if}

  {#if error}
    <div class="error-message">
      {error}
      <button on:click={() => (error = null)}>×</button>
    </div>
  {/if}

  {#if successMessage}
    <div class="success-message">
      {successMessage}
      <button on:click={() => (successMessage = null)}>×</button>
    </div>
  {/if}

  {#if showingPurchaseModal}
    <DadPassPurchaseModal
      onPurchase={handlePurchase}
      onClose={() => (showingPurchaseModal = false)}
      {processing}
    />
  {/if}
</div>

<style>
  .daddypass-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .error-message,
  .success-message {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  .error-message {
    background: #dc2626;
    color: white;
  }

  .success-message {
    background: #16a34a;
    color: white;
  }

  .error-message button,
  .success-message button {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .daddypass-page {
      padding: 1rem 0.5rem;
    }

    .error-message,
    .success-message {
      right: 1rem;
      left: 1rem;
      bottom: 1rem;
    }
  }
</style>
