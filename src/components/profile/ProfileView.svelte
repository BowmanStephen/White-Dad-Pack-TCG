<script lang="ts">
  import { profile, viewMode, toggleEditMode } from '@/stores/profile';
  import { BADGE_RARITY_CONFIG, BADGE_CATEGORY_NAMES, type BadgeCategory } from '@/types';
  import { getAllCards } from '@/lib/cards/database';
  import type { Badge } from '@/types';

  // Get profile data
  $: currentProfile = $profile;

  // Get avatar emoji
  $: avatarEmoji = currentProfile ? getEmojiForAvatar(currentProfile.avatarId) : '🍖';

  function getEmojiForAvatar(avatarId: string): string {
    const avatars: Record<string, string> = {
      grill_master: '🍖',
      fix_it: '🔧',
      golf_pro: '⛳',
      couch_potato: '🛋️',
      lawn_care: '🌱',
      car_guy: '🚗',
      office_worker: '💼',
      cool_dad: '😎',
      coach: '🏆',
      chef_dad: '👨‍🍳',
    };
    return avatars[avatarId] || '🍖';
  }

  // Get favorite card
  const allCards = getAllCards();
  $: favoriteCard = currentProfile?.favoriteCardId
    ? allCards.find((c) => c.id === currentProfile.favoriteCardId)
    : null;

  // Group badges by category
  $: badgesByCategory = currentProfile?.badges
    ? currentProfile.badges.reduce((acc, badge) => {
        if (!acc[badge.category]) {
          acc[badge.category] = [];
        }
        acc[badge.category].push(badge);
        return acc;
      }, {} as Record<BadgeCategory, Badge[]>)
    : {};

  // Handle edit button click
  function handleEdit() {
    toggleEditMode();
  }

  function getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: '#9ca3af',
      uncommon: '#60a5fa',
      rare: '#fbbf24',
      epic: '#a855f7',
      legendary: '#f97316',
      mythic: '#ec4899',
    };
    return colors[rarity] || '#9ca3af';
  }

  function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
</script>

<div class="profile-view">
  <!-- Profile Header -->
  <div class="profile-header-section mb-8">
    <div class="profile-banner rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-4 right-4 text-8xl">🎴</div>
        <div class="absolute bottom-4 left-4 text-6xl">⭐</div>
        <div class="absolute top-1/2 right-1/4 text-4xl">🔥</div>
      </div>

      <!-- Profile content -->
      <div class="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <!-- Avatar -->
        <div class="profile-avatar-container">
          <div class="profile-avatar w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-6xl shadow-2xl border-4 border-white/20">
            {avatarEmoji}
          </div>
        </div>

        <!-- Profile Info -->
        <div class="profile-info flex-1 text-center sm:text-left">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h1 class="text-3xl font-bold text-white">
              {currentProfile?.username || 'Anonymous Dad'}
            </h1>
            <span class="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm">
              {currentProfile?.pseudonym || 'New Dad 🍖'}
            </span>
          </div>

          {#if currentProfile?.bio}
            <p class="text-white/90 mb-4 max-w-2xl">
              {currentProfile.bio}
            </p>
          {/if}

          <!-- Stats Row -->
          <div class="stats-row flex flex-wrap gap-4 justify-center sm:justify-start">
            <div class="stat-item">
              <span class="stat-value text-orange-300 font-bold">{currentProfile?.stats.totalPacksOpened || 0}</span>
              <span class="stat-label text-white/70 text-sm ml-1">Packs</span>
            </div>
            <div class="stat-item">
              <span class="stat-value text-blue-300 font-bold">{currentProfile?.stats.uniqueCards || 0}</span>
              <span class="stat-label text-white/70 text-sm ml-1">Unique</span>
            </div>
            <div class="stat-item">
              <span class="stat-value text-purple-300 font-bold">{currentProfile?.badges.length || 0}</span>
              <span class="stat-label text-white/70 text-sm ml-1">Badges</span>
            </div>
            <div class="stat-item">
              <span class="stat-value text-green-300 font-bold">{currentProfile?.friends.length || 0}</span>
              <span class="stat-label text-white/70 text-sm ml-1">Friends</span>
            </div>
          </div>

          <!-- Edit Button -->
          <button
            on:click={handleEdit}
            class="edit-button mt-4 px-6 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-all"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Favorite Card Section -->
  {#if favoriteCard}
    <div class="favorite-card-section mb-8">
      <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>⭐</span> Favorite Card
      </h2>
      <div class="favorite-card-display p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
        <div class="favorite-card-content flex flex-col md:flex-row gap-6 items-center">
          <!-- Card Image -->
          <div class="card-image-wrapper flex-shrink-0">
            <img
              src={favoriteCard.artwork}
              alt={favoriteCard.name}
              class="w-48 h-64 rounded-lg shadow-2xl object-cover"
            />
          </div>

          <!-- Card Details -->
          <div class="card-details flex-1 text-center md:text-left">
            <div class="card-rarity-badge inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
              style="background-color: {getRarityColor(favoriteCard.rarity)}; color: white;"
            >
              {capitalizeFirst(favoriteCard.rarity)}
            </div>
            <h3 class="card-name text-2xl font-bold text-white mb-2">{favoriteCard.name}</h3>
            <p class="card-subtitle text-gray-400 mb-4">{favoriteCard.subtitle}</p>
            <p class="card-flavor text-gray-300 italic">"{favoriteCard.flavorText}"</p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Badges Section -->
  {#if currentProfile?.badges && currentProfile.badges.length > 0}
    <div class="badges-section">
      <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🏅</span> Badges ({currentProfile.badges.length})
      </h2>

      {#each Object.keys(badgesByCategory) as category}
        {@const categoryBadges = badgesByCategory[category as BadgeCategory]}
        {#if categoryBadges.length > 0}
          <div class="badge-category mb-6">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {BADGE_CATEGORY_NAMES[category as BadgeCategory]}
            </h3>
            <div class="badges-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {#each categoryBadges as badge}
                <div
                  class="badge-item p-4 rounded-lg border-2 transition-all hover:scale-105"
                  style="background-color: {BADGE_RARITY_CONFIG[badge.rarity].bgColor}; border-color: {BADGE_RARITY_CONFIG[badge.rarity].borderColor};"
                  title={badge.description}
                >
                  <div class="badge-icon text-4xl mb-2">{badge.icon}</div>
                  <div class="badge-name text-sm font-semibold text-white mb-1">
                    {badge.name}
                  </div>
                  <div class="badge-description text-xs text-gray-400 line-clamp-2">
                    {badge.description}
                  </div>
                  {#if badge.unlockedAt}
                    <div class="badge-date text-xs text-gray-500 mt-2">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <!-- No Badges State -->
    <div class="no-badges-state p-8 rounded-xl bg-white/5 border border-white/10 text-center">
      <div class="no-badges-icon text-5xl mb-3">🏅</div>
      <h3 class="text-lg font-semibold text-white mb-2">No Badges Yet</h3>
      <p class="text-gray-400 text-sm">Open packs and play to unlock achievements!</p>
    </div>
  {/if}
</div>

<style>
  .profile-view {
    animation: fadeIn 0.4s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .profile-avatar {
    animation: pulse 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .badge-item {
    cursor: pointer;
  }

  .badge-item:hover {
    box-shadow: 0 4px 20px var(--badge-glow);
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
