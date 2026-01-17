<script lang="ts">
  /**
   * FriendActivityFeed.svelte
   *
   * Shows recent activities from friends like pack openings,
   * rare pulls, achievements, etc.
   */

  import { friendState, getFriendActivities, clearOldActivities } from '@/stores/friends';
  import { AVATARS } from '@/types';
  import { FRIEND_ACTIVITY_CONFIG } from '@/types';

  // Get recent activities (limit to 20)
  $: activities = getFriendActivities(20);

  // Format activity time
  function formatActivityTime(date: Date): string {
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

  // Get activity config
  function getActivityConfig(type: keyof typeof FRIEND_ACTIVITY_CONFIG) {
    return FRIEND_ACTIVITY_CONFIG[type];
  }
</script>

<div class="activity-feed">
  {#if activities.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>No Recent Activity</h3>
      <p>When your friends do cool stuff, you'll see it here!</p>
    </div>
  {:else}
    <div class="activities-list">
      {#each activities as activity (activity.id)}
        {@const config = getActivityConfig(activity.type)}
        <div class="activity-item">
          <!-- Friend avatar -->
          <div class="activity-avatar">
            {AVATARS[activity.avatarId]?.emoji || '👤'}
          </div>

          <!-- Activity content -->
          <div class="activity-content">
            <p class="activity-text">
              <span class="activity-name">{activity.username}</span>
              <span class="activity-action" style:color={config.color}>
                {config.icon} {config.title}
              </span>

              {#if activity.type === 'opened_pack'}
                <span class="activity-detail">
                  ({activity.details.cardCount} cards)
                </span>
              {:else if activity.type === 'rare_pull' || activity.type === 'epic_pull' || activity.type === 'legendary_pull' || activity.type === 'mythic_pull'}
                <span class="activity-detail rarity-{activity.details.cardRarity}">
                  "{activity.details.cardName}"
                  {#if activity.details.isHolo}
                    ✨
                  {/if}
                </span>
              {:else if activity.type === 'achievement_unlocked'}
                <span class="activity-detail">
                  "{activity.details.achievementName}"
                </span>
              {:else if activity.type === 'badge_unlocked'}
                <span class="activity-detail">
                  "{activity.details.badgeName}"
                </span>
              {:else if activity.type === 'level_up'}
                <span class="activity-detail">
                  "{activity.details.cardName}" to level {activity.details.newLevel}
                </span>
              {/if}
            </p>
            <p class="activity-time">{formatActivityTime(activity.timestamp)}</p>
          </div>

          <!-- Activity icon -->
          <div class="activity-icon" style:background={config.color} style:box-shadow="0 0 10px {config.color}">
            {config.icon}
          </div>
        </div>
      {/each}
    </div>

    <!-- Clear old activities button -->
    {#if activities.length > 10}
      <button class="btn-clear" on:click={() => clearOldActivities(7)}>
        Clear activities older than 7 days
      </button>
    {/if}
  {/if}
</div>

<style>
  .activity-feed {
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
    font-size: 0.875rem;
    margin: 0;
  }

  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #3b82f6;
    border-radius: 0.5rem;
    padding: 0.75rem;
    position: relative;
    overflow: hidden;
  }

  .activity-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #3b82f6 0%, #1e40af 100%);
  }

  .activity-avatar {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .activity-content {
    flex: 1;
    min-width: 0;
  }

  .activity-text {
    font-size: 0.875rem;
    color: #d1d5db;
    margin: 0 0 0.25rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .activity-name {
    font-weight: 600;
    color: #ffffff;
  }

  .activity-action {
    font-weight: 600;
  }

  .activity-detail {
    color: #fbbf24;
    font-style: italic;
  }

  .activity-detail.rarity-rare {
    color: #fbbf24;
  }

  .activity-detail.rarity-epic {
    color: #a855f7;
  }

  .activity-detail.rarity-legendary {
    color: #f97316;
  }

  .activity-detail.rarity-mythic {
    color: #ec4899;
    text-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
  }

  .activity-time {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }

  .activity-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    background: #3b82f6;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .btn-clear {
    width: 100%;
    margin-top: 1rem;
    background: transparent;
    border: 1px solid #3b82f6;
    border-radius: 0.375rem;
    padding: 0.625rem;
    color: #9ca3af;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-clear:hover {
    background: rgba(59, 130, 246, 0.2);
    color: #ffffff;
  }

  @media (max-width: 640px) {
    .activity-item {
      padding: 0.625rem;
    }

    .activity-avatar {
      width: 2rem;
      height: 2rem;
      font-size: 1rem;
    }

    .activity-icon {
      width: 1.5rem;
      height: 1.5rem;
      font-size: 0.875rem;
    }

    .activity-text {
      font-size: 0.8125rem;
    }
  }
</style>
