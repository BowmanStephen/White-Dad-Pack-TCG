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

// ============================================================================
// CINEMATIC MODE TYPES (US083 - Pack Opening - Cinematic Mode)
// ============================================================================

// Cinematic mode enables slower, more dramatic pack opening animations
export type CinematicMode = 'normal' | 'cinematic';

// Cinematic mode configuration
export interface CinematicConfig {
  speedMultiplier: number;     // Animation speed (0.5 = 2x slower)
  particleMultiplier: number;   // Particle count multiplier (2 = 2x particles)
  zoomEnabled: boolean;         // Enable camera zoom on card reveal
  audioEnhanced: boolean;       // Enhanced dramatic audio
}

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
  seasonId?: SeasonId; // US086 - Season System: Which season this card belongs to
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
export type PackDesign = 'standard' | 'holiday' | 'premium' | SeasonPackDesign;

// ============================================================================
// BATCH PACK OPENING TYPES (US076 - Batch Actions - Open Multiple Packs)
// ============================================================================

// Batch state machine
export type BatchState =
  | 'idle'              // Ready to start batch
  | 'preparing'         // Preparing batch (validating, showing confirmation)
  | 'opening'           // Currently opening packs
  | 'paused'            // Batch paused (user cancelled mid-batch)
  | 'complete'          // All packs opened
  | 'reviewing';        // Reviewing individual packs

// Batch configuration
export interface BatchConfig {
  totalPacks: number;           // Number of packs to open (1-50)
  fastForward: boolean;         // Skip animations
  autoSave: boolean;            // Auto-save to collection
}

// Batch progress tracking
export interface BatchProgress {
  currentPack: number;          // Current pack index (1-based)
  totalPacks: number;           // Total packs to open
  cardsOpened: number;          // Total cards opened so far
  totalCards: number;           // Total cards to open
  percentage: number;           // Progress percentage (0-100)
}

// Batch result summary
export interface BatchSummary {
  packsOpened: number;          // Number of packs opened
  totalCards: number;           // Total cards obtained
  rarityBreakdown: Record<Rarity, number>; // Cards by rarity
  holoCount: number;            // Number of holo cards
  bestPulls: PackCard[];        // Top 3 rarest cards
  duration: number;             // Total duration (ms)
  timestamp: Date;              // When batch was completed
}

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
// ADVANCED SEARCH TYPES (US077 - Card Search - Advanced Filters)
// ============================================================================

// Stat range filter interface (min-max for each stat)
export interface StatRangeFilter {
  min: number;
  max: number;
}

// All stat ranges for filtering
export interface StatRanges {
  dadJoke?: StatRangeFilter;
  grillSkill?: StatRangeFilter;
  fixIt?: StatRangeFilter;
  napPower?: StatRangeFilter;
  remoteControl?: StatRangeFilter;
  thermostat?: StatRangeFilter;
  sockSandal?: StatRangeFilter;
  beerSnob?: StatRangeFilter;
}

// Advanced search filters interface
export interface AdvancedSearchFilters {
  searchTerm: string;
  rarity: Rarity | null;
  holoVariants: Set<HoloVariant>; // Multiple holo variants (not just "holo only")
  selectedTypes: Set<DadType>;
  statRanges: StatRanges;
}

// Saved search preset interface
export interface SavedSearchPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: AdvancedSearchFilters;
}

// Holographic variant display names
export const HOLO_VARIANT_NAMES: Record<HoloVariant, string> = {
  none: 'Non-Holo',
  standard: 'Standard Holo',
  reverse: 'Reverse Holo',
  full_art: 'Full Art Holo',
  prismatic: 'Prismatic Holo',
};

// Holographic variant icons
export const HOLO_VARIANT_ICONS: Record<HoloVariant, string> = {
  none: '📄',
  standard: '✨',
  reverse: '🌈',
  full_art: '🖼️',
  prismatic: '💎',
};

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

// ============================================================================
// CRAFTING TYPES (US080 - Card Crafting - Combine Cards)
// ============================================================================

// Crafting state machine
export type CraftingState =
  | 'idle'            // Ready to start crafting
  | 'selecting'       // Selecting cards for crafting
  | 'crafting'        // Crafting animation playing
  | 'success'         // Craft succeeded
  | 'failed'          // Craft failed
  | 'history';        // Viewing crafting history

// Crafting recipe interface
export interface CraftingRecipe {
  id: string;                      // Unique recipe ID
  name: string;                    // Recipe display name
  description: string;             // Recipe description
  inputRarity: Rarity;             // Input card rarity
  inputCount: number;              // Number of cards required (typically 5)
  outputRarity: Rarity;            // Output card rarity
  outputCount: number;             // Number of cards produced (typically 1)
  successRate: number;             // Success rate (0-1)
  failReturnRate?: number;         // On fail, % of cards returned (0-1)
}

// Crafting session interface
export interface CraftingSession {
  id: string;                      // Unique session ID
  recipe: CraftingRecipe;          // Selected recipe
  selectedCards: string[];         // IDs of selected cards
  status: CraftingState;           // Current crafting state
  result?: PackCard;               // Result card (if successful)
  timestamp: Date;                 // When crafting started
  completedAt?: Date;              // When crafting completed
}

// Crafting history entry
export interface CraftingHistoryEntry {
  id: string;                      // Unique entry ID
  sessionId: string;               // Reference to crafting session
  recipe: CraftingRecipe;          // Recipe used
  inputCards: string[];            // Card IDs used as input
  result?: PackCard;               // Result card (if successful)
  success: boolean;                // Whether crafting succeeded
  timestamp: Date;                 // When crafting occurred
}

// Crafting history state
export interface CraftingHistory {
  entries: CraftingHistoryEntry[];  // All crafting attempts
  totalAttempts: number;            // Total crafts attempted
  successfulCrafts: number;         // Successful crafts
  failedCrafts: number;             // Failed crafts
  bestCraft: PackCard | null;       // Best card crafted
}

// Crafting configuration
export interface CraftingConfig {
  maxHistoryEntries: number;        // Max history entries to keep
  enableSoundEffects: boolean;      // Whether to play sounds during crafting
  animationDuration: number;        // Crafting animation duration (ms)
}

// Default crafting configuration
export const DEFAULT_CRAFTING_CONFIG: CraftingConfig = {
  maxHistoryEntries: 100,
  enableSoundEffects: true,
  animationDuration: 3000,
};

// Crafting recipes (following acceptance criteria)
// - 5 common → 1 uncommon (100% success)
// - 5 uncommon → 1 rare (100% success)
// - 5 rare → 1 epic (50% success)
// - 5 epic → 1 legendary (50% success)
// - 5 legendary → 1 mythic (25% success)
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'common_to_uncommon',
    name: 'Common to Uncommon',
    description: 'Combine 5 Common cards to craft 1 Uncommon card',
    inputRarity: 'common',
    inputCount: 5,
    outputRarity: 'uncommon',
    outputCount: 1,
    successRate: 1.0,              // 100% success
  },
  {
    id: 'uncommon_to_rare',
    name: 'Uncommon to Rare',
    description: 'Combine 5 Uncommon cards to craft 1 Rare card',
    inputRarity: 'uncommon',
    inputCount: 5,
    outputRarity: 'rare',
    outputCount: 1,
    successRate: 1.0,              // 100% success
  },
  {
    id: 'rare_to_epic',
    name: 'Rare to Epic',
    description: 'Combine 5 Rare cards to craft 1 Epic card (50% success)',
    inputRarity: 'rare',
    inputCount: 5,
    outputRarity: 'epic',
    outputCount: 1,
    successRate: 0.5,              // 50% success
    failReturnRate: 0.6,           // Return 60% of cards on fail
  },
  {
    id: 'epic_to_legendary',
    name: 'Epic to Legendary',
    description: 'Combine 5 Epic cards to craft 1 Legendary card (50% success)',
    inputRarity: 'epic',
    inputCount: 5,
    outputRarity: 'legendary',
    outputCount: 1,
    successRate: 0.5,              // 50% success
    failReturnRate: 0.4,           // Return 40% of cards on fail
  },
  {
    id: 'legendary_to_mythic',
    name: 'Legendary to Mythic',
    description: 'Combine 5 Legendary cards to craft 1 Mythic card (25% success)',
    inputRarity: 'legendary',
    inputCount: 5,
    outputRarity: 'mythic',
    outputCount: 1,
    successRate: 0.25,             // 25% success
    failReturnRate: 0.2,           // Return 20% of cards on fail
  },
];

