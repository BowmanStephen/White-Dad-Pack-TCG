/**
 * Pack Store - State Layer
 *
 * Contains all atom and computed store definitions for pack opening state.
 * This is the single source of truth for pack-related reactive state.
 */
import { atom, computed } from 'nanostores';
import type { Pack, PackState, PackType, DadType, TearAnimation } from '../../types';
import type { AppError } from '../../lib/utils/errors';
import { getPackStats } from '../../lib/pack/generator';
import { getRateLimitStatus } from '../../lib/utils/rate-limiter';

// ============================================================================
// SELECTION STATE
// ============================================================================

/** Current pack type selection (for UI state) */
export const selectedPackType = atom<PackType>('standard');

/** Current theme type selection (for theme packs) */
export const selectedThemeType = atom<DadType | undefined>(undefined);

/** PACK-027: Current tear animation type */
export const currentTearAnimation = atom<TearAnimation>('standard');

// ============================================================================
// PACK STATE
// ============================================================================

/** Current pack being opened */
export const currentPack = atom<Pack | null>(null);

/** Current state of the pack opening flow */
export const packState = atom<PackState>('idle');

/** Index of the currently viewed card */
export const currentCardIndex = atom<number>(0);

/** Whether the user is skipping animations */
export const isSkipping = atom<boolean>(false);

/** Track which cards have been revealed */
export const revealedCards = atom<Set<number>>(new Set());

// ============================================================================
// ERROR STATE
// ============================================================================

/** Error state store with full AppError object */
export const packError = atom<AppError | null>(null);

/** Storage error state with full AppError object */
export const storageError = atom<AppError | null>(null);

// ============================================================================
// COMPUTED STORES
// ============================================================================

/** SEC-002: Rate limit status (reactive) */
export const rateLimitStatus = computed(
  [], // No dependencies - will be updated manually
  () => getRateLimitStatus()
);

/** Get the current card being viewed */
export const currentCard = computed(
  [currentPack, currentCardIndex],
  (pack, index) => {
    if (!pack || index < 0 || index >= pack.cards.length) return null;
    return pack.cards[index];
  }
);

/** Check if all cards are revealed */
export const allCardsRevealed = computed(
  [currentPack, revealedCards],
  (pack, revealed) => {
    if (!pack) return false;
    return revealed.size >= pack.cards.length;
  }
);

/** Get pack statistics */
export const packStats = computed(currentPack, (pack) => {
  if (!pack) return null;
  return getPackStats(pack);
});

/** Progress through the pack (0-1) */
export const packProgress = computed(
  [currentPack, revealedCards],
  (pack, revealed) => {
    if (!pack || pack.cards.length === 0) return 0;
    return revealed.size / pack.cards.length;
  }
);

/** Loading state for pack operations */
export const isLoading = computed(packState, (state) => {
  return state === 'generating' || state === 'pack_animate';
});
