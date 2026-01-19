import type { Rarity, DadType, HoloVariant } from './core';
import type { CardStats } from './card';

// Rarity order for comparison (common=0, mythic=5)
export const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

// Sort options for collection (FILTER-003)
export type SortOption =
  | 'rarity_desc'
  | 'rarity_asc'
  | 'name_asc'
  | 'name_desc'
  | 'date_obtained_desc'
  | 'date_obtained_asc'
  | 'type_asc'
  | 'type_desc';

// Sort option display names and configurations
export const SORT_OPTION_CONFIG: Record<SortOption, { name: string; description: string }> = {
  rarity_desc: { name: 'Rarity', description: 'Rarest first' },
  rarity_asc: { name: 'Rarity', description: 'Common first' },
  name_asc: { name: 'Name', description: 'A to Z' },
  name_desc: { name: 'Name', description: 'Z to A' },
  date_obtained_desc: { name: 'Date Acquired', description: 'Newest first' },
  date_obtained_asc: { name: 'Date Acquired', description: 'Oldest first' },
  type_asc: { name: 'Dad Type', description: 'A to Z' },
  type_desc: { name: 'Dad Type', description: 'Z to A' },
};

// Rarity Configuration (for visual effects)
export interface RarityConfig {
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
  particleCount: number;
  animationIntensity: number;
  particleVelocity: number; // Particle burst velocity in pixels per second (PACK-VFX-001)
  particleSize: number; // Particle size in pixels (PACK-VFX-032)
}

// Rarity configurations map
// Colors updated for WCAG AA compliance (PACK-056)
// - Light mode: darker colors for white text (4.5:1+ contrast)
// - Dark mode: lighter colors for dark backgrounds (4.5:1+ contrast)
export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: {
    name: 'Common',
    color: '#6b7280', // gray-500 (was gray-400) - WCAG AA on white/dark
    borderColor: '#9ca3af', // gray-400 for borders
    glowColor: 'rgba(107, 114, 128, 0.4)', // Increased opacity for visibility
    particleCount: 0,
    animationIntensity: 1,
    particleVelocity: 150, // PACK-VFX-001: 150px/s for common rarity
    particleSize: 4, // PACK-VFX-032: 4px particle size for common rarity
  },
  uncommon: {
    name: 'Uncommon',
    color: '#3b82f6', // blue-500 (was blue-400) - WCAG AA compliant
    borderColor: '#60a5fa', // blue-400 for borders
    glowColor: 'rgba(59, 130, 246, 0.5)', // Increased opacity
    particleCount: 5,
    animationIntensity: 1.2,
    particleVelocity: 175, // PACK-VFX-002: 175px/s for uncommon rarity
    particleSize: 5, // PACK-VFX-032: 5px particle size for uncommon rarity
  },
  rare: {
    name: 'Rare',
    color: '#d97706', // amber-600 (was yellow-400) - WCAG AA on white
    borderColor: '#fbbf24', // yellow-400 for borders
    glowColor: 'rgba(217, 119, 6, 0.6)', // Darker for better contrast
    particleCount: 10,
    animationIntensity: 1.5,
    particleVelocity: 200, // Faster for rare
    particleSize: 6, // PACK-VFX-032: 6px particle size for rare rarity
  },
  epic: {
    name: 'Epic',
    color: '#9333ea', // purple-600 (was purple-500) - WCAG AA compliant
    borderColor: '#a855f7', // purple-500 for borders
    glowColor: 'rgba(147, 51, 234, 0.6)', // Increased opacity
    particleCount: 15,
    animationIntensity: 1.8,
    particleVelocity: 225, // PACK-VFX-004: 225px/s for epic rarity
    particleSize: 7, // PACK-VFX-032: 7px particle size for epic rarity
  },
  legendary: {
    name: 'Legendary',
    color: '#ea580c', // orange-600 (was orange-500) - WCAG AA compliant
    borderColor: '#f97316', // orange-500 for borders
    glowColor: 'rgba(234, 88, 12, 0.7)', // Increased opacity
    particleCount: 25,
    animationIntensity: 2.2,
    particleVelocity: 250, // PACK-VFX-005: 250px/s for legendary rarity
    particleSize: 8, // PACK-VFX-032: 8px particle size for legendary rarity
  },
  mythic: {
    name: 'Mythic',
    color: '#db2777', // pink-600 (was pink-500) - WCAG AA compliant
    borderColor: '#ec4899', // pink-500 for borders
    glowColor: 'rgba(219, 39, 119, 0.8)', // Higher opacity for mythic
    particleCount: 40,
    animationIntensity: 3,
    particleVelocity: 300, // PACK-VFX-006: 300px/s for mythic rarity
    particleSize: 10, // PACK-VFX-032: 10px particle size for mythic rarity
  },
};

