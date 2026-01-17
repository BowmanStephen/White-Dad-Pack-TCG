// Card Rarity Types
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// Dad Type Categories
export type DadType = 
  | 'BBQ_DAD'
  | 'FIX_IT_DAD'
  | 'GOLF_DAD'
  | 'COUCH_DAD'
  | 'LAWN_DAD'
  | 'CAR_DAD'
  | 'OFFICE_DAD'
  | 'COOL_DAD'
  | 'COACH_DAD'
  | 'CHEF_DAD'
  | 'HOLIDAY_DAD'
  | 'WAREHOUSE_DAD'
  | 'VINTAGE_DAD'
  | 'FASHION_DAD'
  | 'TECH_DAD'
  | 'ITEM';

// Holographic Variant Types
export type HoloVariant = 'none' | 'standard' | 'reverse' | 'full_art' | 'prismatic';

// Card Stats Interface
export interface CardStats {
  dadJoke: number;      // 0-100: Quality of terrible puns
  grillSkill: number;   // 0-100: BBQ mastery level
  fixIt: number;        // 0-100: Repair capabilities
  napPower: number;     // 0-100: Ability to fall asleep anywhere
  remoteControl: number; // 0-100: Channel surfing expertise
  thermostat: number;   // 0-100: Temperature control obsession
  sockSandal: number;   // 0-100: Fashion confidence
  beerSnob: number;     // 0-100: Craft beer knowledge
}

// Card Ability Interface
export interface CardAbility {
  name: string;
  description: string;
}

// Main Card Interface
export interface Card {
  id: string;
  name: string;
  subtitle: string;
  type: DadType;
  rarity: Rarity;
  artwork: string;
  stats: CardStats;
  flavorText: string;
  abilities: CardAbility[];
  series: number;
  cardNumber: number;
  totalInSeries: number;
  artist: string;
  holoVariant?: HoloVariant;
}

// Card in a pack (with runtime properties)
export interface PackCard extends Card {
  isRevealed: boolean;
  isHolo: boolean;
  holoType: HoloVariant;
}

// Card for display in collection (with duplicate count)
export interface CollectionDisplayCard extends PackCard {
  duplicateCount: number;
}

// Pack Configuration
export interface PackConfig {
  cardsPerPack: number;
  raritySlots: RaritySlot[];
  holoChance: number;
}

// Rarity Slot Configuration
export interface RaritySlot {
  slot: number;
  guaranteedRarity?: Rarity;
  rarityPool?: boolean;
  probability?: Partial<Record<Rarity, number>>;
}

// Pack State
export interface Pack {
  id: string;
  cards: PackCard[];
  openedAt: Date;
  bestRarity: Rarity;
  design: PackDesign;
}

// Animation State
export type PackState =
  | 'idle'
  | 'generating'
  | 'pack_animate'
  | 'cards_ready'
  | 'revealing'
  | 'results';

// Pack Design Types (US068 - Pack Designs - Visual Variety)
export type PackDesign = 'standard' | 'holiday' | 'premium';

// Pack Design Configuration
export interface PackDesignConfig {
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderColor: string;
  gradientStart: string;
  gradientEnd: string;
  pattern: string;
  probability: number;
  animationVariant: 'standard' | 'festive' | 'golden';
}

// Collection Metadata - Statistics about the user's collection
export interface CollectionMetadata {
  totalPacksOpened: number;
  lastOpenedAt: Date | null;
  uniqueCards: string[]; // Array of unique card IDs
  rarePulls: number; // Number of rare+ pulls
  holoPulls: number; // Number of holo pulls
}

// Collection - All packs owned by the user
export interface Collection {
  packs: Pack[];
  metadata: CollectionMetadata;
}

// Collection State - Reactive state for collection UI
export interface CollectionState {
  openedPacks: Pack[];          // All opened packs
  uniqueCards: string[];        // Unique card IDs
  totalCards: number;           // Total cards across all packs
  rarityCounts: Record<Rarity, number>; // Count of cards by rarity
}

// Collection Stats - Computed statistics
export interface CollectionStats {
  totalPacks: number;
  totalCards: number;
  uniqueCards: number;
  rarePulls: number;
  epicPulls: number;
  legendaryPulls: number;
  mythicPulls: number;
  holoPulls: number;
  lastOpenedAt: Date | null;
}

// UI State
export interface UIState {
  currentCardIndex: number;
  packState: PackState;
  isSkipping: boolean;
  showResults: boolean;
}

// Rarity Configuration (for visual effects)
export interface RarityConfig {
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  particleCount: number;
  animationIntensity: number;
}

// Rarity order for comparison (common=0, mythic=5)
export const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

// Sort options for collection
export type SortOption = 'rarity_desc' | 'name_asc' | 'date_obtained_desc';

// Sort option display names and configurations
export const SORT_OPTION_CONFIG: Record<SortOption, { name: string; description: string }> = {
  rarity_desc: { name: 'Rarity', description: 'Rarest first' },
  name_asc: { name: 'Name', description: 'A to Z' },
  date_obtained_desc: { name: 'Recently Obtained', description: 'Newest first' },
};

