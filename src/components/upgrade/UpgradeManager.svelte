<script lang="ts">
  import { onMount } from 'svelte';
  import type { Pack, PackCard, UpgradeEntry } from '../../types';
  import { collection } from '../../stores/collection';
  import { getUpgradeState, upgradeCard, getCardUpgradeLevel, getCardUpgradeHistory, refreshAvailableUpgrades } from '../../stores/upgrade';
  import { countCardDuplicates, getCardInstances, getUpgradeProgress } from '../../lib/upgrade';
  import { DEFAULT_UPGRADE_CONFIG } from '../../types';
  import Card from '../card/Card.svelte';
  import CardUpgradeModal from './CardUpgradeModal.svelte';

  // State
  let packs = $state<Pack[]>([]);
  let availableCards = $state<Array<{ card: PackCard; duplicateCount: number; upgradeLevel: number }>>([]);
  let allCards = $state<Array<{ card: PackCard; duplicateCount: number; upgradeLevel: number }>>([]);
  let selectedCard = $state<PackCard | null>(null);
  let filter = $state<'available' | 'all'>('available');

  // Modal state
  let showModal = $state(false);
  let modalCard = $state<PackCard | null>(null);
  let modalUpgradeLevel = $state(0);
  let modalUpgradeHistory = $state<UpgradeEntry[]>([]);
  let modalDuplicateCount = $state(0);
  let isUpgrading = $state(false);

  onMount(() => {
    loadCollection();
    // Subscribe to collection changes
    const unsub = collection.subscribe(() => {
      loadCollection();
    });
    return unsub;
  });

  function loadCollection() {
    const current = collection.get();
    packs = current.packs;

    // Group cards by ID and count duplicates
    const cardsMap = new Map<string, PackCard>();
    const duplicateCounts = new Map<string, number>();

    for (const pack of packs) {
      for (const card of pack.cards) {
        if (!cardsMap.has(card.id)) {
          cardsMap.set(card.id, card);
          duplicateCounts.set(card.id, 0);
        }
        duplicateCounts.set(card.id, (duplicateCounts.get(card.id) || 0) + 1);
      }
    }

    // Build card list with upgrade info
    const cardList: Array<{ card: PackCard; duplicateCount: number; upgradeLevel: number }> = [];
    for (const [cardId, card] of cardsMap) {
      cardList.push({
        card,
        duplicateCount: duplicateCounts.get(cardId) || 0,
        upgradeLevel: getCardUpgradeLevel(cardId),
      });
    }

    // Sort by: available upgrades first, then by upgrade level (desc), then by rarity
    cardList.sort((a, b) => {
      // Available upgrades first
      const aAvailable = a.duplicateCount >= DEFAULT_UPGRADE_CONFIG.costPerLevel && a.upgradeLevel < DEFAULT_UPGRADE_CONFIG.maxLevel;
      const bAvailable = b.duplicateCount >= DEFAULT_UPGRADE_CONFIG.costPerLevel && b.upgradeLevel < DEFAULT_UPGRADE_CONFIG.maxLevel;
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;

      // Then by upgrade level (desc)
      if (a.upgradeLevel !== b.upgradeLevel) return b.upgradeLevel - a.upgradeLevel;

      // Then by rarity
      const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
      return rarityOrder.indexOf(a.card.rarity) - rarityOrder.indexOf(b.card.rarity);
    });

    allCards = cardList;
    availableCards = cardList.filter(
      (c) => c.duplicateCount >= DEFAULT_UPGRADE_CONFIG.costPerLevel && c.upgradeLevel < DEFAULT_UPGRADE_CONFIG.maxLevel
    );

    // Refresh upgrade state
    refreshAvailableUpgrades();
  }

  function openUpgradeModal(cardData: { card: PackCard; duplicateCount: number; upgradeLevel: number }) {
    modalCard = cardData.card;
    modalDuplicateCount = cardData.duplicateCount;
    modalUpgradeLevel = cardData.upgradeLevel;
    modalUpgradeHistory = getCardUpgradeHistory(cardData.card.id);
    showModal = true;
  }

  async function handleUpgrade() {
    if (!modalCard) return { success: false, error: 'No card selected' };

    isUpgrading = true;
    try {
      const result = await upgradeCard(modalCard.id);

      if (result.success) {
        // Refresh the collection display
        loadCollection();
      }

      return result;
    } finally {
      isUpgrading = false;
    }
  }

  function getFilteredCards() {
    return filter === 'available' ? availableCards : allCards;
  }
</script>

