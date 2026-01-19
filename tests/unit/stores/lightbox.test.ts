import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isLightboxOpen,
  currentCard,
  cardList,
  currentIndex,
  isCardFlipped,
  cardViewMode,
  zoomLevel,
  openLightbox,
  closeLightbox,
  nextCard,
  prevCard,
  goToCard,
  hasNextCard,
  hasPrevCard,
  getProgress,
  toggleCardFlip,
  setCardFlip,
  setCardViewMode,
  setZoomLevel,
  resetCardView,
} from '@/stores/lightbox';
import type { PackCard } from '@/types';

/**
 * Lightbox Store Test Suite
 *
 * Tests full-screen card lightbox functionality including:
 * - Open/close state
 * - Card navigation (prev/next)
 * - Card flip state
 * - View modes (default/3d/zoom)
 * - Zoom levels
 * - Progress tracking
 */

// Create mock PackCard for testing
function createMockCard(id: string, name: string): PackCard {
  return {
    id,
    name,
    subtitle: 'Test Subtitle',
    type: 'BBQ_DICKTATOR',
    rarity: 'common',
    artwork: '/test.png',
    stats: {
      dadJoke: 50,
      grillSkill: 50,
      fixIt: 50,
      napPower: 50,
      remoteControl: 50,
      thermostat: 50,
      sockSandal: 50,
      beerSnob: 50,
    },
    flavorText: 'Test flavor text',
    abilities: [],
    series: 1,
    cardNumber: 1,
    totalInSeries: 10,
    artist: 'Test Artist',
    isRevealed: true,
    isHolo: false,
    holoType: 'none',
  };
}

