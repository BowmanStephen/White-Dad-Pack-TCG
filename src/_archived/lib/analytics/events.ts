/**
 * Analytics Events System
 *
 * Provides utilities for tracking pack opening events and aggregating statistics
 * for game balancing and analytics.
 *
 * @module analytics/events
 */

import type {
  AnyAnalyticsEvent,
  Rarity,
  PackCard,
  Pack,
  DadType,
  PackType,
} from '@/types';
import { getStoredEvents } from '@/stores/analytics';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Rarity distribution for a single pack
 */
export interface PackRarityDistribution {
  packId: string;
  timestamp: number;
  cardCount: number;
  distribution: Record<Rarity, number>;
  bestRarity: Rarity;
  holoCount: number;
  packType?: PackType;
  themeType?: DadType;
}

/**
 * Pack opening timing metrics
 */
export interface PackOpeningTiming {
  packId: string;
  openedAt: number;
  completedAt: number;
  duration: number; // milliseconds
  skipped: boolean;
  timeBetweenOpens?: number; // milliseconds since previous pack
}

/**
 * Aggregated rarity statistics across multiple packs
 */
export interface RarityStatistics {
  totalPacks: number;
  totalCards: number;
  averageCardsPerPack: number;
  rarityDistribution: Record<Rarity, {
    count: number;
    percentage: number;
    perPackAverage: number;
  }>;
  holoRate: number; // percentage of cards that are holo
  bestRarityDistribution: Record<Rarity, number>; // count of packs with each as best rarity
  packTypeDistribution?: Record<PackType, number>; // breakdown by pack type
}

/**
 * Timing statistics for pack openings
 */
export interface TimingStatistics {
  averageOpenTime: number; // average ms to complete pack opening
  medianOpenTime: number;
  minOpenTime: number;
  maxOpenTime: number;
  averageTimeBetweenOpens: number; // average ms between pack opens
  skippedRate: number; // percentage of packs skipped
}

/**
 * Complete analytics summary for balancing
 */
export interface AnalyticsSummary {
  rarity: RarityStatistics;
  timing: TimingStatistics;
  period: {
    start: number;
    end: number;
    duration: number; // milliseconds
  };
}

// ============================================================================
// RARITY DISTRIBUTION TRACKING
// ============================================================================

/**
 * Extract rarity distribution from a pack
 *
 * @param pack - The pack to analyze
 * @param packType - Optional pack type (standard, premium, theme)
 * @param themeType - Optional theme type for theme packs
 * @returns Rarity distribution data for analytics
 *
 * @example
 * const pack = generatePack();
 * const distribution = extractRarityDistribution(pack, 'standard');
 * // Returns: { packId, timestamp, cardCount: 6, distribution: { common: 3, uncommon: 2, rare: 1, ... }, ... }
 */
export function extractRarityDistribution(
  pack: Pack,
  packType?: PackType,
  themeType?: DadType
): PackRarityDistribution {
  const distribution: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  let holoCount = 0;

  // Count each rarity and holos
  for (const card of pack.cards) {
    (distribution as Record<string, number>)[card.rarity]++;
    if (card.isHolo) {
      holoCount++;
    }
  }

  return {
    packId: pack.id,
    timestamp: pack.openedAt.getTime(),
    cardCount: pack.cards.length,
    distribution,
    bestRarity: pack.bestRarity,
    holoCount,
    packType,
    themeType,
  };
}

/**
 * Aggregate rarity statistics from stored events
 *
 * @param options - Optional filters for aggregation
 * @returns Aggregated rarity statistics
 *
 * @example
 * // Get all-time stats
 * const stats = await aggregateRarityStats();
 *
 * @example
 * // Get stats for last 7 days
 * const weekStats = await aggregateRarityStats({
 *   startDate: Date.now() - 7 * 24 * 60 * 60 * 1000
 * });
 */
