<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, getCollectionStats } from '@/stores/collection';
  import { achievements } from '@/stores/achievements';
  import type { PlayerProfile, AvatarId, Badge } from '@/types';
  import { AVATARS, PROFILE_BADGES, BADGE_RARITY_CONFIG, BADGE_CATEGORY_NAMES } from '@/types';
  import ProfileEditor from './ProfileEditor.svelte';
  import BadgeGrid from './BadgeGrid.svelte';
  import StatsDisplay from './StatsDisplay.svelte';
  import AchievementShowcase from './AchievementShowcase.svelte';
  import PlayHistory from './PlayHistory.svelte';

  // Profile state
  let profile = $state<PlayerProfile | null>(null);
  let isEditing = $state(false);
  let isLoading = $state(true);

  // Load or initialize profile on mount
  onMount(async () => {
    try {
      const savedProfile = localStorage.getItem('daddeck-profile');
      if (savedProfile) {
        profile = JSON.parse(savedProfile, (key, value) => {
          // Revive Date objects
          if (key.endsWithWith('At') || key === 'createdAt' || key === 'updatedAt') {
            return new Date(value);
          }
          return value;
        });
      } else {
        // Initialize new profile
        profile = createDefaultProfile();
        saveProfile(profile);
      }
    } catch (error) {
      console.error('[Profile] Failed to load profile:', error);
      profile = createDefaultProfile();
    } finally {
      isLoading = false;
    }
  });

  // Create default profile from collection data
  function createDefaultProfile(): PlayerProfile {
    const coll = collection.get();
    const stats = getCollectionStats();

    return {
      playerId: crypto.randomUUID(),
      pseudonym: 'Anonymous Dad',
      username: 'Dad_' + Math.random().toString(36).substring(2, 8),
      avatarId: 'grill_master',
      bio: 'Just another dad collecting cards.',
      favoriteCardId: null,
      badges: calculateBadges(stats.totalPacks, achievements.get()),
      stats: {
        // Map CollectionStats.totalPacks → PlayerStats.totalPacksOpened
        totalPacksOpened: stats.totalPacks,
        totalCards: stats.totalCards,
        uniqueCards: stats.uniqueCards,
        rarePulls: stats.rarePulls,
        epicPulls: stats.epicPulls,
        legendaryPulls: stats.legendaryPulls,
        mythicPulls: stats.mythicPulls,
        holoPulls: stats.holoPulls,
        collectionValue: calculateCollectionValue(),
      },
      friends: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Calculate badges based on achievements and stats
  function calculateBadges(packsOpened: number, unlockedAchievements: string[]): Badge[] {
    const badges: Badge[] = [];

    for (const badgeDef of PROFILE_BADGES) {
      let unlocked = false;
      let progress = 0;

      switch (badgeDef.id) {
        case 'collector_starter':
          unlocked = packsOpened >= 1;
          progress = Math.min(packsOpened, 1);
          break;
        case 'collector_10':
          unlocked = packsOpened >= 10;
          progress = Math.min(packsOpened, 10);
          break;
        case 'collector_50':
          unlocked = packsOpened >= 50;
          progress = Math.min(packsOpened, 50);
          break;
        case 'collector_100':
          unlocked = packsOpened >= 100;
          progress = Math.min(packsOpened, 100);
          break;
        case 'achievement_first':
          unlocked = unlockedAchievements.length >= 1;
          progress = Math.min(unlockedAchievements.length, 1);
          break;
        case 'achievement_10':
          unlocked = unlockedAchievements.length >= 10;
          progress = Math.min(unlockedAchievements.length, 10);
          break;
        case 'season_1_veteran':
          unlocked = true; // Auto-unlock for season 1 players
          progress = 1;
          break;
        default:
          unlocked = false;
          progress = 0;
      }

      if (unlocked || progress > 0) {
        badges.push({
          ...badgeDef,
          unlockedAt: unlocked ? new Date() : undefined,
          progress,
          maxProgress: badgeDef.maxProgress || 1,
        });
      }
    }

    return badges;
  }

  // Calculate collection value (simple version)
  function calculateCollectionValue(): number {
    const coll = collection.get();
    const rarityValues = { common: 1, uncommon: 3, rare: 10, epic: 25, legendary: 100, mythic: 500 };

    let value = 0;
    for (const pack of coll.packs) {
      for (const card of pack.cards) {
        let cardValue = rarityValues[card.rarity];
        if (card.isHolo) cardValue *= 2;
        value += cardValue;
      }
    }

    return value;
  }

  // Save profile to localStorage
  function saveProfile(updatedProfile: PlayerProfile) {
    profile = updatedProfile;
    localStorage.setItem('daddeck-profile', JSON.stringify(profile));
  }

  // Handle profile update from editor
  function handleProfileUpdate(updatedSettings: Partial<PlayerProfile>) {
    if (profile) {
      saveProfile({
        ...profile,
        ...updatedSettings,
        updatedAt: new Date(),
      });
      isEditing = false;
    }
  }

  // Get current avatar
  const currentAvatar = $derived(profile ? AVATARS[profile.avatarId] : null);

  // Get unlocked badges
  const unlockedBadges = $derived(profile?.badges.filter(b => b.unlockedAt) || []);
  const inProgressBadges = $derived(profile?.badges.filter(b => !b.unlockedAt && b.progress && b.progress > 0) || []);
</script>

<div class="profile-container">
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>
  {:else if profile}
    <div class="profile-content">
      <!-- Profile Header -->
      <section class="profile-header">
        <div class="avatar-section">
          <div class="avatar-display">
            <span class="avatar-emoji">{currentAvatar?.emoji || '👤'}</span>
            <div class="avatar-glow"></div>
          </div>
          <div class="username-section">
            <h2 class="username">{profile.pseudonym}</h2>
            <p class="display-name">@{profile.username}</p>
            {#if profile.bio}
              <p class="bio">{profile.bio}</p>
            {/if}
          </div>
          <button
            class="edit-btn btn-secondary"
            on:click={() => isEditing = true}
            aria-label="Edit profile"
          >
            ✏️ Edit Profile
          </button>
        </div>

        <!-- Profile Meta -->
        <div class="profile-meta">
          <div class="meta-item">
            <span class="meta-label">Member Since</span>
            <span class="meta-value">{new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Last Updated</span>
            <span class="meta-value">{new Date(profile.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      <!-- Collection Stats -->
      <section class="stats-section">
        <h3>Collection Stats</h3>
        <StatsDisplay stats={profile.stats} />
      </section>

      <!-- Badges -->
      <section class="badges-section">
        <h3>Badges</h3>
        {#if unlockedBadges.length > 0}
          <BadgeGrid badges={unlockedBadges} />
        {:else}
          <p class="empty-state">No badges earned yet. Open more packs to earn badges!</p>
        {/if}

        {#if inProgressBadges.length > 0}
          <div class="in-progress">
            <h4>In Progress</h4>
            <div class="progress-grid">
              {#each inProgressBadges as badge}
                <div class="badge-progress">
                  <span class="badge-icon">{badge.icon}</span>
                  <div class="progress-info">
                    <span class="badge-name">{badge.name}</span>
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        style="width: {(badge.progress! / badge.maxProgress!) * 100}%; background: {BADGE_RARITY_CONFIG[badge.rarity].color};"
                      ></div>
                    </div>
                    <span class="progress-text">{badge.progress} / {badge.maxProgress}</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </section>

      <!-- Achievement Showcase -->
      <section class="achievements-section">
        <h3>Achievement Showcase</h3>
        <AchievementShowcase />
      </section>

      <!-- Play History -->
      <section class="history-section">
        <h3>Play History</h3>
        <PlayHistory />
      </section>
    </div>
  {/if}
</div>

<!-- Profile Editor Modal -->
{#if isEditing && profile}
  <div class="modal-overlay" on:click={() => isEditing = false}>
    <div class="modal-content" on:click|stopPropagation>
      <ProfileEditor
        {profile}
        onSave={handleProfileUpdate}
        onCancel={() => isEditing = false}
      />
    </div>
  </div>
{/if}

<style>
  .profile-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #6b7280;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .profile-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* Profile Header */
  .profile-header {
    background: white;
    dark:bg-gray-900;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .avatar-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .avatar-display {
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .avatar-emoji {
    font-size: 4rem;
    line-height: 1;
  }

  .avatar-glow {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.3;
    filter: blur(8px);
    z-index: -1;
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
  }

  .username-section {
    flex: 1;
  }

  .username {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.25rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .display-name {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0 0 0.5rem 0;
  }

  .bio {
    font-size: 1rem;
    color: #4b5563;
    margin: 0;
    line-height: 1.5;
  }

  .edit-btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .edit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
  }

  .profile-meta {
    display: flex;
    gap: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .meta-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .meta-value {
    font-size: 1rem;
    font-weight: 500;
    color: #1f2937;
  }

  /* Sections */
  .stats-section,
  .badges-section,
  .achievements-section,
  .history-section {
    background: white;
    dark:bg-gray-900;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 1.5rem 0;
    color: #1f2937;
  }

  .empty-state {
    color: #6b7280;
    font-style: italic;
    text-align: center;
    padding: 2rem;
  }

  /* In Progress Badges */
  .in-progress {
    margin-top: 2rem;
  }

  .in-progress h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #374151;
  }

  .progress-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .badge-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .badge-icon {
    font-size: 2rem;
    line-height: 1;
  }

  .progress-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .badge-name {
    font-weight: 600;
    color: #1f2937;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .progress-text {
    font-size: 0.875rem;
    color: #6b7280;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .avatar-section {
      flex-direction: column;
      text-align: center;
    }

    .username {
      font-size: 1.5rem;
    }

    .profile-meta {
      flex-direction: column;
      gap: 1rem;
    }

    .progress-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
