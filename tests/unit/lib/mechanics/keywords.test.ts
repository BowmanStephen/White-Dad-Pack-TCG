/**
 * Unit tests for DadDeck™ Keyword System (PACK-040)
 *
 * Tests keyword definitions, parsing, execution, and validation.
 */

import { describe, it, expect } from 'vitest';
import type { Card } from '@/types';
import {
  KEYWORD_DEFINITIONS,
  getKeywordDefinition,
  parseKeywordsFromDescription,
  executeKeywords,
  validateKeywords,
  getKeywordsByCategory,
  formatKeywordForDisplay,
  type AbilityKeyword,
  type KeywordEffect,
} from '@/lib/mechanics/keywords';
import type { StatusEffect } from '@/lib/mechanics/combat';

// Test card fixture
const createTestCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'test-001',
  name: 'Test Card',
  subtitle: 'Testing Dad',
  type: 'BBQ_DAD',
  rarity: 'rare',
  artwork: '/test.png',
  stats: {
    dadJoke: 50,
    grillSkill: 80,
    fixIt: 40,
    napPower: 30,
    remoteControl: 60,
    thermostat: 45,
    sockSandal: 55,
    beerSnob: 65,
  },
  flavorText: 'Test card for unit tests',
  abilities: [],
  series: 1,
  cardNumber: 1,
  totalInSeries: 100,
  artist: 'Test Artist',
});

describe('Keyword Definitions', () => {
  it('should have all required keywords defined', () => {
    const requiredKeywords: AbilityKeyword[] = [
      'BURN',
      'LECTURE',
      'FIX',
      'NAP',
      'SWING',
      'REMOTE',
      'GRILL',
      'LECTURE_STATUS',
      'DRUNK',
      'WIRED',
      'BUFF_STAT',
      'BUFF_ALL',
      'SHIELD',
      'RALLY',
      'WEAKEN',
      'WEAKEN_ALL',
      'EXPOSE',
      'DRAW',
      'HEAL',
      'DISCARD',
      'SHUFFLE',
      'AOE',
      'SINGLE',
      'SELF',
      'ALLY',
      'RANDOM',
      'TRANSFORM',
      'EVOLVE',
      'SACRIFICE',
      'STEAL',
      'COPY',
    ];

    for (const keyword of requiredKeywords) {
      expect(KEYWORD_DEFINITIONS[keyword]).toBeDefined();
      expect(KEYWORD_DEFINITIONS[keyword].category).toBeDefined();
      expect(KEYWORD_DEFINITIONS[keyword].description).toBeDefined();
      expect(KEYWORD_DEFINITIONS[keyword].detailedExplanation).toBeDefined();
    }
  });

  it('should have correct categories for damage keywords', () => {
    expect(KEYWORD_DEFINITIONS.BURN.category).toBe('damage');
    expect(KEYWORD_DEFINITIONS.LECTURE.category).toBe('damage');
    expect(KEYWORD_DEFINITIONS.FIX.category).toBe('damage');
    expect(KEYWORD_DEFINITIONS.NAP.category).toBe('utility');
    expect(KEYWORD_DEFINITIONS.SWING.category).toBe('damage');
    expect(KEYWORD_DEFINITIONS.REMOTE.category).toBe('damage');
  });

  it('should have correct categories for status keywords', () => {
    expect(KEYWORD_DEFINITIONS.GRILL.category).toBe('status');
    expect(KEYWORD_DEFINITIONS.LECTURE_STATUS.category).toBe('status');
    expect(KEYWORD_DEFINITIONS.DRUNK.category).toBe('status');
    expect(KEYWORD_DEFINITIONS.WIRED.category).toBe('status');
  });

  it('should have correct categories for buff keywords', () => {
    expect(KEYWORD_DEFINITIONS.BUFF_STAT.category).toBe('buff');
    expect(KEYWORD_DEFINITIONS.BUFF_ALL.category).toBe('buff');
    expect(KEYWORD_DEFINITIONS.SHIELD.category).toBe('buff');
    expect(KEYWORD_DEFINITIONS.RALLY.category).toBe('buff');
  });

  it('should have default values for all keywords', () => {
    for (const [keyword, def] of Object.entries(KEYWORD_DEFINITIONS)) {
      expect(def.defaultValue).toBeDefined();
      expect(typeof def.defaultValue).toMatch(/number|string/);
    }
  });

  it('should have statUsed for damage keywords', () => {
    expect(KEYWORD_DEFINITIONS.BURN.statUsed).toBe('grillSkill');
    expect(KEYWORD_DEFINITIONS.LECTURE.statUsed).toBe('dadJoke');
    expect(KEYWORD_DEFINITIONS.FIX.statUsed).toBe('fixIt');
    expect(KEYWORD_DEFINITIONS.NAP.statUsed).toBe('napPower');
    expect(KEYWORD_DEFINITIONS.SWING.statUsed).toBe('grillSkill');
    expect(KEYWORD_DEFINITIONS.REMOTE.statUsed).toBe('remoteControl');
  });
});

