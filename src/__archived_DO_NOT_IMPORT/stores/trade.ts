/**
 * Trade Store - Manages trade offer state and operations
 *
 * PACK-086: Trading - Trade Offer System
 *
 * Features:
 * - Create trade offers
 * - Encode/decode trade offers to/from URL
 * - Track sent and received trades
 * - Trade history log
 */

import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { CardInCollection } from '@/types/card';
import type {
  TradeCard,
  TradeHistoryEntry,
  TradeOffer,
  TradeStatus,
} from '@/types/trading-crafting';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_ACTIVE_TRADES = 10;
const MAX_CARDS_PER_SIDE = 6;
const TRADE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// ============================================================================
// STATE
// ============================================================================

/**
 * Current trade being created/viewed
 */
export const currentTrade = atom<TradeOffer | null>(null);

/**
 * Selected cards to offer (from user's collection)
 */
export const offeredCards = atom<CardInCollection[]>([]);

/**
 * Selected cards to request (from full card database)
 */
export const requestedCards = atom<TradeCard[]>([]);

/**
 * Sent trades (trades you've created)
 */
export const sentTrades = createPersistentStore<TradeOffer[]>(
  'daddeck-sent-trades',
  []
);

/**
 * Received trades (trades sent to you)
 */
export const receivedTrades = createPersistentStore<TradeOffer[]>(
  'daddeck-received-trades',
  []
);

/**
 * Trade history (completed trades)
 */
export const tradeHistory = createPersistentStore<TradeHistoryEntry[]>(
  'daddeck-trade-history',
  []
);

// ============================================================================
// COMPUTED VALUES
// ============================================================================

/**
 * Total number of active trades (sent + received, pending status)
 */
export const activeTradeCount = computed(
  [sentTrades, receivedTrades],
  (sent, received) => {
    const pendingSent = sent.filter(t => t.status === 'pending').length;
    const pendingReceived = received.filter(t => t.status === 'pending').length;
    return pendingSent + pendingReceived;
  }
);

/**
 * Can create more trades? (check against max limit)
 */
export const canCreateTrade = computed([activeTradeCount], (active) => {
  return active < MAX_ACTIVE_TRADES;
});

/**
 * Selected cards count validation
 */
export const selectionValid = computed([offeredCards, requestedCards], (offered, requested) => {
  const hasSelections = offered.length > 0 && requested.length > 0;
  const withinLimit =
    offered.length <= MAX_CARDS_PER_SIDE && requested.length <= MAX_CARDS_PER_SIDE;

  return hasSelections && withinLimit;
});

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Add a card to the offer list
 */
export function addOfferedCard(card: CardInCollection): void {
  const current = offeredCards.get();

  // Check for duplicates
  if (current.some(c => c.id === card.id)) {
    return;
  }

  // Check max limit
  if (current.length >= MAX_CARDS_PER_SIDE) {
    return;
  }

  offeredCards.set([...current, card]);
}

/**
 * Remove a card from the offer list
 */
export function removeOfferedCard(cardId: string): void {
  const current = offeredCards.get();
  offeredCards.set(current.filter(c => c.id !== cardId));
}

/**
 * Add a card to the request list
 */
export function addRequestedCard(card: TradeCard): void {
  const current = requestedCards.get();

  // Check for duplicates
  if (current.some(c => c.id === card.id)) {
    return;
  }

  // Check max limit
  if (current.length >= MAX_CARDS_PER_SIDE) {
    return;
  }

  requestedCards.set([...current, card]);
}

/**
 * Remove a card from the request list
 */
export function removeRequestedCard(cardId: string): void {
  const current = requestedCards.get();
  requestedCards.set(current.filter(c => c.id !== cardId));
}

/**
 * Clear all selections
 */
export function clearSelections(): void {
  offeredCards.set([]);
  requestedCards.set([]);
}

/**
 * Convert CardInCollection to TradeCard
 */
function toTradeCard(card: CardInCollection): TradeCard {
  return {
    id: card.id,
    name: card.name,
    rarity: card.rarity,
    type: card.type,
    holoVariant: card.holoVariant || 'none',
    isHolo: card.isHolo,
  };
}

/**
 * Create a trade offer from current selections
 */
export function createTradeOffer(senderName: string, message?: string): TradeOffer {
  const offered = offeredCards.get();
  const requested = requestedCards.get();

  if (offered.length === 0 || requested.length === 0) {
    throw new Error('Must select cards to offer and request');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TRADE_EXPIRY_MS);

  const tradeOffer: TradeOffer = {
    id: crypto.randomUUID(),
    createdAt: now,
    status: 'pending',
    senderName,
    offeredCards: offered.map(toTradeCard),
    requestedCards: requested,
    expiresAt,
    message,
  };

  currentTrade.set(tradeOffer);

  return tradeOffer;
}

/**
 * Encode a trade offer to a base64 URL-safe string
 */
export function encodeTradeOffer(trade: TradeOffer): string {
  const data = JSON.stringify(trade);
  return toBase64Url(data);
}

/**
 * Decode a trade offer from a base64 URL-safe string
 */
