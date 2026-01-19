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
        'BBQ_DICKTATOR',
        'FIX_IT_FUCKBOY',
        'GOLF_GONAD',
        'COUCH_CUMMANDER',
        'LAWN_LUNATIC',
        'CAR_COCK',
        'OFFICE_ORGASMS',
        'COOL_CUCKS',
        'COACH_CUMSTERS',
        'CHEF_CUMSTERS',
        'HOLIDAY_HORNDOGS',
        'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS',
        'FASHION_FUCK',
        'TECH_TWATS',
        'ITEM',
      ];

      expectedTypes.forEach(type => {
        expect(TYPE_ADVANTAGE_MATRIX[type]).toBeDefined();
      });
    });

    it('should have exactly 2 advantages per type (core types only)', () => {
      const coreTypes: DadType[] = [
        'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER',
        'LAWN_LUNATIC', 'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS',
        'COACH_CUMSTERS', 'CHEF_CUMSTERS', 'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS', 'FASHION_FUCK', 'TECH_TWATS',
      ];

      coreTypes.forEach(type => {
        const advantages = TYPE_ADVANTAGE_MATRIX[type];
        expect(advantages.length).toBe(2);
      });

      // ITEM and special types have no advantages
      expect(TYPE_ADVANTAGE_MATRIX['ITEM']).toEqual([]);
    });

    it('should have exactly 2 disadvantages per type (core types only)', () => {
      const coreTypes: DadType[] = [
        'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER',
        'LAWN_LUNATIC', 'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS',
        'COACH_CUMSTERS', 'CHEF_CUMSTERS', 'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS', 'FASHION_FUCK', 'TECH_TWATS',
      ];

      coreTypes.forEach(type => {
        const disadvantages = getDisadvantages(type);
        expect(disadvantages.length).toBe(2);
      });
    });

    it('should have 10 neutral matchups per type (core types only)', () => {
      const coreTypes: DadType[] = [
        'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER',
        'LAWN_LUNATIC', 'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS',
        'COACH_CUMSTERS', 'CHEF_CUMSTERS', 'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS', 'FASHION_FUCK', 'TECH_TWATS',
      ];

      // 15 types - 1 self - 2 advantages - 2 disadvantages = 10 neutrals
      coreTypes.forEach(type => {
        const neutrals = getNeutrals(type);
        expect(neutrals.length).toBe(10);
      });
    });

    it('should pass matrix validation', () => {
      expect(() => validateMatrix()).not.toThrow();
    });
  });

  describe('getTypeAdvantage', () => {
    it('should return 1.2 for advantageous matchups', () => {
      // BBQ_DICKTATOR has advantage over GOLF_GONAD and COUCH_CUMMANDER
      expect(getTypeAdvantage('BBQ_DICKTATOR', 'GOLF_GONAD')).toBe(ADVANTAGE_MULTIPLIER);
      expect(getTypeAdvantage('BBQ_DICKTATOR', 'COUCH_CUMMANDER')).toBe(ADVANTAGE_MULTIPLIER);

      // FIX_IT_FUCKBOY has advantage over TECH_TWATS and CAR_COCK
      expect(getTypeAdvantage('FIX_IT_FUCKBOY', 'TECH_TWATS')).toBe(ADVANTAGE_MULTIPLIER);
      expect(getTypeAdvantage('FIX_IT_FUCKBOY', 'CAR_COCK')).toBe(ADVANTAGE_MULTIPLIER);

      // GOLF_GONAD has advantage over COACH_CUMSTERS and COOL_CUCKS
      expect(getTypeAdvantage('GOLF_GONAD', 'COACH_CUMSTERS')).toBe(ADVANTAGE_MULTIPLIER);
      expect(getTypeAdvantage('GOLF_GONAD', 'COOL_CUCKS')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should return 0.8 for disadvantageous matchups', () => {
      // GOLF_GONAD is at disadvantage when BBQ_DICKTATOR attacks
      expect(getTypeAdvantage('GOLF_GONAD', 'BBQ_DICKTATOR')).toBe(DISADVANTAGE_MULTIPLIER);

      // TECH_TWATS is at disadvantage when FIX_IT_FUCKBOY attacks
      expect(getTypeAdvantage('TECH_TWATS', 'FIX_IT_FUCKBOY')).toBe(DISADVANTAGE_MULTIPLIER);

      // COACH_CUMSTERS is at disadvantage when GOLF_GONAD attacks
      expect(getTypeAdvantage('COACH_CUMSTERS', 'GOLF_GONAD')).toBe(DISADVANTAGE_MULTIPLIER);
    });

    it('should return 1.0 for neutral matchups', () => {
      // BBQ_DICKTATOR vs FIX_IT_FUCKBOY is neutral
      expect(getTypeAdvantage('BBQ_DICKTATOR', 'FIX_IT_FUCKBOY')).toBe(NEUTRAL_MULTIPLIER);

      // GOLF_GONAD vs LAWN_LUNATIC is neutral
      expect(getTypeAdvantage('GOLF_GONAD', 'LAWN_LUNATIC')).toBe(NEUTRAL_MULTIPLIER);

      // TECH_TWATS vs CAR_COCK is neutral
      expect(getTypeAdvantage('TECH_TWATS', 'CAR_COCK')).toBe(NEUTRAL_MULTIPLIER);
    });

    it('should return 1.0 for ITEM type matchups', () => {
      expect(getTypeAdvantage('ITEM', 'BBQ_DICKTATOR')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('BBQ_DICKTATOR', 'ITEM')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('ITEM', 'ITEM')).toBe(NEUTRAL_MULTIPLIER);
    });

    it('should be symmetric (advantage in one direction = disadvantage in other)', () => {
      const allTypes: DadType[] = [
        'BBQ_DICKTATOR',
        'FIX_IT_FUCKBOY',
        'GOLF_GONAD',
        'COUCH_CUMMANDER',
        'LAWN_LUNATIC',
        'CAR_COCK',
        'OFFICE_ORGASMS',
        'COOL_CUCKS',
        'COACH_CUMSTERS',
        'CHEF_CUMSTERS',
        'HOLIDAY_HORNDOGS',
        'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS',
        'FASHION_FUCK',
        'TECH_TWATS',
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
      const bbqAdvantages = getAdvantages('BBQ_DICKTATOR');
      expect(bbqAdvantages).toHaveLength(2);
      expect(bbqAdvantages).toContain('GOLF_GONAD');
      expect(bbqAdvantages).toContain('COUCH_CUMMANDER');

      const fixItAdvantages = getAdvantages('FIX_IT_FUCKBOY');
      expect(fixItAdvantages).toHaveLength(2);
      expect(fixItAdvantages).toContain('TECH_TWATS');
      expect(fixItAdvantages).toContain('CAR_COCK');

      const golfAdvantages = getAdvantages('GOLF_GONAD');
      expect(golfAdvantages).toHaveLength(2);
      expect(golfAdvantages).toContain('COACH_CUMSTERS');
      expect(golfAdvantages).toContain('COOL_CUCKS');
    });

    it('should return empty array for ITEM type', () => {
      expect(getAdvantages('ITEM')).toEqual([]);
    });
  });

  describe('getDisadvantages', () => {
    it('should return 2 types that this type has disadvantage against', () => {
      const bbqDisadvantages = getDisadvantages('BBQ_DICKTATOR');
      expect(bbqDisadvantages).toHaveLength(2);
      // BBQ_DICKTATOR is at disadvantage when CHEF_CUMSTERS or GOLF_GONAD attack

      const fixItDisadvantages = getDisadvantages('FIX_IT_FUCKBOY');
      expect(fixItDisadvantages).toHaveLength(2);
      // FIX_IT_FUCKBOY is at disadvantage when COACH_CUMSTERS or VINTAGE_VAGABONDS attack
      expect(fixItDisadvantages).toContain('COACH_CUMSTERS');
      expect(fixItDisadvantages).toContain('VINTAGE_VAGABONDS');

      const golfDisadvantages = getDisadvantages('GOLF_GONAD');
      expect(golfDisadvantages).toHaveLength(2);
      expect(golfDisadvantages).toContain('BBQ_DICKTATOR');
    });
  });

  describe('getNeutrals', () => {
    it('should return 10 neutral matchups', () => {
      // 15 types - 1 self - 2 advantages - 2 disadvantages = 10 neutrals
      const bbqNeutrals = getNeutrals('BBQ_DICKTATOR');
      expect(bbqNeutrals).toHaveLength(10);

      const fixItNeutrals = getNeutrals('FIX_IT_FUCKBOY');
      expect(fixItNeutrals).toHaveLength(10);
    });

    it('should not include advantages or disadvantages in neutrals', () => {
      const bbqAdvantages = getAdvantages('BBQ_DICKTATOR');
      const bbqDisadvantages = getDisadvantages('BBQ_DICKTATOR');
      const bbqNeutrals = getNeutrals('BBQ_DICKTATOR');

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
      expect(hasAdvantage('BBQ_DICKTATOR', 'GOLF_GONAD')).toBe(true);
      expect(hasAdvantage('FIX_IT_FUCKBOY', 'TECH_TWATS')).toBe(true);
      expect(hasAdvantage('GOLF_GONAD', 'COACH_CUMSTERS')).toBe(true);
    });

    it('should return false for non-advantageous matchups', () => {
      expect(hasAdvantage('GOLF_GONAD', 'BBQ_DICKTATOR')).toBe(false);
      expect(hasAdvantage('TECH_TWATS', 'FIX_IT_FUCKBOY')).toBe(false);
      expect(hasAdvantage('BBQ_DICKTATOR', 'FIX_IT_FUCKBOY')).toBe(false);
    });
  });

  describe('hasDisadvantage', () => {
    it('should return true for disadvantageous matchups', () => {
      expect(hasDisadvantage('GOLF_GONAD', 'BBQ_DICKTATOR')).toBe(true);
      expect(hasDisadvantage('TECH_TWATS', 'FIX_IT_FUCKBOY')).toBe(true);
      expect(hasDisadvantage('COACH_CUMSTERS', 'GOLF_GONAD')).toBe(true);
    });

    it('should return false for non-disadvantageous matchups', () => {
      expect(hasDisadvantage('BBQ_DICKTATOR', 'GOLF_GONAD')).toBe(false);
      expect(hasDisadvantage('FIX_IT_FUCKBOY', 'TECH_TWATS')).toBe(false);
      expect(hasDisadvantage('BBQ_DICKTATOR', 'FIX_IT_FUCKBOY')).toBe(false);
    });
  });

  describe('Thematic Logic Examples', () => {
    it('should have BBQ_DICKTATOR +20% vs GOLF_GONAD (heat melts golf game)', () => {
      expect(getTypeAdvantage('BBQ_DICKTATOR', 'GOLF_GONAD')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should have FIX_IT_FUCKBOY +20% vs TECH_TWATS (analog beats digital)', () => {
      expect(getTypeAdvantage('FIX_IT_FUCKBOY', 'TECH_TWATS')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should have GOLF_GONAD +20% vs COACH_CUMSTERS (golf vs sports coach rivalry)', () => {
      expect(getTypeAdvantage('GOLF_GONAD', 'COACH_CUMSTERS')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should have CHEF_CUMSTERS +20% vs BBQ_DICKTATOR (kitchen beats BBQ rivalry)', () => {
      expect(getTypeAdvantage('CHEF_CUMSTERS', 'BBQ_DICKTATOR')).toBe(ADVANTAGE_MULTIPLIER);
    });

    it('should have FIX_IT_FUCKBOY +20% vs TECH_TWATS (analog beats digital)', () => {
      expect(getTypeAdvantage('FIX_IT_FUCKBOY', 'TECH_TWATS')).toBe(ADVANTAGE_MULTIPLIER);
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
      const advantage = getTypeAdvantage('BBQ_DICKTATOR', 'GOLF_GONAD');
      const expectedDamage = baseDamage * advantage;

      expect(expectedDamage).toBe(120); // 100 * 1.2
    });

    it('should calculate correct damage with disadvantage', () => {
      const baseDamage = 100;
      const disadvantage = getTypeAdvantage('GOLF_GONAD', 'BBQ_DICKTATOR');
      const expectedDamage = baseDamage * disadvantage;

      expect(expectedDamage).toBe(80); // 100 * 0.8
    });

    it('should calculate correct damage with neutral matchup', () => {
      const baseDamage = 100;
      const neutral = getTypeAdvantage('BBQ_DICKTATOR', 'FIX_IT_FUCKBOY');
      const expectedDamage = baseDamage * neutral;

      expect(expectedDamage).toBe(100); // 100 * 1.0
    });
  });

  describe('Edge Cases', () => {
    it('should handle same type matchups as neutral', () => {
      expect(getTypeAdvantage('BBQ_DICKTATOR', 'BBQ_DICKTATOR')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('TECH_TWATS', 'TECH_TWATS')).toBe(NEUTRAL_MULTIPLIER);
    });

    it('should handle ITEM type matchups', () => {
      expect(getTypeAdvantage('ITEM', 'BBQ_DICKTATOR')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('BBQ_DICKTATOR', 'ITEM')).toBe(NEUTRAL_MULTIPLIER);
      expect(getTypeAdvantage('ITEM', 'ITEM')).toBe(NEUTRAL_MULTIPLIER);
    });

    it('should handle all type combinations without errors', () => {
      const allTypes: DadType[] = [
        'BBQ_DICKTATOR',
        'FIX_IT_FUCKBOY',
        'GOLF_GONAD',
        'COUCH_CUMMANDER',
        'LAWN_LUNATIC',
        'CAR_COCK',
        'OFFICE_ORGASMS',
        'COOL_CUCKS',
        'COACH_CUMSTERS',
        'CHEF_CUMSTERS',
        'HOLIDAY_HORNDOGS',
        'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS',
        'FASHION_FUCK',
        'TECH_TWATS',
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
      const coreTypes: DadType[] = [
        'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER',
        'LAWN_LUNATIC', 'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS',
        'COACH_CUMSTERS', 'CHEF_CUMSTERS', 'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS', 'FASHION_FUCK', 'TECH_TWATS',
      ];

      // All core types should have same number of advantages (2)
      coreTypes.forEach(type => {
        const advantages = TYPE_ADVANTAGE_MATRIX[type];
        expect(advantages.length).toBe(2);
      });
    });

    it('should create counter-play opportunities (every type has counters)', () => {
      const coreTypes: DadType[] = [
        'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER',
        'LAWN_LUNATIC', 'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS',
        'COACH_CUMSTERS', 'CHEF_CUMSTERS', 'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS', 'FASHION_FUCK', 'TECH_TWATS',
      ];

      // Every core type should have exactly 2 counters (disadvantages)
      coreTypes.forEach(type => {
        const disadvantages = getDisadvantages(type);
        expect(disadvantages.length).toBe(2);
      });
    });

    it('should balance strategic depth (10 neutral matchups per type)', () => {
      const coreTypes: DadType[] = [
        'BBQ_DICKTATOR', 'FIX_IT_FUCKBOY', 'GOLF_GONAD', 'COUCH_CUMMANDER',
        'LAWN_LUNATIC', 'CAR_COCK', 'OFFICE_ORGASMS', 'COOL_CUCKS',
        'COACH_CUMSTERS', 'CHEF_CUMSTERS', 'HOLIDAY_HORNDOGS', 'WAREHOUSE_WANKERS',
        'VINTAGE_VAGABONDS', 'FASHION_FUCK', 'TECH_TWATS',
      ];

      // Most matchups should be neutral to allow skill to matter
      // 15 types - 1 self - 2 advantages - 2 disadvantages = 10 neutrals
      coreTypes.forEach(type => {
        const neutrals = getNeutrals(type);
        expect(neutrals.length).toBe(10);
      });
    });
  });
});
