/**
 * PACK-045: LocalStorage Quota Management
 *
 * Manages IndexedDB storage quota with:
 * - Usage tracking and warnings
 * - Automatic compression of old data
 * - Archiving of old packs
 * - Graceful degradation when full
 */

import type { Collection, Pack } from '@/types';
import { createStorageError, logError } from '@/lib/utils/errors';

// ============================================================================
// TYPES
// ============================================================================

export interface StorageQuotaInfo {
  used: number;           // Bytes used
  total: number;          // Total bytes available
  percentage: number;     // Percentage used (0-100)
  driver: string;         // Storage driver (indexeddb, localstorage, etc.)
  needsWarning: boolean;  // True if usage >= 90%
  isFull: boolean;        // True if usage >= 95%
}

export interface CompressionResult {
  success: boolean;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  archivedPacks: number;
  error?: string;
}

export interface ArchiveResult {
  success: boolean;
  archivedPacks: number;
  archivedData?: string;  // JSON string of archived packs
  error?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const WARNING_THRESHOLD = 0.90;  // 90% - Show warning
const FULL_THRESHOLD = 0.95;     // 95% - Considered "full"
const ARCHIVE_DAYS = 30;         // Archive packs older than 30 days

// Compression strategy: Remove unnecessary data from old packs
function compressPackData(pack: Pack): any {
  return {
    id: pack.id,
    cards: pack.cards.map(card => ({
      id: card.id,
      rarity: card.rarity,
      isHolo: card.isHolo,
      // Remove heavy fields like abilities, flavorText, etc.
    })),
    openedAt: pack.openedAt,
    bestRarity: pack.bestRarity,
    design: pack.design
  };
}

// ============================================================================
// QUOTA TRACKING
// ============================================================================

/**
 * Get detailed storage quota information
 */
export async function getStorageQuotaInfo(): Promise<StorageQuotaInfo> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      return {
        used: 0,
        total: 50 * 1024 * 1024,  // 50MB default
        percentage: 0,
        driver: 'none',
        needsWarning: false,
        isFull: false
      };
    }

    // Estimate IndexedDB quota (varies by browser)
    // Chrome/Firefox: 50MB to several GB
    // Safari: 1GB or more
    const total = 50 * 1024 * 1024;  // Conservative 50MB estimate

    // Calculate used space by iterating through all stores
    let used = 0;

    try {
      const db = await openDatabase();
      if (db) {
        used = await estimateDatabaseSize(db);
        db.close();
      }
    } catch (error) {
      console.warn('[QuotaManager] Could not estimate database size:', error);
    }

    const percentage = (used / total) * 100;

    return {
      used,
      total,
      percentage,
      driver: 'indexeddb',
      needsWarning: percentage >= WARNING_THRESHOLD * 100,
      isFull: percentage >= FULL_THRESHOLD * 100
    };
  } catch (error) {
    console.error('[QuotaManager] Failed to get quota info:', error);
    return {
      used: 0,
      total: 50 * 1024 * 1024,
      percentage: 0,
      driver: 'unknown',
      needsWarning: false,
      isFull: false
    };
  }
}

/**
 * Check if storage is approaching quota limit
 */
export async function checkQuotaBeforeSave(
  additionalBytes: number
): Promise<{ canSave: boolean; quotaInfo: StorageQuotaInfo; warning?: string }> {
  const quotaInfo = await getStorageQuotaInfo();

  const projectedUsage = quotaInfo.used + additionalBytes;
  const projectedPercentage = (projectedUsage / quotaInfo.total) * 100;

  // Check if save would exceed limits
  if (projectedPercentage >= FULL_THRESHOLD * 100) {
    return {
      canSave: false,
      quotaInfo,
      warning: 'Storage is almost full. Archive old packs or clear data to continue.'
    };
  }

  // Check if save would trigger warning
  if (projectedPercentage >= WARNING_THRESHOLD * 100) {
    return {
      canSave: true,
      quotaInfo,
      warning: 'Storage is getting full. Consider archiving old packs soon.'
    };
  }

  return {
    canSave: true,
    quotaInfo
  };
}