// ============================================================================
// LEADERBOARD TYPES (US079 - Leaderboard - Global Rankings)
// ============================================================================

// Re-export leaderboard types from separate file
export * from './leaderboard';

// ============================================================================
// NOTIFICATION TYPES (US081 - Notification System - Browser Push)
// ============================================================================

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'achievement';

// Notification categories for push notifications
export type NotificationCategory = 'daily_reward' | 'trade' | 'achievement' | 'general';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  category?: NotificationCategory;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  persistent?: boolean; // Show in notification center
  timestamp: Date;
  read?: boolean;
  actions?: NotificationAction[];
  icon?: string; // Emoji or icon identifier
  data?: Record<string, any>; // Additional data for the notification
}

// Notification action (button/link in notification)
export interface NotificationAction {
  id: string;
  label: string;
  primary?: boolean;
  action: () => void | Promise<void>;
}

// Notification preferences (user settings)
export interface NotificationPreferences {
  // Browser push notification settings
  pushEnabled: boolean;
  pushPermission: 'default' | 'granted' | 'denied';

  // Per-category settings
  dailyRewardNotifications: boolean;
  tradeNotifications: boolean;
  achievementNotifications: boolean;
  generalNotifications: boolean;

  // In-app notification settings
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
}

// Notification state
export interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
}

// Browser push notification payload
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string; // For grouping/replacing notifications
  requireInteraction?: boolean;
  timestamp?: number;
}

// Push notification subscription info
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ============================================================================
// CARD UPGRADE TYPES (US085 - Card Evolution - Upgrade System)
// ============================================================================

// Card upgrade interface (extends PackCard with upgrade tracking)
export interface UpgradedCard extends PackCard {
  upgradeLevel: number;        // Current upgrade level (0-3)
  upgradeHistory: UpgradeEntry[]; // History of all upgrades
}

// Upgrade entry for history tracking
export interface UpgradeEntry {
  timestamp: Date;             // When upgrade occurred
  fromLevel: number;           // Level before upgrade
  toLevel: number;             // Level after upgrade
  cardsConsumed: string[];     // IDs of cards consumed as duplicates
  statsBefore: CardStats;      // Stats before upgrade
  statsAfter: CardStats;       // Stats after upgrade
}

// Upgrade state for UI
export interface UpgradeState {
  // Track available upgradeable cards (cards with 5+ duplicates)
  availableUpgrades: string[]; // Card IDs that can be upgraded

  // Track all cards and their upgrade levels
  // Key: card ID (e.g., "bbq_dad_001")
  // Value: { level: number, history: UpgradeEntry[] }
  cardUpgrades: Record<string, CardUpgradeData>;

  // Upgrade history across all cards
  totalUpgrades: number;
  lastUpgradeAt: Date | null;
}

// Card upgrade data (stored per card ID)
export interface CardUpgradeData {
  level: number;               // Current upgrade level (0-3)
  history: UpgradeEntry[];     // Upgrade history for this card
}

// Upgrade configuration
export interface UpgradeConfig {
  maxLevel: number;            // Maximum upgrade level (3)
  costPerLevel: number;        // Duplicates required per upgrade (5)
  statIncreasePerLevel: number; // Stat increase per level (+5)
}

// Default upgrade configuration
export const DEFAULT_UPGRADE_CONFIG: UpgradeConfig = {
  maxLevel: 3,
  costPerLevel: 5,
  statIncreasePerLevel: 5,
};

// ============================================================================
// DECK BUILDER TYPES (US084 - Collection - Decks Builder)
// ============================================================================

// Card in a deck (with count for duplicates)
export interface DeckCard {
  cardId: string;           // Reference to card ID
  card: Card;               // Full card data
  count: number;            // Number of copies (1-4, visual duplicates allowed)
}

// Deck statistics (computed from deck cards)
export interface DeckStats {
  totalCards: number;       // Total card count (including duplicates)
  uniqueCards: number;      // Number of unique cards
  rarityBreakdown: Record<Rarity, number>; // Count by rarity
  statTotal: CardStats;     // Sum of all card stats (multiplied by count)
  typeBreakdown: Record<DadType, number>; // Count by dad type
  averageStats: CardStats;  // Average stats across all cards
}

// Deck interface
export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: DeckCard[];        // Cards in deck (with counts)
  createdAt: Date;
  updatedAt: Date;
  stats: DeckStats;         // Computed statistics
}

// Deck state for UI
export interface DeckState {
  decks: Deck[];            // All saved decks (max 10)
  currentDeck: Deck | null; // Currently editing deck
  selectedDeckId: string | null; // ID of selected deck for viewing
}

// Deck validation result
export interface DeckValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Deck export format (text format for sharing)
export interface DeckExport {
  name: string;
  description?: string;
  cards: Array<{
    cardId: string;
    cardName: string;
    count: number;
  }>;
  exportedAt: Date;
}

// ============================================================================
// SEASON TYPES (US086 - Season System - Rotating Content)
// ============================================================================

// Season identifier
export type SeasonId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Season status
export type SeasonStatus = 'active' | 'archived' | 'upcoming';

// Season interface
export interface Season {
  id: SeasonId;
  name: string;
  subtitle: string;
  description: string;
  status: SeasonStatus;
  startDate: Date;
  endDate?: Date;
  totalCards: number;
  cardIds: string[];
  packDesign: SeasonPackDesign;
  theme: SeasonTheme;
}

// Season pack design (extends base PackDesign)
export type SeasonPackDesign =
  | 'base_set'
  | 'summer_bbq'
  | 'fall_foliage'
  | 'winter_wonderland'
  | 'spring_bloom';

// Season theme configuration
export interface SeasonTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  icon: string;
}

// Season launch event interface
export interface SeasonLaunchEvent {
  seasonId: SeasonId;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  bonuses: SeasonBonus[];
}

// Season bonuses during launch events
export interface SeasonBonus {
  type: 'boosted_drops' | 'exclusive_cards' | 'special_packs' | 'xp_multiplier';
  description: string;
  value: number | string;
}

// Season state for UI
export interface SeasonState {
  currentSeason: SeasonId;
  activeSeasons: Season[];
  archivedSeasons: Season[];
  upcomingSeasons: Season[];
  launchEvents: SeasonLaunchEvent[];
}

// Season configuration
export interface SeasonConfig {
  currentSeason: SeasonId;
  autoArchive: boolean;
  launchEventDuration: number; // days
}

// Default season configuration
export const DEFAULT_SEASON_CONFIG: SeasonConfig = {
  currentSeason: 1,
  autoArchive: true,
  launchEventDuration: 7,
};

// Season pack design configurations (similar to PACK_DESIGN_CONFIG)
export const SEASON_PACK_CONFIG: Record<SeasonPackDesign, SeasonTheme> = {
  base_set: {
    name: 'Base Set',
    primaryColor: '#1e40af',
    secondaryColor: '#1e3a8a',
    accentColor: '#fbbf24',
    backgroundColor: '#1e3a8a',
    textColor: '#ffffff',
    icon: '📦',
  },
  summer_bbq: {
    name: 'Summer BBQ',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    textColor: '#ffffff',
    icon: '🔥',
  },
  fall_foliage: {
    name: 'Fall Foliage',
    primaryColor: '#d97706',
    secondaryColor: '#92400e',
    accentColor: '#fbbf24',
    backgroundColor: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    textColor: '#ffffff',
    icon: '🍂',
  },
  winter_wonderland: {
    name: 'Winter Wonderland',
    primaryColor: '#0284c7',
    secondaryColor: '#0c4a6e',
    accentColor: '#e0f2fe',
    backgroundColor: 'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)',
    textColor: '#ffffff',
    icon: '❄️',
  },
  spring_bloom: {
    name: 'Spring Bloom',
    primaryColor: '#16a34a',
    secondaryColor: '#14532d',
    accentColor: '#86efac',
    backgroundColor: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
    textColor: '#ffffff',
    icon: '🌸',
  },
};

