import type { Rarity, DadType } from './core';

// ============================================================================
// WISHLIST TYPES (PACK-020 - Collection Wishlist)
// ============================================================================

// Wishlist priority levels
export type WishlistPriority = 'low' | 'medium' | 'high' | 'urgent';

// Wishlist entry
export interface WishlistEntry {
  cardId: string;                  // Card ID
  cardName: string;                // Card name (for display)
  rarity: Rarity;                 // Card rarity
  type: DadType;                   // Dad type
  priority: WishlistPriority;      // How badly you want it
  reason?: string;                 // Why you want it (optional note)
  addedAt: Date;                   // When added to wishlist
}

// Wishlist state
export interface Wishlist {
  entries: WishlistEntry[];
  lastUpdated: Date;
}

// Default wishlist state
export const DEFAULT_WISHLIST: Wishlist = {
  entries: [],
  lastUpdated: new Date(),
};

// Priority order for sorting (urgent first, low last)
export const WISHLIST_PRIORITY_ORDER: Record<WishlistPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};
