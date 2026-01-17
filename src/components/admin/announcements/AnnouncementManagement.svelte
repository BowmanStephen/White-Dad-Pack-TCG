<script lang="ts">
  /**
   * Announcement Management Component
   *
   * Create and manage announcements displayed to users.
   * Moderator and Admin access.
   */

  import { hasRole } from '@/stores/admin';
  import type { Announcement, AnnouncementPriority, AnnouncementStatus } from '@/types';

  // Demo announcements data
  let announcements: Announcement[] = [
    {
      id: '1',
      title: 'Welcome to DadDeck™!',
      message: 'Start opening packs and build your collection today!',
      priority: 'low',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin',
    },
    {
      id: '2',
      title: 'New Season Coming Soon',
      message: 'Get ready for the Summer BBQ season with new cards!',
      priority: 'high',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      createdBy: 'admin',
    },
  ];

  let showCreateModal = false;
  let editingId: string | null = null;

  const priorityColors: Record<AnnouncementPriority, string> = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-amber-500/20 text-amber-400',
    urgent: 'bg-red-500/20 text-red-400',
  };

  const statusColors: Record<AnnouncementStatus, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    scheduled: 'bg-purple-500/20 text-purple-400',
    active: 'bg-green-500/20 text-green-400',
    expired: 'bg-red-500/20 text-red-400',
    archived: 'bg-slate-500/20 text-slate-500',
  };
</script>

<div class="announcement-management">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Announcements</h1>
      <p class="text-slate-400">Manage announcements shown to users</p>
    </div>
    <button
      on:click={() => showCreateModal = true}
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
    >
      <span>➕</span>
      <span>New Announcement</span>
    </button>
  </div>

  <!-- Announcements List -->
  <div class="space-y-4">
    {#each announcements as announcement}
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-white">{announcement.title}</h3>
              <span class="px-2 py-1 text-xs font-semibold rounded-full {priorityColors[announcement.priority]}">
                {announcement.priority}
              </span>
              <span class="px-2 py-1 text-xs font-semibold rounded-full {statusColors[announcement.status]}">
                {announcement.status}
              </span>
            </div>
            <p class="text-slate-300">{announcement.message}</p>
          </div>

          <div class="flex items-center gap-2 ml-4">
            <button
              class="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {#if announcement.status === 'active'}
              <button
                class="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Pause"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            {:else}
              <button
                class="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Activate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            {/if}
            <button
              class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-6 text-sm text-slate-400">
          <p>Created by <span class="text-white">{announcement.createdBy}</span></p>
          <p>{new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
            Math.floor((announcement.createdAt.getTime() - Date.now()) / 1000 / 60 / 60 / 24),
            'day'
          )}</p>
          {#if announcement.scheduledFor}
            <p>Scheduled for <span class="text-white">{announcement.scheduledFor.toLocaleDateString()}</span></p>
          {/if}
        </div>
      </div>
    {/each}

    {#if announcements.length === 0}
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
        <p class="text-slate-400">No announcements yet. Create your first announcement to get started!</p>
      </div>
    {/if}
  </div>

  <!-- Create Modal (simplified for demo) -->
  {#if showCreateModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 rounded-xl border border-slate-700 max-w-lg w-full p-6">
        <h2 class="text-xl font-bold text-white mb-4">New Announcement</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input
              type="text"
              placeholder="Announcement title..."
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Message</label>
            <textarea
              placeholder="Announcement message..."
              rows="3"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Target</label>
              <select
                class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="logged_in">Logged In</option>
                <option value="daddypass">DadPass Holders</option>
                <option value="new_users">New Users</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button
            on:click={() => showCreateModal = false}
            class="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Create Announcement
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
