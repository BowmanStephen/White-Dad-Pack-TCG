/**
 * PACK-097: Security - Pack Validation System
 *
 * Comprehensive anti-cheat validation for pack opening to prevent exploits,
 * detect anomalies, and ensure fair gameplay.
 *
 * Validation Layers:
 * 1. Rarity Distribution Validation - Ensures packs follow configured probabilities
 * 2. Duplicate Pack Detection - Prevents replay/hash collision attacks
 * 3. Statistical Anomaly Detection - Flags statistically improbable packs
 * 4. Entropy Verification - Detects tampering/predictable patterns
 * 5. Suspicious Activity Logging - Tracks potential exploits for review
 */

import type { Pack, PackConfig, Rarity } from '../../types';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  violations: ValidationViolation[];
  warnings: ValidationWarning[];
  confidence: number; // 0-1 score of pack legitimacy
}

export interface ValidationViolation {
  type: ViolationType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details: Record<string, unknown>;
}

export interface ValidationWarning {
  type: WarningType;
  message: string;
  details: Record<string, unknown>;
}

export type ViolationType =
  | 'invalid_rarity_distribution'
  | 'duplicate_pack_detected'
  | 'statistical_anomaly'
  | 'low_entropy'
  | 'impossible_pack'
  | 'tampering_detected';

export type WarningType =
  | 'rare_pull'
  | 'unlucky_pack'
  | 'unusual_distribution'
  | 'client_mismatch';

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

/**
 * In-memory cache of recently seen pack hashes
 * In production, this would use Redis or a database with TTL
 */
const PACK_HASH_CACHE = new Map<string, number>();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Generate a deterministic hash for a pack
 * Used to detect duplicate/replay attacks
 */
