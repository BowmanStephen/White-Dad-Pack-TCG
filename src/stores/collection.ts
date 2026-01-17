import { persistentAtom } from '@nanostores/persistent';
import type { Collection, CollectionState, CollectionStats, Pack, Rarity } from '../types';
import { trackEvent } from './analytics';

// Custom encoder for Collection type (handles Date serialization)
const collectionEncoder = {
  encode(data: Collection): string {
    return JSON.stringify(data, (_key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): Collection {
    const data = JSON.parse(str);
    // Convert ISO strings back to Date objects
    if (data.metadata?.lastOpenedAt) {
      data.metadata.lastOpenedAt = new Date(data.metadata.lastOpenedAt);
    }
    // Convert openedAt dates in packs
    if (data.packs) {
      data.packs = data.packs.map((pack: Pack) => ({
        ...pack,
        openedAt: new Date(pack.openedAt),
      }));
    }
    return data;
  },
};

// Rarity order for comparison (common=0, mythic=5)
const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
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

// Compute rarity counts from all packs
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

// Get the reactive collection state for UI components
export function getCollectionState(): CollectionState {
  const current = collection.get();

  return {
    openedPacks: current.packs,
    uniqueCards: current.metadata.uniqueCards,
    totalCards: current.packs.reduce((sum, pack) => sum + pack.cards.length, 0),
    rarityCounts: computeRarityCounts(current.packs),
  };
}

// Get computed collection statistics
export function getCollectionStats(): CollectionStats {
  const current = collection.get();
  const rarityCounts = computeRarityCounts(current.packs);

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
      return {
        success: false,
        error: 'LocalStorage is not available. Please enable cookies and local storage in your browser.',
      };
    }

    // Check storage quota before saving
    const storage = getStorageUsage();
    const estimatedPackSize = JSON.stringify(pack).length * 2; // Rough estimate in bytes
    if (storage.used + estimatedPackSize > storage.total * 0.9) {
      return {
        success: false,
        error: 'Storage is almost full. Some older packs may need to be deleted.',
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

    // Update collection with new pack
    collection.set({
      packs: [pack, ...current.packs], // New packs first
      metadata: {
        totalPacksOpened: current.metadata.totalPacksOpened + 1,
        lastOpenedAt: new Date(),
        uniqueCards: newUniqueCards,
        rarePulls: current.metadata.rarePulls + rarePullsInPack,
        holoPulls: current.metadata.holoPulls + holoPullsInPack,
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save pack to collection',
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
      },
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear collection',
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
  try {
    const data = JSON.parse(jsonData) as Collection;

    // Validate basic structure
    if (!data.packs || !Array.isArray(data.packs)) {
      return { success: false, error: 'Invalid collection data: missing packs array' };
    }

    if (!data.metadata || typeof data.metadata !== 'object') {
      return { success: false, error: 'Invalid collection data: missing metadata' };
    }

    collection.set(data);
    return { success: true, imported: data.packs.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import collection',
    };
  }
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