// ============================================================================
// RARITY DROP RATES (TOOLTIP-002: Rarity Explanation Tooltips)
// ============================================================================

// Drop rate descriptions for each rarity tier
export const RARITY_DROP_RATES: Record<Rarity, {
  description: string;
  slots: string;
  probability: string;
  note: string;
}> = {
  common: {
    description: 'The most common cards in game',
    slots: 'Slots 1-3 (guaranteed)',
    probability: '100% in first 3 slots',
    note: 'Basic cards with minimal effects'
  },
  uncommon: {
    description: 'Enhanced cards with better stats and minor effects',
    slots: 'Slots 4-5',
    probability: '74% chance per slot',
    note: 'First upgrade from common cards'
  },
  rare: {
    description: 'Powerful cards with strong abilities and particle effects',
    slots: 'Slots 4-6',
    probability: '20% (slots 4-5), 87.9% (slot 6)',
    note: 'Minimum guarantee in slot 6'
  },
  epic: {
    description: 'Premium cards with advanced animations and holo variants',
    slots: 'Slots 4-6',
    probability: '5% (slots 4-5), 10% (slot 6)',
    note: 'Highly sought after for competitive play'
  },
  legendary: {
    description: 'Ultra-rare full-art cards with intense visual effects',
    slots: 'Slots 4-6',
    probability: '0.9% (slots 4-5), 1.99% (slot 6)',
    note: 'Full artwork, maximum particles'
  },
  mythic: {
    description: 'The rarest cards with prismatic holo effects',
    slots: 'Slots 4-6',
    probability: '0.1% (slots 4-5), 0.1% (slot 6)',
    note: '1 in 1,000 cards - extremely rare!'
  }
};

// Holographic variant descriptions
export const HOLO_VARIANT_DESCRIPTIONS: Record<HoloVariant, {
  name: string;
  description: string;
  rarity: string;
  chance: string;
  features: string[];
}> = {
  none: {
    name: 'Non-Holo',
    description: 'Standard card without holographic effects',
    rarity: 'Common',
    chance: '~80% of all cards',
    features: [
      'Standard card finish',
      'No special effects',
      'Base collection value'
    ]
  },
  standard: {
    name: 'Standard Holo',
    description: 'Basic holographic shine on card artwork',
    rarity: 'Uncommon',
    chance: '~15% of all cards',
    features: [
      'Holo shine on artwork area',
      'Subtle sparkle effect',
      'Available on all rarities'
    ]
  },
  reverse: {
    name: 'Reverse Holo',
    description: 'Holographic background with non-holo artwork',
    rarity: 'Rare',
    chance: '~3% of all cards',
    features: [
      'Entire card background is holo',
      'Artwork area remains non-holo',
      'Distinctive crisscross pattern'
    ]
  },
  full_art: {
    name: 'Full Art Holo',
    description: 'Entire card is holographic with extended artwork',
    rarity: 'Legendary+',
    chance: '~1.5% of legendary/mythic cards',
    features: [
      'Full card holographic treatment',
      'Extended artwork covering entire face',
      'Only legendary and mythic rarities'
    ]
  },
  prismatic: {
    name: 'Prismatic Holo',
    description: 'Rainbow prismatic effect - ultimate holo variant',
    rarity: 'Mythic Only',
    chance: '~0.5% of mythic cards',
    features: [
      'Rainbow prismatic effect',
      'Maximum particle intensity',
      'Mythic rarity exclusive'
    ]
  }
};

// Overall holo drop rate
export const HOLO_DROP_RATE = {
  description: 'Approximately 1 in 6 cards will be holographic',
  chance: '16.67%',
  note: 'Applies to all cards regardless of rarity'
};

