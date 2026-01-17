<script lang="ts">
  import { onMount } from 'svelte';
  import {
    currentCategory,
    currentScope,
    currentLeaderboard,
    isLoading,
    leaderboardError,
    loadLeaderboard,
    changeCategory,
    changeScope,
    userProfile,
    initializeProfile,
    updateUserStats,
  } from '@/stores/leaderboard';
  import { collection, getCollectionStats } from '@/stores/collection';
  import LeaderboardFilters from './LeaderboardFilters.svelte';
  import LeaderboardList from './LeaderboardList.svelte';
  import type { LeaderboardCategory, LeaderboardScope } from '@/types/leaderboard';

  // Local reactive state for components
  let localCategory: LeaderboardCategory = $currentCategory;
  let localScope: LeaderboardScope = $currentScope;

  // Initialize leaderboard
  onMount(async () => {
    // Initialize user profile from collection
    const stats = getCollectionStats();
    const profileStats = {
      totalPacksOpened: stats.totalPacks,
      uniqueCards: stats.uniqueCards,
      mythicCards: stats.mythicPulls,
      totalCards: stats.totalCards,
      lastActive: new Date(),
      joinedAt: new Date(),
    };

    initializeProfile(profileStats);

    // Load leaderboard data after profile is initialized
    await loadLeaderboard();
  });

  // Handle category changes
  async function handleCategoryChange(category: LeaderboardCategory) {
    localCategory = category;
    await changeCategory(category);
  }

  // Handle scope changes
  async function handleScopeChange(scope: LeaderboardScope) {
    localScope = scope;
    await changeScope(scope);
  }
</script>

<div class="leaderboard-page">
  <!-- Page Header -->
  <div class="page-header mb-8">
    <h1 class="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
      🏆 Leaderboard
    </h1>
    <p class="text-gray-400">
      Compare your collection with other dads worldwide
    </p>
  </div>

  <!-- Error State -->
  {#if $leaderboardError}
    <div class="error-state p-6 rounded-lg bg-red-500/10 border border-red-500/30">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl">⚠️</span>
        <span class="font-semibold text-red-400">Error Loading Leaderboard</span>
      </div>
      <p class="text-sm text-gray-400">{$leaderboardError}</p>
    </div>
  {/if}

  <!-- Two Column Layout -->
  <div class="leaderboard-layout grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Filters Column -->
    <div class="filters-column lg:col-span-1">
      <LeaderboardFilters
        bind:currentCategory={localCategory}
        bind:currentScope={localScope}
        on:categoryChange={() => handleCategoryChange(localCategory)}
        on:scopeChange={() => handleScopeChange(localScope)}
      />

      <!-- User Profile Card -->
      {#if $userProfile}
        <div class="user-profile-card mt-6 p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div class="profile-header flex items-center gap-4 mb-4">
            <div class="profile-avatar w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
              {$userProfile.avatar}
            </div>
            <div class="profile-info">
              <div class="profile-name text-lg font-bold text-white">
                {$userProfile.pseudonym}
              </div>
              <div class="profile-status text-sm text-gray-400">Active Player</div>
            </div>
          </div>

          <div class="profile-stats grid grid-cols-2 gap-3">
            <div class="stat-box p-3 rounded-lg bg-white/5">
              <div class="stat-value text-xl font-bold text-orange-400">
                {$userProfile.stats.totalPacksOpened}
              </div>
              <div class="stat-label text-xs text-gray-400">Packs Opened</div>
            </div>
            <div class="stat-box p-3 rounded-lg bg-white/5">
              <div class="stat-value text-xl font-bold text-blue-400">
                {$userProfile.stats.uniqueCards}
              </div>
              <div class="stat-label text-xs text-gray-400">Unique Cards</div>
            </div>
            <div class="stat-box p-3 rounded-lg bg-white/5">
              <div class="stat-value text-xl font-bold text-purple-400">
                {$userProfile.stats.mythicCards}
              </div>
              <div class="stat-label text-xs text-gray-400">Mythic Cards</div>
            </div>
            <div class="stat-box p-3 rounded-lg bg-white/5">
              <div class="stat-value text-xl font-bold text-green-400">
                {$userProfile.friends.length}
              </div>
              <div class="stat-label text-xs text-gray-400">Friends</div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Rankings Column -->
    <div class="rankings-column lg:col-span-2">
      <div class="rankings-container p-6 rounded-xl bg-white/5 border border-white/10">
        {#if $currentLeaderboard}
          <LeaderboardList
            leaderboard={$currentLeaderboard}
            loading={$isLoading}
          />
        {:else}
          <!-- Empty State -->
          <div class="empty-state flex flex-col items-center justify-center py-12">
            <div class="empty-icon text-6xl mb-4">📊</div>
            <h3 class="text-xl font-semibold text-white mb-2">No Rankings Yet</h3>
            <p class="text-gray-400 text-center max-w-md">
              Open some packs to start climbing the leaderboard!
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .leaderboard-page {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .stat-box {
    transition: transform 0.2s ease;
  }

  .stat-box:hover {
    transform: scale(1.05);
  }
</style>