// ============================================================================
// PROFILE SYSTEM TYPES (US088 - Profile System - Customization)
// ============================================================================

// Avatar options for player profiles (10 options as per acceptance criteria)
export type AvatarId =
  | 'grill_master'
  | 'fix_it'
  | 'golf_pro'
  | 'couch_potato'
  | 'lawn_care'
  | 'car_guy'
  | 'office_worker'
  | 'cool_dad'
  | 'coach'
  | 'chef_dad';

// Avatar configuration
export interface Avatar {
  id: AvatarId;
  emoji: string;
  name: string;
  description: string;
}

// Badge rarity levels
export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

// Badge categories
export type BadgeCategory = 'collection' | 'trading' | 'social' | 'achievement' | 'seasonal';

// Badge interface (achievement badges for profile)
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

// Player profile (extends leaderboard UserProfile with customization)
export interface PlayerProfile {
  playerId: string;           // Unique player identifier (anonymous)
  pseudonym: string;          // Dad-themed pseudonym (e.g., "Gary 🍖")
  username: string;           // User-set custom username
  avatarId: AvatarId;         // Selected avatar ID
  bio: string;                // 140 character max bio text
  favoriteCardId: string | null; // ID of favorite card (for display)
  badges: Badge[];            // Unlocked badges
  stats: PlayerStats;         // Player statistics (reused from leaderboard)
  friends: string[];          // Friend player IDs
  createdAt: Date;            // When profile was created
  updatedAt: Date;            // Last profile update
}

// Profile settings (editable fields)
export interface ProfileSettings {
  username: string;
  avatarId: AvatarId;
  bio: string;
  favoriteCardId: string | null;
}

// Profile view mode (edit vs view)
export type ProfileViewMode = 'edit' | 'view';

// Profile state for UI
export interface ProfileState {
  profile: PlayerProfile | null;
  viewMode: ProfileViewMode;
  isSaving: boolean;
  error: string | null;
}

// Avatar configurations (10 options as per acceptance criteria)
export const AVATARS: Record<AvatarId, Avatar> = {
  grill_master: {
    id: 'grill_master',
    emoji: '🍖',
    name: 'Grill Master',
    description: 'King of the BBQ',
  },
  fix_it: {
    id: 'fix_it',
    emoji: '🔧',
    name: 'Fix-It Dad',
    description: 'Can repair anything',
  },
  golf_pro: {
    id: 'golf_pro',
    emoji: '⛳',
    name: 'Golf Pro',
    description: 'Always on the green',
  },
  couch_potato: {
    id: 'couch_potato',
    emoji: '🛋️',
    name: 'Couch Potato',
    description: 'Professional napper',
  },
  lawn_care: {
    id: 'lawn_care',
    emoji: '🌱',
    name: 'Lawn Care Dad',
    description: 'Grass doesn\'t mow itself',
  },
  car_guy: {
    id: 'car_guy',
    emoji: '🚗',
    name: 'Car Guy',
    description: 'Weekend warrior',
  },
  office_worker: {
    id: 'office_worker',
    emoji: '💼',
    name: 'Office Dad',
    description: 'Meetings in progress',
  },
  cool_dad: {
    id: 'cool_dad',
    emoji: '😎',
    name: 'Cool Dad',
    description: 'Still got it',
  },
  coach: {
    id: 'coach',
    emoji: '🏆',
    name: 'Coach Dad',
    description: 'Winning is everything',
  },
  chef_dad: {
    id: 'chef_dad',
    emoji: '👨‍🍳',
    name: 'Chef Dad',
    description: 'Master of the kitchen',
  },
};

// Badge rarity configuration (for visual effects)
export interface BadgeRarityConfig {
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  bgColor: string;
}

// Badge rarity configurations map
export const BADGE_RARITY_CONFIG: Record<BadgeRarity, BadgeRarityConfig> = {
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
  diamond: {
    name: 'Diamond',
    color: '#b9f2ff',
    borderColor: '#e0f7ff',
    glowColor: 'rgba(185, 242, 255, 0.7)',
    bgColor: 'rgba(185, 242, 255, 0.15)',
  },
};

// Badge category display names
export const BADGE_CATEGORY_NAMES: Record<BadgeCategory, string> = {
  collection: 'Collection Builder',
  trading: 'Master Trader',
  social: 'Social Butterfly',
  achievement: 'Achievement Hunter',
  seasonal: 'Seasonal Veteran',
};

// Predefined badges (achievements that can be unlocked)
export const PROFILE_BADGES: Badge[] = [
  // Collection badges
  {
    id: 'collector_starter',
    name: 'Pack Opener',
    description: 'Open your first pack',
    icon: '📦',
    rarity: 'bronze',
    category: 'collection',
  },
  {
    id: 'collector_10',
    name: 'Dedicated Collector',
    description: 'Open 10 packs',
    icon: '📚',
    rarity: 'bronze',
    category: 'collection',
    maxProgress: 10,
  },
  {
    id: 'collector_50',
    name: 'Pack Addict',
    description: 'Open 50 packs',
    icon: '🎁',
    rarity: 'silver',
    category: 'collection',
    maxProgress: 50,
  },
  {
    id: 'collector_100',
    name: 'Collection Master',
    description: 'Open 100 packs',
    icon: '👑',
    rarity: 'gold',
    category: 'collection',
    maxProgress: 100,
  },
  // Trading badges
  {
    id: 'trader_first',
    name: 'First Trade',
    description: 'Complete your first trade',
    icon: '🤝',
    rarity: 'bronze',
    category: 'trading',
  },
  {
    id: 'trader_10',
    name: 'Active Trader',
    description: 'Complete 10 trades',
    icon: '💱',
    rarity: 'silver',
    category: 'trading',
    maxProgress: 10,
  },
  // Social badges
  {
    id: 'social_friend',
    name: 'Making Friends',
    description: 'Add your first friend',
    icon: '👋',
    rarity: 'bronze',
    category: 'social',
  },
  {
    id: 'social_5_friends',
    name: 'Popular Dad',
    description: 'Add 5 friends',
    icon: '👨‍👩‍👧‍👦',
    rarity: 'silver',
    category: 'social',
    maxProgress: 5,
  },
  // Achievement badges
  {
    id: 'achievement_first',
    name: 'Achievement Unlocked',
    description: 'Unlock your first achievement',
    icon: '🏅',
    rarity: 'bronze',
    category: 'achievement',
  },
  {
    id: 'achievement_10',
    name: 'Achievement Hunter',
    description: 'Unlock 10 achievements',
    icon: '🎖️',
    rarity: 'gold',
    category: 'achievement',
    maxProgress: 10,
  },
  // Seasonal badges
  {
    id: 'season_1_veteran',
    name: 'Base Set Veteran',
    description: 'Participated in Season 1',
    icon: '📦',
    rarity: 'bronze',
    category: 'seasonal',
  },
];

// ============================================================================
// COMMUNITY VOTING TYPES (US087 - Community - Card Voting)
// ============================================================================

// Voting event status
export type VotingStatus = 'active' | 'completed' | 'upcoming';

// Card concept for voting
export interface CardConcept {
  id: string;                      // Unique concept ID
  name: string;                    // Card name
  subtitle: string;                // Card subtitle/title
  type: DadType;                   // Dad type
  rarity: Rarity;                  // Proposed rarity
  conceptDescription: string;      // Description of the concept
  artworkUrl?: string;             // Concept art (optional)
  stats: CardStats;                // Proposed stats
  flavorText: string;              // Flavor text
  abilities: CardAbility[];        // Proposed abilities
}

