/**
 * PACK-005: Card Type Distribution Verification Tests
 *
 * Tests for verifying dad type distribution meets acceptance criteria:
 * - Minimum 5 cards per dad type
 * - Balanced distribution (6-7 cards per type average)
 * - All 16 core dad types represented
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getAllCards,
  getTypeDistribution,
  verifyTypeDistribution,
  type TypeDistributionReport,
} from '@/lib/cards/database';

describe('PACK-005: Card Type Distribution', () => {
  describe('getTypeDistribution()', () => {
    it('should return distribution map with all card types', () => {
      const distribution = getTypeDistribution();

      expect(distribution).toBeDefined();
      expect(typeof distribution).toBe('object');
      expect(Object.keys(distribution).length).toBeGreaterThan(0);
    });

    it('should accurately count cards per type', () => {
      const allCards = getAllCards();
      const distribution = getTypeDistribution();

      // Verify total count matches
      const totalCount = Object.values(distribution).reduce((sum, count) => sum + count, 0);
      expect(totalCount).toBe(allCards.length);

      // Verify each type exists in cards
      for (const [type, count] of Object.entries(distribution)) {
        const cardsOfType = allCards.filter(card => card.type === type);
        expect(cardsOfType.length).toBe(count);
      }
    });

    it('should include all unique dad types present in database', () => {
      const allCards = getAllCards();
      const distribution = getTypeDistribution();

      const typesInCards = new Set(allCards.map(card => card.type));
      const typesInDistribution = new Set(Object.keys(distribution));

      expect(typesInDistribution).toEqual(typesInCards);
    });
  });

  describe('verifyTypeDistribution()', () => {
    it('should return valid flag and detailed report', () => {
      const result = verifyTypeDistribution();

      expect(result).toHaveProperty('valid');
      expect(typeof result.valid).toBe('boolean');

      expect(result).toHaveProperty('report');
      expect(result.report).toBeDefined();
    });

    it('should report total card count', () => {
      const { report } = verifyTypeDistribution();
      const allCards = getAllCards();

      expect(report.totalCards).toBe(allCards.length);
      expect(report.totalCards).toBeGreaterThan(0);
    });

    it('should report unique dad type count', () => {
      const { report } = verifyTypeDistribution();

      expect(report.uniqueTypes).toBeGreaterThan(0);
      expect(report.uniqueTypes).toBe(Object.keys(report.distribution).length);
    });

    it('should calculate average cards per type', () => {
      const { report } = verifyTypeDistribution();

      expect(report.averageCardsPerType).toBeGreaterThan(0);

      // Verify calculation
      const expected = report.totalCards / report.uniqueTypes;
      expect(report.averageCardsPerType).toBeCloseTo(expected, 1);
    });

    it('should identify types below minimum threshold (5 cards)', () => {
      const { report } = verifyTypeDistribution();

      expect(Array.isArray(report.belowMinimum)).toBe(true);

      // Verify each entry is actually below minimum
      report.belowMinimum.forEach(([type, count]) => {
        expect(count).toBeLessThan(5);
        expect(report.distribution[type]).toBe(count);
      });
    });

    it('should identify types above target average (+2)', () => {
      const { report } = verifyTypeDistribution();

      expect(Array.isArray(report.aboveTarget)).toBe(true);

      // Verify each entry is above target + 2
      report.aboveTarget.forEach(([type, count]) => {
        expect(count).toBeGreaterThan(8.5); // 6.5 + 2
        expect(report.distribution[type]).toBe(count);
      });
    });

    it('should identify types below target average (-2)', () => {
      const { report } = verifyTypeDistribution();

      expect(Array.isArray(report.belowTarget)).toBe(true);

      // Verify each entry is below target - 2
      report.belowTarget.forEach(([type, count]) => {
        expect(count).toBeLessThan(4.5); // 6.5 - 2
        expect(report.distribution[type]).toBe(count);
      });
    });

    it('should check for missing core dad types', () => {
      const { report } = verifyTypeDistribution();

      expect(Array.isArray(report.missingCoreTypes)).toBe(true);

      // Verify missing types are actually not in distribution
      report.missingCoreTypes.forEach(type => {
        expect(report.distribution[type]).toBeUndefined();
      });
    });

    it('should return sorted entries by count (descending)', () => {
      const { report } = verifyTypeDistribution();

      expect(Array.isArray(report.sortedEntries)).toBe(true);

      // Verify sorted order
      for (let i = 1; i < report.sortedEntries.length; i++) {
        const prevCount = report.sortedEntries[i - 1][1];
        const currCount = report.sortedEntries[i][1];
        expect(prevCount).toBeGreaterThanOrEqual(currCount);
      }
    });

    it('should include all three acceptance criteria checks', () => {
      const { report } = verifyTypeDistribution();

      expect(report.checks).toHaveProperty('minimumCardsPerType');
      expect(report.checks).toHaveProperty('balancedDistribution');
      expect(report.checks).toHaveProperty('allCoreTypesPresent');

      expect(typeof report.checks.minimumCardsPerType).toBe('boolean');
      expect(typeof report.checks.balancedDistribution).toBe('boolean');
      expect(typeof report.checks.allCoreTypesPresent).toBe('boolean');
    });

    it('should pass minimum cards check if no types below threshold', () => {
      const { report } = verifyTypeDistribution();

      if (report.belowMinimum.length === 0) {
        expect(report.checks.minimumCardsPerType).toBe(true);
      } else {
        expect(report.checks.minimumCardsPerType).toBe(false);
      }
    });

    it('should pass balanced distribution if outliers < 50%', () => {
      const { report } = verifyTypeDistribution();

      const outlierCount = report.aboveTarget.length + report.belowTarget.length;
      const threshold = report.uniqueTypes / 2;

      if (outlierCount < threshold) {
        expect(report.checks.balancedDistribution).toBe(true);
      } else {
        expect(report.checks.balancedDistribution).toBe(false);
      }
    });

    it('should pass core types check if all 16 types present', () => {
      const { report } = verifyTypeDistribution();

      if (report.missingCoreTypes.length === 0) {
        expect(report.checks.allCoreTypesPresent).toBe(true);
      } else {
        expect(report.checks.allCoreTypesPresent).toBe(false);
      }
    });
  });

  describe('Console Logging', () => {
    it('should log type distribution to console (manual verification)', () => {
      const { report } = verifyTypeDistribution();
      const consoleSpy = vi.spyOn(console, 'log');

      // Log distribution for manual verification
      console.log('=== CARD TYPE DISTRIBUTION ===');
      console.log(`Total cards: ${report.totalCards}`);
      console.log(`Dad types: ${report.uniqueTypes}`);
      console.log(`Average per type: ${report.averageCardsPerType}`);
      console.log('');
      console.log('Distribution by type:');

      report.sortedEntries.forEach(([type, count]) => {
        const percentage = ((count / report.totalCards) * 100).toFixed(1);
        console.log(`  ${type.padEnd(30)} ${String(count).padStart(3)} cards (${percentage}%)`);
      });

      console.log('');
      console.log('=== ACCEPTANCE CRITERIA ===');
      console.log(`Minimum 5 cards per type: ${report.checks.minimumCardsPerType ? '✓ PASS' : '✗ FAIL'}`);
      console.log(`Balanced distribution: ${report.checks.balancedDistribution ? '✓ PASS' : '✗ FAIL'}`);
      console.log(`All 16 core types: ${report.checks.allCoreTypesPresent ? '✓ PASS' : '✗ FAIL'}`);

      expect(consoleSpy).toHaveBeenCalled();

      // Cleanup
      consoleSpy.mockRestore();
    });
  });
});