export function decodeTradeOffer(encoded: string): TradeOffer | null {
  try {
    const data = fromBase64Url(encoded);
    return JSON.parse(data, deserializeTradeDates) as TradeOffer;
  } catch (error) {
    console.error('Failed to decode trade offer:', error);
    return null;
  }
}

/**
 * Save a trade offer to sent trades
 */
export function saveTradeOffer(trade: TradeOffer): void {
  const current = sentTrades.get();
  sentTrades.set([...current, trade]);
}

/**
 * Load a trade offer from URL parameter
 */
export function loadTradeFromUrl(urlParam: string): TradeOffer | null {
  const trade = decodeTradeOffer(urlParam);
  if (trade) {
    currentTrade.set(trade);
  }
  return trade;
}

/**
 * Accept a trade offer
 */
export function acceptTrade(tradeId: string): void {
  const received = receivedTrades.get();
  const { trade, updatedTrades } = updateTradeStatus(received, tradeId, 'accepted');
  receivedTrades.set(updatedTrades);

  // Add to history
  addToHistory({
    id: crypto.randomUUID(),
    completedAt: new Date(),
    partnerName: trade.senderName,
    givenCards: trade.requestedCards,
    receivedCards: trade.offeredCards,
    status: 'accepted',
  });

  currentTrade.set(null);
}

/**
 * Reject a trade offer
 */
export function rejectTrade(tradeId: string): void {
  const received = receivedTrades.get();
  const { trade, updatedTrades } = updateTradeStatus(received, tradeId, 'rejected');
  receivedTrades.set(updatedTrades);

  // Add to history
  addToHistory({
    id: crypto.randomUUID(),
    completedAt: new Date(),
    partnerName: trade.senderName,
    givenCards: [],
    receivedCards: [],
    status: 'rejected',
  });

  currentTrade.set(null);
}

/**
 * Cancel a sent trade offer
 */
export function cancelTrade(tradeId: string): void {
  const sent = sentTrades.get();
  const { trade, updatedTrades } = updateTradeStatus(sent, tradeId, 'cancelled');
  sentTrades.set(updatedTrades);

  // Add to history
  addToHistory({
    id: crypto.randomUUID(),
    completedAt: new Date(),
    partnerName: trade.senderName,
    givenCards: trade.offeredCards,
    receivedCards: [],
    status: 'rejected',
  });

  if (currentTrade.get()?.id === tradeId) {
    currentTrade.set(null);
  }
}

/**
 * Add a completed trade to history
 */
function addToHistory(entry: TradeHistoryEntry): void {
  const current = tradeHistory.get();
  tradeHistory.set([entry, ...current]);
}

/**
 * Get trade offer URL for sharing
 */
export function getTradeOfferUrl(trade: TradeOffer): string {
  const encoded = encodeTradeOffer(trade);
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin + '/trade'
      : 'https://daddeck.com/trade';
  return `${baseUrl}?offer=${encoded}`;
}

/**
 * Clear expired trades
 */
export function clearExpiredTrades(): void {
  const now = new Date();

  // Clear expired sent trades
  const sent = sentTrades.get();
  const activeSent = sent.filter((trade) => {
    if (!isPendingAndExpired(trade, now)) {
      return true;
    }

    addToHistory({
      id: crypto.randomUUID(),
      completedAt: new Date(),
      partnerName: trade.senderName,
      givenCards: trade.offeredCards,
      receivedCards: [],
      status: 'rejected',
    });

    return false;
  });
  sentTrades.set(activeSent);

  // Clear expired received trades
  const received = receivedTrades.get();
  const activeReceived = received.filter((trade) => {
    if (!isPendingAndExpired(trade, now)) {
      return true;
    }

    addToHistory({
      id: crypto.randomUUID(),
      completedAt: new Date(),
      partnerName: trade.senderName,
      givenCards: [],
      receivedCards: [],
      status: 'rejected',
    });

    return false;
  });
  receivedTrades.set(activeReceived);
}

function serializeTradeDates(_key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return { __date__: value.toISOString() };
  }

  return value;
}

function deserializeTradeDates(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && '__date__' in value) {
    const record = value as { __date__: string };
    return new Date(record.__date__);
  }

  if (typeof value === 'string' && isIsoTimestamp(value)) {
    return new Date(value);
  }

  return value;
}

function createPersistentStore<T>(key: string, initialValue: T) {
  return persistentAtom<T>(key, initialValue, {
    encode: (value) => JSON.stringify(value, serializeTradeDates),
    decode: (value) => JSON.parse(value, deserializeTradeDates),
  });
}

function updateTradeStatus(
  trades: TradeOffer[],
  tradeId: string,
  status: TradeStatus
): { trade: TradeOffer; updatedTrades: TradeOffer[] } {
  const tradeIndex = trades.findIndex((trade) => trade.id === tradeId);

  if (tradeIndex === -1) {
    throw new Error('Trade not found');
  }

  const trade = { ...trades[tradeIndex], status };
  const updatedTrades = [...trades];
  updatedTrades[tradeIndex] = trade;

  return { trade, updatedTrades };
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function fromBase64Url(encoded: string): string {
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function isPendingAndExpired(trade: TradeOffer, now: Date): boolean {
  return trade.status === 'pending' && trade.expiresAt < now;
}

function isIsoTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}
