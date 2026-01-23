import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isDetailModalOpen,
  detailModalCard,
  openDetailModal,
  closeDetailModal,
} from '@/stores/card-detail-modal';
import type { PackCard } from '@/types';

/**
 * Card Detail Modal Store Test Suite
 *
 * Tests collection-specific card detail modal functionality including:
 * - Open/close state management
 * - Card data handling
 * - Body scroll prevention
 */

// Create mock PackCard for testing
function createMockCard(id: string, name: string): PackCard {
  return {
    id,
    name,
    subtitle: 'Test Subtitle',
    type: 'BBQ_DICKTATOR',
    rarity: 'rare',
    artwork: '/test.png',
    stats: {
      dadJoke: 75,
      grillSkill: 80,
      fixIt: 60,
      napPower: 55,
      remoteControl: 70,
      thermostat: 65,
      sockSandal: 45,
      beerSnob: 85,
    },
    flavorText: 'Test flavor text for the card',
    abilities: [
      { name: 'Test Ability', description: 'Test ability description' }
    ],
    series: 1,
    cardNumber: 42,
    totalInSeries: 100,
    artist: 'Test Artist',
    isRevealed: true,
    isHolo: false,
    holoType: 'none',
  };
}

describe('Card Detail Modal Store', () => {
  const mockCard = createMockCard('card-123', 'BBQ Champion Dad');
  const mockCard2 = createMockCard('card-456', 'Lawn Master Dad');

  beforeEach(() => {
    // Reset stores to initial state
    isDetailModalOpen.set(false);
    detailModalCard.set(null);
    
    // Reset document.body.style.overflow (happy-dom provides this)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  });

  describe('Initial State', () => {
    it('should start with modal closed', () => {
      expect(isDetailModalOpen.get()).toBe(false);
    });

    it('should start with no card selected', () => {
      expect(detailModalCard.get()).toBeNull();
    });
  });

  describe('openDetailModal()', () => {
    it('should open modal with specified card', () => {
      openDetailModal(mockCard);
      
      expect(isDetailModalOpen.get()).toBe(true);
      expect(detailModalCard.get()).toEqual(mockCard);
    });

    it('should set card data correctly', () => {
      openDetailModal(mockCard);
      
      const card = detailModalCard.get();
      expect(card?.id).toBe('card-123');
      expect(card?.name).toBe('BBQ Champion Dad');
      expect(card?.rarity).toBe('rare');
    });

    it('should prevent body scroll when opened', () => {
      openDetailModal(mockCard);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should replace previous card when opening with new card', () => {
      openDetailModal(mockCard);
      expect(detailModalCard.get()?.id).toBe('card-123');
      
      openDetailModal(mockCard2);
      expect(detailModalCard.get()?.id).toBe('card-456');
    });
  });

  describe('closeDetailModal()', () => {
    it('should close modal and clear card', () => {
      openDetailModal(mockCard);
      
      closeDetailModal();
      
      expect(isDetailModalOpen.get()).toBe(false);
      expect(detailModalCard.get()).toBeNull();
    });

    it('should restore body scroll when closed', () => {
      openDetailModal(mockCard);
      expect(document.body.style.overflow).toBe('hidden');
      
      closeDetailModal();
      
      expect(document.body.style.overflow).toBe('');
    });

    it('should be safe to call when already closed', () => {
      expect(isDetailModalOpen.get()).toBe(false);
      
      expect(() => closeDetailModal()).not.toThrow();
      
      expect(isDetailModalOpen.get()).toBe(false);
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when modal opens', () => {
      let callCount = 0;
      const unsubscribe = isDetailModalOpen.subscribe(() => {
        callCount++;
      });

      openDetailModal(mockCard);

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify subscribers when modal closes', () => {
      openDetailModal(mockCard);
      
      let callCount = 0;
      const unsubscribe = isDetailModalOpen.subscribe(() => {
        callCount++;
      });

      closeDetailModal();

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify subscribers when card changes', () => {
      let callCount = 0;
      const unsubscribe = detailModalCard.subscribe(() => {
        callCount++;
      });

      openDetailModal(mockCard);

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should update subscribers with correct card data', () => {
      let lastCard: PackCard | null = null;
      const unsubscribe = detailModalCard.subscribe((card) => {
        lastCard = card;
      });

      openDetailModal(mockCard);
      expect((lastCard as PackCard | null)?.id).toBe('card-123');

      openDetailModal(mockCard2);
      expect((lastCard as PackCard | null)?.id).toBe('card-456');

      closeDetailModal();
      expect(lastCard).toBeNull();

      unsubscribe();
    });
  });

  describe('Card Data Handling', () => {
    it('should preserve all card properties', () => {
      openDetailModal(mockCard);
      
      const card = detailModalCard.get();
      
      expect(card).not.toBeNull();
      expect(card?.id).toBe('card-123');
      expect(card?.name).toBe('BBQ Champion Dad');
      expect(card?.subtitle).toBe('Test Subtitle');
      expect(card?.type).toBe('BBQ_DICKTATOR');
      expect(card?.rarity).toBe('rare');
      expect(card?.artwork).toBe('/test.png');
      expect(card?.flavorText).toBe('Test flavor text for the card');
      expect(card?.series).toBe(1);
      expect(card?.cardNumber).toBe(42);
      expect(card?.totalInSeries).toBe(100);
      expect(card?.artist).toBe('Test Artist');
      expect(card?.isRevealed).toBe(true);
      expect(card?.isHolo).toBe(false);
      expect(card?.holoType).toBe('none');
    });

    it('should preserve card stats', () => {
      openDetailModal(mockCard);
      
      const card = detailModalCard.get();
      
      expect(card?.stats.dadJoke).toBe(75);
      expect(card?.stats.grillSkill).toBe(80);
      expect(card?.stats.fixIt).toBe(60);
      expect(card?.stats.napPower).toBe(55);
      expect(card?.stats.remoteControl).toBe(70);
      expect(card?.stats.thermostat).toBe(65);
      expect(card?.stats.sockSandal).toBe(45);
      expect(card?.stats.beerSnob).toBe(85);
    });

    it('should preserve card abilities', () => {
      openDetailModal(mockCard);
      
      const card = detailModalCard.get();
      
      expect(card?.abilities).toHaveLength(1);
      expect(card?.abilities[0].name).toBe('Test Ability');
      expect(card?.abilities[0].description).toBe('Test ability description');
    });

    it('should handle cards with holo variants', () => {
      const holoCard = createMockCard('holo-card', 'Shiny Dad');
      holoCard.isHolo = true;
      holoCard.holoType = 'prismatic';
      
      openDetailModal(holoCard);
      
      const card = detailModalCard.get();
      expect(card?.isHolo).toBe(true);
      expect(card?.holoType).toBe('prismatic');
    });

    it('should handle cards with different rarities', () => {
      const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;
      
      rarities.forEach(rarity => {
        const card = createMockCard(`${rarity}-card`, `${rarity} Dad`);
        card.rarity = rarity;
        
        openDetailModal(card);
        
        expect(detailModalCard.get()?.rarity).toBe(rarity);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close cycles', () => {
      expect(() => {
        for (let i = 0; i < 20; i++) {
          openDetailModal(mockCard);
          closeDetailModal();
        }
      }).not.toThrow();
      
      expect(isDetailModalOpen.get()).toBe(false);
      expect(detailModalCard.get()).toBeNull();
    });

    it('should handle opening same card multiple times', () => {
      expect(() => {
        openDetailModal(mockCard);
        openDetailModal(mockCard);
        openDetailModal(mockCard);
      }).not.toThrow();
      
      expect(isDetailModalOpen.get()).toBe(true);
      expect(detailModalCard.get()?.id).toBe('card-123');
    });

    it('should handle opening different cards in sequence', () => {
      const cards = [
        createMockCard('card-1', 'Card 1'),
        createMockCard('card-2', 'Card 2'),
        createMockCard('card-3', 'Card 3'),
      ];
      
      cards.forEach((card, index) => {
        openDetailModal(card);
        expect(detailModalCard.get()?.id).toBe(`card-${index + 1}`);
      });
    });

    it('should maintain state after multiple operations', () => {
      openDetailModal(mockCard);
      expect(isDetailModalOpen.get()).toBe(true);
      
      closeDetailModal();
      expect(isDetailModalOpen.get()).toBe(false);
      
      openDetailModal(mockCard2);
      expect(isDetailModalOpen.get()).toBe(true);
      expect(detailModalCard.get()?.id).toBe('card-456');
    });
  });

  describe('Modal State Consistency', () => {
    it('should always have card when modal is open', () => {
      openDetailModal(mockCard);
      
      expect(isDetailModalOpen.get()).toBe(true);
      expect(detailModalCard.get()).not.toBeNull();
    });

    it('should always have null card when modal is closed', () => {
      openDetailModal(mockCard);
      closeDetailModal();
      
      expect(isDetailModalOpen.get()).toBe(false);
      expect(detailModalCard.get()).toBeNull();
    });

    it('should allow manual state reset', () => {
      openDetailModal(mockCard);
      
      // Manual reset (not recommended but should work)
      isDetailModalOpen.set(false);
      detailModalCard.set(null);
      
      expect(isDetailModalOpen.get()).toBe(false);
      expect(detailModalCard.get()).toBeNull();
    });
  });
});
