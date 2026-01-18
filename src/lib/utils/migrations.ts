/**
 * DadDeck™ Collection Migration System
 *
 * Handles automatic schema migrations for localStorage data.
 * Ensures backward compatibility as the Collection schema evolves.
 *
 * Migration Pattern:
 * 1. Each migration has a version number (incrementing integer)
 * 2. Migrations run in order from oldest to newest
 * 3. Each migration transforms data from version N to version N+1
 * 4. Migrations must be idempotent (safe to run multiple times)
 * 5. Corrupted data falls back to default collection
 * 6. Date objects are serialized to ISO strings and restored on decode
 */

import type { Collection, Rarity } from '@/types';
import { safeJsonParse } from './safe-parse';
import { createStorageError, logError } from './errors';
import { createDateEncoder } from './encoders';

// Current schema version
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Schema version interface
 * Tracks the version of the collection schema
 */
export interface VersionedCollection {
  version: number;
  data: Collection;
}

/**
 * Migration result interface (deprecated - kept for compatibility)
 */
export interface MigrationResult {
  success: boolean;
  fromVersion?: number;
  toVersion: number;
  migrated: boolean;
  error?: string;
}

/**
 * Migration function type
 * Transforms data from one version to the next
 */
type MigrationFn = (data: any) => any;

/**
 * Migration definition
 */
interface Migration {
  version: number;
  description: string;
  migrate: MigrationFn;
}

// ============================================================================
// MIGRATION HISTORY
// ============================================================================

/**
 * Migration 1: Add rarityCounts to metadata
 */
const migration_1_add_rarity_counts: MigrationFn = (data): any => {
  // Ensure packs array exists
  if (!data.packs || !Array.isArray(data.packs)) {
    throw new Error('Invalid collection data: missing packs array');
  }

  if (!data.metadata || typeof data.metadata !== 'object') {
    throw new Error('Invalid collection data: missing metadata');
  }

  // Initialize rarity counts if missing
  if (!data.metadata.rarityCounts) {
    const rarityCounts: Record<Rarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };

    // Compute counts from all packs
    for (const pack of data.packs) {
      if (pack.cards && Array.isArray(pack.cards)) {
        for (const card of pack.cards) {
          if (card.rarity && card.rarity in rarityCounts) {
            const rarity = card.rarity as Rarity;
            rarityCounts[rarity] += 1;
          }
        }
      }
    }

    data.metadata.rarityCounts = rarityCounts;
  }

  // Ensure created timestamp exists
  if (!data.metadata.created) {
    data.metadata.created = new Date();
  }

  return data;
};

/**
 * Migration 2: Add seasonId to cards
 */
const migration_2_add_season_support: MigrationFn = (data): any => {
  // Add seasonId to all cards if missing
  if (data.packs && Array.isArray(data.packs)) {
    for (const pack of data.packs) {
      if (pack.cards && Array.isArray(pack.cards)) {
        for (const card of pack.cards) {
          // Default to Season 1 if no season specified
          if (!card.seasonId) {
            card.seasonId = 1;
          }
        }
      }
    }
  }

  return data;
};

// ============================================================================
// MIGRATION REGISTRY
// ============================================================================

/**
 * All migrations in order
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Add rarityCounts to metadata for performance',
    migrate: migration_1_add_rarity_counts,
  },
  {
    version: 2,
    description: 'Add seasonId support to cards',
    migrate: migration_2_add_season_support,
  },
];

// ============================================================================
// MIGRATION ENGINE
// ============================================================================

/**
 * Get the version of a collection object
 */
function getCollectionVersion(data: any): number {
  if (data && typeof data === 'object' && 'version' in data) {
    return data.version || 0;
  }
  return 0;
}

/**
 * Run all pending migrations on a collection
 *
 * @param rawData - Raw data from localStorage (may be versioned or unversioned)
 * @returns Object with success status and the migrated collection (or default on failure)
 */
export function migrateCollection(rawData: string): { success: boolean; collection: Collection } {
  try {
    // Parse raw data safely
    const parsedData = safeJsonParse<any>(rawData);

    if (!parsedData) {
      // Corrupted data - return default collection
      console.log('[Migration] Corrupted data detected, returning default collection');
      return {
        success: true,
        collection: createDefaultCollection(),
      };
    }

    // Extract version and data
    let currentVersion = getCollectionVersion(parsedData);
    let data = parsedData.version ? parsedData.data : parsedData;

    // Check if migration is needed
    if (currentVersion >= CURRENT_SCHEMA_VERSION) {
      return {
        success: true,
        collection: data as Collection,
      };
    }

    // Apply migrations in sequence
    for (const migration of MIGRATIONS) {
      if (migration.version > currentVersion) {
        try {
          console.log(`[Migration] Applying v${migration.version}: ${migration.description}`);
          data = migration.migrate(data);
          currentVersion = migration.version;
        } catch (error) {
          // Migration failed - fall back to default collection
          console.error(`[Migration] Failed at v${migration.version}, falling back to default:`, error);
          return {
            success: true,
            collection: createDefaultCollection(),
          };
        }
      }
    }

    return {
      success: true,
      collection: data as Collection,
    };
  } catch (error) {
    console.error('[Migration] Unexpected error, falling back to default:', error);
    return {
      success: true,
      collection: createDefaultCollection(),
    };
  }
}

