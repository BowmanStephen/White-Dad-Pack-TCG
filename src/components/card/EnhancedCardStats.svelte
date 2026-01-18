<script lang="ts">
  import { onMount } from 'svelte';
  import type { PackCard, CardStats, Rarity } from '@/types';
  import { RARITY_CONFIG, STAT_ICONS, STAT_NAMES } from '@/types';
  import RadarChart from './RadarChart.svelte';

  // Props
  interface Props {
    card: PackCard;
    showComparison?: boolean;
    showRatings?: boolean;
    averageStats?: CardStats | null;
  }

  let { card, showComparison = true, showRatings = true, averageStats = null }: Props = $props();

  // State
  let selectedStatKey: keyof CardStats | null = $state(null);
  let animationComplete = $state(false);
  let view: 'radar' | 'bars' | 'detailed' = $state('radar');

  // Get rarity config for styling
  let rarityConfig = $derived(RARITY_CONFIG[card.rarity]);

  // Average stats (fallback to calculated average if not provided)
  const DEFAULT_AVERAGE: CardStats = {
    dadJoke: 50,
    grillSkill: 50,
    fixIt: 50,
    napPower: 50,
    remoteControl: 50,
    thermostat: 50,
    sockSandal: 50,
    beerSnob: 50,
  };

  let comparisonStats = $derived(averageStats || DEFAULT_AVERAGE);

  // Stat keys in display order
  const statKeys: (keyof CardStats)[] = [
    'dadJoke',
    'grillSkill',
    'fixIt',
    'napPower',
    'remoteControl',
    'thermostat',
    'sockSandal',
    'beerSnob',
  ];

  // Get rating label based on value
  function getRating(value: number): { label: string; color: string; emoji: string } {
    if (value >= 95) return { label: 'Legendary', color: '#ec4899', emoji: '👑' };
    if (value >= 85) return { label: 'Excellent', color: '#f97316', emoji: '🔥' };
    if (value >= 70) return { label: 'Great', color: '#22c55e', emoji: '✨' };
    if (value >= 55) return { label: 'Good', color: '#3b82f6', emoji: '👍' };
    if (value >= 40) return { label: 'Average', color: '#eab308', emoji: '😐' };
    if (value >= 25) return { label: 'Below Avg', color: '#f59e0b', emoji: '😕' };
    return { label: 'Terrible', color: '#ef4444', emoji: '💩' };
  }

  // Get comparison indicator
  function getComparison(current: number, average: number): { diff: number; label: string; color: string } {
    const diff = current - average;
    if (diff >= 20) return { diff, label: 'Much Higher', color: '#22c55e' };
    if (diff >= 10) return { diff, label: 'Higher', color: '#4ade80' };
    if (diff >= 5) return { diff, label: 'Slightly Higher', color: '#86efac' };
    if (diff <= -20) return { diff, label: 'Much Lower', color: '#ef4444' };
    if (diff <= -10) return { diff, label: 'Lower', color: '#f87171' };
    if (diff <= -5) return { diff, label: 'Slightly Lower', color: '#fca5a5' };
    return { diff, label: 'Average', color: '#94a3b8' };
  }

  // Calculate total power
  let totalPower = $derived(statKeys.reduce((sum, key) => sum + (card.stats[key] || 0), 0));
  let maxPower = statKeys.length * 100;
  let powerRating = $derived(Math.round((totalPower / maxPower) * 100));

  // Sorted stats by value
  let sortedStats = $derived(statKeys
    .map((key) => ({
      key,
      value: card.stats[key] || 0,
      icon: STAT_ICONS[key],
      name: STAT_NAMES[key],
      rating: getRating(card.stats[key] || 0),
      comparison: getComparison(card.stats[key] || 0, comparisonStats[key] || 50),
    }))
    .sort((a, b) => b.value - a.value));

  // Best and worst stats
  let bestStat = $derived(sortedStats[0]);
  let worstStat = $derived(sortedStats[sortedStats.length - 1]);

  // Trigger animation on mount
  onMount(() => {
    setTimeout(() => {
      animationComplete = true;
    }, 100);
  });

  // Stat bar gradient
  function getBarGradient(value: number): string {
    if (value >= 80) return 'linear-gradient(90deg, #22c55e, #4ade80, #86efac)';
    if (value >= 60) return 'linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)';
    if (value >= 40) return 'linear-gradient(90deg, #eab308, #facc15, #fde047)';
    return 'linear-gradient(90deg, #ef4444, #f87171, #fca5a5)';
  }

  // Handle stat selection
  function selectStat(key: keyof CardStats | null) {
    selectedStatKey = key;
  }
