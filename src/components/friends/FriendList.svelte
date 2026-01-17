<script lang="ts">
  /**
   * FriendList.svelte
   *
   * Displays a list of friends with online status, quick actions,
   * and ability to view friend profiles.
   */

  import { friendState, removeFriend } from '@/stores/friends';
  import { AVATARS } from '@/types';
  import { getAvatar } from '@/stores/profile';

  // View friend details
  function viewFriend(playerId: string) {
    window.location.href = `/friends/${playerId}`;
  }

  // Remove friend with confirmation
  async function confirmRemoveFriend(playerId: string, username: string) {
    if (confirm(`Remove ${username} from your friends list?`)) {
      await removeFriend(playerId);
    }
  }

  // Format last active time
  function formatLastActive(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  // Get online status indicator class
  function getOnlineStatusClass(isOnline: boolean): string {
    return isOnline
      ? 'bg-green-500'
      : 'bg-gray-400';
  }
</script>

<div class="friend-list">
  {#if $friendState.friends.length === 0}
    <div class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>No Friends Yet</h3>
      <p>Use your friend code or search to add friends!</p>
      <p class="friend-code-hint">Your code: <code>DAD-XXXXXX</code></p>
    </div>
  {:else}
    <div class="friends-grid">
      {#each $friendState.friends as friend (friend.playerId)}
        <div class="friend-card" class:online={friend.isOnline}>
          <!-- Avatar with online status -->
          <div class="friend-avatar-container">
            <div class="friend-avatar">
              {AVATARS[friend.avatarId]?.emoji || '👤'}
            </div>
            <div class="online-indicator {getOnlineStatusClass(friend.isOnline)}"></div>
          </div>

          <!-- Friend info -->
          <div class="friend-info">
            <h4 class="friend-name">{friend.username || friend.pseudonym}</h4>
            <p class="friend-bio">{friend.bio || 'No bio yet'}</p>
            <p class="friend-last-active">
              {friend.isOnline ? 'Online now' : formatLastActive(friend.lastActive)}
            </p>
          </div>

          <!-- Stats preview -->
          <div class="friend-stats">
            <div class="stat">
              <span class="stat-icon">📦</span>
              <span class="stat-value">{friend.stats.totalPacksOpened}</span>
            </div>
            <div class="stat">
              <span class="stat-icon">💎</span>
              <span class="stat-value">{friend.stats.uniqueCards}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="friend-actions">
            <button
              class="btn-view"
              on:click={() => viewFriend(friend.playerId)}
              title="View profile"
            >
              👁️ View
            </button>
            <button
              class="btn-remove"
              on:click={() => confirmRemoveFriend(friend.playerId, friend.username)}
              title="Remove friend"
            >
              🗑️
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .friend-list {
    width: 100%;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #9ca3af;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    color: #ffffff;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    margin-bottom: 0.5rem;
  }

  .friend-code-hint {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .friend-code-hint code {
    background: #1f2937;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-family: monospace;
    color: #60a5fa;
  }

  .friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .friend-card {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border: 2px solid #3b82f6;
    border-radius: 0.75rem;
    padding: 1rem;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .friend-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    border-color: #60a5fa;
  }

  .friend-card.online {
    border-color: #22c55e;
  }

  .friend-avatar-container {
    position: relative;
    width: fit-content;
    margin-bottom: 0.75rem;
  }

  .friend-avatar {
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    border: 3px solid #3b82f6;
  }

  .online-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 2px solid #1e3a8a;
  }

  .friend-info {
    margin-bottom: 0.75rem;
  }

  .friend-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 0.25rem 0;
  }

  .friend-bio {
    font-size: 0.875rem;
    color: #d1d5db;
    margin: 0 0 0.25rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .friend-last-active {
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0;
  }

  .friend-stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-icon {
    font-size: 0.875rem;
  }

  .stat-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #fbbf24;
  }

  .friend-actions {
    display: flex;
    gap: 0.5rem;
  }

  .friend-actions button {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-view {
    background: #3b82f6;
    color: #ffffff;
  }

  .btn-view:hover {
    background: #2563eb;
  }

  .btn-remove {
    background: #dc2626;
    color: #ffffff;
    flex: 0 0 auto;
    width: 2.5rem;
  }

  .btn-remove:hover {
    background: #b91c1c;
  }

  @media (max-width: 640px) {
    .friends-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