// Voting event (monthly)
export interface VotingEvent {
  id: string;                      // Unique voting event ID
  month: number;                   // Month (1-12)
  year: number;                    // Year
  status: VotingStatus;            // Current status
  startDate: Date;                 // When voting opens
  endDate: Date;                   // When voting closes
  concepts: CardConcept[];         // 3 card concepts to vote on
  winnerId?: string;               // ID of winning concept (when completed)
  totalVotes: number;              // Total votes cast
}

// Vote record (tracks user's vote)
export interface Vote {
  eventId: string;                 // Voting event ID
  conceptId: string;               // Concept ID voted for
  votedAt: Date;                   // When vote was cast
  userId: string;                  // User identifier (anonymous)
}

// Voting history entry (tracks voted cards that were released)
export interface VotingHistoryEntry {
  eventId: string;                 // Voting event ID
  eventMonth: number;              // Month of voting event
  eventYear: number;               // Year of voting event
  votedConceptId: string;          // Concept the user voted for
  winningConceptId: string;        // Concept that won
  cardId?: string;                 // Actual card ID (when released)
  cardReleasedAt?: Date;           // When the card was released
  exclusiveFoilReceived: boolean;  // Whether user received exclusive foil
}

// Voting state for UI
export interface VotingState {
  currentEvent: VotingEvent | null; // Current active voting event
  upcomingEvents: VotingEvent[];    // Upcoming voting events
  pastEvents: VotingEvent[];        // Completed voting events
  userVotes: Vote[];                // User's voting history
  votedInCurrentEvent: boolean;     // Whether user voted in current event
  votedConceptId: string | null;    // Concept ID user voted for in current event
  votingHistory: VotingHistoryEntry[]; // Full voting history
}

// Voting configuration
export interface VotingConfig {
  eventsPerYear: number;            // Number of voting events per year (12 = monthly)
  conceptsPerEvent: number;         // Number of concepts per event (3)
  votingDurationDays: number;       // How long each voting event lasts (7)
  exclusiveFoilForVoters: boolean;  // Whether voters get exclusive foil version
  notifyOnCardRelease: boolean;     // Whether to notify when voted cards are released
}

// Default voting configuration
export const DEFAULT_VOTING_CONFIG: VotingConfig = {
  eventsPerYear: 12,
  conceptsPerEvent: 3,
  votingDurationDays: 7,
  exclusiveFoilForVoters: true,
  notifyOnCardRelease: true,
};

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
  // Season pack designs (US086)
  base_set: {
    name: 'Base Set Pack',
    description: 'Original dad collection',
    primaryColor: '#1e40af',
    secondaryColor: '#1e3a8a',
    accentColor: '#fbbf24',
    borderColor: 'rgba(30, 64, 175, 0.5)',
    gradientStart: '#1e40af',
    gradientEnd: '#1e3a8a',
    pattern: 'base_set',
    probability: 0,
    animationVariant: 'standard',
  },
  summer_bbq: {
    name: 'Summer BBQ Pack',
    description: 'Grill master dad collection',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#fbbf24',
    borderColor: 'rgba(220, 38, 38, 0.5)',
    gradientStart: '#dc2626',
    gradientEnd: '#991b1b',
    pattern: 'summer_bbq',
    probability: 0,
    animationVariant: 'festive',
  },
  fall_foliage: {
    name: 'Fall Foliage Pack',
    description: 'Autumn dad collection',
    primaryColor: '#d97706',
    secondaryColor: '#92400e',
    accentColor: '#fbbf24',
    borderColor: 'rgba(217, 119, 6, 0.5)',
    gradientStart: '#d97706',
    gradientEnd: '#92400e',
    pattern: 'fall_foliage',
    probability: 0,
    animationVariant: 'standard',
  },
  winter_wonderland: {
    name: 'Winter Wonderland Pack',
    description: 'Cold weather dad collection',
    primaryColor: '#0284c7',
    secondaryColor: '#0c4a6e',
    accentColor: '#e0f2fe',
    borderColor: 'rgba(2, 132, 199, 0.5)',
    gradientStart: '#0284c7',
    gradientEnd: '#0c4a6e',
    pattern: 'winter_wonderland',
    probability: 0,
    animationVariant: 'festive',
  },
  spring_bloom: {
    name: 'Spring Bloom Pack',
    description: 'Spring dad collection',
    primaryColor: '#16a34a',
    secondaryColor: '#14532d',
    accentColor: '#86efac',
    borderColor: 'rgba(22, 163, 74, 0.5)',
    gradientStart: '#16a34a',
    gradientEnd: '#14532d',
    pattern: 'spring_bloom',
    probability: 0,
    animationVariant: 'standard',
  },
};

// ============================================================================
// CARD BATTLES TYPES (US090 - Card Battles - Minigame)
// ============================================================================

// Battle state machine
export type BattleState =
  | 'idle'              // Ready to start battle
  | 'selecting'         // Selecting cards for battle
  | 'battling'          // Battle in progress (auto-battle animation)
  | 'completed';        // Battle finished, showing results

// Battle mode types
export type BattleMode = 'casual' | 'ranked';

// Battle format
export type BattleFormat = '3v3'; // 3 cards vs 3 cards

// Battle slot position (1-3 for player, 4-6 for opponent)
export type BattleSlot = 1 | 2 | 3;

// Card in battle (with current HP and status)
export interface BattleCard {
  card: PackCard;               // The card data
  currentHP: number;            // Current health points
  maxHP: number;                // Maximum health points
  isAlive: boolean;             // Whether card is still in battle
  position: BattleSlot;         // Position in team (1-3)
}

// Battle team (player or opponent)
export interface BattleTeam {
  cards: BattleCard[];          // 3 cards in the team
  teamName: string;             // Team name
  isPlayer: boolean;            // Whether this is the player's team
}

// Battle result
export interface BattleResult {
  winner: 'player' | 'opponent' | 'draw';
  playerTeam: BattleTeam;
  opponentTeam: BattleTeam;
  turns: number;                // Number of turns in battle
  battleLog: BattleLogEntry[];  // Battle log entries
  duration: number;             // Battle duration in ms
  timestamp: Date;              // When battle completed
  rewards?: BattleRewards;      // Rewards (for ranked mode)
}

// Battle log entry
export interface BattleLogEntry {
  turn: number;
  action: BattleAction;
  description: string;
  damage?: number;
  criticalHit?: boolean;
}

// Battle action types
export type BattleAction =
  | 'attack'
  | 'ability'
  | 'status_effect'
  | 'knockout'
  | 'victory';

// Battle rewards (for ranked mode)
export interface BattleRewards {
  xp: number;
  rankPoints: number;           // Positive for win, negative for loss
  currency?: number;            // Optional currency reward
}

// Battle entry in history
export interface BattleHistoryEntry {
  id: string;                   // Unique battle ID
  mode: BattleMode;             // Casual or ranked
  result: BattleResult;         // Battle result
  playerDeck: string[];         // Card IDs used by player
  timestamp: Date;              // When battle occurred
}

// Ranked season data
export interface RankedSeason {
  seasonId: SeasonId;           // Current season ID
  startDate: Date;              // Season start
  endDate: Date;                // Season end
}

// Player ranked data
export interface PlayerRankedData {
  currentRank: number;          // Current rank (1 = best)
  currentTier: RankedTier;      // Current tier
  rankPoints: number;           // Current rank points
  wins: number;                 // Season wins
  losses: number;               // Season losses
  winRate: number;              // Win percentage
  bestRank: number;             // Best rank achieved
}

// Ranked tiers
export type RankedTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'champion';

// Ranked tier configuration
export interface RankedTierConfig {
  name: string;
  icon: string;
  color: string;
  minRank: number;
  maxRank: number;
  rankPointsRange: [number, number];
}

// Battle configuration
export interface BattleConfig {
  cardsPerTeam: number;         // Cards per team (3)
  turnDuration: number;         // Duration per turn in ms (for auto-battle)
  maxTurns: number;             // Maximum turns before time limit
  rankedMultiplier: number;     // Rank points multiplier
}

