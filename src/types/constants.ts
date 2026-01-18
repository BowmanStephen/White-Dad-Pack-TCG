import type { Rarity, DadType, HoloVariant, CardStats } from './card';
import type { SeasonId } from './season';

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
}

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
