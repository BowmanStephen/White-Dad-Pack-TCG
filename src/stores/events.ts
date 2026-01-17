/**
 * Live Events Store (US099 - Live Events - Limited Time)
 *
 * Manages live events including:
 * - Weekend events (2x mythic chance)
 * - Event currency earning and spending
 * - Event shop management
 * - Event progress tracking
 */

import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  LiveEvent,
  EventState,
  EventStatus,
  EventBonus,
  EventCurrencyBalance,
  EventProgress,
  EventCurrencyType,
  EventShopItem,
  Rarity,
} from '../types';
import { DEFAULT_EVENT_CONFIG, EVENT_THEMES } from '../types';

// ============================================================================
// EVENT DATA GENERATION
// ============================================================================

/**
 * Generate upcoming weekend events for the next 4 weeks
 */
function generateWeekendEvents(): LiveEvent[] {
  const events: LiveEvent[] = [];
  const now = new Date();
  const config = DEFAULT_EVENT_CONFIG;

  for (let i = 0; i < 4; i++) {
    // Calculate next weekend
    const eventDate = new Date(now);
    const daysUntilFriday = (config.weekendStartDay + 7 - eventDate.getDay()) % 7;
    eventDate.setDate(eventDate.getDate() + daysUntilFriday + (i * 7));

    const startDate = new Date(eventDate);
    const [startHour, startMinute] = config.weekendStartTime.split(':').map(Number);
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date(eventDate);
    const daysUntilSunday = (config.weekendEndDay + 7 - endDate.getDay()) % 7;
    endDate.setDate(endDate.getDate() + daysUntilSunday);
    const [endHour, endMinute] = config.weekendEndTime.split(':').map(Number);
    endDate.setHours(endHour, endMinute, 59, 999);

    // Determine status
    let status: EventStatus = 'upcoming';
    const currentTime = now.getTime();
    if (currentTime >= startDate.getTime() && currentTime <= endDate.getTime()) {
      status = 'active';
    } else if (currentTime > endDate.getTime()) {
      status = 'ended';
    }

    events.push({
      id: `weekend_mythic_${startDate.toISOString().split('T')[0]}`,
      name: 'Mythic Weekend',
      description: 'Double mythic chance! Open packs for increased odds of pulling mythic cards.',
      type: 'weekend',
      status,
      startDate,
      endDate,
      timezone: config.timezone,
      bonuses: [
        {
          type: 'mythic_chance',
          description: '2x Mythic Chance',
          multiplier: 2.0,
        },
      ],
      currencyType: 'event_tokens',
      currencyEarnRate: 10, // 10 tokens per pack
      eventCards: [],
      eventCardDropRate: 0,
      eventShopEnabled: true,
      eventShopItems: generateDefaultShopItems(),
      theme: EVENT_THEMES.weekend_mythic,
    });
  }

  return events;
}

/**
 * Generate default event shop items
 */
function generateDefaultShopItems(): EventShopItem[] {
  return [
    {
      id: 'event_pack_3',
      name: '3 Event Packs',
      description: 'Open 3 standard packs with boosted rates',
      type: 'pack',
      cost: 100,
      currency: 'event_tokens',
      stock: -1,
      maxPurchase: -1,
      isLimited: false,
      icon: '📦',
      packData: {
        packCount: 3,
        packType: 'standard',
      },
    },
    {
      id: 'event_premium_pack',
      name: 'Premium Event Pack',
      description: 'Guaranteed rare or better pack',
      type: 'pack',
      cost: 200,
      currency: 'event_tokens',
      stock: -1,
      maxPurchase: 5,
      isLimited: true,
      icon: '✨',
      packData: {
        packCount: 1,
        packType: 'premium',
      },
    },
    {
      id: 'event_rare_card',
      name: 'Rare Card',
      description: 'Get a random rare card',
      type: 'card',
      cost: 300,
      currency: 'event_tokens',
      stock: -1,
      maxPurchase: -1,
      isLimited: false,
      icon: '⭐',
      cardData: {
        guaranteedRarity: 'rare',
      },
    },
  ];
}

// ============================================================================
// EVENT STORE STATE
// ============================================================================

