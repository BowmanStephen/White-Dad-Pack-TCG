<script lang="ts">
  import { onMount } from 'svelte';
  import {
    achievements,
    initializeAchievements,
    getAllAchievements,
    getUnlockedAchievements,
  } from '@/stores/achievements';
  import {
    initializeAchievements as initDefs,
    getAllAchievementDefinitions,
  } from '@/lib/achievements';
  import type { Achievement, AchievementCategory } from '@/types';
  import { ACHIEVEMENT_RARITY_CONFIG, ACHIEVEMENT_CATEGORY_NAMES } from '@/types';

  // Initialize on mount
  onMount(() => {
    // Initialize achievement store from localStorage
    initializeAchievements();

    // Initialize achievement definitions if not already present
    const currentAchievements = getAllAchievements();
    if (currentAchievements.length === 0) {
      const definitions = initDefs();
      achievements.set(definitions);
    }
  });

  // Filter state
  let selectedCategory = $state<AchievementCategory | 'all'>('all');
  let showUnlockedOnly = $state(false);

  // Subscribe to achievements store
  let achievementsData = $derived($achievements);

  // Computed filtered achievements
  let allAchievements = $derived(getAllAchievements());
  let unlockedAchievements = $derived(getUnlockedAchievements());
  let definitions = $derived(getAllAchievementDefinitions());

  // Statistics
  let totalUnlocked = $derived(unlockedAchievements.length);
  let totalAchievements = $derived(allAchievements.length);
  let unlockProgress = $derived(totalAchievements > 0 ? (totalUnlocked / totalAchievements) * 100 : 0);

  // Filter achievements
  let filteredAchievements = $derived(filterAchievements());

  function filterAchievements(): Achievement[] {
    let filtered = allAchievements;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => {
        const def = definitions.find((d) => d.name === a.name);
        return def?.category === selectedCategory;
      });
    }

    // Unlocked only filter
    if (showUnlockedOnly) {
      filtered = filtered.filter((a) => a.unlockedAt);
    }

    return filtered;
  }

  // Get definition for achievement
  function getDefinition(achievement: Achievement) {
    return definitions.find((d) => d.name === achievement.name);
  }

  // Get rarity config
  function getRarityConfig(rarity: Achievement['rarity']) {
    return ACHIEVEMENT_RARITY_CONFIG[rarity];
  }

  // Category options
  const categories: (AchievementCategory | 'all')[] = [
    'all',
    'collection',
    'battle',
    'social',
    'special',
  ];
</script>

