import * as pack from '../../stores/pack';

/**
 * Get current values from all Nanostores
 */
export function getStoreValues() {
  return {
    currentPack: pack.currentPack.get(),
    packState: pack.packState.get(),
    currentCardIndex: pack.currentCardIndex.get(),
    revealedCards: pack.revealedCards.get(),
    allCardsRevealed: pack.allCardsRevealed.get(),
    packStats: pack.packStats.get(),
    packError: pack.packError.get(),
  };
}

/**
 * Subscribe to all Nanostores and call callback when any change
 */
export function subscribeToStores(callback: (values: ReturnType<typeof getStoreValues>) => void) {
  const unsubscribers = [
    pack.currentPack.subscribe(() => callback(getStoreValues())),
    pack.packState.subscribe(() => callback(getStoreValues())),
    pack.currentCardIndex.subscribe(() => callback(getStoreValues())),
    pack.revealedCards.subscribe(() => callback(getStoreValues())),
    pack.allCardsRevealed.subscribe(() => callback(getStoreValues())),
    pack.packStats.subscribe(() => callback(getStoreValues())),
    pack.packError.subscribe(() => callback(getStoreValues())),
  ];

  // Return unsubscribe function
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}
