<script lang="ts">
  import { onMount } from 'svelte';
  import LeaderboardFilters from './LeaderboardFilters.svelte';
  import LeaderboardList from './LeaderboardList.svelte';
  import FriendLeaderboard from './FriendLeaderboard.svelte';
  import {
    currentLeaderboard,
    isLoading,
    error,
    currentCategory,
    currentScope,
    currentTimePeriod,
    currentRegion,
    setLeaderboard,
    setLoading,
    setError,
  } from '@/stores/leaderboard';
  import { generateLeaderboard, generateUserProfile } from '@/lib/leaderboard/generator';
  import { LEADERBOARD_CATEGORIES, TIME_PERIODS } from '@/types/leaderboard';
  import type { PlayerProfile } from '@/types/profile';

  // Local reactive state
  let leaderboard = $state(currentLeaderboard.get());
  let loading = $state(isLoading.get());
  let errorMessage = $state(error.get());

  // User profile (in real app, would come from auth/user store)
  // Initialize to null for SSR safety, will be set in onMount
  let userProfile = $state<PlayerProfile | null>(null);

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

    // Initialize user profile only on client side (SSR-safe)
    const profile = generateUserProfile();
    // Add some mock friends to the user profile
    const mockFriendIds = Array.from({ length: 15 }, (_, i) => `friend_${i}`);
    profile.friends = mockFriendIds;
    userProfile = profile;

    // Load initial leaderboard if not present and profile is ready
    if (!leaderboard && userProfile) {
      loadLeaderboard();
    }

    return () => {
      unsubscribeLeaderboard();
      unsubscribeLoading();
      unsubscribeError();
    };
  });

  // Load leaderboard data
  async function loadLeaderboard() {
    // Guard for SSR: exit if profile not initialized
    if (!userProfile) {
      console.warn('[Leaderboard] Profile not initialized, skipping load');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const category = currentCategory.get();
      const scope = currentScope.get();
      const timePeriod = currentTimePeriod.get();
      const region = currentRegion.get();

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate leaderboard data
      const newLeaderboard = generateLeaderboard({
        category,
        scope,
        timePeriod,
        region,
        userProfile,
      });

      setLeaderboard(newLeaderboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  // Reload leaderboard when filters change
  function reloadLeaderboard() {
    loadLeaderboard();
  }
</script>

<div class="leaderboard-page">
  <div class="page-header">
    <h1 class="page-title">Leaderboards</h1>
    <p class="page-subtitle">
      Compete with dads worldwide for the ultimate collection!
    </p>
  </div>

  {#if errorMessage}
    <div class="error-banner">
      <p class="error-message">{errorMessage}</p>
      <button class="btn-secondary" onclick={reloadLeaderboard}>
        Retry
      </button>
    </div>
  {/if}

  <div class="leaderboard-content">
    <!-- Filters Sidebar -->
    <aside class="filters-sidebar">
      <div class="sidebar-header">
        <h2>Filters</h2>
        <button
          class="btn-icon"
          onclick={reloadLeaderboard}
          title="Refresh leaderboard"
          disabled={loading}
        >
          🔄
        </button>
      </div>

      <LeaderboardFilters showRegionFilter={false} />

      <div class="category-info">
        <h3>Current Category</h3>
        <div class="category-display">
          <span class="category-icon">
            {LEADERBOARD_CATEGORIES[currentCategory.get()].icon}
          </span>
          <div class="category-details">
            <div class="category-name">
              {LEADERBOARD_CATEGORIES[currentCategory.get()].label}
            </div>
            <div class="category-description">
              {LEADERBOARD_CATEGORIES[currentCategory.get()].description}
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Leaderboard Main Content -->
    <main class="leaderboard-main">
      {#if currentScope.get() === 'friends'}
        <!-- Friend Leaderboard View -->
        <FriendLeaderboard />
      {:else}
        <!-- Global Leaderboard View -->
        <div class="leaderboard-header">
          <h2>
            {LEADERBOARD_CATEGORIES[currentCategory.get()].label}
          </h2>
          <div class="header-meta">
            <span class="time-period">
              {TIME_PERIODS[currentTimePeriod.get()].label}
            </span>
            <span class="scope">
              🌍 Global
            </span>
          </div>
        </div>

        {#if leaderboard}
          <LeaderboardList {leaderboard} loading={loading} />
        {:else}
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading leaderboard...</p>
          </div>
        {/if}
      {/if}
    </main>
  </div>
</div>

<style>
  .leaderboard-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem 1rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .page-header {
    text-align: center;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--color-text-primary, #1e293b);
    margin: 0 0 0.5rem 0;
    background: linear-gradient(135deg, #f59e0b, #ef4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-subtitle {
    font-size: 1.125rem;
    color: var(--color-text-secondary, #64748b);
    margin: 0;
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

  .leaderboard-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    align-items: start;
  }

  .filters-sidebar {
    position: sticky;
    top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: var(--color-card-bg, #ffffff);
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border, #e2e8f0);
  }

  .sidebar-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary, #1e293b);
    margin: 0;
  }

  .category-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border, #e2e8f0);
  }

  .category-info h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .category-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .category-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    font-size: 1.5rem;
    background: var(--color-surface-secondary, #f1f5f9);
    border-radius: 0.5rem;
  }

  .category-details {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .category-name {
    font-weight: 600;
    color: var(--color-text-primary, #1e293b);
  }

  .category-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #64748b);
  }

  .leaderboard-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .leaderboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-card-bg, #ffffff);
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .leaderboard-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary, #1e293b);
    margin: 0;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .time-period,
  .scope {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    background: var(--color-surface-secondary, #f1f5f9);
    border-radius: 2rem;
    color: var(--color-text-primary, #1e293b);
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

  @media (max-width: 1024px) {
    .leaderboard-content {
      grid-template-columns: 1fr;
    }

    .filters-sidebar {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .page-title {
      font-size: 2rem;
    }

    .leaderboard-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .header-meta {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }

    .time-period,
    .scope {
      width: 100%;
    }
  }

  :global(.dark) .page-title {
    background: linear-gradient(135deg, #fbbf24, #f87171);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  :global(.dark) .filters-sidebar,
  :global(.dark) .leaderboard-header {
    background: var(--color-card-bg, #1e293b);
  }

  :global(.dark) .category-icon,
  :global(.dark) .time-period,
  :global(.dark) .scope {
    background: var(--color-surface-secondary, #334155);
  }

  :global(.dark) .category-name,
  :global(.dark) .leaderboard-header h2 {
    color: var(--color-text-primary, #f1f5f9);
  }
</style>