// Default battle configuration
export const DEFAULT_BATTLE_CONFIG: BattleConfig = {
  cardsPerTeam: 3,
  turnDuration: 1000,           // 1 second per turn (10s total battle)
  maxTurns: 10,
  rankedMultiplier: 1.0,
};

// Ranked tier configurations
export const RANKED_TIERS: Record<RankedTier, RankedTierConfig> = {
  bronze: {
    name: 'Bronze',
    icon: '🥉',
    color: '#cd7f32',
    minRank: 1001,
    maxRank: 999999,
    rankPointsRange: [0, 999],
  },
  silver: {
    name: 'Silver',
    icon: '🥈',
    color: '#c0c0c0',
    minRank: 501,
    maxRank: 1000,
    rankPointsRange: [1000, 1999],
  },
  gold: {
    name: 'Gold',
    icon: '🥇',
    color: '#ffd700',
    minRank: 201,
    maxRank: 500,
    rankPointsRange: [2000, 2999],
  },
  platinum: {
    name: 'Platinum',
    icon: '💎',
    color: '#e5e4e2',
    minRank: 51,
    maxRank: 200,
    rankPointsRange: [3000, 3999],
  },
  diamond: {
    name: 'Diamond',
    icon: '💠',
    color: '#b9f2ff',
    minRank: 11,
    maxRank: 50,
    rankPointsRange: [4000, 4999],
  },
  champion: {
    name: 'Champion',
    icon: '👑',
    color: '#ff6b6b',
    minRank: 1,
    maxRank: 10,
    rankPointsRange: [5000, 99999],
  },
};

// ============================================================================
// FRIEND SYSTEM TYPES (US089 - Friend System - Social Connections)
// ============================================================================

// Friend request status
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

// Friend activity types for activity feed
export type FriendActivityType =
  | 'opened_pack'
  | 'rare_pull'
  | 'epic_pull'
  | 'legendary_pull'
  | 'mythic_pull'
  | 'achievement_unlocked'
  | 'badge_unlocked'
  | 'trade_completed'
  | 'crafting_completed'
  | 'level_up';

// Friend request interface
export interface FriendRequest {
  id: string;                      // Unique request ID
  fromPlayerId: string;            // Player ID of sender
  toPlayerId: string;              // Player ID of recipient
  fromUsername: string;            // Username of sender
  fromAvatarId: AvatarId;          // Avatar ID of sender
  status: FriendRequestStatus;     // Current status
  createdAt: Date;                 // When request was sent
  respondedAt?: Date;              // When request was accepted/rejected
  message?: string;                // Optional message from sender
}

// Friend profile (public viewable data)
export interface FriendProfile {
  playerId: string;                // Player ID
  username: string;                // Custom username
  pseudonym: string;               // Dad-themed pseudonym
  avatarId: AvatarId;              // Avatar ID
  bio: string;                     // Bio text
  stats: PlayerStats;              // Player statistics (read-only)
  badges: Badge[];                 // Unlocked badges (display only)
  isOnline: boolean;               // Online status
  lastActive: Date;                // Last activity timestamp
  friendCount: number;             // Number of friends
}

// Friend activity entry for activity feed
export interface FriendActivity {
  id: string;                      // Unique activity ID
  playerId: string;                // Player ID who performed activity
  username: string;                // Username of player
  avatarId: AvatarId;              // Avatar ID of player
  type: FriendActivityType;        // Type of activity
  details: FriendActivityDetails;  // Activity-specific details
  timestamp: Date;                 // When activity occurred
}

// Activity details based on type
export interface FriendActivityDetails {
  // For opened_pack
  packId?: string;
  cardCount?: number;

  // For rare_pull, epic_pull, legendary_pull, mythic_pull
  cardName?: string;
  cardRarity?: Rarity;
  isHolo?: boolean;

  // For achievement_unlocked, badge_unlocked
  achievementName?: string;
  badgeName?: string;

  // For trade_completed
  tradePartnerName?: string;
  cardsTraded?: number;

  // For crafting_completed
  recipeName?: string;
  success?: boolean;

  // For level_up
  cardName?: string;
  newLevel?: number;
}

// Friend collection view (read-only access to friend's collection)
export interface FriendCollectionView {
  playerId: string;
  username: string;
  pseudonym: string;
  totalPacks: number;
  totalCards: number;
  uniqueCards: number;
  rarityBreakdown: Record<Rarity, number>;
  favoriteCards: PackCard[];       // Up to 3 favorite cards
  lastUpdated: Date;
}

// Friend stats comparison
export interface FriendStatsComparison {
  yourStats: PlayerStats;
  friendStats: PlayerStats;
  comparisons: StatsComparison[];
}

// Individual stat comparison
export interface StatsComparison {
  stat: keyof PlayerStats;
  yourValue: number;
  friendValue: number;
  winner: 'you' | 'friend' | 'tie';
  difference: number;
}

// Friend state for UI
export interface FriendState {
  friends: FriendProfile[];        // All friends
  pendingRequests: FriendRequest[]; // Incoming friend requests
  sentRequests: FriendRequest[];   // Outgoing friend requests
  activities: FriendActivity[];    // Recent friend activities
  isFinderOpen: boolean;           // Friend finder modal state
  searchResults: FriendProfile[];  // Search results for adding friends
}

// Friend code format for sharing (e.g., "DAD-ABC123")
export type FriendCode = string;

// Friend configuration
export interface FriendConfig {
  maxFriends: number;              // Maximum friends allowed
  maxPendingRequests: number;      // Max pending requests
  activityFeedLimit: number;       // Max activities to show
  requestExpirationDays: number;   // Days before request expires
  allowStrangerRequests: boolean;  // Allow requests from non-friends
}

// Default friend configuration
export const DEFAULT_FRIEND_CONFIG: FriendConfig = {
  maxFriends: 100,
  maxPendingRequests: 20,
  activityFeedLimit: 50,
  requestExpirationDays: 7,
  allowStrangerRequests: true,
};

// Friend activity display configuration
export const FRIEND_ACTIVITY_CONFIG: Record<FriendActivityType, { icon: string; title: string; color: string }> = {
  opened_pack: { icon: '📦', title: 'opened a pack', color: '#3b82f6' },
  rare_pull: { icon: '⭐', title: 'pulled a Rare card', color: '#fbbf24' },
  epic_pull: { icon: '💜', title: 'pulled an Epic card', color: '#a855f7' },
  legendary_pull: { icon: '🔥', title: 'pulled a Legendary card', color: '#f97316' },
  mythic_pull: { icon: '💎', title: 'pulled a Mythic card', color: '#ec4899' },
  achievement_unlocked: { icon: '🏆', title: 'unlocked an achievement', color: '#22c55e' },
  badge_unlocked: { icon: '🎖️', title: 'earned a badge', color: '#fbbf24' },
  trade_completed: { icon: '🤝', title: 'completed a trade', color: '#06b6d4' },
  crafting_completed: { icon: '⚗️', title: 'crafted a card', color: '#8b5cf6' },
  level_up: { icon: '⬆️', title: 'upgraded a card', color: '#10b981' },
};

// ============================================================================
// MONETIZATION TYPES (US093 - Monetization - Premium Packs)
// ============================================================================

// Pack purchase type - standard free pack vs paid premium pack
export type PackType = 'standard' | 'premium';

// Premium pack purchase configuration
export interface PremiumPackConfig {
  id: string;                      // Unique pack ID (e.g., 'premium_single')
  name: string;                    // Display name
  description: string;             // Marketing description
  price: number;                   // Price in USD (e.g., 0.99)
  currency: string;                // Currency code (default: 'USD')
  cardsPerPack: number;            // Number of cards (usually 7 vs 6 for standard)
  rarityGuarantee: Rarity;         // Minimum guaranteed rarity
  mythicChanceMultiplier: number;  // Mythic chance multiplier (e.g., 2.0 = 2x)
  holoChanceMultiplier: number;    // Holo chance multiplier (e.g., 1.5 = 50% more)
  stripePriceId?: string;          // Stripe Price ID for checkout
  isActive: boolean;               // Whether this pack is available for purchase
}

