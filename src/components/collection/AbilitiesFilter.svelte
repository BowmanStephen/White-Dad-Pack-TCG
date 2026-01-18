<script lang="ts">
  import { t } from '@/i18n';

  export type AbilitiesFilterMode = 'any' | 'all' | 'none';

  export let mode: AbilitiesFilterMode = 'any';

  const modes: { value: AbilitiesFilterMode; label: string }[] = [
    { value: 'any', label: 'Any abilities' },
    { value: 'all', label: 'All abilities' },
    { value: 'none', label: 'No abilities' }
  ];
</script>

<div class="abilities-filter">
  <h3 class="text-lg font-bold mb-3">{$t('collection.filters.abilities')}</h3>

  <div class="flex flex-wrap gap-2">
    {#each modes as modeOption}
      <button
        on:click={() => mode = modeOption.value}
        class:btn-secondary={mode !== modeOption.value}
        class:btn-primary={mode === modeOption.value}
        aria-pressed={mode === modeOption.value}
      >
        {modeOption.label}
      </button>
    {/each}
  </div>

  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
    {#if mode === 'any'}
      Show cards with at least one ability
    {:else if mode === 'all'}
      Show cards with all abilities selected
    {:else}
      Show cards with no abilities
    {/if}
  </p>
</div>
