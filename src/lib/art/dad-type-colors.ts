import type { DadType } from '../../types';

/**
 * Color palettes for each dad type
 * Each palette has primary, secondary, and accent colors for generative art
 */
export interface DadTypePalette {
  primary: string;      // Main color
  secondary: string;    // Secondary color
  accent: string;       // Highlight color
  background: string;   // Background gradient
}

/**
 * Color mapping for all dad types
 * Colors are themed to match the dad archetype
 */
export const DAD_TYPE_COLORS: Record<DadType, DadTypePalette> = {
  BBQ_DAD: {
    primary: '#ef4444',      // Red
    secondary: '#f97316',    // Orange
    accent: '#fbbf24',       // Yellow
    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
  },
  FIX_IT_DAD: {
    primary: '#6366f1',      // Indigo
    secondary: '#8b5cf6',    // Purple
    accent: '#fbbf24',       // Yellow (tool handle)
    background: 'linear-gradient(135deg, #312e81 0%, #3730a3 50%, #312e81 100%)',
  },
  GOLF_DAD: {
    primary: '#22c55e',      // Green
    secondary: '#84cc16',    // Lime
    accent: '#fbbf24',       // Yellow (golf ball)
    background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #14532d 100%)',
  },
  COUCH_DAD: {
    primary: '#3b82f6',      // Blue
    secondary: '#6366f1',    // Indigo
    accent: '#8b5cf6',       // Purple (screen glow)
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
  },
  LAWN_DAD: {
    primary: '#22c55e',      // Green
    secondary: '#16a34a',    // Dark green
    accent: '#84cc16',       // Lime
    background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #14532d 100%)',
  },
  CAR_DAD: {
    primary: '#64748b',      // Slate
    secondary: '#94a3b8',    // Light slate
    accent: '#ef4444',       // Red (taillights)
    background: 'linear-gradient(135deg, #334155 0%, #475569 50%, #334155 100%)',
  },
  OFFICE_DAD: {
    primary: '#6366f1',      // Indigo
    secondary: '#8b5cf6',    // Purple
    accent: '#ec4899',       // Pink (tie)
    background: 'linear-gradient(135deg, #312e81 0%, #3730a3 50%, #312e81 100%)',
  },
  COOL_DAD: {
    primary: '#8b5cf6',      // Purple
    secondary: '#ec4899',    // Pink
    accent: '#f97316',       // Orange (sunset)
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #581c87 100%)',
  },
  COACH_DAD: {
    primary: '#f97316',      // Orange
    secondary: '#ef4444',    // Red
    accent: '#fbbf24',       // Yellow (whistle)
    background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 50%, #9a3412 100%)',
  },
  CHEF_DAD: {
    primary: '#ffffff',      // White (apron)
    secondary: '#fbbf24',    // Yellow
    accent: '#ef4444',       // Red (tomato)
    background: 'linear-gradient(135deg, #78716c 0%, #a8a29e 50%, #78716c 100%)',
  },
  HOLIDAY_DAD: {
    primary: '#ef4444',      // Red
    secondary: '#22c55e',    // Green
    accent: '#fbbf24',       // Yellow (lights)
    background: 'linear-gradient(135deg, #7f1d1d 0%, #14532d 50%, #7f1d1d 100%)',
  },
  WAREHOUSE_DAD: {
    primary: '#f97316',      // Orange (Costco)
    secondary: '#fbbf24',    // Yellow
    accent: '#ef4444',       // Red
    background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 50%, #9a3412 100%)',
  },
  VINTAGE_DAD: {
    primary: '#a8a29e',      // Stone
    secondary: '#78716c',    // Warm stone
    accent: '#fbbf24',       // Gold (vinyl)
    background: 'linear-gradient(135deg, #57534e 0%, #78716c 50%, #57534e 100%)',
  },
  FASHION_DAD: {
    primary: '#ec4899',      // Pink
    secondary: '#f472b6',    // Light pink
    accent: '#8b5cf6',       // Purple (socks)
    background: 'linear-gradient(135deg, #831843 0%, #9d174d 50%, #831843 100%)',
  },
  TECH_DAD: {
    primary: '#06b6d4',      // Cyan
    secondary: '#3b82f6',    // Blue
    accent: '#22d3ee',       // Light cyan (LED)
    background: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #164e63 100%)',
  },
  ITEM: {
    primary: '#64748b',      // Slate
    secondary: '#94a3b8',    // Light slate
    accent: '#fbbf24',       // Gold (legendary)
    background: 'linear-gradient(135deg, #334155 0%, #475569 50%, #334155 100%)',
  },
};

/**
 * Get the color palette for a dad type
 */
export function getDadTypeColors(type: DadType): DadTypePalette {
  return DAD_TYPE_COLORS[type];
}