export function aggregateRarityStats(options?: {
  startDate?: number;
  endDate?: number;
  packType?: PackType;
  maxPacks?: number;
}): RarityStatistics {
  const events = getStoredEvents();

  // Filter events
  let filteredEvents = events.filter(
    (event): event is AnyAnalyticsEvent =>
      event.type === 'pack_open' || event.type === 'pack_complete'
  );

  // Apply date range filter
  if (options?.startDate) {
    filteredEvents = filteredEvents.filter(
      (event) => event.timestamp >= options.startDate!
    );
  }

  if (options?.endDate) {
    filteredEvents = filteredEvents.filter(
      (event) => event.timestamp <= options.endDate!
    );
  }

  // Apply pack type filter (would need to check event data)
  // For now, we'll process all events

  // Limit to most recent packs if specified
  if (options?.maxPacks) {
    filteredEvents = filteredEvents.slice(-options.maxPacks);
  }

  // Initialize counters
  let totalPacks = 0;
  let totalCards = 0;
  const rarityCounts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };
  let totalHoloCount = 0;
  const bestRarityCounts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  // Aggregate from pack_complete events (has most data)
  for (const event of filteredEvents) {
    if (event.type === 'pack_complete') {
      totalPacks++;
      totalCards += event.data.cardCount;
      totalHoloCount += event.data.holoCount;
      (bestRarityCounts as Record<string, number>)[event.data.bestRarity]++;

      // Note: pack_complete doesn't include full rarity distribution
      // For full distribution, we'd need to aggregate from card_reveal events
    }
  }

  // Calculate percentages
  const percentage = (count: number) =>
    totalCards > 0 ? (count / totalCards) * 100 : 0;

  const rarityDistribution: Record<Rarity, {
    count: number;
    percentage: number;
    perPackAverage: number;
  }> = {
    common: {
      count: rarityCounts.common,
      percentage: percentage(rarityCounts.common),
      perPackAverage: totalPacks > 0 ? rarityCounts.common / totalPacks : 0,
    },
    uncommon: {
      count: rarityCounts.uncommon,
      percentage: percentage(rarityCounts.uncommon),
      perPackAverage: totalPacks > 0 ? rarityCounts.uncommon / totalPacks : 0,
    },
    rare: {
      count: rarityCounts.rare,
      percentage: percentage(rarityCounts.rare),
      perPackAverage: totalPacks > 0 ? rarityCounts.rare / totalPacks : 0,
    },
    epic: {
      count: rarityCounts.epic,
      percentage: percentage(rarityCounts.epic),
      perPackAverage: totalPacks > 0 ? rarityCounts.epic / totalPacks : 0,
    },
    legendary: {
      count: rarityCounts.legendary,
      percentage: percentage(rarityCounts.legendary),
      perPackAverage: totalPacks > 0 ? rarityCounts.legendary / totalPacks : 0,
    },
    mythic: {
      count: rarityCounts.mythic,
      percentage: percentage(rarityCounts.mythic),
      perPackAverage: totalPacks > 0 ? rarityCounts.mythic / totalPacks : 0,
    },
  };

  return {
    totalPacks,
    totalCards,
    averageCardsPerPack: totalPacks > 0 ? totalCards / totalPacks : 0,
    rarityDistribution,
    holoRate: totalCards > 0 ? (totalHoloCount / totalCards) * 100 : 0,
    bestRarityDistribution: bestRarityCounts,
  };
}

// ============================================================================
// TIMING TRACKING
// ============================================================================

/**
 * Extract timing data from a pack
 *
 * @param pack - The completed pack
 * @param duration - Time taken to complete pack opening (ms)
 * @param skipped - Whether user skipped animations
 * @param previousPackTime - Optional timestamp of previous pack for time-between calculation
 * @returns Timing data for analytics
 */
export function extractPackTiming(
  pack: Pack,
  duration: number,
  skipped: boolean,
  previousPackTime?: number
): PackOpeningTiming {
  const openedAt = pack.openedAt.getTime();
  const completedAt = openedAt + duration;

  return {
    packId: pack.id,
    openedAt,
    completedAt,
    duration,
    skipped,
    timeBetweenOpens: previousPackTime ? openedAt - previousPackTime : undefined,
  };
}

/**
 * Aggregate timing statistics from stored events
 *
 * @param options - Optional filters for aggregation
 * @returns Aggregated timing statistics
 */
export function aggregateTimingStats(options?: {
  startDate?: number;
  endDate?: number;
}): TimingStatistics {
  const events = getStoredEvents();

  // Filter pack_complete events
  let packEvents = events.filter(
    (event): event is AnyAnalyticsEvent => event.type === 'pack_complete'
  );

  // Apply date range filter
  if (options?.startDate) {
    packEvents = packEvents.filter(
      (event) => event.timestamp >= options.startDate!
    );
  }

  if (options?.endDate) {
    packEvents = packEvents.filter(
      (event) => event.timestamp <= options.endDate!
    );
  }

  if (packEvents.length === 0) {
    return {
      averageOpenTime: 0,
      medianOpenTime: 0,
      minOpenTime: 0,
      maxOpenTime: 0,
      averageTimeBetweenOpens: 0,
      skippedRate: 0,
    };
  }

  // Extract durations
  const durations = packEvents.map((event) => event.data.duration);
  const skippedCount = packEvents.filter((event) => event.data.skipped).length;

  // Calculate time between opens
  const timeBetweenOpens: number[] = [];
  for (let i = 1; i < packEvents.length; i++) {
    const timeDiff = packEvents[i].timestamp - packEvents[i - 1].timestamp;
    if (timeDiff > 0 && timeDiff < 3600000) { // Only count if < 1 hour (ignore long breaks)
      timeBetweenOpens.push(timeDiff);
    }
  }

  // Calculate statistics
  const averageOpenTime =
    durations.reduce((sum, d) => sum + d, 0) / durations.length;

  const sortedDurations = [...durations].sort((a, b) => a - b);
  const medianOpenTime =
    sortedDurations.length % 2 === 0
      ? (sortedDurations[sortedDurations.length / 2 - 1] +
          sortedDurations[sortedDurations.length / 2]) / 2
      : sortedDurations[Math.floor(sortedDurations.length / 2)];

  const minOpenTime = Math.min(...durations);
  const maxOpenTime = Math.max(...durations);

  const averageTimeBetweenOpens =
    timeBetweenOpens.length > 0
      ? timeBetweenOpens.reduce((sum, t) => sum + t, 0) / timeBetweenOpens.length
      : 0;

  const skippedRate = (skippedCount / packEvents.length) * 100;

  return {
    averageOpenTime,
    medianOpenTime,
    minOpenTime,
    maxOpenTime,
    averageTimeBetweenOpens,
    skippedRate,
  };
}