<div class="achievement-gallery">
  <!-- Stats Overview -->
  <div class="stats-overview">
    <div class="stat-card">
      <div class="stat-value">{totalUnlocked}</div>
      <div class="stat-label">Unlocked</div>
    </div>

    <div class="stat-card">
      <div class="stat-value">{totalAchievements}</div>
      <div class="stat-label">Total</div>
    </div>

    <div class="stat-card progress-stat">
      <div class="stat-value">{Math.round(unlockProgress)}%</div>
      <div class="stat-label">Complete</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {unlockProgress}%"></div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
      <label for="category-filter" class="filter-label">Category</label>
      <select
        id="category-filter"
        class="filter-select"
        bind:value={selectedCategory}
      >
        {#each categories as category}
          <option value={category}>
            {category === 'all' ? 'All Categories' : ACHIEVEMENT_CATEGORY_NAMES[category]}
          </option>
        {/each}
      </select>
    </div>

    <div class="filter-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          class="checkbox-input"
          bind:checked={showUnlockedOnly}
        />
        <span class="checkbox-text">Show unlocked only</span>
      </label>
    </div>
  </div>

  <!-- Achievements Grid -->
  <div class="achievements-grid">
    {#each filteredAchievements as achievement (achievement.id)}
      {@const definition = getDefinition(achievement)}
      {@const rarityConfig = getRarityConfig(achievement.rarity)}
      {@const isUnlocked = achievement.unlockedAt !== undefined}

      <article
        class="achievement-card {isUnlocked ? 'unlocked' : 'locked'}"
        class:rarity={achievement.rarity}
      >
        <!-- Icon -->
        <div class="achievement-icon-wrapper">
          {#if isUnlocked || !achievement.hidden}
            <img
              src={achievement.icon}
              alt=""
              class="achievement-icon"
            />
          {:else}
            <div class="achievement-icon-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                  stroke="currentColor"
                  stroke-width="1"
                />
              </svg>
            </div>
          {/if}

          <!-- Rarity indicator -->
          <div class="rarity-indicator" style="background: {rarityConfig.color}"></div>
        </div>

        <!-- Content -->
        <div class="achievement-content">
          <h3 class="achievement-name">
            {#if isUnlocked}
              {achievement.name}
            {:else if achievement.hidden}
              ???
            {:else}
              {achievement.name}
            {/if}
          </h3>

          {#if isUnlocked || !achievement.hidden}
            <p class="achievement-description">
              {achievement.description}
            </p>
          {:else}
            <p class="achievement-description">
              {achievement.hint || 'Keep playing to unlock this achievement!'}
            </p>
          {/if}

          <!-- Progress bar -->
          {#if achievement.maxProgress && achievement.maxProgress > 1}
            <div class="achievement-progress">
              <span class="progress-text">
                {achievement.progress || 0}/{achievement.maxProgress}
              </span>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {((achievement.progress || 0) / achievement.maxProgress) * 100}%"
                ></div>
              </div>
            </div>
          {/if}

          <!-- Unlocked date -->
          {#if isUnlocked}
            <p class="unlocked-date">
              Unlocked {achievement.unlockedAt?.toLocaleDateString()}
            </p>
          {/if}

          <!-- Category badge -->
          {#if definition}
            <div class="category-badge">
              {ACHIEVEMENT_CATEGORY_NAMES[definition.category]}
            </div>
          {/if}
        </div>
      </article>
    {/each}

    {#if filteredAchievements.length === 0}
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            stroke="currentColor"
            stroke-width="1"
          />
        </svg>
        <p>No achievements found</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .achievement-gallery {
    width: 100%;
  }

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    backdrop-filter: blur(10px);
  }

  .stat-card.progress-stat {
    position: relative;
    overflow: hidden;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fbbf24;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .progress-bar {
    margin-top: 0.75rem;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
    border-radius: 2px;
    transition: width 0.3s ease-out;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: center;
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.875rem;
    color: #cbd5e1;
    font-weight: 500;
  }

  .filter-select {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease-out;
  }

  .filter-select:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .filter-select:focus {
    outline: none;
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .checkbox-text {
    font-size: 0.875rem;
    color: #cbd5e1;
  }

  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .achievement-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    gap: 1rem;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease-out;
  }

  .achievement-card.unlocked {
    border-color: rgba(251, 191, 36, 0.3);
    background: rgba(251, 191, 36, 0.05);
  }

  .achievement-card.unlocked:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(251, 191, 36, 0.2);
  }

  .achievement-card.locked {
    opacity: 0.6;
  }

  .achievement-card.locked:hover {
    opacity: 0.8;
  }

  .achievement-icon-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }

  .achievement-icon {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .achievement-icon-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #64748b;
  }

  .achievement-icon-placeholder svg {
    width: 40px;
    height: 40px;
  }

  .rarity-indicator {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #1e293b;
  }

  .achievement-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .achievement-name {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
    line-height: 1.3;
  }

  .achievement-description {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.4;
  }

  .achievement-progress {
    margin-top: 0.25rem;
  }

  .progress-text {
    font-size: 0.75rem;
    color: #cbd5e1;
    display: block;
    margin-bottom: 0.25rem;
  }

  .unlocked-date {
    font-size: 0.75rem;
    color: #fbbf24;
    margin: 0;
  }

  .category-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    font-size: 0.75rem;
    color: #cbd5e1;
  }

  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #64748b;
  }

  .empty-state svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 1rem;
    margin: 0;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .stats-overview {
      grid-template-columns: 1fr;
    }

    .achievements-grid {
      grid-template-columns: 1fr;
    }

    .achievement-card {
      padding: 0.75rem;
    }

    .achievement-icon-wrapper {
      width: 60px;
      height: 60px;
    }
  }
</style>
