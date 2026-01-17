<script lang="ts">
  import { onMount } from 'svelte';
  import { profile, viewMode, initializeProfile, checkAndUnlockBadges, getAvatar } from '@/stores/profile';
  import { collection, getCollectionStats } from '@/stores/collection';
  import ProfileView from './ProfileView.svelte';
  import ProfileEditor from './ProfileEditor.svelte';
  import type { PlayerStats } from '@/types/leaderboard';

  // Initialize profile on mount
  onMount(async () => {
    const currentProfile = profile.get();

    if (!currentProfile) {
      // Initialize profile from collection stats
      const stats = getCollectionStats();
      const profileStats: PlayerStats = {
        totalPacksOpened: stats.totalPacks,
        uniqueCards: stats.uniqueCards,
        mythicCards: stats.mythicPulls,
        totalCards: stats.totalCards,
        lastActive: new Date(),
        joinedAt: new Date(),
      };

      initializeProfile(profileStats);

      // Check for initial badges
      checkAndUnlockBadges();
    } else {
      // Update stats and check badges
      const stats = getCollectionStats();
      profile.updateStats({
        totalPacksOpened: stats.totalPacks,
        uniqueCards: stats.uniqueCards,
        mythicCards: stats.mythicPulls,
        totalCards: stats.totalCards,
      });

      checkAndUnlockBadges();
    }
  });

  // Get current view mode
  $: currentViewMode = $viewMode;
</script>

<div class="profile-page-container">
  {#if $profile}
    {#if currentViewMode === 'view'}
      <ProfileView />
    {:else}
      <ProfileEditor />
    {/if}
  {:else}
    <!-- Loading State -->
    <div class="loading-state flex flex-col items-center justify-center py-12">
      <div class="loading-spinner text-4xl mb-4">🎴</div>
      <h3 class="text-lg font-semibold text-white mb-2">Loading Profile...</h3>
      <p class="text-gray-400 text-sm">Setting up your dad identity</p>
    </div>
  {/if}
</div>

<style>
  .profile-page-container {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .loading-spinner {
    animation: bounce 1s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>
