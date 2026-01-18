<script lang="ts">
  import type { DeckStats, Rarity, DadType } from '@/types';
  import { RARITY_CONFIG, DAD_TYPE_ICONS, DAD_TYPE_NAMES, STAT_NAMES, STAT_ICONS } from '@/types';
  import { t } from '@/i18n';

  export let stats: DeckStats = {
    totalCards: 0,
    uniqueCards: 0,
    rarityBreakdown: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    },
    statTotal: {
      dadJoke: 0,
      grillSkill: 0,
      fixIt: 0,
      napPower: 0,
      remoteControl: 0,
      thermostat: 0,
      sockSandal: 0,
      beerSnob: 0,
    },
    typeBreakdown: {} as any,
    averageStats: {
      dadJoke: 0,
      grillSkill: 0,
      fixIt: 0,
      napPower: 0,
      remoteControl: 0,
      thermostat: 0,
      sockSandal: 0,
      beerSnob: 0,
    },
  };
  export let compact: boolean = false;

  const rarityOrder: Rarity[] = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

  $: sortedRarities = rarityOrder.filter(rarity => stats.rarityBreakdown[rarity] > 0);

  $: sortedTypes = (Object.entries(stats.typeBreakdown)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a) as [DadType, number][]);

  $: averageRating = Math.round(
    (stats.averageStats.dadJoke +
      stats.averageStats.grillSkill +
      stats.averageStats.fixIt +
      stats.averageStats.napPower +
      stats.averageStats.remoteControl +
      stats.averageStats.thermostat +
      stats.averageStats.sockSandal +
      stats.averageStats.beerSnob) / 8
  );
</script>

<div class="deck-stats" class:compact>
  <!-- Summary Stats -->
  <div class="stat-summary">
    <div class="stat-item">
      <span class="stat-label">{$t('deck.stats.totalCards')}</span>
      <span class="stat-value">{stats.totalCards}</span>
    </div>

    <div class="stat-item">
      <span class="stat-label">{$t('deck.stats.uniqueCards')}</span>
      <span class="stat-value">{stats.uniqueCards}</span>
    </div>

    <div class="stat-item">
      <span class="stat-label">{$t('deck.stats.averageRating')}</span>
      <span class="stat-value" class:rating-high={averageRating >= 75} class:rating-medium={averageRating >= 50 && averageRating < 75} class:rating-low={averageRating < 50}>
        {averageRating}
      </span>
    </div>
  </div>

  {#if !compact}
    <!-- Rarity Breakdown -->
    <div class="stat-section">
      <h3 class="stat-section-title">{$t('deck.stats.rarityBreakdown')}</h3>
      <div class="rarity-grid">
        {#each sortedRarities as rarity}
          {@const rarityData = RARITY_CONFIG[rarity]}
          {@const count = stats.rarityBreakdown[rarity]}
          <div class="rarity-item" style="border-color: {rarityData.color}">
            <div class="rarity-indicator" style="background-color: {rarityData.color}"></div>
            <span class="rarity-name">{rarityData.label}</span>
            <span class="rarity-count">{count}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Type Breakdown -->
    {#if sortedTypes.length > 0}
      <div class="stat-section">
        <h3 class="stat-section-title">{$t('deck.stats.typeBreakdown')}</h3>
        <div class="type-grid">
          {#each sortedTypes.slice(0, 10) as [type, count]}
            <div class="type-item">
              <span class="type-icon">{DAD_TYPE_ICONS[type]}</span>
              <span class="type-name">{DAD_TYPE_NAMES[type]}</span>
              <span class="type-count">{count}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Average Stats -->
    <div class="stat-section">
      <h3 class="stat-section-title">{$t('deck.stats.averageStats')}</h3>
      <div class="stats-grid">
        {#each Object.entries(stats.averageStats) as [stat, value]}
          <div class="stat-row">
            <span class="stat-row-icon">{STAT_ICONS[stat]}</span>
            <span class="stat-row-name">{STAT_NAMES[stat]}</span>
            <div class="stat-bar-container">
              <div class="stat-bar-fill" style="width: {value}%">
                <span class="stat-bar-value">{value}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .deck-stats {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 12px;
    padding: 1.5rem;
    color: #f1f5f9;
  }

  .deck-stats.compact {
    padding: 1rem;
  }

  .stat-summary {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f8fafc;
  }

  .stat-value.rating-high {
    color: #22c55e;
  }

  .stat-value.rating-medium {
    color: #eab308;
  }

  .stat-value.rating-low {
    color: #ef4444;
  }

  .stat-section {
    margin-top: 1.5rem;
  }

  .stat-section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #cbd5e1;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Rarity Grid */
  .rarity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
  }

  .rarity-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .rarity-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .rarity-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .rarity-name {
    font-size: 0.875rem;
    font-weight: 500;
    flex: 1;
  }

  .rarity-count {
    font-size: 0.875rem;
    font-weight: 600;
  }

  /* Type Grid */
  .type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.5rem;
  }

  .type-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .type-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .type-name {
    font-size: 0.875rem;
    flex: 1;
  }

  .type-count {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f8fafc;
  }

  /* Stats Grid */
  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stat-row-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .stat-row-name {
    font-size: 0.75rem;
    color: #94a3b8;
    min-width: 80px;
  }

  .stat-bar-container {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .stat-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
    transition: width 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.5rem;
  }

  .stat-bar-value {
    font-size: 0.625rem;
    font-weight: 600;
    color: #f8fafc;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .stat-summary {
      gap: 1rem;
    }

    .rarity-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .type-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }

    .stat-row-name {
      min-width: 60px;
      font-size: 0.625rem;
    }
  }
</style>
