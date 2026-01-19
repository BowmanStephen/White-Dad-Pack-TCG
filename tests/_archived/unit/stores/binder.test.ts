import { describe, it, expect, beforeEach } from 'vitest';
import {
  binderStore,
  currentPage,
  currentPageStats,
  binderStats,
  createPage,
  deletePage,
  renamePage,
  setCurrentPage,
  addCardToSlot,
  removeCardFromSlot,
  moveCard,
  toggleFavorite,
  getFavoriteCards,
  setSortMode,
  setViewMode,
  exportBinder,
  importBinder,
  getEmptySlots,
  getFilledSlots,
  getAllBinderCards
} from '../../../src/stores/binder';
import type { PackCard } from '../../../src/types';

// Mock card for testing
const mockCard: PackCard = {
  id: 'test-card-001',
  name: 'Test Card',
  subtitle: 'Test Subtitle',
  type: 'BBQ_DAD',
  rarity: 'rare',
  artwork: 'https://example.com/card.png',
  stats: {
    dadJoke: 50,
    grillSkill: 75,
    fixIt: 40,
    napPower: 60,
    remoteControl: 55,
    thermostat: 45,
    sockSandal: 30,
    beerSnob: 65
  },
  flavorText: 'Test flavor text',
  abilities: [],
  series: 1,
  cardNumber: 1,
  totalInSeries: 50,
  artist: 'Test Artist',
  isHolo: false,
  holoType: 'none'
};

const mockCard2: PackCard = {
  ...mockCard,
  id: 'test-card-002',
  name: 'Test Card 2'
};

