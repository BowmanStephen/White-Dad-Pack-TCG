import { atom, computed } from 'nanostores';
import type { Pack, PackState, PackType } from '../types';
import { generatePack, getPackStats } from '../lib/pack/generator';
import { generatePremiumPack } from '../lib/pack/premium-generator';
import { addPackToCollection } from './collection';
import { trackEvent } from './analytics';
import { createAppError, logError, type AppError } from '../lib/utils/errors';
import {
  checkAndUnlockAchievements,
  getAchievementContext,
} from './achievements';
import {
  currentPackType,
  usePremiumPack,
  hasPremiumPacks,
} from './premium';
import {
  initSecurity,
  validatePackBeforeOpen,
  recordSuccessfulPackOpen,
  isCurrentUserBanned,
  getBanStatus,
} from './security';

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

/**
 * Actions
 */

// Start opening a new pack (standard or premium)
export async function openNewPack(): Promise<void> {
  // Initialize security system if not already initialized
  await initSecurity();

  // Check if user is banned
  if (isCurrentUserBanned()) {
    const ban = getBanStatus();
    const appError = createAppError(
      'banned',
      ban.reason || 'Your account has been suspended due to suspicious activity.',
      [
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
    return;
  }

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
    // Get current pack type (standard or premium)
    const packType = currentPackType.get();
    let pack: Pack;

    if (packType === 'premium') {
      // Check if user has premium packs available
      if (!hasPremiumPacks()) {
        throw new Error('No premium packs available. Please purchase a premium pack first.');
      }

      // Use a premium pack from inventory
      const used = usePremiumPack('premium_single');
      if (!used) {
        throw new Error('Failed to use premium pack from inventory.');
      }

      // Generate premium pack with boosted rates
      pack = generatePremiumPack('premium_single');
    } else {
      // Generate standard pack
      pack = generatePack();
    }

    // Simulate minimal delay to ensure loading state is visible (min 200ms)
    const startTime = performance.now();
    const elapsed = performance.now() - startTime;
    const minDelay = 200;

    // Ensure minimum delay for UX (but cap at 500ms per requirements)
    const remainingDelay = Math.max(0, Math.min(minDelay - elapsed, 500 - elapsed));
    if (remainingDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingDelay));
    }

    // Validate pack has cards
    if (!pack || pack.cards.length === 0) {
      throw new Error('Generated pack has no cards');
    }

    // Security: Validate pack integrity and check for exploits
    const validationResult = await validatePackBeforeOpen(pack);
    if (!validationResult.valid) {
      // Create security error
      const securityError = createAppError(
        'security',
        validationResult.violation?.details || 'Pack validation failed. Please try again.',
        [
          {
            label: 'Try Again',
            action: () => openNewPack(),
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
      packError.set(securityError);
      packState.set('idle');
      logError(securityError, validationResult.violation);
      return;
    }

    // Save pack to collection (LocalStorage)
    const saveResult = addPackToCollection(pack);
    if (!saveResult.success) {
      // Create storage error but don't block the pack opening
      const storageAppError = createAppError(
        'storage',
        saveResult.error || 'Failed to save pack to collection',
        [
          {
            label: 'Dismiss',
            action: () => storageError.set(null),
          },
        ]
      );
      storageError.set(storageAppError);
      logError(storageAppError, saveResult.error);
    }

    // Security: Record successful pack open
    recordSuccessfulPackOpen(pack, packType);

    // Track pack open event
    trackEvent({
      type: 'pack_open',
      data: {
        packId: pack.id,
        cardCount: pack.cards.length,
        packType,
        ...(packType === 'premium' && { premiumConfigId: 'premium_single' }),
      },
    });

    // Set the pack and transition to pack animation
    currentPack.set(pack);
    packState.set('pack_animate');

    // Record pack open start time for duration tracking
    packOpenStartTime = Date.now();
  } catch (error) {
    // Create friendly generation error
    const appError = createAppError(
      'generation',
      error instanceof Error ? error : 'Failed to generate pack',
      [
        {
          label: 'Try Again',
          action: () => openNewPack(),
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

// Complete pack animation and show cards
export function completePackAnimation(): void {
  packState.set('cards_ready');
}

// Reveal a specific card
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
  }

  packState.set('revealing');
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

  // Check for achievements after pack completion
  const context = getAchievementContext(pack);
  const newlyUnlocked = checkAndUnlockAchievements(context);

  // Log newly unlocked achievements (in development)
  if (import.meta.env.DEV && newlyUnlocked.length > 0) {
    console.log(
      `[Achievements] Unlocked ${newlyUnlocked.length} achievement(s):`,
      newlyUnlocked.map((a) => a.name).join(', ')
    );
  }

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
