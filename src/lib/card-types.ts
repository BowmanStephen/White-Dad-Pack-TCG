/**
 * Card Type Utilities and Constants
 * Provides helpers for special card type rendering and display
 */

import type { DadType } from '../types';

export const SPECIAL_CARD_TYPES = ['EVENT', 'TERRAIN', 'EVOLUTION', 'CURSE', 'TRAP', 'ITEM'] as const;

export const STAT_CARD_TYPES = [
  'BBQ_DAD', 'FIX_IT_DAD', 'GOLF_DAD', 'COUCH_DAD', 'LAWN_DAD',
  'CAR_DAD', 'OFFICE_DAD', 'COOL_DAD', 'COACH_DAD', 'CHEF_DAD',
  'HOLIDAY_DAD', 'WAREHOUSE_DAD', 'VINTAGE_DAD', 'FASHION_DAD', 'TECH_DAD',
  'SUBURBAN_SPY', 'GAMER_GIZZARDS', 'PREPPER_PENIS', 'BBQ_BRAWLER',
  'SUBURBAN_SOCIALITE', 'NEIGHBORHOOD_NOSY', 'SON_SPAWNS',
  'DAUGHTER_DINGBATS', 'UNCLE_UPROARS', 'SUBURBAN_SIDEKICKS'
] as const;

/**
 * Check if a card type is a special card type
 */
export function isSpecialCardType(type: string | DadType): type is 'EVENT' | 'TERRAIN' | 'EVOLUTION' | 'CURSE' | 'TRAP' | 'ITEM' {
  return SPECIAL_CARD_TYPES.includes(type as any);
}

/**
 * Check if a card type has stat display
 */
export function hasCardStats(type: string | DadType): boolean {
  return !isSpecialCardType(type) || type === 'EVOLUTION' || type === 'ITEM';
}

/**
 * Get readable label for special card type
 */
export function getSpecialCardTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    EVENT: 'Shitshow Scenario',
    TERRAIN: 'Suburban Shitfield',
    EVOLUTION: 'Midlife Crisis Mutation',
    CURSE: 'Dad Damnation',
    TRAP: 'Suburban Suckerpunch',
    ITEM: 'Gear & Equipment',
  };
  return labels[type] || type;
}

/**
 * Get emoji icon for special card type
 */
export function getSpecialCardIcon(type: string): string {
  const icons: Record<string, string> = {
    EVENT: '⚡',
    TERRAIN: '🏘️',
    EVOLUTION: '🔄',
    CURSE: '💀',
    TRAP: '🪤',
    ITEM: '🎁',
  };
  return icons[type] || '';
}

/**
 * Get border color for special card type
 */
export function getSpecialCardBorderColor(type: string): string {
  const colors: Record<string, string> = {
    EVENT: '#fbbf24',      // Amber
    TERRAIN: '#34d399',    // Emerald
    EVOLUTION: '#a78bfa',  // Purple
    CURSE: '#f87171',      // Red
    TRAP: '#60a5fa',       // Blue
    ITEM: '#f97316',       // Orange
  };
  return colors[type] || '';
}

/**
 * Get glow effect for special card type (Tailwind classes)
 */
export function getSpecialCardGlowClasses(type: string): string {
  const glows: Record<string, string> = {
    EVENT: 'shadow-amber-500/50 border-amber-400',
    TERRAIN: 'shadow-emerald-500/50 border-emerald-400',
    EVOLUTION: 'shadow-purple-500/50 border-purple-400',
    CURSE: 'shadow-red-500/50 border-red-400',
    TRAP: 'shadow-blue-500/50 border-blue-400',
    ITEM: 'shadow-orange-500/50 border-orange-400',
  };
  return glows[type] || '';
}

/**
 * Get animation timing for card reveal (in milliseconds)
 */
export function getCardRevealTiming(type: string): number {
  const timings: Record<string, number> = {
    EVENT: 120,      // Fast - electric/snappy
    TERRAIN: 400,    // Slow - heavy/earthbound
    EVOLUTION: 300,  // Standard + glow
    CURSE: 300,      // Standard + dark
    TRAP: 300,       // Standard + hidden
    ITEM: 250,       // Medium + shimmer
  };
  return timings[type] || 300; // Default 300ms
}

/**
 * Get particle configuration for special card types
 */
export interface ParticleConfig {
  type: string;           // Particle type (spark, dust, glow, smoke, etc)
  count: number;          // Number of particles
  duration: number;       // Duration in ms
  colors: string[];       // Particle colors
  spread: number;         // Spread angle
  velocity: number;       // Initial velocity
}

export function getParticleConfig(cardType: string): ParticleConfig | null {
  const configs: Record<string, ParticleConfig> = {
    EVENT: {
      type: 'spark',
      count: 8,
      duration: 100,
      colors: ['#fbbf24', '#fff', '#fcd34d'],
      spread: 360,
      velocity: 2.5,
    },
    TERRAIN: {
      type: 'dust',
      count: 12,
      duration: 500,
      colors: ['#92400e', '#a16207', '#d97706'],
      spread: 180,
      velocity: 1.2,
    },
    EVOLUTION: {
      type: 'glow',
      count: 15,
      duration: 800,
      colors: ['#a78bfa', '#c084fc', '#e9d5ff'],
      spread: 360,
      velocity: 1.5,
    },
    CURSE: {
      type: 'smoke',
      count: 10,
      duration: 600,
      colors: ['#1f2937', '#374151', '#f87171'],
      spread: 270,
      velocity: 1.0,
    },
    TRAP: {
      type: 'reveal',
      count: 6,
      duration: 300,
      colors: ['#60a5fa', '#3b82f6', '#1e40af'],
      spread: 360,
      velocity: 1.8,
    },
    ITEM: {
      type: 'shimmer',
      count: 8,
      duration: 400,
      colors: ['#fbbf24', '#fff', '#fcd34d'],
      spread: 360,
      velocity: 1.3,
    },
  };
  return configs[cardType] || null;
}

/**
 * Get animation class names for card reveal
 */
export function getRevealAnimationClasses(type: string): string {
  const animations: Record<string, string> = {
    EVENT: 'animate-pulse-spark',
    TERRAIN: 'animate-shake-down',
    EVOLUTION: 'animate-glow-expand',
    CURSE: 'animate-dark-swirl',
    TRAP: 'animate-flip-hidden',
    ITEM: 'animate-shimmer-rotate',
  };
  return animations[type] || 'animate-flip';
}

/**
 * Type guard: is this a card that needs effect display instead of stats?
 */
export function needsEffectDisplay(type: string): boolean {
  return ['EVENT', 'TERRAIN', 'CURSE', 'TRAP'].includes(type);
}

/**
 * Type guard: does this card show equipment bonuses?
 */
export function hasEquipmentBonuses(type: string): boolean {
  return type === 'ITEM';
}

/**
 * Type guard: does this card show base + evolved stats?
 */
export function hasEvolvedStats(type: string): boolean {
  return type === 'EVOLUTION';
}
