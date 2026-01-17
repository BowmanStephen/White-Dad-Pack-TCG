<script lang="ts">
  import {
    achievements,
    unlockedAchievements,
    lockedAchievements,
    completionPercentage,
    ACHIEVEMENT_CATEGORY_NAMES,
  } from '../../stores/achievements';
  import { ACHIEVEMENT_RARITY_CONFIG } from '../../types';
  import type { Achievement, AchievementCategory } from '../../types';

  // Selected category filter
  let selectedCategory: AchievementCategory | 'all' = 'all';

  // Selected achievement for detail view
  let selectedAchievement: Achievement | null = null;

  // Computed: Filter achievements by category
  $: filteredAchievements = $achievements.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  // Computed: Sort achievements (unlocked first, then by rarity)
  $: sortedAchievements = [...filteredAchievements].sort((a, b) => {
    // Unlocked first
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;

    // Then by rarity (platinum first)
    const rarityOrder = ['platinum', 'gold', 'silver', 'bronze'];
    const aIndex = rarityOrder.indexOf(a.rarity);
    const bIndex = rarityOrder.indexOf(b.rarity);
    return bIndex - aIndex;
  });

  // Categories for filter
  const categories: (AchievementCategory | 'all')[] = [
    'all',
    'opening',
    'collection',
    'rare',
    'holo',
    'variety',
  ];

  function selectCategory(category: AchievementCategory | 'all') {
    selectedCategory = category;
  }

  function viewAchievement(achievement: Achievement) {
    selectedAchievement = achievement;
  }

  function closeDetail() {
    selectedAchievement = null;
  }

  function shareAchievement(achievement: Achievement) {
    const badgeDataUrl = generateAchievementBadge(achievement);
    if (badgeDataUrl) {
      const link = document.createElement('a');
      link.href = badgeDataUrl;
      link.download = `achievement-${achievement.id}.svg`;
      link.click();
    }
  }

  function generateAchievementBadge(achievement: Achievement): string | null {
    const width = 400;
    const height = 200;
    const rarityConfig = ACHIEVEMENT_RARITY_CONFIG[achievement.rarity];

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect x="0" y="0" width="${width}" height="${height}" fill="${rarityConfig.bgColor}" rx="12"/>
        <rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${rarityConfig.borderColor}" stroke-width="4" rx="10"/>
        <text x="30" y="${height / 2}" font-size="48" text-anchor="middle" dominant-baseline="middle">${achievement.icon}</text>
        <text x="100" y="${height / 2 - 20}" font-size="24" font-weight="bold" fill="#1f2937">${achievement.name}</text>
        <text x="100" y="${height / 2 + 15}" font-size="14" fill="#374151">${achievement.description}</text>
        <text x="${width - 60}" y="${height - 20}" font-size="12" fill="#4b5563" text-anchor="end">DadDeck™</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
</script>

<div class="achievement-gallery">
  <!-- Header -->
  <div class="gallery-header">
    <h1 class="gallery-title">Achievements</h1>

    <div class="gallery-stats">
      <div class="stat-item">
        <span class="stat-value">{$unlockedAchievements.length}</span>
        <span class="stat-label">Unlocked</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{$achievements.length}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{Math.round($completionPercentage)}%</span>
        <span class="stat-label">Complete</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="overall-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {$completionPercentage}%"></div>
      </div>
    </div>
  </div>

  <!-- Category filter -->
  <div class="category-filter">
    {#each categories as category}
      <button
        class="filter-btn"
        class:active={selectedCategory === category}
        on:click={() => selectCategory(category)}
      >
        {category === 'all' ? 'All' : ACHIEVEMENT_CATEGORY_NAMES[category]}
      </button>
    {/each}
  </div>

  <!-- Achievement grid -->
  <div class="achievement-grid">
    {#each sortedAchievements as achievement (achievement.id)}
      <div
        class="achievement-card"
        class:unlocked={achievement.unlockedAt}
        class:locked={!achievement.unlockedAt}
        on:click={() => viewAchievement(achievement)}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && viewAchievement(achievement)}
        style="--achievement-color: {ACHIEVEMENT_RARITY_CONFIG[achievement.rarity].color};
               --achievement-border: {ACHIEVEMENT_RARITY_CONFIG[achievement.rarity].borderColor};
               --achievement-glow: {ACHIEVEMENT_RARITY_CONFIG[achievement.rarity].glowColor};"
      >
        <div class="card-icon">{achievement.icon}</div>
        <div class="card-info">
          <div class="card-rarity">
            <span class="rarity-dot" style="background-color: var(--achievement-color)"></span>
            <span class="rarity-label">{achievement.rarity}</span>
          </div>
          <h3 class="card-title">{achievement.name}</h3>
          <p class="card-description">{achievement.description}</p>

          {#if achievement.maxProgress && !achievement.unlockedAt}
            <div class="card-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {((achievement.progress || 0) / achievement.maxProgress) * 100}%; background-color: var(--achievement-color);"
                ></div>
              </div>
              <span class="progress-text">{achievement.progress || 0} / {achievement.maxProgress}</span>
            </div>
          {/if}

          {#if achievement.unlockedAt}
            <div class="unlocked-date">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- Achievement detail modal -->
  {#if selectedAchievement}
    <div class="detail-overlay" on:click={closeDetail} role="presentation">
      <div
        class="detail-modal"
        on:click|stopPropagation
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        style="--achievement-color: {ACHIEVEMENT_RARITY_CONFIG[selectedAchievement.rarity].color};
               --achievement-border: {ACHIEVEMENT_RARITY_CONFIG[selectedAchievement.rarity].borderColor};
               --achievement-glow: {ACHIEVEMENT_RARITY_CONFIG[selectedAchievement.rarity].glowColor};"
      >
        <button class="close-btn" on:click={closeDetail} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            />
          </svg>
        </button>

        <div class="detail-icon">{selectedAchievement.icon}</div>

        <h2 id="detail-title" class="detail-title">{selectedAchievement.name}</h2>

        <div class="detail-rarity">
          <span
            class="rarity-badge"
            style="background-color: var(--achievement-color); border-color: var(--achievement-border);"
          >
            {selectedAchievement.rarity.charAt(0).toUpperCase() + selectedAchievement.rarity.slice(1)}
          </span>
          <span class="category-badge">
            {ACHIEVEMENT_CATEGORY_NAMES[selectedAchievement.category]}
          </span>
        </div>

        <p class="detail-description">{selectedAchievement.description}</p>

        {#if selectedAchievement.maxProgress}
          <div class="detail-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                style="width: {((selectedAchievement.progress || 0) / selectedAchievement.maxProgress) * 100}%; background-color: var(--achievement-color);"
              ></div>
            </div>
            <span class="progress-text"
              >{selectedAchievement.progress || 0} / {selectedAchievement.maxProgress}</span
            >
          </div>
        {/if}

        {#if selectedAchievement.unlockedAt}
          <div class="detail-unlocked">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.41 4.93L6.64 10.66a.5.5 0 01-.2.13l-2.5.5a.5.5 0 01-.6-.6l.5-2.5a.5.5 0 01.13-.2l6.73-4.77a.5.5 0 01.7.7z"
              />
            </svg>
            Unlocked {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
          </div>
        {:else}
          <div class="detail-locked">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M4 4a2 2 0 012-2h4a2 2 0 012 2v1h1a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h1V4zm2-1a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1H6zM3 7a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V8a1 1 0 00-1-1H3z"
              />
            </svg>
            Not yet unlocked
          </div>
        {/if}

        <button class="share-btn" on:click={() => shareAchievement(selectedAchievement)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M13.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM11 2.5a2.5 2.5 0 114.956.5H11zM4.5 6A1.5 1.5 0 106 7.5 1.5 1.5 0 004.5 6zM2 7.5a2.5 2.5 0 114.956.5H2zm8.5 2A1.5 1.5 0 1012 11a1.5 1.5 0 00-1.5-1.5zM8 11a2.5 2.5 0 114.956.5H8z"
            />
          </svg>
          Share Badge
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .achievement-gallery {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Header */
  .gallery-header {
    margin-bottom: 32px;
  }

  .gallery-title {
    font-size: 36px;
    font-weight: 700;
    color: #f9fafb;
    margin: 0 0 16px 0;
  }

  .gallery-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #f9fafb;
  }

  .stat-label {
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-divider {
    width: 1px;
    height: 32px;
    background: #374151;
  }

  .overall-progress {
    margin-top: 8px;
  }

  .progress-bar {
    height: 8px;
    background: #374151;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    transition: width 0.3s ease;
  }

  /* Category filter */
  .category-filter {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 10px 20px;
    background: #374151;
    border: 2px solid #4b5563;
    border-radius: 8px;
    color: #d1d5db;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-btn:hover {
    background: #4b5563;
    border-color: #6b7280;
  }

  .filter-btn.active {
    background: #3b82f6;
    border-color: #60a5fa;
    color: #f9fafb;
  }

  /* Achievement grid */
  .achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .achievement-card {
    background: #1f2937;
    border: 2px solid #374151;
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    gap: 12px;
  }

  .achievement-card:hover {
    border-color: #4b5563;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .achievement-card.unlocked {
    border-color: var(--achievement-border);
    box-shadow: 0 0 20px var(--achievement-glow);
  }

  .achievement-card.locked {
    opacity: 0.6;
  }

  .card-icon {
    font-size: 48px;
    flex-shrink: 0;
    filter: grayscale(1);
  }

  .achievement-card.unlocked .card-icon {
    filter: grayscale(0);
  }

  .card-info {
    flex: 1;
    min-width: 0;
  }

  .card-rarity {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .rarity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .rarity-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9ca3af;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #f9fafb;
    margin: 0 0 4px 0;
  }

  .card-description {
    font-size: 13px;
    color: #d1d5db;
    margin: 0 0 8px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-progress {
    margin-top: 8px;
  }

  .card-progress .progress-bar {
    height: 4px;
    margin-bottom: 2px;
  }

  .progress-text {
    font-size: 11px;
    color: #9ca3af;
  }

  .unlocked-date {
    margin-top: 8px;
    font-size: 11px;
    color: #10b981;
  }

  /* Detail modal */
  .detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    padding: 16px;
  }

  .detail-modal {
    position: relative;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border: 4px solid var(--achievement-border);
    border-radius: 16px;
    padding: 32px;
    max-width: 480px;
    width: 100%;
    box-shadow:
      0 0 40px var(--achievement-glow),
      0 10px 40px rgba(0, 0, 0, 0.5);
    text-align: center;
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    padding: 8px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #f3f4f6;
  }

  .detail-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .detail-title {
    font-size: 28px;
    font-weight: 700;
    color: #f9fafb;
    margin: 0 0 12px 0;
  }

  .detail-rarity {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .rarity-badge {
    padding: 6px 16px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: var(--achievement-color);
    border: 2px solid var(--achievement-border);
    color: #1f2937;
  }

  .category-badge {
    padding: 6px 16px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    background: #374151;
    color: #d1d5db;
  }

  .detail-description {
    font-size: 16px;
    color: #d1d5db;
    margin: 0 0 20px 0;
  }

  .detail-progress {
    margin: 16px 0;
  }

  .detail-unlocked,
  .detail-locked {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    margin: 16px 0;
  }

  .detail-unlocked {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .detail-locked {
    background: rgba(107, 114, 128, 0.2);
    color: #9ca3af;
  }

  .share-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #f3f4f6;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .share-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .achievement-gallery {
      padding: 16px;
    }

    .gallery-title {
      font-size: 28px;
    }

    .achievement-grid {
      grid-template-columns: 1fr;
    }

    .detail-modal {
      padding: 24px;
    }

    .detail-icon {
      font-size: 48px;
    }

    .detail-title {
      font-size: 22px;
    }
  }
</style>
