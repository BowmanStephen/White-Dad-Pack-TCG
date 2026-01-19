/**
 * DadDeck™ Collection Storage
 *
 * Simple JSON storage with Date serialization for localStorage.
 * No versioning - just encode/decode with Date handling.
 */

import type { Collection, Rarity } from '@/types';
import { safeJsonParse } from './safe-parse';

/**
 * Create a default empty collection
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
 * Validate collection structure
 */
export function validateCollection(data: unknown): data is Collection {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.packs)) return false;
  if (!obj.metadata || typeof obj.metadata !== 'object') return false;

  const meta = obj.metadata as Record<string, unknown>;
  if (typeof meta.totalPacksOpened !== 'number') return false;
  if (!Array.isArray(meta.uniqueCards)) return false;

  // Validate each pack has id and cards array
  for (const pack of obj.packs as unknown[]) {
    if (!pack || typeof pack !== 'object') return false;
    const p = pack as Record<string, unknown>;
    if (!p.id || !Array.isArray(p.cards)) return false;
  }

  return true;
}

/**
 * Convert Date objects to ISO strings for JSON storage
 */
function encodeDates(obj: unknown): unknown {
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(encodeDates);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = encodeDates(value);
    }
    return result;
  }
  return obj;
}

/**
 * Convert ISO date strings back to Date objects
 */
function decodeDates(obj: unknown): unknown {
  if (typeof obj === 'string') {
    // Check if it's an ISO date string
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      const date = new Date(obj);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(decodeDates);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = decodeDates(value);
    }
    return result;
  }
  return obj;
}

/**
 * Create simple encoder for Nanostores persistentAtom
 */
export function createMigrationEncoder() {
  return {
    encode(data: Collection): string {
      return JSON.stringify(encodeDates(data));
    },

    decode(str: string): Collection {
      try {
        const parsed = safeJsonParse<unknown>(str);
        
        if (!parsed) {
          console.warn('[Storage] Invalid data, returning default collection');
          return createDefaultCollection();
        }

        // Handle legacy versioned format
        let data: unknown = parsed;
        if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && 'data' in parsed) {
          data = (parsed as { data: unknown }).data;
        }

        // Decode dates
        const decoded = decodeDates(data) as Collection;

        // Validate structure
        if (!validateCollection(decoded)) {
          console.warn('[Storage] Invalid collection structure, returning default');
          return createDefaultCollection();
        }

        return decoded;
      } catch (error) {
        console.error('[Storage] Decode error:', error);
        return createDefaultCollection();
      }
    },
  };
}

/**
 * Export collection data for backup
 */
export function exportCollection(collection: Collection): string {
  return JSON.stringify(encodeDates(collection), null, 2);
}

/**
 * Import collection data from backup
 */
export function importCollection(
  jsonData: string
): { success: boolean; error?: string; collection?: Collection } {
  try {
    const parsed = safeJsonParse<unknown>(jsonData);

    if (!parsed) {
      return { success: false, error: 'Failed to parse JSON' };
    }

    // Handle versioned format
    let data: unknown = parsed;
    if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && 'data' in parsed) {
      data = (parsed as { data: unknown }).data;
    }

    const decoded = decodeDates(data) as Collection;

    if (!validateCollection(decoded)) {
      return { success: false, error: 'Invalid collection structure' };
    }

    return { success: true, collection: decoded };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown import error',
    };
  }
}
