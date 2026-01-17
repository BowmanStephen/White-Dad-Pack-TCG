<script lang="ts">
  import type { CardStats as CardStatsType, RarityConfig } from '../../types';
  import { STAT_ICONS, STAT_NAMES } from '../../types';

  export let stats: CardStatsType;
  export let rarityConfig: RarityConfig;
  export let compact: boolean = false;

  $: statEntries = Object.entries(stats)
    .map(([key, value]) => ({
      key: key as keyof CardStatsType,
      value: value as number,
      icon: STAT_ICONS[key as keyof CardStatsType],
      name: STAT_NAMES[key as keyof CardStatsType],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, compact ? 3 : 4);

  $: barGradient = `linear-gradient(90deg, ${rarityConfig.color}, ${rarityConfig.color}dd, ${rarityConfig.color}aa)`;
</script>

<div class="space-y-1.5">
  {#each statEntries as stat, i}
    <div class="flex items-center gap-1.5">
      <span class="text-xs w-4 drop-shadow-sm">{stat.icon}</span>
      <span class="text-[9px] text-slate-400 w-14 truncate font-medium uppercase tracking-tight">{stat.name}</span>
      <div class="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden relative">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out relative"
          style="width: {stat.value}%; background: {barGradient}; box-shadow: 0 0 8px {rarityConfig.glowColor}55;"
        >
          <!-- Shimmer effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style="animation-delay: {i * 0.1}s;"></div>
        </div>
      </div>
      <span class="text-[10px] text-slate-300 w-7 text-right font-mono font-bold" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3);">{stat.value}</span>
    </div>
  {/each}
</div>

<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
</style>
