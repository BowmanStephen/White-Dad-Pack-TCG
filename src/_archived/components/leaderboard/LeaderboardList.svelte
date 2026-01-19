<script lang="ts">
  import {
    LEADERBOARD_CATEGORIES,
    type Leaderboard,
    type LeaderboardEntry,
  } from '@/types/leaderboard';

  // Props
  interface Props {
    leaderboard: Leaderboard;
    loading?: boolean;
  }

  let { leaderboard, loading = false }: Props = $props();

  type LeaderboardCategoryKey =
    | 'packsOpened'
    | 'uniqueCards'
    | 'mythicCards'
    | 'totalCards'
    | 'collectionValue'
    | 'battleRecord';

  const leaderboardCategories = LEADERBOARD_CATEGORIES as Record<
    LeaderboardCategoryKey,
    { label: string; description: string; icon: string }
  >;
  const RANK_CLASS_MAP: Record<number, string> = {
    1: 'rank-1',
    2: 'rank-2',
    3: 'rank-3',
  };

  let categoryKey = $derived(leaderboard.category as LeaderboardCategoryKey);

  // Get stat value for display
  function getStatValue(
    entry: LeaderboardEntry,
    category: LeaderboardCategoryKey
  ): number {
    switch (category) {
      case 'packsOpened':
        return entry.stats.totalPacksOpened;
      case 'uniqueCards':
        return entry.stats.uniqueCards;
      case 'mythicCards':
        return entry.stats.mythicCards;
      case 'totalCards':
        return entry.stats.totalCards;
      case 'collectionValue':
        return entry.stats.collectionValue ?? 0;
      case 'battleRecord':
        return getBattleRecordValue(entry);
    }
  }

  // Format stat value for display
  function formatStatValue(
    entry: LeaderboardEntry,
    category: LeaderboardCategoryKey
  ): string {
    const value = getStatValue(entry, category);
    if (category === 'battleRecord') {
      const { wins, losses } = getBattleStats(entry);
      return `${value}% (${wins}-${losses})`;
    }
    return formatNumber(value);
  }

  function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  function getRankClass(rank: number): string {
    return RANK_CLASS_MAP[rank] || 'rank-default';
  }

  function getBattleRecordValue(entry: LeaderboardEntry): number {
    const { wins, losses } = getBattleStats(entry);
    const totalBattles = wins + losses;

    if (totalBattles === 0) {
      return 0;
    }

    return Math.round((wins / totalBattles) * 100);
  }

  function hasCurrentUser(entries: LeaderboardEntry[]): boolean {
    return entries.some((entry) => entry.isCurrentUser);
  }

  function getBattleStats(entry: LeaderboardEntry): {
    wins: number;
    losses: number;
  } {
    const stats = entry.stats as unknown as {
      battleWins?: number;
      battleLosses?: number;
    };
    return {
      wins: stats.battleWins ?? 0,
      losses: stats.battleLosses ?? 0,
    };
  }
</script>

<div class="leaderboard-list">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading leaderboard...</p>
    </div>
  {:else if leaderboard.entries.length === 0}
    <div class="empty-state">
      <p>No rankings yet for this time period.</p>
      <p>Open some packs to get on the leaderboard!</p>
    </div>
  {:else}
    <div class="leaderboard-entries">
      {#each leaderboard.entries as entry}
        <div
          class="leaderboard-entry {entry.isCurrentUser ? 'current-user' : ''}"
          class:highlighted={entry.isCurrentUser}
        >
          <div class="entry-rank {getRankClass(entry.rank)}">
            {entry.rank}
          </div>

          <div class="entry-avatar">
            {entry.avatar}
          </div>

          <div class="entry-info">
            <div class="entry-name">
              {entry.pseudonym}
              {#if entry.isCurrentUser}
                <span class="user-badge">(You)</span>
              {/if}
            </div>
          </div>

          <div class="entry-stats">
            <div class="stat-value">
              {formatStatValue(entry, categoryKey)}
            </div>
            <div class="stat-label">
              {leaderboardCategories[categoryKey].label}
            </div>
          </div>
        </div>
      {/each}

      {#if leaderboard.userEntry && !hasCurrentUser(leaderboard.entries)}
        <div class="leaderboard-entry current-user user-entry-separator">
          <div class="entry-rank rank-default">
            {leaderboard.userEntry.rank}
          </div>

          <div class="entry-avatar">
            {leaderboard.userEntry.avatar}
          </div>

          <div class="entry-info">
            <div class="entry-name">
              {leaderboard.userEntry.pseudonym}
              <span class="user-badge">(You)</span>
            </div>
          </div>

          <div class="entry-stats">
            <div class="stat-value">
              {formatStatValue(leaderboard.userEntry, categoryKey)}
            </div>
            <div class="stat-label">
              {leaderboardCategories[categoryKey].label}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="leaderboard-footer">
      <p class="total-players">
        {formatNumber(leaderboard.totalPlayers)} total players
      </p>
    </div>
  {/if}
</div>

<style>
  .leaderboard-list {
    width: 100%;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--color-text-secondary, #64748b);
  }

  .loading-state .spinner {
    width: 2.5rem;
    height: 2.5rem;
    margin-bottom: 1rem;
  }

  .leaderboard-entries {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .leaderboard-entry {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    gap: 1rem;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--color-card-bg, #ffffff);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .leaderboard-entry:hover {
    background: var(--color-card-hover, #f1f5f9);
    transform: translateX(0.25rem);
  }

  .leaderboard-entry.highlighted {
    background: var(--color-accent-primary-light, #fef3c7);
    border: 2px solid var(--color-accent-primary, #f59e0b);
  }

  .user-entry-separator {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid var(--color-border, #e2e8f0);
  }

  .entry-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    font-weight: 700;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #64748b);
    background: var(--color-surface-secondary, #f1f5f9);
    border-radius: 50%;
  }

  .entry-rank.rank-1 {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: white;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
  }

  .entry-rank.rank-2 {
    background: linear-gradient(135deg, #94a3b8, #64748b);
    color: white;
    box-shadow: 0 2px 8px rgba(148, 163, 184, 0.4);
  }

  .entry-rank.rank-3 {
    background: linear-gradient(135deg, #d97706, #b45309);
    color: white;
    box-shadow: 0 2px 8px rgba(217, 119, 6, 0.4);
  }

  .entry-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.5rem;
    background: var(--color-surface-secondary, #f1f5f9);
    border-radius: 50%;
  }

  .entry-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .entry-name {
    font-weight: 600;
    color: var(--color-text-primary, #1e293b);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-badge {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-accent-primary, #f59e0b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .entry-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-accent-primary, #f59e0b);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-secondary, #64748b);
  }

  .leaderboard-footer {
    margin-top: 1.5rem;
    padding: 1rem;
    text-align: center;
  }

  .total-players {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #64748b);
    margin: 0;
  }

  :global(.dark) .leaderboard-entry {
    background: var(--color-card-bg, #1e293b);
  }

  :global(.dark) .leaderboard-entry:hover {
    background: var(--color-card-hover, #334155);
  }

  :global(.dark) .leaderboard-entry.highlighted {
    background: var(--color-accent-primary-dark, #78350f);
  }

  :global(.dark) .entry-rank.rank-default {
    background: var(--color-surface-secondary, #334155);
  }

  :global(.dark) .entry-avatar {
    background: var(--color-surface-secondary, #334155);
  }

  :global(.dark) .entry-name {
    color: var(--color-text-primary, #f1f5f9);
  }
</style>
