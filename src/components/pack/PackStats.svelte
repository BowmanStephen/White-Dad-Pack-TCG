<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, getCollectionStats, getRecentPacks } from '@/stores/collection';
  import { RARITY_CONFIG, RARITY_ORDER } from '@/types';
  import type { Rarity, Pack } from '@/types';
  import { t } from '@/i18n';

  // Statistics computed from collection
  let stats = $state<{
    totalPacks: number;
    totalCards: number;
    rarityCounts: Record<Rarity, number>;
    lastOpenedAt: Date | null;
  }>({
    totalPacks: 0,
    totalCards: 0,
    rarityCounts: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    },
    lastOpenedAt: null,
  });

  // Lucky streak tracking
  let luckyStreak = $state(0);
  let bestStreak = $state(0);
  let recentRarityHistory = $state<Rarity[]>([]);

  // Computed: Total cards from rarity counts
  let totalCardsFromCounts = $derived(
    Object.values(stats.rarityCounts).reduce((sum, count) => sum + count, 0)
  );

  // Computed: Best pull rarity
  let bestPull = $derived(() => {
    let best: Rarity | null = null;
    let bestOrder = -1;

    for (const [rarity, count] of Object.entries(stats.rarityCounts)) {
      if (count > 0 && RARITY_ORDER[rarity as Rarity] > bestOrder) {
        best = rarity as Rarity;
        bestOrder = RARITY_ORDER[rarity as Rarity];
      }
    }

    return best;
  });

  // Computed: Lucky streak threshold (rare or better)
  let isLucky = $derived((rarity: Rarity) => RARITY_ORDER[rarity] >= RARITY_ORDER.rare);

  // Computed: Average rarity score (weighted by drop rates)
  let avgRarityScore = $derived(() => {
    if (totalCardsFromCounts === 0) return 0;

    let totalScore = 0;
    for (const [rarity, count] of Object.entries(stats.rarityCounts)) {
      totalScore += RARITY_ORDER[rarity as Rarity] * count;
    }

    return totalScore / totalCardsFromCounts;
  });

  // Format date for display
  function formatDate(date: Date | null): string {
    if (!date) return t('stats.never');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('stats.justNow');
    if (diffMins < 60) return t('stats.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('stats.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('stats.daysAgo', { count: diffDays });

    return date.toLocaleDateString();
  }

  // Calculate lucky streak from recent packs
  function calculateLuckyStreak(): void {
    const recentPacks = getRecentPacks(50); // Last 50 packs
    const history: Rarity[] = [];
    let currentStreak = 0;
    let maxStreak = 0;

    // Track recent best rarities
    for (const pack of recentPacks) {
      history.push(pack.bestRarity);

      // Count consecutive rare+ pulls
      if (isLucky(pack.bestRarity)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    recentRarityHistory = history;
    luckyStreak = currentStreak;
    bestStreak = maxStreak;
  }

  // Calculate rarity percentage
  function getRarityPercentage(rarity: Rarity): number {
    if (totalCardsFromCounts === 0) return 0;
    return (stats.rarityCounts[rarity] / totalCardsFromCounts) * 100;
  }

  // Get rarity bar width (relative to most common rarity)
  function getRarityBarWidth(rarity: Rarity): number {
    const maxCount = Math.max(...Object.values(stats.rarityCounts));
    if (maxCount === 0) return 0;
    return (stats.rarityCounts[rarity] / maxCount) * 100;
  }

  // Update statistics from collection
  function updateStats(): void {
    const current = collection.get();
    const collectionStats = getCollectionStats();

    stats = {
      totalPacks: collectionStats.totalPacks,
      totalCards: collectionStats.totalCards,
      rarityCounts: current.metadata.rarityCounts || {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
      },
      lastOpenedAt: collectionStats.lastOpenedAt,
    };

    calculateLuckyStreak();
  }

  // Subscribe to collection changes
  onMount(() => {
    updateStats();

    const unsubscribe = collection.subscribe(() => {
      updateStats();
    });

    return () => unsubscribe();
  });
</script>

<div class="pack-stats">
  <!-- Header -->
  <div class="stats-header">
    <h2 class="stats-title">{$t('stats.title')}</h2>
    <p class="stats-subtitle">{formatDate(stats.lastOpenedAt)}</p>
  </div>

  <!-- Quick Stats Grid -->
  <div class="stats-grid">
    <!-- Total Packs -->
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-content">
        <div class="stat-value">{stats.totalPacks}</div>
        <div class="stat-label">{$t('stats.totalPacks')}</div>
      </div>
    </div>

    <!-- Total Cards -->
    <div class="stat-card">
      <div class="stat-icon">🃏</div>
      <div class="stat-content">
        <div class="stat-value">{totalCardsFromCounts}</div>
        <div class="stat-label">{$t('stats.totalCards')}</div>
      </div>
    </div>

    <!-- Best Pull -->
    <div class="stat-card">
      <div class="stat-icon">
        {#if bestPull}
          <span class="rarity-icon" style="color: {RARITY_CONFIG[bestPull].color}">
            {RARITY_CONFIG[bestPull].name.charAt(0)}
          </span>
        {:else}
          ❓
        {/if}
      </div>
      <div class="stat-content">
        <div class="stat-value">
          {#if bestPull}
            {RARITY_CONFIG[bestPull].name}
          {:else}
            {$t('stats.none')}
          {/if}
        </div>
        <div class="stat-label">{$t('stats.bestPull')}</div>
      </div>
    </div>

    <!-- Lucky Streak -->
    <div class="stat-card">
      <div class="stat-icon">🍀</div>
      <div class="stat-content">
        <div class="stat-value {luckyStreak > 0 ? 'lucky' : ''}">
          {luckyStreak} {#if luckyStreak > 0}🔥{/if}
        </div>
        <div class="stat-label">
          {$t('stats.luckyStreak')}
          {#if bestStreak > 0}
            <span class="streak-record">({$t('stats.best')}: {bestStreak})</span>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Rarity Distribution -->
  <div class="rarity-section">
    <h3 class="section-title">{$t('stats.rarityDistribution')}</h3>

    <div class="rarity-bars">
      {#each Object.entries(RARITY_CONFIG) as [rarity, config]}
        {@const count = stats.rarityCounts[rarity as Rarity]}
        {@const percentage = getRarityPercentage(rarity as Rarity)}
        {@const barWidth = getRarityBarWidth(rarity as Rarity)}

        <div class="rarity-bar" class:lucky={isLucky(rarity as Rarity) && count > 0}>
          <div class="rarity-info">
            <span class="rarity-name" style="color: {config.color}">
              {config.name}
            </span>
            <span class="rarity-count">{count}</span>
          </div>

          <div class="rarity-visual">
            <div
              class="rarity-fill"
              style="width: {barWidth}%; background-color: {config.color};"
            ></div>
            <span class="rarity-percent">{percentage.toFixed(1)}%</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Historical Trend (Last 10 packs) -->
  {#if recentRarityHistory.length > 0}
    <div class="trend-section">
      <h3 class="section-title">{$t('stats.recentTrend')}</h3>

      <div class="trend-dots">
        {#each recentRarityHistory.slice(-10).reverse() as rarity, index}
          <div
            class="trend-dot"
            style="background-color: {RARITY_CONFIG[rarity].color};"
            title="{RARITY_CONFIG[rarity].name}"
          >
            {#if index === 0}
              <span class="trend-label">{$t('stats.latest')}</span>
            {/if}
          </div>
        {/each}
      </div>

      <p class="trend-hint">
        {$t('stats.trendHint')}
      </p>
    </div>
  {/if}
</div>

<style>
  .pack-stats {
    padding: 1.5rem;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .stats-header {
    margin-bottom: 1.5rem;
  }

  .stats-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 0.25rem 0;
  }

  .stats-subtitle {
    font-size: 0.875rem;
    color: #94a3b8;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .stat-icon {
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    flex-shrink: 0;
  }

  .rarity-icon {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .stat-content {
    flex: 1;
    min-width: 0;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
    line-height: 1.2;
  }

  .stat-value.lucky {
    color: #fbbf24;
    animation: pulse 2s ease-in-out infinite;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.125rem;
    line-height: 1.2;
  }

  .streak-record {
    color: #64748b;
    font-size: 0.625rem;
    margin-left: 0.25rem;
  }

  .rarity-section,
  .trend-section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0 0 1rem 0;
  }

  .rarity-bars {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .rarity-bar {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .rarity-bar.lucky {
    background: rgba(251, 191, 36, 0.1);
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .rarity-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .rarity-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e2e8f0;
  }

  .rarity-count {
    font-size: 0.875rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .rarity-visual {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rarity-fill {
    height: 0.5rem;
    border-radius: 0.25rem;
    transition: width 0.5s ease;
    min-width: 2rem;
  }

  .rarity-percent {
    font-size: 0.75rem;
    color: #94a3b8;
    min-width: 3rem;
    text-align: right;
  }

  .trend-dots {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .trend-dot {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    position: relative;
    cursor: help;
    transition: transform 0.2s ease;
  }

  .trend-dot:hover {
    transform: scale(1.1);
  }

  .trend-label {
    position: absolute;
    bottom: -1.25rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.5rem;
    color: #94a3b8;
    white-space: nowrap;
  }

  .trend-hint {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0;
    font-style: italic;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Dark mode support */
  :global(.dark) .pack-stats {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .pack-stats {
      padding: 1rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stats-title {
      font-size: 1.25rem;
    }

    .stat-value {
      font-size: 1rem;
    }

    .rarity-bars {
      gap: 0.5rem;
    }
  }
</style>
