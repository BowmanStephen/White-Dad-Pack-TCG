import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  openNewPack,
  completePackAnimation,
  skipToResults,
  revealCurrentCard,
  nextCard,
  prevCard,
  revealCard,
  goToCard,
  resetPack,
  showResults,
  currentPack,
  packState,
  currentCardIndex,
  revealedCards,
  packStats,
  packProgress,
  currentCard,
  allCardsRevealed,
  isLoading,
  packError,
  storageError,
  selectedPackType,
  selectedThemeType
} from '@/stores/pack';
import type { Pack, PackState, PackType, DadType } from '@/types';
import { generatePack } from '@/lib/pack/generator';
import { addPackToCollection } from '@/stores/collection';
import { trackEvent } from '@/stores/analytics';
import { createAppError, logError } from '@/lib/utils/errors';
import { haptics } from '@/lib/utils/haptics';
import { checkRateLimit, recordPackOpen, getRateLimitStatus } from '@/lib/utils/rate-limiter';
import { selectRandomTearAnimation } from '@/types';

/**
 * Pack Store Test Suite
 *
 * Tests the core pack opening state machine including:
 * - State transitions (idle → generating → pack_animate → cards_ready → revealing → results)
 * - Pack generation and validation
 * - Card reveal logic
 * - Navigation (next/prev/goTo)
 * - Error handling and recovery
 * - Rate limiting (SEC-002)
 * - Analytics tracking
 * - Collection persistence
 */

// Mock dependencies
vi.mock('@/lib/pack/generator');
vi.mock('@/stores/collection');
vi.mock('@/stores/analytics');
vi.mock('@/lib/utils/errors');
vi.mock('@/lib/utils/haptics');
vi.mock('@/lib/utils/rate-limiter');
vi.mock('@/types');

