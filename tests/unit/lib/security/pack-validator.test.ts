/**
 * PACK-097: Pack Validator Unit Tests
 *
 * Comprehensive test suite for pack validation system
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Pack, PackConfig, Rarity } from '@/types';
import {
  generatePackHash,
  detectDuplicatePack,
  validateRarityDistribution,
  detectStatisticalAnomalies,
  calculatePackEntropy,
  validatePackEntropy,
  validatePackBeforeOpen,
  getSuspiciousActivityLogs,
  clearActivityLogs,
  formatValidationResult,
  type ValidationResult,
} from '@/lib/security/pack-validator';

// ============================================================================
// TEST FIXTURES
// ============================================================================

function createMockPack(overrides?: Partial<Pack>): Pack {
  // Create base card template
  const createCard = (id: string, rarity: Rarity, name: string, type: string) => ({
    id,
    name,
    subtitle: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Card`,
    type,
    rarity,
    artwork: `/test-${id}.png`,
    stats: {
      dadJoke: 50,
      grillSkill: 50,
      fixIt: 50,
      napPower: 50,
      remoteControl: 50,
      thermostat: 50,
      sockSandal: 50,
      beerSnob: 50,
    },
    flavorText: 'Test flavor',
    abilities: [],
    series: 1,
    cardNumber: parseInt(id.split('-')[1]),
    totalInSeries: 100,
    artist: 'Test Artist',
    isRevealed: false,
    isHolo: false,
    holoType: 'none' as const,
  });

  return {
    id: 'test-pack-1',
    cards: [
      createCard('card-1', 'common', 'Test Card 1', 'BBQ_DAD'),
      createCard('card-2', 'common', 'Test Card 2', 'FIX_IT_DAD'),
      createCard('card-3', 'common', 'Test Card 3', 'GOLF_DAD'),
      createCard('card-4', 'uncommon', 'Test Card 4', 'COUCH_DAD'),
      createCard('card-5', 'uncommon', 'Test Card 5', 'LAWN_DAD'),
      createCard('card-6', 'rare', 'Test Card 6', 'CAR_DAD'),
    ],
    openedAt: new Date(),
    bestRarity: 'rare',
    design: 'standard',
    ...overrides,
  };
}

function createMockConfig(): PackConfig {
  return {
    cardsPerPack: 6,
    raritySlots: [
      { slot: 1, guaranteedRarity: 'common' },
      { slot: 2, guaranteedRarity: 'common' },
      { slot: 3, guaranteedRarity: 'common' },
      {
        slot: 4,
        rarityPool: true,
        probability: { uncommon: 0.74, rare: 0.20, epic: 0.05, legendary: 0.009, mythic: 0.001 },
      },
      {
        slot: 5,
        rarityPool: true,
        probability: { uncommon: 0.74, rare: 0.20, epic: 0.05, legendary: 0.009, mythic: 0.001 },
      },
      {
        slot: 6,
        rarityPool: true,
        probability: { rare: 0.879, epic: 0.10, legendary: 0.0199, mythic: 0.001 },
      },
    ],
    holoChance: 1 / 6,
    packType: 'standard',
  };
}

// ============================================================================
// HASH GENERATION TESTS
// ============================================================================

describe('generatePackHash', () => {
  it('should generate consistent hash for same pack', () => {
    const pack = createMockPack();
    const hash1 = generatePackHash(pack);
    const hash2 = generatePackHash(pack);

    expect(hash1).toBe(hash2);
    expect(hash1).toBeTruthy();
    expect(typeof hash1).toBe('string');
  });

  it('should generate different hashes for different packs', () => {
    const pack1 = createMockPack();
    const pack2 = createMockPack({ id: 'test-pack-2' });

    const hash1 = generatePackHash(pack1);
    const hash2 = generatePackHash(pack2);

    expect(hash1).not.toBe(hash2);
  });

  it('should be insensitive to card order', () => {
    const pack1 = createMockPack();
    const cardsReordered = [...pack1.cards].reverse();
    const pack2 = { ...pack1, cards: cardsReordered };

    const hash1 = generatePackHash(pack1);
    const hash2 = generatePackHash(pack2);

    expect(hash1).toBe(hash2);
  });
});

// ============================================================================
// DUPLICATE DETECTION TESTS
// ============================================================================

describe('detectDuplicatePack', () => {
  beforeEach(() => {
    // Clear cache before each test by creating a unique pack ID each time
    // The cache is keyed by hash, so we need unique cards
  });

  it('should pass validation for new pack', () => {
    const pack = createMockPack({ id: `test-pack-${Date.now()}-1` });
    const result = detectDuplicatePack(pack);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.confidence).toBe(1);
  });

  it('should detect duplicate pack within TTL', () => {
    const pack = createMockPack({ id: `test-pack-${Date.now()}-2` });

    // First call should pass
    const result1 = detectDuplicatePack(pack);
    expect(result1.valid).toBe(true);

    // Immediate second call should detect duplicate
    const result2 = detectDuplicatePack(pack);
    expect(result2.valid).toBe(false);
    expect(result2.violations).toHaveLength(1);
    expect(result2.violations[0].type).toBe('duplicate_pack_detected');
    expect(result2.violations[0].severity).toBe('critical');
    expect(result2.confidence).toBe(0);
  });

  it('should allow same pack after TTL expires', () => {
    const pack = createMockPack();

    // First call
    detectDuplicatePack(pack);

    // Mock time passing (beyond 1 hour TTL)
    vi.useFakeTimers();
    vi.advanceTimersByTime(3600000 + 1000); // 1 hour + 1 second

    // Should pass now
    const result = detectDuplicatePack(pack);
    expect(result.valid).toBe(true);

    vi.useRealTimers();
  });
});

// ============================================================================
// RARITY DISTRIBUTION VALIDATION TESTS
// ============================================================================

describe('validateRarityDistribution', () => {
  it('should validate correct rarity distribution', () => {
    const pack = createMockPack();
    const config = createMockConfig();

    const result = validateRarityDistribution(pack, config);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.confidence).toBe(1);
  });

  it('should detect wrong rarity in guaranteed slot', () => {
    const pack = createMockPack();
    // Slot 1 should be common, but we'll make it mythic
    pack.cards[0].rarity = 'mythic';

    const config = createMockConfig();
    const result = validateRarityDistribution(pack, config);

    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].type).toBe('invalid_rarity_distribution');
    expect(result.violations[0].severity).toBe('critical');
    expect(result.violations[0].message).toContain('Slot 1');
  });

  it('should detect impossible pack with multiple mythics', () => {
    const pack = createMockPack();
    pack.cards[0].rarity = 'mythic';
    pack.cards[1].rarity = 'mythic';

    const config = createMockConfig();
    const result = validateRarityDistribution(pack, config);

    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.type === 'impossible_pack')).toBe(true);
  });

  it('should warn for rare but possible packs', () => {
    const pack = createMockPack();
    // Put legendaries in slots 4-5 which allow rare+ cards
    pack.cards[3].rarity = 'legendary'; // Slot 4
    pack.cards[4].rarity = 'legendary'; // Slot 5
    pack.bestRarity = 'legendary'; // Update best rarity

    const config = createMockConfig();
    const result = validateRarityDistribution(pack, config);

    expect(result.valid).toBe(true); // No critical violations
    expect(result.warnings.some((w) => w.type === 'rare_pull')).toBe(true);
  });
});

// ============================================================================
// STATISTICAL ANOMALY DETECTION TESTS
// ============================================================================

describe('detectStatisticalAnomalies', () => {
  it('should pass validation for normal pack', () => {
    const pack = createMockPack();
    const result = detectStatisticalAnomalies(pack, []);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should flag extremely anomalous pack with historical data', () => {
    // Generate historical data (mostly common packs)
    const historicalScores: number[] = [];
    for (let i = 0; i < 100; i++) {
      historicalScores.push(100 + Math.random() * 50); // Normal scores: 100-150
    }

    // Create an extremely rare pack
    const pack = createMockPack();
    pack.cards.forEach((card) => {
      card.rarity = 'mythic';
    });

    const result = detectStatisticalAnomalies(pack, historicalScores);

    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations[0].type).toBe('statistical_anomaly');
  });

  it('should detect impossible rarity combination', () => {
    const pack = createMockPack();
    pack.cards[0].rarity = 'mythic';
    pack.cards[1].rarity = 'legendary';
    pack.cards[2].rarity = 'legendary';
    pack.cards[3].rarity = 'legendary';

    const result = detectStatisticalAnomalies(pack, []);

    expect(result.valid).toBe(false);
    expect(result.violations[0].type).toBe('impossible_pack');
  });
});

// ============================================================================
// ENTROPY CALCULATION TESTS
// ============================================================================

describe('calculatePackEntropy', () => {
  it('should calculate entropy for unique cards', () => {
    const pack = createMockPack();
    const entropy = calculatePackEntropy(pack);

    expect(entropy).toBeGreaterThan(0);
    expect(entropy).toBeLessThanOrEqual(Math.log2(6)); // Max entropy for 6 cards
  });

  it('should detect low entropy with duplicates', () => {
    const pack = createMockPack();
    // Make all cards the same
    const firstCard = { ...pack.cards[0] };
    pack.cards = pack.cards.map(() => ({ ...firstCard }));

    const entropy = calculatePackEntropy(pack);

    expect(entropy).toBe(0); // Zero entropy when all cards are identical
  });

  it('should calculate maximum entropy for all unique cards', () => {
    const pack = createMockPack();
    // Ensure all cards are unique
    for (let i = 0; i < pack.cards.length; i++) {
      pack.cards[i].id = `unique-card-${i}`;
    }

    const entropy = calculatePackEntropy(pack);
    const maxEntropy = Math.log2(6);

    expect(entropy).toBeCloseTo(maxEntropy, 1);
  });
});

// ============================================================================
// ENTROPY VALIDATION TESTS
// ============================================================================

describe('validatePackEntropy', () => {
  it('should validate pack with good entropy', () => {
    const pack = createMockPack();
    const result = validatePackEntropy(pack, 2.0);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should reject pack with duplicate cards', () => {
    const pack = createMockPack();
    // Make cards 1 and 2 identical
    pack.cards[1] = { ...pack.cards[0] };

    const result = validatePackEntropy(pack, 2.0);

    expect(result.valid).toBe(false);
    expect(result.violations[0].type).toBe('low_entropy');
    expect(result.violations[0].severity).toBe('high');
    expect(result.violations[0].message).toContain('Duplicate cards');
  });

  it('should warn when entropy below 70% of maximum', () => {
    const pack = createMockPack();
    // Create extremely low entropy - all cards identical
    const firstCard = pack.cards[0];
    for (let i = 1; i < pack.cards.length; i++) {
      pack.cards[i] = { ...firstCard };
    }

    const result = validatePackEntropy(pack, 0.0); // No minimum threshold

    // With all cards identical, we should get a violation (not just warning)
    // due to zero entropy/duplicates
    const hasLowEntropyIssue = !result.valid || result.warnings.length > 0;
    expect(hasLowEntropyIssue).toBe(true);
  });
});

// ============================================================================
// COMPREHENSIVE VALIDATION TESTS
// ============================================================================

describe('validatePackBeforeOpen', () => {
  beforeEach(() => {
    clearActivityLogs();
  });

  it('should pass validation for legitimate pack', async () => {
    const pack = createMockPack({ id: `test-pack-${Date.now()}-legitimate` });
    const config = createMockConfig();

    const result = await validatePackBeforeOpen(pack, config);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.confidence).toBe(1);
  });

  it('should fail validation for duplicate pack', async () => {
    const pack = createMockPack();
    const config = createMockConfig();

    // First validation
    await validatePackBeforeOpen(pack, config);

    // Second validation should detect duplicate
    const result = await validatePackBeforeOpen(pack, config, {
      checkDuplicates: true,
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.type === 'duplicate_pack_detected')).toBe(true);
  });

  it('should fail validation for wrong rarity distribution', async () => {
    const pack = createMockPack();
    const config = createMockConfig();

    // Make slot 1 wrong rarity
    pack.cards[0].rarity = 'legendary';

    const result = await validatePackBeforeOpen(pack, config, {
      checkDuplicates: false, // Skip duplicate check for this test
      checkAnomalies: false, // Skip anomaly check
      checkEntropy: false, // Skip entropy check
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.type === 'invalid_rarity_distribution')).toBe(
      true
    );
  });

  it('should detect low entropy issues', async () => {
    const pack = createMockPack({ id: `test-pack-${Date.now()}-low-entropy` });
    const config = createMockConfig();

    // Create all identical cards for zero entropy
    const firstCard = pack.cards[0];
    for (let i = 1; i < pack.cards.length; i++) {
      pack.cards[i] = { ...firstCard };
    }

    const result = await validatePackBeforeOpen(pack, config, {
      checkDuplicates: false,
      checkDistribution: false,
      checkAnomalies: false,
    });

    // With all cards identical, entropy should be very low
    const entropy = calculatePackEntropy(pack);
    expect(entropy).toBe(0); // Zero entropy when all identical

    // Should have violations or warnings about duplicates
    const hasIssues = !result.valid || result.violations.length > 0 || result.warnings.length > 0;
    expect(hasIssues).toBe(true);
  });

  it('should log suspicious activity', async () => {
    const pack = createMockPack();
    const config = createMockConfig();

    // Make it suspicious
    pack.cards[0].rarity = 'mythic';
    pack.bestRarity = 'mythic'; // Update best rarity

    await validatePackBeforeOpen(pack, config, {
      checkDuplicates: false,
      checkDistribution: true,
    });

    const logs = getSuspiciousActivityLogs();

    expect(logs).toHaveLength(1);
    expect(logs[0].packSummary.bestRarity).toBe('mythic');
    expect(logs[0].violations.length).toBeGreaterThan(0);
  });

  it('should allow selective validation checks', async () => {
    const pack = createMockPack();
    const config = createMockConfig();

    const result = await validatePackBeforeOpen(pack, config, {
      checkDuplicates: false,
      checkDistribution: false,
      checkAnomalies: false,
      checkEntropy: false,
    });

    // Should pass even if pack has issues because we disabled all checks
    expect(result.valid).toBe(true);
    expect(result.confidence).toBe(0); // No confidence without checks
  });
});

// ============================================================================
// ACTIVITY LOGGING TESTS
// ============================================================================

describe('Activity Logging', () => {
  beforeEach(() => {
    clearActivityLogs();
  });

  it('should log suspicious activity', async () => {
    const pack = createMockPack();
    const config = createMockConfig();
    pack.cards[0].rarity = 'mythic';
    pack.bestRarity = 'mythic'; // Update best rarity

    await validatePackBeforeOpen(pack, config, {
      checkDuplicates: false,
      checkAnomalies: false,
      checkDistribution: true, // Enable distribution check to trigger violation
    });

    const logs = getSuspiciousActivityLogs();
    expect(logs.length).toBeGreaterThan(0); // Should have logged the suspicious pack
  });

  it('should respect log size limit', async () => {
    const pack = createMockPack();
    const config = createMockConfig();

    // Generate more than MAX_LOG_SIZE entries
    for (let i = 0; i < 1100; i++) {
      pack.id = `test-pack-${i}`;
      await validatePackBeforeOpen(pack, config, {
        checkDuplicates: false,
        checkAnomalies: false,
        checkEntropy: false,
      });
    }

    const logs = getSuspiciousActivityLogs();
    // Should be capped at MAX_LOG_SIZE (1000)
    expect(logs.length).toBeLessThanOrEqual(1000);
  });

  it('should allow clearing logs', async () => {
    const pack = createMockPack();
    const config = createMockConfig();

    // Make it suspicious so it gets logged
    pack.cards[0].rarity = 'mythic';
    pack.bestRarity = 'mythic';

    await validatePackBeforeOpen(pack, config, {
      checkDuplicates: false,
      checkAnomalies: false,
      checkEntropy: false,
      checkDistribution: true, // Enable to trigger violation
    });

    expect(getSuspiciousActivityLogs().length).toBeGreaterThan(0);

    clearActivityLogs();
    expect(getSuspiciousActivityLogs()).toHaveLength(0);
  });

  it('should retrieve limited log entries', async () => {
    const pack = createMockPack();
    const config = createMockConfig();

    for (let i = 0; i < 10; i++) {
      pack.id = `test-pack-${i}`;
      pack.cards[0].rarity = i < 5 ? 'mythic' : 'legendary'; // Make suspicious
      pack.bestRarity = i < 5 ? 'mythic' : 'legendary';

      await validatePackBeforeOpen(pack, config, {
        checkDuplicates: false,
        checkAnomalies: false,
        checkEntropy: false,
        checkDistribution: true, // Enable to trigger violation
      });
    }

    const last5 = getSuspiciousActivityLogs(5);
    expect(last5).toHaveLength(5);
  });
});

// ============================================================================
// FORMATTING TESTS
// ============================================================================

describe('formatValidationResult', () => {
  it('should format successful validation', () => {
    const result: ValidationResult = {
      valid: true,
      violations: [],
      warnings: [],
      confidence: 1,
    };

    const formatted = formatValidationResult(result);

    expect(formatted).toContain('Valid: ✓');
    expect(formatted).toContain('Confidence: 100.0%');
    expect(formatted).not.toContain('Violations');
    expect(formatted).not.toContain('Warnings');
  });

  it('should format validation with violations', () => {
    const result: ValidationResult = {
      valid: false,
      violations: [
        {
          type: 'invalid_rarity_distribution',
          severity: 'critical',
          message: 'Slot 1 should be common but got mythic',
          details: { slot: 1, expected: 'common', actual: 'mythic' },
        },
      ],
      warnings: [],
      confidence: 0,
    };

    const formatted = formatValidationResult(result);

    expect(formatted).toContain('Valid: ✗');
    expect(formatted).toContain('Confidence: 0.0%');
    expect(formatted).toContain('Violations (1)');
    expect(formatted).toContain('[CRITICAL]');
    expect(formatted).toContain('Slot 1 should be common but got mythic');
  });

  it('should format validation with warnings', () => {
    const result: ValidationResult = {
      valid: true,
      violations: [],
      warnings: [
        {
          type: 'rare_pull',
          message: 'Unusually rare pack: 2 legendary cards',
          details: { legendaryCount: 2 },
        },
      ],
      confidence: 0.8,
    };

    const formatted = formatValidationResult(result);

    expect(formatted).toContain('Valid: ✓');
    expect(formatted).toContain('Confidence: 80.0%');
    expect(formatted).toContain('Warnings (1)');
    expect(formatted).toContain('[⚠]');
    expect(formatted).toContain('Unusually rare pack');
  });
});

// ============================================================================
// CLEANUP
// ============================================================================

afterAll(() => {
  clearActivityLogs();
});
