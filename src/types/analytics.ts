import type { Rarity, HoloVariant, SortOption } from './core';

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

// Analytics event types
export type AnalyticsEventType =
  | 'pack_open'           // User opened a pack
  | 'card_reveal'         // User revealed a card
  | 'pack_complete'       // User completed pack opening (viewed all cards)
  | 'share'               // User shared a pack/card
  | 'collection_view'     // User viewed their collection
  | 'collection_filter'   // User filtered collection
  | 'collection_sort'     // User sorted collection
  | 'settings_open'       // User opened settings
  | 'settings_change'     // User changed a setting
  | 'modal_open'          // User opened a modal (card inspection, share, etc.)
  | 'modal_close'         // User closed a modal
  | 'achievement_unlock'  // User unlocked an achievement (US073)
  | 'daily_reward_claim'  // User claimed daily reward (US074)
  | 'trade_create'        // User created a trade offer (US078)
  | 'trade_accept'        // User accepted a trade (US078)
  | 'trade_reject'        // User rejected a trade (US078)
  | 'trade_cancel';       // User cancelled a trade (US078)

// Share platforms
export type SharePlatform = 'twitter' | 'discord' | 'download' | 'native' | 'copy_link';

// Base analytics event interface
export interface AnalyticsEvent {
  id: string;                 // Unique event ID
  type: AnalyticsEventType;   // Event type
  timestamp: number;          // Unix timestamp (ms)
  sessionId: string;          // Session identifier
}

// Pack open event
export interface PackOpenEvent extends AnalyticsEvent {
  type: 'pack_open';
  data: {
    packId: string;           // Pack identifier
    cardCount: number;        // Number of cards in pack
    packType?: string;        // Type of pack (standard, premium)
    premiumConfigId?: string; // ID of premium configuration
  };
}

// Card reveal event
export interface CardRevealEvent extends AnalyticsEvent {
  type: 'card_reveal';
  data: {
    packId: string;           // Pack identifier
    cardIndex: number;        // Position in pack (0-based)
    cardId: string;           // Card identifier (generic, no PII)
    rarity: Rarity;           // Card rarity
    isHolo: boolean;          // Whether card is holographic
    holoType: HoloVariant;    // Holo variant type
    autoRevealed: boolean;    // Whether auto-revealed or manual
  };
}

// Pack complete event
export interface PackCompleteEvent extends AnalyticsEvent {
  type: 'pack_complete';
  data: {
    packId: string;           // Pack identifier
    cardCount: number;        // Number of cards in pack
    bestRarity: Rarity;       // Best rarity pulled
    holoCount: number;        // Number of holo cards
    duration: number;         // Time to complete (ms)
    skipped: boolean;         // Whether user skipped animation
  };
}

// Share event
export interface ShareEvent extends AnalyticsEvent {
  type: 'share';
  data: {
    platform: SharePlatform;  // Platform shared to
    packId: string;           // Pack identifier (if applicable)
    cardCount: number;        // Number of cards shared
  };
}

// Collection view event
export interface CollectionViewEvent extends AnalyticsEvent {
  type: 'collection_view';
  data: {
    totalPacks: number;       // Total packs in collection
    totalCards: number;       // Total cards in collection
    uniqueCards: number;      // Unique cards in collection
  };
}

// Collection filter event
export interface CollectionFilterEvent extends AnalyticsEvent {
  type: 'collection_filter';
  data: {
    filterType: string;       // Type of filter (rarity, dad type, etc.)
    filterValue: string;      // Filter value applied
  };
}

// Collection sort event
export interface CollectionSortEvent extends AnalyticsEvent {
  type: 'collection_sort';
  data: {
    sortOption: SortOption;   // Sort option selected
  };
}

// Settings open event
export interface SettingsOpenEvent extends AnalyticsEvent {
  type: 'settings_open';
  data: {
    source: 'button' | 'keyboard'; // How settings were opened
  };
}

// Settings change event
export interface SettingsChangeEvent extends AnalyticsEvent {
  type: 'settings_change';
  data: {
    setting: string;          // Setting that changed (e.g., 'soundEnabled')
    previousValue: boolean | number | string;  // Previous value
    newValue: boolean | number | string;        // New value
  };
}

// Modal open event
export interface ModalOpenEvent extends AnalyticsEvent {
  type: 'modal_open';
  data: {
    modalType: 'card_inspection' | 'share' | 'settings'; // Type of modal
    trigger: 'click' | 'keyboard'; // How modal was opened
  };
}

// Modal close event
export interface ModalCloseEvent extends AnalyticsEvent {
  type: 'modal_close';
  data: {
    modalType: 'card_inspection' | 'share' | 'settings'; // Type of modal
    duration: number;         // Time open (ms)
  };
}

// Achievement unlock event (US073)
export interface AchievementUnlockEvent extends AnalyticsEvent {
  type: 'achievement_unlock';
  data: {
    achievementId: string;    // Achievement identifier
    achievementName: string;  // Achievement name
    rarity: string;           // Achievement rarity (bronze, silver, gold, platinum)
    category: string;         // Achievement category (opening, collection, rare, holo, variety)
  };
}

// Daily reward claim event (US074)
export interface DailyRewardClaimEvent extends AnalyticsEvent {
  type: 'daily_reward_claim';
  data: {
    rewardType: string;       // Type of reward claimed (pack, boosted_pack, cards, currency)
    rewardValue: number;      // Value of reward
    streak: number;           // Current streak when claimed
    bonusMultiplier: number;  // Bonus multiplier applied
  };
}

// Union type of all analytics events
export type AnyAnalyticsEvent =
  | PackOpenEvent
  | CardRevealEvent
  | PackCompleteEvent
  | ShareEvent
  | CollectionViewEvent
  | CollectionFilterEvent
  | CollectionSortEvent
  | SettingsOpenEvent
  | SettingsChangeEvent
  | ModalOpenEvent
  | ModalCloseEvent
  | AchievementUnlockEvent
  | DailyRewardClaimEvent;

// Analytics configuration
export interface AnalyticsConfig {
  enabled: boolean;           // Master switch for analytics
  providers: {
    googleAnalytics?: {
      measurementId: string;  // GA4 measurement ID (e.g., 'G-XXXXXXXXXX')
      enabled: boolean;
    };
    plausible?: {
      domain: string;         // Plausible domain (e.g., 'daddieck.com')
      enabled: boolean;
    };
  };
  debugMode: boolean;         // Log events to console in development
  batchSize: number;          // Number of events to batch before sending
  flushInterval: number;      // Max time (ms) to hold events before flushing
}

// Analytics provider interface
export interface AnalyticsProvider {
  name: string;
  initialized: boolean;
  initialize(config: AnalyticsConfig): Promise<void>;
  trackEvent(event: AnyAnalyticsEvent): Promise<void>;
  flush(): Promise<void>;
}

// Analytics event queue (for batching)
export interface EventQueue {
  events: AnyAnalyticsEvent[];
  lastFlush: number;
}

// Analytics session data
export interface AnalyticsSession {
  id: string;                 // Session identifier
  startTime: number;          // Session start timestamp
  pageCount: number;          // Pages viewed in session
  lastActivity: number;       // Last activity timestamp
}
