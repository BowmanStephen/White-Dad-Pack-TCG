import { describe, it, expect, beforeEach } from 'vitest';
import {
  getQueryParam,
  getQueryParamArray,
  initializeGalleryFiltersFromURL,
  syncFiltersToURL,
} from '@/lib/utils/url-params';

describe('URL Parameters Utility', () => {
  describe('Basic URL param functions', () => {
    it('should get a single query param', () => {
      // Note: In test environment, window.location.search won't work
      // but getQueryParam should handle gracefully
      const result = getQueryParam('test');
      expect(typeof result).toBe('object'); // null or string
    });

    it('should get array query params', () => {
      const result = getQueryParamArray('types');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Gallery-specific initialization', () => {
    it('should initialize with default filters', () => {
      const result = initializeGalleryFiltersFromURL();

      expect(result.rarity).toBeNull();
      expect(result.types instanceof Set).toBe(true);
      expect(result.types.size).toBe(0);
      expect(result.sort).toBe('rarity_desc');
    });

    it('should return valid default values', () => {
      const result = initializeGalleryFiltersFromURL();

      // Verify structure
      expect(result).toHaveProperty('rarity');
      expect(result).toHaveProperty('types');
      expect(result).toHaveProperty('sort');

      // Verify types
      expect(typeof result.rarity).toBe('object'); // null or string
      expect(result.types instanceof Set).toBe(true);
      expect(typeof result.sort).toBe('string');
    });
  });

  describe('Filter sync function', () => {
    it('should have syncFiltersToURL function', () => {
      expect(typeof syncFiltersToURL).toBe('function');
    });

    it('should accept filter object', () => {
      // Should not throw
      expect(() => {
        syncFiltersToURL({
          rarity: null,
          types: new Set(),
          sort: 'rarity_desc',
        });
      }).not.toThrow();
    });
  });
});
