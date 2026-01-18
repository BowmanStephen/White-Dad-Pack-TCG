import { persistentAtom } from '@nanostores/persistent';
import type { Collection, CollectionMetadata, CollectionState, CollectionStats, Pack, Rarity, CollectionCompletion } from '../types';
import { RARITY_ORDER } from '../types';
import { trackEvent } from './analytics';
import { safeJsonParse } from '../lib/utils/safe-parse';
import { createDateEncoder } from '../lib/utils/encoders';
import { createStorageError, logError } from '@/lib/utils/errors';
import { calculateCollectionCompletion, getCompletionSummary, getNewlyAchievedMilestones, calculateBonusPacksFromMilestones } from '../lib/collection/completion';

// Initialize empty rarity counts
function initializeRarityCounts(): Record<Rarity, number> {
  return {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };
}

// Custom encoder for Collection type (handles Date serialization)
const baseCollectionEncoder = createDateEncoder<Collection>({
  dateFields: ['metadata.created', 'metadata.lastOpenedAt', 'packs.openedAt'],
});

const collectionEncoder = {
  encode(data: Collection): string {
    return baseCollectionEncoder.encode(data);
  },
  decode(str: string): Collection {
    const data = safeJsonParse<Collection>(str);
    if (!data) {
      // Return empty collection if parsing fails
      return {
        packs: [],
        metadata: {
          totalPacksOpened: 0,
          lastOpenedAt: null,
          uniqueCards: [],
          rarePulls: 0,
          holoPulls: 0,
          created: new Date(),
          rarityCounts: initializeRarityCounts(), // Initialize rarity counts (US107)
        },
      };
    }
    return baseCollectionEncoder.decode(JSON.stringify(data));
  },
};

// Check if LocalStorage is available and has space
export function checkStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Get current LocalStorage usage
export function getStorageUsage(): { used: number; total: number } {
  let total = 0;
  let used = 0;

  if (typeof localStorage !== 'undefined') {
    // Most browsers have ~5MB limit
    total = 5 * 1024 * 1024; // 5MB in bytes

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key);
        used += key.length + (item?.length || 0);
      }
    }
  }

  return { used, total };
}

// Collection store with LocalStorage persistence
export const collection = persistentAtom<Collection>(
  'daddeck-collection',
  {
    packs: [],
    metadata: {
      totalPacksOpened: 0,
      lastOpenedAt: null,
      uniqueCards: [],
      rarePulls: 0,
      holoPulls: 0,
    },
  },
  collectionEncoder
);

// Compute rarity counts from all packs (fallback for uncached data)
function computeRarityCounts(packs: Pack[]): Record<Rarity, number> {
  const counts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (const pack of packs) {
    for (const card of pack.cards) {
      counts[card.rarity]++;
    }
  }

  return counts;
}

// Get rarity counts from metadata or compute them
function getRarityCounts(packs: Pack[], metadata: CollectionMetadata): Record<Rarity, number> {
  // Return cached counts if available
  if (metadata.rarityCounts) {
    return metadata.rarityCounts;
  }

  // Fallback: compute from packs (migration for old collections)
  return computeRarityCounts(packs);
}

// Get the reactive collection state for UI components
export function getCollectionState(): CollectionState {
  const current = collection.get();

  return {
    openedPacks: current.packs,
    uniqueCards: current.metadata.uniqueCards,
    totalCards: current.packs.reduce((sum, pack) => sum + pack.cards.length, 0),
    rarityCounts: getRarityCounts(current.packs, current.metadata),
  };
}

// Get computed collection statistics
export function getCollectionStats(): CollectionStats {
  const current = collection.get();
  const rarityCounts = getRarityCounts(current.packs, current.metadata);

  return {
    totalPacks: current.packs.length,
    totalCards: current.packs.reduce((sum, pack) => sum + pack.cards.length, 0),
    uniqueCards: current.metadata.uniqueCards.length,
    rarePulls: rarityCounts.rare,
    epicPulls: rarityCounts.epic,
    legendaryPulls: rarityCounts.legendary,
    mythicPulls: rarityCounts.mythic,
    holoPulls: current.metadata.holoPulls,
    lastOpenedAt: current.metadata.lastOpenedAt,
  };
}

