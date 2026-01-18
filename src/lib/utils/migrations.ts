/**
 * DadDeck™ Collection Storage Utilities
 *
 * Simple JSON storage with Date handling for localStorage persistence.
 * No schema versioning - just clean encode/decode with Date serialization.
 */

import type { Collection } from '@/types';
import { createDateEncoder } from './encoders';

/**
 * Create a default collection for new users or fallback
 */
export function createDefaultCollection(): Collection {
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
 * Create simple encoder for Nanostores persistentAtom
 * Just handles JSON encode/decode with Date serialization
 */
export function createMigrationEncoder() {
  const dateEncoder = createDateEncoder<Collection>({
    dateFields: ['metadata.created', 'metadata.lastOpenedAt', 'packs.openedAt'],
  });

  return {
    encode(data: Collection): string {
      return dateEncoder.encode(data);
    },

    decode(str: string): Collection {
      try {
        const data = dateEncoder.decode(str);
        if (validateCollection(data)) {
          return data;
        }
        console.warn('[Storage] Invalid collection structure, returning default');
        return createDefaultCollection();
      } catch (error) {
        console.error('[Storage] Failed to decode collection:', error);
        return createDefaultCollection();
      }
    },
  };
}

/**
 * Validate collection structure
 */
export function validateCollection(data: unknown): data is Collection {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.packs)) {
    return false;
  }

  if (!obj.metadata || typeof obj.metadata !== 'object') {
    return false;
  }

  const meta = obj.metadata as Record<string, unknown>;
  if (typeof meta.totalPacksOpened !== 'number') {
    return false;
  }

  if (!Array.isArray(meta.uniqueCards)) {
    return false;
  }

  for (const pack of obj.packs as unknown[]) {
    if (!pack || typeof pack !== 'object') {
      return false;
    }
    const p = pack as Record<string, unknown>;
    if (!p.id || !Array.isArray(p.cards)) {
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
    const data = JSON.parse(jsonData);

    if (!validateCollection(data)) {
      return { success: false, error: 'Invalid collection data structure' };
    }

    return {
      success: true,
      collection: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
    };
  }
}
