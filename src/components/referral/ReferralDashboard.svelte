<script lang="ts">
  import { referralState, getClaimableRewards, claimReferralReward, getMyReferralCode, generateReferralLink } from '@/stores/referral';
  import { profile } from '@/stores/profile';
  import { onMount } from 'svelte';
  import ReferralShareModal from './ReferralShareModal.svelte';

  // Local state
  let showShareModal = false;
  let myCode = '';
  let myLink = '';
  let claimableCount = 0;
  let unclaimedPacks = 0;

  // Computed values
  $: stats = $referralState.stats;
  $: myReferralLink = $referralState.myReferralLink;
  $: referredBy = $referralState.referredBy;
  $: referrals = $referralState.referrals;

  onMount(() => {
    // Initialize referral code
    myCode = getMyReferralCode();
    myLink = generateReferralLink(myCode);
    updateClaimableInfo();
  });

  function updateClaimableInfo() {
    const claimable = getClaimableRewards();
    claimableCount = claimable.length;
    unclaimedPacks = claimable.reduce((sum, r) => sum + r.packCount, 0);
  }

  function openShareModal() {
    showShareModal = true;
  }

  function closeShareModal() {
    showShareModal = false;
  }

  function copyReferralLink() {
    if (myLink.url) {
      navigator.clipboard.writeText(myLink.url).then(() => {
        alert('Referral link copied to clipboard!');
      });
    }
  }

  function copyReferralCode() {
    if (myCode) {
      navigator.clipboard.writeText(myCode).then(() => {
        alert('Referral code copied to clipboard!');
      });
    }
  }

  function claimReward(rewardId: string) {
    const success = claimReferralReward(rewardId);
    if (success) {
      updateClaimableInfo();
      alert('Reward claimed! Check your pack inventory.');
    } else {
      alert('Failed to claim reward. It may have expired.');
    }
  }

  function claimNewUserBonus() {
    import('@/stores/referral').then(({ claimNewUserBonus }) => {
      const success = claimNewUserBonus();
      if (success) {
        updateClaimableInfo();
        alert('Bonus claimed! You received 2 free packs!');
      } else {
        alert('Failed to claim bonus. You may have already claimed it.');
      }
    });
  }
</script>