// Rarity configurations map
export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: {
    name: 'Common',
    color: '#9ca3af',
    borderColor: '#d1d5db',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    particleCount: 0,
    animationIntensity: 1,
  },
  uncommon: {
    name: 'Uncommon',
    color: '#60a5fa',
    borderColor: '#93c5fd',
    glowColor: 'rgba(96, 165, 250, 0.4)',
    particleCount: 5,
    animationIntensity: 1.2,
  },
  rare: {
    name: 'Rare',
    color: '#fbbf24',
    borderColor: '#fcd34d',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    particleCount: 10,
    animationIntensity: 1.5,
  },
  epic: {
    name: 'Epic',
    color: '#a855f7',
    borderColor: '#c084fc',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    particleCount: 15,
    animationIntensity: 1.8,
  },
  legendary: {
    name: 'Legendary',
    color: '#f97316',
    borderColor: '#fb923c',
    glowColor: 'rgba(249, 115, 22, 0.6)',
    particleCount: 25,
    animationIntensity: 2.2,
  },
  mythic: {
    name: 'Mythic',
    color: '#ec4899',
    borderColor: '#f472b6',
    glowColor: 'rgba(236, 72, 153, 0.7)',
    particleCount: 40,
    animationIntensity: 3,
  },
};

// Dad Type Display Names
export const DAD_TYPE_NAMES: Record<DadType, string> = {
  BBQ_DAD: 'BBQ Dad',
  FIX_IT_DAD: 'Fix-It Dad',
  GOLF_DAD: 'Golf Dad',
  COUCH_DAD: 'Couch Dad',
  LAWN_DAD: 'Lawn Dad',
  CAR_DAD: 'Car Dad',
  OFFICE_DAD: 'Office Dad',
  COOL_DAD: 'Cool Dad',
  COACH_DAD: 'Coach Dad',
  CHEF_DAD: 'Chef Dad',
  HOLIDAY_DAD: 'Holiday Dad',
  WAREHOUSE_DAD: 'Warehouse Dad',
  VINTAGE_DAD: 'Vintage Dad',
  FASHION_DAD: 'Fashion Dad',
  TECH_DAD: 'Tech Dad',
  ITEM: 'Item',
};

// Dad Type Icons (emoji)
export const DAD_TYPE_ICONS: Record<DadType, string> = {
  BBQ_DAD: '🔥',
  FIX_IT_DAD: '🛠️',
  GOLF_DAD: '🏌️',
  COUCH_DAD: '📺',
  LAWN_DAD: '🌱',
  CAR_DAD: '🚗',
  OFFICE_DAD: '👔',
  COOL_DAD: '🎸',
  COACH_DAD: '🎒',
  CHEF_DAD: '👨‍🍳',
  HOLIDAY_DAD: '🎄',
  WAREHOUSE_DAD: '📦',
  VINTAGE_DAD: '🔧',
  FASHION_DAD: '👟',
  TECH_DAD: '💻',
  ITEM: '🎁',
};

// Stat Display Names
export const STAT_NAMES: Record<keyof CardStats, string> = {
  dadJoke: 'Dad Joke',
  grillSkill: 'Grill Skill',
  fixIt: 'Fix-It',
  napPower: 'Nap Power',
  remoteControl: 'Remote Control',
  thermostat: 'Thermostat',
  sockSandal: 'Sock & Sandal',
  beerSnob: 'Beer Snob',
};

// Stat Icons
export const STAT_ICONS: Record<keyof CardStats, string> = {
  dadJoke: '👔',
  grillSkill: '🔥',
  fixIt: '🛠️',
  napPower: '😴',
  remoteControl: '📺',
  thermostat: '🎯',
  sockSandal: '🧦',
  beerSnob: '🍺',
};

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
  | 'daily_reward_claim'; // User claimed daily reward (US074)

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

// ============================================================================
// ACHIEVEMENT TYPES (US073 - Achievement System - Milestones)
// ============================================================================

// Achievement rarity levels
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

// Achievement categories
export type AchievementCategory = 'opening' | 'collection' | 'rare' | 'holo' | 'variety' | 'daily';

// Achievement interface
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// Achievement state for tracking
export interface AchievementState {
  achievements: Achievement[];
  recentlyUnlocked: string[]; // IDs of recently unlocked achievements (for popup queue)
}

// Achievement context for checking conditions
export interface AchievementContext {
  pack: Pack | null;
  collection: Collection;
  stats: CollectionStats;
}

// Achievement configuration
export interface AchievementConfig {
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: AchievementCategory;
  maxProgress?: number;
  checkCondition: (context: AchievementContext) => boolean;
  getProgress?: (context: AchievementContext) => number;
}

// Achievement rarity configuration (for visual effects)
export interface AchievementRarityConfig {
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  bgColor: string;
}

