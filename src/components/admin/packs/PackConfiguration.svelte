<script lang="ts">
  /**
   * Pack Configuration Component
   *
   * Configure pack rarity slots and probabilities.
   * Admin only.
   */

  import { hasRole } from '@/stores/admin';
  import { PACK_CONFIG, type PackConfig, type RaritySlot, type Rarity } from '@/types';

  // Check permissions
  if (!hasRole('admin')) {
    alert('Access denied: Admin role required');
    window.location.href = '/admin/dashboard';
  }

  let packConfig: PackConfig = {
    cardsPerPack: 6,
    raritySlots: [
      { slot: 1, guaranteedRarity: 'common' },
      { slot: 2, guaranteedRarity: 'common' },
      { slot: 3, guaranteedRarity: 'common' },
      { slot: 4, rarityPool: true, probability: { uncommon: 0.74, rare: 0.25, epic: 0.009, legendary: 0.0009, mythic: 0.0001 } },
      { slot: 5, rarityPool: true, probability: { uncommon: 0.74, rare: 0.25, epic: 0.009, legendary: 0.0009, mythic: 0.0001 } },
      { slot: 6, rarityPool: true, probability: { rare: 0.879, epic: 0.11, legendary: 0.0109, mythic: 0.0001 } },
    ],
    holoChance: 1/6,
  };

  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const rarityColors: Record<Rarity, string> = {
    common: 'bg-slate-600',
    uncommon: 'bg-blue-600',
    rare: 'bg-amber-600',
    epic: 'bg-purple-600',
    legendary: 'bg-orange-600',
    mythic: 'bg-pink-600',
  };

  function getTotalProbability(slot: RaritySlot): number {
    if (!slot.probability) return 0;
    return Object.values(slot.probability).reduce((sum, val) => sum + val, 0);
  }
</script>

<div class="pack-configuration">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Pack Configuration</h1>
      <p class="text-slate-400">Configure rarity slots and pack probabilities</p>
    </div>
    <button
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
    >
      Save Configuration
    </button>
  </div>

  <!-- Pack Overview -->
  <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Cards Per Pack</label>
        <input
          type="number"
          bind:value={packConfig.cardsPerPack}
          min="1"
          max="10"
          class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Holo Chance</label>
        <div class="flex items-center gap-4">
          <input
            type="range"
            bind:value={packConfig.holoChance}
            min="0"
            max="1"
            step="0.01"
            class="flex-1"
          />
          <span class="text-white font-mono w-16 text-right">{(packConfig.holoChance * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div class="flex items-end">
        <div class="text-slate-400 text-sm">
          <p>Configured for {packConfig.cardsPerPack} cards per pack</p>
          <p>~{(packConfig.holoChance * 100).toFixed(1)}% holo rate</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Rarity Slots -->
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-white">Rarity Slots</h2>

    {#each packConfig.raritySlots as slot}
      <div class="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-white">Slot {slot.slot}</h3>
            {#if slot.guaranteedRarity}
              <p class="text-slate-400">Guaranteed: <span class="capitalize text-white">{slot.guaranteedRarity}</span></p>
            {:else}
              <p class="text-slate-400">Random Pool</p>
            {/if}
          </div>

          {#if slot.probability}
            <div class="text-right">
              <p class="text-sm text-slate-400">Total Probability</p>
              <p class="text-lg font-semibold {Math.abs(getTotalProbability(slot) - 1) < 0.01 ? 'text-green-400' : 'text-red-400'}">
                {(getTotalProbability(slot) * 100).toFixed(1)}%
              </p>
            </div>
          {/if}
        </div>

        {#if slot.probability}
          <!-- Probability Bars -->
          <div class="space-y-2">
            {#each rarities as rarity}
              {@const prob = slot.probability?.[rarity] || 0}
              {@const color = rarityColors[rarity]}
              <div class="flex items-center gap-4">
                <span class="w-24 text-sm text-slate-300 capitalize">{rarity}</span>
                <div class="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full {color} transition-all duration-300"
                    style="width: {prob * 100}%"
                  ></div>
                </div>
                <span class="w-20 text-right text-sm font-mono text-white">{(prob * 100).toFixed(1)}%</span>
                <input
                  type="number"
                  bind:value={slot.probability[rarity]}
                  min="0"
                  max="1"
                  step="0.001"
                  class="w-24 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-slate-400 italic">Fixed rarity slot - no probability configuration needed</p>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Add Slot Button -->
  <button class="mt-4 w-full py-3 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors">
    + Add Rarity Slot
  </button>
</div>