</script>

<div
  class="enhanced-stats"
  style="--rarity-color: {rarityConfig.color}; --rarity-glow: {rarityConfig.glowColor};"
>
  <!-- View Toggle -->
  <div class="view-toggle">
    <button
      class="toggle-btn"
      class:active={view === 'radar'}
      on:click={() => (view = 'radar')}
      aria-pressed={view === 'radar'}
    >
      <span class="toggle-icon">📊</span>
      <span class="toggle-label">Radar</span>
    </button>
    <button
      class="toggle-btn"
      class:active={view === 'bars'}
      on:click={() => (view = 'bars')}
      aria-pressed={view === 'bars'}
    >
      <span class="toggle-icon">📈</span>
      <span class="toggle-label">Bars</span>
    </button>
    <button
      class="toggle-btn"
      class:active={view === 'detailed'}
      on:click={() => (view = 'detailed')}
      aria-pressed={view === 'detailed'}
    >
      <span class="toggle-icon">📋</span>
      <span class="toggle-label">Details</span>
    </button>
  </div>

  <!-- Power Rating Header -->
  <div class="power-header">
    <div class="power-label">Total Power</div>
    <div class="power-value">
      <span class="power-number">{totalPower}</span>
      <span class="power-max">/ {maxPower}</span>
    </div>
    <div class="power-bar">
      <div
        class="power-fill"
        style="width: {animationComplete ? powerRating : 0}%; background: {getBarGradient(powerRating)};"
      ></div>
    </div>
    <div class="power-rating" style="color: {getRating(powerRating).color};">
      {getRating(powerRating).emoji} {getRating(powerRating).label}
    </div>
  </div>

  <!-- Radar View -->
  {#if view === 'radar'}
    <div class="radar-view">
      <div class="radar-container">
        <RadarChart stats={card.stats} rarity={card.rarity} size={220} />
      </div>

      <!-- Quick Stats Summary -->
      <div class="quick-stats">
        <div class="quick-stat best">
          <span class="quick-label">Best</span>
          <span class="quick-icon">{bestStat.icon}</span>
          <span class="quick-name">{bestStat.name}</span>
          <span class="quick-value">{bestStat.value}</span>
        </div>
        <div class="quick-stat worst">
          <span class="quick-label">Weakest</span>
          <span class="quick-icon">{worstStat.icon}</span>
          <span class="quick-name">{worstStat.name}</span>
          <span class="quick-value">{worstStat.value}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Bar View -->
  {#if view === 'bars'}
    <div class="bars-view">
      {#each sortedStats as stat, i}
        <button
          class="stat-bar-row"
          class:selected={selectedStatKey === stat.key}
          on:click={() => selectStat(stat.key === selectedStatKey ? null : stat.key)}
          style="animation-delay: {i * 50}ms;"
        >
          <div class="stat-info">
            <span class="stat-icon">{stat.icon}</span>
            <span class="stat-name">{stat.name}</span>
          </div>
          <div class="stat-bar-container">
            <div
              class="stat-bar-fill"
              style="width: {animationComplete ? stat.value : 0}%; background: {getBarGradient(stat.value)};"
            ></div>
            {#if showComparison}
              <div
                class="stat-bar-average"
                style="left: {comparisonStats[stat.key]}%;"
                title="Average: {comparisonStats[stat.key]}"
              ></div>
            {/if}
          </div>
          <div class="stat-value-container">
            <span class="stat-value">{stat.value}</span>
            {#if showRatings}
              <span class="stat-rating-emoji">{stat.rating.emoji}</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Detailed View -->
  {#if view === 'detailed'}
    <div class="detailed-view">
      {#each sortedStats as stat, i}
        <div class="detail-card" style="animation-delay: {i * 50}ms;">
          <div class="detail-header">
            <span class="detail-icon">{stat.icon}</span>
            <span class="detail-name">{stat.name}</span>
            <span class="detail-value">{stat.value}</span>
          </div>

          <div class="detail-bar">
            <div
              class="detail-bar-fill"
              style="width: {stat.value}%; background: {getBarGradient(stat.value)};"
            ></div>
          </div>

          <div class="detail-info">
            {#if showRatings}
              <div class="detail-rating" style="color: {stat.rating.color};">
                <span class="rating-emoji">{stat.rating.emoji}</span>
                <span class="rating-label">{stat.rating.label}</span>
              </div>
            {/if}

            {#if showComparison}
              <div class="detail-comparison" style="color: {stat.comparison.color};">
                <span class="comparison-arrow">
                  {#if stat.comparison.diff > 0}↑{:else if stat.comparison.diff < 0}↓{:else}→{/if}
                </span>
                <span class="comparison-diff">
                  {#if stat.comparison.diff > 0}+{/if}{stat.comparison.diff}
                </span>
                <span class="comparison-label">vs avg</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Legend -->
  {#if showComparison && view === 'bars'}
    <div class="legend">
      <div class="legend-item">
        <div class="legend-marker average"></div>
        <span>Average</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .enhanced-stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* View Toggle */
  .view-toggle {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .toggle-btn.active {
    background: var(--rarity-color);
    color: white;
    border-color: var(--rarity-color);
  }

  .toggle-icon {
    font-size: 14px;
  }

  .toggle-label {
    font-weight: 500;
  }

  /* Power Header */
  .power-header {
    text-align: center;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
  }

  .power-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 4px;
  }

  .power-value {
    font-size: 24px;
    font-weight: 900;
    margin-bottom: 8px;
  }

  .power-number {
    color: var(--rarity-color);
  }

  .power-max {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
  }

  .power-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .power-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .power-rating {
    font-size: 12px;
    font-weight: 600;
  }

  /* Radar View */
  .radar-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .radar-container {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .quick-stats {
    display: flex;
    gap: 16px;
    width: 100%;
  }

  .quick-stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
  }

  .quick-stat.best {
    border: 1px solid #22c55e33;
  }

  .quick-stat.worst {
    border: 1px solid #ef444433;
  }

  .quick-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.4);
  }

  .quick-icon {
    font-size: 20px;
  }

  .quick-name {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .quick-value {
    font-size: 18px;
    font-weight: 900;
  }

  .quick-stat.best .quick-value {
    color: #22c55e;
  }

  .quick-stat.worst .quick-value {
    color: #ef4444;
  }

  /* Bar View */
  .bars-view {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: slideIn 0.3s ease forwards;
    opacity: 0;
    transform: translateX(-10px);
    width: 100%;
    text-align: left;
  }

  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .stat-bar-row:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .stat-bar-row.selected {
    background: rgba(var(--rarity-color), 0.1);
    border-color: var(--rarity-color);
  }

  .stat-info {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 90px;
    flex-shrink: 0;
  }

  .stat-icon {
    font-size: 14px;
  }

  .stat-name {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
  }

  .stat-bar-container {
    flex: 1;
    height: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    position: relative;
    overflow: hidden;
  }

  .stat-bar-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .stat-bar-average {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.6);
    transform: translateX(-50%);
  }

  .stat-value-container {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 50px;
    justify-content: flex-end;
  }

  .stat-value {
    font-size: 14px;
    font-weight: 700;
    color: white;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  }

  .stat-rating-emoji {
    font-size: 12px;
  }

  /* Detailed View */
  .detailed-view {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    .detailed-view {
      grid-template-columns: 1fr;
    }
  }

  .detail-card {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    animation: fadeIn 0.3s ease forwards;
    opacity: 0;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }

  .detail-icon {
    font-size: 16px;
  }

  .detail-name {
    flex: 1;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .detail-value {
    font-size: 18px;
    font-weight: 900;
    color: var(--rarity-color);
  }

  .detail-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .detail-bar-fill {
    height: 100%;
    border-radius: 3px;
  }

  .detail-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 500;
  }

  .rating-emoji {
    font-size: 12px;
  }

  .detail-comparison {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 500;
  }

  .comparison-arrow {
    font-size: 12px;
  }

  .comparison-label {
    color: rgba(255, 255, 255, 0.4);
  }

  /* Legend */
  .legend {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
  }

  .legend-marker {
    width: 12px;
    height: 2px;
    border-radius: 1px;
  }

  .legend-marker.average {
    background: rgba(255, 255, 255, 0.6);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .stat-bar-row,
    .detail-card {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .stat-bar-fill,
    .power-fill,
    .detail-bar-fill {
      transition: none;
    }
  }
</style>
