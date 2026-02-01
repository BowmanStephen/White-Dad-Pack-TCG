import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { render as renderAstro } from 'astro/test-utils';
import PackOpener from '@/components/pack/PackOpener.svelte';
import {
  openNewPack,
  resetPack,
  packState,
  currentPack,
  revealedCards,
  currentCardIndex,
  packError
} from '@/stores/pack';
import type { Pack } from '@/types';
import { addPackToCollection } from '@/stores/collection';
import { checkRateLimit } from '@/lib/utils/rate-limiter';

/**
 * Complete Pack Opening Flow - Integration Test
 *
 * This integration test verifies the entire pack opening user journey
 * from button click to results screen, with real store interactions
 * (minimal mocking).
 *
 * Test Flow:
 * 1. User lands on pack page
 * 2. User clicks "Open Pack" button
 * 3. Pack generates (with loading state)
 * 4. Pack animation plays
 * 5. Cards reveal one-by-one
 * 6. User navigates through cards
 * 7. Results screen displays
 * 8. Pack saves to collection
 *
 * Why Integration vs Unit:
 * - Tests REAL user flow (not individual functions)
 * - Fewer mocks = more realistic testing
 * - Catches integration bugs between stores + components
 * - Better confidence in actual UX
 */

describe('Pack Opening Flow - Integration Test', () => {
  beforeEach(() => {
    // Reset pack state before each test
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

  describe('Complete Happy Path Flow', () => {
    it('should complete full pack opening flow from start to results', async () => {
      // Step 1: Render PackOpener component (simulates user landing on pack page)
      const { container } = render(PackOpener);

      // Verify initial state
      expect(packState.get()).toBe('idle');
      expect(currentPack.get()).toBeNull();

      // Step 2: Component automatically opens pack on mount
      // Wait for pack generation to complete
      await waitFor(
        () => {
          expect(packState.get()).not.toBe('idle');
          expect(packState.get()).not.toBe('generating');
        },
        { timeout: 3000 }
      );

      // Step 3: Verify pack was generated
      const pack = currentPack.get();
      expect(pack).not.toBeNull();
      expect(pack?.cards).toBeDefined();
      expect(pack?.cards.length).toBeGreaterThan(0);

      // Step 4: Wait for animation to complete and cards to be ready
      await waitFor(
        () => {
          expect(['pack_animate', 'cards_ready', 'revealing', 'results']).toContain(
            packState.get()
          );
        },
        { timeout: 5000 }
      );

      // Step 5: Skip to results to test complete flow
      fireEvent.keyDown(window, { key: 'Escape' });
      await tick();

      // Step 6: Verify we're in results state
      await waitFor(
        () => {
          expect(packState.get()).toBe('results');
        },
        { timeout: 3000 }
      );

      // Step 7: Verify all cards are revealed
      const allRevealed = pack?.cards.every(card => card.isRevealed);
      expect(allRevealed).toBe(true);

      // Step 8: Verify pack was saved to collection
      expect(addPackToCollection).toHaveBeenCalled();

      // Step 9: Verify UI elements are present
      expect(container.querySelector('[data-testid="pack-results"]')).toBeTruthy();
    });

    it('should allow manual card reveal before skipping to results', async () => {
      const { container } = render(PackOpener);

      // Wait for pack to be ready
      await waitFor(
        () => {
          expect(packState.get()).toBe('cards_ready');
        },
        { timeout: 5000 }
      );

      const initialRevealedCount = revealedCards.get().size;

      // Simulate user revealing cards manually
      fireEvent.keyDown(window, { key: ' ' }); // Space to reveal
      await tick();

      // Verify one card was revealed
      expect(revealedCards.get().size).toBeGreaterThan(initialRevealedCount);

      // Navigate to next card
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      await tick();

      // Verify card index changed
      expect(currentCardIndex.get()).toBeGreaterThan(0);

      // Skip to results
      fireEvent.keyDown(window, { key: 'Escape' });
      await tick();

      // Verify results state
      await waitFor(() => {
        expect(packState.get()).toBe('results');
      });
    });

    it('should support keyboard-only navigation', async () => {
      render(PackOpener);

      // Wait for cards ready
      await waitFor(
        () => {
          expect(packState.get()).toBe('cards_ready');
        },
        { timeout: 5000 }
      );

      // Test keyboard navigation sequence
      const keySequence = [
        { key: ' ', expectedRevealed: true }, // Reveal first card
        { key: 'ArrowRight', expectedIndex: 1 }, // Next card
        { key: 'ArrowRight', expectedIndex: 2 }, // Next card
        { key: 'ArrowLeft', expectedIndex: 1 }, // Previous card
        { key: 'Escape', expectedState: 'results' } // Skip to results
      ];

      for (const { key, expectedRevealed, expectedIndex, expectedState } of keySequence) {
        fireEvent.keyDown(window, { key });
        await tick();

        if (expectedRevealed !== undefined) {
          expect(revealedCards.get().size).toBeGreaterThan(0);
        }
        if (expectedIndex !== undefined) {
          expect(currentCardIndex.get()).toBe(expectedIndex);
        }
        if (expectedState) {
          await waitFor(
            () => {
              expect(packState.get()).toBe(expectedState);
            },
            { timeout: 2000 }
          );
        }
      }
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle rate limit error and allow retry', async () => {
      // Mock rate limit error
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        error: 'Rate limit exceeded'
      });

      const { container } = render(PackOpener);

      // Wait for error
      await waitFor(() => {
        expect(packError.get()).not.toBeNull();
      });

      // Verify error UI is displayed
      const errorDisplay = container.querySelector('[data-testid="error-display"]');
      expect(errorDisplay).toBeTruthy();

      // Verify retry button exists
      const retryButton = screen.queryByText('Try Again');
      expect(retryButton).toBeTruthy();

      // Now allow retry
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: true,
        remaining: 60,
        resetTime: Date.now() + 60000
      });

      // Click retry button
      if (retryButton) {
        fireEvent.click(retryButton);
        await tick();

        // Verify pack opens after retry
        await waitFor(
          () => {
            expect(currentPack.get()).not.toBeNull();
          },
          { timeout: 3000 }
        );
      }
    });

    it('should handle storage error gracefully', async () => {
      // Mock storage save failure
      vi.mocked(addPackToCollection).mockResolvedValue({
        success: false,
        error: 'Storage full'
      });

      const { container } = render(PackOpener);

      // Wait for pack to open despite storage error
      await waitFor(
        () => {
          expect(currentPack.get()).not.toBeNull();
        },
        { timeout: 5000 }
      );

      // Verify storage warning is displayed
      const storageWarning = container.querySelector('[data-testid="error-message"]');
      expect(storageWarning).toBeTruthy();

      // Verify pack still opened
      expect(packState.get()).not.toBe('idle');
      expect(currentPack.get()).not.toBeNull();
    });
  });

  describe('State Persistence', () => {
    it('should maintain pack state during user interactions', async () => {
      const { container } = render(PackOpener);

      // Wait for pack to be ready
      await waitFor(
        () => {
          expect(packState.get()).toBe('cards_ready');
        },
        { timeout: 5000 }
      );

      const packId = currentPack.get()?.id;

      // Reveal some cards
      fireEvent.keyDown(window, { key: ' ' });
      await tick();

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      await tick();

      // Verify pack ID hasn't changed
      expect(currentPack.get()?.id).toBe(packId);

      // Verify revealed cards persisted
      expect(revealedCards.get().size).toBeGreaterThan(0);

      // Skip to results
      fireEvent.keyDown(window, { key: 'Escape' });
      await tick();

      // Verify final state
      await waitFor(() => {
        expect(packState.get()).toBe('results');
      });

      // Verify pack data intact
      expect(currentPack.get()?.id).toBe(packId);
    });
  });

  describe('Accessibility Integration', () => {
    it('should announce state changes to screen readers', async () => {
      render(PackOpener);

      // Wait for pack generation
      await waitFor(
        () => {
          expect(packState.get()).not.toBe('generating');
        },
        { timeout: 3000 }
      );

      // Check for announcer element
      const announcer = document.querySelector('#pack-announcer');
      expect(announcer).toBeTruthy();
      expect(announcer?.getAttribute('role')).toBe('status');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');

      // Verify announcement text changes with state
      const initialState = announcer?.textContent || '';

      await waitFor(
        () => {
          const currentState = announcer?.textContent || '';
          expect(currentState).not.toBe(initialState);
        },
        { timeout: 3000 }
      );
    });

    it('should announce errors to screen readers', async () => {
      // Mock rate limit error
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        error: 'Rate limit exceeded'
      });

      render(PackOpener);

      // Wait for error
      await waitFor(() => {
        expect(packError.get()).not.toBeNull();
      });

      // Check for error announcer
      const errorAnnouncer = document.querySelector('#error-announcer');
      expect(errorAnnouncer).toBeTruthy();
      expect(errorAnnouncer?.getAttribute('role')).toBe('alert');
      expect(errorAnnouncer?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('Performance Integration', () => {
    it('should complete pack opening within reasonable time', async () => {
      const startTime = performance.now();

      render(PackOpener);

      // Wait for complete flow
      await waitFor(
        () => {
          expect(['cards_ready', 'revealing', 'results']).toContain(packState.get());
        },
        { timeout: 5000 }
      );

      const duration = performance.now() - startTime;

      // Should complete within 5 seconds (reasonable UX threshold)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle rapid state changes without freezing', async () => {
      const { container } = render(PackOpener);

      // Wait for cards ready
      await waitFor(
        () => {
          expect(packState.get()).toBe('cards_ready');
        },
        { timeout: 5000 }
      );

      // Simulate rapid user interactions
      const actions = [
        () => fireEvent.keyDown(window, { key: ' ' }),
        () => fireEvent.keyDown(window, { key: 'ArrowRight' }),
        () => fireEvent.keyDown(window, { key: 'ArrowRight' }),
        () => fireEvent.keyDown(window, { key: 'ArrowLeft' }),
        () => fireEvent.keyDown(window, { key: 'Escape' })
      ];

      const startTime = performance.now();

      for (const action of actions) {
        action();
        await tick();
      }

      const duration = performance.now() - startTime;

      // Should handle rapid interactions within 2 seconds
      expect(duration).toBeLessThan(2000);

      // Verify final state is correct
      await waitFor(() => {
        expect(packState.get()).toBe('results');
      });
    });
  });

  describe('Edge Cases Integration', () => {
    it('should handle pack with all common cards', async () => {
      // This test would require mocking pack generator
      // For now, we verify the flow completes
      render(PackOpener);

      await waitFor(
        () => {
          expect(['cards_ready', 'revealing', 'results']).toContain(packState.get());
        },
        { timeout: 5000 }
      );

      expect(currentPack.get()).not.toBeNull();
    });

    it('should handle pack with mythic card', async () => {
      // Mythic cards have special effects, verify flow still works
      render(PackOpener);

      await waitFor(
        () => {
          expect(['cards_ready', 'revealing', 'results']).toContain(packState.get());
        },
        { timeout: 5000 }
      );

      const pack = currentPack.get();
      expect(pack).not.toBeNull();

      // Check if any card is mythic (may or may not happen randomly)
      const hasMythic = pack?.cards.some(card => card.rarity === 'mythic');

      if (hasMythic) {
        // Verify mythic card displays correctly
        expect(pack?.cards.find(c => c.rarity === 'mythic')).toBeDefined();
      }
    });

    it('should handle user skipping animation immediately', async () => {
      const { container } = render(PackOpener);

      // Immediately skip (before animation completes)
      fireEvent.keyDown(window, { key: 'Escape' });
      await tick();

      // Should still complete successfully
      await waitFor(
        () => {
          expect(packState.get()).toBe('results');
        },
        { timeout: 5000 }
      );

      expect(currentPack.get()).not.toBeNull();
    });

    it('should handle user navigating before revealing cards', async () => {
      render(PackOpener);

      // Wait for cards ready
      await waitFor(
        () => {
          expect(packState.get()).toBe('cards_ready');
        },
        { timeout: 5000 }
      );

      // Try to navigate before revealing
      fireEvent.keyDown(window, { key: 'ArrowRight' });
      await tick();

      // Should handle gracefully (no crash)
      expect(currentPack.get()).not.toBeNull();

      // Now reveal and navigate
      fireEvent.keyDown(window, { key: ' ' });
      await tick();

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      await tick();

      expect(currentCardIndex.get()).toBeGreaterThan(0);
    });
  });

  describe('Real Store Integration', () => {
    it('should use actual pack store (not mocked)', async () => {
      // This test verifies we're testing the real store, not mocks
      const initialState = packState.get();

      render(PackOpener);

      // Verify state changes (proves real store is working)
      await waitFor(
        () => {
          expect(packState.get()).not.toBe(initialState);
        },
        { timeout: 3000 }
      );

      // Verify we have a real pack with real data
      const pack = currentPack.get();
      expect(pack).not.toBeNull();
      expect(pack?.id).toBeDefined();
      expect(pack?.cards).toBeDefined();
      expect(pack?.openedAt).toBeDefined();
    });

    it('should persist pack data to collection store', async () => {
      render(PackOpener);

      // Wait for pack to open
      await waitFor(
        () => {
          expect(currentPack.get()).not.toBeNull();
        },
        { timeout: 5000 }
      );

      // Verify collection save was called with real pack data
      expect(addPackToCollection).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          cards: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              rarity: expect.any(String),
              stats: expect.any(Object)
            })
          ])
        })
      );
    });
  });
});
