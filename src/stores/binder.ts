import { atom, computed } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type { PackCard } from '../types';

/**
 * BINDER/ALBUM VIEW STORE (PACK-XXX)
 * Manages visual grid-based card organization with:
 * - Multiple binder pages/albums
 * - Empty card slots for collection goals
 * - Favorite/pinned cards
 * - Page layouts and organization
 */

// ============================================================================
// TYPES
// ============================================================================

/** Individual card slot in a binder page */
export interface CardSlot {
  id: string;                    // Unique slot ID
  cardId?: string;               // Card in this slot (undefined = empty)
  card?: PackCard;               // Full card data (denormalized for performance)
  position: number;              // Position in grid (0-based)
  isFavorite: boolean;           // Pinned/favorite status
  notes?: string;                // Optional user notes about this slot
}

/** A single page/album in the binder */
export interface BinderPage {
  id: string;
  name: string;
  description?: string;
  slots: CardSlot[];             // Fixed size grid (default 6x3 = 18 slots)
  columns: number;               // Grid columns (typically 6)
  rows: number;                  // Grid rows (typically 3)
  color?: string;                // Page theme color
  createdAt: Date;
  updatedAt: Date;
}

/** Complete binder state */
export interface BinderState {
  pages: BinderPage[];
  currentPageId: string | null;  // Active page being viewed
  sortMode: 'manual' | 'rarity' | 'type' | 'date'; // How to sort cards
  viewMode: 'grid' | 'list';     // Visual display mode
  favorites: string[];           // Card IDs marked as favorites
}