// Dad Type Display Names
export const DAD_TYPE_NAMES: Record<DadType, string> = {
  // Core Dad Archetypes
  BBQ_DICKTATOR: 'BBQ Dicktator',
  FIX_IT_FUCKBOY: 'Fix-It Fuckboy',
  GOLF_GONAD: 'Golf Gonad',
  COUCH_CUMMANDER: 'Couch Cummander',
  LAWN_LUNATIC: 'Lawn Lunatic',
  CAR_COCK: 'Car Cock',
  OFFICE_ORGASMS: 'Office Orgasms',
  COOL_CUCKS: 'Cool Cucks',
  COACH_CUMSTERS: 'Coach Cumsters',
  CHEF_CUMSTERS: 'Chef Cumsters',
  HOLIDAY_HORNDOGS: 'Holiday Horndogs',
  WAREHOUSE_WANKERS: 'Warehouse Wankers',
  VINTAGE_VAGABONDS: 'Vintage Vagabonds',
  FASHION_FUCK: 'Fashion Fuck',
  TECH_TWATS: 'Tech Twats',
  GAMER_GIZZARDS: 'Gamer Gizzards',
  PREPPER_PENIS: 'Prepper Penis',
  BBQ_BRAWLER: 'BBQ Brawler',
  SUBURBAN_SOCIALITE: 'Suburban Socialite',
  NEIGHBORHOOD_NOSY: 'Neighborhood Nosy',
  // Family Variants
  SON_SPAWNS: 'Son Spawns',
  DAUGHTER_DINGBATS: 'Daughter Dingbats',
  UNCLE_UPROARS: 'Uncle Uproars',
  SUBURBAN_SIDEKICKS: 'Suburban Sidekicks',
  // Special Card Types
  ITEM: 'Item',
  EVENT: 'Event',
  TERRAIN: 'Terrain',
  EVOLUTION: 'Evolution',
  CURSE: 'Curse',
  TRAP: 'Trap',
  // Crossover Events
  DUNE_DESERT: 'Dune Desert',
  MARVEL_MASH: 'Marvel Mash',
  STAR_WARS_SWINGER: 'Star Wars Swinger',
  MCDONALDS_MEAT: 'McDonalds Meat',
  POTTER_PERVERT: 'Potter Pervert',
  FORTNITE_FUCKER: 'Fortnite Fucker',
};

// Dad Type Icons (emoji)
export const DAD_TYPE_ICONS: Record<DadType, string> = {
  // Core Dad Archetypes
  BBQ_DICKTATOR: '🔥',
  FIX_IT_FUCKBOY: '🛠️',
  GOLF_GONAD: '🏌️',
  COUCH_CUMMANDER: '📺',
  LAWN_LUNATIC: '🌱',
  CAR_COCK: '🚗',
  OFFICE_ORGASMS: '👔',
  COOL_CUCKS: '🎸',
  COACH_CUMSTERS: '🎒',
  CHEF_CUMSTERS: '👨‍🍳',
  HOLIDAY_HORNDOGS: '🎄',
  WAREHOUSE_WANKERS: '📦',
  VINTAGE_VAGABONDS: '🔧',
  FASHION_FUCK: '👟',
  TECH_TWATS: '💻',
  GAMER_GIZZARDS: '🎮',
  PREPPER_PENIS: '🛡️',
  BBQ_BRAWLER: '🔥',
  SUBURBAN_SOCIALITE: '👥',
  NEIGHBORHOOD_NOSY: '👀',
  // Family Variants
  SON_SPAWNS: '👦',
  DAUGHTER_DINGBATS: '👧',
  UNCLE_UPROARS: '👨',
  SUBURBAN_SIDEKICKS: '👫',
  // Special Card Types
  ITEM: '🎁',
  EVENT: '⚡',
  TERRAIN: '🏞️',
  EVOLUTION: '✨',
  CURSE: '💀',
  TRAP: '🪤',
  // Crossover Events
  DUNE_DESERT: '🏜️',
  MARVEL_MASH: '🦸',
  STAR_WARS_SWINGER: '⭐',
  MCDONALDS_MEAT: '🍔',
  POTTER_PERVERT: '🧙',
  FORTNITE_FUCKER: '🎯',
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

// Stat Descriptions (for tooltips)
export const STAT_DESCRIPTIONS: Record<keyof CardStats, string> = {
  dadJoke: 'Quality of terrible puns and "groaner" jokes. Higher = worse (and therefore better) jokes.',
  grillSkill: 'BBQ mastery level. Determines success at grilling meats, veggies, and avoiding food poisoning.',
  fixIt: 'Repair capabilities. Covers home repairs, DIY projects, and classic "I\'ll fix it this weekend".',
  napPower: 'Ability to fall asleep anywhere, anytime. Critical for Sunday afternoon couch recharge.',
  remoteControl: 'Channel surfing expertise. Higher values mean faster navigation and better show selection.',
  thermostat: 'Temperature control obsession. The sacred duty of adjusting temp by exactly one degree.',
  sockSandal: 'Fashion confidence in most iconic dad footwear. A bold statement of comfort over style.',
  beerSnob: 'Craft beer knowledge and appreciation. Includes brewery recommendations and proper glassware usage.',
};

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
// DECK BUILDING CONSTANTS
// ============================================================================

export const MIN_DECK_SIZE = 20; // Minimum cards in a deck
export const MAX_DECK_SIZE = 60; // Maximum cards in a deck
export const MAX_DECK_SLOTS = 10; // Maximum number of saved decks
export const MAX_CARD_COUNT = 3; // Maximum copies of a single card in a deck
