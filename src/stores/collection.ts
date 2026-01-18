import { persistentAtom } from '@nanostores/persistent';
import type { Collection, CollectionMetadata, CollectionState, CollectionStats, Pack, Rarity } from '../types';
import { RARITY_ORDER } from '../types';
import { trackEvent } from './analytics';
import { safeJsonParse } from '../lib/utils/safe-parse';
import { createStorageError, logError } from '@/lib/utils/errors';
import {
  createMigrationEncoder,
  exportCollection as migrateExportCollection,
  importCollection as migrateImportCollection,
} from '@/lib/utils/migrations';

// ============================================================================
// SERVICE WORKER COMMUNICATION
// ============================================================================

// Send collection to service worker for IndexedDB caching
async function syncToServiceWorker(collection: Collection): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'SAVE_COLLECTION',
      collection,
    });
    console.log('[Collection] Synced to service worker IndexedDB');
  } catch (error) {
    console.error('[Collection] Failed to sync to service worker:', error);
  }
}

// Register background sync for when we come back online
async function registerBackgroundSync(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-collection');
    console.log('[Collection] Background sync registered');
  } catch (error) {
    console.error('[Collection] Failed to register background sync:', error);
  }
}

// Listen for online events and trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('[Collection] Back online, registering background sync...');
    await registerBackgroundSync();
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
    mythic: 0,
  };
}

// Migration-safe encoder for Collection type
// Handles schema migrations and Date serialization automatically
const collectionEncoder = createMigrationEncoder();

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
    const newCollection: Collection = {
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
    };

    collection.set(newCollection);

    // Sync to service worker IndexedDB for offline support
    syncToServiceWorker(newCollection);

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
    const newCollection: Collection = {
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
    };

    collection.set(newCollection);

    // Sync empty collection to service worker
    syncToServiceWorker(newCollection);

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
  return migrateExportCollection(current);
}

// Import collection data from JSON (with migration support)
export function importCollection(
  jsonData: string
): { success: boolean; error?: string; imported?: number } {
  const result = migrateImportCollection(jsonData);

  if (!result.success || !result.collection) {
    return { success: false, error: result.error || 'Failed to import collection' };
  }

  collection.set(result.collection);

  // Sync imported collection to service worker
  syncToServiceWorker(result.collection);

  return { success: true, imported: result.collection.packs.length };
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
// (Roadmap feature removed in MVP)
// ============================================================================
