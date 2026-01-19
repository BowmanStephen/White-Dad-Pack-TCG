import { atom } from 'nanostores';
import type { Collection, CollectionMetadata, CollectionState, CollectionStats, Pack, Rarity } from '../types';
import { RARITY_ORDER } from '../types';
import { trackEvent } from './analytics';
import { createStorageError, logError } from '@/lib/utils/errors';
import {
  loadCollection as loadFromIndexedDB,
  saveCollection as saveToIndexedDB,
  clearCollection as clearFromIndexedDBStorage,
  needsLocalStorageMigration,
  migrateFromLocalStorage,
  getStorageUsage,
  isStorageAvailable
} from '@/lib/storage/indexeddb';
import { updatePityCounter, DEFAULT_PITY_COUNTER } from '@/lib/pack/pity';
import type { PityCounter, StreakCounter } from '@/types/collection';
import { onBrowser } from '@/lib/utils/browser';
import localforage from 'localforage';

// ============================================================================
// STORAGE LAYER (INDEXEDDB)
// ============================================================================

// PACK-030: Default streak counter
const DEFAULT_STREAK_COUNTER: StreakCounter = {
  current: 0,
  best: 0
};

// Initialize empty collection
const DEFAULT_COLLECTION: Collection = {
  packs: [],
  metadata: {
    totalPacksOpened: 0,
    lastOpenedAt: null,
    uniqueCards: [],
    rarePulls: 0,
    holoPulls: 0,
    created: new Date(),
    rarityCounts: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0
    },
    pityCounter: DEFAULT_PITY_COUNTER, // PACK-003: Initialize pity counter
    streakCounter: DEFAULT_STREAK_COUNTER // PACK-030: Initialize streak counter
  }
};

// Load collection from IndexedDB on init
let loadedCollection: Collection = DEFAULT_COLLECTION;

// Track hydration state
let isHydrated = false;
let hydrationPromise: Promise<void> | null = null;

// Async load from IndexedDB with timeout
async function initializeCollection() {
  if (isHydrated) return;

  const INIT_TIMEOUT = 5000; // FIX: Increased to 5 seconds for slower devices

  try {
    // Wrap the entire initialization in a timeout
    await Promise.race([
      (async () => {
        // Check if migration is needed
        if (await needsLocalStorageMigration()) {
          const migrationResult = await migrateFromLocalStorage();
          if (!migrationResult.success) {
            console.error('[Collection] Migration failed:', migrationResult.error);
          }
        }

        // Load from IndexedDB
        const loaded = await loadFromIndexedDB();
        if (loaded) {
          loadedCollection = loaded;
          collectionStore.set(loaded);
        }
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Collection initialization timed out')), INIT_TIMEOUT)
      )
    ]);
    isHydrated = true;
  } catch (error) {
    console.error('[Collection] Failed to initialize:', error);
    // FIX: Even on timeout, try to ensure localforage is ready for writes
    // This allows pack saves to succeed even if initial load times out
    try {
      // Force localforage to be ready by doing a dummy operation
      await localforage.ready();
    } catch (forageError) {
      console.error('[Collection] localforage not ready:', forageError);
    }
    isHydrated = true; // Mark as hydrated even on error to prevent infinite retries
  }
}

// Public function to ensure collection is initialized (awaitable)
export async function ensureCollectionInitialized(): Promise<void> {
  if (isHydrated) return;
  
  if (!hydrationPromise) {
    hydrationPromise = initializeCollection();
  }
  
  return hydrationPromise;
}

// Check if collection is hydrated
export function isCollectionHydrated(): boolean {
  return isHydrated;
}

// Reactive hydration state for components
export const collectionHydrated = atom<boolean>(false);

// Initialize on module load (but don't block) - only in browser environment
onBrowser(() => {
  initializeCollection().then(() => {
    collectionHydrated.set(true);
  });
});

// ============================================================================
// COLLECTION STORE (ATOM + INDEXEDDB PERSISTENCE)
// ============================================================================

// Collection atom (in-memory store)
export const collectionStore = atom<Collection>(loadedCollection);

// Re-export as collection for backward compatibility
export const collection = collectionStore;

// Track save timeout for debouncing
let saveTimeout: number | null = null;

// Track if an immediate save is pending (to avoid duplicate saves)
let immediateSavePending = false;

// Save to IndexedDB (debounced) - PACK-045: With quota warning handling
function saveToStorage() {
  // Skip debounced save if immediate save is pending
  if (immediateSavePending) return;
  
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = window.setTimeout(async () => {
    try {
      const current = collectionStore.get();
      const result = await saveToIndexedDB(current);

      if (!result.success) {
        console.error('[Collection] Failed to save:', result.error);
        dispatchStorageEvent('error', result.error || 'Failed to save collection');
      } else if (result.quotaWarning) {
        console.warn('[Collection] Quota warning:', result.quotaWarning);
        dispatchStorageEvent('warning', result.quotaWarning);
      }
    } catch (error) {
      console.error('[Collection] Error saving:', error);
      dispatchStorageEvent('error', 'An unexpected error occurred while saving');
    }
  }, 500);
}

// Save to IndexedDB immediately (for critical operations like pack saves)
async function saveToStorageImmediate(): Promise<{ success: boolean; error?: string }> {
  // Cancel any pending debounced save
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  
  immediateSavePending = true;
  
  try {
    const current = collectionStore.get();
    const result = await saveToIndexedDB(current);

    if (!result.success) {
      console.error('[Collection] Failed to save:', result.error);
      dispatchStorageEvent('error', result.error || 'Failed to save collection');
      return { success: false, error: result.error };
    } else if (result.quotaWarning) {
      console.warn('[Collection] Quota warning:', result.quotaWarning);
      dispatchStorageEvent('warning', result.quotaWarning);
    }
    
    return { success: true };
  } catch (error) {
    console.error('[Collection] Error saving:', error);
    dispatchStorageEvent('error', 'An unexpected error occurred while saving');
    return { success: false, error: 'An unexpected error occurred while saving' };
  } finally {
    immediateSavePending = false;
  }
}

// Subscribe to store changes and persist to IndexedDB (only in browser)
onBrowser(() => {
  collectionStore.subscribe(() => {
    saveToStorage();
  });
});

// ============================================================================
// STORAGE EVENT DISPATCHING
// ============================================================================

// Dispatch storage warning/error events for UI components (PACK-045)
export function dispatchStorageEvent(type: 'warning' | 'error', message: string): void {
  onBrowser(() => {
    window.dispatchEvent(
      new CustomEvent(`daddeck:storage-${type}`, { detail: { message, type } })
    );
  });
}

// ============================================================================
// COLLECTION STATE MANAGEMENT
// ============================================================================

// Initialize empty rarity counts
function initializeRarityCounts(): Record<Rarity, number> {
  return {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0
  };
}

// Get rarity counts from metadata or compute them
function getRarityCounts(packs: Pack[], metadata: CollectionMetadata): Record<Rarity, number> {
  // Return cached counts if available
  if (metadata.rarityCounts) {
    return metadata.rarityCounts;
  }

  // Fallback: compute from packs (migration for old collections)
  const counts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0
  };

  for (const pack of packs) {
    for (const card of pack.cards) {
      counts[card.rarity]++;
    }
  }

  return counts;
}

