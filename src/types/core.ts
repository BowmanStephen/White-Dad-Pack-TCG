// Card Rarity Types
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// Dad Type Categories
// Includes DICKTATOR DADS (archetypes), family variants, side characters,
// special card types (ITEM, EVENT, TERRAIN, EVOLUTION, CURSE, TRAP)
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
  | 'SUBURBAN_SPY'
  | 'GAMER_GIZZARDS'
  | 'PREPPER_PENIS'
  | 'BBQ_BRAWLER'
  | 'SUBURBAN_SOCIALITE'
  | 'NEIGHBORHOOD_NOSY'
  | 'SON_SPAWNS'
  | 'DAUGHTER_DINGBATS'
  | 'UNCLE_UPROARS'
  | 'SUBURBAN_SIDEKICKS'
  | 'ITEM'
  | 'EVENT'      // SHITSHOW SCENARIOS - One-time use cards (inspired by MTG Instants/Sorceries)
  | 'TERRAIN'    // SUBURBAN SHITFIELDS - Permanent battlefield modifiers (inspired by Pokémon Stadium/MTG Lands)
  | 'EVOLUTION'  // MIDLIFE CRISIS MUTATIONS - Upgrades base dads (inspired by Pokémon Evolution)
  | 'CURSE'      // DAD DAMNATIONS - Negative effects on opponents (inspired by MTG Curses/Enchantments)
  | 'TRAP';      // SUBURBAN SUCKERPUNCHES - Face-down triggered effects (inspired by Yu-Gi-Oh! Traps)

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
  created?: Date; // When the collection was first created
  rarityCounts?: Record<Rarity, number>; // Cached rarity counts for performance (US107)
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

// Import configuration constants
import {
  RARITY_CONFIG as RARITY_CONFIG_IMPORT,
  RARITY_ORDER,
  SORT_OPTION_CONFIG,
  DAD_TYPE_NAMES,
  DAD_TYPE_ICONS,
  STAT_NAMES,
  STAT_ICONS,
  HOLO_VARIANT_NAMES,
  HOLO_VARIANT_ICONS,
  PACK_DESIGN_CONFIG,
  type SortOption as SortOptionImport,
} from '../data/configs';

// Re-export constants for backward compatibility
export const RARITY_CONFIG = RARITY_CONFIG_IMPORT;
export { RARITY_ORDER, SORT_OPTION_CONFIG, DAD_TYPE_NAMES, DAD_TYPE_ICONS, STAT_NAMES, STAT_ICONS, HOLO_VARIANT_NAMES, HOLO_VARIANT_ICONS, PACK_DESIGN_CONFIG };
export type { SortOptionImport as SortOption };

// ============================================================================
// SEASON SYSTEM TYPES (US086 - Season System - Content Drops)
// ============================================================================

export type SeasonId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SeasonStatus = 'active' | 'archived' | 'upcoming';

export interface Season {
  id: SeasonId;
  name: string;
  status: SeasonStatus;
  startDate: Date;
  endDate?: Date;
  theme: SeasonTheme;
  newCards: number;          // Number of new cards in this season
  features: string[];        // New features introduced
  packDesigns: SeasonPackDesign[]; // Special pack designs for this season
}

export type SeasonPackDesign =
  | 'spring_flings'
  | 'summer_bbq'
  | 'fall_foliage'
  | 'winter_wonderland'
  | 'anniversary_bash';

export interface SeasonTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  icon: string;
  packDesign: SeasonPackDesign;
}

export interface SeasonLaunchEvent {
  seasonId: SeasonId;
  name: string;
  date: Date;
  description: string;
  rewards: SeasonBonus[];
}

export interface SeasonBonus {
  type: 'boosted_rates' | 'free_packs' | 'exclusive_cards';
  description: string;
  value: number | string;
}

export interface SeasonState {
  currentSeason: SeasonId | null;
  availableSeasons: Season[];
  seasonProgress: Record<SeasonId, number>; // Progress within each season
}

export interface SeasonConfig {
  defaultSeason: SeasonId;
  seasonDuration: number;     // Days in a season
  autoTransition: boolean;    // Auto-archived old seasons
}

// ============================================================================
// PLAYER PROFILE TYPES (US087 - Social System - Player Profiles)
// ============================================================================

export type AvatarId =
  | 'default'
  | 'grillmaster'
  | 'golf_pro'
  | 'couch_potato'
  | 'fix_it_felix'
  | 'lawn_care'
  | 'car_guy'
  | 'office_hero'
  | 'cool_dad'
  | 'coach'
  | 'chef'
  | 'holiday_hero'
  | 'warehouse_worker'
  | 'vintage_collector'
  | 'fashion_icon'
  | 'tech_dad';

export interface Avatar {
  id: AvatarId;
  name: string;
  emoji: string;
  unlockRequirement?: string;
}

export type BadgeRarity = 'bronze' | 'silver' | 'gold' | 'diamond';

export type BadgeCategory = 'collection' | 'trading' | 'social' | 'achievement' | 'seasonal';

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  icon: string;
  requirement: string;
  progress?: number;
  total?: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: AvatarId;
  badges: Badge[];
  bio?: string;
  joinedAt: Date;
  stats: {
    totalPacksOpened: number;
    totalCardsCollected: number;
    uniqueCards: number;
    rarePulls: number;
    holoPulls: number;
  };
}

export interface ProfileSettings {
  showBio: boolean;
  showStats: boolean;
  showBadges: boolean;
  friendRequestsEnabled: boolean;
}

export type ProfileViewMode = 'edit' | 'view';

export interface ProfileState {
  profile: PlayerProfile;
  settings: ProfileSettings;
  viewMode: ProfileViewMode;
}

// ============================================================================
// CARD BATTLE TYPES (US090 - Card Battles - Minigame)
// ============================================================================

export type BattleState =
  | 'idle'
  | 'team_selection'
  | 'battling'
  | 'victory'
  | 'defeat';

export type BattleMode = 'casual' | 'ranked';

export type BattleFormat = '3v3'; // 3 cards vs 3 cards

export type BattleSlot = 1 | 2 | 3;

export interface BattleCard {
  card: PackCard;
  currentHealth: number;
  maxHealth: number;
  position: BattleSlot;
}

export interface BattleTeam {
  playerCards: BattleCard[];
  opponentCards: BattleCard[];
}

export interface BattleResult {
  winner: 'player' | 'opponent';
  turns: number;
  damageDealt: number;
  damageReceived: number;
}

export interface BattleLogEntry {
  turn: number;
  action: string;
  result: string;
  timestamp: Date;
}

export type BattleAction =
  | 'attack'
  | 'defend'
  | 'special'
  | 'heal';

export interface BattleRewards {
  currency: number;
  experience: number;
  cards?: PackCard[];
}

export interface BattleHistoryEntry {
  id: string;
  date: Date;
  mode: BattleMode;
  result: BattleResult;
  deckUsed: string[];
  opponent?: string;
}

export interface RankedSeason {
  id: string;
  startDate: Date;
  endDate: Date;
  tier: RankedTier;
  points: number;
}

export interface PlayerRankedData {
  currentTier: RankedTier;
  points: number;
  wins: number;
  losses: number;
  winRate: number;
}

export type RankedTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'champion'
  | 'legend';

export interface RankedTierConfig {
  name: string;
  icon: string;
  color: string;
  minPoints: number;
  maxPoints: number;
  rewards: BattleRewards;
}

export interface BattleConfig {
  maxHealth: number;
  turnDuration: number;      // Seconds per turn
  surrenderAfter: number;    // Turns before surrender allowed
  rankedSeasonLength: number; // Days
}
