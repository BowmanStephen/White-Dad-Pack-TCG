// Card Rarity Types
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// Dad Type Categories - Backyard Boner Edition (Season 2+ - X-Rated Names)
export type DadType =
  // Core Dad Archetypes
  | 'BBQ_DICKTATOR'
  | 'FIX_IT_FUCKBOY'
  | 'GOLF_GONAD'
  | 'COUCH_CUMMANDER'
  | 'LAWN_LUNATIC'
  | 'CAR_COCK'
  | 'OFFICE_ORGASMS'
  | 'COOL_CUCKS'
  | 'COACH_CUMSTERS'
  | 'CHEF_CUMSTERS'
  | 'HOLIDAY_HORNDOGS'
  | 'WAREHOUSE_WANKERS'
  | 'VINTAGE_VAGABONDS'
  | 'FASHION_FUCK'
  | 'TECH_TWATS'
  | 'GAMER_GIZZARDS'
  | 'PREPPER_PENIS'
  | 'BBQ_BRAWLER'
  | 'SUBURBAN_SOCIALITE'
  | 'NEIGHBORHOOD_NOSY'
  // Family Variants
  | 'SON_SPAWNS'
  | 'DAUGHTER_DINGBATS'
  | 'UNCLE_UPROARS'
  | 'SUBURBAN_SIDEKICKS'
  // Special Card Types
  | 'ITEM'
  | 'EVENT'      // SHITSHOW SCENARIOS - One-time use cards (inspired by MTG Instants/Sorceries)
  | 'TERRAIN'    // SUBURBAN SHITFIELDS - Permanent battlefield modifiers (inspired by Pokemon Stadium/MTG Lands)
  | 'EVOLUTION'  // MIDLIFE CRISIS MUTATIONS - Upgrades base dads (inspired by Pokemon Evolution)
  | 'CURSE'      // DAD DAMNATIONS - Negative effects on opponents (inspired by MTG Curses/Enchantments)
  | 'TRAP'       // SUBURBAN SUCKERPUNCHES - Face-down triggered effects (inspired by Yu-Gi-Oh! Traps)
  // Crossover Events
  | 'DUNE_DESERT'
  | 'MARVEL_MASH'
  | 'STAR_WARS_SWINGER'
  | 'MCDONALDS_MEAT'
  | 'POTTER_PERVERT'
  | 'FORTNITE_FUCKER';

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
  seasonId?: import('./season').SeasonId;
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

// SeasonId moved to season.ts - import from there if needed
