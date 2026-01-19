import type { Rarity, DadType, HoloVariant } from './core';

// ============================================================================
// TRADE OFFER TYPES (US078 - Card Trading - Trade Offer System)
// ============================================================================

// Trade offer status
export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// Trade offer interface
export interface TradeOffer {
  id: string;                      // Unique trade ID
  createdAt: Date;                 // When trade was created
  status: TradeStatus;             // Current status
  senderName: string;              // Name of sender (user-provided)
  offeredCards: TradeCard[];       // Cards being offered
  requestedCards: TradeCard[];     // Cards being requested
  expiresAt: Date;                 // Trade expiration (7 days)
  message?: string;                // Optional message from sender
}

// Card in a trade offer (minimal data for sharing)
export interface TradeCard {
  id: string;                      // Card ID
  name: string;                    // Card name
  rarity: Rarity;                 // Card rarity
  type: DadType;                   // Dad type
  holoVariant: HoloVariant;        // Holo variant
  isHolo: boolean;                 // Whether holo
}

// Trade history entry (completed trades)
export interface TradeHistoryEntry {
  id: string;                      // Trade ID
  completedAt: Date;               // When trade was completed
  partnerName: string;             // Name of trading partner
  givenCards: TradeCard[];         // Cards you gave
  receivedCards: TradeCard[];      // Cards you received
  status: 'accepted' | 'rejected'; // Final status
}

// Trade state for UI
export interface TradeState {
  currentTrade: TradeOffer | null; // Trade being created/viewed
  sentTrades: TradeOffer[];        // Trades you've sent
  receivedTrades: TradeOffer[];    // Trades you've received
  tradeHistory: TradeHistoryEntry[]; // Completed trades
}

// Trade configuration
export interface TradeConfig {
  maxCardsPerSide: number;         // Max cards you can offer/request
  tradeExpirationDays: number;     // Days before trade expires
  maxActiveTrades: number;         // Max active trades at once
}

// Default trade configuration
export const DEFAULT_TRADE_CONFIG: TradeConfig = {
  maxCardsPerSide: 6,              // Max 6 cards per side
  tradeExpirationDays: 7,          // 7 days to expire
  maxActiveTrades: 10,             // Max 10 active trades
};