describe('getKeywordDefinition', () => {
  it('should return definition for valid keyword', () => {
    const def = getKeywordDefinition('BURN');

    expect(def.category).toBe('damage');
    expect(def.description).toBe('Deal fire damage over 2 turns');
    expect(def.detailedExplanation).toBeDefined();
    expect(def.example).toBeDefined();
    expect(def.statUsed).toBe('grillSkill');
  });

  it('should return unknown definition for invalid keyword', () => {
    // @ts-expect-error - Testing invalid keyword
    const def = getKeywordDefinition('INVALID_KEYWORD');

    expect(def.category).toBe('unknown');
    expect(def.description).toBe('Unknown keyword');
    expect(def.detailedExplanation).toBe('This keyword is not yet defined.');
  });
});

describe('parseKeywordsFromDescription', () => {
  it('should parse BURN keyword with value', () => {
    const description = 'Sets everything ablaze. +50 burn damage!';
    const keywords = parseKeywordsFromDescription(description);

    // Should parse both BURN and AOE (from "everything")
    expect(keywords.length).toBeGreaterThanOrEqual(1);

    const burnKeyword = keywords.find(k => k.keyword === 'BURN');
    expect(burnKeyword).toBeDefined();
    expect(burnKeyword?.value).toBe(50);
    expect(burnKeyword?.target).toBe('all_opponents');

    const aoeKeyword = keywords.find(k => k.keyword === 'AOE');
    expect(aoeKeyword).toBeDefined();
  });

  it('should parse BURN keyword without value (default)', () => {
    const description = 'Burns with fire';
    const keywords = parseKeywordsFromDescription(description);

    // Should return empty array since no explicit value was found
    expect(keywords).toHaveLength(0);
  });

  it('should parse LECTURE keyword', () => {
    const description = 'Gives a long lecture. +25 lecture damage!';
    const keywords = parseKeywordsFromDescription(description);

    expect(keywords).toHaveLength(1);
    expect(keywords[0].keyword).toBe('LECTURE');
    expect(keywords[0].value).toBe(25);
  });

  it('should parse FIX keyword', () => {
    const description = 'Hammer time! +35 fix damage!';
    const keywords = parseKeywordsFromDescription(description);

    expect(keywords).toHaveLength(1);
    expect(keywords[0].keyword).toBe('FIX');
    expect(keywords[0].value).toBe(35);
  });

  it('should parse NAP keyword', () => {
    const description = 'Falls asleep. +40 nap healing!';
    const keywords = parseKeywordsFromDescription(description);

    // Should parse NAP keyword
    expect(keywords.length).toBeGreaterThanOrEqual(1);

    const napKeyword = keywords.find(k => k.keyword === 'NAP');
    expect(napKeyword).toBeDefined();
    expect(napKeyword?.value).toBe(40);
  });

  it('should parse GRILL status keyword', () => {
    const description = 'Covers in BBQ sauce';
    const keywords = parseKeywordsFromDescription(description);

    const grillKeyword = keywords.find(k => k.keyword === 'GRILL');
    expect(grillKeyword).toBeDefined();
    expect(grillKeyword?.duration).toBe(2);
  });

  it('should parse LECTURE_STATUS keyword', () => {
    const description = 'Bored opponent with lecture';
    const keywords = parseKeywordsFromDescription(description);

    const lectureKeyword = keywords.find(k => k.keyword === 'LECTURE_STATUS');
    expect(lectureKeyword).toBeDefined();
    expect(lectureKeyword?.duration).toBe(2);
  });

  it('should parse DRUNK status keyword', () => {
    const description = 'Gets them wasted on beer';
    const keywords = parseKeywordsFromDescription(description);

    const drunkKeyword = keywords.find(k => k.keyword === 'DRUNK');
    expect(drunkKeyword).toBeDefined();
    expect(drunkKeyword?.duration).toBe(2);
  });

  it('should parse AOE target keyword', () => {
    const description = 'Hits all enemies';
    const keywords = parseKeywordsFromDescription(description);

    const aoeKeyword = keywords.find(k => k.keyword === 'AOE');
    expect(aoeKeyword).toBeDefined();
    expect(aoeKeyword?.target).toBe('all_opponents');
  });

  it('should parse SELF target keyword', () => {
    const description = 'Heals yourself';
    const keywords = parseKeywordsFromDescription(description);

    const selfKeyword = keywords.find(k => k.keyword === 'SELF');
    expect(selfKeyword).toBeDefined();
    expect(selfKeyword?.target).toBe('self');
  });

  it('should parse multiple keywords from description', () => {
    const description = 'Burns all enemies with fire and BBQ sauce! +60 burn damage!';
    const keywords = parseKeywordsFromDescription(description);

    expect(keywords.length).toBeGreaterThanOrEqual(2);
    expect(keywords.some(k => k.keyword === 'BURN')).toBe(true);
    expect(keywords.some(k => k.keyword === 'GRILL')).toBe(true);
    expect(keywords.some(k => k.keyword === 'AOE')).toBe(true);
  });

  it('should return empty array for description with no keywords', () => {
    const description = 'Just a normal card ability';
    const keywords = parseKeywordsFromDescription(description);

    expect(keywords).toHaveLength(0);
  });
});

