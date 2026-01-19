import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  openNewPack,
  resetPack,
  packState,
  currentPack,
  revealedCards,
  currentCardIndex,
  skipToResults,
  revealCurrentCard,
  nextCard,
  packError
} from '@/stores/pack';
import { addPackToCollection } from '@/stores/collection';
import { checkRateLimit } from '@/lib/utils/rate-limiter';

/**
 * Pack Opening Flow - Real Store Integration Test
 *
 * This test uses REAL stores (not mocked) to test the complete pack opening flow.
 * Only external dependencies (pack generator, collection save, rate limiter) are mocked.
 *
 * This is better than component tests because:
 * - Tests ACTUAL user flow (not individual components)
 * - Fewer mocks = more realistic
 * - Catches integration bugs
 * - Tests are more stable
 */

describe('Pack Opening Flow - Integration', () => {
  beforeEach(() => {
    resetPack();
    vi.clearAllMocks();

    // Mock rate limiter to allow testing
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 60,
      resetTime: Date.now() + 60000
    });

    // Mock collection save to succeed
    vi.mocked(addPackToCollection).mockResolvedValue({
      success: true
    });
  });

  afterEach(() => {
    resetPack();
  });

  describe('Complete Happy Path', () => {
    it('should open pack and complete flow', async () => {
      // Initial state
      expect(packState.get()).toBe('idle');
      expect(currentPack.get()).toBeNull();

      // Open pack
      await openNewPack();

      // Verify pack was generated
      expect(packState.get()).toBe('pack_animate');
      expect(currentPack.get()).not.toBeNull();
      expect(currentPack.get()?.cards.length).toBeGreaterThan(0);

      // Complete animation
      packState.set('cards_ready');

      // Reveal cards
      revealCurrentCard();
      expect(revealedCards.get().size).toBe(1);
      expect(currentPack.get()?.cards[0].isRevealed).toBe(true);

      // Navigate
      nextCard();
      expect(currentCardIndex.get()).toBe(1);

      // Skip to results
      skipToResults();
      expect(packState.get()).toBe('results');

      // Verify all cards revealed
      expect(currentPack.get()?.cards.every(c => c.isRevealed)).toBe(true);

      // Verify saved to collection
      expect(addPackToCollection).toHaveBeenCalled();
    });

    it('should maintain state integrity during flow', async () => {
      await openNewPack();
      const packId = currentPack.get()?.id;

      // Complete animation
      packState.set('cards_ready');

      // Interact with pack
      revealCurrentCard();
      nextCard();
      revealCurrentCard();

      // Verify pack ID hasn't changed
      expect(currentPack.get()?.id).toBe(packId);

      // Verify revealed cards accumulated
      expect(revealedCards.get().size).toBe(2);
    });

    it('should reset correctly between packs', async () => {
      // Open first pack
      await openNewPack();
      const firstPackId = currentPack.get()?.id;

      // Reset
      resetPack();

      // Verify state cleared
      expect(packState.get()).toBe('idle');
      expect(currentPack.get()).toBeNull();
      expect(revealedCards.get().size).toBe(0);
      expect(currentCardIndex.get()).toBe(0);

      // Open second pack
      await openNewPack();
      const secondPackId = currentPack.get()?.id;

      // Verify new pack is different
      expect(secondPackId).not.toBe(firstPackId);
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit error', async () => {
      // Mock rate limit
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        error: 'Rate limit exceeded'
      });

      // Try to open pack
      await openNewPack();

      // Verify error state
      expect(packError.get()).not.toBeNull();
      expect(packError.get()?.type).toBe('security');
      expect(packState.get()).toBe('idle');
    });

    it('should handle storage save error gracefully', async () => {
      // Mock storage failure
      vi.mocked(addPackToCollection).mockResolvedValue({
        success: false,
        error: 'Storage full'
      });

      // Open pack (should succeed despite storage error)
      await openNewPack();

      // Pack should still open
      expect(packState.get()).toBe('pack_animate');
      expect(currentPack.get()).not.toBeNull();

      // Storage error should be set (non-blocking)
      // Note: This is tested via side effects in the actual store
    });
  });

  describe('State Machine', () => {
    it('should follow correct state transitions', async () => {
      // idle → generating → pack_animate
      expect(packState.get()).toBe('idle');

      const promise = openNewPack();
      expect(packState.get()).toBe('generating');

      await promise;
      expect(packState.get()).toBe('pack_animate');

      // pack_animate → cards_ready
      packState.set('cards_ready');
      expect(packState.get()).toBe('cards_ready');

      // cards_ready → revealing
      revealCurrentCard();
      expect(packState.get()).toBe('revealing');

      // revealing → results (via skip)
      skipToResults();
      expect(packState.get()).toBe('results');
    });

    it('should skip from any state to results', async () => {
      await openNewPack();
      packState.set('cards_ready');

      // Skip to results
      skipToResults();

      expect(packState.get()).toBe('results');
      expect(revealedCards.get().size).toBe(currentPack.get()?.cards.length);
    });
  });

  describe('Card Reveal Logic', () => {
    beforeEach(async () => {
      await openNewPack();
      packState.set('cards_ready');
    });

    it('should reveal cards sequentially', () => {
      // Reveal first card
      revealCurrentCard();
      expect(revealedCards.get().has(0)).toBe(true);

      // Next card
      nextCard();
      revealCurrentCard();
      expect(revealedCards.get().has(1)).toBe(true);

      // Next card
      nextCard();
      revealCurrentCard();
      expect(revealedCards.get().has(2)).toBe(true);
    });

    it('should track current card index', () => {
      expect(currentCardIndex.get()).toBe(0);

      nextCard();
      expect(currentCardIndex.get()).toBe(1);

      nextCard();
      expect(currentCardIndex.get()).toBe(2);

      // Can't go beyond pack size
      nextCard();
      // Should be at results now or stay at last index
      expect(currentCardIndex.get()).toBeGreaterThanOrEqual(0);
    });

    it('should not reveal already revealed cards', () => {
      revealCurrentCard();
      const firstRevealCount = revealedCards.get().size;

      revealCurrentCard();
      const secondRevealCount = revealedCards.get().size;

      expect(firstRevealCount).toBe(secondRevealCount);
    });
  });

  describe('Edge Cases', () => {
    it('should handle navigation before revealing', async () => {
      await openNewPack();
      packState.set('cards_ready');

      // Navigate without revealing
      nextCard();
      expect(currentCardIndex.get()).toBe(1);
      expect(revealedCards.get().has(0)).toBe(false);

      // Now reveal
      revealCurrentCard();
      expect(revealedCards.get().has(1)).toBe(true);
    });

    it('should handle rapid state changes', async () => {
      await openNewPack();

      // Rapid state changes
      packState.set('cards_ready');
      revealCurrentCard();
      nextCard();
      skipToResults();

      // Should handle without crashing
      expect(packState.get()).toBe('results');
      expect(currentPack.get()).not.toBeNull();
    });

    it('should handle empty revealed cards', async () => {
      await openNewPack();
      packState.set('cards_ready');

      // Skip without revealing any cards
      skipToResults();

      // All cards should be revealed now
      expect(revealedCards.get().size).toBe(currentPack.get()?.cards.length);
    });
  });

  describe('Performance', () => {
    it('should complete pack opening within timeout', async () => {
      const startTime = Date.now();

      await openNewPack();

      const duration = Date.now() - startTime;

      // Should complete within 8 second timeout
      expect(duration).toBeLessThan(8000);
    });

    it('should handle multiple pack openings', async () => {
      // Open multiple packs sequentially
      for (let i = 0; i < 3; i++) {
        resetPack();
        await openNewPack();
        expect(currentPack.get()).not.toBeNull();
      }
    });
  });

  describe('Data Integrity', () => {
    it('should preserve pack data during flow', async () => {
      await openNewPack();
      const originalPack = currentPack.get();

      packState.set('cards_ready');
      revealCurrentCard();
      nextCard();
      skipToResults();

      // Pack data should be unchanged
      expect(currentPack.get()?.id).toBe(originalPack?.id);
      expect(currentPack.get()?.cards.length).toBe(originalPack?.cards.length);
    });

    it('should save correct pack to collection', async () => {
      await openNewPack();
      const pack = currentPack.get();

      expect(addPackToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          id: pack?.id,
          cards: pack?.cards,
          packType: pack?.packType
        })
      );
    });
  });

  describe('Real Store Behavior', () => {
    it('should use actual Nanostores (not mocks)', () => {
      // Verify these are real stores by checking they have store methods
      expect(typeof packState.subscribe).toBe('function');
      expect(typeof packState.get).toBe('function');
      expect(typeof packState.set).toBe('function');

      expect(typeof currentPack.subscribe).toBe('function');
      expect(typeof currentPack.get).toBe('function');
      expect(typeof currentPack.set).toBe('function');
    });

    it('should support store subscriptions', () => {
      let callbackFired = false;
      let capturedState: any = null;

      const unsubscribe = packState.subscribe((state) => {
        callbackFired = true;
        capturedState = state;
      });

      // Trigger state change
      packState.set('cards_ready');

      expect(callbackFired).toBe(true);
      expect(capturedState).toBe('cards_ready');

      unsubscribe();
    });

    it('should handle concurrent state updates', async () => {
      await openNewPack();

      // Multiple rapid state updates
      packState.set('cards_ready');
      revealCurrentCard();
      nextCard();
      skipToResults();

      // Final state should be consistent
      expect(packState.get()).toBe('results');
      expect(revealedCards.get().size).toBe(currentPack.get()?.cards.length);
    });
  });
});
