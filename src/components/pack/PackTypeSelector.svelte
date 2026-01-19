<script lang="ts">
  import type { PackType, DadType } from '../../types';
  import { getPackConfig } from '../../lib/pack/generator';

  // Props
  interface Props {
    onPackTypeSelect: (packType: PackType, themeType?: DadType) => void;
    disabled?: boolean;
  }

  let { onPackTypeSelect, disabled = false }: Props = $props();

  // Selected pack type
  let selectedPackType: PackType = $state<PackType>('standard');
  let selectedThemeType: DadType | undefined = $state<DadType | undefined>();

  // Available dad types for theme packs
  const dadTypes: DadType[] = [
    'BBQ_DAD',
    'FIX_IT_DAD',
    'GOLF_DAD',
    'COUCH_DAD',
    'LAWN_DAD',
    'CAR_DAD',
    'OFFICE_DAD',
    'COOL_DAD',
    'COACH_DAD',
    'CHEF_DAD',
    'HOLIDAY_DAD',
    'WAREHOUSE_DAD',
    'VINTAGE_DAD',
    'FASHION_DAD',
    'TECH_DAD',
  ];

  // Pack type descriptions
  const packDescriptions: Record<PackType, string> = {
    standard: 'Classic pack with balanced rarity distribution',
    premium: 'Higher chance for rare and epic cards, doubled holo chance',
    theme: 'All cards from a specific dad archetype',
  };

  function handlePackTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedPackType = target.value as PackType;

    // Reset theme type when not in theme mode
    if (selectedPackType !== 'theme') {
      selectedThemeType = undefined;
    }

    // Trigger callback with current selection
    onPackTypeSelect(selectedPackType, selectedThemeType);
  }

  function handleThemeTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedThemeType = target.value as DadType;

    // Trigger callback with current selection
    onPackTypeSelect(selectedPackType, selectedThemeType);
  }
</script>

<div class="pack-type-selector mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
  <label for="pack-type" class="block text-sm font-medium text-slate-300 mb-2">
    Pack Type
  </label>
  <select
    id="pack-type"
    bind:value={selectedPackType}
    onchange={handlePackTypeChange}
    disabled={disabled}
    class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <option value="standard">Standard Pack</option>
    <option value="premium">Premium Pack ⭐</option>
    <option value="theme">Theme Pack 🎯</option>
  </select>

  {#if selectedPackType === 'theme'}
    <div class="mt-4">
      <label for="theme-type" class="block text-sm font-medium text-slate-300 mb-2">
        Dad Archetype
      </label>
      <select
        id="theme-type"
        bind:value={selectedThemeType}
        onchange={handleThemeTypeChange}
        disabled={disabled}
        class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#each dadTypes as dadType}
          <option value={dadType}>
            {dadType.replace(/_/g, ' ')}
          </option>
        {/each}
      </select>
    </div>
  {/if}

  <p class="mt-2 text-xs text-slate-400">
    {packDescriptions[selectedPackType]}
  </p>
</div>

<style>
  .pack-type-selector :global(select) {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }
</style>
