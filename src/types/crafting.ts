import type { Rarity } from './core';
import type { PackCard } from './card';

// ============================================================================
// CRAFTING TYPES (US080 - Card Crafting - Combine Cards)
// ============================================================================

// Crafting state machine
export type CraftingState =
  | 'idle'            // Ready to start crafting
  | 'selecting'       // Selecting cards for crafting
  | 'crafting'        // Crafting animation playing
  | 'success'         // Craft succeeded
  | 'failed'          // Craft failed
  | 'history';        // Viewing crafting history

// Crafting recipe interface
export interface CraftingRecipe {
  id: string;                      // Unique recipe ID
  name: string;                    // Recipe display name
  description: string;             // Recipe description
  inputRarity: Rarity;             // Input card rarity
  inputCount: number;              // Number of cards required (typically 5)
  outputRarity: Rarity;            // Output card rarity
  outputCount: number;             // Number of cards produced (typically 1)
  successRate: number;             // Success rate (0-1)
  failReturnRate?: number;         // On fail, % of cards returned (0-1)
}

// Crafting session interface
export interface CraftingSession {
  id: string;                      // Unique session ID
  recipe: CraftingRecipe;          // Selected recipe
  selectedCards: string[];         // IDs of selected cards
  status: CraftingState;           // Current crafting state
  result?: PackCard;               // Result card (if successful)
  timestamp: Date;                 // When crafting started
  completedAt?: Date;              // When crafting completed
}

// Crafting history entry
export interface CraftingHistoryEntry {
  id: string;                      // Unique entry ID
  sessionId: string;               // Reference to crafting session
  recipe: CraftingRecipe;          // Recipe used
  inputCards: string[];            // Card IDs used as input
  result?: PackCard;               // Result card (if successful)
  success: boolean;                // Whether crafting succeeded
  timestamp: Date;                 // When crafting occurred
}

// Crafting history state
export interface CraftingHistory {
  entries: CraftingHistoryEntry[];  // All crafting attempts
  totalAttempts: number;            // Total crafts attempted
  successfulCrafts: number;         // Successful crafts
  failedCrafts: number;             // Failed crafts
  bestCraft: PackCard | null;       // Best card crafted
}

// Crafting configuration
export interface CraftingConfig {
  maxHistoryEntries: number;        // Max history entries to keep
  enableSoundEffects: boolean;      // Whether to play sounds during crafting
  animationDuration: number;        // Crafting animation duration (ms)
}

// Default crafting configuration
export const DEFAULT_CRAFTING_CONFIG: CraftingConfig = {
  maxHistoryEntries: 100,
  enableSoundEffects: true,
  animationDuration: 3000,
};

// Crafting recipes (following acceptance criteria)
// - 5 common → 1 uncommon (100% success)
// - 5 uncommon → 1 rare (100% success)
// - 5 rare → 1 epic (50% success)
// - 5 epic → 1 legendary (50% success)
// - 5 legendary → 1 mythic (25% success)
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'common_to_uncommon',
    name: 'Common to Uncommon',
    description: 'Combine 5 Common cards to craft 1 Uncommon card',
    inputRarity: 'common',
    inputCount: 5,
    outputRarity: 'uncommon',
    outputCount: 1,
    successRate: 1.0,              // 100% success
  },
  {
    id: 'uncommon_to_rare',
    name: 'Uncommon to Rare',
    description: 'Combine 5 Uncommon cards to craft 1 Rare card',
    inputRarity: 'uncommon',
    inputCount: 5,
    outputRarity: 'rare',
    outputCount: 1,
    successRate: 1.0,              // 100% success
  },
  {
    id: 'rare_to_epic',
    name: 'Rare to Epic',
    description: 'Combine 5 Rare cards to craft 1 Epic card (50% success)',
    inputRarity: 'rare',
    inputCount: 5,
    outputRarity: 'epic',
    outputCount: 1,
    successRate: 0.5,              // 50% success
    failReturnRate: 0.6,           // Return 60% of cards on fail
  },
  {
    id: 'epic_to_legendary',
    name: 'Epic to Legendary',
    description: 'Combine 5 Epic cards to craft 1 Legendary card (50% success)',
    inputRarity: 'epic',
    inputCount: 5,
    outputRarity: 'legendary',
    outputCount: 1,
    successRate: 0.5,              // 50% success
    failReturnRate: 0.4,           // Return 40% of cards on fail
  },
  {
    id: 'legendary_to_mythic',
    name: 'Legendary to Mythic',
    description: 'Combine 5 Legendary cards to craft 1 Mythic card (25% success)',
    inputRarity: 'legendary',
    inputCount: 5,
    outputRarity: 'mythic',
    outputCount: 1,
    successRate: 0.25,             // 25% success
    failReturnRate: 0.2,           // Return 20% of cards on fail
  },
];
