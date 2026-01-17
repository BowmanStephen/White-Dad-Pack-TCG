<script lang="ts">
  import type { Leaderboard, LeaderboardCategory } from '@/types/leaderboard';
  import LeaderboardEntry from './LeaderboardEntry.svelte';

  export let leaderboard: Leaderboard;
  export let loading = false;

  // Separate user entry if not in top 100
  const topEntries = leaderboard.entries;
  const userEntry = leaderboard.userEntry;

  // Pagination
  let currentPage = 1;
  const entriesPerPage = 20;
  const totalPages = Math.ceil(topEntries.length / entriesPerPage);

  $: paginatedEntries = topEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  function nextPage() {
    if (currentPage < totalPages) currentPage++;
  }

  function prevPage() {
    if (currentPage > 1) currentPage--;
  }
</script>

<div class="leaderboard-list">
  <!-- Top 3 Podium (if on first page) -->
  {#if currentPage === 1 && topEntries.length >= 3}
    <div class="podium-section mb-8 p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20">
      <h3 class="text-lg font-bold text-yellow-400 mb-4 text-center">🏆 Top Players 🏆</h3>
      <div class="podium-grid grid grid-cols-3 gap-4 items-end">
        <!-- 2nd Place -->
        <div class="podium-place text-center">
          <div class="podium-avatar mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-3xl mb-2 shadow-lg border-2 border-gray-400">
            {topEntries[1]?.avatar || '🥈'}
          </div>
          <div class="podium-rank text-2xl mb-1">🥈</div>
          <div class="podium-name text-sm font-semibold text-gray-300 truncate">
            {topEntries[1]?.pseudonym || 'Unknown'}
          </div>
          <div class="podium-score text-xs text-gray-400">
            {topEntries[1]?.stats.totalPacksOpened || 0} packs
          </div>
        </div>

        <!-- 1st Place -->
        <div class="podium-place text-center">
          <div class="podium-avatar mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl mb-2 shadow-xl border-3 border-yellow-400 animate-pulse">
            {topEntries[0]?.avatar || '🥇'}
          </div>
          <div class="podium-rank text-3xl mb-1">🥇</div>
          <div class="podium-name text-base font-bold text-yellow-300 truncate">
            {topEntries[0]?.pseudonym || 'Unknown'}
          </div>
          <div class="podium-score text-sm text-yellow-400">
            {topEntries[0]?.stats.totalPacksOpened || 0} packs
          </div>
        </div>

        <!-- 3rd Place -->
        <div class="podium-place text-center">
          <div class="podium-avatar mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-3xl mb-2 shadow-lg border-2 border-amber-600">
            {topEntries[2]?.avatar || '🥉'}
          </div>
          <div class="podium-rank text-2xl mb-1">🥉</div>
          <div class="podium-name text-sm font-semibold text-amber-400 truncate">
            {topEntries[2]?.pseudonym || 'Unknown'}
          </div>
          <div class="podium-score text-xs text-amber-500">
            {topEntries[2]?.stats.totalPacksOpened || 0} packs
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="loading-state flex flex-col items-center justify-center py-12">
      <div class="spinner w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-gray-400">Loading rankings...</p>
    </div>
  {:else}
    <!-- Rankings List -->
    <div class="rankings-list space-y-2">
      {#each paginatedEntries as entry (entry.playerId)}
        <LeaderboardEntry
          entry={entry}
          category={leaderboard.category}
          highlighted={entry.isCurrentUser}
        />
      {/each}
    </div>

    <!-- User's Ranking (if not in top 100) -->
    {#if userEntry}
      <div class="user-ranking-separator my-6 flex items-center gap-4">
        <div class="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <span class="text-sm text-gray-400 font-semibold">Your Ranking</span>
        <div class="flex-grow h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
      <LeaderboardEntry
        entry={userEntry}
        category={leaderboard.category}
        highlighted={true}
      />
    {/if}

    <!-- Pagination Controls -->
    {#if totalPages > 1}
      <div class="pagination-controls mt-8 flex items-center justify-between">
        <button
          on:click={prevPage}
          disabled={currentPage === 1}
          class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <span class="text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        <button
          on:click={nextPage}
          disabled={currentPage === totalPages}
          class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    {/if}

    <!-- Total Players -->
    <div class="total-players mt-6 text-center text-sm text-gray-500">
      Total Players: {leaderboard.totalPlayers.toLocaleString()}
    </div>
  {/if}
</div>

<style>
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  .podium-avatar {
    transition: transform 0.3s ease;
  }

  .podium-avatar:hover {
    transform: scale(1.1);
  }
</style>
