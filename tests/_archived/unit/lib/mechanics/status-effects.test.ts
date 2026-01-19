/**
 * Unit tests for status effects system (PACK-011)
 *
 * Tests the new status effect mechanics:
 * - GRILLED: defense -20% (BBQ_DICKTATOR)
 * - LECTURED: attack -20% (COUCH_CUMMANDER)
 * - DRUNK: accuracy -30% (HOLIDAY_HORNDOGS)
 * - WIRED: speed +30% (TECH_TWATS)
 * - Status duration: 2 turns
 * - Max stacking: 2 stacks
 */

import { describe, it, expect } from 'vitest';
import type { Card, CardStats } from '@/types';
import type { StatusEffect } from '@/lib/mechanics/combat';
import {
  calculateStatusEffectModifier,
  applyStatusEffectsToCard,
  tickStatusEffects,
  addStatusEffect,
  executeAbility,
} from '@/lib/mechanics/combat';

/**
 * Helper: Create a test card with specific stats
 */
function createTestCard(
  id: string,
  name: string,
  type: string,
  stats: CardStats
): Card {
  return {
    id,
    name,
    subtitle: `${name} Subtitle`,
    type: type as any,
    rarity: 'rare',
    artwork: `/images/cards/${id}.png`,
    stats,
    flavorText: `${name} flavor text`,
    abilities: [
      {
        name: 'Test Ability',
        description: 'Test ability description',
      },
    ],
    series: 1,
    cardNumber: 1,
    totalInSeries: 50,
    artist: 'Test Artist',
    holoVariant: 'none',
  };
}