/** Binder statistics */
export interface BinderStats {
  totalPages: number;
  totalSlots: number;
  filledSlots: number;
  emptySlots: number;
  fillPercentage: number;
  favoriteCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_COLUMNS = 6;
const DEFAULT_ROWS = 3;
const DEFAULT_SLOTS_PER_PAGE = DEFAULT_COLUMNS * DEFAULT_ROWS; // 18

const DEFAULT_BINDER_STATE: BinderState = {
  pages: [
    createDefaultFirstPage()
  ],
  currentPageId: null,
  sortMode: 'manual',
  viewMode: 'grid',
  favorites: []
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Create an empty binder page with default layout */
function createEmptyPage(name: string, columns = DEFAULT_COLUMNS, rows = DEFAULT_ROWS): BinderPage {
  const slots: CardSlot[] = Array.from({ length: columns * rows }, (_, i) => ({
    id: `slot-${Date.now()}-${i}`,
    position: i,
    isFavorite: false
  }));

  return {
    id: `page-${Date.now()}`,
    name,
    slots,
    columns,
    rows,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/** Create the default first page */
function createDefaultFirstPage(): BinderPage {
  return createEmptyPage('My Collection', DEFAULT_COLUMNS, DEFAULT_ROWS);
}

// ============================================================================
// STORES
// ============================================================================

/** Main binder state atom with LocalStorage persistence */
export const binderStore = persistentAtom<BinderState>(
  'daddeck-binder',
  DEFAULT_BINDER_STATE,
  {
    encode: (state) => {
      // Serialize Dates to ISO strings
      const serializable = {
        ...state,
        pages: state.pages.map(page => ({
          ...page,
          createdAt: page.createdAt.toISOString(),
          updatedAt: page.updatedAt.toISOString()
        }))
      };
      return JSON.stringify(serializable);
    },
    decode: (stored) => {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        pages: parsed.pages.map((page: any) => ({
          ...page,
          createdAt: new Date(page.createdAt),
          updatedAt: new Date(page.updatedAt)
        }))
      };
    }
  }
);

// Set first page as current on init
(() => {
  const state = binderStore.get();
  if (state.pages.length > 0 && !state.currentPageId) {
    binderStore.set({
      ...state,
      currentPageId: state.pages[0].id
    });
  }
})();

/** Currently selected page */
export const currentPage = computed(binderStore, (state) => {
  if (!state.currentPageId) return state.pages[0] || null;
  return state.pages.find(p => p.id === state.currentPageId) || null;
});

/** Statistics about current page */
export const currentPageStats = computed(currentPage, (page) => {
  if (!page) return null;

  const filledSlots = page.slots.filter(s => s.cardId).length;
  const emptySlots = page.slots.length - filledSlots;

  return {
    filledSlots,
    emptySlots,
    totalSlots: page.slots.length,
    fillPercentage: Math.round((filledSlots / page.slots.length) * 100)
  };
});

/** Overall binder statistics */
export const binderStats = computed(binderStore, (state) => {
  const stats: BinderStats = {
    totalPages: state.pages.length,
    totalSlots: 0,
    filledSlots: 0,
    emptySlots: 0,
    fillPercentage: 0,
    favoriteCount: state.favorites.length
  };

  for (const page of state.pages) {
    stats.totalSlots += page.slots.length;
    const filled = page.slots.filter(s => s.cardId).length;
    stats.filledSlots += filled;
    stats.emptySlots += page.slots.length - filled;
  }

  stats.fillPercentage = stats.totalSlots > 0 
    ? Math.round((stats.filledSlots / stats.totalSlots) * 100)
    : 0;

  return stats;
});

// ============================================================================
// PAGE MANAGEMENT
// ============================================================================

/** Create a new binder page */
export function createPage(name: string, columns = DEFAULT_COLUMNS, rows = DEFAULT_ROWS): BinderPage {
  const page = createEmptyPage(name, columns, rows);
  const state = binderStore.get();

  binderStore.set({
    ...state,
    pages: [...state.pages, page]
  });

  return page;
}

/** Delete a binder page */
export function deletePage(pageId: string): boolean {
  const state = binderStore.get();
  const newPages = state.pages.filter(p => p.id !== pageId);

  if (newPages.length === 0) {
    // Always keep at least one page
    return false;
  }

  const newCurrentPageId = state.currentPageId === pageId
    ? newPages[0].id
    : state.currentPageId;

  binderStore.set({
    ...state,
    pages: newPages,
    currentPageId: newCurrentPageId
  });

  return true;
}

/** Rename a binder page */
export function renamePage(pageId: string, newName: string): boolean {
  const state = binderStore.get();
  const page = state.pages.find(p => p.id === pageId);

  if (!page) return false;

  page.name = newName;
  page.updatedAt = new Date();

  binderStore.set({ ...state });
  return true;
}

/** Set the current active page */
export function setCurrentPage(pageId: string): boolean {
  const state = binderStore.get();
  const page = state.pages.find(p => p.id === pageId);

  if (!page) return false;

  binderStore.set({
    ...state,
    currentPageId: pageId
  });

  return true;
}

// ============================================================================
// CARD SLOT MANAGEMENT
// ============================================================================

/** Add a card to a specific slot */
export function addCardToSlot(pageId: string, slotId: string, card: PackCard): boolean {
  const state = binderStore.get();
  const page = state.pages.find(p => p.id === pageId);

  if (!page) return false;

  const slot = page.slots.find(s => s.id === slotId);
  if (!slot) return false;

  slot.cardId = card.id;
  slot.card = card;
  slot.updatedAt = new Date();

  // Add to favorites if not already there
  if (!state.favorites.includes(card.id)) {
    state.favorites.push(card.id);
  }

  page.updatedAt = new Date();
  binderStore.set({ ...state });

  return true;
}

/** Remove a card from a slot */
export function removeCardFromSlot(pageId: string, slotId: string): boolean {
  const state = binderStore.get();
  const page = state.pages.find(p => p.id === pageId);

  if (!page) return false;

  const slot = page.slots.find(s => s.id === slotId);
  if (!slot) return false;

  slot.cardId = undefined;
  slot.card = undefined;
  slot.isFavorite = false;

  page.updatedAt = new Date();
  binderStore.set({ ...state });

  return true;
}

/** Move a card between slots */
export function moveCard(pageId: string, fromSlotId: string, toSlotId: string): boolean {
  const state = binderStore.get();
  const page = state.pages.find(p => p.id === pageId);

  if (!page) return false;

  const fromSlot = page.slots.find(s => s.id === fromSlotId);
  const toSlot = page.slots.find(s => s.id === toSlotId);

  if (!fromSlot || !toSlot) return false;

  // Swap or move
  const fromCard = fromSlot.card;
  fromSlot.card = toSlot.card;
  fromSlot.cardId = toSlot.cardId;

  toSlot.card = fromCard;
  toSlot.cardId = fromCard?.id;

  page.updatedAt = new Date();
  binderStore.set({ ...state });

  return true;
}

// ============================================================================
// FAVORITE MANAGEMENT
// ============================================================================

/** Toggle favorite status for a card */
export function toggleFavorite(pageId: string, slotId: string): boolean {
  const state = binderStore.get();
  const page = state.pages.find(p => p.id === pageId);

  if (!page) return false;

  const slot = page.slots.find(s => s.id === slotId);
  if (!slot || !slot.card) return false;

  const cardId = slot.card.id;
  slot.isFavorite = !slot.isFavorite;

  if (slot.isFavorite && !state.favorites.includes(cardId)) {
    state.favorites.push(cardId);
  } else if (!slot.isFavorite && state.favorites.includes(cardId)) {
    state.favorites = state.favorites.filter(id => id !== cardId);
  }

  page.updatedAt = new Date();
  binderStore.set({ ...state });

  return true;
}

/** Get all favorite cards across all pages */
export function getFavoriteCards(): PackCard[] {
  const state = binderStore.get();
  const favorites: PackCard[] = [];

  for (const page of state.pages) {
    for (const slot of page.slots) {
      if (slot.isFavorite && slot.card) {
        favorites.push(slot.card);
      }
    }
  }

  return favorites;
}

// ============================================================================
// SORTING & FILTERING
// ============================================================================

/** Change the sort mode for cards */
export function setSortMode(mode: 'manual' | 'rarity' | 'type' | 'date'): void {
  const state = binderStore.get();
  binderStore.set({
    ...state,
    sortMode: mode
  });
}

/** Change the view mode */
export function setViewMode(mode: 'grid' | 'list'): void {
  const state = binderStore.get();
  binderStore.set({
    ...state,
    viewMode: mode
  });
}

// ============================================================================
// IMPORT/EXPORT
// ============================================================================

/** Export binder state as JSON */
export function exportBinder(): string {
  const state = binderStore.get();
  return JSON.stringify(state, null, 2);
}

/** Import binder state from JSON */
export function importBinder(jsonData: string): boolean {
  try {
    const state = JSON.parse(jsonData) as BinderState;

    // Validate structure
    if (!state.pages || !Array.isArray(state.pages)) {
      return false;
    }

    const normalizedState: BinderState = {
      ...state,
      pages: state.pages.map((page) => ({
        ...page,
        createdAt: page.createdAt ? new Date(page.createdAt) : new Date(),
        updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date()
      }))
    };

    binderStore.set(normalizedState);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/** Get empty slots in a page */
export function getEmptySlots(pageId: string): CardSlot[] {
  const state = binderStore.get();
  const page = state.pages.find(p => p.id === pageId);

  if (!page) return [];

  return page.slots.filter(s => !s.cardId);
}

/** Get filled slots in a page */
export function getFilledSlots(pageId: string): CardSlot[] {
  const state = binderStore.get();
  const page = state.pages.find(p => p.id === pageId);

  if (!page) return [];

  return page.slots.filter(s => s.cardId);
}

/** Get all cards in binder */
export function getAllBinderCards(): PackCard[] {
  const state = binderStore.get();
  const cards: PackCard[] = [];

  for (const page of state.pages) {
    for (const slot of page.slots) {
      if (slot.card) {
        cards.push(slot.card);
      }
    }
  }

  return cards;
}
