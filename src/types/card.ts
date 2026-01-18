// Card Rarity Types
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// Dad Type Categories - Core archetypes only (Season 1)
export type DadType =
  // Core Dad Archetypes
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
  // Special Card Type
  | 'ITEM';

// Holographic Variant Types
export type HoloVariant = 'none' | 'standard' | 'reverse' | 'full_art' | 'prismatic';

// Cinematic mode enables slower, more dramatic pack opening animations
export type CinematicMode = 'normal' | 'cinematic';

// Cinematic mode configuration
export interface CinematicConfig {
  speedMultiplier: number;
  particleMultiplier: number;
  zoomEnabled: boolean;
  audioEnhanced: boolean;
}

// Card Stats Interface
export interface CardStats {
  dadJoke: number;
  grillSkill: number;
  fixIt: number;
  napPower: number;
  remoteControl: number;
  thermostat: number;
  sockSandal: number;
  beerSnob: number;
}

// Card Ability Interface
export interface CardAbility {
  name: string;
  description: string;
  effects?: CardEffect[];
}

// Card Effect Interface - For special card mechanics
export interface CardEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'draw' | 'discard' | 'control' | 'transform';
  target: 'self' | 'opponent' | 'all' | 'field';
  value: number;
  condition?: string;
  duration?: number;
}

// Card Attribute Interface - For card gameplay attributes
export interface CardAttribute {
  key: string;
  value: number | string | boolean;
  label: string;
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
  seasonId?: SeasonId;
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

// Season identifier - imported from season types
export type SeasonId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
