<script lang="ts">
  /**
   * CardUpgradeModal.svelte
   *
   * Modal for confirming and executing card upgrades.
   * Shows current stats, projected stats, and cost.
   */

  import { createEventDispatcher } from 'svelte';
  import { selectedCardUpgrade, cardUpgrades } from '@/stores/upgrade';
  import type { CardInCollection } from '@/types/card';
  import { t } from '@/i18n';
  import Card from '@/components/card/Card.svelte';
  import { DEFAULT_UPGRADE_CONFIG } from '@/types/upgrade';

  // Props
  interface Props {
    selectedCard: CardInCollection;
    onClose: () => void;
    onConfirm: () => Promise<void>;
  }

  let { selectedCard, onClose, onConfirm }: Props = $props();

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Reactive state
  let upgradeInfo = $derived($selectedCardUpgrade);
  let isProcessing = $state(false);

  // Get current stats display
  function getStatDisplay(key: keyof typeof selectedCard.stats) {
    const current = selectedCard.stats[key];
    const projected = Math.min(100, current + DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel);
    return { current, projected };
  }

  // Handle confirm
  async function handleConfirm() {
    if (!upgradeInfo?.canUpgradeFurther) return;

    isProcessing = true;
    try {
      await onConfirm();
      onClose();
    } finally {
      isProcessing = false;
    }
  }

  // Handle cancel
  function handleCancel() {
    onClose();
  }

  // Handle backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }

  // Handle keyboard (ESC to close)
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Modal Backdrop -->
<div
  class="modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  on:click={handleBackdropClick}
  role="dialog"
  aria-modal="true"
  aria-labelledby="upgrade-modal-title"
>
  <!-- Modal Content -->
  <div class="modal-content bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
    <!-- Header -->
    <div class="modal-header flex justify-between items-start mb-6">
      <h2
        id="upgrade-modal-title"
        class="text-2xl font-bold text-amber-400"
      >
        {$t('upgrade.modalTitle')}
      </h2>

      <button
        on:click={handleCancel}
        class="modal-close-btn text-gray-400 hover:text-white transition-colors"
        aria-label={$t('common.close')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Card Preview -->
    <div class="flex justify-center mb-6">
      <Card card={selectedCard} size="medium" />
    </div>

    <!-- Upgrade Details -->
    <div class="upgrade-details space-y-4 mb-6">
      <!-- Current Level -->
      <div class="flex justify-between items-center bg-slate-700/50 rounded-lg p-4">
        <span class="text-gray-300">{$t('upgrade.currentLevel')}</span>
        <span class="text-2xl font-bold text-amber-400">
          {upgradeInfo?.level || 0} / {DEFAULT_UPGRADE_CONFIG.maxLevel}
        </span>
      </div>

      <!-- Cost -->
      <div class="flex justify-between items-center bg-slate-700/50 rounded-lg p-4">
        <span class="text-gray-300">{$t('upgrade.cardsToConsume')}</span>
        <span class="text-xl font-bold text-red-400">
          {DEFAULT_UPGRADE_CONFIG.costPerLevel} {$t('upgrade.duplicates')}
        </span>
      </div>

      <!-- Duplicates Available -->
      <div class="flex justify-between items-center bg-slate-700/50 rounded-lg p-4">
        <span class="text-gray-300">{$t('upgrade.duplicatesAvailable')}</span>
        <span class="text-xl font-bold text-green-400">
          {upgradeInfo?.duplicateCount || 0}
        </span>
      </div>

      <!-- Stat Changes -->
      <div class="stat-changes bg-slate-700/50 rounded-lg p-4">
        <h3 class="text-lg font-bold text-amber-400 mb-3">
          {$t('upgrade.statChanges')}
        </h3>

        <div class="space-y-2">
          {#each Object.keys(selectedCard.stats) as statKey}
            {@const display = getStatDisplay(statKey as keyof typeof selectedCard.stats)}
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-300 capitalize">{statKey}</span>
              <div class="flex items-center gap-3">
                <span class="text-gray-400">{display.current}</span>
                <span class="text-green-400">→</span>
                <span class="text-green-400 font-bold">
                  {display.projected}
                </span>
                <span class="text-xs text-amber-400">+{DEFAULT_UPGRADE_CONFIG.statIncreasePerLevel}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Warning if max level -->
      {#if !upgradeInfo?.canUpgradeFurther}
        <div class="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <p class="text-red-300 font-bold">
            {$t('upgrade.maxLevelReached')}
          </p>
        </div>
      {/if}
    </div>

    <!-- Action Buttons -->
    <div class="modal-actions flex gap-3 justify-end">
      <button
        on:click={handleCancel}
        disabled={isProcessing}
        class="btn-secondary"
      >
        {$t('common.cancel')}
      </button>

      {#if upgradeInfo?.canUpgradeFurther}
        <button
          on:click={handleConfirm}
          disabled={isProcessing || (upgradeInfo?.duplicateCount || 0) < DEFAULT_UPGRADE_CONFIG.costPerLevel}
          class="btn-primary"
        >
          {#if isProcessing}
            <span class="inline-block animate-spin mr-2">⏳</span>
            {$t('upgrade.upgrading')}
          {:else}
            {$t('upgrade.confirmUpgrade')}
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div>