export function generatePackHash(pack: Pack): string {
  // Create a normalized representation of the pack
  const normalized = {
    id: pack.id, // Include pack ID for uniqueness
    cards: pack.cards
      .map((c) => ({
        id: c.id,
        rarity: c.rarity,
        isHolo: c.isHolo,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    bestRarity: pack.bestRarity,
    design: pack.design,
  };

  // Simple hash function (in production, use crypto.subtle.digest)
  const str = JSON.stringify(normalized);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Detect duplicate packs using hash comparison
 */
export function detectDuplicatePack(pack: Pack): ValidationResult {
  const violations: ValidationViolation[] = [];
  const warnings: ValidationWarning[] = [];

  const hash = generatePackHash(pack);
  const now = Date.now();

  // Check if we've seen this pack before
  const seenAt = PACK_HASH_CACHE.get(hash);

  if (seenAt !== undefined) {
    const age = now - seenAt;

    // If seen recently (within TTL), it's a critical violation
    if (age < CACHE_TTL) {
      violations.push({
        type: 'duplicate_pack_detected',
        severity: 'critical',
        message: `Duplicate pack detected (hash: ${hash}, seen ${Math.round(age / 1000)}s ago)`,
        details: {
          hash,
          seenAt,
          age,
          cacheSize: PACK_HASH_CACHE.size,
        },
      });

      return {
        valid: false,
        violations,
        warnings,
        confidence: 0,
      };
    }
  }

  // Clean up old entries
  for (const [cachedHash, timestamp] of PACK_HASH_CACHE.entries()) {
    if (now - timestamp > CACHE_TTL) {
      PACK_HASH_CACHE.delete(cachedHash);
    }
  }

  // Add current pack to cache
  PACK_HASH_CACHE.set(hash, now);

  return {
    valid: true,
    violations: [],
    warnings: [],
    confidence: 1,
  };
}

// ============================================================================
// RARITY DISTRIBUTION VALIDATION
// ============================================================================

/**
 * Validate that a pack's rarity distribution matches the configured probabilities
 * Uses statistical tolerance to account for randomness
 */
export function validateRarityDistribution(
  pack: Pack,
  config: PackConfig,
  tolerance: number = 2.0 // Standard deviations tolerance
): ValidationResult {
  const violations: ValidationViolation[] = [];
  const warnings: ValidationWarning[] = [];

  // Count rarities in the pack
  const rarityCounts: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  for (const card of pack.cards) {
    rarityCounts[card.rarity]++;
  }

  // Validate each slot against configuration
  for (const slot of config.raritySlots) {
    const cardIndex = slot.slot - 1;
    if (cardIndex >= pack.cards.length) continue;

    const card = pack.cards[cardIndex];

    // Check guaranteed rarity
    if (slot.guaranteedRarity && card.rarity !== slot.guaranteedRarity) {
      violations.push({
        type: 'invalid_rarity_distribution',
        severity: 'critical',
        message: `Slot ${slot.slot} should be ${slot.guaranteedRarity} but got ${card.rarity}`,
        details: {
          slot: slot.slot,
          expected: slot.guaranteedRarity,
          actual: card.rarity,
          cardId: card.id,
        },
      });
      continue; // Skip pool check if guaranteed rarity failed
    }

    // For rarity pools, verify the rarity is in the allowed set
    // Only check if there's no guaranteed rarity (already handled above)
    if (slot.rarityPool && !slot.guaranteedRarity && slot.probability) {
      const allowedRarities = Object.keys(slot.probability) as Rarity[];
      if (!allowedRarities.includes(card.rarity)) {
        violations.push({
          type: 'invalid_rarity_distribution',
          severity: 'critical',
          message: `Slot ${slot.slot} rarity ${card.rarity} not in allowed pool`,
          details: {
            slot: slot.slot,
            allowed: allowedRarities,
            actual: card.rarity,
            cardId: card.id,
          },
        });
      }
    }
  }

  // Check for impossible configurations (e.g., 6 mythic cards)
  const mythicCount = rarityCounts.mythic;
  if (mythicCount > 1) {
    violations.push({
      type: 'impossible_pack',
      severity: 'critical',
      message: `Impossible pack: ${mythicCount} mythic cards (max 1 per 1000 packs)`,
      details: {
        mythicCount,
        probability: Math.pow(0.001, mythicCount),
      },
    });
  }

  // Warn for very rare pulls (should occur naturally but are suspicious)
  const legendaryCount = rarityCounts.legendary;
  if (legendaryCount >= 2) {
    warnings.push({
      type: 'rare_pull',
      message: `Unusually rare pack: ${legendaryCount} legendary cards`,
      details: {
        legendaryCount,
        probability: Math.pow(0.02, legendaryCount),
      },
    });
  }

  const confidence = violations.length === 0 ? 1 : 0;

  return {
    valid: violations.length === 0,
    violations,
    warnings,
    confidence,
  };
}

// ============================================================================
// STATISTICAL ANOMALY DETECTION
// ============================================================================

/**
 * Calculate the statistical rarity score of a pack
 * Higher scores indicate rarer packs
 */
function calculatePackRarityScore(pack: Pack): number {
  let score = 0;

  const rarityWeights: Record<Rarity, number> = {
    common: 1,
    uncommon: 10,
    rare: 100,
    epic: 1000,
    legendary: 10000,
    mythic: 100000,
  };

  for (const card of pack.cards) {
    score += rarityWeights[card.rarity];

    if (card.isHolo) {
      score *= 1.5; // Holo bonus
    }
  }

  return score;
}

/**
 * Detect statistically anomalous packs using z-score analysis
 */
export function detectStatisticalAnomalies(
  pack: Pack,
  historicalScores: number[] = []
): ValidationResult {
  const violations: ValidationViolation[] = [];
  const warnings: ValidationWarning[] = [];

  const currentScore = calculatePackRarityScore(pack);

  // If we have historical data, calculate z-score
  if (historicalScores.length >= 100) {
    const mean = historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length;
    const variance =
      historicalScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      historicalScores.length;
    const stdDev = Math.sqrt(variance);

    const zScore = Math.abs((currentScore - mean) / stdDev);

    // Z-score > 3 is statistically significant (p < 0.001)
    if (zScore > 5) {
      violations.push({
        type: 'statistical_anomaly',
        severity: 'critical',
        message: `Extremely anomalous pack (z-score: ${zScore.toFixed(2)})`,
        details: {
          currentScore,
          mean,
          stdDev,
          zScore,
          probability: 0.0000003, // 5-sigma probability
        },
      });
    } else if (zScore > 3) {
      warnings.push({
        type: 'rare_pull',
        message: `Statistically rare pack (z-score: ${zScore.toFixed(2)})`,
        details: {
          currentScore,
          mean,
          stdDev,
          zScore,
          probability: 0.001, // 3-sigma probability
        },
      });
    }
  }

  // Check for immediate red flags without historical data
  const mythicCount = pack.cards.filter((c) => c.rarity === 'mythic').length;
  const legendaryCount = pack.cards.filter((c) => c.rarity === 'legendary').length;

  if (mythicCount > 0 && legendaryCount > 2) {
    violations.push({
      type: 'impossible_pack',
      severity: 'critical',
      message: `Impossible rarity combination`,
      details: {
        mythicCount,
        legendaryCount,
        combinedProbability: Math.pow(0.001, mythicCount) * Math.pow(0.02, legendaryCount),
      },
    });
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings,
    confidence: violations.length === 0 ? 1 : 0.5,
  };
}

// ============================================================================
// ENTROPY VERIFICATION
// ============================================================================

/**
 * Calculate Shannon entropy of a pack's card distribution
 * High entropy = good randomness, low entropy = potential tampering
 */
export function calculatePackEntropy(pack: Pack): number {
  // Count card occurrences
  const cardCounts = new Map<string, number>();
  for (const card of pack.cards) {
    cardCounts.set(card.id, (cardCounts.get(card.id) || 0) + 1);
  }

  // Calculate Shannon entropy
  let entropy = 0;
  const totalCards = pack.cards.length;

  for (const count of cardCounts.values()) {
    if (count === 0) continue;
    const probability = count / totalCards;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Verify that a pack has sufficient entropy (randomness)
 */
export function validatePackEntropy(
  pack: Pack,
  minEntropy: number = 2.0 // Minimum acceptable entropy
): ValidationResult {
  const violations: ValidationViolation[] = [];
  const warnings: ValidationWarning[] = [];

  const entropy = calculatePackEntropy(pack);

  // Check for duplicate cards (low entropy indicator)
  const cardIds = pack.cards.map((c) => c.id);
  const uniqueIds = new Set(cardIds);

  if (uniqueIds.size < cardIds.length) {
    violations.push({
      type: 'low_entropy',
      severity: 'high',
      message: `Duplicate cards detected in pack (${cardIds.length - uniqueIds.size} duplicates)`,
      details: {
        entropy,
        totalCards: cardIds.length,
        uniqueCards: uniqueIds.size,
        duplicates: cardIds.length - uniqueIds.size,
      },
    });
  }

  // Check entropy threshold
  if (entropy < minEntropy) {
    violations.push({
      type: 'low_entropy',
      severity: 'medium',
      message: `Pack entropy too low (${entropy.toFixed(2)} < ${minEntropy})`,
      details: {
        entropy,
        minEntropy,
        indicates: 'Potential tampering or predictable pattern',
      },
    });
  }

  // Maximum entropy for 6 unique cards = log2(6) ≈ 2.585
  const maxEntropy = Math.log2(pack.cards.length);
  const entropyRatio = entropy / maxEntropy;

  if (entropyRatio < 0.7) {
    warnings.push({
      type: 'unusual_distribution',
      message: `Pack entropy below 70% of maximum`,
      details: {
        entropy,
        maxEntropy,
        ratio: entropyRatio,
        indicates: 'Possible bias in card selection',
      },
    });
  }

  return {
    valid: violations.length === 0,
    violations,
    warnings,
    confidence: entropyRatio,
  };
}

// ============================================================================
// COMPREHENSIVE VALIDATION
// ============================================================================

/**
 * Main validation function that runs all checks
 * This should be called before accepting any pack
 */
export async function validatePackBeforeOpen(
  pack: Pack,
  config: PackConfig,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const {
    checkDuplicates = true,
    checkDistribution = true,
    checkAnomalies = true,
    checkEntropy = true,
    historicalScores = [],
    entropyThreshold = 2.0,
  } = options;

  const allViolations: ValidationViolation[] = [];
  const allWarnings: ValidationWarning[] = [];
  const confidenceScores: number[] = [];

  // 1. Duplicate Detection
  if (checkDuplicates) {
    const duplicateResult = detectDuplicatePack(pack);
    allViolations.push(...duplicateResult.violations);
    allWarnings.push(...duplicateResult.warnings);
    confidenceScores.push(duplicateResult.confidence);
  }

  // 2. Rarity Distribution Validation
  if (checkDistribution) {
    const distributionResult = validateRarityDistribution(pack, config);
    allViolations.push(...distributionResult.violations);
    allWarnings.push(...distributionResult.warnings);
    confidenceScores.push(distributionResult.confidence);
  }

  // 3. Statistical Anomaly Detection
  if (checkAnomalies) {
    const anomalyResult = detectStatisticalAnomalies(pack, historicalScores);
    allViolations.push(...anomalyResult.violations);
    allWarnings.push(...anomalyResult.warnings);
    confidenceScores.push(anomalyResult.confidence);
  }

  // 4. Entropy Verification
  if (checkEntropy) {
    const entropyResult = validatePackEntropy(pack, entropyThreshold);
    allViolations.push(...entropyResult.violations);
    allWarnings.push(...entropyResult.warnings);
    confidenceScores.push(entropyResult.confidence);
  }

  // Calculate overall confidence
  const overallConfidence =
    confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0;

  // Determine if pack is valid
  const criticalViolations = allViolations.filter((v) => v.severity === 'critical');
  const valid = criticalViolations.length === 0;

  // Log suspicious activity
  if (!valid || allWarnings.length > 0) {
    logSuspiciousActivity(pack, allViolations, allWarnings, overallConfidence);
  }

  return {
    valid,
    violations: allViolations,
    warnings: allWarnings,
    confidence: overallConfidence,
  };
}

// ============================================================================
// VALIDATION OPTIONS
// ============================================================================

export interface ValidationOptions {
  checkDuplicates?: boolean;
  checkDistribution?: boolean;
  checkAnomalies?: boolean;
  checkEntropy?: boolean;
  historicalScores?: number[];
  entropyThreshold?: number;
}

// ============================================================================
// SUSPICIOUS ACTIVITY LOGGING
// ============================================================================

interface SuspiciousActivityLog {
  timestamp: number;
  packHash: string;
  violations: ValidationViolation[];
  warnings: ValidationWarning[];
  confidence: number;
  packSummary: {
    cardCount: number;
    rarities: Record<string, number>;
    bestRarity: Rarity;
    holoCount: number;
  };
}

const ACTIVITY_LOG: SuspiciousActivityLog[] = [];
const MAX_LOG_SIZE = 1000; // Prevent unbounded memory growth

/**
 * Log suspicious activity for security monitoring
 */
function logSuspiciousActivity(
  pack: Pack,
  violations: ValidationViolation[],
  warnings: ValidationWarning[],
  confidence: number
): void {
  const rarityCounts: Record<string, number> = {};
  for (const card of pack.cards) {
    rarityCounts[card.rarity] = (rarityCounts[card.rarity] || 0) + 1;
  }

  const logEntry: SuspiciousActivityLog = {
    timestamp: Date.now(),
    packHash: generatePackHash(pack),
    violations,
    warnings,
    confidence,
    packSummary: {
      cardCount: pack.cards.length,
      rarities: rarityCounts,
      bestRarity: pack.bestRarity,
      holoCount: pack.cards.filter((c) => c.isHolo).length,
    },
  };

  ACTIVITY_LOG.push(logEntry);

  // Prevent unbounded growth
  if (ACTIVITY_LOG.length > MAX_LOG_SIZE) {
    ACTIVITY_LOG.shift();
  }

  // In production, send to monitoring service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'suspicious_pack', {
      confidence,
      violation_count: violations.length,
      warning_count: warnings.length,
      severity: violations.some((v) => v.severity === 'critical') ? 'critical' : 'warning',
    });
  }
}

/**
 * Get recent suspicious activity logs
 */
export function getSuspiciousActivityLogs(limit: number = 50): SuspiciousActivityLog[] {
  return ACTIVITY_LOG.slice(-limit);
}

/**
 * Clear activity logs (useful for testing or manual cleanup)
 */
export function clearActivityLogs(): void {
  ACTIVITY_LOG.length = 0;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick validation check for development/testing
 * Only validates critical violations
 */
export function quickValidatePack(pack: Pack, config: PackConfig): boolean {
  const result = validatePackBeforeOpen(pack, config, {
    checkDuplicates: false, // Skip cache check in quick mode
    checkAnomalies: false, // Skip statistical analysis
    checkEntropy: false, // Skip entropy check
  });

  return result.then((r) => r.valid) as unknown as boolean;
}

/**
 * Format validation result for display/logging
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push(`=== Pack Validation Result ===`);
  lines.push(`Valid: ${result.valid ? '✓' : '✗'}`);
  lines.push(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);

  if (result.violations.length > 0) {
    lines.push(`\nViolations (${result.violations.length}):`);
    for (const violation of result.violations) {
      lines.push(`  [${violation.severity.toUpperCase()}] ${violation.message}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(`\nWarnings (${result.warnings.length}):`);
    for (const warning of result.warnings) {
      lines.push(`  [⚠] ${warning.message}`);
    }
  }

  return lines.join('\n');
}