describe('Binder Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const state = binderStore.get();
    state.pages = [{
      id: 'default-page',
      name: 'My Collection',
      slots: Array.from({ length: 18 }, (_, i) => ({
        id: `slot-${i}`,
        position: i,
        isFavorite: false
      })),
      columns: 6,
      rows: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }];
    state.currentPageId = 'default-page';
    state.favorites = [];
    state.sortMode = 'manual';
    state.viewMode = 'grid';
    binderStore.set(state);
  });

  describe('Page Management', () => {
    it('should create a new binder page', () => {
      const page = createPage('New Page');
      const state = binderStore.get();

      expect(state.pages).toHaveLength(2);
      expect(page.name).toBe('New Page');
      expect(page.slots).toHaveLength(18);
      expect(page.columns).toBe(6);
      expect(page.rows).toBe(3);
    });

    it('should delete a binder page', () => {
      const newPage = createPage('To Delete');
      const state1 = binderStore.get();
      const pageIdToDelete = newPage.id;

      const success = deletePage(pageIdToDelete);
      const state2 = binderStore.get();

      expect(success).toBe(true);
      expect(state2.pages).toHaveLength(1); // Back to 1 page
    });

    it('should prevent deleting the last page', () => {
      const state = binderStore.get();
      const lastPageId = state.pages[0].id;

      const success = deletePage(lastPageId);

      expect(success).toBe(false);
      expect(binderStore.get().pages).toHaveLength(1);
    });

    it('should rename a binder page', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;

      const success = renamePage(pageId, 'Renamed Page');

      expect(success).toBe(true);
      expect(state.pages[0].name).toBe('Renamed Page');
    });

    it('should return false when renaming non-existent page', () => {
      const success = renamePage('non-existent', 'New Name');
      expect(success).toBe(false);
    });

    it('should set current page', () => {
      const newPage = createPage('Second Page');

      const success = setCurrentPage(newPage.id);
      const state = binderStore.get();

      expect(success).toBe(true);
      expect(state.currentPageId).toBe(newPage.id);
      expect(currentPage.get()?.id).toBe(newPage.id);
    });

    it('should return false when setting non-existent page as current', () => {
      const success = setCurrentPage('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('Card Slot Management', () => {
    it('should add card to a slot', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;
      const slotId = state.pages[0].slots[0].id;

      const success = addCardToSlot(pageId, slotId, mockCard);

      expect(success).toBe(true);
      expect(state.pages[0].slots[0].cardId).toBe(mockCard.id);
      expect(state.pages[0].slots[0].card).toEqual(mockCard);
    });

    it('should remove card from a slot', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;
      const slotId = state.pages[0].slots[0].id;

      addCardToSlot(pageId, slotId, mockCard);
      const success = removeCardFromSlot(pageId, slotId);

      expect(success).toBe(true);
      expect(state.pages[0].slots[0].cardId).toBeUndefined();
      expect(state.pages[0].slots[0].card).toBeUndefined();
    });

    it('should move card between slots', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;
      const fromSlotId = state.pages[0].slots[0].id;
      const toSlotId = state.pages[0].slots[1].id;

      addCardToSlot(pageId, fromSlotId, mockCard);
      const success = moveCard(pageId, fromSlotId, toSlotId);

      expect(success).toBe(true);
      expect(state.pages[0].slots[0].cardId).toBeUndefined();
      expect(state.pages[0].slots[1].cardId).toBe(mockCard.id);
    });

    it('should return false when moving from non-existent slot', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;

      const success = moveCard(pageId, 'non-existent', 'other-slot');
      expect(success).toBe(false);
    });
  });

  describe('Favorite Management', () => {
    it('should toggle favorite status', () => {
      const pageId = binderStore.get().pages[0].id;
      const slotId = binderStore.get().pages[0].slots[0].id;

      addCardToSlot(pageId, slotId, mockCard);
      const success1 = toggleFavorite(pageId, slotId);

      expect(success1).toBe(true);
      let state = binderStore.get();
      expect(state.pages[0].slots[0].isFavorite).toBe(true);
      expect(state.favorites).toContain(mockCard.id);

      const success2 = toggleFavorite(pageId, slotId);
      expect(success2).toBe(true);
      state = binderStore.get();
      expect(state.pages[0].slots[0].isFavorite).toBe(false);
      expect(state.favorites).not.toContain(mockCard.id);
    });

    it('should get all favorite cards', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;

      addCardToSlot(pageId, state.pages[0].slots[0].id, mockCard);
      toggleFavorite(pageId, state.pages[0].slots[0].id);

      addCardToSlot(pageId, state.pages[0].slots[1].id, mockCard2);
      toggleFavorite(pageId, state.pages[0].slots[1].id);

      const favorites = getFavoriteCards();

      expect(favorites).toHaveLength(2);
      expect(favorites.map(c => c.id)).toContain(mockCard.id);
      expect(favorites.map(c => c.id)).toContain(mockCard2.id);
    });

    it('should return empty array when no favorites', () => {
      const favorites = getFavoriteCards();
      expect(favorites).toHaveLength(0);
    });
  });

  describe('Sorting & Filtering', () => {
    it('should set sort mode', () => {
      setSortMode('rarity');
      expect(binderStore.get().sortMode).toBe('rarity');

      setSortMode('type');
      expect(binderStore.get().sortMode).toBe('type');
    });

    it('should set view mode', () => {
      setViewMode('list');
      expect(binderStore.get().viewMode).toBe('list');

      setViewMode('grid');
      expect(binderStore.get().viewMode).toBe('grid');
    });
  });

  describe('Import/Export', () => {
    it('should export binder as JSON', () => {
      const json = exportBinder();
      const parsed = JSON.parse(json);

      expect(parsed.pages).toBeDefined();
      expect(parsed.currentPageId).toBeDefined();
      expect(parsed.sortMode).toBeDefined();
    });

    it('should import binder from JSON', () => {
      const state = binderStore.get();
      const originalPageCount = state.pages.length;

      // Add a new page
      createPage('New Page');
      expect(binderStore.get().pages).toHaveLength(originalPageCount + 1);

      // Export and import
      const json = exportBinder();
      const success = importBinder(json);

      expect(success).toBe(true);
      expect(binderStore.get().pages).toHaveLength(originalPageCount + 1);
    });

    it('should return false for invalid JSON', () => {
      const success = importBinder('invalid json');
      expect(success).toBe(false);
    });

    it('should return false for invalid structure', () => {
      const invalidJson = JSON.stringify({ invalid: 'structure' });
      const success = importBinder(invalidJson);
      expect(success).toBe(false);
    });
  });

  describe('Utilities', () => {
    it('should get empty slots', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;

      const emptySlots = getEmptySlots(pageId);
      expect(emptySlots).toHaveLength(18);

      addCardToSlot(pageId, state.pages[0].slots[0].id, mockCard);
      const emptyAfter = getEmptySlots(pageId);
      expect(emptyAfter).toHaveLength(17);
    });

    it('should get filled slots', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;

      let filledSlots = getFilledSlots(pageId);
      expect(filledSlots).toHaveLength(0);

      addCardToSlot(pageId, state.pages[0].slots[0].id, mockCard);
      filledSlots = getFilledSlots(pageId);
      expect(filledSlots).toHaveLength(1);
    });

    it('should get all binder cards', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;

      addCardToSlot(pageId, state.pages[0].slots[0].id, mockCard);
      addCardToSlot(pageId, state.pages[0].slots[1].id, mockCard2);

      const allCards = getAllBinderCards();
      expect(allCards).toHaveLength(2);
      expect(allCards.map(c => c.id)).toContain(mockCard.id);
      expect(allCards.map(c => c.id)).toContain(mockCard2.id);
    });
  });

  describe('Computed Stores', () => {
    it('should compute current page stats', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;

      // Add some cards
      addCardToSlot(pageId, state.pages[0].slots[0].id, mockCard);
      addCardToSlot(pageId, state.pages[0].slots[1].id, mockCard2);

      const stats = currentPageStats.get();

      expect(stats?.filledSlots).toBe(2);
      expect(stats?.emptySlots).toBe(16);
      expect(stats?.totalSlots).toBe(18);
      expect(stats?.fillPercentage).toBe(Math.round((2 / 18) * 100));
    });

    it('should compute binder stats', () => {
      const stats = binderStats.get();

      expect(stats.totalPages).toBe(1);
      expect(stats.totalSlots).toBe(18);
      expect(stats.filledSlots).toBe(0);
      expect(stats.emptySlots).toBe(18);
      expect(stats.fillPercentage).toBe(0);
    });

    it('should update binder stats when adding cards', () => {
      const state = binderStore.get();
      const pageId = state.pages[0].id;

      addCardToSlot(pageId, state.pages[0].slots[0].id, mockCard);

      const stats = binderStats.get();

      expect(stats.filledSlots).toBe(1);
      expect(stats.emptySlots).toBe(17);
      expect(stats.fillPercentage).toBeGreaterThan(0);
    });
  });
});
