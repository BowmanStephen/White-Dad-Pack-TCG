<script lang="ts">
  /**
   * UpgradeManager.svelte
   *
   * Main upgrade management interface.
   * Displays all cards available for upgrade and handles selection.
   */

  import { onMount } from 'svelte';
  import {
    upgradeableCards,
    selectedCardId,
    selectCardForUpgrade,
    performUpgrade,
    cancelUpgrade,
  } from '@/stores/upgrade';
  import { collection } from '@/stores/collection';
  import { t } from '@/i18n';
  import Card from '@/components/card/Card.svelte';
  import CardUpgradeModal from './CardUpgradeModal.svelte';

  // Reactive state
  let upgradeableCardsList = $derived($upgradeableCards);
  let selectedId = $derived($selectedCardId);
  let collectionData = $derived($collection);

  // Local state
  let searchQuery = $state('');
  let sortBy = $state<'level' | 'duplicates' | 'name'>('level');

  // Filter and sort cards
  let filteredCards = $derived(() => {
    let cards = [...upgradeableCardsList];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter((c) =>
        c.cardName.toLowerCase().includes(query)
      );
    }

    // Sort
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return a.currentLevel - b.currentLevel;
        case 'duplicates':
          return b.duplicateCount - a.duplicateCount;
        case 'name':
          return a.cardName.localeCompare(b.cardName);
        default:
          return 0;
      }
    });

    return cards;
  })();

  // Get card by ID
  function getCardById(cardId: string) {
    return collectionData?.cards.find((c) => c.id === cardId);
  }

  // Handle card selection
  function handleCardSelect(cardId: string) {
    selectCardForUpgrade(cardId);
  }

  // Handle modal close
  function handleModalClose() {
    cancelUpgrade();
  }
</script>

<div class="upgrade-manager">
  <!-- Header -->
  <div class="upgrade-manager-header">
    <h2 class="text-2xl font-bold text-amber-400 mb-2">
      {$t('upgrade.title')}
    </h2>
    <p class="text-gray-300 mb-6">
      {$t('upgrade.description')}
    </p>
  </div>

  <!-- Controls -->
  <div class="upgrade-controls flex gap-4 mb-6">
    <!-- Search -->
    <div class="flex-1">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder={$t('upgrade.searchPlaceholder')}
        class="input-field w-full"
      />
    </div>

    <!-- Sort -->
    <div>
      <select bind:value={sortBy} class="select-field">
        <option value="level">{$t('upgrade.sortByLevel')}</option>
        <option value="duplicates">{$t('upgrade.sortByDuplicates')}</option>
        <option value="name">{$t('upgrade.sortByName')}</option>
      </select>
    </div>
  </div>

  <!-- Empty State -->
  {#if filteredCards().length === 0}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🔒</div>
      <h3 class="text-xl font-bold text-gray-300 mb-2">
        {$t('upgrade.noCardsTitle')}
      </h3>
      <p class="text-gray-400">
        {$t('upgrade.noCardsDescription')}
      </p>
    </div>
  {:else}
    <!-- Cards Grid -->
    <div class="upgrade-cards-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each filteredCards() as cardInfo}
        {@const card = getCardById(cardInfo.cardId)}

        {#if card}
          <div
            class="upgrade-card-item relative cursor-pointer"
            on:click={() => handleCardSelect(card.id)}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && handleCardSelect(card.id)}
          >
            <!-- Card Preview -->
            <Card {card} size="small" />

            <!-- Upgrade Info Overlay -->
            <div class="upgrade-info-overlay absolute inset-0 bg-black/80 rounded-lg p-3 flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
              <!-- Current Level -->
              <div class="text-amber-400 font-bold text-lg mb-2">
                {$t('upgrade.level', { level: cardInfo.currentLevel })}
              </div>

              <!-- Duplicate Count -->
              <div class="text-gray-300 text-sm mb-3">
                {$t('upgrade.duplicates', { count: cardInfo.duplicateCount })}
              </div>

              <!-- Upgrade Button -->
              <button class="btn-primary text-sm px-4 py-2">
                {$t('upgrade.upgradeButton')}
              </button>
            </div>

            <!-- Star Badge (shows upgrade level) -->
            {#if cardInfo.currentLevel > 0}
              <div class="star-badge absolute top-2 right-2 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                ⭐ {cardInfo.currentLevel}
              </div>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  {/if}

  <!-- Upgrade Modal -->
  {#if selectedId}
    {@const selectedCard = getCardById(selectedId)}
    {#if selectedCard}
      <CardUpgradeModal
        {selectedCard}
        onClose={handleModalClose}
        onConfirm={async () => {
          const result = await performUpgrade(selectedId);
          if (!result.success) {
            alert(result.error || 'Upgrade failed');
          }
        }}
      />
    {/if}
  {/if}
</div>

<style>
  .upgrade-card-item {
    position: relative;
  }

  .upgrade-info-overlay {
    pointer-events: none;
  }

  .upgrade-card-item:hover .upgrade-info-overlay {
    pointer-events: auto;
  }

  .star-badge {
    z-index: 10;
  }
</style>
