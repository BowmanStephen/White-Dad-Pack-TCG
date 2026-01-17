<script lang="ts">
  import { referralState, getMyRank, updateLeaderboard } from '@/stores/referral';
  import { profile } from '@/stores/profile';
  import { onMount } from 'svelte';
  import type { ReferralLeaderboardEntry } from '@/types';

  // Local state
  let leaderboard: ReferralLeaderboardEntry[] = [];
  let myRank: number | null = null;

  // Reactive values
  $: leaderboardData = $referralState.leaderboard;

  onMount(() => {
    // Update leaderboard on mount
    updateLeaderboard();
    leaderboard = leaderboardData;
    myRank = getMyRank();
  });

  function getRankIcon(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  function getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }

  function getAvatarEmoji(avatarId: string): string {
    const avatarEmojis: Record<string, string> = {
      grill_master: '🔥',
      fix_it: '🔧',
      couch_potato: '🛋️',
      lawn_care: '🌱',
      cool_dad: '😎',
      golf_dad: '⛳',
      chef_dad: '👨‍🍳',
      tech_dad: '💻',
      car_dad: '🚗',
      office_dad: '💼',
    };
    return avatarEmojis[avatarId] || '👤';
  }
</script>

<div class="referral-leaderboard">
  <div class="leaderboard-header">
    <h2>🏆 Top Referrers</h2>
    <p class="subtitle">Who's bringing the most dads to the game!</p>
  </div>

  {#if leaderboard.length > 0}
    <div class="leaderboard-list">
      {#each leaderboard as entry, index}
        <div
          class="leaderboard-entry"
          class:highlighted={myRank === entry.rank}
          class:rank-gold={entry.rank === 1}
          class:rank-silver={entry.rank === 2}
          class:rank-bronze={entry.rank === 3}
        >
          <div class="rank-display">
            <span class="rank-icon">{getRankIcon(entry.rank)}</span>
          </div>

          <div class="player-info">
            <div class="player-avatar">
              <span class="avatar-emoji">{getAvatarEmoji(entry.avatarId)}</span>
            </div>
            <div class="player-details">
              <span class="player-name">{entry.username || entry.pseudonym}</span>
              <span class="player-pseudonym">{entry.pseudonym}</span>
            </div>
          </div>

          <div class="referral-stats">
            <div class="stat-item">
              <span class="stat-value">{entry.totalReferrals}</span>
              <span class="stat-label">Total</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{entry.activeReferrals}</span>
              <span class="stat-label">Active</span>
            </div>
          </div>

          {#if myRank === entry.rank}
            <div class="my-rank-badge">
              <span>YOU</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="leaderboard-footer">
      {#if myRank}
        <p class="my-rank-text">
          Your rank: <span class="rank-number">#{myRank}</span>
        </p>
      {:else}
        <p class="info-text">Start referring friends to get on the leaderboard!</p>
      {/if}
    </div>
  {:else}
    <div class="empty-state">
      <span class="empty-icon">🏆</span>
      <p class="empty-text">Leaderboard is empty</p>
      <p class="empty-subtext">Be the first to refer friends and claim your spot!</p>
    </div>
  {/if}
</div>

<style>
  .referral-leaderboard {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .leaderboard-header {
    text-align: center;
  }

  .leaderboard-header h2 {
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

  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .leaderboard-list::-webkit-scrollbar {
    width: 6px;
  }

  .leaderboard-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }

  .leaderboard-list::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 3px;
  }

  .leaderboard-entry {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;
  }

  .leaderboard-entry:hover {
    background: rgba(59, 130, 246, 0.1);
  }

  .leaderboard-entry.highlighted {
    background: rgba(251, 191, 36, 0.2);
    border-color: #fbbf24;
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
  }

  .leaderboard-entry.rank-gold {
    border-color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
  }

  .leaderboard-entry.rank-silver {
    border-color: #9ca3af;
    background: rgba(156, 163, 175, 0.1);
  }

  .leaderboard-entry.rank-bronze {
    border-color: #cd7f32;
    background: rgba(205, 127, 50, 0.1);
  }

  .rank-display {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .rank-icon {
    font-size: 1.5rem;
  }

  .player-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .player-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-emoji {
    font-size: 1.25rem;
  }

  .player-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .player-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .player-pseudonym {
    font-size: 0.75rem;
    color: #9ca3af;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .referral-stats {
    display: flex;
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 1rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .stat-label {
    font-size: 0.625rem;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .my-rank-badge {
    background: #fbbf24;
    color: #1e3a8a;
    font-size: 0.625rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    text-transform: uppercase;
  }

  .leaderboard-footer {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.75rem;
    padding: 1rem;
    text-align: center;
  }

  .my-rank-text {
    font-size: 0.875rem;
    color: #d1d5db;
    margin: 0;
  }

  .rank-number {
    font-size: 1.125rem;
    font-weight: 700;
    color: #fbbf24;
  }

  .info-text {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
  }

  .empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }

  .empty-text {
    font-size: 1.125rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
  }

  .empty-subtext {
    font-size: 0.875rem;
    color: #9ca3af;
    margin: 0;
  }

  @media (max-width: 640px) {
    .leaderboard-entry {
      padding: 0.625rem 0.75rem;
    }

    .player-info {
      gap: 0.5rem;
    }

    .player-avatar {
      width: 2rem;
      height: 2rem;
    }

    .avatar-emoji {
      font-size: 1rem;
    }

    .referral-stats {
      gap: 0.5rem;
    }

    .stat-value {
      font-size: 0.875rem;
    }
  }
</style>
