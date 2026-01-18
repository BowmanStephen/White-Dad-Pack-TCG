import type { DadType } from '../types/core';

// Legacy DadType names mapped to internal X-rated names (Season 2+)
// This compatibility layer allows legacy data/UI maps to work with new type system
const LEGACY_DAD_TYPE_MAP: Record<string, DadType> = {
  // Legacy Season 1 names → Season 2+ internal names
  BBQ_DAD: 'BBQ_DICKTATOR',
  FIX_IT_DAD: 'FIX_IT_FUCKBOY',
  GOLF_DAD: 'GOLF_GONAD',
  COUCH_DAD: 'COUCH_CUMMANDER',
  LAWN_DAD: 'LAWN_LUNATIC',
  CAR_DAD: 'CAR_COCK',
  OFFICE_DAD: 'OFFICE_ORGASMS',
  COOL_DAD: 'COOL_CUCKS',
  COACH_DAD: 'COACH_CUMSTERS',
  CHEF_DAD: 'CHEF_CUMSTERS',
  HOLIDAY_DAD: 'HOLIDAY_HORNDOGS',
  WAREHOUSE_DAD: 'WAREHOUSE_WANKERS',
  VINTAGE_DAD: 'VINTAGE_VAGABONDS',
  FASHION_DAD: 'FASHION_FUCK',
  TECH_DAD: 'TECH_TWATS',
  // Special card types and variants don't have legacy names
  // Crossover events don't have legacy names
};

/**
 * Normalize a DadType value from legacy or internal name to internal DadType
 * Accepts both legacy names (BBQ_DAD) and internal names (BBQ_DICKTATOR)
 * Returns the internal DadType name
 */
export function normalizeDadType(type: string): DadType {
  // If it's already a valid internal name, return it
  if (LEGACY_DAD_TYPE_MAP[type]) {
    return LEGACY_DAD_TYPE_MAP[type];
  }
  // Otherwise, assume it's already the internal name or a special type
  return type as DadType;
}

/**
 * Check if a string is a legacy DadType name
 */
export function isLegacyDadType(type: string): boolean {
  return type in LEGACY_DAD_TYPE_MAP;
}

// Special card type utilities

const SPECIAL_CARD_TYPES = [
  'ITEM',
  'EVENT',
  'TERRAIN',
  'EVOLUTION',
  'CURSE',
  'TRAP',
] as const;
type SpecialCardType = (typeof SPECIAL_CARD_TYPES)[number];

const SPECIAL_CARD_TYPE_LABELS: Record<SpecialCardType, string> = {
  ITEM: 'Item',
  EVENT: 'Event (Shitshow)',
  TERRAIN: 'Terrain (Suburban Shitfield)',
  EVOLUTION: 'Evolution (Midlife Crisis)',
  CURSE: 'Curse (Damnation)',
  TRAP: 'Trap (Suckerpunch)',
};

const SPECIAL_CARD_TYPE_ICONS: Record<SpecialCardType, string> = {
  ITEM: '🎁',
  EVENT: '💥',
  TERRAIN: '🗺️',
  EVOLUTION: '🔄',
  CURSE: '😱',
  TRAP: '🪤',
};

const SPECIAL_CARD_TYPE_COLORS: Record<SpecialCardType, string> = {
  ITEM: '#3b82f6', // Blue
  EVENT: '#ef4444', // Red
  TERRAIN: '#22c55e', // Green
  EVOLUTION: '#f59e0b', // Amber
  CURSE: '#a855f7', // Purple
  TRAP: '#ec4899', // Pink
};

const SPECIAL_CARD_TYPE_GLOWS: Record<SpecialCardType, string> = {
  ITEM: 'shadow-blue-500/50',
  EVENT: 'shadow-red-500/50',
  TERRAIN: 'shadow-green-500/50',
  EVOLUTION: 'shadow-amber-500/50',
  CURSE: 'shadow-purple-500/50',
  TRAP: 'shadow-pink-500/50',
};

export function isSpecialCardType(type: string): type is SpecialCardType {
  return SPECIAL_CARD_TYPES.includes(type as SpecialCardType);
}

export function getSpecialCardTypeLabel(type: string): string {
  if (isSpecialCardType(type)) {
    return SPECIAL_CARD_TYPE_LABELS[type];
  }
  return type;
}

export function getSpecialCardIcon(type: string): string {
  if (isSpecialCardType(type)) {
    return SPECIAL_CARD_TYPE_ICONS[type];
  }
  return '🎴';
}

export function getSpecialCardBorderColor(type: string): string {
  if (isSpecialCardType(type)) {
    return SPECIAL_CARD_TYPE_COLORS[type];
  }
  return '#9ca3af';
}

export function getSpecialCardGlowClasses(type: string): string {
  if (isSpecialCardType(type)) {
    return SPECIAL_CARD_TYPE_GLOWS[type];
  }
  return 'shadow-gray-500/50';
}

export function hasCardStats(type: string): boolean {
  // EVOLUTION and ITEM cards have stats, others don't
  return type === 'EVOLUTION' || type === 'ITEM';
}
