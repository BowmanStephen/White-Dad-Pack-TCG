import { describe, it, expect } from 'vitest';
import { calculatePackQuality, getGradeConfig, GRADE_CONFIGS } from '@/lib/utils/pack-quality';
import type { PackCard } from '@/types';

describe('Pack Quality Calculator (PACK-029)', () => {
  it('should calculate quality score for common-only pack', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '2', name: 'Card 2', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '3', name: 'Card 3', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '4', name: 'Card 4', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '5', name: 'Card 5', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '6', name: 'Card 6', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    expect(result.baseScore).toBe(6); // 6 commons = 6 points
    expect(result.holoBonus).toBe(0); // No holo cards
    expect(result.score).toBe(6);
    expect(result.grade.grade).toBe('D'); // 6 points = D tier (6-24 range)
    expect(result.grade.description).toBe('UNCOMMON. Keep trying, you\'ll get there.');
  });

  it('should calculate quality score for uncommon pack', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'uncommon', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '2', name: 'Card 2', rarity: 'uncommon', isHolo: false, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    expect(result.baseScore).toBe(10); // 2 uncommons = 10 points
    expect(result.holoBonus).toBe(0);
    expect(result.score).toBe(10);
    expect(result.grade.grade).toBe('D');
  });

  it('should calculate quality score for rare pack', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'rare', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '2', name: 'Card 2', rarity: 'rare', isHolo: false, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    expect(result.baseScore).toBe(50); // 2 rares = 50 points
    expect(result.holoBonus).toBe(0);
    expect(result.score).toBe(50);
    expect(result.grade.grade).toBe('C');
  });

  it('should calculate quality score for epic pack', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'epic', isHolo: false, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    expect(result.baseScore).toBe(100); // 1 epic = 100 points
    expect(result.holoBonus).toBe(0);
    expect(result.score).toBe(100);
    expect(result.grade.grade).toBe('B');
  });

  it('should calculate quality score for legendary pack', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'legendary', isHolo: false, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    expect(result.baseScore).toBe(500); // 1 legendary = 500 points
    expect(result.holoBonus).toBe(0);
    expect(result.score).toBe(500);
    expect(result.grade.grade).toBe('A');
  });

  it('should calculate quality score for mythic pack', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'mythic', isHolo: false, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    expect(result.baseScore).toBe(1000); // 1 mythic = 1000 points
    expect(result.holoBonus).toBe(0);
    expect(result.score).toBe(1000);
    expect(result.grade.grade).toBe('S');
  });

  it('should apply 50% holo bonus', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'rare', isHolo: true, type: 'BBQ_DICKTATOR' as any },
      { id: '2', name: 'Card 2', rarity: 'rare', isHolo: false, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    expect(result.baseScore).toBe(50); // 2 rares = 50 points
    expect(result.holoBonus).toBe(13); // 25 * 0.5 = 12.5, rounded = 13
    expect(result.score).toBe(63);
  });

  it('should calculate percentage correctly', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'mythic', isHolo: true, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    // Base: 1000 + Holo: 500 = 1500
    // Max for 1 card: 1000 + 500 = 1500
    expect(result.score).toBe(1500);
    expect(result.maxPossibleScore).toBe(1500);
    expect(result.percentage).toBe(100);
  });

  it('should cap percentage at 100%', () => {
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'mythic', isHolo: true, type: 'BBQ_DICKTATOR' as any },
      { id: '2', name: 'Card 2', rarity: 'mythic', isHolo: true, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    // 2 mythics with holo = 3000 points
    // Max for 2 cards = 3000
    expect(result.score).toBe(3000);
    expect(result.percentage).toBe(100);
  });

  it('should provide correct grade configurations', () => {
    expect(getGradeConfig('S').grade).toBe('S');
    expect(getGradeConfig('S').minScore).toBe(1000);
    expect(getGradeConfig('S').color).toBe('#ec4899');

    expect(getGradeConfig('A').grade).toBe('A');
    expect(getGradeConfig('A').minScore).toBe(500);
    expect(getGradeConfig('A').maxScore).toBe(999);

    expect(getGradeConfig('F').grade).toBe('F');
    expect(getGradeConfig('F').minScore).toBe(0);
    expect(getGradeConfig('F').maxScore).toBe(5);
  });

  it('should handle empty pack', () => {
    const cards: PackCard[] = [];

    const result = calculatePackQuality(cards);

    expect(result.score).toBe(0);
    expect(result.baseScore).toBe(0);
    expect(result.holoBonus).toBe(0);
    expect(result.grade.grade).toBe('F');
  });

  it('should calculate realistic pack quality example', () => {
    // Example: 3 commons, 2 uncommons, 1 rare, 1 holo rare
    const cards: PackCard[] = [
      { id: '1', name: 'Card 1', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '2', name: 'Card 2', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '3', name: 'Card 3', rarity: 'common', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '4', name: 'Card 4', rarity: 'uncommon', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '5', name: 'Card 5', rarity: 'uncommon', isHolo: false, type: 'BBQ_DICKTATOR' as any },
      { id: '6', name: 'Card 6', rarity: 'rare', isHolo: true, type: 'BBQ_DICKTATOR' as any },
    ];

    const result = calculatePackQuality(cards);

    // Base: 3*1 + 2*5 + 25 = 3 + 10 + 25 = 38
    // Holo: 25 * 0.5 = 12.5, rounded = 13
    // Total: 38 + 13 = 51
    expect(result.baseScore).toBe(38);
    expect(result.holoBonus).toBe(13);
    expect(result.score).toBe(51);
    expect(result.grade.grade).toBe('C'); // 25-99 = C tier
  });
});