<div class="upgrade-manager">
  <!-- Filter Tabs -->
  <div class="filter-tabs">
    <button
      class="tab"
      class:active={filter === 'available'}
      onclick={() => filter = 'available'}
    >
      <span class="tab-icon">⚡</span>
      <span class="tab-name">Ready to Upgrade</span>
      <span class="tab-count">{availableCards.length}</span>
    </button>
    <button
      class="tab"
      class:active={filter === 'all'}
      onclick={() => filter = 'all'}
    >
      <span class="tab-icon">📚</span>
      <span class="tab-name">All Cards</span>
      <span class="tab-count">{allCards.length}</span>
    </button>
  </div>

  <!-- Stats Summary -->
  <div class="stats-summary">
    <div class="stat-card">
      <div class="stat-value">{availableCards.length}</div>
      <div class="stat-label">Ready to Upgrade</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{allCards.filter((c) => c.upgradeLevel > 0).length}</div>
      <div class="stat-label">Upgraded Cards</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{allCards.filter((c) => c.upgradeLevel >= DEFAULT_UPGRADE_CONFIG.maxLevel).length}</div>
      <div class="stat-label">Max Level Cards</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{allCards.reduce((sum, c) => sum + c.upgradeLevel, 0)}</div>
      <div class="stat-label">Total Upgrades</div>
    </div>
  </div>

  <!-- Empty State -->
  {#if getFilteredCards().length === 0}
    <div class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>No Cards Found</h3>
      <p>
        {#if filter === 'available'}
          You don't have any cards with 5+ duplicates. Open more packs to get duplicates!
        {:else}
          Your collection is empty. Open some packs to get started!
        {/if}
      </p>
      <a href="/pack" class="btn-primary">Open Packs</a>
    </div>
  {:else}
    <!-- Cards Grid -->
    <div class="cards-grid">
      {#each getFilteredCards() as cardData}
        <div class="card-item" class:available={cardData.duplicateCount >= DEFAULT_UPGRADE_CONFIG.costPerLevel && cardData.upgradeLevel < DEFAULT_UPGRADE_CONFIG.maxLevel}>
          <div class="card-wrapper" onclick={() => openUpgradeModal(cardData)}>
            <Card
              card={cardData.card}
              size="md"
              interactive={false}
              showUpgradeButton={false}
            />
            {#if cardData.upgradeLevel > 0}
              <div class="upgrade-indicator">
                {#each Array(cardData.upgradeLevel) as _}
                  <span class="upgrade-star">⬡</span>
                {/each}
              </div>
            {/if}
            {#if cardData.duplicateCount >= DEFAULT_UPGRADE_CONFIG.costPerLevel && cardData.upgradeLevel < DEFAULT_UPGRADE_CONFIG.maxLevel}
              <div class="available-badge">⚡ Ready</div>
            {/if}
          </div>
          <div class="card-info">
            <div class="card-name">{cardData.card.name}</div>
            <div class="card-stats">
              <span class="duplicates">{cardData.duplicateCount}x</span>
              <span class="level">Lv.{cardData.upgradeLevel}/{DEFAULT_UPGRADE_CONFIG.maxLevel}</span>
            </div>
            {#if cardData.duplicateCount >= DEFAULT_UPGRADE_CONFIG.costPerLevel && cardData.upgradeLevel < DEFAULT_UPGRADE_CONFIG.maxLevel}
              <button
                class="btn-upgrade-small"
                onclick={(e) => { e.stopPropagation(); openUpgradeModal(cardData); }}
              >
                Upgrade
              </button>
            {:else if cardData.upgradeLevel >= DEFAULT_UPGRADE_CONFIG.maxLevel}
              <div class="maxed-badge">Maxed</div>
            {:else}
              <div class="progress-mini">
                <div class="progress-fill" style="width: {(cardData.duplicateCount / DEFAULT_UPGRADE_CONFIG.costPerLevel) * 100}%;"></div>
                <span class="progress-text">{cardData.duplicateCount}/{DEFAULT_UPGRADE_CONFIG.costPerLevel}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Upgrade Modal -->
  {#if showModal && modalCard}
    <CardUpgradeModal
      bind:showModal={showModal}
      card={modalCard}
      currentLevel={modalUpgradeLevel}
      upgradeHistory={modalUpgradeHistory}
      duplicateCount={modalDuplicateCount}
      onUpgrade={handleUpgrade}
    />
  {/if}
</div>

<style>
  .upgrade-manager {
    max-width: 1400px;
    margin: 0 auto;
  }

  .filter-tabs {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(100, 116, 139, 0.5);
    color: white;
  }

  .tab.active {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border-color: #f59e0b;
    color: white;
  }

  .tab-count {
    padding: 0.125rem 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    padding: 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.5rem;
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #fbbf24;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.5rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 0.5rem 0;
  }

  .empty-state p {
    font-size: 0.875rem;
    color: #94a3b8;
    max-width: 400px;
    margin: 0 0 1.5rem 0;
  }

  .btn-primary {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-weight: 600;
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .card-item {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 0.75rem;
    padding: 1rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .card-item:hover {
    border-color: rgba(251, 191, 36, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .card-item.available {
    border-color: rgba(251, 191, 36, 0.3);
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(15, 23, 42, 0.6));
  }

  .card-wrapper {
    position: relative;
    margin-bottom: 1rem;
  }

  .upgrade-indicator {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    gap: 0.125rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.4));
    border: 1px solid rgba(251, 191, 36, 0.5);
    border-radius: 9999px;
  }

  .upgrade-star {
    font-size: 0.75rem;
  }

  .available-badge {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    border-radius: 9999px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .card-info {
    text-align: center;
  }

  .card-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-stats {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .duplicates {
    font-weight: 600;
  }

  .level {
    color: #fbbf24;
  }

  .btn-upgrade-small {
    width: 100%;
    padding: 0.5rem;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-upgrade-small:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  }

  .maxed-badge {
    padding: 0.5rem;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
    border: 1px solid rgba(251, 191, 36, 0.3);
    color: #fbbf24;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 0.375rem;
  }

  .progress-mini {
    position: relative;
    width: 100%;
    height: 24px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.375rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4b5563, #6b7280);
    transition: width 0.3s ease;
  }

  .progress-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    color: #94a3b8;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    .cards-grid {
      grid-template-columns: 1fr;
    }

    .stats-summary {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
