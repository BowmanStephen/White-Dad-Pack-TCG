<script lang="ts">
  import type { CardStats as CardStatsType, RarityConfig, Rarity } from '../../types';
  import { STAT_ICONS, STAT_NAMES } from '../../types';
  import { hasCardStats } from '../../lib/card-types';
  import StatTooltip from './StatTooltip.svelte';
  import { formatCardStat } from '../../lib/utils/formatters';

  interface Props {
    stats: CardStatsType;
    rarityConfig: RarityConfig;
    compact?: boolean;
    cardRarity?: Rarity;
    cardType?: string;
  }

  let { stats, rarityConfig, compact = false, cardRarity = 'rare', cardType = '' }: Props = $props();

  let statEntries = $derived(
    Object.entries(stats)
      .map(([key, value]) => ({
        key: key as keyof CardStatsType,
        value: value as number,
        icon: STAT_ICONS[key as keyof CardStatsType],
        name: STAT_NAMES[key as keyof CardStatsType],
        isHighStat: value >= 80,
      }))
      .sort((a, b) => b.value - a.value)
  );

  function barGradient(value: number): string {
    if (value >= 90) return `linear-gradient(90deg, ${rarityConfig.color}, #ffffff, ${rarityConfig.color})`;
    if (value >= 80) return 'linear-gradient(90deg, #15803d, #22c55e, #4ade80)';
    if (value >= 60) return 'linear-gradient(90deg, #0369a1, #0ea5e9, #38bdf8)';
    if (value >= 40) return 'linear-gradient(90deg, #b45309, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #991b1b, #dc2626, #f87171)';
  }

  function glowStyle(value: number): string {
    if (value >= 90) return `0 0 20px ${rarityConfig.color}, 0 0 40px ${rarityConfig.glowColor}`;
    if (value >= 80) return '0 0 15px #22c55e, 0 0 30px #4ade8077';
    if (value >= 60) return '0 0 12px #0ea5e9, 0 0 24px #38bdf866';
    if (value >= 40) return '0 0 10px #f59e0b77';
    return '0 0 8px #dc262666';
  }

  let activeTooltip = $state<{ key: string; element: HTMLElement } | null>(null);
</script>

{#if hasCardStats(cardType || 'DAD_ARCHETYPE')}
  <ul class="space-y-1.5" role="list" aria-label="Card statistics">
    {#each statEntries as stat}
      <li class="flex items-center gap-1.5" class:text-white={stat.isHighStat}>
        <button
          class="flex items-center gap-1 w-full cursor-help"
          aria-label="{stat.name}: {stat.value} out of 100"
          onmouseenter={(e) => activeTooltip = { key: stat.key, element: e.currentTarget as HTMLElement }}
          onmouseleave={() => activeTooltip = null}
        >
          <span class="text-[10px] w-4" aria-hidden="true">{stat.icon}</span>
          <span
            class="text-[8px] font-bold uppercase tracking-wide w-14 truncate"
            class:text-white={stat.isHighStat}
            class:text-slate-400={!stat.isHighStat}
            style="font-family: var(--font-condensed);"
          >
            {stat.name}
          </span>
          <div class="flex-1 h-[5px] bg-black/50 rounded-sm overflow-hidden" style="border: 1px solid rgba(255,255,255,0.1);">
            <div
              class="h-full rounded-sm"
              style:width="{stat.value}%"
              style:background={barGradient(stat.value)}
              style:box-shadow={glowStyle(stat.value)}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={stat.value}
            ></div>
          </div>
          <span
            class="text-[9px] w-6 text-right font-bold"
            class:text-white={stat.isHighStat}
            class:text-slate-300={!stat.isHighStat}
            style="font-family: var(--font-condensed);"
          >
            {formatCardStat(stat.value)}
          </span>
        </button>
      </li>
    {/each}
  </ul>

  {#if activeTooltip}
    <StatTooltip
      statKey={activeTooltip.key}
      statValue={stats[activeTooltip.key]}
      triggerElement={activeTooltip.element}
      {cardRarity}
    />
  {/if}
{:else}
  <div class="text-center py-3">
    <div class="text-xs font-semibold text-slate-300">No base stats</div>
    <div class="text-[10px] text-slate-500 mt-1">This card uses special effects</div>
  </div>
{/if}
