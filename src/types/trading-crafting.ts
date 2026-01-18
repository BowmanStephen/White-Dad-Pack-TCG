import type { Rarity, DadType, HoloVariant, CardStats } from './card';

// Trade offer status
export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// Trade offer interface
export interface TradeOffer {
  id: string;
  createdAt: Date;
  status: TradeStatus;
  senderName: string;
  offeredCards: TradeCard[];
  requestedCards: TradeCard[];
  expiresAt: Date;
  message?: string;
}

// Card in a trade offer (minimal data for sharing)
export interface TradeCard {
  id: string;
  name: string;
  rarity: Rarity;
  type: DadType;
  holoVariant: HoloVariant;
  isHolo: boolean;
}

// Trade history entry (completed trades)
export interface TradeHistoryEntry {
  id: string;
  completedAt: Date;
  partnerName: string;
  givenCards: TradeCard[];
  receivedCards: TradeCard[];
  status: 'accepted' | 'rejected';
}

// Trade state for UI
export interface TradeState {
  currentTrade: TradeOffer | null;
  sentTrades: TradeOffer[];
  receivedTrades: TradeOffer[];
  tradeHistory: TradeHistoryEntry[];
}

// Trade configuration
export interface TradeConfig {
  maxCardsPerSide: number;
  tradeExpirationDays: number;
  maxActiveTrades: number;
}

// Default trade configuration
export const DEFAULT_TRADE_CONFIG: TradeConfig = {
  maxCardsPerSide: 6,
  tradeExpirationDays: 7,
  maxActiveTrades: 10,
};

// ============================================================================
// CRAFTING TYPES (US080 - Card Crafting - Combine Cards)
// ============================================================================

// Crafting state machine
export type CraftingState =
  | 'idle'
  | 'selecting'
  | 'crafting'
  | 'success'
  | 'failed'
  | 'history';

// Crafting recipe interface
export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  inputRarity: Rarity;
  inputCount: number;
  outputRarity: Rarity;
  outputCount: number;
  successRate: number;
  failReturnRate?: number;
}

// Crafting session interface
export interface CraftingSession {
  id: string;
  recipe: CraftingRecipe;
  selectedCards: string[];
  status: CraftingState;
  result?: PackCard;
  timestamp: Date;
  completedAt?: Date;
}

// Crafting history entry
export interface CraftingHistoryEntry {
  id: string;
  sessionId: string;
  recipe: CraftingRecipe;
  inputCards: string[];
  result?: PackCard;
  success: boolean;
  timestamp: Date;
}

// Crafting history state
export interface CraftingHistory {
  entries: CraftingHistoryEntry[];
  totalAttempts: number;
  successfulCrafts: number;
  failedCrafts: number;
  bestCraft: PackCard | null;
}

// Crafting configuration
export interface CraftingConfig {
  maxHistoryEntries: number;
  enableSoundEffects: boolean;
  animationDuration: number;
}

// Default crafting configuration
export const DEFAULT_CRAFTING_CONFIG: CraftingConfig = {
  maxHistoryEntries: 100,
  enableSoundEffects: true,
  animationDuration: 3000,
};

// Crafting recipes
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'common_to_uncommon',
    name: 'Common to Uncommon',
    description: 'Combine 5 Common cards to craft 1 Uncommon card',
    inputRarity: 'common',
    inputCount: 5,
    outputRarity: 'uncommon',
    outputCount: 1,
    successRate: 1.0,
  },
  {
    id: 'uncommon_to_rare',
    name: 'Uncommon to Rare',
    description: 'Combine 5 Uncommon cards to craft 1 Rare card',
    inputRarity: 'uncommon',
    inputCount: 5,
    outputRarity: 'rare',
    outputCount: 1,
    successRate: 1.0,
  },
  {
    id: 'rare_to_epic',
    name: 'Rare to Epic',
    description: 'Combine 5 Rare cards to craft 1 Epic card (50% success)',
    inputRarity: 'rare',
    inputCount: 5,
    outputRarity: 'epic',
    outputCount: 1,
    successRate: 0.5,
    failReturnRate: 0.6,
  },
  {
    id: 'epic_to_legendary',
    name: 'Epic to Legendary',
    description: 'Combine 5 Epic cards to craft 1 Legendary card (50% success)',
    inputRarity: 'epic',
    inputCount: 5,
    outputRarity: 'legendary',
    outputCount: 1,
    successRate: 0.5,
    failReturnRate: 0.4,
  },
  {
    id: 'legendary_to_mythic',
    name: 'Legendary to Mythic',
    description: 'Combine 5 Legendary cards to craft 1 Mythic card (25% success)',
    inputRarity: 'legendary',
    inputCount: 5,
    outputRarity: 'mythic',
    outputCount: 1,
    successRate: 0.25,
    failReturnRate: 0.2,
  },
];
