// ============================================================================
// DADDECK™ - CONFIGURATION CONSTANTS
// ============================================================================
// Centralized configuration constants moved from src/types/index.ts
// This file contains all const exports for better code organization

import type {
  Rarity,
  DadType,
  HoloVariant,
  CardStats,
  RarityConfig,
  PackDesign,
  SeasonPackDesign,
  AvatarId,
  Avatar,
  BadgeRarity,
  BadgeCategory,
  RankedTier,
  BattleConfig,
  RankedTierConfig,
  PackDesignConfig,
} from '../types/core';

// Sort options for collection
export type SortOption = 'rarity_desc' | 'name_asc' | 'date_obtained_desc';

// ============================================================================
// CORE CONFIGURATION
// ============================================================================

// Rarity order for comparison (common=0, mythic=5)
export const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

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

// Holographic Variant Names
export const HOLO_VARIANT_NAMES: Record<HoloVariant, string> = {
  none: 'None',
  standard: 'Holo',
  reverse: 'Reverse Holo',
  full_art: 'Full Art Holo',
  prismatic: 'Prismatic Holo',
};

// Holographic Variant Icons
export const HOLO_VARIANT_ICONS: Record<HoloVariant, string> = {
  none: '',
  standard: '✨',
  reverse: '🌟',
  full_art: '💫',
  prismatic: '🌈',
};

// ============================================================================
// PACK DESIGN CONFIGURATION (US068 - Pack Designs - Visual Variety)
// ============================================================================

export const PACK_DESIGN_CONFIG: Record<PackDesign, PackDesignConfig> = {
  standard: {
    name: 'Standard Pack',
    description: 'Classic pack design',
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
    accentColor: '#60a5fa',
    borderColor: '#93c5fd',
    gradientStart: '#3b82f6',
    gradientEnd: '#2563eb',
    pattern: 'solid',
    probability: 0.8,
    animationVariant: 'standard',
  },
  holiday: {
    name: 'Holiday Pack',
    description: 'Festive holiday edition',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    accentColor: '#22c55e',
    borderColor: '#f87171',
    gradientStart: '#dc2626',
    gradientEnd: '#991b1b',
    pattern: 'striped',
    probability: 0.05,
    animationVariant: 'festive',
  },
  premium: {
    name: 'Premium Pack',
    description: 'Luxurious premium edition',
    primaryColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    accentColor: '#fcd34d',
    borderColor: '#fde68a',
    gradientStart: '#fbbf24',
    gradientEnd: '#f59e0b',
    pattern: 'metallic',
    probability: 0.15,
    animationVariant: 'golden',
  },
  spring_flings: {
    name: 'Spring Fling Pack',
    description: 'Fresh spring design',
    primaryColor: '#84cc16',
    secondaryColor: '#65a30d',
    accentColor: '#fef08a',
    borderColor: '#a3e635',
    gradientStart: '#84cc16',
    gradientEnd: '#65a30d',
    pattern: 'floral',
    probability: 0.05,
    animationVariant: 'festive',
  },
  summer_bbq: {
    name: 'Summer BBQ Pack',
    description: 'Hot summer edition',
    primaryColor: '#f97316',
    secondaryColor: '#c2410c',
    accentColor: '#fbbf24',
    borderColor: '#fb923c',
    gradientStart: '#f97316',
    gradientEnd: '#c2410c',
    pattern: 'flames',
    probability: 0.05,
    animationVariant: 'standard',
  },
  fall_foliage: {
    name: 'Fall Foliage Pack',
    description: 'Autumn colors edition',
    primaryColor: '#ea580c',
    secondaryColor: '#c2410c',
    accentColor: '#fbbf24',
    borderColor: '#fb923c',
    gradientStart: '#ea580c',
    gradientEnd: '#c2410c',
    pattern: 'leaves',
    probability: 0.05,
    animationVariant: 'standard',
  },
  winter_wonderland: {
    name: 'Winter Wonderland Pack',
    description: 'Snowy winter edition',
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
    accentColor: '#e0f2fe',
    borderColor: '#60a5fa',
    gradientStart: '#3b82f6',
    gradientEnd: '#2563eb',
    pattern: 'snowflakes',
    probability: 0.05,
    animationVariant: 'festive',
  },
  anniversary_bash: {
    name: 'Anniversary Bash Pack',
    description: 'Celebration edition',
    primaryColor: '#a855f7',
    secondaryColor: '#7c3aed',
    accentColor: '#f0abfc',
    borderColor: '#c084fc',
    gradientStart: '#a855f7',
    gradientEnd: '#7c3aed',
    pattern: 'confetti',
    probability: 0.05,
    animationVariant: 'golden',
  },
};