// Get reactive collection state for UI components
export function getCollectionState(): CollectionState {
  const current = collection.get();

  return {
    openedPacks: current.packs,
    uniqueCards: current.metadata.uniqueCards,
    totalCards: current.packs.reduce((sum, pack) => sum + pack.cards.length, 0),
    rarityCounts: getRarityCounts(current.packs, current.metadata)
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
    lastOpenedAt: current.metadata.lastOpenedAt
  };
}

// PACK-030: Get current streak counter
export function getStreakCounter(): StreakCounter {
  const current = collection.get();
  return current.metadata.streakCounter || DEFAULT_STREAK_COUNTER;
}

// PACK-030: Get current streak (consecutive rare+ packs)
export function getCurrentStreak(): number {
  return getStreakCounter().current;
}

// PACK-030: Get best streak ever achieved
export function getBestStreak(): number {
  return getStreakCounter().best;
}

// ============================================================================
// COLLECTION OPERATIONS
// ============================================================================

// Add a pack to the collection (alias for US022 compatibility)
export function savePackToCollection(pack: Pack): { success: boolean; error?: string } {
  return addPackToCollectionSync(pack);
}

// Synchronous version for backward compatibility (triggers async save)
function addPackToCollectionSync(pack: Pack): { success: boolean; error?: string } {
  const result = updateCollectionWithPack(pack);
  if (result.success) {
    // Trigger immediate save (fire and forget for sync API)
    saveToStorageImmediate().catch(err => {
      console.error('[Collection] Background save failed:', err);
    });
  }
  return result;
}

// Add a pack to the collection (async version - waits for IndexedDB save)
export async function addPackToCollection(pack: Pack): Promise<{ success: boolean; error?: string }> {
  const result = updateCollectionWithPack(pack);
  if (!result.success) {
    return result;
  }
  
  // Wait for IndexedDB save to complete
  return saveToStorageImmediate();
}

// Core logic to update collection state with a new pack
function updateCollectionWithPack(pack: Pack): { success: boolean; error?: string } {
  try {
    const current = collection.get();

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

    // PACK-003: Update pity counter based on pulled rarities
    const pulledRarities = pack.cards.map(card => card.rarity);
    const currentPityCounter = current.metadata.pityCounter || DEFAULT_PITY_COUNTER;
    const newPityCounter = updatePityCounter(currentPityCounter, pulledRarities);

    // PACK-030: Calculate streak (consecutive rare+ packs)
    const currentStreak = current.metadata.streakCounter || DEFAULT_STREAK_COUNTER;
    let newStreak: StreakCounter;

    if (rarePullsInPack > 0) {
      // Has rare+ card: increment current streak
      newStreak = {
        current: currentStreak.current + 1,
        best: Math.max(currentStreak.best, currentStreak.current + 1)
      };
    } else {
      // No rare+ card: reset streak
      newStreak = {
        current: 0,
        best: currentStreak.best
      };
    }

    // Update collection with new pack
    const newCollection: Collection = {
      packs: [pack, ...current.packs], // New packs first
      metadata: {
        totalPacksOpened: current.metadata.totalPacksOpened + 1,
        lastOpenedAt: new Date(),
        uniqueCards: newUniqueCards,
        rarePulls: current.metadata.rarePulls + rarePullsInPack,
        holoPulls: current.metadata.holoPulls + holoPullsInPack,
        created: current.metadata.created,
        rarityCounts: newRarityCounts,
        pityCounter: newPityCounter, // PACK-003: Include updated pity counter
        streakCounter: newStreak // PACK-030: Include updated streak counter
      }
    };

    collection.set(newCollection);

    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to save pack to collection',
      () => addPackToCollectionSync(pack)
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message
    };
  }
}

