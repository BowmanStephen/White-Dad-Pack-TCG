<script lang="ts">
  import AchievementCard from './AchievementCard.svelte';
  import type { Achievement, AchievementCategory } from '@/types';
  import { t } from '@/i18n';

  // Props
  interface Props {
    achievements: Achievement[];
  }

  let { achievements }: Props = $props();

  // UI State
  let selectedCategory = $state<AchievementCategory | 'all'>('all');
  let completionFilter = $state<'all' | 'completed' | 'incomplete'>('all');

  // Categories list (including "all" option)
  const categories: (AchievementCategory | 'all')[] = [
    'all',
    'collection',
    'battle',
    'social',
    'special',
  ];

  // Filter achievements by category and completion
  let filteredAchievements = $derived(achievements.filter(achievement => {
    // Category filter
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;

    // Completion filter
    let completionMatch = true;
    if (completionFilter === 'completed') {
      completionMatch = achievement.unlockedAt !== undefined;
    } else if (completionFilter === 'incomplete') {
      completionMatch = achievement.unlockedAt === undefined;
    }

    return categoryMatch && completionMatch;
  }));

  // Group achievements by category
  let groupedAchievements = $derived(categories
    .filter(cat => cat !== 'all')
    .map(category => ({
      category: category as AchievementCategory,
      name: t(`achievements.categories.${category}`),
      achievements: filteredAchievements.filter(a => a.category === category),
    }))
    .filter(group => group.achievements.length > 0)
  );

  // Calculate stats
  let totalAchievements = $derived(achievements.length);
  let unlockedCount = $derived(achievements.filter(a => a.unlockedAt).length);
  let completionPercent = $derived(totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0);
</script>

<div class="achievement-list">
  <!-- Stats Bar -->
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-value">{unlockedCount.value}</span>
      <span class="stat-label">/ {totalAchievements.value}</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{completionPercent.value}%</span>
      <span class="stat-label">{t('achievements.complete')}</span>
    </div>
  </div>

  <!-- Category Tabs -->
  <div class="category-tabs">
    {#each categories as category}
      {@const isActive = selectedCategory === category}
      {@const displayName = category === 'all' ? t('common.all') : t(`achievements.categories.${category}`)}

      <button
        class="category-tab"
        class:active={isActive}
        onclick={() => selectedCategory = category}
      >
        {displayName}
      </button>
    {/each}
  </div>

  <!-- Completion Filter -->
  <div class="completion-filter">
    <button
      class="filter-btn"
      class:active={completionFilter === 'all'}
      onclick={() => completionFilter = 'all'}
    >
      {t('common.all')}
    </button>
    <button
      class="filter-btn"
      class:active={completionFilter === 'completed'}
      onclick={() => completionFilter = 'completed'}
    >
      {t('achievements.unlocked')}
    </button>
    <button
      class="filter-btn"
      class:active={completionFilter === 'incomplete'}
      onclick={() => completionFilter = 'incomplete'}
    >
      {t('achievements.locked')}
    </button>
  </div>

  <!-- Achievements Display -->
  {#if selectedCategory === 'all'}
    <!-- Show grouped by category -->
    {#each groupedAchievements.value as group (group.category)}
      <div class="category-section">
        <h2 class="category-title">{group.name}</h2>
        <div class="achievements-grid">
          {#each group.achievements as achievement (achievement.id)}
            <AchievementCard {achievement} />
          {/each}
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <p class="empty-icon">🏆</p>
        <p class="empty-text">No achievements found</p>
      </div>
    {/each}
  {:else}
    <!-- Show single category -->
    <div class="achievements-grid">
      {#each filteredAchievements.value as achievement (achievement.id)}
        <AchievementCard {achievement} />
      {:else}
        <div class="empty-state">
          <p class="empty-icon">🏆</p>
          <p class="empty-text">No achievements found</p>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .achievement-list {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  /* Stats Bar */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 40px;
    padding: 20px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 12px;
    border: 2px solid #2a2a4e;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .stat-item {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 14px;
    color: #a0a0a0;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Category Tabs */
  .category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
    padding: 8px;
    background: rgba(26, 26, 46, 0.8);
    border-radius: 12px;
    border: 1px solid #2a2a4e;
  }

  .category-tab {
    flex: 1;
    min-width: 120px;
    padding: 12px 16px;
    background: rgba(42, 42, 78, 0.6);
    border: 2px solid transparent;
    border-radius: 8px;
    color: #b0b0b0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .category-tab:hover {
    background: rgba(58, 58, 98, 0.8);
    border-color: #3a3a68;
    color: #e0e0e0;
    transform: translateY(-1px);
  }

  .category-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #8b9ef0;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  /* Completion Filter */
  .completion-filter {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    padding: 8px;
    background: rgba(26, 26, 46, 0.6);
    border-radius: 12px;
    border: 1px solid #2a2a4e;
  }

  .filter-btn {
    flex: 1;
    padding: 10px 16px;
    background: rgba(42, 42, 78, 0.6);
    border: 2px solid transparent;
    border-radius: 8px;
    color: #b0b0b0;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-btn:hover {
    background: rgba(58, 58, 98, 0.8);
    border-color: #3a3a68;
    color: #e0e0e0;
    transform: translateY(-1px);
  }

  .filter-btn.active {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-color: #ffe55c;
    color: #1a1a2e;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }

  /* Category Section */
  .category-section {
    margin-bottom: 40px;
  }

  .category-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #2a2a4e;
    color: #e0e0e0;
  }

  /* Achievements Grid */
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  /* Empty State */
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background: rgba(26, 26, 46, 0.6);
    border-radius: 12px;
    border: 2px dashed #2a2a4e;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 18px;
    font-weight: 600;
    color: #a0a0a0;
    margin: 0;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .achievement-list {
      padding: 16px;
    }

    .stats-bar {
      gap: 24px;
      padding: 16px;
    }

    .stat-value {
      font-size: 24px;
    }

    .stat-label {
      font-size: 12px;
    }

    .category-tabs {
      gap: 6px;
      padding: 6px;
    }

    .category-tab {
      min-width: 80px;
      padding: 10px 12px;
      font-size: 11px;
    }

    .completion-filter {
      gap: 6px;
      padding: 6px;
    }

    .filter-btn {
      padding: 8px 12px;
      font-size: 11px;
    }

    .category-title {
      font-size: 20px;
    }

    .achievements-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .empty-state {
      padding: 40px 20px;
    }

    .empty-icon {
      font-size: 48px;
    }

    .empty-text {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .stats-bar {
      flex-direction: column;
      gap: 16px;
      padding: 12px;
    }

    .category-tabs {
      flex-direction: column;
    }

    .category-tab {
      min-width: 100%;
    }
  }
</style>