// ============================================================================
// COMPLETE ANALYTICS SUMMARY
// ============================================================================

/**
 * Generate complete analytics summary for game balancing
 *
 * @param options - Optional filters for aggregation
 * @returns Complete analytics summary
 *
 * @example
 * // Get all-time summary
 * const summary = await generateAnalyticsSummary();
 *
 * @example
 * // Get last 30 days summary
 * const monthlySummary = await generateAnalyticsSummary({
 *   startDate: Date.now() - 30 * 24 * 60 * 60 * 1000
 * });
 */
export function generateAnalyticsSummary(options?: {
  startDate?: number;
  endDate?: number;
  packType?: PackType;
}): AnalyticsSummary {
  const events = getStoredEvents();

  if (events.length === 0) {
    return {
      rarity: aggregateRarityStats(options),
      timing: aggregateTimingStats(options),
      period: {
        start: Date.now(),
        end: Date.now(),
        duration: 0,
      },
    };
  }

  // Determine time period
  const timestamps = events.map((e) => e.timestamp);
  const start = options?.startDate ?? Math.min(...timestamps);
  const end = options?.endDate ?? Math.max(...timestamps);

  return {
    rarity: aggregateRarityStats(options),
    timing: aggregateTimingStats(options),
    period: {
      start,
      end,
      duration: end - start,
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate expected rarity distribution based on pack configuration
 * Useful for comparing actual vs expected drop rates
 *
 * @param cardsPerPack - Number of cards per pack
 * @param slots - Rarity slot configuration
 * @returns Expected rarity distribution (percentages)
 */
export function calculateExpectedRarityDistribution(
  cardsPerPack: number,
  slots: Array<{ guaranteedRarity?: Rarity; probability?: Partial<Record<Rarity, number>> }>
): Record<Rarity, number> {
  const expectedCounts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (const slot of slots) {
    if (slot.guaranteedRarity) {
      expectedCounts[slot.guaranteedRarity]++;
    } else if (slot.probability) {
      // Add expected value from probability distribution
      for (const [rarity, prob] of Object.entries(slot.probability)) {
        expectedCounts[rarity as Rarity] += prob;
      }
    }
  }

  // Convert to percentages
  const percentages: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (const rarity of Object.keys(expectedCounts) as Rarity[]) {
    percentages[rarity] = (expectedCounts[rarity] / cardsPerPack) * 100;
  }

  return percentages;
}

/**
 * Compare actual vs expected rarity distribution
 * Returns deviation percentages for balancing analysis
 *
 * @param actual - Actual rarity statistics
 * @param expected - Expected rarity distribution (percentages)
 * @returns Deviation from expected (percentage points)
 */
export function compareRarityDistribution(
  actual: RarityStatistics,
  expected: Record<Rarity, number>
): Record<Rarity, number> {
  const deviation: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (const rarity of Object.keys(expected) as Rarity[]) {
    const actualPercent = actual.rarityDistribution[rarity].percentage;
    deviation[rarity] = actualPercent - expected[rarity];
  }

  return deviation;
}

/**
 * Export analytics data as JSON for external analysis
 *
 * @param options - Optional filters for export
 * @returns JSON string of analytics data
 */
export function exportAnalyticsData(options?: {
  startDate?: number;
  endDate?: number;
  format?: 'json' | 'csv';
}): string {
  const events = getStoredEvents();

  let filteredEvents = events;

  if (options?.startDate) {
    filteredEvents = filteredEvents.filter(
      (event) => event.timestamp >= options.startDate
    );
  }

  if (options?.endDate) {
    filteredEvents = filteredEvents.filter(
      (event) => event.timestamp <= options.endDate
    );
  }

  if (options?.format === 'csv') {
    // Convert to CSV (simplified - just pack events for now)
    const packEvents = filteredEvents.filter(
      (e) => e.type === 'pack_complete'
    );

    const headers = ['timestamp', 'packId', 'cardCount', 'bestRarity', 'holoCount', 'duration', 'skipped'];
    const rows = packEvents.map((e) => [
      e.timestamp,
      e.data.packId,
      e.data.cardCount,
      e.data.bestRarity,
      e.data.holoCount,
      e.data.duration,
      e.data.skipped,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  return JSON.stringify(filteredEvents, null, 2);
}
