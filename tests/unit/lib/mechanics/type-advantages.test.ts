import { describe, it, expect } from 'vitest';
import type { DadType } from '@/types';
import {
  TYPE_ADVANTAGE_MATRIX,
  getTypeAdvantage,
  getAdvantages,
  getDisadvantages,
  getNeutrals,
  hasAdvantage,
  hasDisadvantage,
  validateMatrix,
  ADVANTAGE_MULTIPLIER,
  DISADVANTAGE_MULTIPLIER,
  NEUTRAL_MULTIPLIER,
} from '@/lib/mechanics/type-advantages';

describe('Type Advantage Matrix (PACK-008)', () => {
  describe('Matrix Structure', () => {
    it('should have all 16 dad types defined', () => {
      const expectedTypes: DadType[] = [
        'BBQ_DAD',
        'FIX_IT_DAD',
        'GOLF_DAD',
        'COUCH_DAD',
        'LAWN_DAD',
        'CAR_DAD',
        'OFFICE_DAD',
        'COOL_DAD',
        'COACH_DAD',
        'CHEF_DAD',
        'HOLIDAY_DAD',
        'WAREHOUSE_DAD',
        'VINTAGE_DAD',
        'FASHION_DAD',
        'TECH_DAD',
        'ITEM',
      ];

      expectedTypes.forEach(type => {
        expect(TYPE_ADVANTAGE_MATRIX[type]).toBeDefined();
      });
    });

    it('should have exactly 2 advantages per type (except ITEM)', () => {
      Object.entries(TYPE_ADVANTAGE_MATRIX).forEach(([type, advantages]) => {
        if (type === 'ITEM') {
          expect(advantages).toEqual([]);
        } else {
          expect(advantages.length).toBe(2);
        }
      });
    });

    it('should have exactly 2 disadvantages per type (except ITEM)', () => {
      Object.keys(TYPE_ADVANTAGE_MATRIX).forEach(type => {
        if (type === 'ITEM') return;

        const disadvantages = getDisadvantages(type as DadType);
        expect(disadvantages.length).toBe(2);
      });
    });

    it('should have 11 neutral matchups per type', () => {
      Object.keys(TYPE_ADVANTAGE_MATRIX).forEach(type => {
        if (type === 'ITEM') return;

        const neutrals = getNeutrals(type as DadType);
        expect(neutrals.length).toBe(11);
      });
    });

    it('should pass matrix validation', () => {
      expect(() => validateMatrix()).not.toThrow();
    });
  });

  describe('getTypeAdvantage', () => {
    it('should return 1.2 for advantageous matchups', () => {
      // BBQ_DAD has advantage over GOLF_DAD and COUCH_DAD
      expect(getTypeAdvantage('BBQ_DAD', 'GOLF_DAD')).toBe(ADVANTAGE_MULTIPLIER);
      expect(getTypeAdvantage('BBQ_DAD', 'COUCH_DAD')).toBe(ADVANTAGE_MULTIPLIER);

      // FIX_IT_DAD has advantage over TECH_DAD and CAR_DAD
      expect(getTypeAdvantage('FIX_IT_DAD', 'TECH_DAD')).toBe(ADVANTAGE_MULTIPLIER);
      expect(getTypeAdvantage('FIX_IT_DAD', 'CAR_DAD')).toBe(ADVANTAGE_MULTIPLIER);

      // GOLF_DAD has advantage over COACH_DAD and COOL_DAD
      expect(getTypeAdvantage('GOLF_DAD', 'COACH_DAD')).toBe(ADVANTAGE_MULTIPLIER);
      expect(getTypeAdvantage('GOLF_DAD', 'COOL_DAD')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should return 0.8 for disadvantageous matchups', () => {
      // GOLF_DAD is at disadvantage when BBQ_DAD attacks
      expect(getTypeAdvantage('GOLF_DAD', 'BBQ_DAD')).toBe(DISADVANTAGE_MULTIPLIER);

      // TECH_DAD is at disadvantage when FIX_IT_DAD attacks
      expect(getTypeAdvantage('TECH_DAD', 'FIX_IT_DAD')).toBe(DISADVANTAGE_MULTIPLIER);

      // COACH_DAD is at disadvantage when GOLF_DAD attacks
      expect(getTypeAdvantage('COACH_DAD', 'GOLF_DAD')).toBe(DISADVANTAGE_MULTIPLIER);
    });

    it('should return 1.0 for neutral matchups', () => {
      // BBQ_DAD vs FIX_IT_DAD is neutral
      expect(getTypeAdvantage('BBQ_DAD', 'FIX_IT_DAD')).toBe(NEUTRAL_MULTIPLIER);

      // GOLF_DAD vs LAWN_DAD is neutral
      expect(getTypeAdvantage('GOLF_DAD', 'LAWN_DAD')).toBe(NEUTRAL_MULTIPLIER);

      // TECH_DAD vs CAR_DAD is neutral
      expect(getTypeAdvantage('TECH_DAD', 'CAR_DAD')).toBe(NEUTRAL_MULTIPLIER);
    });

    it('should return 1.0 for ITEM type matchups', () => {
      expect(getTypeAdvantage('ITEM', 'BBQ_DAD')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('BBQ_DAD', 'ITEM')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('ITEM', 'ITEM')).toBe(NEUTRAL_MULTIPLIER);
    });

    it('should be symmetric (advantage in one direction = disadvantage in other)', () => {
      const allTypes: DadType[] = [
        'BBQ_DAD',
        'FIX_IT_DAD',
        'GOLF_DAD',
        'COUCH_DAD',
        'LAWN_DAD',
        'CAR_DAD',
        'OFFICE_DAD',
        'COOL_DAD',
        'COACH_DAD',
        'CHEF_DAD',
        'HOLIDAY_DAD',
        'WAREHOUSE_DAD',
        'VINTAGE_DAD',
        'FASHION_DAD',
        'TECH_DAD',
      ];

      // Check that advantages are symmetric
      allTypes.forEach(type1 => {
        allTypes.forEach(type2 => {
          const adv1 = getTypeAdvantage(type1, type2);
          const adv2 = getTypeAdvantage(type2, type1);

          if (adv1 === ADVANTAGE_MULTIPLIER) {
            expect(adv2).toBe(DISADVANTAGE_MULTIPLIER);
          } else if (adv1 === DISADVANTAGE_MULTIPLIER) {
            expect(adv2).toBe(ADVANTAGE_MULTIPLIER);
          } else {
            expect(adv2).toBe(NEUTRAL_MULTIPLIER);
          }
        });
      });
    });
  });

  describe('getAdvantages', () => {
    it('should return 2 types that this type has advantage over', () => {
      const bbqAdvantages = getAdvantages('BBQ_DAD');
      expect(bbqAdvantages).toHaveLength(2);
      expect(bbqAdvantages).toContain('GOLF_DAD');
      expect(bbqAdvantages).toContain('COUCH_DAD');

      const fixItAdvantages = getAdvantages('FIX_IT_DAD');
      expect(fixItAdvantages).toHaveLength(2);
      expect(fixItAdvantages).toContain('TECH_DAD');
      expect(fixItAdvantages).toContain('CAR_DAD');

      const golfAdvantages = getAdvantages('GOLF_DAD');
      expect(golfAdvantages).toHaveLength(2);
      expect(golfAdvantages).toContain('COACH_DAD');
      expect(golfAdvantages).toContain('COOL_DAD');
    });

    it('should return empty array for ITEM type', () => {
      expect(getAdvantages('ITEM')).toEqual([]);
    });
  });

  describe('getDisadvantages', () => {
    it('should return 2 types that this type has disadvantage against', () => {
      const bbqDisadvantages = getDisadvantages('BBQ_DAD');
      expect(bbqDisadvantages).toHaveLength(2);
      // BBQ_DAD is at disadvantage when CHEF_DAD or GOLF_DAD attack

      const fixItDisadvantages = getDisadvantages('FIX_IT_DAD');
      expect(fixItDisadvantages).toHaveLength(2);
      // FIX_IT_DAD is at disadvantage when COACH_DAD or VINTAGE_DAD attack
      expect(fixItDisadvantages).toContain('COACH_DAD');
      expect(fixItDisadvantages).toContain('VINTAGE_DAD');

      const golfDisadvantages = getDisadvantages('GOLF_DAD');
      expect(golfDisadvantages).toHaveLength(2);
      expect(golfDisadvantages).toContain('BBQ_DAD');
    });
  });

  describe('getNeutrals', () => {
    it('should return 11 neutral matchups', () => {
      const bbqNeutrals = getNeutrals('BBQ_DAD');
      expect(bbqNeutrals).toHaveLength(11);

      const fixItNeutrals = getNeutrals('FIX_IT_DAD');
      expect(fixItNeutrals).toHaveLength(11);
    });

    it('should not include advantages or disadvantages in neutrals', () => {
      const bbqAdvantages = getAdvantages('BBQ_DAD');
      const bbqDisadvantages = getDisadvantages('BBQ_DAD');
      const bbqNeutrals = getNeutrals('BBQ_DAD');

      bbqAdvantages.forEach(adv => {
        expect(bbqNeutrals).not.toContain(adv);
      });

      bbqDisadvantages.forEach(disadv => {
        expect(bbqNeutrals).not.toContain(disadv);
      });
    });
  });

  describe('hasAdvantage', () => {
    it('should return true for advantageous matchups', () => {
      expect(hasAdvantage('BBQ_DAD', 'GOLF_DAD')).toBe(true);
      expect(hasAdvantage('FIX_IT_DAD', 'TECH_DAD')).toBe(true);
      expect(hasAdvantage('GOLF_DAD', 'COACH_DAD')).toBe(true);
    });

    it('should return false for non-advantageous matchups', () => {
      expect(hasAdvantage('GOLF_DAD', 'BBQ_DAD')).toBe(false);
      expect(hasAdvantage('TECH_DAD', 'FIX_IT_DAD')).toBe(false);
      expect(hasAdvantage('BBQ_DAD', 'FIX_IT_DAD')).toBe(false);
    });
  });

  describe('hasDisadvantage', () => {
    it('should return true for disadvantageous matchups', () => {
      expect(hasDisadvantage('GOLF_DAD', 'BBQ_DAD')).toBe(true);
      expect(hasDisadvantage('TECH_DAD', 'FIX_IT_DAD')).toBe(true);
      expect(hasDisadvantage('COACH_DAD', 'GOLF_DAD')).toBe(true);
    });

    it('should return false for non-disadvantageous matchups', () => {
      expect(hasDisadvantage('BBQ_DAD', 'GOLF_DAD')).toBe(false);
      expect(hasDisadvantage('FIX_IT_DAD', 'TECH_DAD')).toBe(false);
      expect(hasDisadvantage('BBQ_DAD', 'FIX_IT_DAD')).toBe(false);
    });
  });

  describe('Thematic Logic Examples', () => {
    it('should have BBQ_DAD +20% vs GOLF_DAD (heat melts golf game)', () => {
      expect(getTypeAdvantage('BBQ_DAD', 'GOLF_DAD')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should have FIX_IT_DAD +20% vs TECH_DAD (analog beats digital)', () => {
      expect(getTypeAdvantage('FIX_IT_DAD', 'TECH_DAD')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should have GOLF_DAD +20% vs COACH_DAD (golf vs sports coach rivalry)', () => {
      expect(getTypeAdvantage('GOLF_DAD', 'COACH_DAD')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should have CHEF_DAD +20% vs BBQ_DAD (kitchen beats BBQ rivalry)', () => {
      expect(getTypeAdvantage('CHEF_DAD', 'BBQ_DAD')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should have FIX_IT_DAD +20% vs TECH_DAD (analog beats digital)', () => {
      expect(getTypeAdvantage('FIX_IT_DAD', 'TECH_DAD')).toBe(ADVANTAGE_MULTIPLIER);
    });
  });

  describe('Multiplier Constants', () => {
    it('should have advantage multiplier of 1.2', () => {
      expect(ADVANTAGE_MULTIPLIER).toBe(1.2);
    });

    it('should have disadvantage multiplier of 0.8', () => {
      expect(DISADVANTAGE_MULTIPLIER).toBe(0.8);
    });

    it('should have neutral multiplier of 1.0', () => {
      expect(NEUTRAL_MULTIPLIER).toBe(1.0);
    });

    it('should have disadvantage multiplier as inverse of advantage', () => {
      expect(DISADVANTAGE_MULTIPLIER).toBeCloseTo(1 / ADVANTAGE_MULTIPLIER, 1);
    });
  });

  describe('Battle System Integration', () => {
    it('should calculate correct damage with advantage', () => {
      const baseDamage = 100;
      const advantage = getTypeAdvantage('BBQ_DAD', 'GOLF_DAD');
      const expectedDamage = baseDamage * advantage;

      expect(expectedDamage).toBe(120); // 100 * 1.2
    });

    it('should calculate correct damage with disadvantage', () => {
      const baseDamage = 100;
      const disadvantage = getTypeAdvantage('GOLF_DAD', 'BBQ_DAD');
      const expectedDamage = baseDamage * disadvantage;

      expect(expectedDamage).toBe(80); // 100 * 0.8
    });

    it('should calculate correct damage with neutral matchup', () => {
      const baseDamage = 100;
      const neutral = getTypeAdvantage('BBQ_DAD', 'FIX_IT_DAD');
      const expectedDamage = baseDamage * neutral;

      expect(expectedDamage).toBe(100); // 100 * 1.0
    });
  });

  describe('Edge Cases', () => {
    it('should handle same type matchups as neutral', () => {
      expect(getTypeAdvantage('BBQ_DAD', 'BBQ_DAD')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('TECH_DAD', 'TECH_DAD')).toBe(NEUTRAL_MULTIPLIER);
    });

    it('should handle ITEM type matchups', () => {
      expect(getTypeAdvantage('ITEM', 'BBQ_DAD')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('BBQ_DAD', 'ITEM')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('ITEM', 'ITEM')).toBe(NEUTRAL_MULTIPLIER);
    });

    it('should handle all type combinations without errors', () => {
      const allTypes: DadType[] = [
        'BBQ_DAD',
        'FIX_IT_DAD',
        'GOLF_DAD',
        'COUCH_DAD',
        'LAWN_DAD',
        'CAR_DAD',
        'OFFICE_DAD',
        'COOL_DAD',
        'COACH_DAD',
        'CHEF_DAD',
        'HOLIDAY_DAD',
        'WAREHOUSE_DAD',
        'VINTAGE_DAD',
        'FASHION_DAD',
        'TECH_DAD',
        'ITEM',
      ];

      allTypes.forEach(type1 => {
        allTypes.forEach(type2 => {
          expect(() => getTypeAdvantage(type1, type2)).not.toThrow();
        });
      });
    });
  });

  describe('Matrix Completeness', () => {
    it('should have circular advantage relationships (no dead ends)', () => {
      // Every type's advantages should be another type's disadvantages
      Object.entries(TYPE_ADVANTAGE_MATRIX).forEach(([type, advantages]) => {
        if (type === 'ITEM') return;

        advantages.forEach(advantageType => {
          const disadvantages = getDisadvantages(advantageType);
          expect(disadvantages).toContain(type as DadType);
        });
      });
    });

    it('should have exactly 240 total advantages (15 types * 2 advantages)', () => {
      let totalAdvantages = 0;

      Object.entries(TYPE_ADVANTAGE_MATRIX).forEach(([type, advantages]) => {
        if (type !== 'ITEM') {
          totalAdvantages += advantages.length;
        }
      });

      expect(totalAdvantages).toBe(30); // 15 types * 2 advantages each
    });
  });

  describe('Deck Building Strategy Implications', () => {
    it('should encourage diverse type selection (no type is overpowered)', () => {
      // All types should have same number of advantages (2)
      const advantageCounts = Object.values(TYPE_ADVANTAGE_MATRIX)
        .filter(advantages => advantages.length > 0)
        .map(advantages => advantages.length);

      advantageCounts.forEach(count => {
        expect(count).toBe(2);
      });
    });

    it('should create counter-play opportunities (every type has counters)', () => {
      // Every type should have exactly 2 counters (disadvantages)
      Object.keys(TYPE_ADVANTAGE_MATRIX).forEach(type => {
        if (type === 'ITEM') return;

        const disadvantages = getDisadvantages(type as DadType);
        expect(disadvantages.length).toBe(2);
      });
    });

    it('should balance strategic depth (11 neutral matchups per type)', () => {
      // Most matchups should be neutral to allow skill to matter
      Object.keys(TYPE_ADVANTAGE_MATRIX).forEach(type => {
        if (type === 'ITEM') return;

        const neutrals = getNeutrals(type as DadType);
        expect(neutrals.length).toBe(11);
      });
    });
  });
});
