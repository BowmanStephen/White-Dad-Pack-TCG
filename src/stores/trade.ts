import { persistentAtom } from '@nanostores/persistent';
import type {
  TradeOffer,
  TradeCard,
  TradeHistoryEntry,
  TradeState,
  TradeStatus,
  DEFAULT_TRADE_CONFIG,
} from '../types';
import { collection } from './collection';
import { trackEvent } from './analytics';

// Custom encoder for TradeState type (handles Date serialization)
const tradeEncoder = {
  encode(data: TradeState): string {
    return JSON.stringify(data, (_key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
  },
  decode(str: string): TradeState {
    const data = JSON.parse(str);
    // Convert ISO strings back to Date objects
    const convertDates = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        return obj.map(convertDates);
      }
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'createdAt' || key === 'expiresAt' || key === 'completedAt') {
          converted[key] = new Date(value as string);
        } else {
          converted[key] = convertDates(value);
        }
      }
      return converted;
    };
    return convertDates(data);
  },
};

// Initial trade state
const initialTradeState: TradeState = {
  currentTrade: null,
  sentTrades: [],
  receivedTrades: [],
  tradeHistory: [],
};

// Trade store with LocalStorage persistence
export const tradeStore = persistentAtom<TradeState>(
  'daddeck-trades',
  initialTradeState,
  tradeEncoder
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert a PackCard to a TradeCard (minimal data for sharing)
 */
function packCardToTradeCard(packCard: any): TradeCard {
  return {
    id: packCard.id,
    name: packCard.name,
    rarity: packCard.rarity,
    type: packCard.type,
    holoVariant: packCard.holoType || 'none',
    isHolo: packCard.isHolo || false,
  };
}

/**
 * Generate a unique trade ID
 */
function generateTradeId(): string {
  return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all cards from user's collection (for trade selection)
 */
export function getCollectionCards(): any[] {
  const current = collection.get();
  const allCards: any[] = [];

  for (const pack of current.packs) {
    for (const card of pack.cards) {
      allCards.push({
        ...card,
        packId: pack.id,
        packOpenedAt: pack.openedAt,
      });
    }
  }

  return allCards;
}

/**
 * Check if a trade has expired
 */
export function isTradeExpired(trade: TradeOffer): boolean {
  return new Date() > trade.expiresAt;
}

/**
 * Get pending trades (both sent and received, not expired)
 */
export function getPendingTrades(): { sent: TradeOffer[]; received: TradeOffer[] } {
  const state = tradeStore.get();
  const now = new Date();

  const pendingSent = state.sentTrades.filter(
    (t) => t.status === 'pending' && t.expiresAt > now
  );

  const pendingReceived = state.receivedTrades.filter(
    (t) => t.status === 'pending' && t.expiresAt > now
  );

  return { sent: pendingSent, received: pendingReceived };
}

// ============================================================================
// TRADE CREATION
// ============================================================================

/**
 * Start creating a new trade offer
 */
export function startNewTrade(): void {
  tradeStore.set({
    ...tradeStore.get(),
    currentTrade: {
      id: generateTradeId(),
      createdAt: new Date(),
      status: 'pending',
      senderName: '',
      offeredCards: [],
      requestedCards: [],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
}

/**
 * Add a card to the offer (cards you're giving)
 */
export function addOfferedCard(card: any): void {
  const state = tradeStore.get();
  if (!state.currentTrade) {
    startNewTrade();
  }

  const updated = tradeStore.get();
  if (!updated.currentTrade) return;

  // Check max cards limit
  if (updated.currentTrade.offeredCards.length >= 6) {
    return; // Max 6 cards per side
  }

  const tradeCard = packCardToTradeCard(card);

  // Check for duplicates
  if (updated.currentTrade.offeredCards.some((c) => c.id === tradeCard.id)) {
    return;
  }

  updated.currentTrade.offeredCards.push(tradeCard);
  tradeStore.set({ ...updated });
}

/**
 * Remove a card from the offer
 */
export function removeOfferedCard(cardId: string): void {
  const state = tradeStore.get();
  if (!state.currentTrade) return;

  state.currentTrade.offeredCards = state.currentTrade.offeredCards.filter(
    (c) => c.id !== cardId
  );

  tradeStore.set({ ...state });
}

/**
 * Add a card to the request (cards you want)
 */
export function addRequestedCard(card: any): void {
  const state = tradeStore.get();
  if (!state.currentTrade) {
    startNewTrade();
  }

  const updated = tradeStore.get();
  if (!updated.currentTrade) return;

  // Check max cards limit
  if (updated.currentTrade.requestedCards.length >= 6) {
    return; // Max 6 cards per side
  }

  const tradeCard = packCardToTradeCard(card);

  // Check for duplicates
  if (updated.currentTrade.requestedCards.some((c) => c.id === tradeCard.id)) {
    return;
  }

  updated.currentTrade.requestedCards.push(tradeCard);
  tradeStore.set({ ...updated });
}

/**
 * Remove a card from the request
 */
export function removeRequestedCard(cardId: string): void {
  const state = tradeStore.get();
  if (!state.currentTrade) return;

  state.currentTrade.requestedCards = state.currentTrade.requestedCards.filter(
    (c) => c.id !== cardId
  );

  tradeStore.set({ ...state });
}

/**
 * Set sender name for the trade
 */
export function setSenderName(name: string): void {
  const state = tradeStore.get();
  if (!state.currentTrade) return;

  state.currentTrade.senderName = name;
  tradeStore.set({ ...state });
}

/**
 * Set message for the trade
 */
export function setTradeMessage(message: string): void {
  const state = tradeStore.get();
  if (!state.currentTrade) return;

  state.currentTrade.message = message;
  tradeStore.set({ ...state });
}

/**
 * Clear current trade (cancel creation)
 */
export function clearCurrentTrade(): void {
  const state = tradeStore.get();
  state.currentTrade = null;
  tradeStore.set({ ...state });
}

// ============================================================================
// TRADE PUBLISHING & SHARING
// ============================================================================

/**
 * Generate shareable trade URL
 */
export function generateTradeURL(): string {
  const state = tradeStore.get();
  if (!state.currentTrade) return '';

  // Create minimal trade data for URL
  const tradeData = {
    i: state.currentTrade.id,
    s: state.currentTrade.senderName,
    o: state.currentTrade.offeredCards.map((c) => c.id),
    r: state.currentTrade.requestedCards.map((c) => c.id),
    m: state.currentTrade.message || '',
    t: state.currentTrade.createdAt.getTime(),
  };

  // Encode to base64 for URL
  const encoded = btoa(JSON.stringify(tradeData));

  // Generate URL
  const baseURL = window.location.origin + '/trade';
  return `${baseURL}?d=${encoded}`;
}

/**
 * Parse trade from URL parameters
 */
export function parseTradeFromURL(): TradeOffer | null {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('d');

  if (!data) return null;

  try {
    const decoded = atob(data);
    const tradeData = JSON.parse(decoded);

    // We need to look up full card details from the card IDs
    // For now, we'll create a basic structure
    const collectionCards = getCollectionCards();

    const findCard = (id: string) => {
      const card = collectionCards.find((c) => c.id === id);
      if (card) return packCardToTradeCard(card);
      // Fallback if card not in collection
      return {
        id,
        name: 'Unknown Card',
        rarity: 'common' as const,
        type: 'ITEM' as const,
        holoVariant: 'none' as const,
        isHolo: false,
      };
    };

    return {
      id: tradeData.i,
      createdAt: new Date(tradeData.t),
      status: 'pending',
      senderName: tradeData.s,
      offeredCards: tradeData.o.map((id: string) => findCard(id)),
      requestedCards: tradeData.r.map((id: string) => findCard(id)),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      message: tradeData.m || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Finalize and save trade to sent trades
 */
export function finalizeTrade(): { success: boolean; error?: string } {
  const state = tradeStore.get();
  if (!state.currentTrade) {
    return { success: false, error: 'No trade to finalize' };
  }

  if (!state.currentTrade.senderName) {
    return { success: false, error: 'Please enter your name' };
  }

  if (state.currentTrade.offeredCards.length === 0) {
    return { success: false, error: 'Please add at least one card to offer' };
  }

  if (state.currentTrade.requestedCards.length === 0) {
    return { success: false, error: 'Please add at least one card to request' };
  }

  // Add to sent trades
  state.sentTrades.unshift(state.currentTrade);

  // Clear current trade
  state.currentTrade = null;

  tradeStore.set({ ...state });

  // Track trade creation event
  trackEvent({
    type: 'share',
    data: {
      platform: 'native',
      packId: '',
      cardCount: state.sentTrades[0].offeredCards.length,
    },
  });

  return { success: true };
}

// ============================================================================
// TRADE RESPONSES
// ============================================================================

/**
 * Accept a received trade
 */
export function acceptTrade(tradeId: string): { success: boolean; error?: string } {
  const state = tradeStore.get();
  const tradeIndex = state.receivedTrades.findIndex((t) => t.id === tradeId);

  if (tradeIndex === -1) {
    return { success: false, error: 'Trade not found' };
  }

  const trade = state.receivedTrades[tradeIndex];

  // Check if expired
  if (isTradeExpired(trade)) {
    return { success: false, error: 'This trade has expired' };
  }

  // Update trade status
  trade.status = 'accepted';

  // Add to trade history
  state.tradeHistory.unshift({
    id: trade.id,
    completedAt: new Date(),
    partnerName: trade.senderName,
    givenCards: trade.requestedCards, // We give what they requested
    receivedCards: trade.offeredCards, // We receive what they offered
    status: 'accepted',
  });

  // Remove from received trades
  state.receivedTrades.splice(tradeIndex, 1);

  tradeStore.set({ ...state });

  return { success: true };
}

/**
 * Reject a received trade
 */
export function rejectTrade(tradeId: string): { success: boolean; error?: string } {
  const state = tradeStore.get();
  const tradeIndex = state.receivedTrades.findIndex((t) => t.id === tradeId);

  if (tradeIndex === -1) {
    return { success: false, error: 'Trade not found' };
  }

  const trade = state.receivedTrades[tradeIndex];

  // Update trade status
  trade.status = 'rejected';

  // Add to trade history
  state.tradeHistory.unshift({
    id: trade.id,
    completedAt: new Date(),
    partnerName: trade.senderName,
    givenCards: [],
    receivedCards: [],
    status: 'rejected',
  });

  // Remove from received trades
  state.receivedTrades.splice(tradeIndex, 1);

  tradeStore.set({ ...state });

  return { success: true };
}

/**
 * Cancel a sent trade
 */
export function cancelTrade(tradeId: string): { success: boolean; error?: string } {
  const state = tradeStore.get();
  const tradeIndex = state.sentTrades.findIndex((t) => t.id === tradeId);

  if (tradeIndex === -1) {
    return { success: false, error: 'Trade not found' };
  }

  const trade = state.sentTrades[tradeIndex];

  // Update trade status
  trade.status = 'cancelled';

  // Remove from sent trades (don't add to history, cancelled trades aren't tracked)
  state.sentTrades.splice(tradeIndex, 1);

  tradeStore.set({ ...state });

  return { success: true };
}

/**
 * Add a trade to received trades (when receiving a shared trade)
 * Shows notification to the user and sends email notification
 */
export function addReceivedTrade(trade: TradeOffer): void {
  const state = tradeStore.get();

  // Check if already exists
  if (state.receivedTrades.some((t) => t.id === trade.id)) {
    return;
  }

  state.receivedTrades.unshift(trade);
  tradeStore.set({ ...state });

  // Show notification about new trade offer
  if (typeof window !== 'undefined') {
    import('./notifications.js').then(({ notifyTradeOffer }) => {
      notifyTradeOffer(trade.senderName, trade.offeredCards.length);
    });

    // Send email notification for trade offer (US097)
    import('./email.js').then(({ sendTradeOfferEmail }) => {
      sendTradeOfferEmail({
        tradeId: trade.id,
        senderName: trade.senderName,
        offeredCards: trade.offeredCards.map((c) => ({
          id: c.id,
          name: c.name,
          rarity: c.rarity,
          isHolo: c.isHolo,
        })),
        requestedCards: trade.requestedCards.map((c) => ({
          id: c.id,
          name: c.name,
          rarity: c.rarity,
          isHolo: c.isHolo,
        })),
        message: trade.message,
        expiresAt: trade.expiresAt,
        tradeUrl: `${window.location.origin}/trade?d=${trade.id}`,
        unsubscribeUrl: `${window.location.origin}/unsubscribe?type=trade&id=${trade.id}`,
      }).catch((error) => {
        console.error('[Trade System] Failed to send trade email:', error);
      });
    });
  }
}

/**
 * Clean up expired trades
 */
export function cleanupExpiredTrades(): void {
  const state = tradeStore.get();
  const now = new Date();

  // Remove expired sent trades
  state.sentTrades = state.sentTrades.filter((t) => t.expiresAt > now);

  // Remove expired received trades
  state.receivedTrades = state.receivedTrades.filter((t) => t.expiresAt > now);

  tradeStore.set({ ...state });
}

// ============================================================================
// TRADE HISTORY
// ============================================================================

/**
 * Get trade history (completed trades)
 */
export function getTradeHistory(): TradeHistoryEntry[] {
  const state = tradeStore.get();
  return state.tradeHistory;
}

/**
 * Clear trade history
 */
export function clearTradeHistory(): void {
  const state = tradeStore.get();
  state.tradeHistory = [];
  tradeStore.set({ ...state });
}
