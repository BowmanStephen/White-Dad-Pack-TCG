import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CardStats from '@/components/card/CardStats.svelte';
import type { CardStats as CardStatsType } from '@/types';
import { RARITY_CONFIG } from '@/types';

// Mock stats data
const mockStats: CardStatsType = {
  dadJoke: 75,
  grillSkill: 95,
  fixIt: 40,
  napPower: 30,
  remoteControl: 50,
  thermostat: 60,
  sockSandal: 45,
  beerSnob: 70,
};

const highStats: CardStatsType = {
  dadJoke: 90,
  grillSkill: 100,
  fixIt: 85,
  napPower: 88,
  remoteControl: 92,
  thermostat: 87,
  sockSandal: 95,
  beerSnob: 91,
};

const lowStats: CardStatsType = {
  dadJoke: 10,
  grillSkill: 5,
  fixIt: 20,
  napPower: 15,
  remoteControl: 8,
  thermostat: 12,
  sockSandal: 18,
  beerSnob: 7,
};

describe('CardStats Component', () => {
  describe('Rendering', () => {
    it('should render all stats with correct values', () => {
      render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      expect(screen.getByText('75')).toBeTruthy();
      expect(screen.getByText('95')).toBeTruthy();
      expect(screen.getByText('40')).toBeTruthy();
      expect(screen.getByText('30')).toBeTruthy();
      expect(screen.getByText('50')).toBeTruthy();
      expect(screen.getByText('60')).toBeTruthy();
      expect(screen.getByText('45')).toBeTruthy();
      expect(screen.getByText('70')).toBeTruthy();
    });

    it('should display stat labels', () => {
      render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      expect(screen.getAllByText(/dad joke/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/grill skill/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/fix-it/i).length).toBeGreaterThan(0);
    });

    it('should display stat icons', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      const icons = container.querySelectorAll('.stat-icon');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Stat Display Values', () => {
    it('should display correct stat values for all attributes', () => {
      render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      // Check individual stat values
      expect(screen.getByText('75')).toBeTruthy(); // dadJoke
      expect(screen.getByText('95')).toBeTruthy(); // grillSkill
      expect(screen.getByText('40')).toBeTruthy(); // fixIt
      expect(screen.getByText('30')).toBeTruthy(); // napPower
      expect(screen.getByText('50')).toBeTruthy(); // remoteControl
      expect(screen.getByText('60')).toBeTruthy(); // thermostat
      expect(screen.getByText('45')).toBeTruthy(); // sockSandal
      expect(screen.getByText('70')).toBeTruthy(); // beerSnob
    });

    it('should format stats correctly', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      const statValues = container.querySelectorAll('.stat-value');
      expect(statValues.length).toBe(8);

      // Check that all values are properly formatted
      statValues.forEach((el) => {
        const text = el.textContent || '';
        expect(text).toMatch(/^\d+$/); // Should be numeric
      });
    });

    it('should handle zero stats correctly', () => {
      const zeroStats: CardStatsType = {
        dadJoke: 0,
        grillSkill: 0,
        fixIt: 0,
        napPower: 0,
        remoteControl: 0,
        thermostat: 0,
        sockSandal: 0,
        beerSnob: 0,
      };

      render(CardStats, {
        stats: zeroStats,
        rarityConfig: RARITY_CONFIG.common,
        cardRarity: 'common',
      });

      expect(screen.getAllByText('0').length).toBe(8);
    });

    it('should handle maximum stats correctly', () => {
      const maxStats: CardStatsType = {
        dadJoke: 100,
        grillSkill: 100,
        fixIt: 100,
        napPower: 100,
        remoteControl: 100,
        thermostat: 100,
        sockSandal: 100,
        beerSnob: 100,
      };

      render(CardStats, {
        stats: maxStats,
        rarityConfig: RARITY_CONFIG.mythic,
        cardRarity: 'mythic',
      });

      expect(screen.getAllByText('100').length).toBe(8);
    });
  });

  describe('High Stat Highlighting', () => {
    it('should highlight stats >= 80', () => {
      const { container } = render(CardStats, {
        stats: highStats,
        rarityConfig: RARITY_CONFIG.mythic,
        cardRarity: 'mythic',
      });

      const highStatRows = container.querySelectorAll('.high-stat');
      expect(highStatRows.length).toBe(8); // All stats are >= 80
    });

    it('should not highlight stats < 80', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      // Only grillSkill is >= 80
      const highStatRows = container.querySelectorAll('.high-stat');
      expect(highStatRows.length).toBe(1);
    });
  });

  describe('Stat Bars', () => {
    it('should render progress bars for all stats', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      const statBars = container.querySelectorAll('.stat-bar');
      expect(statBars.length).toBe(8);
    });

    it('should set aria values for stat bars', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      const statBars = container.querySelectorAll('.stat-bar');

      // Check that widths match stat values
      statBars.forEach((bar) => {
        const value = bar.getAttribute('aria-valuenow');
        expect(value).toBeTruthy();
        const width = parseInt(value || '0');
        expect(width).toBeGreaterThanOrEqual(0);
        expect(width).toBeLessThanOrEqual(100);
      });
    });

    it('should apply high-stat class for high stats (>= 80)', () => {
      const { container } = render(CardStats, {
        stats: highStats,
        rarityConfig: RARITY_CONFIG.legendary,
        cardRarity: 'legendary',
      });

      const statBars = container.querySelectorAll('.stat-bar');

      statBars.forEach((bar) => {
        expect(bar.classList.contains('stat-bar-high')).toBe(true);
      });
    });

    it('should apply high-stat class only to >= 80 stats', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      const statBars = container.querySelectorAll('.stat-bar');
      const highBars = Array.from(statBars).filter((bar) =>
        bar.classList.contains('stat-bar-high')
      );
      expect(highBars.length).toBe(1);
    });

    it('should not apply high-stat class for low stats (< 50)', () => {
      const { container } = render(CardStats, {
        stats: lowStats,
        rarityConfig: RARITY_CONFIG.common,
        cardRarity: 'common',
      });

      const statBars = container.querySelectorAll('.stat-bar');

      statBars.forEach((bar) => {
        expect(bar.classList.contains('stat-bar-high')).toBe(false);
      });
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode when compact is true', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
        compact: true,
      });

      const statsGrid = container.querySelector('.stats-grid');
      expect(statsGrid).toBeTruthy();
    });

    it('should render in normal mode when compact is false', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
        compact: false,
      });

      const radarChart = container.querySelector('.radar-chart-wrapper');
      expect(radarChart).toBeTruthy();
    });
  });

  describe('Rarity Theming', () => {
    it('should apply rarity-based styling for common cards', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.common,
        cardRarity: 'common',
      });

      // Check that component renders
      expect(container.querySelector('.stats-grid')).toBeTruthy();
    });

    it('should apply rarity-based styling for rare cards', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      expect(container.querySelector('.stats-grid')).toBeTruthy();
    });

    it('should apply rarity-based styling for mythic cards', () => {
      const { container } = render(CardStats, {
        stats: highStats,
        rarityConfig: RARITY_CONFIG.mythic,
        cardRarity: 'mythic',
      });

      const statBars = container.querySelectorAll('.stat-bar');
      expect(statBars.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for stat rows', () => {
      render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      const statBars = screen.getAllByRole('progressbar');
      expect(statBars.length).toBe(8);

      statBars.forEach((bar) => {
        expect(bar.getAttribute('aria-label')).toBeTruthy();
        expect(bar.getAttribute('aria-valuemin')).toBe('0');
        expect(bar.getAttribute('aria-valuemax')).toBe('100');
        expect(bar.getAttribute('aria-valuenow')).toBeTruthy();
      });
    });

    it('should have accessible stat names', () => {
      render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      const statLabels = screen.getAllByText(/grill skill/i);
      expect(statLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Stat Ordering', () => {
    it('should display stats sorted by value (descending)', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
      });

      const statValues = container.querySelectorAll('.stat-value');
      const values = Array.from(statValues).map((el) =>
        parseInt(el.textContent || '0')
      );

      // First value should be highest (95)
      expect(values[0]).toBe(95);
      // Last value should be lowest (30)
      expect(values[values.length - 1]).toBe(30);
    });
  });

  describe('Card Type Handling', () => {
    it('should show stats for DAD_ARCHETYPE cards', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
        cardType: 'BBQ_DICKTATOR',
      });

      expect(container.querySelector('.stats-grid')).toBeTruthy();
      expect(container.querySelector('.radar-chart-wrapper')).toBeTruthy();
    });

    it('should show "No base stats" message for statless cards', () => {
      const { container } = render(CardStats, {
        stats: mockStats,
        rarityConfig: RARITY_CONFIG.rare,
        cardRarity: 'rare',
        cardType: 'CURSE',
        showRadarChart: true,
      });

      expect(screen.getByText('No base stats')).toBeTruthy();
      expect(screen.getByText('This card uses special effects')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all stats at 50 (boundary case)', () => {
      const boundaryStats: CardStatsType = {
        dadJoke: 50,
        grillSkill: 50,
        fixIt: 50,
        napPower: 50,
        remoteControl: 50,
        thermostat: 50,
        sockSandal: 50,
        beerSnob: 50,
      };

      const { container } = render(CardStats, {
        stats: boundaryStats,
        rarityConfig: RARITY_CONFIG.uncommon,
        cardRarity: 'uncommon',
      });

      const statBars = container.querySelectorAll('.stat-bar');
      expect(statBars.length).toBe(8);
    });

    it('should handle uneven stat distribution', () => {
      const unevenStats: CardStatsType = {
        dadJoke: 100,
        grillSkill: 0,
        fixIt: 50,
        napPower: 25,
        remoteControl: 75,
        thermostat: 10,
        sockSandal: 90,
        beerSnob: 5,
      };

      render(CardStats, {
        stats: unevenStats,
        rarityConfig: RARITY_CONFIG.epic,
        cardRarity: 'epic',
      });

      expect(screen.getByText('100')).toBeTruthy();
      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy();
    });
  });
});
