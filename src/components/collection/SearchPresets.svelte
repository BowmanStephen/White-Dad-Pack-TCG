<script lang="ts">
  import { t } from '@/i18n';
  import type { SearchPreset, AdvancedCollectionFilters } from '@/types/collection';

  export let currentFilters: AdvancedCollectionFilters;
  export let presets: SearchPreset[] = [];
  export let onSavePreset: (name: string) => void;
  export let onLoadPreset: (preset: SearchPreset) => void;
  export let onDeletePreset: (presetId: string) => void;

  let showSaveModal = $state(false);
  let presetName = $state('');

  function handleSavePreset() {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      presetName = '';
      showSaveModal = false;
    }
  }

  function hasActiveFilters(): boolean {
    return (
      currentFilters.statRanges.length > 0 ||
      currentFilters.abilitiesMode !== 'any' ||
      currentFilters.holoMode !== 'all'
    );
  }
</script>

<div class="search-presets">
  <div class="flex justify-between items-center mb-3">
    <h3 class="text-lg font-bold">{$t('collection.presets.title')}</h3>
    <button
      on:click={() => showSaveModal = true}
      class:opacity-50={!hasActiveFilters()}
      class:cursor-not-allowed={!hasActiveFilters()}
      class="btn-primary text-sm px-3 py-1"
      disabled={!hasActiveFilters()}
      aria-label="Save current filters as preset"
    >
      + {$t('collection.presets.save')}
    </button>
  </div>

  {#if presets.length === 0}
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
      {$t('collection.presets.noPresets')}
    </p>
  {:else}
    <div class="space-y-2 mb-3">
      {#each presets as preset (preset.id)}
        <div class="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
          <button
            on:click={() => onLoadPreset(preset)}
            class="flex-1 text-left hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-2 py-1 transition-colors"
          >
            <span class="font-semibold text-sm">{preset.name}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 block">
              {new Date(preset.createdAt).toLocaleDateString()}
            </span>
          </button>

          <button
            on:click={() => onDeletePreset(preset.id)}
            class="text-red-500 hover:text-red-700 px-2 py-1"
            aria-label="Delete preset"
          >
            ×
          </button>
        </div>
      {/each}
    </div>
  {/if}

  {#if showSaveModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold mb-4">{$t('collection.presets.saveAs')}</h3>

        <input
          type="text"
          bind:value={presetName}
          placeholder="{$t('collection.presets.namePlaceholder')}"
          class="input-field w-full mb-4"
          on:keydown={(e) => {
            if (e.key === 'Enter') handleSavePreset();
            if (e.key === 'Escape') showSaveModal = false;
          }}
          autofocus
        />

        <div class="flex gap-2 justify-end">
          <button
            on:click={() => showSaveModal = false}
            class="btn-secondary"
          >
            {$t('common.cancel')}
          </button>
          <button
            on:click={handleSavePreset}
            disabled={!presetName.trim()}
            class:opacity-50={!presetName.trim()}
            class="btn-primary"
          >
            {$t('common.save')}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
