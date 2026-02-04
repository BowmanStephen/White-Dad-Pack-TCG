import { atom, computed } from 'nanostores';
import type {
  BatchState,
  BatchConfig,
  BatchProgress,
  BatchSummary,
  Pack,
  PackType,
  DadType,
  Rarity,
  PackCard,
} from '../types';
import { generatePack, getPackConfig } from '../lib/pack/generator';
import { addPackToCollection } from './collection';
import { trackEvent } from './analytics';
import { haptics } from '../lib/utils/haptics';

// ============================================================================
// BATCH STATE MANAGEMENT
// ============================================================================

// Current batch state
export const batchState = atom<BatchState>('idle');

// Batch configuration
export const batchConfig = atom<BatchConfig>({
  totalPacks: 10,
  fastForward: true,
  autoSave: true,
});

// All packs opened in current batch
export const batchPacks = atom<Pack[]>([]);

// Current pack being opened in batch
export const currentBatchPack = atom<Pack | null>(null);

// Current pack index in batch (0-based)
export const currentBatchIndex = atom<number>(0);

// Batch progress tracking
export const batchProgress = atom<BatchProgress>({
  currentPack: 0,
  totalPacks: 0,
  cardsOpened: 0,
  totalCards: 0,
  percentage: 0,
});

// Batch cancellation flag
export const batchCancelled = atom<boolean>(false);

// Batch summary (computed when complete)
export const batchSummary = atom<BatchSummary | null>(null);

// Computed: Check if batch is in progress
export const isBatchInProgress = computed(batchState, (state) => {
  return state === 'preparing' || state === 'opening' || state === 'paused';
});

// Computed: Check if batch is complete
export const isBatchComplete = computed(batchState, (state) => {
  return state === 'complete' || state === 'reviewing';
});

// ============================================================================
// BATCH ACTIONS
// ============================================================================

/**
 * Start opening a batch of packs
 */
export async function startBatch(config: Partial<BatchConfig> = {}): Promise<void> {
  // Reset state
  batchCancelled.set(false);
  batchPacks.set([]);
  currentBatchPack.set(null);
  currentBatchIndex.set(0);
  batchSummary.set(null);

  // Merge with default config
  const finalConfig: BatchConfig = {
    ...batchConfig.get(),
    ...config,
  };

  batchConfig.set(finalConfig);

  // Initialize progress
  batchProgress.set({
    currentPack: 0,
    totalPacks: finalConfig.totalPacks,
    cardsOpened: 0,
    totalCards: finalConfig.totalPacks * 7, // Assume 7 cards per pack
    percentage: 0,
  });

  // Transition to preparing state
  batchState.set('preparing');

  // Track batch start event
  trackEvent({
    type: 'batch_start',
    data: {
      totalPacks: finalConfig.totalPacks,
      fastForward: finalConfig.fastForward,
    },
  });

  // Start opening packs
  await openBatchPacks(finalConfig);
}

/**
 * Open packs in batch with progress tracking
 */
