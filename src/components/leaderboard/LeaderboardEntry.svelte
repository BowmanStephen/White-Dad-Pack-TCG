<script lang="ts">
  import type { LeaderboardEntry, LeaderboardCategory } from '@/types/leaderboard';
  import { formatStatValue, formatRank } from '@/lib/leaderboard/generator';

  export let entry: LeaderboardEntry;
  export let category: LeaderboardCategory;
  export let highlighted = false;

  const statValue = getStatValue(entry.stats, category);

  function getStatValue(stats: any, category: LeaderboardCategory): number {
    switch (category) {
      case 'packsOpened':
        return stats.totalPacksOpened;
      case 'uniqueCards':
        return stats.uniqueCards;
      case 'mythicCards':
        return stats.mythicCards;
      case 'totalCards':
        return stats.totalCards;
      default:
        return 0;
    }
  }

  const rankDisplay = formatRank(entry.rank);
  const statDisplay = formatStatValue(category, statValue);

  // Rank badge color
  const rankColor = getRankColor(entry.rank);

  function getRankColor(rank: number): string {
    if (rank === 1) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    if (rank === 2) return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    if (rank === 3) return 'text-amber-600 bg-amber-600/10 border-amber-600/20';
    if (rank <= 10) return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    if (rank <= 100) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    return 'text-gray-600 bg-gray-600/10 border-gray-600/20';
  }
</script>

<div
  class="leaderboard-entry flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 {highlighted
    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/10 scale-[1.02]'
    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}"
>
  <!-- Rank Badge -->
  <div
    class="rank-badge flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border {rankColor}"
  >
    {rankDisplay}
  </div>

  <!-- Avatar -->
  <div class="avatar flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl shadow-lg">
    {entry.avatar}
  </div>

  <!-- Player Info -->
  <div class="player-info flex-grow min-w-0">
    <div class="flex items-center gap-2">
      <span class="font-semibold text-white truncate">{entry.pseudonym}</span>
      {#if entry.isCurrentUser}
        <span
          class="user-badge flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30"
        >
          YOU
        </span>
      {/if}
    </div>
    <div class="stat-value text-sm text-gray-400">{statDisplay}</div>
  </div>

  <!-- Additional Stats (small) -->
  <div class="additional-stats flex-shrink-0 hidden sm:flex gap-3 text-xs text-gray-500">
    <div class="stat flex flex-col items-center">
      <span class="font-semibold text-gray-300">{entry.stats.totalPacksOpened}</span>
      <span>Packs</span>
    </div>
    <div class="stat flex flex-col items-center">
      <span class="font-semibold text-gray-300">{entry.stats.uniqueCards}</span>
      <span>Unique</span>
    </div>
    {#if category !== 'mythicCards' && entry.stats.mythicCards > 0}
      <div class="stat flex flex-col items-center">
        <span class="font-semibold text-purple-400">{entry.stats.mythicCards}</span>
        <span>Mythic</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .leaderboard-entry {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .rank-badge {
    font-variant-numeric: tabular-nums;
  }
</style>
