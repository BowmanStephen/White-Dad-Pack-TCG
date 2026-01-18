<script lang="ts">
  import { t } from '@/i18n';
  import { STAT_DESCRIPTIONS } from '@/types';

  export interface StatRange {
    stat: keyof CardStats;
    min: number;
    max: number;
  }

  export const stats: (keyof CardStats)[] = [
    'dadJoke',
    'grillSkill',
    'fixIt',
    'napPower',
    'remoteControl',
    'thermostat',
    'sockSandal',
    'beerSnob'
  ];

  export let filters: StatRange[] = [];

  function addFilter(stat: keyof CardStats) {
    filters = [
      ...filters,
      { stat, min: 0, max: 100 }
    ];
  }

  function removeFilter(index: number) {
    filters = filters.filter((_, i) => i !== index);
  }

  function updateFilter(index: number, field: 'min' | 'max', value: number) {
    filters = filters.map((f, i) =>
      i === index ? { ...f, [field]: Math.max(0, Math.min(100, value)) } : f
    );
  }

  const statLabels: Record<keyof CardStats, string> = {
    dadJoke: 'Dad Joke',
    grillSkill: 'Grill Skill',
    fixIt: 'Fix-It',
    napPower: 'Nap Power',
    remoteControl: 'Remote Control',
    thermostat: 'Thermostat',
    sockSandal: 'Sock & Sandal',
    beerSnob: 'Beer Snob'
  };
</script>

<div class="stat-range-filter">
  <h3 class="text-lg font-bold mb-3">{$t('collection.filters.statRange')}</h3>

  {#if filters.length === 0}
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
      {$t('collection.filters.noStatFilters')}
    </p>
  {/if}

  <div class="space-y-3 mb-3">
    {#each filters as filter, index (index)}
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold text-sm">{statLabels[filter.stat]}</span>
          <button
            on:click={() => removeFilter(index)}
            class="text-red-500 hover:text-red-700 text-sm font-bold"
            aria-label="Remove filter"
          >
            ×
          </button>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex-1">
            <label class="text-xs text-gray-600 dark:text-gray-400">
              {$t('collection.filters.min')}:
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={filter.min}
              on:input={(e) => updateFilter(index, 'min', parseInt(e.currentTarget.value) || 0)}
              class="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            />
          </div>

          <span class="text-gray-500">–</span>

          <div class="flex-1">
            <label class="text-xs text-gray-600 dark:text-gray-400">
              {$t('collection.filters.max')}:
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={filter.max}
              on:input={(e) => updateFilter(index, 'max', parseInt(e.currentTarget.value) || 0)}
              class="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            />
          </div>
        </div>
      </div>
    {/each}
  </div>

  <select
    on:change={(e) => {
      const stat = e.currentTarget.value as keyof CardStats;
      if (stat) addFilter(stat);
      e.currentTarget.value = '';
    }}
    class="input-field w-full"
  >
    <option value="">{$t('collection.filters.addStatFilter')}</option>
    {#each stats as stat}
      {@const label = statLabels[stat]}
      {@const alreadyFiltered = filters.some(f => f.stat === stat)}
      {#if !alreadyFiltered}
        <option value={stat}>{label}</option>
      {/if}
    {/each}
  </select>
</div>
