/**
 * Collection Import/Export Utilities
 *
 * Provides functionality to export collections to JSON files and import them back,
 * with comprehensive validation to ensure data integrity.
 *
 * @module lib/utils/collection-io
 */

import type { Collection, Pack, Card, Rarity } from '@/types';
import { safeJsonParse } from './safe-parse';
import { createStorageError, logError } from './errors';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of a collection validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Result of a collection export
 */
export interface ExportResult {
  success: boolean;
  data?: string;
  filename: string;
  error?: string;
}

/**
 * Result of a collection import
 */
export interface ImportResult {
  success: boolean;
  imported?: number;
  error?: string;
  validationErrors: string[];
  validationWarnings: string[];
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that a value is a non-empty string
 */
function isValidString(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Validate that a value is a number within a range
 */
function isValidNumber(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
}

/**
 * Validate that a value is one of the allowed values
 */
function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && allowed.includes(value as T);
}

/**
 * Validate that a value is an array
 */
function isValidArray(value: unknown): boolean {
  return Array.isArray(value);
}

/**
 * Validate that a value is an object (not null)
 */
function isValidObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null;
}

/**
 * Validate a Card object
 */
function validateCard(card: unknown, errors: string[], warnings: string[]): boolean {
  if (!isValidObject(card)) {
    errors.push('Card must be an object');
    return false;
  }

  const c = card as Record<string, unknown>;

  // Required fields
  if (!isValidString(c.id)) errors.push('Card missing required field: id');
  if (!isValidString(c.name)) errors.push('Card missing required field: name');
  if (!isValidString(c.subtitle)) errors.push('Card missing required field: subtitle');
  if (!isValidString(c.artwork)) errors.push('Card missing required field: artwork');
  if (!isValidString(c.flavorText)) errors.push('Card missing required field: flavorText');
  if (!isValidString(c.artist)) errors.push('Card missing required field: artist');

  // Type validation
  if (!isOneOf<Rarity>(c.rarity, ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'])) {
    errors.push(`Card has invalid rarity: ${c.rarity}`);
  }

  // Dad type validation (16 types + ITEM)
  const validDadTypes = [
    'BBQ_DAD', 'FIX_IT_DAD', 'GOLF_DAD', 'COUCH_DAD', 'LAWN_DAD',
    'CAR_DAD', 'OFFICE_DAD', 'COOL_DAD', 'COACH_DAD', 'CHEF_DAD',
    'HOLIDAY_DAD', 'WAREHOUSE_DAD', 'VINTAGE_DAD', 'FASHION_DAD',
    'TECH_DAD', 'ITEM'
  ];
  if (!isOneOf(c.type, validDadTypes)) {
    errors.push(`Card has invalid type: ${c.type}`);
  }

  // Stats validation
  if (isValidObject(c.stats)) {
    const stats = c.stats as Record<string, unknown>;
    const statFields = ['dadJoke', 'grillSkill', 'fixIt', 'napPower', 'remoteControl', 'thermostat', 'sockSandal', 'beerSnob'];

    for (const field of statFields) {
      if (!isValidNumber(stats[field], 0, 100)) {
        errors.push(`Card stats.${field} must be a number between 0 and 100`);
      }
    }
  } else {
    errors.push('Card missing required field: stats');
  }

  // Optional fields with warnings
  if (!isValidNumber(c.series, 1, 999)) {
    warnings.push(`Card has invalid series: ${c.series}`);
  }

  if (!isValidNumber(c.cardNumber, 1, 999)) {
    warnings.push(`Card has invalid cardNumber: ${c.cardNumber}`);
  }

  if (!isValidNumber(c.totalInSeries, 1, 999)) {
    warnings.push(`Card has invalid totalInSeries: ${c.totalInSeries}`);
  }

  // Abilities validation
  if (c.abilities !== undefined && !isValidArray(c.abilities)) {
    errors.push('Card abilities must be an array');
  }

  return errors.length === 0;
}

/**
 * Validate a Pack object
 */
function validatePack(pack: unknown, errors: string[], warnings: string[]): boolean {
  if (!isValidObject(pack)) {
    errors.push('Pack must be an object');
    return false;
  }

  const p = pack as Record<string, unknown>;

  // Required fields
  if (!isValidString(p.id)) errors.push('Pack missing required field: id');
  if (!isValidString(p.series)) errors.push('Pack missing required field: series');

  // Best rarity validation
  if (!isOneOf<Rarity>(p.bestRarity, ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'])) {
    errors.push(`Pack has invalid bestRarity: ${p.bestRarity}`);
  }

  // Cards validation
  if (!isValidArray(p.cards)) {
    errors.push('Pack missing required field: cards (must be array)');
    return false;
  }

  const packCards = p.cards as unknown[];
  if (packCards.length === 0) {
    errors.push('Pack must contain at least one card');
  }

  // Validate each card
  packCards.forEach((card, index) => {
    if (!validateCard(card, errors, warnings)) {
      errors.push(`Pack card at index ${index} is invalid`);
    }
  });

  // Optional fields with warnings
  if (p.openedAt !== undefined) {
    const openedAt = new Date(p.openedAt as string);
    if (isNaN(openedAt.getTime())) {
      warnings.push(`Pack has invalid openedAt date: ${p.openedAt}`);
    }
  }

  return errors.length === 0;
}

/**
 * Validate collection metadata
 */
function validateMetadata(metadata: unknown, errors: string[], warnings: string[]): boolean {
  if (!isValidObject(metadata)) {
    errors.push('Collection metadata must be an object');
    return false;
  }

  const m = metadata as Record<string, unknown>;

  // Required fields
  if (!isValidNumber(m.totalPacksOpened, 0, 999999)) {
    errors.push('Metadata totalPacksOpened must be a non-negative number');
  }

  // Optional fields with validation
  if (m.uniqueCards !== undefined && !isValidArray(m.uniqueCards)) {
    errors.push('Metadata uniqueCards must be an array');
  }

  if (m.rarePulls !== undefined && !isValidNumber(m.rarePulls, 0, 999999)) {
    warnings.push(`Metadata rarePulls has invalid value: ${m.rarePulls}`);
  }

  if (m.holoPulls !== undefined && !isValidNumber(m.holoPulls, 0, 999999)) {
    warnings.push(`Metadata holoPulls has invalid value: ${m.holoPulls}`);
  }

  // Date validation
  if (m.created !== undefined) {
    const created = new Date(m.created as string);
    if (isNaN(created.getTime())) {
      warnings.push(`Metadata has invalid created date: ${m.created}`);
    }
  }

  if (m.lastOpenedAt !== undefined && m.lastOpenedAt !== null) {
    const lastOpenedAt = new Date(m.lastOpenedAt as string);
    if (isNaN(lastOpenedAt.getTime())) {
      warnings.push(`Metadata has invalid lastOpenedAt date: ${m.lastOpenedAt}`);
    }
  }

  // Rarity counts validation
  if (m.rarityCounts !== undefined) {
    if (!isValidObject(m.rarityCounts)) {
      errors.push('Metadata rarityCounts must be an object');
    } else {
      const rarityCounts = m.rarityCounts as Record<string, unknown>;
      const validRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

      for (const rarity of validRarities) {
        if (!isValidNumber(rarityCounts[rarity], 0, 999999)) {
          errors.push(`Metadata rarityCounts.${rarity} must be a non-negative number`);
        }
      }
    }
  }

  return errors.length === 0;
}

/**
 * Validate a complete Collection object
 */
export function validateCollection(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Top-level structure validation
  if (!isValidObject(data)) {
    return {
      valid: false,
      errors: ['Collection data must be an object'],
      warnings: []
    };
  }

  const collection = data as Record<string, unknown>;

  // Required top-level fields
  if (!isValidArray(collection.packs)) {
    errors.push('Collection must have a packs array');
    return {
      valid: false,
      errors,
      warnings
    };
  }

  if (!isValidObject(collection.metadata)) {
    errors.push('Collection must have a metadata object');
    return {
      valid: false,
      errors,
      warnings
    };
  }

  // Validate metadata
  validateMetadata(collection.metadata, errors, warnings);

  // Validate packs
  const packs = collection.packs as unknown[];
  if (packs.length === 0) {
    warnings.push('Collection has no packs');
  }

  packs.forEach((pack, index) => {
    if (!validatePack(pack, errors, warnings)) {
      errors.push(`Pack at index ${index} is invalid`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export collection data as JSON string
 *
 * @param collection - The collection to export
 * @returns JSON string with 2-space indentation
 */
export function exportCollectionToString(collection: Collection): string {
  return JSON.stringify(collection, null, 2);
}

/**
 * Export collection as downloadable JSON file
 *
 * @param collection - The collection to export
 * @returns Export result with data and filename
 */
export function exportCollectionToFile(collection: Collection): ExportResult {
  try {
    const data = exportCollectionToString(collection);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const packCount = collection.packs.length;
    const filename = `daddeck-collection-${timestamp}-${packCount}packs.json`;

    return {
      success: true,
      data,
      filename
    };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to export collection',
      () => exportCollectionToFile(collection)
    );
    logError(storageError, error);

    return {
      success: false,
      filename: '',
      error: storageError.message
    };
  }
}

/**
 * Trigger browser download of exported collection
 *
 * @param collection - The collection to download
 * @returns Export result
 */
export function downloadCollection(collection: Collection): ExportResult {
  const result = exportCollectionToFile(collection);

  if (!result.success || !result.data) {
    return result;
  }

  try {
    // Create blob and download link
    const blob = new Blob([result.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return result;
  } catch (error) {
    const downloadError = createStorageError(
      error instanceof Error ? error.message : 'Failed to download collection',
      () => downloadCollection(collection)
    );
    logError(downloadError, error);

    return {
      success: false,
      filename: result.filename,
      error: downloadError.message
    };
  }
}

// ============================================================================
// IMPORT FUNCTIONS
// ============================================================================

/**
 * Import collection from JSON string
 *
 * @param jsonData - JSON string to import
 * @returns Import result with validation details
 */
export function importCollectionFromString(jsonData: string): ImportResult {
  // Parse JSON
  const data = safeJsonParse<Collection>(jsonData);

  if (!data) {
    return {
      success: false,
      error: 'Failed to parse collection JSON (invalid JSON format)',
      validationErrors: [],
      validationWarnings: []
    };
  }

  // Validate structure
  const validation = validateCollection(data);

  if (!validation.valid) {
    return {
      success: false,
      error: 'Collection data validation failed',
      validationErrors: validation.errors,
      validationWarnings: validation.warnings
    };
  }

  // Return success with validation info
  return {
    success: true,
    imported: data.packs.length,
    validationErrors: [],
    validationWarnings: validation.warnings
  };
}

/**
 * Import collection from File object
 *
 * @param file - File object from file input
 * @returns Promise that resolves to import result
 */
export async function importCollectionFromFile(file: File): Promise<ImportResult> {
  try {
    // Check file type
    if (!file.name.endsWith('.json')) {
      return {
        success: false,
        error: 'File must be a JSON file (.json extension)',
        validationErrors: [],
        validationWarnings: []
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`,
        validationErrors: [],
        validationWarnings: []
      };
    }

    // Read file
    const text = await file.text();

    // Import from string
    const result = importCollectionFromString(text);

    // If successful, add filename to result
    if (result.success) {
      return {
        ...result,
        error: undefined
      };
    }

    return result;
  } catch (error) {
    const importError = createStorageError(
      error instanceof Error ? error.message : 'Failed to read file',
      () => importCollectionFromFile(file)
    );
    logError(importError, error);

    return {
      success: false,
      error: importError.message,
      validationErrors: [],
      validationWarnings: []
    };
  }
}

/**
 * Trigger file picker for collection import
 *
 * @returns Promise that resolves to import result
 */
export async function pickAndImportCollection(): Promise<ImportResult> {
  return new Promise((resolve) => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({
          success: false,
          error: 'No file selected',
          validationErrors: [],
          validationWarnings: []
        });
        return;
      }

      const result = await importCollectionFromFile(file);
      resolve(result);
    };

    input.oncancel = () => {
      resolve({
        success: false,
        error: 'File selection cancelled',
        validationErrors: [],
        validationWarnings: []
      });
    };

    // Trigger file picker
    input.click();
  });
}
