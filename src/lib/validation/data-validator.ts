/**
 * Data Validation Utilities - MP-006: Database validation checks
 *
 * Validates card and recipe data on load to ensure data integrity
 * Logs warnings for missing required fields
 */

import type { Rarity, DadType } from '@/types';
import { RARITY_ORDER, DAD_TYPE_NAMES } from '@/types';

// Extract valid values from existing constants
const ALL_RARITIES = Object.keys(RARITY_ORDER) as Rarity[];
const ALL_DAD_TYPES = Object.keys(DAD_TYPE_NAMES) as DadType[];

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getRecordId(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const id = value.id;
  return typeof id === 'string' ? id : undefined;
}

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

/**
 * Validation issue with severity level
 */
export interface ValidationIssue {
  type: 'card' | 'recipe';
  id?: string;
  field: string;
  severity: 'warning' | 'error';
  message: string;
}

/**
 * Validation result summary
 */
export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationIssue[];
  errors: ValidationIssue[];
}

// ============================================================================
// CARD VALIDATION
// ============================================================================

/**
 * Required fields for Card type (based on src/types/index.ts)
 */
const REQUIRED_CARD_FIELDS = [
  'id',
  'name',
  'subtitle',
  'type',
  'rarity',
  'artwork',
  'stats',
  'flavorText',
  'abilities',
  'series',
  'cardNumber',
  'totalInSeries',
  'artist',
] as const;

/**
 * Required stat fields for CardStats
 */
const REQUIRED_STAT_FIELDS = [
  'dadJoke',
  'grillSkill',
  'fixIt',
  'napPower',
  'remoteControl',
  'thermostat',
  'sockSandal',
  'beerSnob',
] as const;

/**
 * Validate a single card object
 */
function validateCard(card: unknown, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(card)) {
    issues.push({
      type: 'card',
      id: `unknown (index ${index})`,
      field: 'card',
      severity: 'error',
      message: `Card at index ${index} is not a valid object`,
    });
    return issues;
  }

  const cardId = typeof card.id === 'string' ? card.id : `unknown (index ${index})`;

  // Check for missing required fields
  for (const field of REQUIRED_CARD_FIELDS) {
    if (card[field] === undefined || card[field] === null) {
      issues.push({
        type: 'card',
        id: cardId,
        field,
        severity: 'error',
        message: `Card "${cardId}" is missing required field: ${field}`,
      });
    }
  }

  // Validate stats object exists and has all required fields
  const statsValue = card.stats;
  if (statsValue && typeof statsValue === 'object') {
    const stats = statsValue as UnknownRecord;
    for (const stat of REQUIRED_STAT_FIELDS) {
      if (stats[stat] === undefined || stats[stat] === null) {
        issues.push({
          type: 'card',
          id: cardId,
          field: `stats.${stat}`,
          severity: 'error',
          message: `Card "${cardId}" is missing required stat: ${stat}`,
        });
      } else if (typeof stats[stat] !== 'number') {
        issues.push({
          type: 'card',
          id: cardId,
          field: `stats.${stat}`,
          severity: 'error',
          message: `Card "${cardId}" has invalid type for stat ${stat}: expected number, got ${typeof stats[stat]}`,
        });
      } else if ((stats[stat] as number) < 0 || (stats[stat] as number) > 100) {
        issues.push({
          type: 'card',
          id: cardId,
          field: `stats.${stat}`,
          severity: 'warning',
          message: `Card "${cardId}" has stat ${stat} out of range (0-100): ${stats[stat]}`,
        });
      }
    }
  } else if (!issues.find(i => i.field === 'stats')) {
    issues.push({
      type: 'card',
      id: cardId,
      field: 'stats',
      severity: 'error',
      message: `Card "${cardId}" is missing required stats object`,
    });
  }

  // Validate rarity enum
  if (typeof card.rarity === 'string' && !ALL_RARITIES.includes(card.rarity as Rarity)) {
    issues.push({
      type: 'card',
      id: cardId,
      field: 'rarity',
      severity: 'error',
      message: `Card "${cardId}" has invalid rarity: ${card.rarity}. Must be one of: ${ALL_RARITIES.join(', ')}`,
    });
  }

  // Validate type enum
  if (typeof card.type === 'string' && !ALL_DAD_TYPES.includes(card.type as DadType)) {
    issues.push({
      type: 'card',
      id: cardId,
      field: 'type',
      severity: 'error',
      message: `Card "${cardId}" has invalid type: ${card.type}. Must be one of: ${ALL_DAD_TYPES.join(', ')}`,
    });
  }

  // Validate abilities is an array
  if (card.abilities && !Array.isArray(card.abilities)) {
    issues.push({
      type: 'card',
      id: cardId,
      field: 'abilities',
      severity: 'error',
      message: `Card "${cardId}" abilities field must be an array, got ${typeof card.abilities}`,
    });
  }

  // Validate numeric fields
  if (card.series !== undefined && typeof card.series !== 'number') {
    issues.push({
      type: 'card',
      id: cardId,
      field: 'series',
      severity: 'warning',
      message: `Card "${cardId}" series field should be a number, got ${typeof card.series}`,
    });
  }

  if (card.cardNumber !== undefined && typeof card.cardNumber !== 'number') {
    issues.push({
      type: 'card',
      id: cardId,
      field: 'cardNumber',
      severity: 'warning',
      message: `Card "${cardId}" cardNumber field should be a number, got ${typeof card.cardNumber}`,
    });
  }

  if (card.totalInSeries !== undefined && typeof card.totalInSeries !== 'number') {
    issues.push({
      type: 'card',
      id: cardId,
      field: 'totalInSeries',
      severity: 'warning',
      message: `Card "${cardId}" totalInSeries field should be a number, got ${typeof card.totalInSeries}`,
    });
  }

  return issues;
}

