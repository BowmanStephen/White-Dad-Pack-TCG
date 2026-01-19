import { atom, computed } from 'nanostores';
import type { Pack, PackState, PackType, DadType, TearAnimation } from '../types';
import { generatePack, getPackStats, getPackConfig } from '../lib/pack/generator';
import { addPackToCollection, getPityCounter, ensureCollectionInitialized } from './collection';
import { trackEvent } from './analytics';
import { createAppError, logError, type AppError } from '../lib/utils/errors';
import { haptics } from '../lib/utils/haptics';
import { selectRandomTearAnimation } from '../types';
import { skipAnimations as skipAnimationsStore, showToast } from './ui';
import { checkRateLimit, recordPackOpen, getRateLimitStatus } from '../lib/utils/rate-limiter';

// Current pack type selection (for UI state)
export const selectedPackType = atom<PackType>('standard');
export const selectedThemeType = atom<DadType | undefined>(undefined);

// PACK-027: Current tear animation type
export const currentTearAnimation = atom<TearAnimation>('standard');

// Track pack open start time for duration calculation
let packOpenStartTime: number | null = null;

// Current pack being opened
export const currentPack = atom<Pack | null>(null);

// Current state of the pack opening flow
export const packState = atom<PackState>('idle');

// Index of the currently viewed card
export const currentCardIndex = atom<number>(0);

// Whether the user is skipping animations
export const isSkipping = atom<boolean>(false);

// Track which cards have been revealed
export const revealedCards = atom<Set<number>>(new Set());

// Error state store with full AppError object
export const packError = atom<AppError | null>(null);

// Storage error state with full AppError object
export const storageError = atom<AppError | null>(null);

// SEC-002: Rate limit status (reactive)
export const rateLimitStatus = computed(
  [], // No dependencies - will be updated manually
  () => getRateLimitStatus()
);

// Computed: Get the current card being viewed
export const currentCard = computed(
  [currentPack, currentCardIndex],
  (pack, index) => {
    if (!pack || index < 0 || index >= pack.cards.length) return null;
    return pack.cards[index];
  }
);

// Computed: Check if all cards are revealed
export const allCardsRevealed = computed(
  [currentPack, revealedCards],
  (pack, revealed) => {
    if (!pack) return false;
    return revealed.size >= pack.cards.length;
  }
);

// Computed: Get pack statistics
export const packStats = computed(currentPack, (pack) => {
  if (!pack) return null;
  return getPackStats(pack);
});

// Computed: Progress through the pack (0-1)
export const packProgress = computed(
  [currentPack, revealedCards],
  (pack, revealed) => {
    if (!pack || pack.cards.length === 0) return 0;
    return revealed.size / pack.cards.length;
  }
);

// Computed: Loading state for pack operations
export const isLoading = computed(packState, (state) => {
  return state === 'generating' || state === 'pack_animate';
});

/**
 * Actions
 */

