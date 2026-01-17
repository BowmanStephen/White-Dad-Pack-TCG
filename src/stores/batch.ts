import { atom, computed } from 'nanostores';
import type {
  BatchConfig,
  BatchProgress,
  BatchState,
  BatchSummary,
  Pack,
  PackCard,
  Rarity,
} from '../types';
import { generatePack } from '../lib/pack/generator';
import { addPackToCollection } from './collection';
import { trackEvent } from './analytics';
import { RARITY_ORDER } from '../types';

// Batch state
export const batchState = atom<BatchState>('idle');

// Batch configuration
export const batchConfig = atom<BatchConfig | null>(null);

// All packs opened in current batch
export const batchPacks = atom<Pack[]>([]);

// Current batch progress
export const batchProgress = atom<BatchProgress>({
  currentPack: 0,
  totalPacks: 0,
  cardsOpened: 0,
  totalCards: 0,
  percentage: 0,
});

// Batch summary (computed after completion)
export const batchSummary = atom<BatchSummary | null>(null);

// Cancel flag for stopping batch mid-execution
export const batchCancelled = atom<boolean>(false);

// Batch error state
export const batchError = atom<string | null>(null);

// Currently reviewing pack index (for review mode)
export const reviewingPackIndex = atom<number>(0);

// Computed: Progress percentage
export const batchPercentage = computed(batchProgress, (progress) => {
  return progress.percentage;
});

// Computed: Check if batch is complete
export const isBatchComplete = computed(batchState, (state) => {
  return state === 'complete';
});

// Computed: Check if batch is running
export const isBatchRunning = computed(batchState, (state) => {
  return state === 'opening' || state === 'preparing';
});

// Computed: Total cards opened so far
export const totalCardsOpened = computed(batchProgress, (progress) => {
  return progress.cardsOpened;
});

// Computed: Currently reviewing pack
export const reviewingPack = computed(
  [batchPacks, reviewingPackIndex],
  (packs, index) => {
    if (index < 0 || index >= packs.length) return null;
    return packs[index];
  }
);

/**
 * Actions
 */

/**
 * Start a new batch pack opening session
 */
export async function startBatch(config: BatchConfig): Promise<void> {
  // Validate config
  if (config.totalPacks < 1 || config.totalPacks > 50) {
    batchError.set('Number of packs must be between 1 and 50');
    return;
  }

  // Reset state
  batchState.set('preparing');
  batchConfig.set(config);
  batchPacks.set([]);
  batchCancelled.set(false);
  batchError.set(null);
  batchSummary.set(null);
  reviewingPackIndex.set(0);

  // Initialize progress
  const cardsPerPack = 6; // Standard pack size
  batchProgress.set({
    currentPack: 0,
    totalPacks: config.totalPacks,
    cardsOpened: 0,
    totalCards: config.totalPacks * cardsPerPack,
    percentage: 0,
  });

  // Transition to opening state
  batchState.set('opening');

  // Track batch start event
  trackEvent({
    type: 'pack_open',
    data: {
      packId: `batch_${Date.now()}`,
      cardCount: config.totalPacks * cardsPerPack,
    },
  });

  // Start opening packs
  await openBatchPacks(config);
}

/**
 * Open packs sequentially
 */
async function openBatchPacks(config: BatchConfig): Promise<void> {
  const startTime = Date.now();
  const packs: Pack[] = [];
  const rarityBreakdown: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (let i = 0; i < config.totalPacks; i++) {
    // Check for cancellation
    if (batchCancelled.get()) {
      batchState.set('paused');
      return;
    }

    try {
      // Generate pack
      const pack = await Promise.resolve(generatePack());

      // Validate pack
      if (!pack || pack.cards.length === 0) {
        throw new Error(`Generated pack ${i + 1} has no cards`);
      }

      // Reveal all cards immediately (fast-forward mode)
      const revealedCards = pack.cards.map((card) => ({
        ...card,
        isRevealed: true,
      }));

      const revealedPack: Pack = {
        ...pack,
        cards: revealedCards,
      };

      // Save to collection if auto-save is enabled
      if (config.autoSave) {
        addPackToCollection(revealedPack);
      }

      packs.push(revealedPack);

      // Track rarity breakdown
      revealedPack.cards.forEach((card) => {
        rarityBreakdown[card.rarity]++;
      });

      // Update progress
      const currentPackNumber = i + 1;
      const cardsOpened = currentPackNumber * pack.cards.length;
      const percentage = (currentPackNumber / config.totalPacks) * 100;

      batchProgress.set({
        currentPack: currentPackNumber,
        totalPacks: config.totalPacks,
        cardsOpened,
        totalCards: config.totalPacks * pack.cards.length,
        percentage,
      });

      // Update packs list
      batchPacks.set([...packs]);

      // Minimal delay for UX (50ms between packs in fast-forward)
      if (!config.fastForward) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error(`Error opening pack ${i + 1}:`, error);
      batchError.set(`Failed to open pack ${i + 1}`);
      // Continue with next pack
    }
  }

  // Calculate summary
  const duration = Date.now() - startTime;
  const holoCount = packs.reduce(
    (sum, pack) => sum + pack.cards.filter((c) => c.isHolo).length,
    0
  );

  // Find best pulls (top 3 by rarity)
  const allCards = packs.flatMap((pack) => pack.cards);
  const sortedCards = [...allCards].sort((a, b) => {
    const rarityDiff = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    // Tie-breaker: holo cards first
    return b.isHolo ? 1 : -1;
  });
  const bestPulls = sortedCards.slice(0, 3);

  const summary: BatchSummary = {
    packsOpened: packs.length,
    totalCards: allCards.length,
    rarityBreakdown,
    holoCount,
    bestPulls,
    duration,
    timestamp: new Date(),
  };

  batchSummary.set(summary);
  batchState.set('complete');
}

