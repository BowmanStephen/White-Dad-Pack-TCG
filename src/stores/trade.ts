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
import type {
  TradeOffer,
  TradeCard,
  TradeState,
  TradeHistoryEntry,
  TradeStatus,
  DEFAULT_TRADE_CONFIG,
} from '@/types/trading-crafting';
import type { CardInCollection } from '@/types/card';

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
export const sentTrades = persistentAtom<TradeOffer[]>('daddeck-sent-trades', [], {
  encode: (value) => JSON.stringify(value, (key, value) => {
    // Serialize Date objects to ISO strings
    if (value instanceof Date) {
      return { __date__: value.toISOString() };
    }
    return value;
  }),
  decode: (value) => JSON.parse(value, (key, value) => {
    // Deserialize Date objects
    if (value && typeof value === 'object' && '__date__' in value) {
      return new Date(value.__date__);
    }
    return value;
  }),
});

/**
 * Received trades (trades sent to you)
 */
export const receivedTrades = persistentAtom<TradeOffer[]>('daddeck-received-trades', [], {
  encode: (value) => JSON.stringify(value, (key, value) => {
    if (value instanceof Date) {
      return { __date__: value.toISOString() };
    }
    return value;
  }),
  decode: (value) => JSON.parse(value, (key, value) => {
    if (value && typeof value === 'object' && '__date__' in value) {
      return new Date(value.__date__);
    }
    return value;
  }),
});

/**
 * Trade history (completed trades)
 */
export const tradeHistory = persistentAtom<TradeHistoryEntry[]>('daddeck-trade-history', [], {
  encode: (value) => JSON.stringify(value, (key, value) => {
    if (value instanceof Date) {
      return { __date__: value.toISOString() };
    }
    return value;
  }),
  decode: (value) => JSON.parse(value, (key, value) => {
    if (value && typeof value === 'object' && '__date__' in value) {
      return new Date(value.__date__);
    }
    return value;
  }),
});

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
export const canCreateTrade = computed(
  [activeTradeCount],
  (active) => active < 10 // TODO: Use DEFAULT_TRADE_CONFIG.maxActiveTrades
);

/**
 * Selected cards count validation
 */
export const selectionValid = computed(
  [offeredCards, requestedCards],
  (offered, requested) => {
    return offered.length > 0 && requested.length > 0 &&
           offered.length <= 6 && requested.length <= 6; // TODO: Use DEFAULT_TRADE_CONFIG.maxCardsPerSide
  }
);

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
  if (current.length >= 6) {
    return; // TODO: Use DEFAULT_TRADE_CONFIG.maxCardsPerSide
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
  if (current.length >= 6) {
    return; // TODO: Use DEFAULT_TRADE_CONFIG.maxCardsPerSide
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
  const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days

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
  const base64 = btoa(data);
  // Make URL-safe
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decode a trade offer from a base64 URL-safe string
 */
export function decodeTradeOffer(encoded: string): TradeOffer | null {
  try {
    // Restore base64 padding
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const data = atob(base64);
    const trade = JSON.parse(data, (key, value) => {
      // Deserialize Date objects
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      return value;
    });

    return trade;
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
  const tradeIndex = received.findIndex(t => t.id === tradeId);

  if (tradeIndex === -1) {
    throw new Error('Trade not found');
  }

  const trade = received[tradeIndex];
  trade.status = 'accepted';

  // Update received trades
  receivedTrades.set([
    ...received.slice(0, tradeIndex),
    trade,
    ...received.slice(tradeIndex + 1)
  ]);

  // Add to history
  addToHistory({
    id: crypto.randomUUID(),
    completedAt: new Date(),
    partnerName: trade.senderName,
    givenCards: trade.requestedCards,
    receivedCards: trade.offeredCards,
    status: 'accepted',
  });

  // Clear current trade
  currentTrade.set(null);
}

/**
 * Reject a trade offer
 */
export function rejectTrade(tradeId: string): void {
  const received = receivedTrades.get();
  const tradeIndex = received.findIndex(t => t.id === tradeId);

  if (tradeIndex === -1) {
    throw new Error('Trade not found');
  }

  const trade = received[tradeIndex];
  trade.status = 'rejected';

  // Update received trades
  receivedTrades.set([
    ...received.slice(0, tradeIndex),
    trade,
    ...received.slice(tradeIndex + 1)
  ]);

  // Add to history
  addToHistory({
    id: crypto.randomUUID(),
    completedAt: new Date(),
    partnerName: trade.senderName,
    givenCards: [],
    receivedCards: [],
    status: 'rejected',
  });

  // Clear current trade
  currentTrade.set(null);
}

/**
 * Cancel a sent trade offer
 */
export function cancelTrade(tradeId: string): void {
  const sent = sentTrades.get();
  const tradeIndex = sent.findIndex(t => t.id === tradeId);

  if (tradeIndex === -1) {
    throw new Error('Trade not found');
  }

  const trade = sent[tradeIndex];
  trade.status = 'cancelled';

  // Update sent trades
  sentTrades.set([
    ...sent.slice(0, tradeIndex),
    trade,
    ...sent.slice(tradeIndex + 1)
  ]);

  // Add to history
  addToHistory({
    id: crypto.randomUUID(),
    completedAt: new Date(),
    partnerName: trade.senderName,
    givenCards: trade.offeredCards,
    receivedCards: [],
    status: 'rejected',
  });

  // Clear current trade if it's the cancelled one
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
  const baseUrl = typeof window !== 'undefined'
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
  const activeSent = sent.filter(t => {
    const isExpired = t.expiresAt < now && t.status === 'pending';
    if (isExpired) {
      // Add to history as expired
      addToHistory({
        id: crypto.randomUUID(),
        completedAt: new Date(),
        partnerName: t.senderName,
        givenCards: t.offeredCards,
        receivedCards: [],
        status: 'rejected',
      });
    }
    return !isExpired;
  });
  sentTrades.set(activeSent);

  // Clear expired received trades
  const received = receivedTrades.get();
  const activeReceived = received.filter(t => {
    const isExpired = t.expiresAt < now && t.status === 'pending';
    if (isExpired) {
      // Add to history as expired
      addToHistory({
        id: crypto.randomUUID(),
        completedAt: new Date(),
        partnerName: t.senderName,
        givenCards: [],
        receivedCards: [],
        status: 'rejected',
      });
    }
    return !isExpired;
  });
  receivedTrades.set(activeReceived);
}
