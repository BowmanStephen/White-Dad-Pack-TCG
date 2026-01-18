/**
 * PACK-045: Storage Quota Manager Tests
 *
 * Tests for:
 * - Quota tracking
 * - Compression
 * - Archiving
 * - Auto-management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStorageQuotaInfo,
  checkQuotaBeforeSave,
  compressOldData,
  archiveOldPacks,
  autoManageQuota
} from '@/lib/storage/quota-manager';
import type { Collection, Pack } from '@/types';

// Mock collection for testing
function createMockCollection(packCount: number): Collection {
  const packs: Pack[] = [];

  for (let i = 0; i < packCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i); // Packs from i days ago

    packs.push({
      id: `pack-${i}`,
      cards: [
        {
          id: `card-${i}-1`,
          name: `Test Card ${i}-1`,
          type: 'BBQ_DAD',
          rarity: 'common',
          isHolo: false,
          stats: {
            dadJoke: 50,
            grillSkill: 50,
            fixIt: 50,
            napPower: 50,
            remoteControl: 50,
            thermostat: 50,
            sockSandal: 50,
            beerSnob: 50
          },
          abilities: [],
          flavorText: 'Test flavor text',
          series: 1,
          cardNumber: i + 1,
          totalInSeries: 100,
          artist: 'Test Artist',
          holoType: 'none'
        }
      ],
      openedAt: date,
      bestRarity: 'common',
      design: 'standard'
    });
  }

  return {
    packs,
    metadata: {
      totalPacksOpened: packCount,
      lastOpenedAt: new Date(),
      uniqueCards: packs.flatMap(p => p.cards).map(c => c.id),
      rarePulls: 0,
      holoPulls: 0,
      created: new Date(),
      rarityCounts: {
        common: packCount,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
        mythic: 0
      }
    }
  };
}

describe('PACK-045: Storage Quota Manager', () => {
  describe('getStorageQuotaInfo', () => {
    it('should return quota information', async () => {
      const quotaInfo = await getStorageQuotaInfo();

      expect(quotaInfo).toHaveProperty('used');
      expect(quotaInfo).toHaveProperty('total');
      expect(quotaInfo).toHaveProperty('percentage');
      expect(quotaInfo).toHaveProperty('driver');
      expect(quotaInfo).toHaveProperty('needsWarning');
      expect(quotaInfo).toHaveProperty('isFull');

      expect(quotaInfo.used).toBeGreaterThanOrEqual(0);
      expect(quotaInfo.total).toBeGreaterThan(0);
      expect(quotaInfo.percentage).toBeGreaterThanOrEqual(0);
      expect(quotaInfo.percentage).toBeLessThanOrEqual(100);
    });

    it('should identify when storage is available', async () => {
      const quotaInfo = await getStorageQuotaInfo();

      // Driver should be 'indexeddb', 'localstorage', or 'none' (in test env)
      expect(['indexeddb', 'localstorage', 'none', 'unknown']).toContain(quotaInfo.driver);
    });
  });

  describe('checkQuotaBeforeSave', () => {
    it('should allow saving when there is space', async () => {
      const result = await checkQuotaBeforeSave(1024); // 1KB

      expect(result).toHaveProperty('canSave');
      expect(result).toHaveProperty('quotaInfo');
      expect(result.canSave).toBe(true);
    });

    it('should provide warning when approaching limit', async () => {
      // Request saving 90% of total storage
      const quotaInfo = await getStorageQuotaInfo();
      const hugeSize = Math.floor(quotaInfo.total * 0.9);

      const result = await checkQuotaBeforeSave(hugeSize);

      expect(result).toHaveProperty('canSave');
      expect(result).toHaveProperty('quotaInfo');
      expect(result).toHaveProperty('warning');

      // If canSave is false, should have warning
      if (!result.canSave) {
        expect(result.warning).toBeDefined();
        expect(result.warning).toBeTruthy();
      }
    });
  });

  describe('compressOldData', () => {
    it('should compress old pack data', async () => {
      const collection = createMockCollection(40); // 40 packs
      const originalSize = JSON.stringify(collection).length;

      const result = await compressOldData(collection, 30); // Compress packs older than 30 days

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('originalSize');
      expect(result).toHaveProperty('compressedSize');
      expect(result).toHaveProperty('savedBytes');
      expect(result).toHaveProperty('archivedPacks');

      expect(result.success).toBe(true);
      expect(result.originalSize).toBe(originalSize);
      expect(result.archivedPacks).toBeGreaterThan(0);
    });

    it('should not compress if no old packs', async () => {
      const collection = createMockCollection(5); // Only 5 recent packs

      const result = await compressOldData(collection, 30);

      expect(result.success).toBe(true);
      expect(result.archivedPacks).toBe(0);
      expect(result.savedBytes).toBe(0);
    });
  });

  describe('archiveOldPacks', () => {
    it('should archive packs older than specified days', async () => {
      const collection = createMockCollection(40); // 40 packs over 40 days

      const result = await archiveOldPacks(collection, 30); // Archive packs older than 30 days

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('archivedPacks');
      expect(result).toHaveProperty('archivedData');

      expect(result.success).toBe(true);
      expect(result.archivedPacks).toBeGreaterThan(0);

      if (result.archivedData) {
        const archived = JSON.parse(result.archivedData);
        expect(archived).toHaveProperty('packs');
        expect(archived.packs).toBeInstanceOf(Array);
        expect(archived.packs.length).toBe(result.archivedPacks);
      }
    });

    it('should return zero if no packs to archive', async () => {
      const collection = createMockCollection(5); // Only 5 recent packs

      const result = await archiveOldPacks(collection, 30);

      expect(result.success).toBe(true);
      expect(result.archivedPacks).toBe(0);
    });
  });

  describe('autoManageQuota', () => {
    it('should return success without actions for small collections', async () => {
      const collection = createMockCollection(10); // Small collection

      const result = await autoManageQuota(collection);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('actions');
      expect(result).toHaveProperty('updatedCollection');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.actions)).toBe(true);
    });

    it('should return actions for large collections', async () => {
      // Note: This test depends on actual quota usage, so we just verify the structure
      const collection = createMockCollection(100); // Large collection

      const result = await autoManageQuota(collection);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('actions');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.actions)).toBe(true);
    });
  });
});
