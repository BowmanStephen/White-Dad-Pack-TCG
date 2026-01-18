<script lang="ts">
  import { t } from '@/i18n';

  export type HoloFilterMode = 'all' | 'holoOnly' | 'nonHoloOnly';

  export let mode: HoloFilterMode = 'all';

  const modes: { value: HoloFilterMode; label: string }[] = [
    { value: 'all', label: 'All cards' },
    { value: 'holoOnly', label: 'Holo only' },
    { value: 'nonHoloOnly', label: 'Non-holo only' }
  ];
</script>

<div class="holo-filter">
  <h3 class="text-lg font-bold mb-3">{$t('collection.filters.holoVariant')}</h3>

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
    {#if mode === 'all'}
      Show all cards regardless of holo status
    {:else if mode === 'holoOnly'}
      Show only holographic cards
    {:else}
      Show only non-holographic cards
    {/if}
  </p>
</div>