describe('Lightbox Store', () => {
  const mockCard1 = createMockCard('card-1', 'Test Card 1');
  const mockCard2 = createMockCard('card-2', 'Test Card 2');
  const mockCard3 = createMockCard('card-3', 'Test Card 3');
  const mockCards = [mockCard1, mockCard2, mockCard3];

  beforeEach(() => {
    // Reset stores to initial state
    isLightboxOpen.set(false);
    currentCard.set(null);
    cardList.set([]);
    currentIndex.set(0);
    isCardFlipped.set(false);
    cardViewMode.set('default');
    zoomLevel.set(1);
    
    // Reset document.body.style.overflow (happy-dom provides this)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  });

  describe('Initial State', () => {
    it('should start with lightbox closed', () => {
      expect(isLightboxOpen.get()).toBe(false);
    });

    it('should start with no current card', () => {
      expect(currentCard.get()).toBeNull();
    });

    it('should start with empty card list', () => {
      expect(cardList.get()).toEqual([]);
    });

    it('should start with index at 0', () => {
      expect(currentIndex.get()).toBe(0);
    });

    it('should start with card not flipped', () => {
      expect(isCardFlipped.get()).toBe(false);
    });

    it('should start with default view mode', () => {
      expect(cardViewMode.get()).toBe('default');
    });

    it('should start with zoom level 1', () => {
      expect(zoomLevel.get()).toBe(1);
    });
  });

  describe('openLightbox()', () => {
    it('should open lightbox with card and list', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      expect(isLightboxOpen.get()).toBe(true);
      expect(currentCard.get()).toEqual(mockCard1);
      expect(cardList.get()).toEqual(mockCards);
      expect(currentIndex.get()).toBe(0);
    });

    it('should set correct index when opening', () => {
      openLightbox(mockCard2, mockCards, 1);
      
      expect(currentIndex.get()).toBe(1);
      expect(currentCard.get()).toEqual(mockCard2);
    });

    it('should prevent body scroll when opened', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('closeLightbox()', () => {
    it('should close lightbox and reset state', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      closeLightbox();
      
      expect(isLightboxOpen.get()).toBe(false);
      expect(currentCard.get()).toBeNull();
      expect(cardList.get()).toEqual([]);
      expect(currentIndex.get()).toBe(0);
    });

    it('should reset flip state when closing', () => {
      openLightbox(mockCard1, mockCards, 0);
      isCardFlipped.set(true);
      
      closeLightbox();
      
      expect(isCardFlipped.get()).toBe(false);
    });

    it('should restore body scroll when closed', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      closeLightbox();
      
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('nextCard()', () => {
    it('should navigate to next card', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      nextCard();
      
      expect(currentIndex.get()).toBe(1);
      expect(currentCard.get()).toEqual(mockCard2);
    });

    it('should wrap to first card from last', () => {
      openLightbox(mockCard3, mockCards, 2);
      
      nextCard();
      
      expect(currentIndex.get()).toBe(0);
      expect(currentCard.get()).toEqual(mockCard1);
    });

    it('should do nothing with empty card list', () => {
      cardList.set([]);
      currentIndex.set(0);
      
      nextCard();
      
      expect(currentIndex.get()).toBe(0);
    });
  });

  describe('prevCard()', () => {
    it('should navigate to previous card', () => {
      openLightbox(mockCard2, mockCards, 1);
      
      prevCard();
      
      expect(currentIndex.get()).toBe(0);
      expect(currentCard.get()).toEqual(mockCard1);
    });

    it('should wrap to last card from first', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      prevCard();
      
      expect(currentIndex.get()).toBe(2);
      expect(currentCard.get()).toEqual(mockCard3);
    });

    it('should do nothing with empty card list', () => {
      cardList.set([]);
      currentIndex.set(0);
      
      prevCard();
      
      expect(currentIndex.get()).toBe(0);
    });
  });

  describe('goToCard()', () => {
    it('should jump to specific card by index', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      goToCard(2);
      
      expect(currentIndex.get()).toBe(2);
      expect(currentCard.get()).toEqual(mockCard3);
    });

    it('should not change if index is out of bounds (negative)', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      goToCard(-1);
      
      expect(currentIndex.get()).toBe(0);
      expect(currentCard.get()).toEqual(mockCard1);
    });

    it('should not change if index is out of bounds (too large)', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      goToCard(10);
      
      expect(currentIndex.get()).toBe(0);
      expect(currentCard.get()).toEqual(mockCard1);
    });
  });

  describe('hasNextCard() / hasPrevCard()', () => {
    it('should return true when multiple cards exist', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      expect(hasNextCard()).toBe(true);
      expect(hasPrevCard()).toBe(true);
    });

    it('should return false with single card', () => {
      openLightbox(mockCard1, [mockCard1], 0);
      
      expect(hasNextCard()).toBe(false);
      expect(hasPrevCard()).toBe(false);
    });

    it('should return false with empty list', () => {
      cardList.set([]);
      
      expect(hasNextCard()).toBe(false);
      expect(hasPrevCard()).toBe(false);
    });
  });

  describe('getProgress()', () => {
    it('should return correct progress string', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      expect(getProgress()).toBe('1 of 3');
    });

    it('should update progress when navigating', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      nextCard();
      expect(getProgress()).toBe('2 of 3');
      
      nextCard();
      expect(getProgress()).toBe('3 of 3');
    });

    it('should return "0 of 0" with empty list', () => {
      cardList.set([]);
      
      expect(getProgress()).toBe('0 of 0');
    });
  });

  describe('Card Flip (PACK-036)', () => {
    it('should toggle card flip state', () => {
      expect(isCardFlipped.get()).toBe(false);
      
      toggleCardFlip();
      expect(isCardFlipped.get()).toBe(true);
      
      toggleCardFlip();
      expect(isCardFlipped.get()).toBe(false);
    });

    it('should set card flip state directly', () => {
      setCardFlip(true);
      expect(isCardFlipped.get()).toBe(true);
      
      setCardFlip(false);
      expect(isCardFlipped.get()).toBe(false);
    });
  });

  describe('View Modes (ROUND-3)', () => {
    it('should set view mode to default', () => {
      setCardViewMode('default');
      
      expect(cardViewMode.get()).toBe('default');
    });

    it('should set view mode to 3d', () => {
      setCardViewMode('3d');
      
      expect(cardViewMode.get()).toBe('3d');
    });

    it('should set view mode to zoom', () => {
      setCardViewMode('zoom');
      
      expect(cardViewMode.get()).toBe('zoom');
    });
  });

  describe('Zoom Level (ROUND-3)', () => {
    it('should set zoom level within range', () => {
      setZoomLevel(2);
      
      expect(zoomLevel.get()).toBe(2);
    });

    it('should clamp zoom level to minimum 1', () => {
      setZoomLevel(0.5);
      
      expect(zoomLevel.get()).toBe(1);
    });

    it('should clamp zoom level to maximum 3', () => {
      setZoomLevel(5);
      
      expect(zoomLevel.get()).toBe(3);
    });

    it('should handle edge values', () => {
      setZoomLevel(1);
      expect(zoomLevel.get()).toBe(1);
      
      setZoomLevel(3);
      expect(zoomLevel.get()).toBe(3);
    });
  });

  describe('resetCardView()', () => {
    it('should reset all view settings to defaults', () => {
      setCardViewMode('3d');
      setZoomLevel(2.5);
      setCardFlip(true);
      
      resetCardView();
      
      expect(cardViewMode.get()).toBe('default');
      expect(zoomLevel.get()).toBe(1);
      expect(isCardFlipped.get()).toBe(false);
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when lightbox opens', () => {
      let callCount = 0;
      const unsubscribe = isLightboxOpen.subscribe(() => {
        callCount++;
      });

      openLightbox(mockCard1, mockCards, 0);

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify subscribers when card changes', () => {
      let callCount = 0;
      openLightbox(mockCard1, mockCards, 0);
      
      const unsubscribe = currentCard.subscribe(() => {
        callCount++;
      });

      nextCard();

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify subscribers when index changes', () => {
      let callCount = 0;
      openLightbox(mockCard1, mockCards, 0);
      
      const unsubscribe = currentIndex.subscribe(() => {
        callCount++;
      });

      goToCard(2);

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid navigation without errors', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      expect(() => {
        for (let i = 0; i < 20; i++) {
          nextCard();
          prevCard();
        }
      }).not.toThrow();
    });

    it('should handle opening and closing rapidly', () => {
      expect(() => {
        for (let i = 0; i < 10; i++) {
          openLightbox(mockCard1, mockCards, 0);
          closeLightbox();
        }
      }).not.toThrow();
    });

    it('should maintain state consistency during navigation', () => {
      openLightbox(mockCard1, mockCards, 0);
      
      nextCard();
      expect(currentCard.get()?.id).toBe('card-2');
      
      prevCard();
      expect(currentCard.get()?.id).toBe('card-1');
      
      goToCard(2);
      expect(currentCard.get()?.id).toBe('card-3');
    });

    it('should handle single card navigation gracefully', () => {
      const singleCard = [mockCard1];
      openLightbox(mockCard1, singleCard, 0);
      
      nextCard();
      expect(currentIndex.get()).toBe(0);
      
      prevCard();
      expect(currentIndex.get()).toBe(0);
    });
  });
});