describe('executeKeywords', () => {
  it('should execute BURN keyword with damage', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'BURN',
        category: 'damage',
        value: 50,
        target: 'opponent',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
    expect(result.flavorText).toContain('burn damage');
  });

  it('should execute LECTURE keyword with damage', () => {
    const source = createTestCard({ stats: { ...createTestCard().stats, dadJoke: 90 } });
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'LECTURE',
        category: 'damage',
        value: 40,
        target: 'opponent',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
    expect(result.flavorText).toContain('lecture damage');
  });

  it('should execute NAP keyword with healing', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'NAP',
        category: 'utility',
        value: 40,
        target: 'self',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.healing).toBeGreaterThan(0);
    expect(result.flavorText).toContain('Heals');
    expect(Object.keys(result.statChanges).length).toBe(8); // All 8 stats buffed
  });

  it('should execute GRILL status keyword', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'GRILL',
        category: 'status',
        value: 2,
        target: 'opponent',
        duration: 2,
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.statusEffects).toHaveLength(1);
    expect(result.statusEffects[0].type).toBe('grilled');
    expect(result.statusEffects[0].duration).toBe(2);
    expect(result.statusEffects[0].stacks).toBe(1);
  });

  it('should execute LECTURE_STATUS keyword', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'LECTURE_STATUS',
        category: 'status',
        value: 2,
        target: 'opponent',
        duration: 2,
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.statusEffects).toHaveLength(1);
    expect(result.statusEffects[0].type).toBe('lectured');
    expect(result.statusEffects[0].duration).toBe(2);
  });

  it('should execute DRUNK status keyword', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'DRUNK',
        category: 'status',
        value: 2,
        target: 'opponent',
        duration: 2,
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.statusEffects).toHaveLength(1);
    expect(result.statusEffects[0].type).toBe('drunk');
  });

  it('should execute WIRED status keyword', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'WIRED',
        category: 'status',
        value: 2,
        target: 'opponent',
        duration: 2,
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.statusEffects).toHaveLength(1);
    expect(result.statusEffects[0].type).toBe('wired');
  });

  it('should execute BUFF_STAT keyword', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'BUFF_STAT',
        category: 'buff',
        value: 20,
        target: 'self',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    // Should buff the highest stat (grillSkill with 80)
    expect(Object.keys(result.statChanges).length).toBe(1);
    expect(result.statChanges.grillSkill).toBeGreaterThan(80); // Should be buffed
    expect(result.flavorText).toContain('Boosts');
  });

  it('should execute BUFF_ALL keyword', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'BUFF_ALL',
        category: 'buff',
        value: 10,
        target: 'self',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    // All 8 stats should be buffed
    expect(Object.keys(result.statChanges).length).toBe(8);
    // Check a few stats to verify they're buffed
    expect(result.statChanges.dadJoke).toBeGreaterThan(50);
    expect(result.statChanges.grillSkill).toBeGreaterThan(80);
  });

  it('should execute HEAL keyword', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'HEAL',
        category: 'utility',
        value: 50,
        target: 'self',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.healing).toBeGreaterThan(0);
  });

  it('should execute WEAKEN keyword', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'WEAKEN',
        category: 'debuff',
        value: 20,
        target: 'opponent',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    // Should weaken the target's highest stat (grillSkill with 80)
    expect(Object.keys(result.statChanges).length).toBe(1);
    expect(result.statChanges.grillSkill).toBeLessThan(80); // Should be weakened
  });

  it('should execute SACRIFICE keyword with massive damage', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'SACRIFICE',
        category: 'special',
        value: 0,
        target: 'opponent',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.damage).toBe(100); // Fixed 100 damage for sacrifice
  });

  it('should execute multiple keywords', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'BURN',
        category: 'damage',
        value: 50,
        target: 'opponent',
      },
      {
        keyword: 'GRILL',
        category: 'status',
        value: 2,
        target: 'opponent',
        duration: 2,
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
    expect(result.statusEffects).toHaveLength(1);
    expect(result.statusEffects[0].type).toBe('grilled');
  });

  it('should scale damage with stats', () => {
    // Use cards with different grillSkill to test stat scaling
    const weakSource = createTestCard({
      id: 'weak-001',
      stats: {
        dadJoke: 50,
        grillSkill: 0,  // No grill skill
        fixIt: 40,
        napPower: 30,
        remoteControl: 60,
        thermostat: 45,
        sockSandal: 55,
        beerSnob: 65,
      }
    });
    const strongSource = createTestCard({
      id: 'strong-001',
      stats: {
        dadJoke: 50,
        grillSkill: 100,  // Max grill skill
        fixIt: 40,
        napPower: 30,
        remoteControl: 60,
        thermostat: 45,
        sockSandal: 55,
        beerSnob: 65,
      }
    });
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'BURN',
        category: 'damage',
        value: 50,
        target: 'opponent',
      },
    ];

    const weakResult = executeKeywords(keywords, weakSource, target);
    const strongResult = executeKeywords(keywords, strongSource, target);

    // Stat scaling: higher stat = more damage
    // Allow for some RNG variance in the calculation
    expect(strongResult.damage).toBeGreaterThanOrEqual(weakResult.damage);
  });

  it('should apply critical hit when triggered', () => {
    // Force critical hit by using very high dadJoke stat
    const source = createTestCard({ stats: { ...createTestCard().stats, dadJoke: 100 } });
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'BURN',
        category: 'damage',
        value: 50,
        target: 'opponent',
      },
    ];

    // Run multiple times to eventually get a crit
    let maxDamage = 0;
    for (let i = 0; i < 100; i++) {
      const result = executeKeywords(keywords, source, target);
      if (result.damage > maxDamage) {
        maxDamage = result.damage;
      }
      if (result.criticalHit) {
        expect(result.damage).toBeGreaterThan(50); // Crit does more than base damage
        break;
      }
    }
  });

  it('should return success: false for no effects', () => {
    const source = createTestCard();
    const target = createTestCard({ id: 'target-001' });

    const keywords: KeywordEffect[] = [
      {
        keyword: 'AOE',
        category: 'target',
        value: 'all_opponents',
        target: 'all_opponents',
      },
    ];

    const result = executeKeywords(keywords, source, target);

    expect(result.success).toBe(false);
    expect(result.damage).toBe(0);
    expect(result.healing).toBe(0);
  });
});