// Current active event
export const currentEvent = atom<LiveEvent | null>(null);

// All generated events (current + upcoming)
export const allEvents = atom<LiveEvent[]>([]);

// Event currency balances
export const currencyBalances = persistentAtom<Record<EventCurrencyType, EventCurrencyBalance>>(
  'event_currency_balances',
  {
    event_tokens: {
      currencyType: 'event_tokens',
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
    },
    event_coins: {
      currencyType: 'event_coins',
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
    },
    event_gems: {
      currencyType: 'event_gems',
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
    },
  },
  {
    encode: (value) => {
      // Custom encoding to handle Date objects
      return JSON.stringify(value, (_, v) =>
        v instanceof Date ? { __date__: true, value: v.toISOString() } : v
      );
    },
    decode: (str) => {
      if (!str) return {};
      return JSON.parse(str, (_, v) =>
        v?.__date__ ? new Date(v.value) : v
      );
    },
  }
);

// Event progress tracking
export const eventProgress = persistentAtom<Record<string, EventProgress>>(
  'event_progress',
  {},
  {
    encode: (value) => {
      return JSON.stringify(value, (_, v) =>
        v instanceof Date ? { __date__: true, value: v.toISOString() } : v
      );
    },
    decode: (str) => {
      if (!str) return {};
      return JSON.parse(str, (_, v) =>
        v?.__date__ ? new Date(v.value) : v
      );
    },
  }
);

// Shop viewed state
export const shopViewed = persistentAtom<boolean>('event_shop_viewed', false);

// ============================================================================
// COMPUTED VALUES
// ============================================================================

// Get all upcoming events
export const upcomingEvents = computed(allEvents, (events) => {
  return events.filter((e) => e.status === 'upcoming');
});

// Get all past events
export const pastEvents = computed(allEvents, (events) => {
  return events.filter((e) => e.status === 'ended');
});

// Get current event's currency balance
export const currentEventCurrency = computed([currentEvent, currencyBalances], (event, balances) => {
  if (!event || !event.currencyType) return null;
  return balances[event.currencyType];
});

// Get current event progress
export const currentEventProgress = computed([currentEvent, eventProgress], (event, progress) => {
  if (!event) return null;
  return progress[event.id] || null;
});

// Check if event is currently active
export const isEventActive = computed(currentEvent, (event) => {
  if (!event) return false;
  const now = new Date();
  return now >= event.startDate && now <= event.endDate;
});

// Get time remaining for current event
export const eventTimeRemaining = computed(currentEvent, (event) => {
  if (!event) return null;
  const now = new Date();
  const remaining = event.endDate.getTime() - now.getTime();
  return Math.max(0, remaining);
});

// ============================================================================
// EVENT ACTIONS
// ============================================================================

/**
 * Initialize events system
 * Generates weekend events and determines current active event
 */
export function initializeEvents(): void {
  const events = generateWeekendEvents();
  allEvents.set(events);

  // Find active event
  const now = new Date();
  const active = events.find(
    (e) => now >= e.startDate && now <= e.endDate
  );

  if (active) {
    currentEvent.set(active);
    initializeEventProgress(active.id);
  }
}

/**
 * Get active event bonuses for pack generation
 */
export function getActiveEventBonuses(): EventBonus[] {
  const event = currentEvent.get();
  if (!event || !isEventActive.get()) return [];
  return event.bonuses;
}

/**
 * Get mythic chance multiplier from active event
 */
export function getMythicChanceMultiplier(): number {
  const bonuses = getActiveEventBonuses();
  const mythicBonus = bonuses.find((b) => b.type === 'mythic_chance');
  return mythicBonus?.multiplier || 1.0;
}

/**
 * Award event currency for opening a pack
 */
export function awardEventCurrency(packId: string): void {
  const event = currentEvent.get();
  if (!event || !event.currencyType || !isEventActive.get()) return;

  const balances = currencyBalances.get();
  const currency = balances[event.currencyType];

  if (currency) {
    currency.balance += event.currencyEarnRate;
    currency.totalEarned += event.currencyEarnRate;
    currency.lastEarnedAt = new Date();

    balances[event.currencyType] = currency;
    currencyBalances.set({ ...balances });

    // Update event progress
    updateEventProgress(event.id, { currencyEarned: event.currencyEarnRate });
  }
}

