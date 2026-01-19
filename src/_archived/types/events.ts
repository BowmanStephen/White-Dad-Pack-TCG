import type { SeasonId, SeasonStatus, Season, SeasonTheme, SeasonPackDesign, SeasonLaunchEvent, SeasonBonus, SeasonState, SeasonConfig } from './core';

// Re-export season types from core
export type {
  SeasonId,
  SeasonStatus,
  Season,
  SeasonTheme,
  SeasonPackDesign,
  SeasonLaunchEvent,
  SeasonBonus,
  SeasonState,
  SeasonConfig,
};

// Season constants
export const DEFAULT_SEASON_CONFIG: SeasonConfig = {
  defaultSeason: 1,
  seasonDuration: 90,
  autoTransition: true,
};

export const SEASON_PACK_CONFIG: Record<SeasonPackDesign, SeasonTheme> = {
  spring_flings: {
    name: 'Spring Fling',
    primaryColor: '#84cc16',
    secondaryColor: '#65a30d',
    accentColor: '#fef08a',
    backgroundColor: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
    textColor: '#ffffff',
    icon: '🌸',
    packDesign: 'spring_flings',
  },
  summer_bbq: {
    name: 'Summer BBQ',
    primaryColor: '#f97316',
    secondaryColor: '#c2410c',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    textColor: '#ffffff',
    icon: '🔥',
    packDesign: 'summer_bbq',
  },
  fall_foliage: {
    name: 'Fall Foliage',
    primaryColor: '#ea580c',
    secondaryColor: '#c2410c',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    textColor: '#ffffff',
    icon: '🍂',
    packDesign: 'fall_foliage',
  },
  winter_wonderland: {
    name: 'Winter Wonderland',
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
    accentColor: '#e0f2fe',
    backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    textColor: '#ffffff',
    icon: '❄️',
    packDesign: 'winter_wonderland',
  },
  anniversary_bash: {
    name: 'Anniversary Bash',
    primaryColor: '#a855f7',
    secondaryColor: '#7c3aed',
    accentColor: '#f0abfc',
    backgroundColor: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    textColor: '#ffffff',
    icon: '🎉',
    packDesign: 'anniversary_bash',
  },
};

// ============================================================================
// LIVE EVENTS TYPES (US099 - Live Events - Limited Time)
// ============================================================================

export type EventStatus = 'upcoming' | 'active' | 'ended';

export type EventType =
  | 'weekend_mythic'
  | 'holiday_special'
  | 'double_xp'
  | 'bonus_holo'
  | 'rare_flash_sale';

export type EventCurrencyType = 'event_tokens' | 'event_coins' | 'event_gems';

export interface LiveEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startTime: Date;
  endTime: Date;
  theme: EventTheme;
  bonuses: EventBonus[];
  shopItems: EventShopItem[];
  currency?: EventCurrencyBalance;
  progress?: EventProgress;
}

export interface EventBonus {
  type: 'boosted_rates' | 'free_packs' | 'exclusive_cards' | 'double_rewards';
  description: string;
  value: number | string;
  startTime?: Date;
  endTime?: Date;
}

export interface EventTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  icon: string;
  packDesign: string;
}

export interface EventShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: EventCurrencyType;
  type: 'pack' | 'card' | 'avatar' | 'title';
  limitedQuantity?: number;
  remaining?: number;
}

export interface EventCurrencyBalance {
  tokens: number;
  coins: number;
  gems: number;
}

export interface EventProgress {
  currentLevel: number;
  experience: number;
  maxLevel: number;
  rewardsClaimed: number[];
}

export interface EventState {
  activeEvents: LiveEvent[];
  upcomingEvents: LiveEvent[];
  pastEvents: LiveEvent[];
  notificationsEnabled: boolean;
}

export interface EventConfig {
  timezone: string;
  weekendStartDay: number;           // Day weekend starts (0 = Sunday)
  weekendStartTime: string;          // Time weekend starts (HH:mm format)
  weekendEndDay: number;             // Day weekend ends (0 = Sunday)
  weekendEndTime: string;            // Time weekend ends (HH:mm format)
  notificationEnabled: boolean;      // Event notifications
  autoArchive: boolean;              // Auto-archive past events
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
  summer_bbq: {
    name: 'Summer BBQ Bash',
    primaryColor: '#f97316',
    secondaryColor: '#c2410c',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    textColor: '#ffffff',
    icon: '🔥',
    packDesign: 'summer_bbq',
  },
};
