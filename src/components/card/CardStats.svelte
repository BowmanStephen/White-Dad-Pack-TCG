<script lang="ts">
  import type { CardStats as CardStatsType, RarityConfig, Rarity } from '../../types';
  import { STAT_ICONS, STAT_NAMES } from '../../types';
  import StatTooltip from './StatTooltip.svelte';

  export let stats: CardStatsType;
  export let rarityConfig: RarityConfig;
  export let compact: boolean = false;
  export let cardRarity: Rarity = 'rare'; // Default to rare if not provided

  $: statEntries = Object.entries(stats)
    .map(([key, value]) => ({
      key: key as keyof CardStatsType,
      value: value as number,
      icon: STAT_ICONS[key as keyof CardStatsType],
      name: STAT_NAMES[key as keyof CardStatsType],
      isHighStat: value >= 80,
    }))
    .sort((a, b) => b.value - a.value);

  $: barGradient = (value: number) => {
    const baseColor = value >= 80
      ? rarityConfig.color // Use rarity color for high stats
      : '#64748b'; // Slate-500 for normal stats

    return `linear-gradient(90deg, ${baseColor}, ${baseColor}dd, ${baseColor}aa)`;
  };

  $: getGlowStyle = (value: number) => {
    if (value >= 80) {
      return `box-shadow: 0 0 12px ${rarityConfig.glowColor}, 0 0 20px ${rarityConfig.color}44;`;
    }
    return `box-shadow: 0 0 8px ${rarityConfig.glowColor}55;`;
  };

  // Tooltip state
  let tooltipTargets: Record<string, HTMLElement> = {};
  let activeTooltip: { key: string; element: HTMLElement } | null = null;

  // Svelte action to register tooltip targets
  function tooltipTarget(node: HTMLElement, { key, register }: { key: string; register: (el: HTMLElement) => void }) {
    register(node);
    return {
      destroy() {
        // Cleanup if needed
      }
    };
  }
</script>

<div class="space-y-1.5 stats-grid">
  {#each statEntries as stat, i}
    <div
      class="flex items-center gap-1.5 stat-row cursor-help"
      class:high-stat={stat.isHighStat}
      role="button"
      tabindex="0"
      aria-label="{stat.name}: {stat.value} out of 100. Press or hold for details."
      on:mouseenter={() => activeTooltip = { key: stat.key, element: tooltipTargets[stat.key] }}
      on:mouseleave={() => activeTooltip = null}
      use:tooltipTarget={{ key: stat.key, register: (el) => tooltipTargets[stat.key] = el }}
    >
      <span class="text-xs w-4 drop-shadow-sm stat-icon" aria-hidden="true">{stat.icon}</span>
      <span class="text-[9px] text-slate-400 stat-label font-medium uppercase tracking-tight" class:text-slate-300={stat.isHighStat}>{stat.name}</span>
      <div class="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden relative stat-bar-container">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out relative stat-bar"
          style="width: {stat.value}%; background: {barGradient(stat.value)}; {getGlowStyle(stat.value)};"
          class:stat-bar-high={stat.isHighStat}
          role="progressbar"
          aria-label="{stat.name}: {stat.value} out of 100"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={stat.value}
        >
          <!-- Shimmer effect -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full shimmer"
            class:shimmer-high={stat.isHighStat}
            style="animation-delay: {i * 0.1}s; animation-duration: {stat.isHighStat ? '1.5s' : '2s'};"
          ></div>
        </div>
      </div>
      <span
        class="text-[10px] w-7 text-right font-mono font-bold stat-value"
        class:text-white={stat.isHighStat}
        style="text-shadow: 0 1px 2px rgba(0,0,0,0.3);"
      >
        {stat.value}
      </span>
    </div>
  {/each}
</div>

<!-- Tooltip for active stat -->
{#if activeTooltip}
  <StatTooltip
    statKey={activeTooltip.key}
    statValue={stats[activeTooltip.key]}
    triggerElement={activeTooltip.element}
    cardRarity={cardRarity}
  />
{/if}

<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }

  .stat-row {
    transition: transform 0.2s ease;
  }

  .high-stat {
    transform: scale(1.02);
  }

  .high-stat .stat-icon {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% {
      filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
      transform: scale(1);
    }
    50% {
      filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
      transform: scale(1.1);
    }
  }

  .stat-bar-high {
    animation: bar-pulse 2s ease-in-out infinite;
  }

  @keyframes bar-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.9;
    }
  }

  .shimmer-high {
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
  }

  /* Responsive layout - stack on mobile */
  @media (max-width: 640px) {
    .stats-grid {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .stat-row {
      width: 100%;
    }

    .stat-label {
      width: 3.5rem;
      font-size: 0.5rem;
    }

    .stat-value {
      width: 2rem;
    }
  }

  /* Tablet and desktop */
  @media (min-width: 641px) {
    .stats-grid {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }
  }
</style>
