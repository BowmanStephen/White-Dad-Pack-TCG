/**
 * Crafting Executor - US080: Card Crafting - Combine Cards
 *
 * Core crafting logic for:
 * - Validating recipes
 * - Executing crafts (success/failure)
 * - Generating result cards
 * - Managing inventory changes
 */

import type {
  CraftingRecipe,
  PackCard,
  Card,
  Rarity,
} from '@/types';
import { RARITY_CONFIG, RARITY_ORDER } from '@/types';

// ============================================================================
// CRAFTING VALIDATION
// ============================================================================

/**
 * Validation error types for better error handling
 */
export type ValidationErrorType =
  | 'INVALID_RECIPE_ID'
  | 'INVALID_RARITY'
  | 'INSUFFICIENT_CURRENCY'
  | 'INSUFFICIENT_CARDS'
  | 'CARD_COUNT_MISMATCH'
  | 'EMPTY_SELECTION';

/**
 * Detailed validation error result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorType?: ValidationErrorType;
}

/**
 * Validate recipe ID exists in available recipes
 */
export function validateRecipeId(
  recipeId: string | undefined | null,
  availableRecipes: CraftingRecipe[]
): ValidationResult {
  if (!recipeId) {
    return {
      valid: false,
      error: 'No recipe selected. Please select a recipe to craft.',
      errorType: 'INVALID_RECIPE_ID',
    };
  }

  const recipeExists = availableRecipes.some((recipe) => recipe.id === recipeId);
  if (!recipeExists) {
    return {
      valid: false,
      error: `Invalid recipe ID: ${recipeId}. This recipe does not exist.`,
      errorType: 'INVALID_RECIPE_ID',
    };
  }

  return { valid: true };
}

/**
 * Validate card rarity matches recipe requirements
 */
export function validateCardRarities(
  recipe: CraftingRecipe,
  selectedCards: PackCard[]
): ValidationResult {
  if (selectedCards.length === 0) {
    return {
      valid: false,
      error: 'No cards selected. Please select cards to craft with.',
      errorType: 'EMPTY_SELECTION',
    };
  }

  // Check that all cards match the required rarity
  const invalidCards = selectedCards.filter(
    (card) => card.rarity !== recipe.inputRarity
  );

  if (invalidCards.length > 0) {
    const requiredRarityName = RARITY_CONFIG[recipe.inputRarity].name;
    return {
      valid: false,
      error: `${invalidCards.length} card(s) do not match required rarity. All cards must be ${requiredRarityName}.`,
      errorType: 'INVALID_RARITY',
    };
  }

  return { valid: true };
}

/**
 * Validate player has sufficient currency for crafting
 */
export function validatePlayerCurrency(
  recipe: CraftingRecipe,
  playerCurrency: number
): ValidationResult {
  const cost = calculateCraftingCost(recipe);

  if (playerCurrency < cost) {
    return {
      valid: false,
      error: `Insufficient crafting currency. Need ${cost.toFixed(2)} ${getCurrencyName()}, but you only have ${playerCurrency.toFixed(2)}.`,
      errorType: 'INSUFFICIENT_CURRENCY',
    };
  }

  return { valid: true };
}

/**
 * Validate player has sufficient cards for crafting
 */
export function validateCardCount(
  recipe: CraftingRecipe,
  selectedCards: PackCard[]
): ValidationResult {
  if (selectedCards.length !== recipe.inputCount) {
    return {
      valid: false,
      error: `Need ${recipe.inputCount} cards for this recipe, but only ${selectedCards.length} selected.`,
      errorType: 'CARD_COUNT_MISMATCH',
    };
  }

  return { valid: true };
}

/**
 * Comprehensive validation that checks all requirements for crafting
 *
 * @param recipeId - ID of the recipe to validate
 * @param recipe - The recipe object (must be provided if recipeId is valid)
 * @param selectedCards - Cards selected for crafting
 * @param playerCurrency - Player's current crafting currency
 * @param availableRecipes - All available recipes (for recipe ID validation)
 * @returns Validation result with detailed error message if invalid
 */
