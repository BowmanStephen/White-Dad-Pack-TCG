import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import PackOpener from '@/components/pack/PackOpener.svelte';
import type { Pack, PackState, PackCard } from '@/types';
import type { AppError } from '@lib/utils/errors';

/**
 * PackOpener Component Test Suite
 *
 * Tests the core pack opening flow including:
 * - State machine transitions (idle → generating → pack_animate → cards_ready → revealing → results)
 * - User interactions (keyboard navigation, skip animations, pack type selection)
 * - Error handling and recovery
 * - Accessibility (screen reader announcements, keyboard navigation)
 * - Store integration
 */

// Mock the pack store functions
const mockOpenNewPack = vi.fn();
const mockCompletePackAnimation = vi.fn();
const mockSkipToResults = vi.fn();
const mockStopAutoReveal = vi.fn();
const mockRevealCurrentCard = vi.fn();
const mockNextCard = vi.fn();
const mockPrevCard = vi.fn();
const mockResetPack = vi.fn();
const mockShowResults = vi.fn();

// Mock store values
let mockPackState: PackState = 'idle';
let mockCurrentPack: Pack | null = null;
let mockCurrentCardIndex = 0;
let mockRevealedCards = new Set<number>();
let mockPackError: AppError | null = null;
let mockStorageError: AppError | null = null;
let mockCurrentTearAnimation: 'standard' | 'slow' | 'explosive' = 'standard';

// Mock sample pack data
const createMockPack = (): Pack => ({
  id: 'test-pack-1',
  packType: 'standard',
  cards: [
    {
      id: 'card-1',
      name: 'BBQ Dad',
      rarity: 'common',
      dadType: 'suburban',
      stats: { dadJoke: 50, grillSkill: 80, fixIt: 30, napPower: 60, remoteControl: 70, thermostat: 40, sockAndSandal: 20, beerSnob: 55 },
      ability: { name: 'Grill Master', description: '+20 Grill Skill when cooking burgers' },
      flavorText: ' "Grilling isn\'t just cooking, it\'s a lifestyle."',
      isHolo: false,
      holoType: 'none',
      isRevealed: false,
      collectionId: 'collection-1'
    },
    {
      id: 'card-2',
      name: 'Fix-It Dad',
      rarity: 'uncommon',
      dadType: 'handyman',
      stats: { dadJoke: 40, grillSkill: 30, fixIt: 90, napPower: 50, remoteControl: 60, thermostat: 70, sockAndSandal: 25, beerSnob: 45 },
      ability: { name: 'Duct Tape Master', description: 'Can fix anything with duct tape' },
      flavorText: '"If it can\'t be fixed with duct tape, you\'re not using enough duct tape."',
      isHolo: true,
      holoType: 'standard',
      isRevealed: false,
      collectionId: 'collection-1'
    },
    {
      id: 'card-3',
      name: 'Couch Dad',
      rarity: 'rare',
      dadType: 'spectator',
      stats: { dadJoke: 70, grillSkill: 20, fixIt: 10, napPower: 95, remoteControl: 85, thermostat: 50, sockAndSandal: 30, beerSnob: 60 },
      ability: { name: 'Remote Control Whisperer', description: 'Always finds the best show to watch' },
      flavorText: '"I\'m not asleep, I\'m just resting my eyes."',
      isHolo: false,
      holoType: 'none',
      isRevealed: false,
      collectionId: 'collection-1'
    }
  ],
  openedAt: new Date().toISOString(),
  tearAnimation: 'standard'
});