// Premium pack rarity slot configuration (boosted rates)
export interface PremiumRaritySlot extends RaritySlot {
  boostedProbability?: Partial<Record<Rarity, number>>;  // Enhanced odds for premium
}

// Purchase session for tracking pack purchases
export interface PurchaseSession {
  sessionId: string;              // Unique session ID
  packType: PackType;             // 'standard' or 'premium'
  packConfigId: string;           // Which premium pack config
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripePaymentIntentId?: string; // Stripe payment intent ID
  receiptValidated: boolean;      // Whether receipt was validated
  packId?: string;                // Generated pack ID (if completed)
  timestamp: Date;                // When purchase was initiated
  completedAt?: Date;             // When purchase completed
  error?: string;                 // Error message if failed
}

// Stripe checkout session data
export interface StripeCheckoutSession {
  sessionId: string;
  paymentIntentId: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  metadata: {
    packConfigId: string;
    userId?: string;
  };
}

// Receipt validation response
export interface ReceiptValidation {
  isValid: boolean;
  sessionId: string;
  packConfigId: string;
  validatedAt: Date;
  signature: string;              // Cryptographic signature
}

// Premium pack inventory (user's purchased premium packs)
export interface PremiumPackInventory {
  availablePacks: string[];       // Pack config IDs user can open
  purchaseHistory: PurchaseSession[];
  totalPacksPurchased: number;
  totalSpent: number;             // Total USD spent
}

// Premium pack configurations (acceptance criteria)
export const PREMIUM_PACK_CONFIGS: PremiumPackConfig[] = [
  {
    id: 'premium_single',
    name: 'Premium Pack',
    description: 'Boosted rates with guaranteed Rare or better!',
    price: 0.99,
    currency: 'USD',
    cardsPerPack: 7,              // 7 cards vs 6 for standard
    rarityGuarantee: 'rare',       // Guaranteed rare or better
    mythicChanceMultiplier: 2.0,  // 2x mythic chance
    holoChanceMultiplier: 1.5,    // 50% more holo
    isActive: true,
  },
];

// Premium pack rarity slots (boosted rates vs standard)
// Standard: 3 common, 2 uncommon+ (74% uncommon), 1 rare+ (87.9% rare, 0.1% mythic)
// Premium: 2 common, 3 uncommon+, 2 rare+ (50% rare), guaranteed rare in slot 6
export const PREMIUM_PACK_RARITY_SLOTS: PremiumRaritySlot[] = [
  { slot: 1, guaranteedRarity: 'common' },
  { slot: 2, guaranteedRarity: 'common' },
  {
    slot: 3,
    rarityPool: true,
    probability: { uncommon: 0.60, rare: 0.30, epic: 0.08, legendary: 0.019, mythic: 0.001 },
  },
  {
    slot: 4,
    rarityPool: true,
    probability: { uncommon: 0.50, rare: 0.35, epic: 0.12, legendary: 0.028, mythic: 0.002 },
  },
  {
    slot: 5,
    rarityPool: true,
    boostedProbability: { rare: 0.50, epic: 0.25, legendary: 0.20, mythic: 0.05 }, // Slot 5 boosted
  },
  { slot: 6, guaranteedRarity: 'rare' }, // GUARANTEED RARE OR BETTER
  {
    slot: 7,
    rarityPool: true,
    probability: { rare: 0.50, epic: 0.30, legendary: 0.18, mythic: 0.02 }, // Slot 7: 2x mythic (0.02 vs 0.001)
  },
];

// Premium pack visual configuration (distinct from standard premium design)
export const PREMIUM_PACK_VISUAL_CONFIG = {
  borderColor: '#ffd700',         // Gold border
  glowIntensity: 2.5,             // 2.5x glow effect
  particleMultiplier: 3.0,        // 3x particles
  animationVariant: 'premium_gold',
  shimmerEffect: true,            // Premium shimmer animation
  rainbowHoloChance: 0.10,        // 10% chance for rainbow holo border
};

// ============================================================================
// DADPASS TYPES (US094 - Monetization - Pass System)
// ============================================================================

// DadPass subscription status
export type DadPassStatus = 'inactive' | 'active' | 'expired' | 'pending';

// DadPass tier reward types
export type DadPassRewardType =
  | 'daily_reward_unlock'      // Unlocks daily rewards
  | 'premium_pack'            // Premium pack (every 3 days)
  | 'exclusive_card'          // Exclusive card at specific tier
  | 'bonus_packs'             // Bonus standard packs
  | 'currency'                // In-game currency (future)
  | 'card_back'               // Exclusive card back
  | 'title'                   // Exclusive title
  | 'avatar_border';          // Profile avatar border

// DadPass tier reward interface
export interface DadPassReward {
  tier: number;                    // Tier number (1-30)
  rewardType: DadPassRewardType;   // Type of reward
  description: string;             // Reward description
  icon: string;                    // Icon/emoji
  claimed: boolean;                // Whether reward has been claimed
  claimedAt?: Date;                // When reward was claimed
  metadata?: {
    // Additional data based on reward type
    cardId?: string;               // For exclusive_card
    packCount?: number;            // For premium_pack, bonus_packs
    currencyAmount?: number;       // For currency
    cardBackId?: string;           // For card_back
    titleId?: string;              // For title
    avatarBorderId?: string;       // For avatar_border
  };
}

// DadPass subscription interface
export interface DadPassSubscription {
  status: DadPassStatus;           // Current status
  startDate: Date;                 // When pass started
  endDate: Date;                   // When pass expires (30 days)
  autoRenew: boolean;              // Auto-renew enabled
  currentTier: number;             // Current unlocked tier (0-30)
  totalXP: number;                 // Total XP earned
  xpToNextTier: number;            // XP needed for next tier
  lastClaimDate?: Date;            // Last daily login reward claimed
  premiumPacksAwarded: number;     // Premium packs awarded (every 3 days)
  lastPremiumPackDate?: Date;      // Last premium pack award date
}

// DadPass tier configuration
export interface DadPassTier {
  tier: number;                    // Tier number (1-30)
  xpRequired: number;              // XP needed to unlock
  rewards: DadPassReward[];        // Rewards at this tier
  isFreeTier: boolean;             // Whether this is a free or premium tier
}

// DadPass configuration
export interface DadPassConfig {
  duration: number;                // Pass duration in days (30)
  price: number;                   // Price in USD ($4.99)
  currency: string;                // Currency code
  maxTier: number;                 // Maximum tier (30)
  xpPerDailyLogin: number;         // XP earned for daily login (100)
  xpPerPackOpened: number;         // XP earned per pack opened (10)
  premiumPackInterval: number;     // Days between premium packs (3)
  exclusiveCardTier: number;       // Tier with exclusive card (10)
}

// DadPass state for UI
export interface DadPassState {
  subscription: DadPassSubscription | null; // Active subscription
  availableTiers: DadPassTier[];   // All available tiers
  claimedRewards: string[];        // IDs of claimed rewards
  purchasePending: boolean;        // Purchase in progress
  lastDailyCheck?: Date;           // Last daily check for rewards
}

// DadPass summary for display
export interface DadPassSummary {
  isActive: boolean;
  status: DadPassStatus;
  currentTier: number;
  maxTier: number;
  totalXP: number;
  daysRemaining: number;
  progressPercent: number;
  claimableRewards: number;
  autoRenew: boolean;
  premiumPacksAwarded: number;
}

// DadPass purchase session
export interface DadPassPurchaseSession {
  sessionId: string;               // Unique session ID
  status: 'pending' | 'completed' | 'failed';
  stripeCheckoutUrl?: string;      // Stripe checkout URL (when implemented)
  timestamp: Date;                 // When purchase was initiated
  completedAt?: Date;              // When purchase completed
  error?: string;                  // Error message if failed
}