/**
 * Wrap collection data in version envelope for storage
 */
export function versionCollection(data: Collection): VersionedCollection {
  return {
    version: CURRENT_SCHEMA_VERSION,
    data,
  };
}

/**
 * Unwrap versioned collection data
 */
export function unversionCollection(versioned: VersionedCollection): Collection {
  return versioned.data;
}

/**
 * Create migration-safe encoder for Nanostores persistentAtom
 */
export function createMigrationEncoder() {
  // Base encoder for Date serialization
  const dateEncoder = createDateEncoder<Collection>({
    dateFields: ['metadata.created', 'metadata.lastOpenedAt', 'packs.openedAt'],
  });

  return {
    encode(data: Collection): string {
      // First encode dates to ISO strings
      const withStringDates = dateEncoder.encode(data);
      const collectionWithDates = JSON.parse(withStringDates);
      
      // Then wrap in version envelope
      const versioned = versionCollection(collectionWithDates);
      return JSON.stringify(versioned);
    },

    decode(str: string): Collection {
      // Apply migrations first
      const result = migrateCollection(str);

      if (!result.success || !result.collection) {
        return createDefaultCollection();
      }

      // Use date encoder to restore Date objects
      try {
        // Ensure dates are strings (not Date objects) before passing to date encoder
        // The migrated collection should have string dates from JSON.parse, but
        // we need to stringify it again so the date encoder can process it
        const migratedJson = JSON.stringify(result.collection);
        const parsedCollection = JSON.parse(migratedJson);
        
        // Manually convert date strings to Date objects using the date encoder's logic
        const dateFields = ['metadata.created', 'metadata.lastOpenedAt', 'packs.openedAt'];
        
        for (const fieldPath of dateFields) {
          const parts = fieldPath.split('.');
          
          if (parts.length === 2) {
            // Nested field like 'metadata.created' or array field like 'packs.openedAt'
            const [parentKey, fieldName] = parts;
            
            if (parentKey === 'metadata' && parsedCollection.metadata?.[fieldName]) {
              const value = parsedCollection.metadata[fieldName];
              if (typeof value === 'string' && value !== null) {
                parsedCollection.metadata[fieldName] = new Date(value);
              }
            } else if (parentKey === 'packs' && Array.isArray(parsedCollection.packs)) {
              parsedCollection.packs.forEach((pack: any) => {
                if (pack?.[fieldName] && typeof pack[fieldName] === 'string') {
                  pack[fieldName] = new Date(pack[fieldName]);
                }
              });
            }
          }
        }
        
        return parsedCollection;
      } catch (error) {
        console.error('[Encoder] Date restoration failed, returning migrated collection:', error);
        // Fall back to migrated collection (may have string dates)
        return result.collection;
      }
    },
  };
}

/**
 * Create a default collection for fallback/corrupted data
 */
function createDefaultCollection(): Collection {
  return {
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
        mythic: 0,
      },
    },
  };
}

/**
 * Validate collection structure after migration
 */
export function validateCollection(data: any): data is Collection {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!Array.isArray(data.packs)) {
    return false;
  }

  if (!data.metadata || typeof data.metadata !== 'object') {
    return false;
  }

  const meta = data.metadata;
  if (typeof meta.totalPacksOpened !== 'number') {
    return false;
  }

  if (!Array.isArray(meta.uniqueCards)) {
    return false;
  }

  for (const pack of data.packs) {
    if (!pack.id || !Array.isArray(pack.cards)) {
      return false;
    }
  }

  return true;
}

/**
 * Export collection data for backup/transfer
 */
export function exportCollection(collection: Collection): string {
  return JSON.stringify(collection, null, 2);
}

/**
 * Import collection data from backup/transfer
 */
export function importCollection(
  jsonData: string
): { success: boolean; error?: string; collection?: Collection } {
  try {
    const parsedData = safeJsonParse<Collection | VersionedCollection>(jsonData);

    if (!parsedData) {
      return { success: false, error: 'Failed to parse collection JSON' };
    }

    // Extract collection data (handle both versioned and unversioned)
    let rawData: string;
    if ('version' in parsedData && 'data' in parsedData) {
      rawData = JSON.stringify(parsedData);
    } else {
      rawData = JSON.stringify({ version: 0, data: parsedData });
    }

    // Run migrations
    const result = migrateCollection(rawData);

    if (!result.success || !validateCollection(result.collection)) {
      return { success: false, error: 'Invalid collection data after migration' };
    }

    return {
      success: true,
      collection: result.collection!,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown import error',
    };
  }
}

/**
 * Get migration history summary
 */
export function getMigrationHistory(): Array<{ version: number; description: string }> {
  return MIGRATIONS.map((m) => ({
    version: m.version,
    description: m.description,
  }));
}
