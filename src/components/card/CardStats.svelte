<script lang="ts">
  import type { CardStats as CardStatsType, RarityConfig } from '../../types';
  import { STAT_ICONS, STAT_NAMES } from '../../types';
  
  export let stats: CardStatsType;
  export let rarityConfig: RarityConfig;
  export let compact: boolean = false;
  
  // Get top 4 stats for display
  $: statEntries = Object.entries(stats)
    .map(([key, value]) => ({
      key: key as keyof CardStatsType,
      value: value as number,
      icon: STAT_ICONS[key as keyof CardStatsType],
      name: STAT_NAMES[key as keyof CardStatsType],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, compact ? 3 : 4);
</script>

<div class="space-y-1.5">
  {#each statEntries as stat}
    <div class="flex items-center gap-2">
      <span class="text-xs w-4">{stat.icon}</span>
      <span class="text-[10px] text-slate-400 w-16 truncate">{stat.name}</span>
      <div class="flex-1 h-1.5 bg-slate-600/50 rounded-full overflow-hidden">
        <div 
          class="h-full rounded-full transition-all duration-500"
          style="
            width: {stat.value}%;
            background: linear-gradient(90deg, {rarityConfig.color}, {rarityConfig.color}aa);
          "
        ></div>
      </div>
      <span class="text-[10px] text-slate-300 w-6 text-right font-mono">{stat.value}</span>
    </div>
  {/each}
</div>