// Add a pack to the collection (alias for US022 compatibility)
export function savePackToCollection(pack: Pack): { success: boolean; error?: string } {
  return addPackToCollection(pack);
}

// Add a pack to the collection
export function addPackToCollection(pack: Pack): { success: boolean; error?: string } {
  try {
    const current = collection.get();

    // Check storage availability
    if (!checkStorageAvailable()) {
      const storageError = createStorageError(
        'LocalStorage is not available. Please enable cookies and local storage in your browser.',
        () => addPackToCollection(pack)
      );
      logError(storageError);
      return {
        success: false,
        error: storageError.message,
      };
    }

    // Check storage quota before saving
    const storage = getStorageUsage();
    const estimatedPackSize = JSON.stringify(pack).length * 2; // Rough estimate in bytes
    if (storage.used + estimatedPackSize > storage.total * 0.9) {
      const storageError = createStorageError(
        'Storage is almost full. Some older packs may need to be deleted.',
        () => addPackToCollection(pack)
      );
      logError(storageError);
      return {
        success: false,
        error: storageError.message,
      };
    }

    // Calculate new unique cards
    const newUniqueCards = [...current.metadata.uniqueCards];
    for (const card of pack.cards) {
      if (!newUniqueCards.includes(card.id)) {
        newUniqueCards.push(card.id);
      }
    }

    // Count rare+ pulls (rare or better)
    const rarePullsInPack = pack.cards.filter(
      (card) => RARITY_ORDER[card.rarity] >= RARITY_ORDER.rare
    ).length;

    // Count holo pulls
    const holoPullsInPack = pack.cards.filter((card) => card.isHolo).length;

    // Incrementally update rarity counts (US107)
    const currentRarityCounts = current.metadata.rarityCounts || initializeRarityCounts();
    const newRarityCounts = { ...currentRarityCounts };
    for (const card of pack.cards) {
      newRarityCounts[card.rarity]++;
    }

    // Update collection with new pack
    collection.set({
      packs: [pack, ...current.packs], // New packs first
      metadata: {
        totalPacksOpened: current.metadata.totalPacksOpened + 1,
        lastOpenedAt: new Date(),
        uniqueCards: newUniqueCards,
        rarePulls: current.metadata.rarePulls + rarePullsInPack,
        holoPulls: current.metadata.holoPulls + holoPullsInPack,
        created: current.metadata.created,
        rarityCounts: newRarityCounts, // Cache rarity counts (US107)
      },
    });

    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to save pack to collection',
      () => addPackToCollection(pack)
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

// Clear the entire collection
export function clearCollection(): { success: boolean; error?: string } {
  try {
    collection.set({
      packs: [],
      metadata: {
        totalPacksOpened: 0,
        lastOpenedAt: null,
        uniqueCards: [],
        rarePulls: 0,
        holoPulls: 0,
        created: new Date(), // Reset creation date when clearing
        rarityCounts: initializeRarityCounts(), // Reset rarity counts (US107)
      },
    });
    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to clear collection',
      () => clearCollection()
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

// Get a pack by ID
export function getPackById(id: string): Pack | undefined {
  const current = collection.get();
  return current.packs.find((pack) => pack.id === id);
}

// Get all packs of a specific rarity
export function getPacksByRarity(rarity: Rarity): Pack[] {
  const current = collection.get();
  return current.packs.filter((pack) => pack.bestRarity === rarity);
}

// Get recent packs (last N packs)
export function getRecentPacks(count: number): Pack[] {
  const current = collection.get();
  return current.packs.slice(0, count);
}

// Export collection data as JSON
export function exportCollection(): string {
  const current = collection.get();
  return JSON.stringify(current, null, 2);
}

// Import collection data from JSON
export function importCollection(
  jsonData: string
): { success: boolean; error?: string; imported?: number } {
  const data = safeJsonParse<Collection>(jsonData);

  if (!data) {
    return { success: false, error: 'Failed to parse collection JSON' };
  }

  // Validate basic structure
  if (!data.packs || !Array.isArray(data.packs)) {
    return { success: false, error: 'Invalid collection data: missing packs array' };
  }

  if (!data.metadata || typeof data.metadata !== 'object') {
    return { success: false, error: 'Invalid collection data: missing metadata' };
  }

  // Recalculate rarity counts if missing (migration for old collections) (US107)
  if (!data.metadata.rarityCounts) {
    data.metadata.rarityCounts = computeRarityCounts(data.packs);
  }

  collection.set(data);
  return { success: true, imported: data.packs.length };
}

// Track collection view event
export function trackCollectionView(): void {
  const stats = getCollectionStats();
  trackEvent({
    type: 'collection_view',
    data: {
      totalPacks: stats.totalPacks,
      totalCards: stats.totalCards,
      uniqueCards: stats.uniqueCards,
    },
  });
}

// Track collection filter event
export function trackCollectionFilter(filterType: string, filterValue: string): void {
  trackEvent({
    type: 'collection_filter',
    data: {
      filterType,
      filterValue,
    },
  });
}

// Track collection sort event
export function trackCollectionSort(sortOption: string): void {
  trackEvent({
    type: 'collection_sort',
    data: {
      sortOption: sortOption as any, // Type assertion for SortOption
    },
  });
}

// ============================================================================
// COLLECTION COMPLETION FUNCTIONS
// ============================================================================

// Cache for completion data to avoid recalculating on every call
let cachedCompletion: CollectionCompletion | null = null;
let cachedCompletionTimestamp: number = 0;
const COMPLETION_CACHE_TTL = 5000; // 5 seconds

/**
 * Get collection completion data
 *
 * @param forceRefresh - Force recalculation even if cached
 * @returns CollectionCompletion object with progress data
 */
export function getCollectionCompletion(forceRefresh = false): CollectionCompletion {
  const now = Date.now();

  // Return cached if still valid
  if (!forceRefresh && cachedCompletion && now - cachedCompletionTimestamp < COMPLETION_CACHE_TTL) {
    return cachedCompletion;
  }

  // Calculate fresh completion data
  const current = collection.get();
  cachedCompletion = calculateCollectionCompletion(current);
  cachedCompletionTimestamp = now;

  return cachedCompletion;
}

/**
 * Get completion summary for UI display
 *
 * @returns Summary object with key metrics
 */
export function getCollectionCompletionSummary() {
  const current = collection.get();
  return getCompletionSummary(current);
}

/**
 * Invalidate completion cache (call after adding packs)
 */
export function invalidateCompletionCache(): void {
  cachedCompletion = null;
  cachedCompletionTimestamp = 0;
}

/**
 * Check for newly achieved milestones after adding a pack
 *
 * @param previousCompletion - Completion state before adding pack
 * @returns Object with new milestones and bonus packs to award
 */
export function checkForNewMilestones(previousCompletion: CollectionCompletion): {
  newMilestones: ReturnType<typeof getNewlyAchievedMilestones>;
  bonusPacks: number;
} {
  const currentCompletion = getCollectionCompletion(true);
  const newMilestones = getNewlyAchievedMilestones(previousCompletion, currentCompletion);
  const bonusPacks = calculateBonusPacksFromMilestones(newMilestones);

  return {
    newMilestones,
    bonusPacks,
  };
}

/**
 * Add pack and check for milestone achievements
 *
 * This is the preferred method for adding packs as it:
 * - Saves the pack to collection
 * - Checks for newly achieved milestones
 * - Returns bonus packs to award
 *
 * @param pack - The pack to add
 * @returns Object with success status, error, and milestone rewards
 */
export function addPackWithMilestoneCheck(pack: Pack): {
  success: boolean;
  error?: string;
  newMilestones: ReturnType<typeof getNewlyAchievedMilestones>;
  bonusPacks: number;
} {
  // Get completion before adding pack
  const previousCompletion = getCollectionCompletion();

  // Add the pack
  const result = addPackToCollection(pack);

  if (!result.success) {
    return {
      ...result,
      newMilestones: [],
      bonusPacks: 0,
    };
  }

  // Invalidate cache and check for new milestones
  invalidateCompletionCache();
  const { newMilestones, bonusPacks } = checkForNewMilestones(previousCompletion);

  return {
    success: true,
    newMilestones,
    bonusPacks,
  };
}
