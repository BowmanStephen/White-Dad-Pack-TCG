<script lang="ts">
  /**
   * Admin Dashboard Content
   *
   * Main dashboard with overview statistics and quick actions.
   */

  import { onMount } from 'svelte';
  import { hasRole } from '@/stores/admin';
  import type { AnalyticsDashboardData, PackOpeningAnalytics, UserAnalytics, SecurityAnalytics } from '@/types';

  // Local state
  let loading = true;
  let error: string | null = null;
  let refreshInterval: number | null = null;

  // Dashboard data
  let stats = {
    totalCards: 0,
    totalUsers: 0,
    totalPacksOpened: 0,
    activeBans: 0,
  };

  let recentActivity = [
    { id: 1, type: 'pack_open', message: 'User opened a pack', time: '2 minutes ago' },
    { id: 2, type: 'rare_pull', message: 'Rare card pulled', time: '5 minutes ago' },
    { id: 3, type: 'user_joined', message: 'New user registered', time: '15 minutes ago' },
    { id: 4, type: 'violation', message: 'Security violation detected', time: '1 hour ago' },
  ];

  // Lifecycle
  onMount(async () => {
    await loadDashboardData();

    // Refresh every 30 seconds
    refreshInterval = window.setInterval(() => {
      loadDashboardData();
    }, 30000);
  });

  async function loadDashboardData() {
    try {
      loading = true;
      error = null;

      // In a real app, this would fetch from an API
      // For now, we'll simulate data
      await new Promise(resolve => setTimeout(resolve, 500));

      stats = {
        totalCards: 150,
        totalUsers: 1234,
        totalPacksOpened: 5678,
        activeBans: 12,
      };

      loading = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load dashboard';
      loading = false;
    }
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }
</script>

<div class="dashboard-content">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-white mb-2">Dashboard</h1>
    <p class="text-slate-400">Welcome back! Here's what's happening with DadDeck™.</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
      {error}
    </div>
  {:else}
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Cards -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🎴</span>
          </div>
          <span class="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+5%</span>
        </div>
        <h3 class="text-3xl font-bold text-white mb-1">{formatNumber(stats.totalCards)}</h3>
        <p class="text-sm text-slate-400">Total Cards</p>
      </div>

      <!-- Total Users -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span class="text-2xl">👥</span>
          </div>
          <span class="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12%</span>
        </div>
        <h3 class="text-3xl font-bold text-white mb-1">{formatNumber(stats.totalUsers)}</h3>
        <p class="text-sm text-slate-400">Total Users</p>
      </div>

      <!-- Packs Opened -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📦</span>
          </div>
          <span class="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+8%</span>
        </div>
        <h3 class="text-3xl font-bold text-white mb-1">{formatNumber(stats.totalPacksOpened)}</h3>
        <p class="text-sm text-slate-400">Packs Opened</p>
      </div>

      <!-- Active Bans -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🔒</span>
          </div>
          <span class="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-full">{stats.activeBans > 0 ? '+' : ''}{stats.activeBans}</span>
        </div>
        <h3 class="text-3xl font-bold text-white mb-1">{stats.activeBans}</h3>
        <p class="text-sm text-slate-400">Active Bans</p>
      </div>
    </div>

    <!-- Quick Actions -->
    {#if hasRole('admin')}
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/cards"
            class="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-6 transition-colors group"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-2xl">➕</span>
              </div>
              <div>
                <h3 class="font-semibold text-white">Add New Card</h3>
                <p class="text-sm text-slate-400">Create a new card</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/announcements"
            class="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-6 transition-colors group"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-2xl">📢</span>
              </div>
              <div>
                <h3 class="font-semibold text-white">New Announcement</h3>
                <p class="text-sm text-slate-400">Broadcast to users</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/users"
            class="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-6 transition-colors group"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-2xl">🔒</span>
              </div>
              <div>
                <h3 class="font-semibold text-white">Moderate Users</h3>
                <p class="text-sm text-slate-400">Manage violations</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    {/if}

    <!-- Recent Activity -->
    <div>
      <h2 class="text-lg font-semibold text-white mb-4">Recent Activity</h2>
      <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {#each recentActivity as activity}
          <div class="px-6 py-4 border-b border-slate-700 last:border-0 flex items-center gap-4 hover:bg-slate-700/50 transition-colors">
            <div class="w-2 h-2 rounded-full {activity.type === 'pack_open'
              ? 'bg-blue-500'
              : activity.type === 'rare_pull'
              ? 'bg-amber-500'
              : activity.type === 'user_joined'
              ? 'bg-green-500'
              : 'bg-red-500'}"></div>
            <div class="flex-1">
              <p class="text-white">{activity.message}</p>
              <p class="text-sm text-slate-400">{activity.time}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .dashboard-content {
    max-width: 1400px;
    margin: 0 auto;
  }
</style>
