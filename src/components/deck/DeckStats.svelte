<script lang="ts">
  import { RARITY_CONFIG, DAD_TYPE_NAMES, STAT_NAMES } from '@/types';
  import type { DeckStats } from '@/types';

  export let stats: DeckStats;

  // Calculate stat percentage for visual bar
  function getStatWidth(value: number): number {
    return Math.min((value / 100) * 100, 100);
  }

  // Get stat bar color based on value
  function getStatColor(value: number): string {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  }
</script>

<div class="deck-stats space-y-6">
  <!-- Overview Stats -->
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div class="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCards}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">Total Cards</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div class="text-3xl font-bold text-gray-900 dark:text-white">{stats.uniqueCards}</div>
      <div class="text-sm text-gray-500 dark:text-gray-400">Unique Cards</div>
    </div>
  </div>

  <!-- Rarity Breakdown -->
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Rarity Breakdown</h3>
    <div class="space-y-2">
      {#each Object.entries(RARITY_CONFIG) as [rarity, config]}
        {@const count = stats.rarityBreakdown[rarity] || 0}
        {#if count > 0}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                style="background-color: {config.color}"
              ></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{config.name}</span>
            </div>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Type Breakdown -->
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Dad Types</h3>
    <div class="grid grid-cols-2 gap-2">
      {#each Object.entries(stats.typeBreakdown) as [type, count]}
        {#if count > 0}
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-700 dark:text-gray-300">{DAD_TYPE_NAMES[type]}</span>
            <span class="font-semibold text-gray-900 dark:text-white">{count}</span>
          </div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Average Stats -->
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Average Stats</h3>
    <div class="space-y-3">
      {#each Object.entries(stats.averageStats) as [stat, value]}
        {@const displayName = STAT_NAMES[stat]}
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="text-gray-700 dark:text-gray-300">{displayName}</span>
            <span class="font-semibold text-gray-900 dark:text-white">{value}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-300 {getStatColor(value)}"
              style="width: {getStatWidth(value)}%"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Total Stats -->
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Total Stats</h3>
    <div class="grid grid-cols-2 gap-2 text-sm">
      {#each Object.entries(stats.statTotal) as [stat, value]}
        {@const displayName = STAT_NAMES[stat]}
        <div class="flex justify-between">
          <span class="text-gray-700 dark:text-gray-300">{displayName}</span>
          <span class="font-semibold text-gray-900 dark:text-white">{value}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
