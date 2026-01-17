<script lang="ts">
  /**
   * Analytics Dashboard Component
   *
   * Display site analytics including pack openings, user stats, security, and revenue.
   * Moderator and Admin access.
   */

  import { onMount } from 'svelte';
  import { analyticsDashboardState, setAnalyticsTimeRange, setAnalyticsLoading, setAnalyticsData, type AnalyticsTimeRange } from '@/stores/admin-panel';

  let selectedTimeRange: AnalyticsTimeRange = '7d';
  let loading = false;

  // Demo analytics data
  const timeRangeOptions: { value: AnalyticsTimeRange; label: string }[] = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  // Mock chart data (would be real data from API)
  const chartData = {
    packOpenings: [45, 52, 38, 65, 72, 58, 81],
    users: [12, 18, 15, 22, 28, 25, 32],
    revenue: [150, 180, 165, 210, 245, 198, 280],
  };

  const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function handleTimeRangeChange(range: AnalyticsTimeRange) {
    selectedTimeRange = range;
    setAnalyticsTimeRange(range);
    loadAnalytics();
  }

  async function loadAnalytics() {
    loading = true;
    setAnalyticsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    loading = false;
    setAnalyticsLoading(false);
  }

  onMount(() => {
    loadAnalytics();
  });
</script>

<div class="analytics-dashboard">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Analytics</h1>
      <p class="text-slate-400">Track site performance and user engagement</p>
    </div>

    <!-- Time Range Selector -->
    <div class="flex items-center gap-2 bg-slate-800 rounded-lg border border-slate-700 p-1">
      {#each timeRangeOptions as option}
        <button
          on:click={() => handleTimeRangeChange(option.value)}
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors {selectedTimeRange === option.value
            ? 'bg-blue-600 text-white'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'}"
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else}
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Pack Openings -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📦</span>
          </div>
          <span class="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12.5%</span>
        </div>
        <h3 class="text-3xl font-bold text-white mb-1">12,458</h3>
        <p class="text-sm text-slate-400">Pack Openings</p>
      </div>

      <!-- Active Users -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span class="text-2xl">👥</span>
          </div>
          <span class="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+8.3%</span>
        </div>
        <h3 class="text-3xl font-bold text-white mb-1">1,234</h3>
        <p class="text-sm text-slate-400">Active Users</p>
      </div>

      <!-- Revenue -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
          <span class="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+23.7%</span>
        </div>
        <h3 class="text-3xl font-bold text-white mb-1">$4,521</h3>
        <p class="text-sm text-slate-400">Revenue</p>
      </div>

      <!-- Security Violations -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⚠️</span>
          </div>
          <span class="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full">-5.2%</span>
        </div>
        <h3 class="text-3xl font-bold text-white mb-1">23</h3>
        <p class="text-sm text-slate-400">Violations</p>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Pack Openings Chart -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Pack Openings Over Time</h3>
        <div class="h-64 flex items-end justify-between gap-2">
          {#each chartData.packOpenings as value, index}
            <div class="flex-1 flex flex-col items-center gap-2">
              <div
                class="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-400"
                style="height: {(value / Math.max(...chartData.packOpenings)) * 100}%;"
              ></div>
              <span class="text-xs text-slate-400">{chartLabels[index]}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Revenue Over Time</h3>
        <div class="h-64 flex items-end justify-between gap-2">
          {#each chartData.revenue as value, index}
            <div class="flex-1 flex flex-col items-center gap-2">
              <div
                class="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-400"
                style="height: {(value / Math.max(...chartData.revenue)) * 100}%;"
              ></div>
              <span class="text-xs text-slate-400">{chartLabels[index]}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Rarity Breakdown -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Card Rarity Distribution</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {#each ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as rarity}
          <div class="text-center">
            <div class="w-full aspect-square bg-slate-700 rounded-lg flex items-center justify-center mb-2">
              <span class="text-3xl">{rarity === 'common'
                ? '⚪'
                : rarity === 'uncommon'
                ? '🔵'
                : rarity === 'rare'
                ? '🟡'
                : rarity === 'epic'
                ? '🟣'
                : rarity === 'legendary'
                ? '🟠'
                : '🩷'}</span>
            </div>
            <p class="text-sm font-medium text-white capitalize">{rarity}</p>
            <p class="text-xs text-slate-400">{rarity === 'common' ? '45%' : rarity === 'uncommon' ? '30%' : rarity === 'rare' ? '15%' : rarity === 'epic' ? '6%' : rarity === 'legendary' ? '3.5%' : '0.5%'}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