describe('PACK-011: Battle System - Status Effects', () => {
  describe('calculateStatusEffectModifier()', () => {
    it('should reduce stats by 20% for grilled status', () => {
      const effect: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };
      const baseStat = 80;

      const modified = calculateStatusEffectModifier(effect, baseStat);

      expect(modified).toBe(64); // 80 - 20% = 64
    });

    it('should reduce stats by 20% for lectured status', () => {
      const effect: StatusEffect = { type: 'lectured', duration: 2, stacks: 1 };
      const baseStat = 70;

      const modified = calculateStatusEffectModifier(effect, baseStat);

      expect(modified).toBe(56); // 70 - 20% = 56
    });

    it('should not modify stats for drunk status (applies to hit chance)', () => {
      const effect: StatusEffect = { type: 'drunk', duration: 2, stacks: 1 };
      const baseStat = 60;

      const modified = calculateStatusEffectModifier(effect, baseStat);

      expect(modified).toBe(60); // Stat unchanged (applies to accuracy, not raw stat)
    });

    it('should increase stats by 30% for wired status', () => {
      const effect: StatusEffect = { type: 'wired', duration: 2, stacks: 1 };
      const baseStat = 50;

      const modified = calculateStatusEffectModifier(effect, baseStat);

      expect(modified).toBe(65); // 50 + 30% = 65
    });

    it('should apply stacking correctly (2nd stack is 50% as potent)', () => {
      const effect1: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };
      const effect2: StatusEffect = { type: 'grilled', duration: 2, stacks: 2 };
      const baseStat = 100;

      const modified1 = calculateStatusEffectModifier(effect1, baseStat);
      const modified2 = calculateStatusEffectModifier(effect2, baseStat);

      // 1 stack: 100 - 20% = 80
      expect(modified1).toBe(80);
      // 2 stacks: 100 - (20% + 10%) = 70 (second stack is 50% as potent)
      expect(modified2).toBe(70);
    });
  });

  describe('applyStatusEffectsToCard()', () => {
    it('should apply single grilled effect to all stats', () => {
      const card = createTestCard('card-001', 'Test Dad', 'BBQ_DICKTATOR', {
        dadJoke: 80,
        grillSkill: 90,
        fixIt: 85,
        napPower: 70,
        remoteControl: 60,
        thermostat: 65,
        sockSandal: 55,
        beerSnob: 75,
      });

      const effects: StatusEffect[] = [
        { type: 'grilled', duration: 2, stacks: 1 },
      ];

      const modifiedStats = applyStatusEffectsToCard(card, effects);

      // All stats reduced by 20% (grilled affects defense)
      expect(modifiedStats.grillSkill).toBe(72); // 90 - 20%
      expect(modifiedStats.fixIt).toBe(68); // 85 - 20%
      expect(modifiedStats.dadJoke).toBe(64); // 80 - 20%
    });

    it('should apply single lectured effect to all stats', () => {
      const card = createTestCard('card-002', 'Lectured Dad', 'COUCH_CUMMANDER', {
        dadJoke: 80,
        grillSkill: 70,
        fixIt: 75,
        napPower: 60,
        remoteControl: 65,
        thermostat: 70,
        sockSandal: 55,
        beerSnob: 60,
      });

      const effects: StatusEffect[] = [
        { type: 'lectured', duration: 2, stacks: 1 },
      ];

      const modifiedStats = applyStatusEffectsToCard(card, effects);

      // All stats reduced by 20% (lectured affects attack)
      expect(modifiedStats.dadJoke).toBe(64); // 80 - 20%
      expect(modifiedStats.grillSkill).toBe(56); // 70 - 20%
      expect(modifiedStats.fixIt).toBe(60); // 75 - 20%
    });

    it('should apply wired effect to increase all stats', () => {
      const card = createTestCard('card-003', 'Tech Dad', 'TECH_TWATS', {
        dadJoke: 50,
        grillSkill: 55,
        fixIt: 60,
        napPower: 40,
        remoteControl: 65,
        thermostat: 50,
        sockSandal: 45,
        beerSnob: 55,
      });

      const effects: StatusEffect[] = [
        { type: 'wired', duration: 2, stacks: 1 },
      ];

      const modifiedStats = applyStatusEffectsToCard(card, effects);

      // All stats increased by 30%
      expect(modifiedStats.dadJoke).toBe(65); // 50 + 30%
      expect(modifiedStats.grillSkill).toBe(71.5); // 55 + 30%
      expect(modifiedStats.fixIt).toBe(78); // 60 + 30%
    });

    it('should handle multiple status effects', () => {
      const card = createTestCard('card-004', 'Multi Status Dad', 'BBQ_DICKTATOR', {
        dadJoke: 100,
        grillSkill: 100,
        fixIt: 100,
        napPower: 100,
        remoteControl: 100,
        thermostat: 100,
        sockSandal: 100,
        beerSnob: 100,
      });

      const effects: StatusEffect[] = [
        { type: 'grilled', duration: 2, stacks: 1 },
        { type: 'lectured', duration: 2, stacks: 1 },
      ];

      const modifiedStats = applyStatusEffectsToCard(card, effects);

      // Both grilled (-20%) and lectured (-20%) should apply
      // Note: These stack multiplicatively, so 100 * 0.8 * 0.8 = 64
      expect(modifiedStats.grillSkill).toBeCloseTo(64, 0);
      expect(modifiedStats.dadJoke).toBeCloseTo(64, 0);
    });

    it('should clamp stats to 0-100 range', () => {
      const card = createTestCard('card-005', 'Edge Case Dad', 'BBQ_DICKTATOR', {
        dadJoke: 5,
        grillSkill: 3,
        fixIt: 2,
        napPower: 1,
        remoteControl: 8,
        thermostat: 4,
        sockSandal: 6,
        beerSnob: 7,
      });

      const effects: StatusEffect[] = [
        { type: 'grilled', duration: 2, stacks: 2 },
      ];

      const modifiedStats = applyStatusEffectsToCard(card, effects);

      // All stats should be clamped to 0 minimum
      for (const stat of Object.values(modifiedStats)) {
        expect(stat).toBeGreaterThanOrEqual(0);
        expect(stat).toBeLessThanOrEqual(100);
      }
    });

    it('should handle empty status effects array', () => {
      const card = createTestCard('card-006', 'Normal Dad', 'BBQ_DICKTATOR', {
        dadJoke: 70,
        grillSkill: 80,
        fixIt: 75,
        napPower: 60,
        remoteControl: 65,
        thermostat: 70,
        sockSandal: 55,
        beerSnob: 60,
      });

      const modifiedStats = applyStatusEffectsToCard(card, []);

      // Stats should remain unchanged
      expect(modifiedStats).toEqual(card.stats);
    });
  });

  describe('tickStatusEffects()', () => {
    it('should reduce duration of all effects by 1', () => {
      const effects: StatusEffect[] = [
        { type: 'grilled', duration: 2, stacks: 1 },
        { type: 'lectured', duration: 2, stacks: 1 },
      ];

      const ticked = tickStatusEffects(effects);

      expect(ticked).toHaveLength(2);
      expect(ticked[0].duration).toBe(1); // 2 -> 1
      expect(ticked[1].duration).toBe(1); // 2 -> 1
    });

    it('should remove expired effects (duration 0)', () => {
      const effects: StatusEffect[] = [
        { type: 'grilled', duration: 1, stacks: 1 },
        { type: 'lectured', duration: 1, stacks: 1 },
      ];

      const ticked = tickStatusEffects(effects);

      // Both effects should be removed (duration 1 -> 0, then filtered out)
      expect(ticked).toHaveLength(0);
    });

    it('should handle empty effects array', () => {
      const ticked = tickStatusEffects([]);

      expect(ticked).toHaveLength(0);
    });

    it('should preserve stacks when ticking', () => {
      const effects: StatusEffect[] = [
        { type: 'grilled', duration: 3, stacks: 2 },
      ];

      const ticked = tickStatusEffects(effects);

      expect(ticked).toHaveLength(1);
      expect(ticked[0].duration).toBe(2);
      expect(ticked[0].stacks).toBe(2); // Stacks unchanged
    });
  });

  describe('addStatusEffect()', () => {
    it('should add new effect when not present', () => {
      const currentEffects: StatusEffect[] = [];

      const newEffect: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };
      const updated = addStatusEffect(currentEffects, newEffect);

      expect(updated).toHaveLength(1);
      expect(updated[0]).toEqual(newEffect);
    });

    it('should stack effect when already present (max 2)', () => {
      const currentEffects: StatusEffect[] = [
        { type: 'grilled', duration: 2, stacks: 1 },
      ];

      const newEffect: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };
      const updated = addStatusEffect(currentEffects, newEffect);

      expect(updated).toHaveLength(1); // Still only 1 effect entry
      expect(updated[0].stacks).toBe(2); // But stacks increased
    });

    it('should not stack beyond 2', () => {
      const currentEffects: StatusEffect[] = [
        { type: 'grilled', duration: 2, stacks: 2 },
      ];

      const newEffect: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };
      const updated = addStatusEffect(currentEffects, newEffect);

      expect(updated).toHaveLength(1);
      expect(updated[0].stacks).toBe(2); // Max 2 stacks
    });

    it('should refresh duration when stacking', () => {
      const currentEffects: StatusEffect[] = [
        { type: 'grilled', duration: 1, stacks: 1 },
      ];

      const newEffect: StatusEffect = { type: 'grilled', duration: 3, stacks: 1 };
      const updated = addStatusEffect(currentEffects, newEffect);

      expect(updated[0].duration).toBe(3); // Duration refreshed to new value
      expect(updated[0].stacks).toBe(2); // Stacks increased
    });

    it('should handle multiple different effects', () => {
      const currentEffects: StatusEffect[] = [
        { type: 'grilled', duration: 2, stacks: 1 },
      ];

      const newEffect: StatusEffect = { type: 'lectured', duration: 2, stacks: 1 };
      const updated = addStatusEffect(currentEffects, newEffect);

      expect(updated).toHaveLength(2);
      expect(updated[0].type).toBe('grilled');
      expect(updated[1].type).toBe('lectured');
    });
  });

  describe('executeAbility() - Status Effect Application', () => {
    it('should apply grilled status for BBQ_DICKTATOR cards', () => {
      const card = createTestCard('bbq-001', 'BBQ Dad', 'BBQ_DICKTATOR', {
        dadJoke: 70,
        grillSkill: 90,
        fixIt: 80,
        napPower: 60,
        remoteControl: 65,
        thermostat: 70,
        sockSandal: 55,
        beerSnob: 75,
      });

      const target = createTestCard('target-001', 'Target Dad', 'COUCH_CUMMANDER', {
        dadJoke: 50,
        grillSkill: 50,
        fixIt: 50,
        napPower: 50,
        remoteControl: 50,
        thermostat: 50,
        sockSandal: 50,
        beerSnob: 50,
      });

      // Run multiple times to get status effect (30% chance)
      let foundGrilled = false;
      for (let i = 0; i < 50; i++) {
        const result = executeAbility(card, target);
        if (result.statusEffects.some(e => e.type === 'grilled')) {
          foundGrilled = true;
          expect(result.statusEffects.find(e => e.type === 'grilled')?.duration).toBe(2);
          expect(result.statusEffects.find(e => e.type === 'grilled')?.stacks).toBe(1);
          break;
        }
      }

      expect(foundGrilled).toBe(true);
    });

    it('should apply lectured status for COUCH_CUMMANDER cards', () => {
      const card = createTestCard('couch-001', 'Couch Dad', 'COUCH_CUMMANDER', {
        dadJoke: 70,
        grillSkill: 60,
        fixIt: 65,
        napPower: 80,
        remoteControl: 75,
        thermostat: 60,
        sockSandal: 50,
        beerSnob: 55,
      });

      const target = createTestCard('target-002', 'Target Dad', 'BBQ_DICKTATOR', {
        dadJoke: 50,
        grillSkill: 50,
        fixIt: 50,
        napPower: 50,
        remoteControl: 50,
        thermostat: 50,
        sockSandal: 50,
        beerSnob: 50,
      });

      // Run multiple times to get status effect (30% chance)
      let foundLectured = false;
      for (let i = 0; i < 50; i++) {
        const result = executeAbility(card, target);
        if (result.statusEffects.some(e => e.type === 'lectured')) {
          foundLectured = true;
          expect(result.statusEffects.find(e => e.type === 'lectured')?.duration).toBe(2);
          expect(result.statusEffects.find(e => e.type === 'lectured')?.stacks).toBe(1);
          break;
        }
      }

      expect(foundLectured).toBe(true);
    });

    it('should apply drunk status for HOLIDAY_HORNDOGS cards', () => {
      const card = createTestCard('holiday-001', 'Holiday Dad', 'HOLIDAY_HORNDOGS', {
        dadJoke: 60,
        grillSkill: 55,
        fixIt: 50,
        napPower: 70,
        remoteControl: 65,
        thermostat: 60,
        sockSandal: 50,
        beerSnob: 75,
      });

      const target = createTestCard('target-003', 'Target Dad', 'COUCH_CUMMANDER', {
        dadJoke: 50,
        grillSkill: 50,
        fixIt: 50,
        napPower: 50,
        remoteControl: 50,
        thermostat: 50,
        sockSandal: 50,
        beerSnob: 50,
      });

      // Run multiple times to get status effect (30% chance)
      let foundDrunk = false;
      for (let i = 0; i < 50; i++) {
        const result = executeAbility(card, target);
        if (result.statusEffects.some(e => e.type === 'drunk')) {
          foundDrunk = true;
          expect(result.statusEffects.find(e => e.type === 'drunk')?.duration).toBe(2);
          expect(result.statusEffects.find(e => e.type === 'drunk')?.stacks).toBe(1);
          break;
        }
      }

      expect(foundDrunk).toBe(true);
    });

    it('should apply wired status for TECH_TWATS cards', () => {
      const card = createTestCard('tech-001', 'Tech Dad', 'TECH_TWATS', {
        dadJoke: 65,
        grillSkill: 60,
        fixIt: 70,
        napPower: 55,
        remoteControl: 75,
        thermostat: 65,
        sockSandal: 60,
        beerSnob: 65,
      });

      const target = createTestCard('target-004', 'Target Dad', 'COUCH_CUMMANDER', {
        dadJoke: 50,
        grillSkill: 50,
        fixIt: 50,
        napPower: 50,
        remoteControl: 50,
        thermostat: 50,
        sockSandal: 50,
        beerSnob: 50,
      });

      // Run multiple times to get status effect (30% chance)
      let foundWired = false;
      for (let i = 0; i < 50; i++) {
        const result = executeAbility(card, target);
        if (result.statusEffects.some(e => e.type === 'wired')) {
          foundWired = true;
          expect(result.statusEffects.find(e => e.type === 'wired')?.duration).toBe(2);
          expect(result.statusEffects.find(e => e.type === 'wired')?.stacks).toBe(1);
          break;
        }
      }

      expect(foundWired).toBe(true);
    });

    it('should not apply status for non-status-applying cards', () => {
      const card = createTestCard('golf-001', 'Golf Dad', 'GOLF_GONAD', {
        dadJoke: 70,
        grillSkill: 60,
        fixIt: 65,
        napPower: 55,
        remoteControl: 60,
        thermostat: 65,
        sockSandal: 50,
        beerSnob: 55,
      });

      const target = createTestCard('target-005', 'Target Dad', 'COUCH_CUMMANDER', {
        dadJoke: 50,
        grillSkill: 50,
        fixIt: 50,
        napPower: 50,
        remoteControl: 50,
        thermostat: 50,
        sockSandal: 50,
        beerSnob: 50,
      });

      const result = executeAbility(card, target);

      // GOLF_GONAD doesn't apply status effects
      expect(result.statusEffects).toHaveLength(0);
    });
  });

  describe('Status Effect Duration', () => {
    it('should have 2 turn duration for all new status effects', () => {
      const cardTypes = ['BBQ_DICKTATOR', 'COUCH_CUMMANDER', 'HOLIDAY_HORNDOGS', 'TECH_TWATS'] as const;

      for (const cardType of cardTypes) {
        const card = createTestCard(`${cardType.toLowerCase()}-001`, `${cardType} Dad`, cardType, {
          dadJoke: 70,
          grillSkill: 70,
          fixIt: 70,
          napPower: 70,
          remoteControl: 70,
          thermostat: 70,
          sockSandal: 70,
          beerSnob: 70,
        });

        const target = createTestCard('target-001', 'Target Dad', 'COUCH_CUMMANDER', {
          dadJoke: 50,
          grillSkill: 50,
          fixIt: 50,
          napPower: 50,
          remoteControl: 50,
          thermostat: 50,
          sockSandal: 50,
          beerSnob: 50,
        });

        // Try until status effect triggers (30% chance)
        let foundStatus = false;
        for (let i = 0; i < 100; i++) {
          const result = executeAbility(card, target);
          if (result.statusEffects.length > 0) {
            const effect = result.statusEffects[0];
            expect(effect.duration).toBe(2);
            expect(effect.stacks).toBe(1);
            foundStatus = true;
            break;
          }
        }

        expect(foundStatus).toBe(true);
      }
    });
  });

  describe('Stacking Behavior', () => {
    it('should allow stacking up to 2 for same effect type', () => {
      const effects: StatusEffect[] = [];

      const effect1: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };
      const effect2: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };

      const after1 = addStatusEffect(effects, effect1);
      const after2 = addStatusEffect(after1, effect2);

      expect(after2).toHaveLength(1);
      expect(after2[0].stacks).toBe(2);
    });

    it('should not allow stacking beyond 2', () => {
      const effects: StatusEffect[] = [
        { type: 'grilled', duration: 2, stacks: 2 },
      ];

      const newEffect: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };
      const after = addStatusEffect(effects, newEffect);

      expect(after).toHaveLength(1);
      expect(after[0].stacks).toBe(2); // Still max 2
    });

    it('should apply stacking modifier correctly', () => {
      const effect1: StatusEffect = { type: 'grilled', duration: 2, stacks: 1 };
      const effect2: StatusEffect = { type: 'grilled', duration: 2, stacks: 2 };

      const baseStat = 100;

      const modified1 = calculateStatusEffectModifier(effect1, baseStat);
      const modified2 = calculateStatusEffectModifier(effect2, baseStat);

      // 1 stack: 20% reduction
      expect(modified1).toBe(80);

      // 2 stacks: 30% reduction (20% + 10%)
      expect(modified2).toBe(70);
    });
  });
});
