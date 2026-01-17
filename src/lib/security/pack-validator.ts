/**
 * Pack Validation Service
 *
 * Validates pack integrity to prevent client-side manipulation:
 * - Entropy verification (server + client seeds)
 * - Duplicate detection across recent packs
 * - Rarity distribution validation
 * - Statistical anomaly detection
 *
 * Note: In a browser-only environment, this provides client-side validation
 * that makes manipulation more difficult. For true security, server-side
 * validation would be required.
 */

import type { Pack, PackCard, Rarity } from '../../types';
import type {
  PackEntropy,
  PackValidationResult,
  SecurityViolation,
} from '../../types/security';
import { RARITY_ORDER } from '../../types';
import { createSecurityViolation } from './utils';

// Store recent pack hashes for duplicate detection
const RECENT_PACKS_WINDOW = 100; // Number of recent packs to track
const recentPackHashes: Map<string, number> = new Map(); // hash -> timestamp

// Clean old hashes outside the window
function cleanOldHashes(): void {
  const cutoff = Date.now() - 3600000; // 1 hour ago
  for (const [hash, timestamp] of recentPackHashes.entries()) {
    if (timestamp < cutoff) {
      recentPackHashes.delete(hash);
    }
  }
}

/**
 * Generate a cryptographic hash of pack data
 * Uses a simple but effective string-based hash for browser compatibility
 */
export async function hashPackData(pack: Pack): Promise<string> {
  // Handle undefined or empty cards array
  const cards = pack.cards ?? [];
  
  // Create a canonical string representation of the pack
  const canonical = JSON.stringify({
    id: pack.id, // Include pack ID to ensure unique hashes
    cards: cards.map((c) => ({
      id: c.id,
      rarity: c.rarity,
      isHolo: c.isHolo,
      holoType: c.holoType,
    })),
    openedAt: pack.openedAt.toISOString(),
    design: pack.design,
  });

  // Simple hash function (DJB2) for client-side
  let hash = 5381;
  for (let i = 0; i < canonical.length; i++) {
    hash = ((hash << 5) + hash) + canonical.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Generate server entropy for pack validation
 * In a real implementation, this would come from the server
 */
export function generateServerEntropy(): string {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16)).join('');
}

/**
 * Generate client entropy for pack validation
 */
export function generateClientEntropy(): string {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16)).join('');
}

/**
 * Create combined entropy hash
 */