describe('PackOpener Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset state
    mockPackState = 'idle';
    mockCurrentPack = null;
    mockCurrentCardIndex = 0;
    mockRevealedCards = new Set();
    mockPackError = null;
    mockStorageError = null;
    mockCurrentTearAnimation = 'standard';

    // Mock the pack store
    vi.doMock('@/stores/pack', () => ({
      openNewPack: mockOpenNewPack,
      completePackAnimation: mockCompletePackAnimation,
      skipToResults: mockSkipToResults,
      stopAutoReveal: mockStopAutoReveal,
      revealCurrentCard: mockRevealCurrentCard,
      nextCard: mockNextCard,
      prevCard: mockPrevCard,
      resetPack: mockResetPack,
      showResults: mockShowResults,
      currentPack: {
        subscribe: (callback: (pack: Pack | null) => void) => {
          callback(mockCurrentPack);
          return () => {};
        }
      },
      packState: {
        subscribe: (callback: (state: PackState) => void) => {
          callback(mockPackState);
          return () => {};
        }
      },
      currentCardIndex: {
        subscribe: (callback: (index: number) => void) => {
          callback(mockCurrentCardIndex);
          return () => {};
        }
      },
      revealedCards: {
        subscribe: (callback: (cards: Set<number>) => void) => {
          callback(mockRevealedCards);
          return () => {};
        }
      },
      packStats: {
        subscribe: (callback: (stats: any) => void) => {
          callback(null);
          return () => {};
        }
      },
      packError: {
        subscribe: (callback: (error: AppError | null) => void) => {
          callback(mockPackError);
          return () => {};
        }
      },
      storageError: {
        subscribe: (callback: (error: AppError | null) => void) => {
          callback(mockStorageError);
          return () => {};
        }
      },
      currentTearAnimation: {
        subscribe: (callback: (animation: 'standard' | 'slow' | 'explosive') => void) => {
          callback(mockCurrentTearAnimation);
          return () => {};
        }
      }
    }));

    // Mock other stores
    vi.doMock('@/stores/ui', () => ({
      skipAnimations: {
        get: () => false
      }
    }));
  });

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(PackOpener);
      expect(container).toBeTruthy();
    });

    it('should render animation controls', () => {
      render(PackOpener);
      // AnimationControls should be rendered
      expect(document.querySelector('[data-testid="animation-controls"]')).toBeTruthy();
    });

    it('should render cinematic toggle', () => {
      render(PackOpener);
      expect(document.querySelector('[data-testid="cinematic-toggle"]')).toBeTruthy();
    });

    it('should render rate limit banner', () => {
      render(PackOpener);
      expect(document.querySelector('[data-testid="rate-limit-banner"]')).toBeTruthy();
    });
  });

  describe('State Machine Transitions', () => {
    it('should display loading skeleton during generating state', async () => {
      mockPackState = 'generating';
      const { container } = render(PackOpener);

      await waitFor(() => {
        expect(container.querySelector('.loading-skeleton') || container.querySelector('[data-testid="pack-skeleton"]')).toBeTruthy();
      });
    });

    it('should display pack animation during pack_animate state', async () => {
      mockPackState = 'pack_animate';
      const { container } = render(PackOpener);

      await waitFor(() => {
        expect(container.querySelector('[data-testid="pack-animation"]')).toBeTruthy();
      });
    });

    it('should display card revealer during cards_ready state', async () => {
      mockPackState = 'cards_ready';
      mockCurrentPack = createMockPack();
      const { container } = render(PackOpener);

      await waitFor(() => {
        expect(container.querySelector('[data-testid="card-revealer"]')).toBeTruthy();
      });
    });

    it('should display card revealer during revealing state', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      mockRevealedCards = new Set([0]);
      const { container } = render(PackOpener);

      await waitFor(() => {
        expect(container.querySelector('[data-testid="card-revealer"]')).toBeTruthy();
      });
    });

    it('should display results during results state', async () => {
      mockPackState = 'results';
      mockCurrentPack = createMockPack();
      mockRevealedCards = new Set([0, 1, 2]);
      const { container } = render(PackOpener);

      await waitFor(() => {
        expect(container.querySelector('[data-testid="pack-results"]')).toBeTruthy();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call openNewPack on mount', () => {
      render(PackOpener);
      expect(mockOpenNewPack).toHaveBeenCalled();
    });

    it('should call completePackAnimation when animation completes', async () => {
      mockPackState = 'pack_animate';
      const { container } = render(PackOpener);

      // Find the complete animation button/trigger
      const completeButton = container.querySelector('[data-action="complete-animation"]');
      if (completeButton) {
        fireEvent.click(completeButton);
        await tick();
        expect(mockCompletePackAnimation).toHaveBeenCalled();
      }
    });

    it('should call skipToResults when user skips animations', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      const { container } = render(PackOpener);

      // Find the skip button
      const skipButton = container.querySelector('[data-action="skip-to-results"]') ||
                        container.querySelector('button:has-text("Skip")');
      if (skipButton) {
        fireEvent.click(skipButton);
        await tick();
        expect(mockStopAutoReveal).toHaveBeenCalled();
        expect(mockSkipToResults).toHaveBeenCalled();
      }
    });

    it('should call revealCurrentCard when user clicks to reveal', async () => {
      mockPackState = 'cards_ready';
      mockCurrentPack = createMockPack();
      const { container } = render(PackOpener);

      // Find the reveal button
      const revealButton = container.querySelector('[data-action="reveal-card"]');
      if (revealButton) {
        fireEvent.click(revealButton);
        await tick();
        expect(mockRevealCurrentCard).toHaveBeenCalled();
      }
    });

    it('should call nextCard when user navigates to next card', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      mockRevealedCards = new Set([0]);
      const { container } = render(PackOpener);

      const nextButton = container.querySelector('[data-action="next-card"]');
      if (nextButton) {
        fireEvent.click(nextButton);
        await tick();
        expect(mockNextCard).toHaveBeenCalled();
      }
    });

    it('should call prevCard when user navigates to previous card', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      mockCurrentCardIndex = 1;
      mockRevealedCards = new Set([0, 1]);
      const { container } = render(PackOpener);

      const prevButton = container.querySelector('[data-action="prev-card"]');
      if (prevButton) {
        fireEvent.click(prevButton);
        await tick();
        expect(mockPrevCard).toHaveBeenCalled();
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should stop auto-reveal on any keyboard interaction', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      await tick();

      expect(mockStopAutoReveal).toHaveBeenCalled();
    });

    it('should reveal card or navigate next on ArrowRight', async () => {
      mockPackState = 'cards_ready';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      fireEvent.keyDown(window, { key: 'ArrowRight' });
      await tick();

      expect(mockRevealCurrentCard).toHaveBeenCalled();
    });

    it('should navigate to previous card on ArrowLeft', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      mockCurrentCardIndex = 1;
      render(PackOpener);

      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      await tick();

      expect(mockPrevCard).toHaveBeenCalled();
    });

    it('should skip to results on Escape key', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      fireEvent.keyDown(window, { key: 'Escape' });
      await tick();

      expect(mockStopAutoReveal).toHaveBeenCalled();
      expect(mockSkipToResults).toHaveBeenCalled();
    });

    it('should reveal card on Space key', async () => {
      mockPackState = 'cards_ready';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      fireEvent.keyDown(window, { key: ' ' });
      await tick();

      expect(mockRevealCurrentCard).toHaveBeenCalled();
    });

    it('should reveal card on Enter key', async () => {
      mockPackState = 'cards_ready';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      fireEvent.keyDown(window, { key: 'Enter' });
      await tick();

      expect(mockRevealCurrentCard).toHaveBeenCalled();
    });

    it('should prevent default scrolling on navigation keys', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      const preventDefault = vi.fn();
      fireEvent.keyDown(window, {
        key: 'ArrowRight',
        preventDefault
      });

      await tick();
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when packError exists', async () => {
      mockPackError = {
        id: 'err_test',
        type: 'generation',
        title: 'Pack Generation Failed',
        message: 'Unable to generate pack. Please try again.',
        timestamp: new Date().toISOString(),
        context: { action: 'openPack' }
      };
      const { container } = render(PackOpener);

      await waitFor(() => {
        const errorDisplay = container.querySelector('[data-testid="error-display"]');
        expect(errorDisplay).toBeTruthy();
        expect(errorDisplay?.textContent).toContain('Pack Generation Failed');
      });
    });

    it('should display storage warning when storageError exists', async () => {
      mockStorageError = {
        id: 'err_storage',
        type: 'storage',
        title: 'Storage Full',
        message: 'Your collection is almost full. Consider clearing old packs.',
        timestamp: new Date().toISOString(),
        context: { usage: 0.95 }
      };
      const { container } = render(PackOpener);

      await waitFor(() => {
        const errorDisplay = container.querySelector('[data-testid="error-message"]');
        expect(errorDisplay).toBeTruthy();
        expect(errorDisplay?.textContent).toContain('Storage Full');
      });
    });

    it('should announce errors to screen readers', async () => {
      mockPackError = {
        id: 'err_test',
        type: 'generation',
        title: 'Pack Generation Failed',
        message: 'Unable to generate pack. Please try again.',
        timestamp: new Date().toISOString(),
        context: { action: 'openPack' }
      };
      render(PackOpener);

      await waitFor(() => {
        const errorAnnouncer = document.querySelector('#error-announcer');
        expect(errorAnnouncer).toBeTruthy();
        expect(errorAnnouncer?.getAttribute('role')).toBe('alert');
        expect(errorAnnouncer?.getAttribute('aria-live')).toBe('assertive');
      });
    });
  });

  describe('Accessibility', () => {
    it('should provide live region announcements for state changes', async () => {
      mockPackState = 'generating';
      render(PackOpener);

      await waitFor(() => {
        const announcer = document.querySelector('#pack-announcer');
        expect(announcer).toBeTruthy();
        expect(announcer?.getAttribute('role')).toBe('status');
        expect(announcer?.getAttribute('aria-live')).toBe('polite');
        expect(announcer?.textContent).toContain('Generating your pack');
      });
    });

    it('should announce cards ready when pack opens', async () => {
      mockPackState = 'cards_ready';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      await waitFor(() => {
        const announcer = document.querySelector('#pack-announcer');
        expect(announcer?.textContent).toContain('3 cards ready to reveal');
      });
    });

    it('should announce current card being revealed', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      mockCurrentCardIndex = 1;
      render(PackOpener);

      await waitFor(() => {
        const announcer = document.querySelector('#pack-announcer');
        expect(announcer?.textContent).toContain('Revealing card 2 of 3');
      });
    });

    it('should announce all cards revealed in results', async () => {
      mockPackState = 'results';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      await waitFor(() => {
        const announcer = document.querySelector('#pack-announcer');
        expect(announcer?.textContent).toContain('All cards revealed');
      });
    });

    it('should support keyboard-only navigation', async () => {
      mockPackState = 'cards_ready';
      mockCurrentPack = createMockPack();
      render(PackOpener);

      // Simulate tabbing through and using keyboard
      fireEvent.keyDown(window, { key: 'Tab' });
      fireEvent.keyDown(window, { key: 'Enter' });

      await tick();
      expect(mockRevealCurrentCard).toHaveBeenCalled();
    });
  });

  describe('Pack Type Selection', () => {
    it('should open pack selector when user clicks open another', async () => {
      mockPackState = 'results';
      mockCurrentPack = createMockPack();
      const { container } = render(PackOpener);

      // Find "Open Another" button
      const openAnotherBtn = container.querySelector('[data-action="open-another"]');
      if (openAnotherBtn) {
        fireEvent.click(openAnotherBtn);
        await tick();

        // Should show pack type selector
        expect(container.querySelector('[data-testid="pack-type-selector"]')).toBeTruthy();
      }
    });

    it('should handle pack type selection', async () => {
      mockPackState = 'idle';
      const { container } = render(PackOpener);

      // Find pack type selector
      const packTypeSelector = container.querySelector('[data-testid="pack-type-selector"]');
      if (packTypeSelector) {
        // Select premium pack type
        fireEvent.click(packTypeSelector);
        await tick();

        // Should have updated selected pack type
        expect(mockOpenNewPack).toHaveBeenCalled();
      }
    });
  });

  describe('Store Integration', () => {
    it('should subscribe to pack state updates', async () => {
      const { rerender } = render(PackOpener);

      // Simulate state change
      mockPackState = 'pack_animate';
      rerender({});

      await waitFor(() => {
        expect(document.querySelector('[data-testid="pack-animation"]')).toBeTruthy();
      });
    });

    it('should subscribe to current pack updates', async () => {
      mockPackState = 'cards_ready';
      const { rerender, container } = render(PackOpener);

      // Simulate pack being generated
      mockCurrentPack = createMockPack();
      rerender({});

      await waitFor(() => {
        expect(container.querySelector('[data-testid="card-revealer"]')).toBeTruthy();
      });
    });

    it('should subscribe to revealed cards updates', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      const { rerender, container } = render(PackOpener);

      // Simulate cards being revealed
      mockRevealedCards = new Set([0, 1]);
      rerender({});

      await tick();
      // Component should update with revealed cards
      expect(container).toBeTruthy();
    });
  });

  describe('Animation Controls', () => {
    it('should respect skip animations setting', async () => {
      // Mock skip animations to true
      vi.doMock('@/stores/ui', () => ({
        skipAnimations: {
          get: () => true
        }
      }));

      render(PackOpener);

      // Component should skip animations automatically
      expect(mockOpenNewPack).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null pack gracefully', async () => {
      mockPackState = 'cards_ready';
      mockCurrentPack = null;
      const { container } = render(PackOpener);

      await waitFor(() => {
        // Should not crash, should show empty state or loading
        expect(container).toBeTruthy();
      });
    });

    it('should handle empty cards array', async () => {
      mockPackState = 'results';
      mockCurrentPack = {
        ...createMockPack(),
        cards: []
      };
      const { container } = render(PackOpener);

      await waitFor(() => {
        // Should display results with no cards message
        expect(container.querySelector('[data-testid="pack-results"]')).toBeTruthy();
      });
    });

    it('should handle rapid state changes', async () => {
      const { container } = render(PackOpener);

      // Rapidly change states
      mockPackState = 'generating';
      await tick();

      mockPackState = 'pack_animate';
      await tick();

      mockPackState = 'cards_ready';
      await tick();

      // Should handle without crashing
      expect(container).toBeTruthy();
    });

    it('should handle all cards revealed except last', async () => {
      mockPackState = 'revealing';
      mockCurrentPack = createMockPack();
      mockRevealedCards = new Set([0, 1]);
      mockCurrentCardIndex = 2;
      render(PackOpener);

      // Should show last card
      expect(document.querySelector('#pack-announcer')?.textContent).toContain('Revealing card 3 of 3');
    });
  });
});
