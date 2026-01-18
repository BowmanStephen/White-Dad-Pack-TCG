/**
 * DadDeck Analytics Events Tracking
 *
 * Provides advanced analytics beyond basic event tracking:
 * - Rarity distribution per pack (for balancing)
 * - Time tracking between pack opens (engagement metrics)
 * - Aggregate statistics for game balancing decisions
 *
 * @packageDocumentation
 */

import type { Pack, Rarity } from '@/types';
import { getStoredEvents } from '@/stores/analytics';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Rarity distribution for a single pack
 */
export interface PackRarityDistribution {
  packId: string;
  timestamp: number;
  distribution: Record<Rarity, number>;  // Count of each rarity
  totalCards: number;
  holoCount: number;
  bestRarity: Rarity;
  seasonId?: number;  // Season pack was from (US086)
}

/**
 * Time metrics between pack openings
 */
export interface PackOpeningTimeMetrics {
  userId: string;  // Anonymous user ID
  sessionStart: number;
  lastPackOpenTime: number | null;
  currentPackOpenTime: number | null;
  timeBetweenOpens: number | null;  // Milliseconds
  totalPacksOpened: number;
  averageTimeBetweenOpens: number;  // Moving average
  sessionDuration: number;
}

/**
 * Aggregated rarity statistics across all packs
 * Used for game balancing and rarity tuning
 */
export interface RarityStatistics {
  totalPacks: number;
  totalCards: number;
  rarityDistribution: Record<Rarity, {
    count: number;
    percentage: number;
    perPackAverage: number;
  }>;
  holoRate: number;  // Percentage of cards that are holo
  bestRarityDistribution: Record<Rarity, number>;  // Best rarity per pack
  averageHoloCountPerPack: number;
  averageCardsPerPack: number;
}

/**
 * Pack opening engagement metrics
 */
export interface EngagementMetrics {
  totalPacksOpened: number;
  averageSessionDuration: number;  // Minutes
  averageTimeBetweenPacks: number;  // Seconds
  longestSession: number;  // Minutes
  averageCardsViewed: number;  // Cards viewed before skipping
  skipRate: number;  // Percentage of packs where user skipped animation
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

const STORAGE_KEYS = {
  RARITY_DISTRIBUTION: 'analytics_rarity_distribution',
  TIME_METRICS: 'analytics_time_metrics',
  USER_ID: 'analytics_user_id',
} as const;

// ============================================================================
// USER ID GENERATION (Anonymous)
// ============================================================================

/**
 * Get or generate anonymous user ID
 * Used for tracking session metrics without PII
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server';

  try {
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  } catch {
    return 'unknown';
  }
}

// ============================================================================
// RARITY DISTRIBUTION TRACKING
// ============================================================================

/**
 * Calculate rarity distribution for a single pack
 */
export function calculatePackRarityDistribution(pack: Pack): PackRarityDistribution {
  const distribution: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  // Count each rarity
  for (const card of pack.cards) {
    distribution[card.rarity]++;
  }

  const holoCount = pack.cards.filter((c) => c.isHolo).length;

  return {
    packId: pack.id,
    timestamp: Date.now(),
    distribution,
    totalCards: pack.cards.length,
    holoCount,
    bestRarity: pack.bestRarity,
    seasonId: pack.seasonId,
  };
}

/**
 * Save pack rarity distribution to LocalStorage
 */
export function saveRarityDistribution(distribution: PackRarityDistribution): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RARITY_DISTRIBUTION);
    const history: PackRarityDistribution[] = stored ? JSON.parse(stored) : [];

    // Append new distribution
    history.push(distribution);

    // Keep last 1000 packs to prevent storage overflow
    const trimmed = history.slice(-1000);

    localStorage.setItem(STORAGE_KEYS.RARITY_DISTRIBUTION, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('[Analytics] Failed to save rarity distribution:', error);
  }
}

/**
 * Get all saved rarity distributions
 */
export function getRarityDistributionHistory(): PackRarityDistribution[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RARITY_DISTRIBUTION);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear rarity distribution history
 */
export function clearRarityDistributionHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.RARITY_DISTRIBUTION);
  } catch (error) {
    console.warn('[Analytics] Failed to clear rarity distribution:', error);
  }
}

// ============================================================================
// AGGREGATED RARITY STATISTICS
// ============================================================================

/**
 * Calculate aggregated rarity statistics from all saved distributions
 */