export function validateCraftingAttempt(
  recipeId: string | undefined | null,
  recipe: CraftingRecipe | null,
  selectedCards: PackCard[],
  playerCurrency: number,
  availableRecipes: CraftingRecipe[]
): ValidationResult {
  // Validate recipe ID exists
  const recipeIdValidation = validateRecipeId(recipeId, availableRecipes);
  if (!recipeIdValidation.valid) {
    return recipeIdValidation;
  }

  // Ensure recipe object is provided
  if (!recipe) {
    return {
      valid: false,
      error: 'Recipe data not loaded. Please try selecting the recipe again.',
      errorType: 'INVALID_RECIPE_ID',
    };
  }

  // Validate card count
  const cardCountValidation = validateCardCount(recipe, selectedCards);
  if (!cardCountValidation.valid) {
    return cardCountValidation;
  }

  // Validate card rarities
  const rarityValidation = validateCardRarities(recipe, selectedCards);
  if (!rarityValidation.valid) {
    return rarityValidation;
  }

  // Validate player currency
  const currencyValidation = validatePlayerCurrency(recipe, playerCurrency);
  if (!currencyValidation.valid) {
    return currencyValidation;
  }

  return { valid: true };
}

/**
 * Legacy validation function for backwards compatibility
 * @deprecated Use validateCraftingAttempt for comprehensive validation
 */
export function validateRecipeSelection(
  recipe: CraftingRecipe,
  selectedCards: PackCard[]
): ValidationResult {
  // Validate card count
  const cardCountValidation = validateCardCount(recipe, selectedCards);
  if (!cardCountValidation.valid) {
    return cardCountValidation;
  }

  // Validate card rarities
  return validateCardRarities(recipe, selectedCards);
}

// ============================================================================
// CRAFTING EXECUTION
// ============================================================================

/**
 * Execute a crafting attempt
 *
 * @param recipe - The recipe being crafted
 * @param inputCards - The cards being consumed
 * @param allCards - All available cards (for selecting result card)
 * @returns Crafting result with success/failure and output card(s)
 */
export function executeCraft(
  recipe: CraftingRecipe,
  inputCards: PackCard[],
  allCards: Card[]
): {
  success: boolean;
  resultCard?: PackCard;
  returnedCards?: PackCard[];
  consumedCards: PackCard[];
} {
  // Validate selection
  const validation = validateRecipeSelection(recipe, inputCards);
  if (!validation.valid) {
    return {
      success: false,
      consumedCards: [],
    };
  }

  // Roll for success
  const success = Math.random() < recipe.successRate;

  if (success) {
    // Generate result card
    const resultCard = generateResultCard(recipe, allCards);

    return {
      success: true,
      resultCard,
      consumedCards: inputCards,
    };
  } else {
    // Calculate cards to return on failure
    const returnedCount = recipe.failReturnRate
      ? Math.ceil(inputCards.length * recipe.failReturnRate)
      : 0;

    const returnedCards = returnedCount > 0
      ? inputCards.slice(0, returnedCount)
      : inputCards; // When failReturnRate=0, return all cards

    const consumedCards = returnedCount > 0
      ? inputCards.slice(returnedCount)
      : []; // When failReturnRate=0, consume no cards

    return {
      success: false,
      returnedCards,
      consumedCards,
    };
  }
}

// ============================================================================
// RESULT CARD GENERATION
// ============================================================================

/**
 * Generate a result card based on the recipe
 */
function generateResultCard(
  recipe: CraftingRecipe,
  allCards: Card[]
): PackCard {
  // Filter cards by output rarity
  const candidates = allCards.filter(
    (card) => card.rarity === recipe.outputRarity
  );

  if (candidates.length === 0) {
    throw new Error(`No cards found with rarity ${recipe.outputRarity}`);
  }

  // Select random card
  const baseCard = candidates[Math.floor(Math.random() * candidates.length)];

  // Determine if result is holo (10% chance for rare+)
  const isHolo = RARITY_ORDER[recipe.outputRarity] >= RARITY_ORDER.rare
    ? Math.random() < 0.1
    : false;

  // Determine holo type
  let holoType: 'none' | 'standard' | 'reverse' | 'full_art' | 'prismatic' = 'none';
  if (isHolo) {
    const holoRoll = Math.random();
    if (recipe.outputRarity === 'mythic') {
      holoType = 'prismatic';
    } else if (recipe.outputRarity === 'legendary') {
      holoType = holoRoll < 0.5 ? 'full_art' : 'prismatic';
    } else if (recipe.outputRarity === 'epic') {
      holoType = holoRoll < 0.6 ? 'reverse' : holoRoll < 0.9 ? 'full_art' : 'standard';
    } else {
      holoType = holoRoll < 0.7 ? 'reverse' : 'standard';
    }
  }

  return {
    ...baseCard,
    isRevealed: false,
    isHolo,
    holoType,
  };
}

// ============================================================================
// INVENTORY MANAGEMENT
// ============================================================================

