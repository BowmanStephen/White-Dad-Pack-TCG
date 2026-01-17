<script lang="ts">
  import type { LeaderboardCategory, LeaderboardScope } from '@/types/leaderboard';
  import { LEADERBOARD_CATEGORIES } from '@/types/leaderboard';

  export let currentCategory: LeaderboardCategory;
  export let currentScope: LeaderboardScope;

  const categories = Object.entries(LEADERBOARD_CATEGORIES) as Array<
    [LeaderboardCategory, (typeof LEADERBOARD_CATEGORIES)[LeaderboardCategory]]
  >;

  function selectCategory(category: LeaderboardCategory) {
    currentCategory = category;
  }

  function selectScope(scope: LeaderboardScope) {
    currentScope = scope;
  }
</script>

<div class="leaderboard-filters">
  <!-- Scope Tabs -->
  <div class="scope-tabs mb-6">
    <div class="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
      <button
        on:click={() => selectScope('global')}
        class="scope-tab flex-1 px-4 py-2 rounded-md font-semibold text-sm transition-all {currentScope ===
        'global'
          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
          : 'text-gray-400 hover:text-white hover:bg-white/5'}"
      >
        🌍 Global
      </button>
      <button
        on:click={() => selectScope('friends')}
        class="scope-tab flex-1 px-4 py-2 rounded-md font-semibold text-sm transition-all {currentScope ===
        'friends'
          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
          : 'text-gray-400 hover:text-white hover:bg-white/5'}"
      >
        👥 Friends
      </button>
    </div>
  </div>

  <!-- Category Cards -->
  <div class="category-grid grid grid-cols-2 gap-3 mb-6">
    {#each categories as [categoryKey, categoryConfig]}
      <button
        on:click={() => selectCategory(categoryKey)}
        class="category-card p-4 rounded-xl border-2 transition-all duration-200 text-left {currentCategory ===
        categoryKey
          ? 'border-orange-500 bg-gradient-to-br from-orange-500/20 to-red-500/20 shadow-lg shadow-orange-500/20 scale-[1.02]'
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}"
      >
        <div class="category-icon text-2xl mb-2">{categoryConfig.icon}</div>
        <div class="category-label text-sm font-bold text-white mb-1">
          {categoryConfig.label}
        </div>
        <div class="category-description text-xs text-gray-400 line-clamp-2">
          {categoryConfig.description}
        </div>
      </button>
    {/each}
  </div>

  <!-- Current Selection Info -->
  <div class="selection-info p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
    <div class="flex items-center gap-3">
      <span class="selection-icon text-2xl">
        {LEADERBOARD_CATEGORIES[currentCategory].icon}
      </span>
      <div class="selection-details">
        <div class="selection-label text-sm font-semibold text-white">
          {LEADERBOARD_CATEGORIES[currentCategory].label}
        </div>
        <div class="selection-scope text-xs text-gray-400">
          {currentScope === 'global' ? '🌍 Global Rankings' : '👥 Friends Only'}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .category-card {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .category-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