export function calculateRarityStatistics(): RarityStatistics {
  const history = getRarityDistributionHistory();

  if (history.length === 0) {
    return {
      totalPacks: 0,
      totalCards: 0,
      rarityDistribution: {
        common: { count: 0, percentage: 0, perPackAverage: 0 },
        uncommon: { count: 0, percentage: 0, perPackAverage: 0 },
        rare: { count: 0, percentage: 0, perPackAverage: 0 },
        epic: { count: 0, percentage: 0, perPackAverage: 0 },
        legendary: { count: 0, percentage: 0, perPackAverage: 0 },
        mythic: { count: 0, percentage: 0, perPackAverage: 0 },
      },
      holoRate: 0,
      bestRarityDistribution: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0,
      },
      averageHoloCountPerPack: 0,
      averageCardsPerPack: 0,
    };
  }

  // Calculate totals
  let totalCards = 0;
  let totalHoloCount = 0;
  const rarityCounts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };
  const bestRarityCounts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (const pack of history) {
    totalCards += pack.totalCards;
    totalHoloCount += pack.holoCount;
    bestRarityCounts[pack.bestRarity]++;

    for (const rarity of RARITIES) {
      rarityCounts[rarity] += pack.distribution[rarity];
    }
  }

  const totalPacks = history.length;

  // Calculate per-pack averages
  const averageCardsPerPack = totalCards / totalPacks;
  const averageHoloCountPerPack = totalHoloCount / totalPacks;
  const holoRate = totalCards > 0 ? (totalHoloCount / totalCards) * 100 : 0;

  // Calculate rarity distribution percentages
  const rarityDistribution: Record<Rarity, { count: number; percentage: number; perPackAverage: number }> = {} as any;

  for (const rarity of RARITIES) {
    const count = rarityCounts[rarity];
    const percentage = totalCards > 0 ? (count / totalCards) * 100 : 0;
    const perPackAverage = count / totalPacks;

    rarityDistribution[rarity] = {
      count,
      percentage,
      perPackAverage,
    };
  }

  return {
    totalPacks,
    totalCards,
    rarityDistribution,
    holoRate,
    bestRarityDistribution: bestRarityCounts,
    averageHoloCountPerPack,
    averageCardsPerPack,
  };
}

/**
 * Get rarity statistics as a formatted string for debugging
 */
export function formatRarityStatistics(stats: RarityStatistics): string {
  const lines: string[] = [];

  lines.push('=== RARITY STATISTICS ===');
  lines.push(`Total Packs: ${stats.totalPacks}`);
  lines.push(`Total Cards: ${stats.totalCards}`);
  lines.push(`Avg Cards/Pack: ${stats.averageCardsPerPack.toFixed(2)}`);
  lines.push(`Holo Rate: ${stats.holoRate.toFixed(2)}%`);
  lines.push(`Avg Holo/Pack: ${stats.averageHoloCountPerPack.toFixed(2)}`);
  lines.push('');

  lines.push('Rarity Distribution:');
  for (const rarity of RARITIES) {
    const r = stats.rarityDistribution[rarity];
    lines.push(
      `  ${rarity.padEnd(10)}: ${r.count.toString().padStart(5)} (${r.percentage.toFixed(2)}%) | Avg/pack: ${r.perPackAverage.toFixed(2)}`
    );
  }

  lines.push('');
  lines.push('Best Rarity per Pack:');
  for (const rarity of RARITIES) {
    const count = stats.bestRarityDistribution[rarity];
    const percentage = stats.totalPacks > 0 ? (count / stats.totalPacks) * 100 : 0;
    lines.push(`  ${rarity.padEnd(10)}: ${count.toString().padStart(5)} (${percentage.toFixed(2)}%)`);
  }

  return lines.join('\n');
}

// ============================================================================
// TIME TRACKING BETWEEN PACK OPENS
// ============================================================================

/**
 * Get current time metrics
 */
export function getTimeMetrics(): PackOpeningTimeMetrics {
  if (typeof window === 'undefined') {
    return {
      userId: 'server',
      sessionStart: Date.now(),
      lastPackOpenTime: null,
      currentPackOpenTime: null,
      timeBetweenOpens: null,
      totalPacksOpened: 0,
      averageTimeBetweenOpens: 0,
      sessionDuration: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIME_METRICS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fall through to create new
  }

  // Create new time metrics
  const now = Date.now();
  const userId = getUserId();

  const newMetrics: PackOpeningTimeMetrics = {
    userId,
    sessionStart: now,
    lastPackOpenTime: null,
    currentPackOpenTime: null,
    timeBetweenOpens: null,
    totalPacksOpened: 0,
    averageTimeBetweenOpens: 0,
    sessionDuration: 0,
  };

  saveTimeMetrics(newMetrics);
  return newMetrics;
}

/**
 * Save time metrics to LocalStorage
 */
function saveTimeMetrics(metrics: PackOpeningTimeMetrics): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.TIME_METRICS, JSON.stringify(metrics));
  } catch (error) {
    console.warn('[Analytics] Failed to save time metrics:', error);
  }
}

