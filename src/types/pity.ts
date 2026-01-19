// ============================================================================
// PITY SYSTEM TYPES (Bad Luck Protection)
// ============================================================================

// Pity counter for tracking packs since last pull of each rarity
export interface PityCounter {
  packsSinceRare: number;
  packsSinceEpic: number;
  packsSinceLegendary: number;
  packsSinceMythic: number;
  lastUpdated: Date;
}

// Pity thresholds configuration
export interface PityThresholds {
  rare: {
    softPity: number;
    hardPity: number;
    softPityMultiplier: number;
  };
  epic: {
    softPity: number;
    hardPity: number;
    softPityMultiplier: number;
  };
  legendary: {
    softPity: number;
    hardPity: number;
    softPityMultiplier: number;
  };
  mythic: {
    softPity: number;
    hardPity: number;
    softPityMultiplier: number;
  };
}

// Default pity thresholds
export const DEFAULT_PITY_THRESHOLDS: PityThresholds = {
  rare: {
    softPity: 15,
    hardPity: 30,
    softPityMultiplier: 1.5,
  },
  epic: {
    softPity: 40,
    hardPity: 60,
    softPityMultiplier: 2.0,
  },
  legendary: {
    softPity: 80,
    hardPity: 100,
    softPityMultiplier: 3.0,
  },
  mythic: {
    softPity: 150,
    hardPity: 200,
    softPityMultiplier: 5.0,
  },
};

// Pity state for UI display
export interface PityState {
  counters: PityCounter;
  thresholds: PityThresholds;
  rareProgress: number;
  epicProgress: number;
  legendaryProgress: number;
  mythicProgress: number;
  rareSoftPityActive: boolean;
  epicSoftPityActive: boolean;
  legendarySoftPityActive: boolean;
  mythicSoftPityActive: boolean;
  rareGuaranteed: boolean;
  epicGuaranteed: boolean;
  legendaryGuaranteed: boolean;
  mythicGuaranteed: boolean;
}