// Start opening a new pack with specified type (PACK-001)
export async function openNewPack(packType?: PackType, themeType?: DadType): Promise<void> {
  // SEC-002: Check rate limit before opening pack
  const rateLimitCheck = checkRateLimit();
  if (!rateLimitCheck.allowed) {
    // Create rate limit error with retry time
    const rateLimitError = createAppError(
      'security',
      rateLimitCheck.error || 'Rate limit exceeded',
      [
        {
          label: 'Go Home',
          action: () => {
            window.location.href = '/';
          },
        },
      ]
    );
    packError.set(rateLimitError);
    packState.set('idle');
    return;
  }

  // Use provided pack type or fall back to store selection
  const finalPackType = packType || selectedPackType.get();
  const finalThemeType = themeType !== undefined ? themeType : selectedThemeType.get();

  // Update store state if arguments provided
  if (packType) selectedPackType.set(packType);
  if (themeType !== undefined) selectedThemeType.set(themeType);

  // Reset state first
  currentCardIndex.set(0);
  revealedCards.set(new Set());
  isSkipping.set(false);
  packError.set(null);
  storageError.set(null);
  currentPack.set(null);

  // Set to generating state BEFORE async work
  packState.set('generating');

  try {
    // Race between generation and timeout
    await Promise.race([
      (async () => {
        // Start timer for pack generation
        const generationStartTime = performance.now();

        // Get pack configuration based on type
        const packConfig = getPackConfig(finalPackType, finalThemeType);

        // PACK-003: Get pity counter for bad luck protection
        const pityCounter = getPityCounter();

        // Generate pack with configuration and pity counter (PACK-003)
        const pack = generatePack(packConfig, undefined, pityCounter);

        // PACK-027: Randomly select tear animation
        const tearAnimation = selectRandomTearAnimation();
        currentTearAnimation.set(tearAnimation);

        // Add tear animation to pack metadata
        (pack as any).tearAnimation = tearAnimation;

        // Calculate pack generation time for UX delay
        const generationElapsed = performance.now() - generationStartTime;

        // Ensure minimum delay for smooth UX (target: 200ms, max: 500ms)
        const targetDelay = 200;
        const maxDelay = 500;
        const remainingDelay = Math.max(0, Math.min(targetDelay - generationElapsed, maxDelay - generationElapsed));

        if (remainingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingDelay));
        }

        // Validate pack has cards
        if (!pack || pack.cards.length === 0) {
          throw new Error('Generated pack has no cards');
        }

        // Try to ensure collection is initialized, but don't block if it fails
        try {
          await Promise.race([
            ensureCollectionInitialized(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Collection init timeout')), 2000))
          ]);
        } catch (initError) {
          console.warn('[Pack] Collection initialization failed or timed out, continuing without persistence:', initError);
        }

        // Save pack to collection (IndexedDB) - COMPLETELY NON-BLOCKING
        // This runs in background and won't affect pack opening if it fails
        // Uses setTimeout to break out of Promise chain and prevent blocking
        setTimeout(() => {
          addPackToCollection(pack)
            .then(saveResult => {
              if (saveResult.success) {
                // UX-007: Show visual confirmation toast when cards are saved
                showToast('✨ Cards saved to your collection!', 'success');
              } else {
                // Create user-friendly error message
                const storageAppError = createAppError(
                  'storage',
                  'Pack saved to temporary storage. Your collection may not persist after browser refresh.',
                  [
                    {
                      label: 'Manage Storage',
                      action: () => {
                        storageError.set(null);
                        window.location.href = '/settings';
                      },
                      primary: true,
                    },
                    {
                      label: 'Dismiss',
                      action: () => storageError.set(null),
                    },
                  ]
                );
                storageError.set(storageAppError);
                logError(storageAppError, saveResult.error);
              }
            })
            .catch(error => {
              // Last resort error handler - should never reach here
              console.error('[Pack] Critical storage error:', error);

              const fallbackError = createAppError(
                'storage',
                'Pack saved to temporary storage. Your collection may not persist after browser refresh.',
                [
                  {
                    label: 'Manage Storage',
                    action: () => {
                      storageError.set(null);
                      window.location.href = '/settings';
                    },
                    primary: true,
                  },
                  {
                    label: 'Dismiss',
                    action: () => storageError.set(null),
                  },
                ]
              );
              storageError.set(fallbackError);
            });
        }, 0);

        // SEC-002: Record pack open for rate limiting
        recordPackOpen();

        // Track pack open event
        trackEvent({
          type: 'pack_open',
          data: {
            packId: pack.id,
            cardCount: pack.cards.length,
            packType: finalPackType,
            themeType: finalThemeType,
          },
        });

        // Set the pack and transition to pack animation
        currentPack.set(pack);
        packState.set('pack_animate');

        // Record pack open start time for duration tracking
        packOpenStartTime = Date.now();
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Pack generation timed out')), 8000)
      )
    ]);
  } catch (error) {
    // Create friendly generation error
    const appError = createAppError(
      'generation',
      error instanceof Error ? error : 'Failed to generate pack',
      [
        {
          label: 'Try Again',
          action: () => openNewPack(finalPackType, finalThemeType),
          primary: true,
        },
        {
          label: 'Go Home',
          action: () => {
            window.location.href = '/';
          },
        },
      ]
    );
    packError.set(appError);
    packState.set('idle');
    logError(appError, error);
  }
}

// Reveal all cards and show results (vertical-slice flow)
export function showPackResults(options: { skipped?: boolean } = {}): void {
  const pack = currentPack.get();
  if (!pack) return;

  const skipped = options.skipped ?? false;

  // Reveal all cards
  const allRevealed = new Set<number>();
  const updatedCards = pack.cards.map((card, index) => {
    allRevealed.add(index);
    return { ...card, isRevealed: true };
  });

  revealedCards.set(allRevealed);
  currentPack.set({ ...pack, cards: updatedCards });

  packState.set('results');
  isSkipping.set(skipped);

  // Track pack completion event
  trackPackComplete(pack, skipped);
}

// Complete pack animation and show results
export function completePackAnimation(): void {
  // PACK-028: Check if animations should be skipped
  const skipAnimations = skipAnimationsStore.get();

  if (skipAnimations) {
    // Skip to results immediately
    skipToResults();
    return;
  }

  // Haptic feedback on pack open
  haptics.packOpen();

  // In the MVP vertical slice, we go straight to results after the tear
  showPackResults({ skipped: false });
}