/**
 * Validate all cards in the database
 */
export function validateCards(cards: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!Array.isArray(cards)) {
    return {
      isValid: false,
      warnings: [],
      errors: [
        {
          type: 'card',
          field: 'cards',
          severity: 'error',
          message: 'Cards data is not an array',
        },
      ],
    };
  }

  if (cards.length === 0) {
    return {
      isValid: false,
      warnings: [],
      errors: [
        {
          type: 'card',
          field: 'cards',
          severity: 'error',
          message: 'Cards database is empty',
        },
      ],
    };
  }

  // Validate each card
  cards.forEach((card, index) => {
    const cardIssues = validateCard(card, index);
    issues.push(...cardIssues);
  });

  // Check for duplicate IDs
  const ids = cards.map(getRecordId).filter((id): id is string => Boolean(id));
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    issues.push({
      type: 'card',
      field: 'id',
      severity: 'error',
      message: `Found duplicate card IDs: ${[...new Set(duplicates)].join(', ')}`,
    });
  }

  // Separate warnings and errors
  const warnings = issues.filter(i => i.severity === 'warning');
  const errors = issues.filter(i => i.severity === 'error');

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

// ============================================================================
// RECIPE VALIDATION
// ============================================================================

/**
 * Required fields for CraftingRecipe type (based on src/types/crafting.ts)
 */
const REQUIRED_RECIPE_FIELDS = [
  'id',
  'name',
  'description',
  'inputRarity',
  'inputCount',
  'outputRarity',
  'outputCount',
  'successRate',
] as const;

/**
 * Validate a single recipe object
 */