async function openBatchPacks(config: BatchConfig): Promise<void> {
  const { totalPacks, fastForward } = config;
  const packs: Pack[] = [];

  batchState.set('opening');

  for (let i = 0; i < totalPacks; i++) {
    // Check if cancelled
    if (batchCancelled.get()) {
      batchState.set('paused');
      return;
    }

    // Update current index
    currentBatchIndex.set(i);

    // Generate pack
    const packConfig = getPackConfig('standard'); // Use standard pack type
    const pack = generatePack(packConfig);

    // Set current pack for UI
    currentBatchPack.set(pack);

    // Add to collection
    addPackToCollection(pack);

    // Add to batch
    packs.push(pack);

    // Update progress
    const progress = {
      currentPack: i + 1,
      totalPacks,
      cardsOpened: (i + 1) * pack.cards.length,
      totalCards: totalPacks * pack.cards.length,
      percentage: Math.round(((i + 1) / totalPacks) * 100),
    };
    batchProgress.set(progress);

    // Haptic feedback for rare+ cards
    if (pack.bestRarity !== 'common' && pack.bestRarity !== 'uncommon') {
      haptics.cardReveal(pack.bestRarity);
    }

    // Delay if not fast-forward mode
    if (!fastForward) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // All packs opened
  batchPacks.set(packs);

  // Generate summary
  const summary = generateBatchSummary(packs);
  batchSummary.set(summary);

  // Track batch complete event
  trackEvent({
    type: 'batch_complete',
    data: {
      packsOpened: packs.length,
      totalCards: summary.totalCards,
      duration: summary.duration,
      bestRarity: summary.bestPulls[0]?.rarity || 'common',
    },
  });

  // Transition to complete state
  batchState.set('complete');
}

/**
 * Cancel current batch operation
 */
export function cancelBatch(): void {
  batchCancelled.set(true);

  // Track batch cancel event
  trackEvent({
    type: 'batch_cancel',
    data: {
      packsOpened: batchProgress.get().currentPack,
      totalPacks: batchConfig.get().totalPacks,
    },
  });
}

/**
 * Pause batch operation (graceful stop)
 */
export function pauseBatch(): void {
  batchCancelled.set(true);
  batchState.set('paused');
}

/**
 * Resume batch operation from paused state
 */
export async function resumeBatch(): Promise<void> {
  const currentPacks = batchPacks.get();
  const currentIndex = currentBatchIndex.get();
  const config = batchConfig.get();

  // Calculate remaining packs
  const remainingPacks = config.totalPacks - currentIndex;

  if (remainingPacks <= 0) {
    // Batch already complete
    return;
  }

  // Reset cancellation flag
  batchCancelled.set(false);

  // Update config for remaining packs
  const updatedConfig: BatchConfig = {
    ...config,
    totalPacks: remainingPacks,
  };

  // Continue opening packs
  await openBatchPacks(updatedConfig);
}

/**
 * Generate summary statistics from opened packs
 */
function generateBatchSummary(packs: Pack[]): BatchSummary {
  const totalCards = packs.reduce((sum, pack) => sum + pack.cards.length, 0);

  const rarityBreakdown: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  const allCards: PackCard[] = [];

  packs.forEach((pack) => {
    pack.cards.forEach((card) => {
      rarityBreakdown[card.rarity]++;
      allCards.push(card);
    });
  });

  const holoCount = allCards.filter((card) => card.isHolo).length;

  // Find best pulls (top 5 by rarity, then by stats)
  const bestPulls = allCards
    .sort((a, b) => {
      const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
      const aIndex = rarityOrder.indexOf(a.rarity);
      const bIndex = rarityOrder.indexOf(b.rarity);
      if (aIndex !== bIndex) return aIndex - bIndex;

      // Same rarity, sort by total stats
      const aStats = Object.values(a.stats).reduce((sum, val) => sum + val, 0);
      const bStats = Object.values(b.stats).reduce((sum, val) => sum + val, 0);
      return bStats - aStats;
    })
    .slice(0, 5);

  return {
    packsOpened: packs.length,
    totalCards,
    rarityBreakdown,
    holoCount,
    bestPulls,
    duration: 0, // Will be calculated by component
    timestamp: new Date(),
  };
}

/**
 * Reset batch state to idle
 */
export function resetBatch(): void {
  batchState.set('idle');
  batchPacks.set([]);
  currentBatchPack.set(null);
  currentBatchIndex.set(0);
  batchProgress.set({
    currentPack: 0,
    totalPacks: 0,
    cardsOpened: 0,
    totalCards: 0,
    percentage: 0,
  });
  batchCancelled.set(false);
  batchSummary.set(null);
}

/**
 * Go to results review
 */
export function reviewBatchResults(): void {
  batchState.set('reviewing');
}

/**
 * Restart batch with same config
 */
export async function restartBatch(): Promise<void> {
  const config = batchConfig.get();
  resetBatch();
  await startBatch(config);
}