// Achievement rarity configurations map
export const ACHIEVEMENT_RARITY_CONFIG: Record<AchievementRarity, AchievementRarityConfig> = {
  bronze: {
    name: 'Bronze',
    color: '#cd7f32',
    borderColor: '#e5a85c',
    glowColor: 'rgba(205, 127, 50, 0.4)',
    bgColor: 'rgba(205, 127, 50, 0.1)',
  },
  silver: {
    name: 'Silver',
    color: '#c0c0c0',
    borderColor: '#e0e0e0',
    glowColor: 'rgba(192, 192, 192, 0.5)',
    bgColor: 'rgba(192, 192, 192, 0.1)',
  },
  gold: {
    name: 'Gold',
    color: '#ffd700',
    borderColor: '#ffe55c',
    glowColor: 'rgba(255, 215, 0, 0.6)',
    bgColor: 'rgba(255, 215, 0, 0.1)',
  },
  platinum: {
    name: 'Platinum',
    color: '#e5e4e2',
    borderColor: '#f0eff0',
    glowColor: 'rgba(229, 228, 226, 0.7)',
    bgColor: 'rgba(229, 228, 226, 0.15)',
  },
};

// Achievement category display names
export const ACHIEVEMENT_CATEGORY_NAMES: Record<AchievementCategory, string> = {
  opening: 'Pack Opening',
  collection: 'Collection Building',
  rare: 'Rare Pulls',
  holo: 'Holo Hunters',
  variety: 'Variety Seekers',
  daily: 'Daily Rewards',
};

// ============================================================================
// DAILY REWARDS TYPES (US074 - Daily Rewards - Pack Incentive)
// ============================================================================

// Daily reward types
export type DailyRewardType = 'pack' | 'boosted_pack' | 'cards' | 'currency';

// Daily reward interface
export interface DailyReward {
  day: number;                  // Day number in current streak (1-based)
  claimed: boolean;             // Whether reward has been claimed
  claimedAt?: Date;             // When reward was claimed
  rewardType: DailyRewardType;  // Type of reward
  rewardValue: number;          // Value (e.g., pack count, card count)
  bonusMultiplier?: number;     // Streak bonus multiplier (1.0 = normal)
}

// Daily rewards state
export interface DailyRewardsState {
  currentStreak: number;        // Current login streak (days)
  longestStreak: number;        // Longest streak achieved
  lastLoginDate: Date | null;   // Last login date (for streak calculation)
  nextClaimTime: Date;          // When next reward can be claimed
  totalClaimed: number;         // Total rewards claimed all-time
  rewards: DailyReward[];       // Current streak rewards
  consecutiveDays: number;      // Days in current streak
  missedDay: boolean;           // Whether user missed a day (resets streak)
}

// Daily reward tier configuration
export interface DailyRewardTier {
  day: number;                  // Day in streak
  rewardType: DailyRewardType;  // Type of reward
  baseValue: number;            // Base reward value
  description: string;          // Reward description
  icon: string;                 // Icon/emoji
}

// Streak bonus configuration
export interface StreakBonus {
  threshold: number;            // Streak length required
  multiplier: number;           // Bonus multiplier
  description: string;          // Bonus description
}

// ============================================================================
// PACK DESIGNS (US068 - Pack Designs - Visual Variety)
// ============================================================================

// Pack Design Configurations
// Distribution: 80% standard, 15% holiday, 5% premium
export const PACK_DESIGN_CONFIG: Record<PackDesign, PackDesignConfig> = {
  standard: {
    name: 'Standard Pack',
    description: 'The classic blue booster pack',
    primaryColor: '#1e40af', // blue-700
    secondaryColor: '#1e3a8a', // blue-900
    accentColor: '#fbbf24', // amber-400
    borderColor: 'rgba(30, 64, 175, 0.5)',
    gradientStart: '#1e40af',
    gradientEnd: '#1e3a8a',
    pattern: 'standard',
    probability: 0.80,
    animationVariant: 'standard',
  },
  holiday: {
    name: 'Holiday Pack',
    description: 'Festive seasonal edition',
    primaryColor: '#dc2626', // red-600
    secondaryColor: '#991b1b', // red-900
    accentColor: '#22c55e', // green-500
    borderColor: 'rgba(220, 38, 38, 0.5)',
    gradientStart: '#dc2626',
    gradientEnd: '#991b1b',
    pattern: 'holiday',
    probability: 0.15,
    animationVariant: 'festive',
  },
  premium: {
    name: 'Premium Pack',
    description: 'Gold foil rare edition',
    primaryColor: '#ca8a04', // yellow-600
    secondaryColor: '#854d0e', // yellow-900
    accentColor: '#fef08a', // yellow-200
    borderColor: 'rgba(202, 138, 4, 0.5)',
    gradientStart: '#ca8a04',
    gradientEnd: '#854d0e',
    pattern: 'premium',
    probability: 0.05,
    animationVariant: 'golden',
  },
};