<div class="referral-dashboard">
  <!-- Header -->
  <div class="dashboard-header">
    <h2>🎁 Referral Rewards</h2>
    <p class="subtitle">Earn free packs by inviting friends!</p>
  </div>

  <!-- Stats Overview -->
  <div class="stats-grid">
    <div class="stat-card">
      <span class="stat-icon">👥</span>
      <div class="stat-info">
        <span class="stat-value">{stats.totalReferrals}</span>
        <span class="stat-label">Total Referrals</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">✅</span>
      <div class="stat-info">
        <span class="stat-value">{stats.activeReferrals}</span>
        <span class="stat-label">Active Referrals</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">⏳</span>
      <div class="stat-info">
        <span class="stat-value">{stats.pendingReferrals}</span>
        <span class="stat-label">Pending</span>
      </div>
    </div>
    <div class="stat-card">
      <span class="stat-icon">🎁</span>
      <div class="stat-info">
        <span class="stat-value">{unclaimedPacks}</span>
        <span class="stat-label">Unclaimed Packs</span>
      </div>
    </div>
  </div>

  <!-- Referral Link Section -->
  <div class="referral-link-section">
    <h3>Your Referral Link 🔗</h3>
    <div class="code-display">
      <span class="code">{myCode}</span>
      <button class="btn-copy" on:click={copyReferralCode} type="button">Copy Code</button>
    </div>
    <div class="link-display">
      <span class="link">{myLink.url}</span>
      <button class="btn-copy" on:click={copyReferralLink} type="button">Copy Link</button>
    </div>
    <button class="btn-share" on:click={openShareModal} type="button">
      📤 Share Referral Link
    </button>
  </div>

  <!-- Rewards Section -->
  <div class="rewards-section">
    <h3>Your Rewards 🎁</h3>
    {#if claimableCount > 0}
      <div class="claimable-list">
        {#each getClaimableRewards() as reward}
          <div class="reward-card">
            <div class="reward-info">
              <span class="reward-icon">
                {reward.rewardType === 'referrer' ? '🏆' : '🎉'}
              </span>
              <div class="reward-details">
                <span class="reward-title">
                  {reward.rewardType === 'referrer' ? 'Referrer Reward' : 'Welcome Bonus'}
                </span>
                <span class="reward-packs">{reward.packCount} Free Packs</span>
              </div>
            </div>
            <button
              class="btn-claim"
              on:click={() => claimReward(reward.id)}
              type="button"
            >
              Claim
            </button>
          </div>
        {/each}
      </div>
    {:else}
      <p class="empty-state">No claimable rewards yet. Refer friends to earn free packs!</p>
    {/if}
  </div>

  <!-- New User Bonus -->
  {#if referredBy && !$referralState.hasClaimedNewUserBonus}
    <div class="bonus-banner">
      <span class="bonus-icon">🎉</span>
      <div class="bonus-info">
        <span class="bonus-title">New User Bonus!</span>
        <span class="bonus-description">You were referred! Claim your 2 free packs now.</span>
      </div>
      <button class="btn-claim-bonus" on:click={claimNewUserBonus} type="button">
        Claim Bonus
      </button>
    </div>
  {/if}

  <!-- Referrals List -->
  <div class="referrals-list">
    <h3>Your Referrals 👥</h3>
    {#if referrals.length > 0}
      <div class="referrals-grid">
        {#each referrals as referral}
          <div class="referral-card" class:completed={referral.status === 'completed' || referral.status === 'rewarded'}>
            <div class="referral-status">
              <span class="status-icon">
                {referral.status === 'completed' || referral.status === 'rewarded' ? '✅' : '⏳'}
              </span>
            </div>
            <div class="referral-info">
              <span class="referral-code">{referral.referralCode}</span>
              <span class="referral-progress">{referral.packsOpened} / 10 packs</span>
            </div>
            <div class="referral-status-text">
              {referral.status === 'completed' || referral.status === 'rewarded' ? 'Completed' : 'In Progress'}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="empty-state">No referrals yet. Share your link to start earning!</p>
    {/if}
  </div>
</div>

{#if showShareModal}
  <ReferralShareModal
    referralCode={myCode}
    referralLink={myLink}
    onClose={closeShareModal}
  />
{/if}

<style>
  .referral-dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .dashboard-header {
    text-align: center;
  }

  .dashboard-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .referral-link-section {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.75rem;
    padding: 1.25rem;
  }

  .referral-link-section h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 1rem 0;
  }

  .code-display,
  .link-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .code,
  .link {
    flex: 1;
    font-family: monospace;
    font-size: 0.875rem;
    color: #d1d5db;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .code {
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #fbbf24;
  }

  .btn-copy {
    background: #3b82f6;
    border: none;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
    white-space: nowrap;
  }

  .btn-copy:hover {
    background: #2563eb;
  }

  .btn-share {
    width: 100%;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border: none;
    border-radius: 0.5rem;
    padding: 0.875rem;
    color: #ffffff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 0.5rem;
  }

  .btn-share:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  .rewards-section {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.75rem;
    padding: 1.25rem;
  }

  .rewards-section h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 1rem 0;
  }

  .claimable-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .reward-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid #3b82f6;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .reward-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .reward-icon {
    font-size: 1.5rem;
  }

  .reward-details {
    display: flex;
    flex-direction: column;
  }

  .reward-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
  }

  .reward-packs {
    font-size: 0.75rem;
    color: #fbbf24;
  }

  .btn-claim {
    background: #fbbf24;
    border: none;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    color: #1e3a8a;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-claim:hover {
    background: #fcd34d;
    transform: scale(1.05);
  }

  .bonus-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%);
    border: 2px solid #22c55e;
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
  }

  .bonus-icon {
    font-size: 2rem;
  }

  .bonus-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .bonus-title {
    font-size: 1rem;
    font-weight: 700;
    color: #22c55e;
  }

  .bonus-description {
    font-size: 0.875rem;
    color: #d1d5db;
  }

  .btn-claim-bonus {
    background: #22c55e;
    border: none;
    border-radius: 0.5rem;
    padding: 0.75rem 1.5rem;
    color: #ffffff;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-claim-bonus:hover {
    background: #16a34a;
    transform: scale(1.05);
  }

  .referrals-list {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.75rem;
    padding: 1.25rem;
  }

  .referrals-list h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 1rem 0;
  }

  .referrals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .referral-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid #3b82f6;
    border-radius: 0.5rem;
    padding: 0.75rem;
  }

  .referral-card.completed {
    background: rgba(34, 197, 94, 0.1);
    border-color: #22c55e;
  }

  .referral-status {
    display: flex;
    align-items: center;
  }

  .status-icon {
    font-size: 1.25rem;
  }

  .referral-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .referral-code {
    font-family: monospace;
    font-size: 0.875rem;
    font-weight: 600;
    color: #fbbf24;
  }

  .referral-progress {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .referral-status-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: #d1d5db;
  }

  .referral-card.completed .referral-status-text {
    color: #22c55e;
  }

  .empty-state {
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
    padding: 1rem;
  }

  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .code-display,
    .link-display {
      flex-direction: column;
      align-items: stretch;
    }

    .btn-copy {
      width: 100%;
    }

    .referrals-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