function validateRecipe(recipe: unknown, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(recipe)) {
    issues.push({
      type: 'recipe',
      id: `unknown (index ${index})`,
      field: 'recipe',
      severity: 'error',
      message: `Recipe at index ${index} is not a valid object`,
    });
    return issues;
  }

  const recipeId = typeof recipe.id === 'string' ? recipe.id : `unknown (index ${index})`;

  // Check for missing required fields
  for (const field of REQUIRED_RECIPE_FIELDS) {
    if (recipe[field] === undefined || recipe[field] === null) {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field,
        severity: 'error',
        message: `Recipe "${recipeId}" is missing required field: ${field}`,
      });
    }
  }

  // Validate rarity enums
  if (typeof recipe.inputRarity === 'string' && !ALL_RARITIES.includes(recipe.inputRarity as Rarity)) {
    issues.push({
      type: 'recipe',
      id: recipeId,
      field: 'inputRarity',
      severity: 'error',
      message: `Recipe "${recipeId}" has invalid inputRarity: ${recipe.inputRarity}. Must be one of: ${ALL_RARITIES.join(', ')}`,
    });
  }

  if (typeof recipe.outputRarity === 'string' && !ALL_RARITIES.includes(recipe.outputRarity as Rarity)) {
    issues.push({
      type: 'recipe',
      id: recipeId,
      field: 'outputRarity',
      severity: 'error',
      message: `Recipe "${recipeId}" has invalid outputRarity: ${recipe.outputRarity}. Must be one of: ${ALL_RARITIES.join(', ')}`,
    });
  }

  // Validate numeric fields
  if (recipe.inputCount !== undefined) {
    if (typeof recipe.inputCount !== 'number') {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field: 'inputCount',
        severity: 'error',
        message: `Recipe "${recipeId}" inputCount must be a number, got ${typeof recipe.inputCount}`,
      });
    } else if (recipe.inputCount < 1) {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field: 'inputCount',
        severity: 'error',
        message: `Recipe "${recipeId}" inputCount must be at least 1, got ${recipe.inputCount}`,
      });
    }
  }

  if (recipe.outputCount !== undefined) {
    if (typeof recipe.outputCount !== 'number') {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field: 'outputCount',
        severity: 'error',
        message: `Recipe "${recipeId}" outputCount must be a number, got ${typeof recipe.outputCount}`,
      });
    } else if (recipe.outputCount < 1) {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field: 'outputCount',
        severity: 'error',
        message: `Recipe "${recipeId}" outputCount must be at least 1, got ${recipe.outputCount}`,
      });
    }
  }

  if (recipe.successRate !== undefined) {
    if (typeof recipe.successRate !== 'number') {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field: 'successRate',
        severity: 'error',
        message: `Recipe "${recipeId}" successRate must be a number, got ${typeof recipe.successRate}`,
      });
    } else if (recipe.successRate < 0 || recipe.successRate > 1) {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field: 'successRate',
        severity: 'error',
        message: `Recipe "${recipeId}" successRate must be between 0 and 1, got ${recipe.successRate}`,
      });
    }
  }

  if (recipe.failReturnRate !== undefined) {
    if (typeof recipe.failReturnRate !== 'number') {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field: 'failReturnRate',
        severity: 'error',
        message: `Recipe "${recipeId}" failReturnRate must be a number, got ${typeof recipe.failReturnRate}`,
      });
    } else if (recipe.failReturnRate < 0 || recipe.failReturnRate > 1) {
      issues.push({
        type: 'recipe',
        id: recipeId,
        field: 'failReturnRate',
        severity: 'error',
        message: `Recipe "${recipeId}" failReturnRate must be between 0 and 1, got ${recipe.failReturnRate}`,
      });
    }
  }

  return issues;
}

/**
 * Validate all crafting recipes
 */
export function validateRecipes(recipes: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!Array.isArray(recipes)) {
    return {
      isValid: false,
      warnings: [],
      errors: [
        {
          type: 'recipe',
          field: 'recipes',
          severity: 'error',
          message: 'Recipes data is not an array',
        },
      ],
    };
  }

  if (recipes.length === 0) {
    return {
      isValid: false,
      warnings: [],
      errors: [
        {
          type: 'recipe',
          field: 'recipes',
          severity: 'error',
          message: 'Recipes database is empty',
        },
      ],
    };
  }

  // Validate each recipe
  recipes.forEach((recipe, index) => {
    const recipeIssues = validateRecipe(recipe, index);
    issues.push(...recipeIssues);
  });

  // Check for duplicate IDs
  const ids = recipes.map(getRecordId).filter((id): id is string => Boolean(id));
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    issues.push({
      type: 'recipe',
      field: 'id',
      severity: 'error',
      message: `Found duplicate recipe IDs: ${[...new Set(duplicates)].join(', ')}`,
    });
  }

  // Separate warnings and errors
  const warnings = issues.filter(i => i.severity === 'warning');
  const errors = issues.filter(i => i.severity === 'error');

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

/**
 * Log validation results to console (DEV only)
 */
export function logValidationResults(
  result: ValidationResult,
  dataType: 'cards' | 'recipes'
): void {
  if (!import.meta.env.DEV) return;

  if (result.isValid && result.warnings.length === 0) {
    console.log(`✅ ${dataType} validation passed: No issues found`);
    return;
  }

  if (result.errors.length > 0) {
    console.error(`❌ ${dataType} validation failed: ${result.errors.length} error(s) found`);
    result.errors.forEach((error, index) => {
      console.error(`  ${index + 1}. [${error.severity.toUpperCase()}] ${error.message}`);
    });
  }

  if (result.warnings.length > 0) {
    console.warn(`⚠️  ${dataType} validation: ${result.warnings.length} warning(s) found`);
    result.warnings.forEach((warning, index) => {
      console.warn(`  ${index + 1}. [${warning.severity.toUpperCase()}] ${warning.message}`);
    });
  }
}
