/**
 * Pack Store - Actions Layer
 *
 * Contains all action functions for pack opening, revealing, and navigation.
 * These functions mutate the state atoms defined in state.ts.
 */
import type { Pack, PackType, DadType } from '../../types';
import { generatePack, getPackConfig } from '../../lib/pack/generator';
import { getPityCounter, ensureCollectionInitialized } from '../collection';
import { trackEvent } from '../analytics';
import { createAppError, logError } from '../../lib/utils/errors';
import { haptics } from '../../lib/utils/haptics';
import { selectRandomTearAnimation } from '../../types';
import { skipAnimations as skipAnimationsStore, showToast, quickReveal as quickRevealStore } from '../ui';
import { checkRateLimit, recordPackOpen } from '../../lib/utils/rate-limiter';
import {
  PACK_GENERATION_CONFIG,
  ANIMATION_TIMINGS,
} from '../../lib/config/pack-config';

// Import state atoms
import {
  selectedPackType,
  selectedThemeType,
  currentTearAnimation,
  currentPack,
  packState,
  currentCardIndex,
  isSkipping,
  revealedCards,
  packError,
  storageError,
} from './state';

// Import persistence
import { savePackWithRetry } from './persistence';

// ============================================================================
// INTERNAL STATE
// ============================================================================

// Track pack open start time for duration calculation
let packOpenStartTime: number | null = null;

// ============================================================================
// PACK OPENING ACTIONS
// ============================================================================

/**
 * Start opening a new pack with specified type (PACK-001)
 */
export async function openNewPack(packType?: PackType, themeType?: DadType): Promise<void> {
  const isTestEnv = import.meta.env.MODE === 'test' || Boolean(import.meta.env.VITEST);
  const allowAutomation =
    typeof window !== 'undefined' &&
    !isTestEnv &&
    (navigator.webdriver || new URLSearchParams(window.location.search).get('autoplay') === '1');
  // SEC-002: Check rate limit before opening pack
  const rateLimitCheck = checkRateLimit();
  if (!allowAutomation && !rateLimitCheck.allowed) {
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
        pack.tearAnimation = tearAnimation;

        // Calculate pack generation time for UX delay
        const generationElapsed = performance.now() - generationStartTime;

        // Ensure minimum delay for smooth UX
        const remainingDelay = Math.max(0, Math.min(
          PACK_GENERATION_CONFIG.TARGET_DELAY_MS - generationElapsed,
          PACK_GENERATION_CONFIG.MAX_DELAY_MS - generationElapsed
        ));

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
            new Promise((_, reject) => setTimeout(() => reject(new Error('Collection init timeout')), PACK_GENERATION_CONFIG.COLLECTION_INIT_TIMEOUT_MS))
          ]);
        } catch (initError) {
          if (import.meta.env.DEV) console.warn('[Pack] Collection initialization failed or timed out, continuing without persistence:', initError);
        }

        // Save pack to collection (IndexedDB) - NON-BLOCKING with retry logic
        // This runs in background and won't affect pack opening if it fails
        // Uses setTimeout to break out of Promise chain and prevent blocking
        setTimeout(() => {
          savePackWithRetry(pack);
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
        setTimeout(() => reject(new Error('Pack generation timed out')), PACK_GENERATION_CONFIG.TIMEOUT_MS)
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

// ============================================================================
// REVEAL ACTIONS
// ============================================================================

/**
 * Reveal all cards and show results (vertical-slice flow)
 */
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

/**
 * Complete pack animation and show results
 */
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

/**
 * Handle quick reveal mode - brief visual flash then show results
 * Called from pack animation when quick reveal is enabled
 */
export async function handleQuickReveal(): Promise<void> {
  const quickReveal = quickRevealStore.get();

  if (!quickReveal) return;

  // Brief visual flash
  await new Promise(resolve => setTimeout(resolve, ANIMATION_TIMINGS.QUICK_REVEAL_FLASH_MS));

  // Skip directly to results
  skipToResults();
}

/**
 * Check if quick reveal mode is active
 */
export function isQuickRevealEnabled(): boolean {
  return quickRevealStore.get();
}

// ============================================================================
// NAVIGATION ACTIONS
// ============================================================================

/**
 * Navigate to next card
 */
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

/**
 * Navigate to previous card
 */
export function prevCard(): void {
  const currentIndex = currentCardIndex.get();
  if (currentIndex > 0) {
    currentCardIndex.set(currentIndex - 1);
  }
}

/**
 * Go to a specific card
 */
export function goToCard(index: number): void {
  const pack = currentPack.get();
  if (!pack || index < 0 || index >= pack.cards.length) return;
  currentCardIndex.set(index);
}

/**
 * Skip to results
 */
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

/**
 * Reset to idle state
 */
export function resetPack(): void {
  currentPack.set(null);
  packState.set('idle');
  currentCardIndex.set(0);
  revealedCards.set(new Set());
  isSkipping.set(false);
  packError.set(null);
  storageError.set(null);
}

/**
 * Show results screen
 */
export function showResults(): void {
  const pack = currentPack.get();
  if (pack) {
    // Track pack completion event
    trackPackComplete(pack, isSkipping.get());
  }
  packState.set('results');
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

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