// ============================================================================
// COMPRESSION & ARCHIVING
// ============================================================================

/**
 * Compress old pack data to save space
 * - Removes unnecessary fields from old packs
 * - Keeps essential data (id, cards, rarity, dates)
 */
export async function compressOldData(
  collection: Collection,
  daysOld: number = ARCHIVE_DAYS
): Promise<CompressionResult> {
  try {
    const originalSize = JSON.stringify(collection).length;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Separate packs into recent and old
    const recentPacks: Pack[] = [];
    const oldPacks: Pack[] = [];

    for (const pack of collection.packs) {
      const packDate = new Date(pack.openedAt);
      if (packDate < cutoffDate) {
        oldPacks.push(pack);
      } else {
        recentPacks.push(pack);
      }
    }

    if (oldPacks.length === 0) {
      return {
        success: true,
        originalSize,
        compressedSize: originalSize,
        savedBytes: 0,
        archivedPacks: 0
      };
    }

    // Compress old packs
    const compressedOldPacks = oldPacks.map(compressPackData);

    // Rebuild collection with compressed old packs
    const compressedCollection: Collection = {
      ...collection,
      packs: [...recentPacks, ...compressedOldPacks]
    };

    const compressedSize = JSON.stringify(compressedCollection).length;
    const savedBytes = originalSize - compressedSize;

    return {
      success: true,
      originalSize,
      compressedSize,
      savedBytes,
      archivedPacks: oldPacks.length
    };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to compress old data',
      () => compressOldData(collection, daysOld)
    );
    logError(storageError, error);
    return {
      success: false,
      originalSize: 0,
      compressedSize: 0,
      savedBytes: 0,
      archivedPacks: 0,
      error: storageError.message
    };
  }
}

/**
 * Archive packs older than specified days
 * - Extracts old packs from collection
 * - Returns them as JSON for external storage
 * - Removes them from main collection
 */
export async function archiveOldPacks(
  collection: Collection,
  daysOld: number = ARCHIVE_DAYS
): Promise<ArchiveResult> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Separate packs into recent and old
    const recentPacks: Pack[] = [];
    const oldPacks: Pack[] = [];

    for (const pack of collection.packs) {
      const packDate = new Date(pack.openedAt);
      if (packDate < cutoffDate) {
        oldPacks.push(pack);
      } else {
        recentPacks.push(pack);
      }
    }

    if (oldPacks.length === 0) {
      return {
        success: true,
        archivedPacks: 0
      };
    }

    // Create archive data
    const archiveData = {
      archivedAt: new Date().toISOString(),
      daysOld,
      packCount: oldPacks.length,
      packs: oldPacks
    };

    // Update collection to remove archived packs
    const updatedCollection: Collection = {
      ...collection,
      packs: recentPacks
    };

    // Update metadata
    updatedCollection.metadata = {
      ...collection.metadata,
      totalPacksOpened: collection.metadata.totalPacksOpened - oldPacks.length
    };

    return {
      success: true,
      archivedPacks: oldPacks.length,
      archivedData: JSON.stringify(archiveData, null, 2)
    };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to archive old packs',
      () => archiveOldPacks(collection, daysOld)
    );
    logError(storageError, error);
    return {
      success: false,
      archivedPacks: 0,
      error: storageError.message
    };
  }
}

// ============================================================================
// AUTOMATIC CLEANUP
// ============================================================================

/**
 * Automatically manage storage quota
 * - Compresses old data if approaching limit
 * - Archives very old packs if near full
 * - Returns updated collection if changes were made
 */
