<script lang="ts">
  import type { CardStats as CardStatsType, RarityConfig, Rarity } from '../../types';
  import { STAT_ICONS, STAT_NAMES } from '../../types';
  import { hasCardStats } from '../../lib/card-types';
  import StatTooltip from './StatTooltip.svelte';
  import RadarChart from './RadarChart.svelte';
  import { formatCardStat } from '../../lib/utils/formatters';

  export let stats: CardStatsType;
  export let rarityConfig: RarityConfig;
  export let compact: boolean = false;
  export let cardRarity: Rarity = 'rare'; // Default to rare if not provided
  export let cardType: string = ''; // NEW: Card type for conditional stat display
  export let showRadarChart: boolean = true; // Show radar chart by default

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
    // Color gradient system: red (0-50), yellow (50-80), green (80-100)
    if (value >= 80) {
      // High stats: Green gradient with rarity-based glow
      const greenGradient = 'linear-gradient(90deg, #22c55e, #4ade80, #86efac)';
      return value >= 90
        ? `linear-gradient(90deg, ${rarityConfig.color}, #ffffff, ${rarityConfig.color})` // Mythic-level: Prismatic
        : greenGradient;
    } else if (value >= 50) {
      // Medium stats: Yellow gradient
      return 'linear-gradient(90deg, #eab308, #facc15, #fde047)';
    } else {
      // Low stats: Red gradient
      return 'linear-gradient(90deg, #ef4444, #f87171, #fca5a5)';
    }
  };

  $: getGlowStyle = (value: number) => {
    if (value >= 90) {
      // Mythic-level stats: Intense prismatic glow
      return `box-shadow: 0 0 16px ${rarityConfig.color}, 0 0 32px ${rarityConfig.glowColor}, 0 0 48px ${rarityConfig.color}66;`;
    } else if (value >= 80) {
      // High stats: Green glow with rarity tint
      return `box-shadow: 0 0 12px #22c55e, 0 0 24px #4ade8088, 0 0 36px #86efac44;`;
    } else if (value >= 50) {
      // Medium stats: Yellow glow
      return `box-shadow: 0 0 8px #eab30888;`;
    } else {
      // Low stats: Subtle red glow
      return `box-shadow: 0 0 6px #ef444455;`;
    }
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

{#if hasCardStats(cardType || 'DAD_ARCHETYPE')}
  {#if showRadarChart && !compact}
    <!-- Radar Chart View -->
    <div class="radar-chart-wrapper">
      <RadarChart {stats} rarity={cardRarity} size={180} />
    </div>
  {/if}

  <ul
    class="space-y-1.5 stats-grid"
    class:mt-4={showRadarChart && !compact}
    role="list"
    aria-label="Card statistics"
  >
    {#each statEntries as stat, i}
      <li
        role="listitem"
        class="flex items-center gap-1.5 stat-row cursor-help"
        class:high-stat={stat.isHighStat}
      >
        <div
          role="button"
          tabindex="0"
          aria-label="{stat.name}: {stat.value} out of 100. Press or hold for details."
          class="flex items-center gap-1.5 w-full"
          on:mouseenter={() => activeTooltip = { key: stat.key, element: tooltipTargets[stat.key] }}
          on:mouseleave={() => activeTooltip = null}
          use:tooltipTarget={{ key: stat.key, register: (el) => tooltipTargets[stat.key] = el }}
        >
          <span class="text-xs w-4 drop-shadow-sm stat-icon" aria-hidden="true">{stat.icon}</span>
          <!-- WCAG AA: Increased contrast for stat labels (was text-slate-400) -->
          <span class="text-[9px] text-slate-300 stat-label font-medium uppercase tracking-tight" class:text-white={stat.isHighStat}>{stat.name}</span>
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
          <!-- WCAG AA: Increased contrast for stat values, removed text-shadow (not WCAG compliant) -->
          <span
            class="text-[10px] w-7 text-right font-mono font-bold stat-value text-slate-200"
            class:text-white={stat.isHighStat}
          >
            {formatCardStat(stat.value)}
          </span>
        </div>
      </li>
    {/each}
  </ul>

  <!-- Tooltip for active stat -->
  {#if activeTooltip}
    <StatTooltip
      statKey={activeTooltip.key}
      statValue={stats[activeTooltip.key]}
      triggerElement={activeTooltip.element}
      cardRarity={cardRarity}
    />
  {/if}
{:else}
  <div class="text-center py-3">
    <div class="text-xs font-semibold text-slate-300">No base stats</div>
    <div class="text-[10px] text-slate-500 mt-1">This card uses special effects</div>
  </div>
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

  /* Radar Chart Styling */
  .radar-chart-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.5rem;
  }

</style>