/**
 * Record pack open event (call when pack generation starts)
 */
export function recordPackOpenStart(): void {
  const metrics = getTimeMetrics();
  const now = Date.now();

  metrics.currentPackOpenTime = now;

  // Calculate time between opens if this isn't the first pack
  if (metrics.lastPackOpenTime !== null) {
    metrics.timeBetweenOpens = now - metrics.lastPackOpenTime;

    // Update moving average
    const totalPacks = metrics.totalPacksOpened;
    const currentAverage = metrics.averageTimeBetweenOpens;
    metrics.averageTimeBetweenOpens =
      (currentAverage * totalPacks + metrics.timeBetweenOpens) / (totalPacks + 1);
  }

  // Update session duration
  metrics.sessionDuration = now - metrics.sessionStart;

  saveTimeMetrics(metrics);
}

/**
 * Record pack complete event (call when pack opening finishes)
 */
export function recordPackOpenComplete(): void {
  const metrics = getTimeMetrics();
  const now = Date.now();

  metrics.lastPackOpenTime = now;
  metrics.totalPacksOpened++;
  metrics.sessionDuration = now - metrics.sessionStart;

  saveTimeMetrics(metrics);
}

/**
 * Get time between last two pack opens (in seconds)
 */
export function getTimeBetweenOpens(): number | null {
  const metrics = getTimeMetrics();
  return metrics.timeBetweenOpens !== null ? Math.round(metrics.timeBetweenOpens / 1000) : null;
}

/**
 * Get average time between pack opens (in seconds)
 */
export function getAverageTimeBetweenOpens(): number {
  const metrics = getTimeMetrics();
  return Math.round(metrics.averageTimeBetweenOpens / 1000);
}

/**
 * Get current session duration (in minutes)
 */
export function getSessionDuration(): number {
  const metrics = getTimeMetrics();
  return Math.round((Date.now() - metrics.sessionStart) / 60000);
}

/**
 * Clear time metrics (call at session end)
 */
export function clearTimeMetrics(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.TIME_METRICS);
  } catch (error) {
    console.warn('[Analytics] Failed to clear time metrics:', error);
  }
}

// ============================================================================
// ENGAGEMENT METRICS
// ============================================================================

/**
 * Calculate engagement metrics from analytics events
 */
export function calculateEngagementMetrics(): EngagementMetrics {
  const events = getStoredEvents();
  const rarityHistory = getRarityDistributionHistory();

  // Filter pack_complete events
  const packCompleteEvents = events.filter((e) => e.type === 'pack_complete');

  // Calculate skip rate
  const skippedPacks = packCompleteEvents.filter(
    (e: any) => e.data.skipped === true
  ).length;
  const skipRate =
    packCompleteEvents.length > 0 ? (skippedPacks / packCompleteEvents.length) * 100 : 0;

  // Calculate average cards viewed (from card_reveal events)
  const cardRevealEvents = events.filter((e) => e.type === 'card_reveal');
  const packsWithReveals = new Set(cardRevealEvents.map((e: any) => e.data.packId)).size;
  const averageCardsViewed =
    packsWithReveals > 0 ? cardRevealEvents.length / packsWithReveals : 0;

  // Get time metrics
  const timeMetrics = getTimeMetrics();
  const averageSessionDuration = getSessionDuration();
  const averageTimeBetweenPacks = getAverageTimeBetweenOpens();

  return {
    totalPacksOpened: rarityHistory.length,
    averageSessionDuration,
    averageTimeBetweenPacks,
    longestSession: averageSessionDuration, // TODO: Track across multiple sessions
    averageCardsViewed,
    skipRate,
  };
}

/**
 * Get engagement metrics as formatted string
 */
export function formatEngagementMetrics(metrics: EngagementMetrics): string {
  const lines: string[] = [];

  lines.push('=== ENGAGEMENT METRICS ===');
  lines.push(`Total Packs Opened: ${metrics.totalPacksOpened}`);
  lines.push(`Avg Session Duration: ${metrics.averageSessionDuration} min`);
  lines.push(`Avg Time Between Packs: ${metrics.averageTimeBetweenPacks}s`);
  lines.push(`Longest Session: ${metrics.longestSession} min`);
  lines.push(`Avg Cards Viewed: ${metrics.averageCardsViewed.toFixed(2)}`);
  lines.push(`Skip Rate: ${metrics.skipRate.toFixed(2)}%`);

  return lines.join('\n');
}

// ============================================================================
// BALANCING RECOMMENDATIONS
// ============================================================================

/**
 * Generate balancing recommendations based on rarity statistics
 * Compares actual distribution against expected probabilities
 */