/**
 * Calculate inventory changes from crafting
 */
export function calculateInventoryChanges(
  success: boolean,
  inputCards: PackCard[],
  resultCard?: PackCard,
  returnedCards?: PackCard[]
): {
  removed: string[]; // Card IDs to remove
  added: PackCard[]; // Cards to add
} {
  const removed = inputCards.map((card) => card.id);
  const added: PackCard[] = [];

  if (success && resultCard) {
    added.push(resultCard);
  }

  if (returnedCards && returnedCards.length > 0) {
    added.push(...returnedCards);
  }

  return { removed, added };
}

/**
 * Check if user has enough cards for a recipe
 */
export function hasCardsForRecipe(
  recipe: CraftingRecipe,
  inventory: Map<string, number>
): boolean {
  let count = 0;

  for (const [cardId, qty] of inventory.entries()) {
    // This would need the actual card data to check rarity
    // For now, we'll assume the caller has pre-filtered
    count += qty;
  }

  return count >= recipe.inputCount;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all cards of a specific rarity from inventory
 */
export function getCardsByRarity(
  allCards: PackCard[],
  rarity: Rarity
): PackCard[] {
  return allCards.filter((card) => card.rarity === rarity);
}

/**
 * Sort cards by rarity (descending)
 */
export function sortCardsByRarity(cards: PackCard[]): PackCard[] {
  return [...cards].sort((a, b) => {
    const aOrder = RARITY_ORDER[a.rarity];
    const bOrder = RARITY_ORDER[b.rarity];
    return bOrder - aOrder;
  });
}

/**
 * Get crafting success chance display text
 */
export function getSuccessRateText(recipe: CraftingRecipe): string {
  const percentage = Math.round(recipe.successRate * 100);
  return `${percentage}% success rate`;
}

/**
 * Get failure return text
 */
export function getFailureReturnText(recipe: CraftingRecipe): string {
  if (!recipe.failReturnRate) return 'All cards consumed on failure';

  const returnPercent = Math.round(recipe.failReturnRate * 100);
  const returnCount = Math.ceil(recipe.inputCount * recipe.failReturnRate);
  return `On failure: ${returnCount} of ${recipe.inputCount} cards returned (${returnPercent}%)`;
}

/**
 * Calculate crafting cost for a recipe
 *
 * Cost is based on:
 * - Base cost per card
 * - Input rarity multiplier (rarer inputs = higher cost)
 * - Output rarity multiplier (rarer outputs = higher cost)
 *
 * @param recipe - The recipe to calculate cost for
 * @returns Cost in crafting currency (0 for zero-cost recipes)
 */
export function calculateCraftingCost(recipe: CraftingRecipe): number {
  // Base cost per card in the recipe
  const BASE_COST_PER_CARD = 10;

  // Rarity multipliers (higher rarity = higher multiplier)
  const RARITY_MULTIPLIERS: Record<Rarity, number> = {
    common: 1.0,
    uncommon: 1.5,
    rare: 2.0,
    epic: 3.0,
    legendary: 5.0,
    mythic: 10.0,
  };

  // Get multipliers for input and output rarities
  const inputMultiplier = RARITY_MULTIPLIERS[recipe.inputRarity];
  const outputMultiplier = RARITY_MULTIPLIERS[recipe.outputRarity];

  // Calculate base cost from input cards
  const baseCost = recipe.inputCount * BASE_COST_PER_CARD * inputMultiplier;

  // Apply output rarity multiplier
  const totalCost = baseCost * outputMultiplier;

  // Handle zero-cost recipes (round to 2 decimal places)
  return Math.round(totalCost * 100) / 100;
}

/**
 * Check if player can afford to craft a recipe
 *
 * @param recipe - The recipe to check
 * @param playerCurrency - The player's current crafting currency balance
 * @returns true if player has sufficient currency, false otherwise
 */
export function canAffordCraft(recipe: CraftingRecipe, playerCurrency: number): boolean {
  const cost = calculateCraftingCost(recipe);
  return playerCurrency >= cost;
}

/**
 * Roll for crafting success based on recipe success rate
 *
 * @param recipe - The recipe being crafted
 * @returns true if crafting succeeds, false otherwise
 */
export function rollCraftingSuccess(recipe: CraftingRecipe): boolean {
  return Math.random() < recipe.successRate;
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Get the display name for crafting currency
 * Currently returns "Dad Coins" but can be changed for different currencies
 */
function getCurrencyName(): string {
  return 'Dad Coins';
}