// Reveal a specific card
// NOTE: In the MVP vertical slice, we reveal the full pack at once.
// This method remains for compatibility with existing components.
export function revealCard(
  index: number,
  options: { autoRevealed?: boolean } = {}
): void {
  const pack = currentPack.get();
  if (!pack || index < 0 || index >= pack.cards.length) return;

  const revealed = new Set(revealedCards.get());
  const wasAlreadyRevealed = revealed.has(index);

  revealed.add(index);
  revealedCards.set(revealed);

  // Update the card's revealed state
  const updatedCards = [...pack.cards];
  updatedCards[index] = { ...updatedCards[index], isRevealed: true };
  currentPack.set({ ...pack, cards: updatedCards });

  // Track card reveal event (only if not already revealed)
  if (!wasAlreadyRevealed) {
    const card = pack.cards[index];
    trackEvent({
      type: 'card_reveal',
      data: {
        packId: pack.id,
        cardIndex: index,
        cardId: card.id,
        rarity: card.rarity,
        isHolo: card.isHolo,
        holoType: card.holoType,
        autoRevealed: options.autoRevealed || false,
      },
    });

    // Haptic feedback for rare+ cards
    haptics.cardReveal(card.rarity);
  }

  packState.set('results');
}

// Reveal the current card
export function revealCurrentCard(): void {
  const index = currentCardIndex.get();
  revealCard(index);
}

// Navigate to next card
export function nextCard(): void {
  const pack = currentPack.get();
  if (!pack) return;

  const currentIndex = currentCardIndex.get();
  if (currentIndex < pack.cards.length - 1) {
    currentCardIndex.set(currentIndex + 1);
  } else {
    // All cards viewed, show results
    packState.set('results');
  }
}

// Navigate to previous card
export function prevCard(): void {
  const currentIndex = currentCardIndex.get();
  if (currentIndex > 0) {
    currentCardIndex.set(currentIndex - 1);
  }
}

// Go to a specific card
export function goToCard(index: number): void {
  const pack = currentPack.get();
  if (!pack || index < 0 || index >= pack.cards.length) return;
  currentCardIndex.set(index);
}

// Skip to results
export function skipToResults(): void {
  const pack = currentPack.get();
  if (!pack) return;

  // Reveal all cards
  const allRevealed = new Set<number>();
  const updatedCards = pack.cards.map((card, index) => {
    allRevealed.add(index);
    return { ...card, isRevealed: true };
  });

  revealedCards.set(allRevealed);
  currentPack.set({ ...pack, cards: updatedCards });
  packState.set('results');
  isSkipping.set(true);

  // Track pack completion event
  trackPackComplete(pack, true);
}

// Reset to idle state
export function resetPack(): void {
  currentPack.set(null);
  packState.set('idle');
  currentCardIndex.set(0);
  revealedCards.set(new Set());
  isSkipping.set(false);
  packError.set(null);
  storageError.set(null);
}

// Show results screen
export function showResults(): void {
  const pack = currentPack.get();
  if (pack) {
    // Track pack completion event
    trackPackComplete(pack, isSkipping.get());
  }
  packState.set('results');
}

/**
 * Track pack completion event
 */
function trackPackComplete(pack: Pack, skipped: boolean): void {
  const duration = packOpenStartTime ? Date.now() - packOpenStartTime : 0;
  const holoCount = pack.cards.filter((c) => c.isHolo).length;

  trackEvent({
    type: 'pack_complete',
    data: {
      packId: pack.id,
      cardCount: pack.cards.length,
      bestRarity: pack.bestRarity,
      holoCount,
      duration,
      skipped,
    },
  });

  // Show toast notification for pack opened (PACK-080)
  const bestRarityLabel = pack.bestRarity.charAt(0).toUpperCase() + pack.bestRarity.slice(1);
  showToast(`Pack opened! Best card: ${bestRarityLabel}${holoCount > 0 ? ` (${holoCount} holo)` : ''}`, 'success');

  // Reset pack open start time
  packOpenStartTime = null;
}

// Auto-reveal sequence state
let autoRevealTimer: ReturnType<typeof setInterval> | null = null;
let autoRevealIndex = 0;

/**
 * Start auto-reveal sequence with staggered timing
 * Cards reveal one-by-one with 0.3s delay between each
 * Can be cancelled by user interaction
 */
export function startAutoReveal(): void {
  const pack = currentPack.get();
  if (!pack || pack.cards.length === 0) return;

  // Cancel any existing auto-reveal
  stopAutoReveal();

  autoRevealIndex = 0;
  const delay = 300; // 0.3s between cards

  autoRevealTimer = setInterval(() => {
    const activePack = currentPack.get();
    if (!activePack || autoRevealIndex >= activePack.cards.length) {
      stopAutoReveal();
      // Track pack completion after auto-reveal finishes
      if (activePack) {
        trackPackComplete(activePack, false);
      }
      packState.set('results');
      return;
    }

    // Reveal current card (mark as auto-revealed)
    revealCard(autoRevealIndex, { autoRevealed: true });

    // Move to next card
    autoRevealIndex++;
    currentCardIndex.set(autoRevealIndex);
  }, delay);
}

/**
 * Stop the auto-reveal sequence
 * Called when user interacts (clicks, taps, presses key)
 */
export function stopAutoReveal(): void {
  if (autoRevealTimer) {
    clearInterval(autoRevealTimer);
    autoRevealTimer = null;
  }
  autoRevealIndex = 0;
}