export async function createEntropyHash(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<string> {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate pack entropy
 */
export async function validatePackEntropy(
  pack: Pack,
  entropy: PackEntropy
): Promise<boolean> {
  const expectedHash = await createEntropyHash(
    entropy.serverSeed,
    entropy.clientSeed,
    entropy.nonce
  );

  // Verify the hash matches
  if (entropy.hash !== expectedHash) {
    return false;
  }

  // Verify timestamp is recent (within 5 minutes)
  const age = Date.now() - entropy.timestamp.getTime();
  if (age > 300000) {
    return false;
  }

  return true;
}

/**
 * Check for duplicate packs (exploit detection)
 */
export async function detectDuplicatePack(
  pack: Pack,
  fingerprint: string
): Promise<{ isDuplicate: boolean; violation?: SecurityViolation }> {
  cleanOldHashes();

  const packHash = await hashPackData(pack);
  const existingTimestamp = recentPackHashes.get(packHash);

  // Check if this exact pack was opened recently
  if (existingTimestamp) {
    const timeSinceLastOpen = Date.now() - existingTimestamp;

    // If same pack opened within 1 minute, likely an exploit
    if (timeSinceLastOpen < 60000) {
      const violation = createSecurityViolation('duplicate_detection', 'medium', {
        message: `Duplicate pack detected: ${packHash}`,
        fingerprint,
        timeSinceLastOpen,
        packId: pack.id,
      });

      return { isDuplicate: true, violation };
    }
  }

  // Store this pack hash
  recentPackHashes.set(packHash, Date.now());

  // Limit the size of recent hashes
  if (recentPackHashes.size > RECENT_PACKS_WINDOW) {
    const oldestKey = recentPackHashes.keys().next().value;
    if (oldestKey !== undefined) {
      recentPackHashes.delete(oldestKey);
    }
  }

  return { isDuplicate: false };
}

/**
 * Validate rarity distribution for anomalies
 */
export function validateRarityDistribution(pack: Pack): string[] {
  const anomalies: string[] = [];
  const rarityCount: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
  };

  // Count cards by rarity
  for (const card of pack.cards) {
    rarityCount[card.rarity]++;
  }

  // Check for impossible distributions
  // e.g., all mythic cards would be statistically impossible
  const mythicCount = rarityCount.mythic;
  if (mythicCount > 1) {
    anomalies.push(`Multiple mythic cards in single pack (${mythicCount})`);
  }

  const legendaryCount = rarityCount.legendary;
  if (legendaryCount > 2) {
    anomalies.push(`Excessive legendary cards in single pack (${legendaryCount})`);
  }

  // Check for pack with no common cards (suspicious)
  if (rarityCount.common === 0 && pack.cards.length > 3) {
    anomalies.push('Pack contains no common cards (statistically suspicious)');
  }

  // Calculate total rarity score (using RARITY_ORDER as score: common=0, mythic=5)
  let totalScore = 0;
  for (const card of pack.cards) {
    totalScore += RARITY_ORDER[card.rarity];
  }

  // Flag packs with unusually high rarity score
  const averageScore = totalScore / pack.cards.length;
  if (averageScore > 4) {
    anomalies.push(`Unusually high average rarity score: ${averageScore.toFixed(2)}`);
  }

  return anomalies;
}

/**
 * Validate card integrity (no modified stats)
 */
export function validateCardIntegrity(pack: Pack): string[] {
  const anomalies: string[] = [];

  for (const card of pack.cards) {
    // Check if all required fields exist
    if (!card.id || !card.name || !card.rarity) {
      anomalies.push(`Card missing required fields: ${card.id || 'unknown'}`);
    }

    // Check stats are within valid range (0-100)
    if (card.stats) {
      for (const [stat, value] of Object.entries(card.stats)) {
        if (typeof value !== 'number' || value < 0 || value > 100) {
          anomalies.push(`Invalid stat value: ${stat}=${value} on ${card.name}`);
        }
      }
    }

    // Check holo consistency
    if (card.isHolo && card.holoType === 'none') {
      anomalies.push(`Holo inconsistency on ${card.name}: isHolo=true but holoType=none`);
    }

    if (!card.isHolo && card.holoType !== 'none') {
      anomalies.push(`Holo inconsistency on ${card.name}: isHolo=false but holoType=${card.holoType}`);
    }
  }

  return anomalies;
}

/**
 * Comprehensive pack validation
 */
export async function validatePack(
  pack: Pack,
  entropy?: PackEntropy,
  fingerprint: string = 'unknown'
): Promise<PackValidationResult> {
  const anomalies: string[] = [];
  let entropyVerified = true;
  let duplicateDetected = false;

  // Check for missing or empty cards
  if (!pack.cards || !Array.isArray(pack.cards)) {
    anomalies.push('Pack has no cards array');
    return {
      valid: false,
      entropyVerified: false,
      duplicateDetected: false,
      anomalies,
      serverSeed: entropy?.serverSeed,
      clientSeed: entropy?.clientSeed,
    };
  }

  if (pack.cards.length === 0) {
    anomalies.push('Pack is empty');
    return {
      valid: false,
      entropyVerified: false,
      duplicateDetected: false,
      anomalies,
      serverSeed: entropy?.serverSeed,
      clientSeed: entropy?.clientSeed,
    };
  }

  // Validate entropy if provided
  if (entropy) {
    entropyVerified = await validatePackEntropy(pack, entropy);
    if (!entropyVerified) {
      anomalies.push('Entropy verification failed');
    }
  }

  // Check for duplicates
  const duplicateCheck = await detectDuplicatePack(pack, fingerprint);
  if (duplicateCheck.isDuplicate) {
    duplicateDetected = true;
    anomalies.push('Duplicate pack detected');
  }

  // Validate rarity distribution
  const rarityAnomalies = validateRarityDistribution(pack);
  anomalies.push(...rarityAnomalies);

  // Validate card integrity
  const integrityAnomalies = validateCardIntegrity(pack);
  anomalies.push(...integrityAnomalies);

  return {
    valid: anomalies.length === 0,
    entropyVerified,
    duplicateDetected,
    anomalies,
    serverSeed: entropy?.serverSeed,
    clientSeed: entropy?.clientSeed,
  };
}

/**
 * Create pack entropy for a new pack
 */
export async function createPackEntropy(
  serverSeed?: string
): Promise<PackEntropy> {
  const srvSeed = serverSeed || generateServerEntropy();
  const clientSeed = generateClientEntropy();
  const nonce = Date.now();
  const hash = await createEntropyHash(srvSeed, clientSeed, nonce);

  return {
    serverSeed: srvSeed,
    clientSeed,
    nonce,
    hash,
    timestamp: new Date(),
  };
}

/**
 * Get entropy rotation status
 * Returns true if seeds should be rotated
 */
export function shouldRotateEntropy(lastRotation: Date, intervalMs: number = 300000): boolean {
  return Date.now() - lastRotation.getTime() > intervalMs;
}
