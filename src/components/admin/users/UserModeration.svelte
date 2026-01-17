<script lang="ts">
  /**
   * User Moderation Component
   *
   * Moderate users, view activity, issue bans/warnings.
   * Moderator and Admin access.
   */

  import type { ModeratableUser, ModerationAction, ModerationStatus } from '@/types';

  // Demo users data
  let users: ModeratableUser[] = [
    {
      playerId: 'user_001',
      username: 'GrillMaster42',
      pseudonym: 'Gary 🍖',
      avatarId: 'grill_master',
      status: 'clean',
      joinedAt: new Date('2024-01-01'),
      lastActive: new Date(),
      stats: {
        packsOpened: 156,
        reportsReceived: 0,
        warningsReceived: 0,
      },
      securityViolations: 0,
      notes: '',
    },
    {
      playerId: 'user_002',
      username: 'SuspiciousUser',
      pseudonym: 'John 👤',
      avatarId: 'office_worker',
      status: 'warned',
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      stats: {
        packsOpened: 523,
        reportsReceived: 3,
        warningsReceived: 1,
      },
      securityViolations: 5,
      notes: 'Multiple reports for suspicious activity',
    },
    {
      playerId: 'user_003',
      username: 'BannedUser',
      pseudonym: 'Cheater 😈',
      avatarId: 'couch_potato',
      status: 'banned',
      joinedAt: new Date('2024-01-10'),
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      stats: {
        packsOpened: 2048,
        reportsReceived: 15,
        warningsReceived: 2,
      },
      securityViolations: 23,
      notes: 'Client manipulation detected',
    },
  ];

  let searchQuery = '';
  let statusFilter: ModerationStatus | null = null;
  let selectedUserId: string | null = null;
  let showActionModal = false;

  const statusColors: Record<ModerationStatus, string> = {
    clean: 'bg-green-500/20 text-green-400',
    warned: 'bg-amber-500/20 text-amber-400',
    muted: 'bg-blue-500/20 text-blue-400',
    suspended: 'bg-purple-500/20 text-purple-400',
    banned: 'bg-red-500/20 text-red-400',
  };

  $: filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.pseudonym.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
</script>

<div class="user-moderation">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white">User Moderation</h1>
      <p class="text-slate-400">View user activity and issue moderation actions</p>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Search Users</label>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search by username or pseudonym..."
          class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Status Filter</label>
        <select
          bind:value={statusFilter}
          class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="clean">Clean</option>
          <option value="warned">Warned</option>
          <option value="muted">Muted</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Users List -->
  <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Activity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Violations</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700">
          {#each filteredUsers as user}
            <tr class="hover:bg-slate-700/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                    <span class="text-xl">👤</span>
                  </div>
                  <div>
                    <p class="font-medium text-white">{user.username}</p>
                    <p class="text-sm text-slate-400">{user.pseudonym}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full {statusColors[user.status]}">
                  {user.status}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <p class="text-sm text-slate-300">{user.stats.packsOpened} packs opened</p>
                  <p class="text-sm text-slate-400">Last active {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                    Math.floor((user.lastActive.getTime() - Date.now()) / 1000 / 60),
                    'minute'
                  )}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <p class="text-sm text-slate-300">{user.securityViolations} violations</p>
                  <p class="text-sm {user.stats.reportsReceived > 0 ? 'text-amber-400' : 'text-slate-400'}">
                    {user.stats.reportsReceived} reports
                  </p>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  {#if user.status !== 'banned'}
                    <button
                      class="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Ban
                    </button>
                  {:else}
                    <button
                      class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Unban
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if filteredUsers.length === 0}
      <div class="px-6 py-12 text-center">
        <p class="text-slate-400">No users found matching your filters.</p>
      </div>
    {/if}
  </div>

  <!-- Stats Summary -->
  <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <p class="text-sm text-slate-400">Total Users</p>
      <p class="text-2xl font-bold text-white">{users.length}</p>
    </div>
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <p class="text-sm text-slate-400">Clean Status</p>
      <p class="text-2xl font-bold text-green-400">{users.filter(u => u.status === 'clean').length}</p>
    </div>
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <p class="text-sm text-slate-400">Action Required</p>
      <p class="text-2xl font-bold text-amber-400">{users.filter(u => ['warned', 'muted'].includes(u.status)).length}</p>
    </div>
    <div class="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <p class="text-sm text-slate-400">Banned</p>
      <p class="text-2xl font-bold text-red-400">{users.filter(u => u.status === 'banned').length}</p>
    </div>
  </div>
</div>
