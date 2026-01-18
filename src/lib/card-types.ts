// Special card type utilities

const SPECIAL_CARD_TYPES = ['ITEM', 'EVENT', 'TERRAIN', 'EVOLUTION', 'CURSE', 'TRAP'] as const;

export function isSpecialCardType(type: string): boolean {
  return SPECIAL_CARD_TYPES.includes(type as any);
}

export function getSpecialCardTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ITEM: 'Item',
    EVENT: 'Event (Shitshow)',
    TERRAIN: 'Terrain (Suburban Shitfield)',
    EVOLUTION: 'Evolution (Midlife Crisis)',
    CURSE: 'Curse (Damnation)',
    TRAP: 'Trap (Suckerpunch)',
  };
  return labels[type] || type;
}

export function getSpecialCardIcon(type: string): string {
  const icons: Record<string, string> = {
    ITEM: '🎁',
    EVENT: '💥',
    TERRAIN: '🗺️',
    EVOLUTION: '🔄',
    CURSE: '😱',
    TRAP: '🪤',
  };
  return icons[type] || '🎴';
}

export function getSpecialCardBorderColor(type: string): string {
  const colors: Record<string, string> = {
    ITEM: '#3b82f6',      // Blue
    EVENT: '#ef4444',     // Red
    TERRAIN: '#22c55e',   // Green
    EVOLUTION: '#f59e0b', // Amber
    CURSE: '#a855f7',     // Purple
    TRAP: '#ec4899',      // Pink
  };
  return colors[type] || '#9ca3af';
}

export function getSpecialCardGlowClasses(type: string): string {
  const glows: Record<string, string> = {
    ITEM: 'shadow-blue-500/50',
    EVENT: 'shadow-red-500/50',
    TERRAIN: 'shadow-green-500/50',
    EVOLUTION: 'shadow-amber-500/50',
    CURSE: 'shadow-purple-500/50',
    TRAP: 'shadow-pink-500/50',
  };
  return glows[type] || 'shadow-gray-500/50';
}

export function hasCardStats(type: string): boolean {
  // EVOLUTION and ITEM cards have stats, others don't
  return type === 'EVOLUTION' || type === 'ITEM';
}