/**
 * Spend event currency in shop
 */
export function spendEventCurrency(itemId: string): boolean {
  const event = currentEvent.get();
  if (!event || !event.currencyType) return false;

  const item = event.eventShopItems.find((i) => i.id === itemId);
  if (!item) return false;

  const balances = currencyBalances.get();
  const currency = balances[event.currencyType];

  if (!currency || currency.balance < item.cost) return false;

  currency.balance -= item.cost;
  currency.totalSpent += item.cost;

  balances[event.currencyType] = currency;
  currencyBalances.set({ ...balances });

  // Update event progress
  updateEventProgress(event.id, { shopPurchases: 1 });

  return true;
}

/**
 * Check if user can afford shop item
 */
export function canAffordItem(itemId: string): boolean {
  const event = currentEvent.get();
  if (!event || !event.currencyType) return false;

  const item = event.eventShopItems.find((i) => i.id === itemId);
  if (!item) return false;

  const balances = currencyBalances.get();
  const currency = balances[event.currencyType];

  return currency ? currency.balance >= item.cost : false;
}

/**
 * Get remaining stock for shop item
 */
export function getItemStock(itemId: string): number {
  const event = currentEvent.get();
  if (!event) return 0;

  const item = event.eventShopItems.find((i) => i.id === itemId);
  return item?.stock ?? 0;
}

/**
 * Mark shop as viewed
 */
export function markShopViewed(): void {
  shopViewed.set(true);
}

/**
 * Reset shop viewed state (for new event)
 */
export function resetShopViewed(): void {
  shopViewed.set(false);
}

// ============================================================================
// EVENT PROGRESS HELPERS
// ============================================================================

/**
 * Initialize progress tracking for a new event
 */
function initializeEventProgress(eventId: string): void {
  const progress = eventProgress.get();

  if (!progress[eventId]) {
    progress[eventId] = {
      eventId,
      packsOpened: 0,
      eventCardsPulled: 0,
      currencyEarned: 0,
      shopPurchases: 0,
      achievementsUnlocked: [],
      startedAt: new Date(),
      lastActivityAt: new Date(),
    };

    eventProgress.set(progress);
  }
}

/**
 * Update event progress
 */
function updateEventProgress(
  eventId: string,
  updates: Partial<Omit<EventProgress, 'eventId' | 'startedAt'>>
): void {
  const progress = eventProgress.get();
  const current = progress[eventId];

  if (current) {
    const updated: EventProgress = {
      ...current,
      ...updates,
      packsOpened: current.packsOpened + (updates.packsOpened ?? 0),
      eventCardsPulled: current.eventCardsPulled + (updates.eventCardsPulled ?? 0),
      currencyEarned: current.currencyEarned + (updates.currencyEarned ?? 0),
      shopPurchases: current.shopPurchases + (updates.shopPurchases ?? 0),
      lastActivityAt: new Date(),
    };

    progress[eventId] = updated;
    eventProgress.set(progress);
  }
}

/**
 * Track pack opened during event
 */
export function trackPackOpened(packId: string): void {
  const event = currentEvent.get();
  if (!event) return;

  updateEventProgress(event.id, { packsOpened: 1 });
}

/**
 * Track event card pulled
 */
export function trackEventCard(cardId: string): void {
  const event = currentEvent.get();
  if (!event) return;

  updateEventProgress(event.id, { eventCardsPulled: 1 });
}

// ============================================================================
// EVENT TIME HELPERS
// ============================================================================

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Event ended';

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Get event status as user-friendly text
 */
export function getEventStatusText(status: EventStatus): string {
  switch (status) {
    case 'active':
      return 'Live Now';
    case 'upcoming':
      return 'Coming Soon';
    case 'ended':
      return 'Ended';
  }
}

/**
 * Check if date is during weekend
 */
export function isWeekend(date: Date = new Date()): boolean {
  const day = date.getDay();
  const hour = date.getHours();
  return (day === 5 && hour >= 17) || day === 6 || (day === 0 && hour < 24);
}

// Initialize events on import
initializeEvents();
