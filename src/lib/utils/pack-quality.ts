import type { PackCard, Rarity } from '../../types';

/**
 * PACK-029: Pack Quality Meter
 * Calculates pack quality score based on rarity points and holo bonus
 */

// Rarity point values (from acceptance criteria)
const RARITY_POINTS: Record<Rarity, number> = {
  mythic: 1000,
  legendary: 500,
  epic: 100,
  rare: 25,
  uncommon: 5,
  common: 1,
};

// Grade thresholds and configurations
export interface QualityGrade {
  grade: string;
  label: string;
  color: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export const GRADE_CONFIGS: QualityGrade[] = [
  {
    grade: 'S',
    label: 'S TIER',
    color: '#ec4899', // Pink (mythic)
    minScore: 1000,
    maxScore: Infinity,
    description: 'MYTHICAL! Dad is officially proud of you!',
  },
  {
    grade: 'A',
    label: 'A TIER',
    color: '#f97316', // Orange (legendary)
    minScore: 500,
    maxScore: 999,
    description: 'LEGENDARY! That\'s a quality pull, champ!',
  },
  {
    grade: 'B',
    label: 'B TIER',
    color: '#a855f7', // Purple (epic)
    minScore: 100,
    maxScore: 499,
    description: 'EPIC! Solid pack opening performance!',
  },
  {
    grade: 'C',
    label: 'C TIER',
    color: '#fbbf24', // Gold (rare)
    minScore: 25,
    maxScore: 99,
    description: 'RARE! Respectable pulls, son.',
  },
  {
    grade: 'D',
    label: 'D TIER',
    color: '#60a5fa', // Blue (uncommon)
    minScore: 6,
    maxScore: 24,
    description: 'UNCOMMON. Keep trying, you\'ll get there.',
  },
  {
    grade: 'F',
    label: 'F TIER',
    color: '#9ca3af', // Grey (common)
    minScore: 0,
    maxScore: 5,
    description: 'COMMON. Back to the garage with you.',
  },
];

export interface PackQualityResult {
  score: number;
  maxPossibleScore: number;
  grade: QualityGrade;
  percentage: number;
  holoBonus: number;
  baseScore: number;
}

/**
 * Calculate pack quality score
 * @param cards - Array of cards in the pack
 * @returns PackQualityResult with score, grade, and breakdown
 */
export function calculatePackQuality(cards: PackCard[]): PackQualityResult {
  // Calculate base score from rarity points
  let baseScore = 0;
  for (const card of cards) {
    baseScore += RARITY_POINTS[card.rarity] || 0;
  }

  // Calculate holo bonus (50% extra per holo card)
  let holoBonus = 0;
  for (const card of cards) {
    if (card.isHolo) {
      const cardPoints = RARITY_POINTS[card.rarity] || 0;
      holoBonus += Math.round(cardPoints * 0.5);
    }
  }

  // Total score
  const score = baseScore + holoBonus;

  // Calculate max possible score (all mythic + holo)
  const maxPossibleScore = cards.length * (RARITY_POINTS.mythic + Math.round(RARITY_POINTS.mythic * 0.5));

  // Calculate percentage (capped at 100%)
  const percentage = Math.min(100, Math.round((score / maxPossibleScore) * 100));

  // Determine grade
  const grade = GRADE_CONFIGS.find(config => score >= config.minScore && score <= config.maxScore)
    || GRADE_CONFIGS[GRADE_CONFIGS.length - 1]; // Default to F tier

  return {
    score,
    maxPossibleScore,
    grade,
    percentage,
    holoBonus,
    baseScore,
  };
}

/**
 * Get grade configuration by grade letter
 */
export function getGradeConfig(grade: string): QualityGrade {
  return GRADE_CONFIGS.find(config => config.grade === grade)
    || GRADE_CONFIGS[GRADE_CONFIGS.length - 1];
}
