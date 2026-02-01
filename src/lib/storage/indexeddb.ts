import localforage from 'localforage';
import type { Collection, Pack } from '@/types';
import { createStorageError, logError } from '@/lib/utils/errors';
import {
  getStorageQuotaInfo,
  checkQuotaBeforeSave,
  autoManageQuota,
  getQuotaSummary
} from './quota-manager';

// ============================================================================
// INDEXEDDB CONFIGURATION
// ============================================================================

// Configure localForage with IndexedDB as primary, LocalStorage as fallback
// Only configure in browser environment (SSR-safe)
if (typeof window !== 'undefined') {
  localforage.config({
    name: 'DadDeck',
    storeName: 'collection',
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]
  });
}

// ============================================================================
// STORAGE INTERFACE
// ============================================================================

// Check if storage is available with timeout
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const timeout = new Promise<boolean>((_, reject) => 
      setTimeout(() => reject(new Error('Storage check timeout')), 2000)
    );
    const check = (async () => {
      await localforage.setItem('__test__', 'ok');
      await localforage.removeItem('__test__');
      return true;
    })();
    return await Promise.race([check, timeout]);
  } catch {
    if (import.meta.env.DEV) console.warn('[IndexedDB] Storage not available or timed out');
    return false;
  }
}

// Get storage usage estimate
export async function getStorageUsage(): Promise<{ used: number; total: number; driver: string }> {
  let used = 0;
  const driver = localforage.driver();

  try {
    // IndexedDB typically has much higher limits (50MB to several GB)
    const total = 50 * 1024 * 1024; // 50MB conservative estimate

    // Count items and estimate size
    await localforage.iterate((value) => {
      if (typeof value === 'string') {
        used += value.length;
      } else if (value && typeof value === 'object') {
        used += JSON.stringify(value).length;
      }
    });

    return { used, total, driver };
  } catch (error) {
    if (import.meta.env.DEV) console.error('[IndexedDB] Failed to get storage usage:', error);
    return { used: 0, total: 50 * 1024 * 1024, driver: 'unknown' };
  }
}

// ============================================================================
// COLLECTION STORAGE
// ============================================================================

const COLLECTION_KEY = 'collection';

// Load collection from IndexedDB
export async function loadCollection(): Promise<Collection | null> {
  try {
    const collection = await localforage.getItem<Collection>(COLLECTION_KEY);
    return collection;
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to load collection from IndexedDB',
      () => loadCollection()
    );
    logError(storageError, error);
    return null;
  }
}

// Save collection to IndexedDB (PACK-045: With quota management)
export async function saveCollection(collection: Collection): Promise<{ success: boolean; error?: string; quotaWarning?: string }> {
  try {
    // Check storage availability
    const available = await isStorageAvailable();
    if (!available) {
      return {
        success: false,
        error: 'IndexedDB is not available. Please check browser settings.'
      };
    }

    // PACK-045: Check storage quota before save
    const estimatedSize = JSON.stringify(collection).length * 2; // Rough estimate in bytes
    const quotaCheck = await checkQuotaBeforeSave(estimatedSize);

    if (!quotaCheck.canSave) {
      // Try automatic cleanup
      if (import.meta.env.DEV) console.warn('[IndexedDB] Storage nearly full, attempting auto-cleanup...');
      const cleanupResult = await autoManageQuota(collection);

      if (cleanupResult.success && cleanupResult.updatedCollection) {
        if (import.meta.env.DEV) console.log('[IndexedDB] Auto-cleanup successful:', cleanupResult.actions.join(', '));
        // Save the cleaned-up collection instead
        await localforage.setItem(COLLECTION_KEY, cleanupResult.updatedCollection);

        return {
          success: true,
          quotaWarning: `Storage was nearly full. Automatically ${cleanupResult.actions[0].toLowerCase()}`
        };
      }

      return {
        success: false,
        error: quotaCheck.warning || 'Storage is full. Please archive old packs or clear data.'
      };
    }

    // Save with warning if approaching limit
    await localforage.setItem(COLLECTION_KEY, collection);

    return {
      success: true,
      quotaWarning: quotaCheck.warning
    };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to save collection to IndexedDB',
      () => saveCollection(collection)
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message
    };
  }
}

// Clear collection from IndexedDB
export async function clearCollection(): Promise<{ success: boolean; error?: string }> {
  try {
    await localforage.removeItem(COLLECTION_KEY);
    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to clear collection from IndexedDB',
      () => clearCollection()
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message
    };
  }
}

// ============================================================================
// MIGRATION FROM LOCALSTORAGE
// ============================================================================

const MIGRATION_KEY = '__indexeddb_migration_complete__';

// Check if migration from LocalStorage is needed
export async function needsLocalStorageMigration(): Promise<boolean> {
  const hasMigrated = await localforage.getItem(MIGRATION_KEY);
  return hasMigrated !== 'true';
}

// Migrate collection from LocalStorage to IndexedDB
export async function migrateFromLocalStorage(): Promise<{ success: boolean; error?: string; migrated?: number }> {
  try {
    if (typeof localStorage === 'undefined') {
      return {
        success: false,
        error: 'LocalStorage is not available'
      };
    }

    // Get collection from LocalStorage
    const localStorageData = localStorage.getItem('daddeck-collection');
    if (!localStorageData) {
      // No existing collection, mark migration as complete
      await localforage.setItem(MIGRATION_KEY, 'true');
      return { success: true, migrated: 0 };
    }

    try {
      const collection = JSON.parse(localStorageData) as Collection;
      
      // Save to IndexedDB
      const saveResult = await saveCollection(collection);
      
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || 'Failed to save migrated collection'
        };
      }

      // Mark migration as complete
      await localforage.setItem(MIGRATION_KEY, 'true');
      
      // Optional: Clear LocalStorage to free space
      // localStorage.removeItem('daddeck-collection');
      
      return {
        success: true,
        migrated: collection.packs.length
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse LocalStorage data. Collection may be corrupted.'
      };
    }
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to migrate from LocalStorage',
      () => migrateFromLocalStorage()
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message
    };
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

// Export collection for backup
export async function exportCollection(): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const collection = await loadCollection();
    if (!collection) {
      return {
        success: false,
        error: 'No collection found to export'
      };
    }

    const data = JSON.stringify(collection, null, 2);
    return { success: true, data };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to export collection',
      () => exportCollection()
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message
    };
  }
}

// Import collection from backup
export async function importCollection(data: string): Promise<{ success: boolean; imported?: number; error?: string }> {
  try {
    const collection = JSON.parse(data) as Collection;
    
    // Validate collection structure
    if (!collection || !Array.isArray(collection.packs) || !collection.metadata) {
      return {
        success: false,
        error: 'Invalid collection data format'
      };
    }

    const saveResult = await saveCollection(collection);
    
    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error || 'Failed to save imported collection'
      };
    }

    return {
      success: true,
      imported: collection.packs.length
    };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to import collection',
      () => importCollection(data)
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message
    };
  }
}
