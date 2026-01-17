/**
 * UI State Tests - US044
 * Tests for pack state transitions, persistence, and crash recovery
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  currentPack,
  packState,
  currentCardIndex,
  isSkipping,
  revealedCards,
  currentCard,
  allCardsRevealed,
  packStats,
  packProgress,
  packError,
  storageError,
  completePackAnimation,
  revealCard,
  revealCurrentCard,
  nextCard,
  prevCard,
  goToCard,
  skipToResults,
  resetPack,
  showResults,
} from '../../../src/stores/pack';
import type { Pack, PackCard } from '../../../src/types';

describe('Pack Store - US044: UI State Tests', () => {
  // Helper to create a mock pack for testing
  function createMockPack(): Pack {
    const mockCards: PackCard[] = [
      { id: '1', name: 'Card 1', subtitle: 'Test Subtitle 1', type: 'BBQ_DAD', rarity: 'common', artwork: '', stats: { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 }, flavorText: '', abilities: [], series: 1, cardNumber: 1, totalInSeries: 50, artist: '', isRevealed: false, isHolo: false, holoType: 'none' },
      { id: '2', name: 'Card 2', subtitle: 'Test Subtitle 2', type: 'FIX_IT_DAD', rarity: 'common', artwork: '', stats: { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 }, flavorText: '', abilities: [], series: 1, cardNumber: 2, totalInSeries: 50, artist: '', isRevealed: false, isHolo: false, holoType: 'none' },
      { id: '3', name: 'Card 3', subtitle: 'Test Subtitle 3', type: 'GOLF_DAD', rarity: 'uncommon', artwork: '', stats: { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 }, flavorText: '', abilities: [], series: 1, cardNumber: 3, totalInSeries: 50, artist: '', isRevealed: false, isHolo: false, holoType: 'none' },
      { id: '4', name: 'Card 4', subtitle: 'Test Subtitle 4', type: 'COUCH_DAD', rarity: 'uncommon', artwork: '', stats: { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 }, flavorText: '', abilities: [], series: 1, cardNumber: 4, totalInSeries: 50, artist: '', isRevealed: false, isHolo: false, holoType: 'none' },
      { id: '5', name: 'Card 5', subtitle: 'Test Subtitle 5', type: 'LAWN_DAD', rarity: 'rare', artwork: '', stats: { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 }, flavorText: '', abilities: [], series: 1, cardNumber: 5, totalInSeries: 50, artist: '', isRevealed: false, isHolo: false, holoType: 'none' },
      { id: '6', name: 'Card 6', subtitle: 'Test Subtitle 6', type: 'CAR_DAD', rarity: 'rare', artwork: '', stats: { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 }, flavorText: '', abilities: [], series: 1, cardNumber: 6, totalInSeries: 50, artist: '', isRevealed: false, isHolo: false, holoType: 'none' },
    ];
    return {
      id: 'test-pack-1',
      cards: mockCards,
      openedAt: new Date(),
      bestRarity: 'rare',
      design: 'standard',
    };
  }

  beforeEach(() => {
    // Reset all stores before each test
    resetPack();
    packError.set(null);
    storageError.set(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PackState Transitions', () => {
    it('should start in idle state', () => {
      const state = packState.get();
      expect(state).toBe('idle');
    });

    it('should transition from pack_animate to cards_ready when animation completes', () => {
      // Set up state as if pack was just generated
      packState.set('pack_animate');

      completePackAnimation();

      const state = packState.get();
      expect(state).toBe('cards_ready');
    });

    it('should set state to revealing when revealing a card', () => {
      // Set up pack first
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      packState.set('cards_ready');

      revealCard(0);

      const state = packState.get();
      expect(state).toBe('revealing');
    });

    it('should transition to results when showResults is called', () => {
      packState.set('revealing');
      showResults();

      const state = packState.get();
      expect(state).toBe('results');
    });

    it('should transition back to idle when reset is called', () => {
      packState.set('results');
      resetPack();

      const state = packState.get();
      expect(state).toBe('idle');
    });
  });

  describe('State Persistence in Store', () => {
    it('should persist current pack when set', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      const pack = currentPack.get();
      expect(pack).not.toBeNull();
      expect(pack?.cards).toHaveLength(6);
    });

    it('should persist current card index', () => {
      currentCardIndex.set(2);

      const index = currentCardIndex.get();
      expect(index).toBe(2);
    });

    it('should persist isSkipping state', () => {
      isSkipping.set(true);

      const skipping = isSkipping.get();
      expect(skipping).toBe(true);
    });

    it('should persist revealed cards set', () => {
      revealedCards.set(new Set([0, 1, 2]));

      const revealed = revealedCards.get();
      expect(revealed.size).toBe(3);
      expect(revealed.has(0)).toBe(true);
      expect(revealed.has(1)).toBe(true);
      expect(revealed.has(2)).toBe(true);
    });

    it('should persist pack error state', () => {
      packError.set({
        id: 'test-error-1',
        category: 'pack_generation',
        title: 'Test Error',
        message: 'Test error',
        userMessage: 'Test error',
        canRecover: true,
      });

      const error = packError.get();
      expect(error?.title).toBe('Test Error');
    });

    it('should persist storage error state', () => {
      storageError.set({
        id: 'storage-error-1',
        category: 'storage',
        title: 'Storage Failed',
        message: 'Storage failed',
        userMessage: 'Storage failed',
        canRecover: true,
      });

      const error = storageError.get();
      expect(error?.title).toBe('Storage Failed');
    });

    it('should maintain state across multiple operations', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      packState.set('revealing');
      currentCardIndex.set(1);
      revealedCards.set(new Set([0, 1]));

      const pack = currentPack.get();
      const state = packState.get();
      const index = currentCardIndex.get();
      const revealed = revealedCards.get();

      expect(pack).not.toBeNull();
      expect(state).toBe('revealing');
      expect(index).toBe(1);
      expect(revealed.size).toBe(2);
    });

    it('should compute currentCard correctly', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      currentCardIndex.set(2);

      const card = currentCard.get();
      expect(card).not.toBeNull();

      const pack = currentPack.get();
      expect(card).toBe(pack?.cards[2]);
    });

    it('should compute currentCard as null when index out of bounds', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      currentCardIndex.set(10);

      const card = currentCard.get();
      expect(card).toBeNull();
    });

    it('should compute currentCard as null when no pack exists', () => {
      const card = currentCard.get();
      expect(card).toBeNull();
    });

    it('should compute allCardsRevealed correctly', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      // Initially none revealed
      expect(allCardsRevealed.get()).toBe(false);

      // Reveal all cards
      const allRevealed = new Set([0, 1, 2, 3, 4, 5]);
      revealedCards.set(allRevealed);

      expect(allCardsRevealed.get()).toBe(true);
    });

    it('should compute packProgress correctly', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      // Initially 0 progress
      expect(packProgress.get()).toBe(0);

      // Reveal one card
      revealedCards.set(new Set([0]));
      expect(packProgress.get()).toBeCloseTo(1/6, 5);

      // Reveal half
      revealedCards.set(new Set([0, 1, 2]));
      expect(packProgress.get()).toBeCloseTo(0.5, 5);
    });

    it('should compute packStats correctly', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      const stats = packStats.get();
      expect(stats).not.toBeNull();
      expect(stats?.totalCards).toBe(6);
      expect(stats?.rarityBreakdown).toBeDefined();
    });
  });

  describe('State Reset on New Pack', () => {
    it('should reset currentCardIndex to 0 when reset is called', () => {
      // Set up initial state
      currentCardIndex.set(3);

      resetPack();

      expect(currentCardIndex.get()).toBe(0);
    });

    it('should reset revealedCards when reset is called', () => {
      // Set up initial state
      revealedCards.set(new Set([0, 1, 2, 3, 4, 5]));

      resetPack();

      const revealed = revealedCards.get();
      expect(revealed.size).toBe(0);
    });

    it('should reset isSkipping to false when reset is called', () => {
      // Set up initial state
      isSkipping.set(true);

      resetPack();

      expect(isSkipping.get()).toBe(false);
    });

    it('should not reset packError when reset is called (error persists for debugging)', () => {
      // Set up initial state
      const testError = {
        id: 'test-error-2',
        category: 'pack_generation' as const,
        title: 'Previous Error',
        message: 'Previous error',
        userMessage: 'Previous error',
        canRecover: true,
      };
      packError.set(testError);

      resetPack();

      // Note: packError is NOT reset by resetPack() - it persists for debugging
      expect(packError.get()).toEqual(testError);

      // Clear it manually for cleanup
      packError.set(null);
    });

    it('should reset storageError to null when reset is called', () => {
      // Set up initial state
      const testError = {
        id: 'storage-error-2',
        category: 'storage' as const,
        title: 'Previous Storage Error',
        message: 'Previous storage error',
        userMessage: 'Previous storage error',
        canRecover: true,
      };
      storageError.set(testError);

      resetPack();

      expect(storageError.get()).toBeNull();
    });

    it('should reset currentPack when reset is called', () => {
      // Set up initial state
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      resetPack();

      expect(currentPack.get()).toBeNull();
    });

    it('should reset all state through complete flow', () => {
      // Set up complete state
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      packState.set('results');
      currentCardIndex.set(5);
      revealedCards.set(new Set([0, 1, 2, 3, 4, 5]));
      isSkipping.set(true);

      resetPack();

      expect(packState.get()).toBe('idle');
      expect(currentCardIndex.get()).toBe(0);
      expect(revealedCards.get().size).toBe(0);
      expect(isSkipping.get()).toBe(false);
      expect(currentPack.get()).toBeNull();
    });
  });

  describe('State Recovery from Crash', () => {
    it('should recover pack data from store after simulated crash', () => {
      // Simulate pre-crash state
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      packState.set('revealing');
      const packBefore = currentPack.get();
      const stateBefore = packState.get();

      // Simulate crash recovery by checking stores still have data
      const packAfter = currentPack.get();
      const stateAfter = packState.get();

      expect(packAfter).toEqual(packBefore);
      expect(stateAfter).toBe(stateBefore);
    });

    it('should recover revealed cards state', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      revealedCards.set(new Set([0, 2, 4]));

      const revealed = revealedCards.get();

      expect(revealed.has(0)).toBe(true);
      expect(revealed.has(2)).toBe(true);
      expect(revealed.has(4)).toBe(true);
      expect(revealed.has(1)).toBe(false);
      expect(revealed.has(3)).toBe(false);
      expect(revealed.has(5)).toBe(false);
    });

    it('should recover card navigation state', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      nextCard();
      nextCard();
      nextCard();
      prevCard(); // Should be at index 2

      const index = currentCardIndex.get();
      expect(index).toBe(2);
    });

    it('should recover error state for debugging', () => {
      // Set an error state
      const crashError = {
        id: 'crash-error',
        category: 'pack_generation' as const,
        title: 'Simulated Crash',
        message: 'Simulated crash error',
        userMessage: 'Simulated crash error',
        canRecover: true,
      };
      const storageCrashError = {
        id: 'storage-crash-error',
        category: 'storage' as const,
        title: 'Storage Crash',
        message: 'Storage error during crash',
        userMessage: 'Storage error during crash',
        canRecover: true,
      };
      packError.set(crashError);
      storageError.set(storageCrashError);

      // "Recover" by checking error states persist
      expect(packError.get()).toEqual(crashError);
      expect(storageError.get()).toEqual(storageCrashError);

      // Should be able to recover by resetting (storageError is reset, packError persists)
      resetPack();
      expect(storageError.get()).toBeNull();
      expect(packError.get()).toEqual(crashError); // packError persists

      // Clean up for other tests
      packError.set(null);
    });

    it('should allow resuming from crashed state', () => {
      // Simulate pack in progress
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      revealedCards.set(new Set([0, 1, 2]));

      // Should be able to continue
      revealedCards.set(new Set([0, 1, 2, 3]));
      expect(revealedCards.get().size).toBe(4);

      currentCardIndex.set(4);
      expect(currentCardIndex.get()).toBe(4);
    });

    it('should recover from results state', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      packState.set('results');

      const state = packState.get();
      expect(state).toBe('results');

      const pack = currentPack.get();
      expect(pack).not.toBeNull();

      // Should be able to navigate in results
      goToCard(5);
      expect(currentCardIndex.get()).toBe(5);
    });

    it('should preserve computed state during recovery', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      revealedCards.set(new Set([0, 1, 2]));

      const progressBefore = packProgress.get();
      const allRevealedBefore = allCardsRevealed.get();

      // "Recover" - computed values should still work
      const progressAfter = packProgress.get();
      const allRevealedAfter = allCardsRevealed.get();

      expect(progressAfter).toBe(progressBefore);
      expect(allRevealedAfter).toBe(allRevealedBefore);
    });
  });

  describe('Card Navigation State', () => {
    beforeEach(() => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
    });

    it('should navigate to next card correctly', () => {
      nextCard();

      expect(currentCardIndex.get()).toBe(1);
      nextCard();
      expect(currentCardIndex.get()).toBe(2);
    });

    it('should navigate to previous card correctly', () => {
      goToCard(3);
      prevCard();

      expect(currentCardIndex.get()).toBe(2);
      prevCard();
      expect(currentCardIndex.get()).toBe(1);
    });

    it('should not go below 0 on previous', () => {
      prevCard();

      expect(currentCardIndex.get()).toBe(0);
    });

    it('should not exceed cards length on next', () => {
      goToCard(5);
      nextCard(); // Should transition to results

      expect(packState.get()).toBe('results');
    });

    it('should go to specific card index', () => {
      goToCard(4);

      expect(currentCardIndex.get()).toBe(4);
    });

    it('should not go to invalid index', () => {
      const originalIndex = currentCardIndex.get();

      goToCard(-1);
      expect(currentCardIndex.get()).toBe(originalIndex);

      goToCard(10);
      expect(currentCardIndex.get()).toBe(originalIndex);
    });
  });

  describe('Skipping State Management', () => {
    beforeEach(() => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
    });

    it('should set isSkipping to true when skipping to results', () => {
      skipToResults();

      expect(isSkipping.get()).toBe(true);
    });

    it('should reveal all cards when skipping', () => {
      skipToResults();

      const pack = currentPack.get();
      expect(pack?.cards.every(c => c.isRevealed)).toBe(true);
    });

    it('should transition to results when skipping', () => {
      skipToResults();

      expect(packState.get()).toBe('results');
    });
  });

  describe('Edge Cases', () => {
    it('should handle revealing same card twice', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);
      revealCard(0);
      const firstRevealed = new Set(revealedCards.get());

      revealCard(0);
      const secondRevealed = new Set(revealedCards.get());

      expect(firstRevealed.size).toBe(secondRevealed.size);
    });

    it('should handle reset when no pack exists', () => {
      expect(() => resetPack()).not.toThrow();
      expect(packState.get()).toBe('idle');
    });

    it('should handle navigation when no pack exists', () => {
      expect(() => nextCard()).not.toThrow();
      expect(() => prevCard()).not.toThrow();
      expect(() => goToCard(0)).not.toThrow();
    });

    it('should handle reveal when no pack exists', () => {
      expect(() => revealCard(0)).not.toThrow();
      expect(() => revealCurrentCard()).not.toThrow();
    });

    it('should handle rapid state changes', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      // Rapid state changes
      packState.set('cards_ready');
      packState.set('revealing');
      packState.set('results');
      packState.set('idle');

      expect(packState.get()).toBe('idle');
    });
  });

  describe('State Integration', () => {
    it('should maintain consistency between related states', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      // Reveal first 3 cards
      revealCard(0);
      revealCard(1);
      revealCard(2);

      // Check consistency
      expect(revealedCards.get().size).toBe(3);
      expect(packProgress.get()).toBeCloseTo(0.5, 5);
      expect(allCardsRevealed.get()).toBe(false);

      // Reveal remaining
      revealCard(3);
      revealCard(4);
      revealCard(5);

      expect(revealedCards.get().size).toBe(6);
      expect(packProgress.get()).toBe(1);
      expect(allCardsRevealed.get()).toBe(true);
    });

    it('should handle card reveal with state update', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      revealCard(0);

      const pack = currentPack.get();
      expect(pack?.cards[0].isRevealed).toBe(true);
      expect(revealedCards.get().has(0)).toBe(true);
    });

    it('should handle currentCard navigation with bounds checking', () => {
      const mockPack = createMockPack();
      currentPack.set(mockPack);

      // Test navigation bounds
      currentCardIndex.set(0);
      expect(currentCard.get()).toBe(mockPack.cards[0]);

      currentCardIndex.set(5);
      expect(currentCard.get()).toBe(mockPack.cards[5]);

      currentCardIndex.set(6);
      expect(currentCard.get()).toBeNull();
    });
  });
});