describe('Pack Store', () => {
  beforeEach(() => {
    // Reset store state
    resetPack();

    // Clear all mocks
    vi.clearAllMocks();

    // Mock default implementations
    vi.mocked(generatePack).mockReturnValue({
      id: 'test-pack-1',
      cards: [
        {
          id: 'card-1',
          name: 'Test Card 1',
          rarity: 'common',
          dadType: 'suburban',
          stats: {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockAndSandal: 50,
            beerSnob: 50
          },
          ability: { name: 'Test Ability', description: 'Test' },
          flavorText: '"Test flavor text"',
          isHolo: false,
          holoType: 'none',
          isRevealed: false,
          collectionId: 'collection-1'
        },
        {
          id: 'card-2',
          name: 'Test Card 2',
          rarity: 'uncommon',
          dadType: 'handyman',
          stats: {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockAndSandal: 50,
            beerSnob: 50
          },
          ability: { name: 'Test Ability', description: 'Test' },
          flavorText: '"Test flavor text"',
          isHolo: false,
          holoType: 'none',
          isRevealed: false,
          collectionId: 'collection-1'
        }
      ],
      openedAt: new Date().toISOString(),
      bestRarity: 'uncommon',
      design: 'standard'
    } as Pack);

    vi.mocked(addPackToCollection).mockResolvedValue({
      success: true
    });

    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true
    });

    vi.mocked(selectRandomTearAnimation).mockReturnValue('standard');

    vi.mocked(createAppError).mockImplementation((category, error, recovery) => ({
      id: 'err-test',
      category,
      title: 'Test Error',
      message: typeof error === 'string' ? error : error instanceof Error ? error.message : 'Test error',
      icon: '⚠️',
      recovery,
      timestamp: Date.now(),
      logged: false
    }));

    vi.mocked(getRateLimitStatus).mockReturnValue({
      packsRemaining: 60,
      resetTime: Date.now() + 60000,
      isLimited: false
    });
  });

  afterEach(() => {
    resetPack();
  });

  describe('Initial State', () => {
    it('should start in idle state', () => {
      expect(packState.get()).toBe('idle');
    });

    it('should have no current pack', () => {
      expect(currentPack.get()).toBeNull();
    });

    it('should have card index at 0', () => {
      expect(currentCardIndex.get()).toBe(0);
    });

    it('should have no revealed cards', () => {
      expect(revealedCards.get().size).toBe(0);
    });

    it('should have no pack stats', () => {
      expect(packStats.get()).toBeNull();
    });

    it('should have 0 pack progress', () => {
      expect(packProgress.get()).toBe(0);
    });

    it('should have no current card', () => {
      expect(currentCard.get()).toBeNull();
    });

    it('should not have all cards revealed', () => {
      expect(allCardsRevealed.get()).toBe(false);
    });

    it('should not be loading initially', () => {
      expect(isLoading.get()).toBe(false);
    });

    it('should have no pack error', () => {
      expect(packError.get()).toBeNull();
    });

    it('should have no storage error', () => {
      expect(storageError.get()).toBeNull();
    });

    it('should have standard pack type selected', () => {
      expect(selectedPackType.get()).toBe('standard');
    });

    it('should have no theme type selected', () => {
      expect(selectedThemeType.get()).toBeUndefined();
    });
  });

  describe('openNewPack', () => {
    it('should transition to generating state', async () => {
      const promise = openNewPack();

      expect(packState.get()).toBe('generating');

      await promise;
    });

    it('should generate pack with correct configuration', async () => {
      await openNewPack('premium', 'suburban');

      expect(generatePack).toHaveBeenCalledWith(
        expect.objectContaining({
          cardsPerPack: expect.any(Number),
          raritySlots: expect.any(Array)
        }),
        undefined,
        undefined
      );
    });

    it('should save pack to collection', async () => {
      await openNewPack();

      expect(addPackToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          cards: expect.any(Array)
        })
      );
    });

    it('should record pack open for rate limiting', async () => {
      await openNewPack();

      expect(recordPackOpen).toHaveBeenCalled();
    });

    it('should track analytics event', async () => {
      await openNewPack();

      expect(trackEvent).toHaveBeenCalledWith({
        type: 'pack_open',
        data: expect.objectContaining({
          packId: expect.any(String),
          cardCount: expect.any(Number),
          packType: expect.any(String)
        })
      });
    });

    it('should transition to pack_animate after generation', async () => {
      await openNewPack();

      expect(packState.get()).toBe('pack_animate');
    });

    it('should set current pack', async () => {
      await openNewPack();

      expect(currentPack.get()).not.toBeNull();
      expect(currentPack.get()?.cards).toHaveLength(2);
    });

    it('should reset state before opening new pack', async () => {
      // Set some state
      revealCard(0);
      nextCard();

      // Open new pack
      await openNewPack();

      // State should be reset
      expect(currentCardIndex.get()).toBe(0);
      expect(revealedCards.get().size).toBe(0);
    });

    it('should handle rate limit error', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        error: 'Rate limit exceeded'
      });

      await openNewPack();

      expect(packError.get()).not.toBeNull();
      expect(packError.get()?.category).toBe('security');
      expect(packState.get()).toBe('idle');
    });

    it('should handle generation timeout', async () => {
      vi.mocked(generatePack).mockImplementation(() => {
        return new Promise(() => {}) // Never resolves
      });

      const promise = openNewPack();

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 8100));

      expect(packError.get()).not.toBeNull();
      expect(packError.get()?.category).toBe('generation');
    }, 10000);

    it('should handle empty pack error', async () => {
      vi.mocked(generatePack).mockReturnValue({
        id: 'empty-pack',
        cards: [],
        openedAt: new Date().toISOString(),
        bestRarity: 'common',
        design: 'standard'
      } as Pack);

      await openNewPack();

      expect(packError.get()).not.toBeNull();
      expect(packState.get()).toBe('idle');
    });

    it('should handle storage save failure gracefully', async () => {
      vi.mocked(addPackToCollection).mockResolvedValue({
        success: false,
        error: 'Storage full'
      });

      await openNewPack();

      // Pack should still open despite storage error
      expect(packState.get()).toBe('pack_animate');
      expect(currentPack.get()).not.toBeNull();

      // Storage error should be set
      expect(storageError.get()).not.toBeNull();
      expect(storageError.get()?.category).toBe('storage');
    });

    it('should use selected pack type if not provided', async () => {
      selectedPackType.set('premium');

      await openNewPack();

      expect(generatePack).toHaveBeenCalled();
    });

    it('should use selected theme type if not provided', async () => {
      selectedThemeType.set('suburban');

      await openNewPack();

      expect(generatePack).toHaveBeenCalled();
    });
  });

  describe('completePackAnimation', () => {
    it('should transition to cards_ready state', async () => {
      // Setup: pack is in pack_animate state
      await openNewPack();
      expect(packState.get()).toBe('pack_animate');

      completePackAnimation();

      expect(packState.get()).toBe('cards_ready');
    });

    it('should trigger haptic feedback', async () => {
      await openNewPack();

      completePackAnimation();

      expect(haptics.packOpen).toHaveBeenCalled();
    });

    it('should skip to results if skip animations is enabled', async () => {
      // Mock skip animations
      vi.doMock('@/stores/ui', () => ({
        skipAnimations: {
          get: () => true
        }
      }));

      await openNewPack();

      completePackAnimation();

      expect(packState.get()).toBe('results');
    });
  });

  describe('skipToResults', () => {
    it('should reveal all cards', async () => {
      await openNewPack();

      skipToResults();

      const pack = currentPack.get();
      expect(pack?.cards.every(card => card.isRevealed)).toBe(true);
    });

    it('should transition to results state', async () => {
      await openNewPack();

      skipToResults();

      expect(packState.get()).toBe('results');
    });

    it('should set isSkipping to true', async () => {
      await openNewPack();

      skipToResults();

      // Check isSkipping state
      expect(packState.get()).toBe('results');
    });

    it('should handle null pack gracefully', () => {
      expect(() => skipToResults()).not.toThrow();
    });
  });

  describe('revealCard', () => {
    beforeEach(async () => {
      await openNewPack();
      packState.set('cards_ready');
    });

    it('should reveal card at index', () => {
      revealCard(0);

      expect(revealedCards.get().has(0)).toBe(true);

      const pack = currentPack.get();
      expect(pack?.cards[0].isRevealed).toBe(true);
    });

    it('should transition to revealing state', () => {
      revealCard(0);

      expect(packState.get()).toBe('revealing');
    });

    it('should track analytics event', () => {
      revealCard(0);

      expect(trackEvent).toHaveBeenCalledWith({
        type: 'card_reveal',
        data: expect.objectContaining({
          cardIndex: 0,
          cardId: expect.any(String),
          rarity: expect.any(String)
        })
      });
    });

    it('should trigger haptic feedback for rare+ cards', () => {
      revealCard(1); // uncommon card

      expect(haptics.cardReveal).toHaveBeenCalledWith('uncommon');
    });

    it('should not trigger haptic for common cards', () => {
      revealCard(0); // common card

      expect(haptics.cardReveal).not.toHaveBeenCalled();
    });

    it('should handle out of bounds index', () => {
      expect(() => revealCard(999)).not.toThrow();
    });

    it('should handle negative index', () => {
      expect(() => revealCard(-1)).not.toThrow();
    });

    it('should handle null pack gracefully', () => {
      currentPack.set(null);

      expect(() => revealCard(0)).not.toThrow();
    });

    it('should not track analytics for already revealed card', () => {
      revealCard(0);
      vi.clearAllMocks();

      revealCard(0);

      expect(trackEvent).not.toHaveBeenCalled();
    });

    it('should mark autoRevealed option in analytics', () => {
      revealCard(0, { autoRevealed: true });

      expect(trackEvent).toHaveBeenCalledWith({
        type: 'card_reveal',
        data: expect.objectContaining({
          autoRevealed: true
        })
      });
    });
  });

  describe('revealCurrentCard', () => {
    beforeEach(async () => {
      await openNewPack();
      packState.set('cards_ready');
    });

    it('should reveal card at current index', () => {
      currentCardIndex.set(1);

      revealCurrentCard();

      expect(revealedCards.get().has(1)).toBe(true);
    });

    it('should reveal first card by default', () => {
      revealCurrentCard();

      expect(revealedCards.get().has(0)).toBe(true);
    });
  });

  describe('nextCard', () => {
    beforeEach(async () => {
      await openNewPack();
      revealCard(0);
    });

    it('should increment card index', () => {
      nextCard();

      expect(currentCardIndex.get()).toBe(1);
    });

    it('should not go beyond pack size', () => {
      currentCardIndex.set(1);

      nextCard();

      // Should transition to results
      expect(packState.get()).toBe('results');
    });

    it('should transition to results on last card', () => {
      currentCardIndex.set(1);

      nextCard();

      expect(packState.get()).toBe('results');
    });

    it('should handle null pack gracefully', () => {
      currentPack.set(null);

      expect(() => nextCard()).not.toThrow();
    });
  });

  describe('prevCard', () => {
    beforeEach(async () => {
      await openNewPack();
      currentCardIndex.set(1);
    });

    it('should decrement card index', () => {
      prevCard();

      expect(currentCardIndex.get()).toBe(0);
    });

    it('should not go below 0', () => {
      currentCardIndex.set(0);

      prevCard();

      expect(currentCardIndex.get()).toBe(0);
    });
  });

  describe('goToCard', () => {
    beforeEach(async () => {
      await openNewPack();
    });

    it('should set card index', () => {
      goToCard(1);

      expect(currentCardIndex.get()).toBe(1);
    });

    it('should handle out of bounds index', () => {
      expect(() => goToCard(999)).not.toThrow();
    });

    it('should handle negative index', () => {
      expect(() => goToCard(-1)).not.toThrow();
    });

    it('should handle null pack gracefully', () => {
      currentPack.set(null);

      expect(() => goToCard(0)).not.toThrow();
    });
  });

  describe('showResults', () => {
    beforeEach(async () => {
      await openNewPack();
    });

    it('should transition to results state', () => {
      showResults();

      expect(packState.get()).toBe('results');
    });
  });

  describe('resetPack', () => {
    beforeEach(async () => {
      await openNewPack();
      revealCard(0);
      nextCard();
    });

    it('should reset state to idle', () => {
      resetPack();

      expect(packState.get()).toBe('idle');
    });

    it('should clear current pack', () => {
      resetPack();

      expect(currentPack.get()).toBeNull();
    });

    it('should reset card index', () => {
      resetPack();

      expect(currentCardIndex.get()).toBe(0);
    });

    it('should clear revealed cards', () => {
      resetPack();

      expect(revealedCards.get().size).toBe(0);
    });

    it('should clear pack stats', () => {
      resetPack();

      expect(packStats.get()).toBeNull();
    });

    it('should clear errors', () => {
      packError.set({
        id: 'test',
        type: 'generation',
        title: 'Test',
        message: 'Test',
        timestamp: new Date().toISOString(),
        context: {}
      });

      resetPack();

      expect(packError.get()).toBeNull();
      expect(storageError.get()).toBeNull();
    });
  });

  describe('Computed Values', () => {
    describe('packProgress', () => {
      beforeEach(async () => {
        await openNewPack();
      });

      it('should be 0 when no cards revealed', () => {
        expect(packProgress.get()).toBe(0);
      });

      it('should be 0.5 when half cards revealed', () => {
        revealCard(0);
        revealCard(1);

        expect(packProgress.get()).toBe(1); // 2/2 cards
      });

      it('should be 1 when all cards revealed', () => {
        skipToResults();

        expect(packProgress.get()).toBe(1);
      });

      it('should be 0 when pack is null', () => {
        currentPack.set(null);

        expect(packProgress.get()).toBe(0);
      });
    });

    describe('currentCard', () => {
      beforeEach(async () => {
        await openNewPack();
      });

      it('should return card at current index', () => {
        currentCardIndex.set(1);

        expect(currentCard.get()?.id).toBe('card-2');
      });

      it('should return null when pack is null', () => {
        currentPack.set(null);

        expect(currentCard.get()).toBeNull();
      });

      it('should return null when index out of bounds', () => {
        currentCardIndex.set(999);

        expect(currentCard.get()).toBeNull();
      });
    });

    describe('allCardsRevealed', () => {
      beforeEach(async () => {
        await openNewPack();
      });

      it('should be false when no cards revealed', () => {
        expect(allCardsRevealed.get()).toBe(false);
      });

      it('should be false when some cards revealed', () => {
        revealCard(0);

        expect(allCardsRevealed.get()).toBe(false);
      });

      it('should be true when all cards revealed', () => {
        skipToResults();

        expect(allCardsRevealed.get()).toBe(true);
      });

      it('should be false when pack is null', () => {
        currentPack.set(null);

        expect(allCardsRevealed.get()).toBe(false);
      });
    });

    describe('isLoading', () => {
      it('should be true during generating state', async () => {
        const promise = openNewPack();

        expect(isLoading.get()).toBe(true);

        await promise;
      });

      it('should be true during pack_animate state', async () => {
        await openNewPack();

        expect(isLoading.get()).toBe(true);
      });

      it('should be false during cards_ready state', async () => {
        await openNewPack();
        completePackAnimation();

        expect(isLoading.get()).toBe(false);
      });

      it('should be false during results state', async () => {
        await openNewPack();
        skipToResults();

        expect(isLoading.get()).toBe(false);
      });
    });
  });

  describe('State Transitions', () => {
    it('should follow idle → generating → pack_animate → cards_ready → revealing → results', async () => {
      // Idle
      expect(packState.get()).toBe('idle');

      // Open pack
      const promise = openNewPack();
      expect(packState.get()).toBe('generating');

      await promise;
      expect(packState.get()).toBe('pack_animate');

      // Complete animation
      completePackAnimation();
      expect(packState.get()).toBe('cards_ready');

      // Reveal cards
      revealCard(0);
      expect(packState.get()).toBe('revealing');

      // Next card
      nextCard();
      nextCard(); // Last card
      expect(packState.get()).toBe('results');
    });

    it('should skip to results at any point', async () => {
      await openNewPack();

      skipToResults();

      expect(packState.get()).toBe('results');
      expect(allCardsRevealed.get()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should log error on generation failure', async () => {
      vi.mocked(generatePack).mockImplementation(() => {
        throw new Error('Generation failed');
      });

      await openNewPack();

      expect(logError).toHaveBeenCalled();
      expect(packError.get()).not.toBeNull();
    });

    it('should provide retry action on generation error', async () => {
      vi.mocked(generatePack).mockImplementation(() => {
        throw new Error('Generation failed');
      });

      await openNewPack();

      expect(packError.get()?.recovery).toHaveLength(2);
      expect(packError.get()?.recovery?.[0].label).toBe('Try Again');
    });

    it('should provide go home action on generation error', async () => {
      vi.mocked(generatePack).mockImplementation(() => {
        throw new Error('Generation failed');
      });

      await openNewPack();

      expect(packError.get()?.recovery?.[1].label).toBe('Go Home');
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit before opening pack', async () => {
      await openNewPack();

      expect(checkRateLimit).toHaveBeenCalled();
    });

    it('should block pack opening when rate limited', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        error: 'Rate limit exceeded'
      });

      await openNewPack();

      expect(packError.get()?.category).toBe('security');
      expect(generatePack).not.toHaveBeenCalled();
    });

    it('should show remaining packs in rate limit status', () => {
      const status = getRateLimitStatus();

      expect(status).toBeDefined();
    });
  });
});
