import { atom } from 'nanostores';
import type { Wishlist, WishlistEntry, WishlistPriority, Card } from '../types';
import { DEFAULT_WISHLIST, WISHLIST_PRIORITY_ORDER } from '../types';
import { createStorageError, logError } from '@/lib/utils/errors';

// ============================================================================
// WISHLIST STORE (LOCALSTORAGE PERSISTENCE)
// ============================================================================

const WISHLIST_STORAGE_KEY = 'daddeck-wishlist';

// Initialize wishlist from LocalStorage
function loadWishlistFromStorage(): Wishlist {
  if (typeof window === 'undefined') {
    return DEFAULT_WISHLIST;
  }

  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_WISHLIST;
    }

    const parsed = JSON.parse(stored) as Wishlist;

    // Validate and migrate data if needed
    if (!parsed.entries || !Array.isArray(parsed.entries)) {
      console.warn('[Wishlist] Invalid data in storage, using default');
      return DEFAULT_WISHLIST;
    }

    // Convert date strings back to Date objects
    parsed.entries = parsed.entries.map((entry: WishlistEntry) => ({
      ...entry,
      addedAt: new Date(entry.addedAt),
    }));

    return parsed;
  } catch (error) {
    console.error('[Wishlist] Failed to load from storage:', error);
    return DEFAULT_WISHLIST;
  }
}

// Wishlist atom
export const wishlist = atom<Wishlist>(loadWishlistFromStorage());

// Save to LocalStorage
function saveWishlistToStorage(wishlist: Wishlist) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error('[Wishlist] Failed to save to storage:', error);
  }
}

// Subscribe to store changes and persist to LocalStorage
if (typeof window !== 'undefined') {
  wishlist.subscribe((value) => {
    saveWishlistToStorage(value);
  });
}

// ============================================================================
// WISHLIST OPERATIONS
// ============================================================================

/**
 * Add a card to the wishlist
 */
export function addToWishlist(
  card: Card,
  priority: WishlistPriority = 'medium',
  reason?: string
): { success: boolean; error?: string } {
  try {
    const current = wishlist.get();

    // Check if card is already in wishlist
    if (current.entries.some((entry) => entry.cardId === card.id)) {
      return {
        success: false,
        error: 'Card is already in your wishlist',
      };
    }

    const newEntry: WishlistEntry = {
      cardId: card.id,
      cardName: card.name,
      rarity: card.rarity,
      type: card.type,
      priority,
      reason,
      addedAt: new Date(),
    };

    wishlist.set({
      ...current,
      entries: [...current.entries, newEntry],
      lastUpdated: new Date(),
    });

    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to add card to wishlist',
      () => addToWishlist(card, priority, reason)
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * Remove a card from the wishlist
 */
export function removeFromWishlist(cardId: string): { success: boolean; error?: string } {
  try {
    const current = wishlist.get();

    const newEntries = current.entries.filter((entry) => entry.cardId !== cardId);

    if (newEntries.length === current.entries.length) {
      return {
        success: false,
        error: 'Card not found in wishlist',
      };
    }

    wishlist.set({
      ...current,
      entries: newEntries,
      lastUpdated: new Date(),
    });

    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to remove card from wishlist',
      () => removeFromWishlist(cardId)
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * Check if a card is in the wishlist
 */
export function isInWishlist(cardId: string): boolean {
  const current = wishlist.get();
  return current.entries.some((entry) => entry.cardId === cardId);
}

/**
 * Get wishlist entry for a card
 */
export function getWishlistEntry(cardId: string): WishlistEntry | undefined {
  const current = wishlist.get();
  return current.entries.find((entry) => entry.cardId === cardId);
}

/**
 * Update wishlist entry priority
 */
export function updateWishlistPriority(
  cardId: string,
  priority: WishlistPriority
): { success: boolean; error?: string } {
  try {
    const current = wishlist.get();

    const entryIndex = current.entries.findIndex((entry) => entry.cardId === cardId);
    if (entryIndex === -1) {
      return {
        success: false,
        error: 'Card not found in wishlist',
      };
    }

    const updatedEntries = [...current.entries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      priority,
    };

    wishlist.set({
      ...current,
      entries: updatedEntries,
      lastUpdated: new Date(),
    });

    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to update wishlist priority',
      () => updateWishlistPriority(cardId, priority)
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * Get sorted wishlist entries (by priority)
 */
export function getSortedWishlist(): WishlistEntry[] {
  const current = wishlist.get();

  return [...current.entries].sort((a, b) => {
    // Sort by priority (urgent first)
    const priorityDiff = WISHLIST_PRIORITY_ORDER[b.priority] - WISHLIST_PRIORITY_ORDER[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Secondary sort by date added (newest first)
    return b.addedAt.getTime() - a.addedAt.getTime();
  });
}

/**
 * Clear the entire wishlist
 */
export function clearWishlist(): { success: boolean; error?: string } {
  try {
    wishlist.set(DEFAULT_WISHLIST);
    return { success: true };
  } catch (error) {
    const storageError = createStorageError(
      error instanceof Error ? error.message : 'Failed to clear wishlist',
      () => clearWishlist()
    );
    logError(storageError, error);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * Get wishlist statistics
 */
export function getWishlistStats() {
  const current = wishlist.get();

  const priorityCounts: Record<WishlistPriority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };

  for (const entry of current.entries) {
    priorityCounts[entry.priority]++;
  }

  return {
    total: current.entries.length,
    priorityCounts,
    lastUpdated: current.lastUpdated,
  };
}