/**
 * Cancel batch opening
 */
export function cancelBatch(): void {
  batchCancelled.set(true);
  batchState.set('paused');
}

/**
 * Resume batch opening (after pause)
 */
export async function resumeBatch(): Promise<void> {
  const config = batchConfig.get();
  if (!config) {
    batchError.set('No batch configuration found');
    return;
  }

  const currentProgress = batchProgress.get();
  const remainingPacks = config.totalPacks - currentProgress.currentPack;

  if (remainingPacks <= 0) {
    batchState.set('complete');
    return;
  }

  // Update config for remaining packs
  const updatedConfig: BatchConfig = {
    ...config,
    totalPacks: remainingPacks,
  };

  batchCancelled.set(false);
  batchState.set('opening');

  // Continue opening remaining packs
  await openRemainingPacks(updatedConfig, currentProgress.currentPack);
}

/**
 * Open remaining packs after resume
 */
async function openRemainingPacks(
  config: BatchConfig,
  startIndex: number
): Promise<void> {
  const packs = batchPacks.get();
  const startTime = Date.now() - (batchSummary.get()?.duration || 0);

  for (let i = 0; i < config.totalPacks; i++) {
    if (batchCancelled.get()) {
      batchState.set('paused');
      return;
    }

    try {
      const pack = await Promise.resolve(generatePack());

      if (!pack || pack.cards.length === 0) {
        throw new Error(`Generated pack ${startIndex + i + 1} has no cards`);
      }

      const revealedCards = pack.cards.map((card) => ({
        ...card,
        isRevealed: true,
      }));

      const revealedPack: Pack = {
        ...pack,
        cards: revealedCards,
      };

      if (config.autoSave) {
        addPackToCollection(revealedPack);
      }

      packs.push(revealedPack);
      batchPacks.set([...packs]);

      const currentPackNumber = startIndex + i + 1;
      const totalPacks = batchProgress.get().totalPacks;
      const cardsOpened = currentPackNumber * pack.cards.length;
      const percentage = (currentPackNumber / totalPacks) * 100;

      batchProgress.set({
        currentPack: currentPackNumber,
        totalPacks,
        cardsOpened,
        totalCards: totalPacks * pack.cards.length,
        percentage,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, config.fastForward ? 50 : 500)
      );
    } catch (error) {
      console.error(`Error opening pack ${startIndex + i + 1}:`, error);
      batchError.set(`Failed to open pack ${startIndex + i + 1}`);
    }
  }

  // Calculate final summary
  const allCards = packs.flatMap((pack) => pack.cards);
  const rarityBreakdown: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  allCards.forEach((card) => {
    rarityBreakdown[card.rarity]++;
  });

  const holoCount = packs.reduce(
    (sum, pack) => sum + pack.cards.filter((c) => c.isHolo).length,
    0
  );

  const sortedCards = [...allCards].sort((a, b) => {
    const rarityDiff = RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    if (rarityDiff !== 0) return rarityDiff;
    return b.isHolo ? 1 : -1;
  });
  const bestPulls = sortedCards.slice(0, 3);

  const duration = Date.now() - startTime;

  const summary: BatchSummary = {
    packsOpened: packs.length,
    totalCards: allCards.length,
    rarityBreakdown,
    holoCount,
    bestPulls,
    duration,
    timestamp: new Date(),
  };

  batchSummary.set(summary);
  batchState.set('complete');
}

/**
 * Start reviewing a specific pack
 */
export function reviewPack(index: number): void {
  const packs = batchPacks.get();
  if (index < 0 || index >= packs.length) return;

  reviewingPackIndex.set(index);
  batchState.set('reviewing');
}

/**
 * Next pack in review mode
 */
export function nextReviewPack(): void {
  const packs = batchPacks.get();
  const currentIndex = reviewingPackIndex.get();

  if (currentIndex < packs.length - 1) {
    reviewingPackIndex.set(currentIndex + 1);
  } else {
    // Done reviewing, go back to summary
    batchState.set('complete');
    reviewingPackIndex.set(0);
  }
}

/**
 * Previous pack in review mode
 */
export function prevReviewPack(): void {
  const currentIndex = reviewingPackIndex.get();
  if (currentIndex > 0) {
    reviewingPackIndex.set(currentIndex - 1);
  }
}

/**
 * Exit review mode
 */
export function exitReviewMode(): void {
  reviewingPackIndex.set(0);
  batchState.set('complete');
}

/**
 * Reset batch state
 */
export function resetBatch(): void {
  batchState.set('idle');
  batchConfig.set(null);
  batchPacks.set([]);
  batchProgress.set({
    currentPack: 0,
    totalPacks: 0,
    cardsOpened: 0,
    totalCards: 0,
    percentage: 0,
  });
  batchSummary.set(null);
  batchCancelled.set(false);
  batchError.set(null);
  reviewingPackIndex.set(0);
}
