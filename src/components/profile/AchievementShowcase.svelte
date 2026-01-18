<script lang="ts">
  import { onMount } from 'svelte';
  import { achievements } from '@/stores/achievements';
  import type { Achievement, AchievementRarity } from '@/types';
  import { ACHIEVEMENT_CATEGORIES } from '@/types';

  let unlockedAchievements = $state<Achievement[]>([]);
  let isLoading = $state(true);

  onMount(() => {
    // Load unlocked achievements
    const saved = localStorage.getItem('daddeck-achievements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        unlockedAchievements = parsed.unlocked || [];
      } catch (error) {
        console.error('[AchievementShowcase] Failed to load achievements:', error);
      }
    }
    isLoading = false;
  });

  // Group achievements by rarity
  $: achievementsByRarity = unlockedAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.rarity]) {
      acc[achievement.rarity] = [];
    }
    acc[achievement.rarity].push(achievement);
    return acc;
  }, {} as Record<AchievementRarity, Achievement[]>);

  // Rarity order for display
  const rarityOrder: AchievementRarity[] = ['platinum', 'gold', 'silver', 'bronze'];

  // Rarity colors
  const rarityColors = {
    bronze: { bg: '#cd7f32', border: '#e5a85c' },
    silver: { bg: '#c0c0c0', border: '#e0e0e0' },
    gold: { bg: '#ffd700', border: '#ffe55c' },
    platinum: { bg: '#e5e4e2', border: '#f0eff0' },
  };
</script>

<div class="achievement-showcase">
  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading achievements...</p>
    </div>
  {:else if unlockedAchievements.length === 0}
    <div class="empty-state">
      <span class="empty-icon">🏆</span>
      <p>No achievements yet! Start opening packs to unlock achievements.</p>
    </div>
  {:else}
    <div class="achievements-display">
      {#each rarityOrder as rarity}
        {@const rarityAchievements = achievementsByRarity[rarity]}
        {#if rarityAchievements && rarityAchievements.length > 0}
          <div class="rarity-group" style="--rarity-color: {rarityColors[rarity].bg}; --rarity-border: {rarityColors[rarity].border};">
            <h4 class="rarity-title">{rarity.charAt(0).toUpperCase() + rarity.slice(1)} Achievements</h4>
            <div class="achievement-grid">
              {#each rarityAchievements as achievement}
                <div
                  class="achievement-card"
                  title="{achievement.name}: {achievement.description}"
                >
                  <div class="achievement-icon">{achievement.icon}</div>
                  <div class="achievement-details">
                    <span class="achievement-name">{achievement.name}</span>
                    <span class="achievement-desc">{achievement.description}</span>
                  </div>
                  <div class="achievement-category">
                    {ACHIEVEMENT_CATEGORIES[achievement.category] || achievement.category}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .achievement-showcase {
    width: 100%;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    text-align: center;
    color: #6b7280;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
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

  .achievements-display {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .rarity-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .rarity-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: #374151;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid var(--rarity-color);
  }

  .achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .achievement-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
    border: 2px solid var(--rarity-border);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .achievement-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  .achievement-icon {
    font-size: 2.5rem;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .achievement-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .achievement-name {
    font-weight: 700;
    font-size: 1rem;
    color: #1f2937;
  }

  .achievement-desc {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.3;
  }

  .achievement-category {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--rarity-color);
    padding: 0.25rem 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .achievement-grid {
      grid-template-columns: 1fr;
    }

    .achievement-card {
      padding: 0.875rem;
    }

    .achievement-icon {
      font-size: 2rem;
    }
  }
</style>
