import type { Rarity } from './core';
import type { PackDesign } from './pack';

// ============================================================================
// LIVE EVENTS TYPES (US099 - Live Events - Limited Time)
// ============================================================================

// Event status
export type EventStatus = 'upcoming' | 'active' | 'ended';

// Event type categories
export type EventType =
  | 'weekend'          // Weekend events (2x mythic chance)
  | 'holiday'          // Holiday-themed events
  | 'seasonal'         // Seasonal events
  | 'special'          // Special limited-time events
  | 'collaboration';   // Collaboration events

// Event currency types
export type EventCurrencyType = 'event_tokens' | 'event_coins' | 'event_gems';

// Live event interface
export interface LiveEvent {
  id: string;                      // Unique event ID (e.g., 'weekend_mythic_jan_2026')
  name: string;                    // Event display name
  description: string;             // Event description
  type: EventType;                 // Event type
  status: EventStatus;              // Current status
  startDate: Date;                 // Event start date/time
  endDate: Date;                   // Event end date/time
  timezone: string;                // Timezone for event (default: 'UTC')

  // Event bonuses
  bonuses: EventBonus[];           // Active bonuses during event

  // Event currency
  currencyType?: EventCurrencyType; // Currency type (if applicable)
  currencyEarnRate: number;         // Currency earned per pack opened

  // Event cards
  eventCards: string[];            // Exclusive event card IDs
  eventCardDropRate: number;       // Increased drop rate for event cards (0-1)

  // Event shop
  eventShopEnabled: boolean;       // Whether event shop is active
  eventShopItems: EventShopItem[]; // Items available in event shop

  // Visual theming
  theme: EventTheme;               // Visual theme for the event

  // Requirements
  requirements?: {
    minPlayerLevel?: number;       // Minimum player level (future)
    completedTutorial?: boolean;   // Must complete tutorial
  };
}

// Event bonus configuration
export interface EventBonus {
  type: 'mythic_chance' | 'rarity_boost' | 'currency_bonus' | 'xp_multiplier';
  description: string;             // Bonus description (e.g., "2x Mythic Chance")
  multiplier: number;              // Bonus multiplier (e.g., 2.0 = 2x)
  appliesTo?: Rarity[];            // Which rarities are affected (optional)
}

// Event theme for visual customization
export interface EventTheme {
  name: string;                    // Theme name
  primaryColor: string;            // Primary color
  secondaryColor: string;          // Secondary color
  accentColor: string;             // Accent color
  backgroundColor: string;         // Background color
  textColor: string;               // Text color
  icon: string;                    // Event icon (emoji)
  bannerImage?: string;            // Banner image URL
  packDesign?: PackDesign;         // Special pack design for event
}

// Event shop item
export interface EventShopItem {
  id: string;                      // Unique item ID
  name: string;                    // Item name
  description: string;             // Item description
  type: 'card' | 'pack' | 'currency' | 'cosmetic';
  cost: number;                    // Cost in event currency
  currency: EventCurrencyType;     // Currency type
  stock: number;                   // Available stock (-1 = unlimited)
  maxPurchase: number;             // Max purchase per player (-1 = unlimited)
  isLimited: boolean;              // Limited time item
  icon: string;                    // Item icon (emoji)

  // Item-specific data
  cardData?: {
    cardId: string;                // Card ID if type is 'card'
    guaranteedRarity?: Rarity;     // Guaranteed rarity
  };
  packData?: {
    packCount: number;             // Number of packs
    packType: 'standard' | 'premium'; // Pack type
  };
  cosmeticData?: {
    cosmeticId: string;            // Cosmetic ID
    cosmeticType: 'card_back' | 'title' | 'avatar_border';
  };
}

// Event currency balance
export interface EventCurrencyBalance {
  currencyType: EventCurrencyType; // Currency type
  balance: number;                 // Current balance
  totalEarned: number;             // Total earned during event
  totalSpent: number;              // Total spent in shop
  lastEarnedAt?: Date;             // Last time currency was earned
}

// Event progress tracking
export interface EventProgress {
  eventId: string;                 // Event ID
  packsOpened: number;             // Packs opened during event
  eventCardsPulled: number;        // Event-exclusive cards pulled
  currencyEarned: number;          // Total currency earned
  shopPurchases: number;           // Shop purchases made
  achievementsUnlocked: string[];  // Event achievements unlocked
  startedAt: Date;                 // When player started event
  lastActivityAt: Date;            // Last activity timestamp
}

// Event state for UI
export interface EventState {
  currentEvent: LiveEvent | null;  // Currently active event
  upcomingEvents: LiveEvent[];     // Upcoming events
  pastEvents: LiveEvent[];         // Completed/past events
  currencyBalances: Record<EventCurrencyType, EventCurrencyBalance>; // Currency balances
  eventProgress: Record<string, EventProgress>; // Progress per event
  shopViewed: boolean;             // Whether user has viewed event shop
}

// Event configuration
export interface EventConfig {
  timezone: string;                // Default timezone for events
  weekendStartDay: number;         // Day weekend starts (0 = Sunday, 5 = Friday)
  weekendStartTime: string;        // Time weekend starts (HH:mm format)
  weekendEndDay: number;           // Day weekend ends (0 = Sunday)
  weekendEndTime: string;          // Time weekend ends (HH:mm format)
  notificationEnabled: boolean;    // Event notifications
  autoArchive: boolean;            // Auto-archive past events
}

// Default event configuration
export const DEFAULT_EVENT_CONFIG: EventConfig = {
  timezone: 'UTC',
  weekendStartDay: 5,              // Friday
  weekendStartTime: '17:00',       // 5:00 PM
  weekendEndDay: 0,                // Sunday
  weekendEndTime: '23:59',         // 11:59 PM
  notificationEnabled: true,
  autoArchive: true,
};

// Predefined event themes
export const EVENT_THEMES: Record<string, EventTheme> = {
  weekend_mythic: {
    name: 'Mythic Weekend',
    primaryColor: '#ec4899',
    secondaryColor: '#be185d',
    accentColor: '#f472b6',
    backgroundColor: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    textColor: '#ffffff',
    icon: '💎',
    packDesign: 'premium',
  },
  holiday_christmas: {
    name: 'Holiday Season',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#22c55e',
    backgroundColor: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    textColor: '#ffffff',
    icon: '🎄',
    packDesign: 'holiday',
  },
  holiday_newyear: {
    name: 'New Year Celebration',
    primaryColor: '#fbbf24',
    secondaryColor: '#d97706',
    accentColor: '#fef08a',
    backgroundColor: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    textColor: '#1f2937',
    icon: '🎆',
    packDesign: 'premium',
  },
  seasonal_summer: {
    name: 'Summer BBQ',
    primaryColor: '#f97316',
    secondaryColor: '#c2410c',
    accentColor: '#fb923c',
    backgroundColor: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    textColor: '#ffffff',
    icon: '🔥',
    packDesign: 'standard',
  },
  collaboration_special: {
    name: 'Special Collaboration',
    primaryColor: '#8b5cf6',
    secondaryColor: '#6d28d9',
    accentColor: '#a78bfa',
    backgroundColor: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    textColor: '#ffffff',
    icon: '🤝',
    packDesign: 'premium',
  },
};