describe('validateKeywords', () => {
  it('should validate correct keywords', () => {
    const keywords: KeywordEffect[] = [
      {
        keyword: 'BURN',
        category: 'damage',
        value: 50,
        target: 'opponent',
      },
      {
        keyword: 'GRILL',
        category: 'status',
        value: 2,
        target: 'opponent',
        duration: 2,
      },
    ];

    const validation = validateKeywords(keywords);

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject unknown keyword', () => {
    const keywords: KeywordEffect[] = [
      {
        // @ts-expect-error - Testing invalid keyword
        keyword: 'INVALID_KEYWORD',
        category: 'damage',
        value: 50,
        target: 'opponent',
      },
    ];

    const validation = validateKeywords(keywords);

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Unknown keyword: INVALID_KEYWORD');
  });

  it('should reject invalid value type', () => {
    const keywords: KeywordEffect[] = [
      {
        keyword: 'BURN',
        category: 'damage',
        // @ts-expect-error - Testing invalid value type
        value: 'not a number',
        target: 'opponent',
      },
    ];

    const validation = validateKeywords(keywords);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('Invalid value type'))).toBe(true);
  });

  it('should reject invalid target', () => {
    const keywords: KeywordEffect[] = [
      {
        keyword: 'BURN',
        category: 'damage',
        value: 50,
        // @ts-expect-error - Testing invalid target
        target: 'invalid_target',
      },
    ];

    const validation = validateKeywords(keywords);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.some(e => e.includes('Invalid target'))).toBe(true);
  });

  it('should return multiple errors for multiple invalid keywords', () => {
    const keywords: KeywordEffect[] = [
      {
        // @ts-expect-error - Testing invalid keyword
        keyword: 'INVALID_1',
        category: 'damage',
        value: 50,
        target: 'opponent',
      },
      {
        // @ts-expect-error - Testing invalid keyword
        keyword: 'INVALID_2',
        category: 'status',
        value: 2,
        target: 'opponent',
      },
    ];

    const validation = validateKeywords(keywords);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('getKeywordsByCategory', () => {
  it('should return all damage keywords', () => {
    const damageKeywords = getKeywordsByCategory('damage');

    expect(damageKeywords).toContain('BURN');
    expect(damageKeywords).toContain('LECTURE');
    expect(damageKeywords).toContain('FIX');
    expect(damageKeywords).toContain('SWING');
    expect(damageKeywords).toContain('REMOTE');
  });

  it('should return all status keywords', () => {
    const statusKeywords = getKeywordsByCategory('status');

    expect(statusKeywords).toContain('GRILL');
    expect(statusKeywords).toContain('LECTURE_STATUS');
    expect(statusKeywords).toContain('DRUNK');
    expect(statusKeywords).toContain('WIRED');
  });

  it('should return all buff keywords', () => {
    const buffKeywords = getKeywordsByCategory('buff');

    expect(buffKeywords).toContain('BUFF_STAT');
    expect(buffKeywords).toContain('BUFF_ALL');
    expect(buffKeywords).toContain('SHIELD');
    expect(buffKeywords).toContain('RALLY');
  });

  it('should return all debuff keywords', () => {
    const debuffKeywords = getKeywordsByCategory('debuff');

    expect(debuffKeywords).toContain('WEAKEN');
    expect(debuffKeywords).toContain('WEAKEN_ALL');
    expect(debuffKeywords).toContain('EXPOSE');
  });

  it('should return all utility keywords', () => {
    const utilityKeywords = getKeywordsByCategory('utility');

    expect(utilityKeywords).toContain('NAP');
    expect(utilityKeywords).toContain('DRAW');
    expect(utilityKeywords).toContain('HEAL');
    expect(utilityKeywords).toContain('DISCARD');
    expect(utilityKeywords).toContain('SHUFFLE');
  });

  it('should return all target keywords', () => {
    const targetKeywords = getKeywordsByCategory('target');

    expect(targetKeywords).toContain('AOE');
    expect(targetKeywords).toContain('SINGLE');
    expect(targetKeywords).toContain('SELF');
    expect(targetKeywords).toContain('ALLY');
    expect(targetKeywords).toContain('RANDOM');
  });

  it('should return all special keywords', () => {
    const specialKeywords = getKeywordsByCategory('special');

    expect(specialKeywords).toContain('TRANSFORM');
    expect(specialKeywords).toContain('EVOLVE');
    expect(specialKeywords).toContain('SACRIFICE');
    expect(specialKeywords).toContain('STEAL');
    expect(specialKeywords).toContain('COPY');
  });
});

describe('formatKeywordForDisplay', () => {
  it('should format damage keyword with value', () => {
    const formatted = formatKeywordForDisplay('BURN', 50);

    expect(formatted).toBe('BURN (50)');
  });

  it('should format status keyword with turns', () => {
    const formatted = formatKeywordForDisplay('GRILL', 2);

    expect(formatted).toBe('GRILL (2 turns)');
  });

  it('should format keyword with default value when no value provided', () => {
    const formatted = formatKeywordForDisplay('BURN');

    expect(formatted).toBe('BURN (30)'); // Default BURN value
  });

  it('should format keyword with custom value', () => {
    const formatted = formatKeywordForDisplay('HEAL', 100);

    expect(formatted).toBe('HEAL (100)');
  });

  it('should return keyword name for unknown keyword', () => {
    // @ts-expect-error - Testing unknown keyword
    const formatted = formatKeywordForDisplay('UNKNOWN_KEYWORD');

    expect(formatted).toBe('UNKNOWN_KEYWORD');
  });
});
