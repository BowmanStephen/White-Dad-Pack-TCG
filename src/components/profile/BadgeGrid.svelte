<script lang="ts">
  import type { Badge, BadgeRarity, BadgeCategory } from '@/types';
  import { BADGE_RARITY_CONFIG, BADGE_CATEGORY_NAMES } from '@/types';

  export let badges: Badge[] = [];

  // Group badges by category
  $: groupedBadges = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<BadgeCategory, Badge[]>);
</script>

<div class="badge-grid">
  {#each Object.entries(groupedBadges) as [category, categoryBadges]}
    {@const categoryKey = category as BadgeCategory}
    <div class="badge-category">
      <h4 class="category-title">{BADGE_CATEGORY_NAMES[categoryKey]}</h4>
      <div class="category-badges">
        {#each categoryBadges as badge}
          {@const config = BADGE_RARITY_CONFIG[badge.rarity]}
          <div
            class="badge"
            style="--badge-color: {config.color}; --badge-glow: {config.glowColor}; --badge-bg: {config.bgColor};"
            title="{badge.name}: {badge.description}"
          >
            <div class="badge-icon">{badge.icon}</div>
            <div class="badge-info">
              <span class="badge-name">{badge.name}</span>
              <span class="badge-desc">{badge.description}</span>
              {#if badge.unlockedAt}
                <span class="badge-date">
                  Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                </span>
              {/if}
            </div>
            <div class="badge-rarity" style="color: {config.color};">
              {config.name}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .badge-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .badge-category {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: #374151;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .category-badges {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .badge {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border: 2px solid var(--badge-color);
    border-radius: 12px;
    box-shadow: 0 2px 8px var(--badge-glow);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .badge:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 4px 16px var(--badge-glow);
  }

  .badge::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--badge-bg);
    border-radius: 10px;
    opacity: 0.5;
    z-index: 0;
  }

  .badge-icon {
    position: relative;
    z-index: 1;
    font-size: 2.5rem;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .badge-info {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .badge-name {
    font-weight: 700;
    font-size: 1rem;
    color: #1f2937;
  }

  .badge-desc {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.3;
  }

  .badge-date {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.25rem;
  }

  .badge-rarity {
    position: relative;
    z-index: 1;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.25rem 0.5rem;
    background: var(--badge-bg);
    border-radius: 4px;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .category-badges {
      grid-template-columns: 1fr;
    }

    .badge {
      padding: 0.875rem;
    }

    .badge-icon {
      font-size: 2rem;
    }
  }
</style>
