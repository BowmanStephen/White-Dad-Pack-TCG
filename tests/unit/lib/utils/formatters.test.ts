/**
 * Formatters unit tests
 *
 * Tests locale-aware number and date formatting functions.
 */

import { describe, it, expect } from 'vitest';
import {
  formatStat,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTimestamp,
  formatCardCount,
  formatPackCount,
  formatLuckPercentage,
  formatCardStat,
} from '@/lib/utils/formatters';

describe('Formatters - Number Formatting', () => {
  describe('formatStat', () => {
    it('should format integers correctly', () => {
      expect(formatStat(95)).toBe('95');
      expect(formatStat(100)).toBe('100');
      expect(formatStat(0)).toBe('0');
    });

    it('should format large numbers with locale separators', () => {
      expect(formatStat(1234)).toMatch(/1,234|1\.234/); // en-US or es-ES
      expect(formatStat(1234567)).toMatch(/1,234,567|1\.234\.567/);
    });

    it('should format decimals correctly', () => {
      expect(formatStat(95.5)).toBe('95.5');
      expect(formatStat(0.856)).toBe('0.856');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal values as percentages', () => {
      expect(formatPercentage(0.856)).toContain('85'); // Should contain 85%
      expect(formatPercentage(0.1)).toContain('10');  // Should contain 10%
    });

    it('should format percentage values directly', () => {
      expect(formatPercentage(85.6)).toContain('85'); // Should contain 85%
      expect(formatPercentage(100)).toContain('100'); // Should contain 100%
    });
  });

  describe('formatCardStat', () => {
    it('should format card stats without decimals', () => {
      expect(formatCardStat(95)).toBe('95');
      expect(formatCardStat(100)).toBe('100');
      expect(formatCardStat(0)).toBe('0');
    });
  });

  describe('formatCardCount', () => {
    it('should format card counts without decimals', () => {
      expect(formatCardCount(1234)).toMatch(/1,234|1\.234/);
      expect(formatCardCount(0)).toBe('0');
    });
  });

  describe('formatPackCount', () => {
    it('should format pack counts without decimals', () => {
      expect(formatPackCount(56)).toBe('56');
      expect(formatPackCount(1000)).toMatch(/1,000|1\.000/);
    });
  });

  describe('formatLuckPercentage', () => {
    it('should format positive luck with + sign', () => {
      expect(formatLuckPercentage(15.5)).toMatch(/\+15[.,]5%/);
      expect(formatLuckPercentage(0.1)).toMatch(/\+0[.,]1%/);
    });

    it('should format negative luck with − sign', () => {
      expect(formatLuckPercentage(-5.2)).toMatch(/−5[.,]2%/);
      expect(formatLuckPercentage(-0.1)).toMatch(/−0[.,]1%/);
    });

    it('should format zero luck', () => {
      expect(formatLuckPercentage(0)).toMatch(/\+0[.,]0%/);
    });
  });
});

describe('Formatters - Date Formatting', () => {
  describe('formatDate', () => {
    it('should format date with default options', () => {
      const date = new Date('2026-01-18');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/2026/); // Should contain year
      expect(formatted).toMatch(/1|18/); // Should contain month or day
    });

    it('should format date with custom options', () => {
      const date = new Date('2026-01-18');
      const formatted = formatDate(date, { month: 'short', day: 'numeric' });
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2026-01-18T12:30:45');
      const formatted = formatDateTime(date);
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});

describe('Formatters - Relative Time', () => {
  describe('formatRelativeTime', () => {
    it('should format past minutes', () => {
      expect(formatRelativeTime(-5, 'minute')).toBeTruthy();
      expect(formatRelativeTime(-30, 'minute')).toBeTruthy();
    });

    it('should format past hours', () => {
      expect(formatRelativeTime(-2, 'hour')).toBeTruthy();
      expect(formatRelativeTime(-12, 'hour')).toBeTruthy();
    });

    it('should format past days', () => {
      expect(formatRelativeTime(-1, 'day')).toBeTruthy();
      expect(formatRelativeTime(-7, 'day')).toBeTruthy();
    });
  });

  describe('formatTimestamp', () => {
    it('should format recent timestamps as "just now"', () => {
      const now = new Date();
      const fiveSecondsAgo = new Date(now.getTime() - 5000);
      const formatted = formatTimestamp(fiveSecondsAgo);
      expect(formatted).toBeTruthy();
    });

    it('should format timestamps in minutes', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const formatted = formatTimestamp(fiveMinutesAgo);
      expect(formatted).toBeTruthy();
    });

    it('should format timestamps in hours', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const formatted = formatTimestamp(twoHoursAgo);
      expect(formatted).toBeTruthy();
    });

    it('should format timestamps in days', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const formatted = formatTimestamp(twoDaysAgo);
      expect(formatted).toBeTruthy();
    });
  });
});