// Clear the entire collection
export function clearUserCollection(): { success: boolean; error?: string } {
  try {
    const newCollection: Collection = {
      packs: [],
      metadata: {
        totalPacksOpened: 0,
        lastOpenedAt: null,
        uniqueCards: [],
        rarePulls: 0,
        holoPulls: 0,
        created: new Date(),
        rarityCounts: initializeRarityCounts(),
        pityCounter: DEFAULT_PITY_COUNTER, // PACK-003: Reset pity counter
        streakCounter: DEFAULT_STREAK_COUNTER // PACK-030: Reset streak counter
      }
    };

    collection.set(newCollection);

    // Clear from IndexedDB
    clearFromIndexedDBStorage();

    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to clear collection',
      () => clearUserCollection()
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message
    };
  }
}

// Alias for backward compatibility
export const clearCollection = clearUserCollection;

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
export async function exportCollection(): Promise<string> {
  const current = collection.get();
  return JSON.stringify(current, null, 2);
}

// Import collection data from JSON
export async function importCollection(
  jsonData: string
): Promise<{ success: boolean; error?: string; imported?: number }> {
  try {
    const parsedCollection = JSON.parse(jsonData) as Collection;

    // Validate collection structure
    if (!parsedCollection || !Array.isArray(parsedCollection.packs) || !parsedCollection.metadata) {
      return {
        success: false,
        error: 'Invalid collection data format'
      };
    }

    // Save to IndexedDB
    const saveResult = await saveToIndexedDB(parsedCollection);

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error || 'Failed to save imported collection'
      };
    }

    // Update in-memory store
    collection.set(parsedCollection);

    return {
      success: true,
      imported: parsedCollection.packs.length
    };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to import collection',
      () => importCollection(jsonData)
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message
    };
  }
}

// ============================================================================
// ANALYTICS TRACKING
// ============================================================================

// Track collection view event
export function trackCollectionView(): void {
  const stats = getCollectionStats();
  trackEvent({
    type: 'collection_view',
    data: {
      totalPacks: stats.totalPacks,
      totalCards: stats.totalCards,
      uniqueCards: stats.uniqueCards
    }
  });
}

// Track collection filter event
export function trackCollectionFilter(filterType: string, filterValue: string): void {
  trackEvent({
    type: 'collection_filter',
    data: {
      filterType,
      filterValue
    }
  });
}

// Track collection sort event
export function trackCollectionSort(sortOption: string): void {
  trackEvent({
    type: 'collection_sort',
    data: {
      sortOption: sortOption as any // Type assertion for SortOption
    }
  });
}

// ============================================================================
// PITY SYSTEM (PACK-003)
// ============================================================================

/**
 * Get current pity counter state
 *
 * @returns Current pity counter or default if not initialized
 */
export function getPityCounter(): PityCounter {
  const current = collection.get();
  return current.metadata.pityCounter || DEFAULT_PITY_COUNTER;
}

/**
 * Check if pity should trigger on next pack opening
 *
 * Returns the highest rarity tier that will trigger pity,
 * or null if no pity tier has been reached.
 *
 * @returns Highest rarity tier that will trigger, or null
 */
export function getPityTrigger(): Rarity | null {
  const pityCounter = getPityCounter();

  // Check in descending order (mythic → rare)
  if (pityCounter.mythic >= 100) return 'mythic';
  if (pityCounter.legendary >= 60) return 'legendary';
  if (pityCounter.epic >= 30) return 'epic';
  if (pityCounter.rare >= 10) return 'rare';

  return null;
}

// ============================================================================
// DATA MANAGEMENT (PACK-075)
// ============================================================================

/**
 * Clear all collection data (PACK-075)
 * Resets the collection to default state, clearing all packs, cards, decks, etc.
 * This is used by the settings page to allow users to start fresh.
 *
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function clearAllCollectionData(): Promise<{ success: boolean; error?: string }> {
  try {
    // Clear IndexedDB collection
    const result = await clearFromIndexedDBStorage();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Reset collection store to defaults
    collection.set(DEFAULT_COLLECTION);

    // Track analytics event
    trackEvent({
      type: 'collection_cleared',
      data: {}
    });

    return { success: true };
  } catch (error) {
    console.error('[Collection] Failed to clear collection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear collection'
    };
  }
}
