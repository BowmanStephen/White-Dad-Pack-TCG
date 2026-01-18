<script lang="ts">
  import { onMount } from 'svelte';
  import LeaderboardList from './LeaderboardList.svelte';
  import {
    currentLeaderboard,
    isLoading,
    error,
    currentCategory,
    currentTimePeriod,
    setLeaderboard,
    setLoading,
    setError,
  } from '@/stores/leaderboard';
  import { generateLeaderboard, generateUserProfile } from '@/lib/leaderboard/generator';
  import { LEADERBOARD_CATEGORIES, TIME_PERIODS } from '@/types/leaderboard';

  // Local reactive state
  let leaderboard = $state(currentLeaderboard.get());
  let loading = $state(isLoading.get());
  let errorMessage = $state(error.get());

  // User profile with friends (in real app, would come from auth/user store)
  let userProfile = $state(generateUserProfile());

  // Subscribe to store changes
  onMount(() => {
    const unsubscribeLeaderboard = currentLeaderboard.subscribe((value) => {
      leaderboard = value;
    });
    const unsubscribeLoading = isLoading.subscribe((value) => {
      loading = value;
    });
    const unsubscribeError = error.subscribe((value) => {
      errorMessage = value;
    });

    // Add some mock friends to the user profile
    const mockFriendIds = Array.from({ length: 15 }, (_, i) => `friend_${i}`);
    userProfile.friends = mockFriendIds;

    // Load initial leaderboard if not present
    if (!leaderboard) {
      loadFriendLeaderboard();
    }

    return () => {
      unsubscribeLeaderboard();
      unsubscribeLoading();
      unsubscribeError();
    };
  });

  // Load friends-only leaderboard data
  async function loadFriendLeaderboard() {
    try {
      setLoading(true);
      setError(null);

      const category = currentCategory.get();
      const timePeriod = currentTimePeriod.get();

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate friends-only leaderboard
      const newLeaderboard = generateLeaderboard({
        category,
        scope: 'friends',
        timePeriod,
        userProfile,
      });

      setLeaderboard(newLeaderboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friend leaderboard');
    } finally {
      setLoading(false);
    }
  }

  // Reload leaderboard when filters change
  function reloadLeaderboard() {
    loadFriendLeaderboard();
  }
</script>

<div class="friend-leaderboard">
  <div class="friend-header">
    <div class="header-content">
      <div class="header-title">
        <span class="scope-icon">👥</span>
        <h1>Friends Leaderboard</h1>
      </div>
      <p class="header-subtitle">
        Compete with your dad friends for the ultimate collection!
      </p>
    </div>

    <button
      class="btn-icon refresh-btn"
      onclick={reloadLeaderboard}
      title="Refresh leaderboard"
      disabled={loading}
    >
      🔄
    </button>
  </div>

  {#if errorMessage}
    <div class="error-banner">
      <p class="error-message">{errorMessage}</p>
      <button class="btn-secondary" onclick={reloadLeaderboard}>
        Retry
      </button>
    </div>
  {/if}

  {#if leaderboard && leaderboard.entries.length > 0}
    <div class="leaderboard-meta">
      <div class="meta-item">
        <span class="meta-label">Category:</span>
        <span class="meta-value">
          {LEADERBOARD_CATEGORIES[leaderboard.category].icon}
          {LEADERBOARD_CATEGORIES[leaderboard.category].label}
        </span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Time Period:</span>
        <span class="meta-value">
          {TIME_PERIODS[leaderboard.timePeriod].label}
        </span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Friends:</span>
        <span class="meta-value">{leaderboard.entries.length}</span>
      </div>
    </div>

    <LeaderboardList {leaderboard} loading={loading} />
  {:else if !loading}
    <div class="empty-state">
      <div class="empty-icon">👥</div>
      <h2>No Friends Yet</h2>
      <p>Add friends to see them on your leaderboard!</p>
      <button class="btn-primary">Add Friends</button>
    </div>
  {:else}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading friend leaderboard...</p>
    </div>
  {/if}

  {#if leaderboard && leaderboard.userEntry && !leaderboard.entries.some(e => e.isCurrentUser)}
    <div class="user-rank-banner">
      <span class="rank-label">Your Rank:</span>
      <span class="rank-number">#{leaderboard.userEntry.rank}</span>
      <span class="rank-score">
        {leaderboard.category === 'packsOpened' && leaderboard.userEntry.stats.totalPacksOpened + ' packs'}
        {leaderboard.category === 'uniqueCards' && leaderboard.userEntry.stats.uniqueCards + ' unique'}
        {leaderboard.category === 'mythicCards' && leaderboard.userEntry.stats.mythicCards + ' mythics'}
        {leaderboard.category === 'totalCards' && leaderboard.userEntry.stats.totalCards + ' cards'}
      </span>
    </div>
  {/if}
</div>

<style>
  .friend-leaderboard {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .friend-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-card-bg, #ffffff);
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    flex: 1;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .scope-icon {
    font-size: 2rem;
  }

  .header-title h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--color-text-primary, #1e293b);
    margin: 0;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-subtitle {
    font-size: 1rem;
    color: var(--color-text-secondary, #64748b);
    margin: 0;
  }

  .refresh-btn {
    flex-shrink: 0;
  }

  .error-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-error-bg, #fef2f2);
    border: 1px solid var(--color-error-border, #fecaca);
    border-radius: 0.5rem;
    color: var(--color-error-text, #dc2626);
  }

  .error-message {
    flex: 1;
    margin: 0;
  }

  .leaderboard-meta {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 1rem 1.5rem;
    background: var(--color-card-bg, #ffffff);
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .meta-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary, #64748b);
  }

  .meta-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary, #1e293b);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 4rem 2rem;
    text-align: center;
    background: var(--color-card-bg, #ffffff);
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .empty-icon {
    font-size: 4rem;
    opacity: 0.5;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary, #1e293b);
    margin: 0;
  }

  .empty-state p {
    font-size: 1rem;
    color: var(--color-text-secondary, #64748b);
    margin: 0;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem;
    text-align: center;
    color: var(--color-text-secondary, #64748b);
  }

  .user-rank-banner {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
    color: white;
  }

  .rank-label {
    font-size: 0.875rem;
    font-weight: 600;
    opacity: 0.9;
  }

  .rank-number {
    font-size: 1.5rem;
    font-weight: 800;
  }

  .rank-score {
    margin-left: auto;
    font-size: 0.875rem;
    font-weight: 600;
    opacity: 0.9;
  }

  @media (max-width: 640px) {
    .friend-header {
      flex-direction: column;
    }

    .header-title h1 {
      font-size: 1.5rem;
    }

    .leaderboard-meta {
      gap: 1rem;
    }

    .user-rank-banner {
      flex-wrap: wrap;
    }

    .rank-score {
      margin-left: 0;
      width: 100%;
      text-align: center;
    }
  }

  :global(.dark) .header-title h1 {
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global(.dark) .friend-header,
  :global(.dark) .leaderboard-meta,
  :global(.dark) .empty-state {
    background: var(--color-card-bg, #1e293b);
  }

  :global(.dark) .header-title h1,
  :global(.dark) .empty-state h2,
  :global(.dark) .meta-value {
    color: var(--color-text-primary, #f1f5f9);
  }
</style>
