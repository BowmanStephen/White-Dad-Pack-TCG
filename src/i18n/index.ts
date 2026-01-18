/**
 * i18n Module - Internationalization Stub
 * 
 * This is a minimal implementation that returns English strings.
 * The full i18n system was removed for simplicity.
 */

// i18n Module - Internationalization Stub (simplified)

export type Locale = 'en';

// Simple English translations for common keys
const translations: Record<string, string> = {
  // Deck-related
  'deck.title': 'Deck Builder',
  'deck.newDeckTitle': 'New Deck',
  'deck.createNew': 'Create New Deck',
  'deck.editDeck': 'Edit Deck',
  'deck.save': 'Save',
  'deck.back': 'Back',
  'deck.delete': 'Delete',
  'deck.duplicate': 'Duplicate',
  'deck.noDecks': 'No Decks Yet',
  'deck.noDecksDescription': 'Create your first deck to start building!',
  'deck.createFirst': 'Create Your First Deck',
  'deck.maxDecksReached': 'Max decks reached',
  'deck.confirmDelete': 'Are you sure you want to delete this deck?',
  'deck.deckInfo': 'Deck Info',
  'deck.name': 'Deck Name',
  'deck.namePlaceholder': 'Enter deck name...',
  'deck.description': 'Description',
  'deck.descriptionPlaceholder': 'Describe your deck strategy...',
  'deck.cardsInDeck': 'Cards in Deck',
  'deck.addCards': 'Add Cards',
  'deck.emptyDeck': 'No cards in deck yet',
  'deck.lastUpdated': 'Last updated',
  'deck.errors.maxDecksReached': 'Maximum number of decks reached',
  'deck.errors.createFailed': 'Failed to create deck',
  'deck.errors.saveFailed': 'Failed to save deck',
  'deck.errors.duplicateFailed': 'Failed to duplicate deck',
  'deck.errors.addCardFailed': 'Failed to add card',
  'deck.stats.totalCards': 'Total Cards',
  'deck.stats.uniqueCards': 'Unique Cards',
  'deck.stats.averageRating': 'Avg Rating',
  'deck.stats.rarityBreakdown': 'Rarity Breakdown',
  'deck.stats.typeBreakdown': 'Type Breakdown',
  'deck.stats.averageStats': 'Average Stats',
  
  // Synergy
  'deck.synergy.title': 'Synergy Analysis',
  'deck.synergy.bonus': 'Synergy Bonus',
  'deck.synergy.potential': 'Potential',
  'deck.synergy.currentBonus': 'Current Bonus',
  'deck.synergy.typeSuggestions': 'Type Suggestions',
  'deck.synergy.recommendedCards': 'Recommended Cards',
  'deck.synergy.dominantType': 'Dominant Type',
  
  // Optimization
  'deck.optimization.title': 'Deck Optimization',
  'deck.optimization.balance': 'Balance Score',
  'deck.optimization.balancedDeck': 'Well Balanced!',
  'deck.optimization.weakestStat': 'Weakest Stat',
  'deck.optimization.targetValue': 'Target: {value}',
  'deck.optimization.improveDeck': 'Add cards with high {stat}',
  'deck.optimization.priorityHigh': 'High Priority',
  'deck.optimization.priorityMedium': 'Medium',
  'deck.optimization.priorityLow': 'Low',
  'deck.optimization.statImbalances': 'Stat Imbalances',
  'deck.optimization.aboveAverage': 'Above Avg',
  'deck.optimization.belowAverage': 'Below Avg',
  'deck.optimization.recommendations': 'Recommendations',
  'deck.optimization.noRecommendations': 'No specific recommendations',
  
  // Common
  'common.close': 'Close',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',

  // Achievements
  'achievements.title': 'Achievements',
  'achievements.subtitle': 'Track your progress and unlock rewards',

  // Batch Opening
  'batch.openMultiple': 'Open Multiple Packs',
  'batch.selectCount': 'Select number of packs to open:',
  'batch.fastForwardInfo': 'Packs will open in fast-forward mode with no animations',
  'batch.openPacks': 'Open {count} Packs',
  'batch.opening': 'Opening Packs...',
  'batch.progress': 'Opening pack {current} of {total}',
  'batch.cardsOpened': 'Cards Opened',
  'batch.complete': 'Complete',
  'batch.currentPack': 'Current Pack Preview',
  'batch.cancel': 'Cancel',
  'batch.paused': 'Batch Paused',
  'batch.pausedInfo': '{opened} of {total} packs opened before pause',
  'batch.resume': 'Resume',
  'batch.reset': 'Reset',
  'batch.newBatch': 'Start New Batch',
  'batch.completeTitle': 'Batch Complete!',

  // Performance Monitoring (PACK-102)
  'performance.title': 'Performance Dashboard',
  'performance.description': 'Real-time performance monitoring for development',
  'batch.completeInfo': '{count} packs opened successfully',
  'batch.resultsTitle': 'Batch Results',
  'batch.packsOpened': 'Packs Opened',
  'batch.totalCards': 'Total Cards',
  'batch.holoCount': 'Holo Cards',
  'batch.duration': 'Duration',
  'batch.rarityBreakdown': 'Rarity Breakdown',
  'batch.bestPulls': 'Best Pulls',
  'batch.allCards': 'All Cards',
  'batch.noResults': 'No batch results available',
};

/**
 * Translation function - returns the English string for a key
 * Falls back to converting the key to a readable format if not found
 */
export function t(key: string, params?: Record<string, string | number>): string {
  let result = translations[key];
  
  if (!result) {
    // Convert key to readable format as fallback
    // e.g., 'deck.someKey' -> 'Some Key'
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];
    result = lastPart
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  // Replace {param} placeholders
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      result = result.replace(`{${param}}`, String(value));
    });
  }
  
  return result;
}

// Note: Use t('key') directly in templates, not $t('key')
// The $t store pattern was removed for simplicity

/**
 * Format number according to locale (English formatting)
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Format date according to locale (English formatting)
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}
