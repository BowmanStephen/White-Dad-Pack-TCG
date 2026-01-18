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
  // Special Card Types
  ITEM: {
    primary: '#64748b',      // Slate
    secondary: '#94a3b8',    // Light slate
    accent: '#fbbf24',       // Gold (legendary)
    background: 'linear-gradient(135deg, #334155 0%, #475569 50%, #334155 100%)',
  },
  EVENT: {
    primary: '#f97316',      // Orange (action)
    secondary: '#ef4444',    // Red
    accent: '#fbbf24',       // Yellow (impact)
    background: 'linear-gradient(135deg, #c2410c 0%, #f97316 50%, #c2410c 100%)',
  },
  TERRAIN: {
    primary: '#22c55e',      // Green (nature)
    secondary: '#16a34a',    // Dark green
    accent: '#fbbf24',       // Yellow (sun)
    background: 'linear-gradient(135deg, #14532d 0%, #22c55e 50%, #14532d 100%)',
  },
  EVOLUTION: {
    primary: '#8b5cf6',      // Purple (transformation)
    secondary: '#a855f7',    // Light purple
    accent: '#ec4899',       // Pink (change)
    background: 'linear-gradient(135deg, #581c87 0%, #8b5cf6 50%, #581c87 100%)',
  },
  CURSE: {
    primary: '#dc2626',      // Dark red (negative)
    secondary: '#991b1b',    // Darker red
    accent: '#7c2d12',       // Brown (decay)
    background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #7f1d1d 100%)',
  },
  TRAP: {
    primary: '#64748b',      // Slate (hidden)
    secondary: '#475569',    // Dark slate
    accent: '#ef4444',       // Red (danger)
    background: 'linear-gradient(135deg, #334155 0%, #64748b 50%, #334155 100%)',
  },
  // Backyard Boner Edition (Season 2+ - X-Rated Names)
  BBQ_DICKTATOR: {
    primary: '#ef4444',      // Red
    secondary: '#f97316',    // Orange
    accent: '#fbbf24',       // Yellow
    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
  },
  BBQ_BRAWLER: {
    primary: '#ef4444',      // Red (aggressive)
    secondary: '#dc2626',    // Dark red
    accent: '#f97316',       // Orange (fire)
    background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #991b1b 100%)',
  },
  COUCH_CUMMANDER: {
    primary: '#3b82f6',      // Blue
    secondary: '#6366f1',    // Indigo
    accent: '#8b5cf6',       // Purple (screen glow)
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
  },
  LAWN_LUNATIC: {
    primary: '#22c55e',      // Green
    secondary: '#16a34a',    // Dark green
    accent: '#84cc16',       // Lime
    background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #14532d 100%)',
  },
  FASHION_FUCK: {
    primary: '#ec4899',      // Pink
    secondary: '#f472b6',    // Light pink
    accent: '#8b5cf6',       // Purple (socks)
    background: 'linear-gradient(135deg, #831843 0%, #9d174d 50%, #831843 100%)',
  },
  FIX_IT_FUCKBOY: {
    primary: '#6366f1',      // Indigo
    secondary: '#8b5cf6',    // Purple
    accent: '#fbbf24',       // Yellow (tool handle)
    background: 'linear-gradient(135deg, #312e81 0%, #3730a3 50%, #312e81 100%)',
  },
  GOLF_GONAD: {
    primary: '#22c55e',      // Green
    secondary: '#84cc16',    // Lime
    accent: '#fbbf24',       // Yellow (golf ball)
    background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #14532d 100%)',
  },
  CAR_COCK: {
    primary: '#64748b',      // Slate
    secondary: '#94a3b8',    // Light slate
    accent: '#ef4444',       // Red (taillights)
    background: 'linear-gradient(135deg, #334155 0%, #475569 50%, #334155 100%)',
  },
  OFFICE_ORGASMS: {
    primary: '#6366f1',      // Indigo
    secondary: '#8b5cf6',    // Purple
    accent: '#ec4899',       // Pink (tie)
    background: 'linear-gradient(135deg, #312e81 0%, #3730a3 50%, #312e81 100%)',
  },
  COOL_CUCKS: {
    primary: '#8b5cf6',      // Purple
    secondary: '#ec4899',    // Pink
    accent: '#f97316',       // Orange (sunset)
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #581c87 100%)',
  },
  COACH_CUMSTERS: {
    primary: '#f97316',      // Orange
    secondary: '#ef4444',    // Red
    accent: '#fbbf24',       // Yellow (whistle)
    background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 50%, #9a3412 100%)',
  },
  CHEF_CUMSTERS: {
    primary: '#ffffff',      // White (apron)
    secondary: '#fbbf24',    // Yellow
    accent: '#ef4444',       // Red (tomato)
    background: 'linear-gradient(135deg, #78716c 0%, #a8a29e 50%, #78716c 100%)',
  },
  WAREHOUSE_WANKERS: {
    primary: '#f97316',      // Orange (Costco)
    secondary: '#fbbf24',    // Yellow
    accent: '#ef4444',       // Red
    background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 50%, #9a3412 100%)',
  },
  HOLIDAY_HORNDOGS: {
    primary: '#ef4444',      // Red
    secondary: '#22c55e',    // Green
    accent: '#fbbf24',       // Yellow (lights)
    background: 'linear-gradient(135deg, #7f1d1d 0%, #14532d 50%, #7f1d1d 100%)',
  },
  VINTAGE_VAGABONDS: {
    primary: '#a8a29e',      // Stone
    secondary: '#78716c',    // Warm stone
    accent: '#fbbf24',       // Gold (vinyl)
    background: 'linear-gradient(135deg, #57534e 0%, #78716c 50%, #57534e 100%)',
  },
  TECH_TWATS: {
    primary: '#06b6d4',      // Cyan
    secondary: '#3b82f6',    // Blue
    accent: '#22d3ee',       // Light cyan (LED)
    background: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #164e63 100%)',
  },
  GAMER_GIZZARDS: {
    primary: '#8b5cf6',      // Purple
    secondary: '#3b82f6',    // Blue
    accent: '#22d3ee',       // Cyan (gaming)
    background: 'linear-gradient(135deg, #581c87 0%, #1e40af 50%, #581c87 100%)',
  },
  PREPPER_PENIS: {
    primary: '#78716c',      // Brown (earth tones)
    secondary: '#a8a29e',    // Stone
    accent: '#fbbf24',       // Gold (supplies)
    background: 'linear-gradient(135deg, #57534e 0%, #78716c 50%, #57534e 100%)',
  },
  SUBURBAN_SOCIALITE: {
    primary: '#ec4899',      // Pink (social)
    secondary: '#f472b6',    // Light pink
    accent: '#fbbf24',       // Gold (parties)
    background: 'linear-gradient(135deg, #9d174d 0%, #ec4899 50%, #9d174d 100%)',
  },
  NEIGHBORHOOD_NOSY: {
    primary: '#3b82f6',      // Blue (curiosity)
    secondary: '#60a5fa',    // Light blue
    accent: '#fbbf24',       // Yellow (gossip)
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
  },
  SON_SPAWNS: {
    primary: '#22c55e',      // Green (youth)
    secondary: '#16a34a',    // Dark green
    accent: '#fbbf24',       // Yellow (energy)
    background: 'linear-gradient(135deg, #166534 0%, #22c55e 50%, #166534 100%)',
  },
  DAUGHTER_DINGBATS: {
    primary: '#ec4899',      // Pink
    secondary: '#f472b6',    // Light pink
    accent: '#a855f7',       // Purple (playful)
    background: 'linear-gradient(135deg, #9d174d 0%, #ec4899 50%, #9d174d 100%)',
  },
  UNCLE_UPROARS: {
    primary: '#f97316',      // Orange (chaos)
    secondary: '#ef4444',    // Red
    accent: '#fbbf24',       // Yellow (fun)
    background: 'linear-gradient(135deg, #c2410c 0%, #f97316 50%, #c2410c 100%)',
  },
  SUBURBAN_SIDEKICKS: {
    primary: '#64748b',      // Slate (neutral)
    secondary: '#94a3b8',    // Light slate
    accent: '#22c55e',       // Green (support)
    background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #475569 100%)',
  },
  // Crossover Events
  DUNE_DESERT: {
    primary: '#d97706',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #92400e 100%)',
  },
  MARVEL_MASH: {
    primary: '#dc2626',
    secondary: '#3b82f6',
    accent: '#fbbf24',
    background: 'linear-gradient(135deg, #991b1b 0%, #1e40af 50%, #991b1b 100%)',
  },
  STAR_WARS_SWINGER: {
    primary: '#1e3a8a',
    secondary: '#fbbf24',
    accent: '#22c55e',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
  },
  MCDONALDS_MEAT: {
    primary: '#ef4444',
    secondary: '#fbbf24',
    accent: '#f97316',
    background: 'linear-gradient(135deg, #991b1b 0%, #ef4444 50%, #991b1b 100%)',
  },
  POTTER_PERVERT: {
    primary: '#7c3aed',
    secondary: '#fbbf24',
    accent: '#dc2626',
    background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #4c1d95 100%)',
  },
  FORTNITE_FUCKER: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#22d3ee',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
  },
};

/**
 * Get the color palette for a dad type
 */
export function getDadTypeColors(type: DadType): DadTypePalette {
  return DAD_TYPE_COLORS[type];
}