// Default DadPass configuration
export const DEFAULT_DADPASS_CONFIG: DadPassConfig = {
  duration: 30,                    // 30-day pass
  price: 4.99,                     // $4.99
  currency: 'USD',
  maxTier: 30,                     // 30 tiers
  xpPerDailyLogin: 100,            // 100 XP per day login
  xpPerPackOpened: 10,             // 10 XP per pack opened
  premiumPackInterval: 3,          // Premium pack every 3 days
  exclusiveCardTier: 10,           // Exclusive card at tier 10
};

// DadPass tier rewards configuration
// Free tiers (1, 4, 7, 10, 13, 16, 19, 22, 25, 28) - everyone gets these
// Premium tiers (2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30)
export const DADPASS_TIERS: DadPassTier[] = [
  // Tier 1 (Free) - Daily rewards unlock
  {
    tier: 1,
    xpRequired: 0,
    isFreeTier: true,
    rewards: [
      {
        tier: 1,
        rewardType: 'daily_reward_unlock',
        description: 'Unlock Daily Rewards',
        icon: '🎁',
        claimed: false,
      },
    ],
  },
  // Tier 2 (Premium) - 1 Premium Pack
  {
    tier: 2,
    xpRequired: 100,
    isFreeTier: false,
    rewards: [
      {
        tier: 2,
        rewardType: 'premium_pack',
        description: '1 Premium Pack',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 1 },
      },
    ],
  },
  // Tier 3 (Premium) - 3 Standard Packs
  {
    tier: 3,
    xpRequired: 250,
    isFreeTier: false,
    rewards: [
      {
        tier: 3,
        rewardType: 'bonus_packs',
        description: '3 Bonus Standard Packs',
        icon: '📦',
        claimed: false,
        metadata: { packCount: 3 },
      },
    ],
  },
  // Tier 4 (Free) - 1 Standard Pack
  {
    tier: 4,
    xpRequired: 400,
    isFreeTier: true,
    rewards: [
      {
        tier: 4,
        rewardType: 'bonus_packs',
        description: '1 Bonus Standard Pack',
        icon: '📦',
        claimed: false,
        metadata: { packCount: 1 },
      },
    ],
  },
  // Tier 5 (Premium) - Exclusive Title
  {
    tier: 5,
    xpRequired: 600,
    isFreeTier: false,
    rewards: [
      {
        tier: 5,
        rewardType: 'title',
        description: 'Exclusive Title: "Pass Dad"',
        icon: '🏷️',
        claimed: false,
        metadata: { titleId: 'pass_dad' },
      },
    ],
  },
  // Tier 6 (Premium) - 1 Premium Pack
  {
    tier: 6,
    xpRequired: 800,
    isFreeTier: false,
    rewards: [
      {
        tier: 6,
        rewardType: 'premium_pack',
        description: '1 Premium Pack',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 1 },
      },
    ],
  },
  // Tier 7 (Free) - Exclusive Card Back
  {
    tier: 7,
    xpRequired: 1000,
    isFreeTier: true,
    rewards: [
      {
        tier: 7,
        rewardType: 'card_back',
        description: 'DadPass Card Back',
        icon: '🎴',
        claimed: false,
        metadata: { cardBackId: 'daddypass_season1' },
      },
    ],
  },
  // Tier 8 (Premium) - Avatar Border
  {
    tier: 8,
    xpRequired: 1250,
    isFreeTier: false,
    rewards: [
      {
        tier: 8,
        rewardType: 'avatar_border',
        description: 'Golden Avatar Border',
        icon: '👑',
        claimed: false,
        metadata: { avatarBorderId: 'gold_daddypass' },
      },
    ],
  },
  // Tier 9 (Premium) - 2 Premium Packs
  {
    tier: 9,
    xpRequired: 1500,
    isFreeTier: false,
    rewards: [
      {
        tier: 9,
        rewardType: 'premium_pack',
        description: '2 Premium Packs',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 2 },
      },
    ],
  },
  // Tier 10 (Premium) - EXCLUSIVE CARD (The big reward!)
  {
    tier: 10,
    xpRequired: 1800,
    isFreeTier: false,
    rewards: [
      {
        tier: 10,
        rewardType: 'exclusive_card',
        description: 'EXCLUSIVE: Legendary DadPass Dad Card',
        icon: '💎',
        claimed: false,
        metadata: { cardId: 'daddypass_exclusive_legendary' },
      },
    ],
  },
  // Tier 11 (Premium) - 1 Premium Pack
  {
    tier: 11,
    xpRequired: 2100,
    isFreeTier: false,
    rewards: [
      {
        tier: 11,
        rewardType: 'premium_pack',
        description: '1 Premium Pack',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 1 },
      },
    ],
  },
  // Tier 12 (Premium) - 5 Standard Packs
  {
    tier: 12,
    xpRequired: 2400,
    isFreeTier: false,
    rewards: [
      {
        tier: 12,
        rewardType: 'bonus_packs',
        description: '5 Bonus Standard Packs',
        icon: '📦',
        claimed: false,
        metadata: { packCount: 5 },
      },
    ],
  },
  // Tier 13 (Free) - 2 Standard Packs
  {
    tier: 13,
    xpRequired: 2700,
    isFreeTier: true,
    rewards: [
      {
        tier: 13,
        rewardType: 'bonus_packs',
        description: '2 Bonus Standard Packs',
        icon: '📦',
        claimed: false,
        metadata: { packCount: 2 },
      },
    ],
  },
  // Tier 14 (Premium) - Exclusive Title
  {
    tier: 14,
    xpRequired: 3000,
    isFreeTier: false,
    rewards: [
      {
        tier: 14,
        rewardType: 'title',
        description: 'Exclusive Title: "DadPass Elite"',
        icon: '🏷️',
        claimed: false,
        metadata: { titleId: 'daddypass_elite' },
      },
    ],
  },
  // Tier 15 (Premium) - 2 Premium Packs
  {
    tier: 15,
    xpRequired: 3400,
    isFreeTier: false,
    rewards: [
      {
        tier: 15,
        rewardType: 'premium_pack',
        description: '2 Premium Packs',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 2 },
      },
    ],
  },
  // Tier 16 (Free) - Exclusive Card Back
  {
    tier: 16,
    xpRequired: 3800,
    isFreeTier: true,
    rewards: [
      {
        tier: 16,
        rewardType: 'card_back',
        description: 'DadPass Elite Card Back',
        icon: '🎴',
        claimed: false,
        metadata: { cardBackId: 'daddypass_elite' },
      },
    ],
  },
  // Tier 17 (Premium) - 1 Premium Pack
  {
    tier: 17,
    xpRequired: 4200,
    isFreeTier: false,
    rewards: [
      {
        tier: 17,
        rewardType: 'premium_pack',
        description: '1 Premium Pack',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 1 },
      },
    ],
  },
  // Tier 18 (Premium) - Avatar Border
  {
    tier: 18,
    xpRequired: 4600,
    isFreeTier: false,
    rewards: [
      {
        tier: 18,
        rewardType: 'avatar_border',
        description: 'Platinum Avatar Border',
        icon: '💎',
        claimed: false,
        metadata: { avatarBorderId: 'platinum_daddypass' },
      },
    ],
  },
  // Tier 19 (Free) - 3 Standard Packs
  {
    tier: 19,
    xpRequired: 5000,
    isFreeTier: true,
    rewards: [
      {
        tier: 19,
        rewardType: 'bonus_packs',
        description: '3 Bonus Standard Packs',
        icon: '📦',
        claimed: false,
        metadata: { packCount: 3 },
      },
    ],
  },
  // Tier 20 (Premium) - 3 Premium Packs
  {
    tier: 20,
    xpRequired: 5500,
    isFreeTier: false,
    rewards: [
      {
        tier: 20,
        rewardType: 'premium_pack',
        description: '3 Premium Packs',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 3 },
      },
    ],
  },
  // Tier 21 (Premium) - Exclusive Title
  {
    tier: 21,
    xpRequired: 6000,
    isFreeTier: false,
    rewards: [
      {
        tier: 21,
        rewardType: 'title',
        description: 'Exclusive Title: "DadPass Legend"',
        icon: '🏷️',
        claimed: false,
        metadata: { titleId: 'daddypass_legend' },
      },
    ],
  },
  // Tier 22 (Free) - Exclusive Card Back
  {
    tier: 22,
    xpRequired: 6500,
    isFreeTier: true,
    rewards: [
      {
        tier: 22,
        rewardType: 'card_back',
        description: 'DadPass Legend Card Back',
        icon: '🎴',
        claimed: false,
        metadata: { cardBackId: 'daddypass_legend' },
      },
    ],
  },
  // Tier 23 (Premium) - 2 Premium Packs
  {
    tier: 23,
    xpRequired: 7000,
    isFreeTier: false,
    rewards: [
      {
        tier: 23,
        rewardType: 'premium_pack',
        description: '2 Premium Packs',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 2 },
      },
    ],
  },
  // Tier 24 (Premium) - Avatar Border
  {
    tier: 24,
    xpRequired: 7500,
    isFreeTier: false,
    rewards: [
      {
        tier: 24,
        rewardType: 'avatar_border',
        description: 'Diamond Avatar Border',
        icon: '💠',
        claimed: false,
        metadata: { avatarBorderId: 'diamond_daddypass' },
      },
    ],
  },
  // Tier 25 (Free) - 5 Standard Packs
  {
    tier: 25,
    xpRequired: 8000,
    isFreeTier: true,
    rewards: [
      {
        tier: 25,
        rewardType: 'bonus_packs',
        description: '5 Bonus Standard Packs',
        icon: '📦',
        claimed: false,
        metadata: { packCount: 5 },
      },
    ],
  },
  // Tier 26 (Premium) - 3 Premium Packs
  {
    tier: 26,
    xpRequired: 8500,
    isFreeTier: false,
    rewards: [
      {
        tier: 26,
        rewardType: 'premium_pack',
        description: '3 Premium Packs',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 3 },
      },
    ],
  },
  // Tier 27 (Premium) - Exclusive Title
  {
    tier: 27,
    xpRequired: 9000,
    isFreeTier: false,
    rewards: [
      {
        tier: 27,
        rewardType: 'title',
        description: 'Exclusive Title: "Ultimate Dad"',
        icon: '🏷️',
        claimed: false,
        metadata: { titleId: 'ultimate_dad' },
      },
    ],
  },
  // Tier 28 (Free) - Exclusive Card Back
  {
    tier: 28,
    xpRequired: 9500,
    isFreeTier: true,
    rewards: [
      {
        tier: 28,
        rewardType: 'card_back',
        description: 'Ultimate Dad Card Back',
        icon: '🎴',
        claimed: false,
        metadata: { cardBackId: 'ultimate_dad' },
      },
    ],
  },
  // Tier 29 (Premium) - 5 Premium Packs
  {
    tier: 29,
    xpRequired: 10000,
    isFreeTier: false,
    rewards: [
      {
        tier: 29,
        rewardType: 'premium_pack',
        description: '5 Premium Packs',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 5 },
      },
    ],
  },
  // Tier 30 (Premium) - GRAND FINALE
  {
    tier: 30,
    xpRequired: 11000,
    isFreeTier: false,
    rewards: [
      {
        tier: 30,
        rewardType: 'exclusive_card',
        description: 'EXCLUSIVE: Mythic DadPass Dad Card',
        icon: '👑',
        claimed: false,
        metadata: { cardId: 'daddypass_exclusive_mythic' },
      },
      {
        tier: 30,
        rewardType: 'premium_pack',
        description: '10 Premium Packs',
        icon: '✨',
        claimed: false,
        metadata: { packCount: 10 },
      },
    ],
  },
];

