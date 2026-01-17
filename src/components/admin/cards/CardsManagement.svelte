<script lang="ts">
  /**
   * Cards Management Component
   *
   * CRUD operations for game cards.
   * Admin only.
   */

  import { onMount } from 'svelte';
  import { hasRole } from '@/stores/admin';
  import {
    cardManagementState,
    setCardEditState,
    setCardSearchQuery,
    setCardRarityFilter,
    setCardTypeFilter,
  } from '@/stores/admin-panel';
  import { CARDS, type Card } from '@/types';

  let cards = CARDS || [];
  let filteredCards: Card[] = [];

  // Subscribe to store
  $: searchQuery = $cardManagementState.searchQuery;
  $: rarityFilter = $cardManagementState.filterRarity;
  $: typeFilter = $cardManagementState.filterType;

  // Filter cards
  $: filteredCards = cards.filter(card => {
    const matchesSearch = !searchQuery ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = !rarityFilter || card.rarity === rarityFilter;
    const matchesType = !typeFilter || card.type === typeFilter;
    return matchesSearch && matchesRarity && matchesType;
  });

  onMount(() => {
    if (!hasRole('admin')) {
      alert('Access denied: Admin role required');
      window.location.href = '/admin/dashboard';
    }
  });
</script>

<div class="cards-management">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Cards Management</h1>
      <p class="text-slate-400">Create, edit, and delete game cards</p>
    </div>
    <button
      on:click={() => setCardEditState('creating')}
      class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
    >
      <span>➕</span>
      <span>Add New Card</span>
    </button>
  </div>

  <!-- Filters -->
  <div class="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Search -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Search</label>
        <input
          type="text"
          bind:value={$cardManagementState.searchQuery}
          on:input={(e) => setCardSearchQuery(e.currentTarget.value)}
          placeholder="Search by name or ID..."
          class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Rarity Filter -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Rarity</label>
        <select
          bind:value={$cardManagementState.filterRarity}
          on:change={(e) => setCardRarityFilter(e.currentTarget.value as any || null)}
          class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
          <option value="mythic">Mythic</option>
        </select>
      </div>

      <!-- Type Filter -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">Type</label>
        <select
          bind:value={$cardManagementState.filterType}
          on:change={(e) => setCardTypeFilter(e.currentTarget.value as any || null)}
          class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="BBQ_DAD">BBQ Dad</option>
          <option value="FIX_IT_DAD">Fix-It Dad</option>
          <option value="GOLF_DAD">Golf Dad</option>
          <option value="COUCH_DAD">Couch Dad</option>
          <option value="LAWN_DAD">Lawn Dad</option>
          <option value="CAR_DAD">Car Dad</option>
          <option value="OFFICE_DAD">Office Dad</option>
          <option value="COOL_DAD">Cool Dad</option>
          <option value="COACH_DAD">Coach Dad</option>
          <option value="CHEF_DAD">Chef Dad</option>
          <option value="HOLIDAY_DAD">Holiday Dad</option>
          <option value="WAREHOUSE_DAD">Warehouse Dad</option>
          <option value="VINTAGE_DAD">Vintage Dad</option>
          <option value="FASHION_DAD">Fashion Dad</option>
          <option value="TECH_DAD">Tech Dad</option>
          <option value="ITEM">Item</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Cards Grid -->
  <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Card</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Rarity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Stats</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700">
          {#each filteredCards as card}
            <tr class="hover:bg-slate-700/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-20 bg-slate-600 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">{card.type === 'ITEM' ? '🎁' : '👨'}</span>
                  </div>
                  <div>
                    <p class="font-medium text-white">{card.name}</p>
                    <p class="text-sm text-slate-400">{card.id}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-slate-300">{card.type.replace('_', ' ')}</span>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full {card.rarity === 'common'
                  ? 'bg-slate-600 text-slate-200'
                  : card.rarity === 'uncommon'
                  ? 'bg-blue-500/20 text-blue-400'
                  : card.rarity === 'rare'
                  ? 'bg-amber-500/20 text-amber-400'
                  : card.rarity === 'epic'
                  ? 'bg-purple-500/20 text-purple-400'
                  : card.rarity === 'legendary'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-pink-500/20 text-pink-400'}">
                  {card.rarity}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  {#each ['dadJoke', 'grillSkill', 'fixIt'] as stat}
                    {@const value = card.stats[stat]}
                    <div class="text-center">
                      <p class="text-xs text-slate-400">{stat.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p class="text-sm font-semibold text-white">{value}</p>
                    </div>
                  {/each}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button class="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if filteredCards.length === 0}
      <div class="px-6 py-12 text-center">
        <p class="text-slate-400">No cards found matching your filters.</p>
      </div>
    {/if}
  </div>
</div>
