/**
 * Pack Store - Public API
 *
 * Re-exports all public state and actions from the pack store modules.
 * This maintains backward compatibility with existing imports from '@/stores/pack'.
 */

// State atoms and computed stores
export {
  // Selection state
  selectedPackType,
  selectedThemeType,
  currentTearAnimation,
  // Pack state
  currentPack,
  packState,
  currentCardIndex,
  isSkipping,
  revealedCards,
  // Error state
  packError,
  storageError,
  // Computed stores
  rateLimitStatus,
  currentCard,
  allCardsRevealed,
  packStats,
  packProgress,
  isLoading,
} from './state';

// Actions
export {
  // Pack opening
  openNewPack,
  // Reveal actions
  showPackResults,
  completePackAnimation,
  handleQuickReveal,
  isQuickRevealEnabled,
  revealCard,
  revealCurrentCard,
  // Navigation
  nextCard,
  prevCard,
  goToCard,
  skipToResults,
  resetPack,
  showResults,
  // Auto-reveal
  startAutoReveal,
  stopAutoReveal,
} from './actions';

// Persistence (internal use, but exported for testing)
export {
  savePackWithRetry,
  retryAllPendingSaves,
  getPendingSaves,
} from './persistence';