// ============================================================================
// SECURITY TYPES (US095 - Security - Anti-Cheat)
// ============================================================================

// Re-export security types for convenience
export * from './security';

// ============================================================================
// ADMIN PANEL TYPES (US096 - Admin Panel - Content Management)
// ============================================================================

// Re-export admin types for convenience
export * from './admin';

// ============================================================================
// EMAIL SYSTEM TYPES (US097 - Email System - Notifications)
// ============================================================================

// Re-export email types for convenience
export * from './email';

// ============================================================================
// REFERRAL SYSTEM TYPES (US098 - Referral System - Growth Loop)
// ============================================================================

// Referral code format (similar to friend codes: "REF-XXXX")
export type ReferralCode = string;

// Referral relationship status
export type ReferralStatus = 'pending' | 'active' | 'completed' | 'rewarded';

// Referral relationship (tracks who referred whom)
export interface ReferralRelationship {
  id: string;                      // Unique relationship ID
  referrerId: string;              // Player ID of the referrer
  referredId: string;              // Player ID of the referred player
  referralCode: ReferralCode;      // Code used for referral
  status: ReferralStatus;          // Current status
  createdAt: Date;                 // When referred player joined
  completedAt?: Date;              // When referred player opened 10 packs
  rewardedAt?: Date;               // When referrer received reward
  packsOpened: number;             // Number of packs opened by referred player
}

// Referral reward (5 packs for referrer, 2 packs for referred)
export interface ReferralReward {
  id: string;                      // Unique reward ID
  relationshipId: string;          // Reference to ReferralRelationship
  recipientId: string;             // Player ID receiving reward
  rewardType: 'referrer' | 'referred'; // Type of reward
  packCount: number;               // Number of packs awarded (5 or 2)
  claimed: boolean;                // Whether reward has been claimed
  claimedAt?: Date;                // When reward was claimed
  expiresAt: Date;                 // When reward expires (7 days)
}

// Referral stats for a player
export interface ReferralStats {
  totalReferrals: number;          // Total players referred
  activeReferrals: number;         // Referrals who opened 10+ packs
  pendingReferrals: number;        // Referrals in progress (<10 packs)
  totalRewardsEarned: number;      // Total packs earned from referrals
  totalRewardsClaimed: number;     // Total packs claimed
}

// Referral link configuration
export interface ReferralLink {
  code: ReferralCode;              // Unique referral code
  url: string;                     // Full referral URL
  shareText: string;               // Default text for sharing
  shareImageUrl?: string;          // Optional image for social sharing
}

// Referral leaderboard entry
export interface ReferralLeaderboardEntry {
  playerId: string;                // Player ID
  username: string;                // Username
  pseudonym: string;               // Dad-themed pseudonym
  avatarId: AvatarId;              // Avatar ID
  totalReferrals: number;          // Total referrals
  activeReferrals: number;         // Active referrals (10+ packs)
  rank: number;                    // Leaderboard rank
}

// Referral state for UI
export interface ReferralState {
  myReferralCode: ReferralCode;    // Your unique referral code
  myReferralLink: ReferralLink;    // Your referral link
  referredBy: ReferralRelationship | null; // Who referred you (if any)
  referrals: ReferralRelationship[]; // Players you've referred
  rewards: ReferralReward[];       // Your referral rewards
  stats: ReferralStats;            // Your referral stats
  leaderboard: ReferralLeaderboardEntry[]; // Top referrers
  hasClaimedNewUserBonus: boolean; // Whether you claimed your new user bonus
  newUserRewardClaimed: boolean;   // Whether 2-pack bonus was claimed
}

// Referral configuration
export interface ReferralConfig {
  referrerReward: number;          // Packs awarded to referrer (5)
  referredReward: number;          // Packs awarded to referred player (2)
  packsRequired: number;           // Packs required for reward (10)
  rewardExpirationDays: number;    // Days until reward expires (7)
  leaderboardLimit: number;        // Number of entries on leaderboard (100)
  maxReferralsPerPlayer: number;   // Max referrals to prevent abuse (100)
}

// Default referral configuration
export const DEFAULT_REFERRAL_CONFIG: ReferralConfig = {
  referrerReward: 5,               // 5 packs for referrer
  referredReward: 2,               // 2 packs for referred player
  packsRequired: 10,               // Referred player must open 10 packs
  rewardExpirationDays: 7,         // Rewards expire in 7 days
  leaderboardLimit: 100,           // Top 100 on leaderboard
  maxReferralsPerPlayer: 100,      // Prevent abuse
};

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