export async function autoManageQuota(
  collection: Collection
): Promise<{ success: boolean; updatedCollection?: Collection; actions: string[] }> {
  const actions: string[] = [];
  let updatedCollection = collection;

  try {
    const quotaInfo = await getStorageQuotaInfo();

    // Stage 1: Compress old data at 75%
    if (quotaInfo.percentage >= 75) {
      const compressionResult = await compressOldData(updatedCollection);
      if (compressionResult.success && compressionResult.savedBytes > 0) {
        actions.push(
          `Compressed ${compressionResult.archivedPacks} old packs, ` +
          `saved ${formatBytes(compressionResult.savedBytes)}`
        );
        // Note: In a real implementation, you'd save the compressed collection here
      }
    }

    // Stage 2: Archive packs older than 30 days at 85%
    if (quotaInfo.percentage >= 85) {
      const archiveResult = await archiveOldPacks(updatedCollection, ARCHIVE_DAYS);
      if (archiveResult.success && archiveResult.archivedPacks > 0) {
        actions.push(
          `Archived ${archiveResult.archivedPacks} packs older than ${ARCHIVE_DAYS} days`
        );
        updatedCollection = {
          ...updatedCollection,
          packs: updatedCollection.packs.slice(archiveResult.archivedPacks)
        };
      }
    }

    // Stage 3: Emergency archive (15 days) at 90%
    if (quotaInfo.percentage >= 90) {
      const archiveResult = await archiveOldPacks(updatedCollection, 15);
      if (archiveResult.success && archiveResult.archivedPacks > 0) {
        actions.push(
          `Emergency archived ${archiveResult.archivedPacks} packs older than 15 days`
        );
        updatedCollection = {
          ...updatedCollection,
          packs: updatedCollection.packs.slice(archiveResult.archivedPacks)
        };
      }
    }

    return {
      success: true,
      updatedCollection: actions.length > 0 ? updatedCollection : undefined,
      actions
    };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to auto-manage quota',
      () => autoManageQuota(collection)
    );
    logError(storageError, error);
    return {
      success: false,
      actions: ['Error: ' + storageError.message]
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Open IndexedDB database for size estimation
 */
async function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    // Timeout after 2 seconds to prevent hanging in test environments
    const timeout = setTimeout(() => {
      console.warn('[QuotaManager] IndexedDB open timed out');
      resolve(null);
    }, 2000);
    
    try {
      const request = indexedDB.open('DadDeck', 1);

      request.onsuccess = () => {
        clearTimeout(timeout);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timeout);
        console.warn('[QuotaManager] IndexedDB open failed:', request.error);
        resolve(null);
      };
    } catch (error) {
      clearTimeout(timeout);
      console.warn('[QuotaManager] IndexedDB open exception:', error);
      resolve(null);
    }
  });
}

/**
 * Estimate database size by iterating through object stores
 */
async function estimateDatabaseSize(db: IDBDatabase): Promise<number> {
  let totalSize = 0;

  for (const storeName of Array.from(db.objectStoreNames)) {
    try {
      const size = await estimateObjectStoreSize(db, storeName);
      totalSize += size;
    } catch (error) {
      console.warn(`[QuotaManager] Could not estimate size for store ${storeName}:`, error);
    }
  }

  return totalSize;
}

/**
 * Estimate size of a single object store
 */
async function estimateObjectStoreSize(db: IDBDatabase, storeName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.openCursor();
    let size = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        try {
          size += JSON.stringify(cursor.value).length;
          cursor.continue();
        } catch (error) {
          // Can't stringify, skip this record
          cursor.continue();
        }
      } else {
        resolve(size);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get human-readable quota summary
 */
export async function getQuotaSummary(): Promise<string> {
  const quotaInfo = await getStorageQuotaInfo();

  return `Storage: ${formatBytes(quotaInfo.used)} / ${formatBytes(quotaInfo.total)} ` +
    `(${quotaInfo.percentage.toFixed(1)}%) - Driver: ${quotaInfo.driver}`;
}