export interface BalancingRecommendation {
  rarity: Rarity;
  actualPercentage: number;
  expectedPercentage: number;
  deviation: number;  // Percentage points difference
  recommendation: 'increase' | 'decrease' | 'balanced';
  severity: 'low' | 'medium' | 'high';
}

export function generateBalancingRecommendations(): BalancingRecommendation[] {
  const stats = calculateRarityStatistics();

  // Expected rarity distribution (from pack generator config)
  // These are approximate targets based on the rarity slot system
  const expectedDistribution: Record<Rarity, number> = {
    common: 50,        // ~50% of cards
    uncommon: 30,      // ~30% of cards
    rare: 15,          // ~15% of cards
    epic: 4,           // ~4% of cards
    legendary: 0.9,    // ~1% of cards
    mythic: 0.1,       // ~0.1% of cards
  };

  const recommendations: BalancingRecommendation[] = [];

  for (const rarity of RARITIES) {
    const actual = stats.rarityDistribution[rarity].percentage;
    const expected = expectedDistribution[rarity];
    const deviation = actual - expected;

    let recommendation: 'increase' | 'decrease' | 'balanced';
    let severity: 'low' | 'medium' | 'high';

    const absDeviation = Math.abs(deviation);

    if (absDeviation < 2) {
      recommendation = 'balanced';
      severity = 'low';
    } else if (absDeviation < 5) {
      severity = 'low';
      recommendation = deviation > 0 ? 'decrease' : 'increase';
    } else if (absDeviation < 10) {
      severity = 'medium';
      recommendation = deviation > 0 ? 'decrease' : 'increase';
    } else {
      severity = 'high';
      recommendation = deviation > 0 ? 'decrease' : 'increase';
    }

    recommendations.push({
      rarity,
      actualPercentage: actual,
      expectedPercentage: expected,
      deviation,
      recommendation,
      severity,
    });
  }

  return recommendations;
}

/**
 * Format balancing recommendations for display
 */
export function formatBalancingRecommendations(recommendations: BalancingRecommendation[]): string {
  const lines: string[] = [];

  lines.push('=== BALANCING RECOMMENDATIONS ===');
  lines.push('(Based on ' + calculateRarityStatistics().totalPacks + ' packs opened)');
  lines.push('');

  for (const rec of recommendations) {
    const deviationStr = rec.deviation > 0 ? `+${rec.deviation.toFixed(2)}%` : `${rec.deviation.toFixed(2)}%`;
    const status = rec.recommendation === 'balanced' ? '✓' : rec.recommendation === 'increase' ? '↑' : '↓';
    const severityIndicator = rec.severity === 'high' ? '!' : rec.severity === 'medium' ? '*' : '';

    lines.push(
      `${status} ${rec.rarity.padEnd(10)}: ${rec.actualPercentage.toFixed(2)}% vs ${rec.expectedPercentage}% (${deviationStr}) ${severityIndicator}`
    );

    if (rec.recommendation !== 'balanced') {
      lines.push(`  → Recommendation: ${rec.recommendation} ${rec.rarity} rate (${rec.severity} priority)`);
    }
  }

  return lines.join('\n');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Export all analytics data as JSON
 * Useful for manual analysis or debugging
 */
export function exportAnalyticsData(): {
  rarityStatistics: RarityStatistics;
  engagementMetrics: EngagementMetrics;
  balancingRecommendations: BalancingRecommendation[];
  timeMetrics: PackOpeningTimeMetrics;
  recentPacks: PackRarityDistribution[];
} {
  return {
    rarityStatistics: calculateRarityStatistics(),
    engagementMetrics: calculateEngagementMetrics(),
    balancingRecommendations: generateBalancingRecommendations(),
    timeMetrics: getTimeMetrics(),
    recentPacks: getRarityDistributionHistory().slice(-50),  // Last 50 packs
  };
}

/**
 * Log analytics summary to console (for debugging)
 */
export function logAnalyticsSummary(): void {
  const data = exportAnalyticsData();

  console.log('=== DADDECK ANALYTICS SUMMARY ===\n');
  console.log(formatRarityStatistics(data.rarityStatistics));
  console.log('\n');
  console.log(formatEngagementMetrics(data.engagementMetrics));
  console.log('\n');
  console.log(formatBalancingRecommendations(data.balancingRecommendations));
  console.log('\n=== END ANALYTICS SUMMARY ===');
}

/**
 * Clear all analytics data from LocalStorage
 */
export function clearAllAnalyticsData(): void {
  clearRarityDistributionHistory();
  clearTimeMetrics();

  // Note: We don't clear the main analytics_events store
  // as that's managed by the main analytics system
}
