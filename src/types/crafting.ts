import type { Rarity, PackCard } from './core';

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
