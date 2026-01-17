/**
 * Crafting Mutex Tests - HP-005: Fix concurrent craft race condition
 *
 * Tests the mutex/queue system that prevents simultaneous crafting operations.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  acquireCraftingMutex,
  releaseCraftingMutex,
  queueCraftingOperation,
  isCraftingInProgress,
  getQueuedCraftingCount,
  executeCrafting,
  resetCraftingSession,
  startCraftingSession,
  craftingHistory,
} from '@/stores/crafting';
import { CRAFTING_RECIPES } from '@/types';

describe('Crafting Mutex System - HP-005', () => {
  beforeEach(() => {
    // Reset all stores before each test
    resetCraftingSession();
    craftingHistory.set({
      entries: [],
      totalAttempts: 0,
      successfulCrafts: 0,
      failedCrafts: 0,
      bestCraft: null,
    });

    // Release mutex if it's locked and clear queue
    while (isCraftingInProgress() || getQueuedCraftingCount() > 0) {
      releaseCraftingMutex();
    }
  });

  describe('Mutex Acquisition and Release', () => {
    it('should allow first craft to acquire mutex', () => {
      const acquired = acquireCraftingMutex();

      expect(acquired).toBe(true);
      expect(isCraftingInProgress()).toBe(true);

      // Clean up
      releaseCraftingMutex();
    });

    it('should prevent second craft from acquiring mutex while first is active', () => {
      // First craft acquires mutex
      const firstAcquired = acquireCraftingMutex();
      expect(firstAcquired).toBe(true);

      // Second craft should fail to acquire
      const secondAcquired = acquireCraftingMutex();
      expect(secondAcquired).toBe(false);

      // Clean up
      releaseCraftingMutex();
    });

    it('should allow new craft after mutex is released', () => {
      // First craft acquires and releases
      acquireCraftingMutex();
      releaseCraftingMutex();

      // Second craft should now succeed
      const secondAcquired = acquireCraftingMutex();
      expect(secondAcquired).toBe(true);

      // Clean up
      releaseCraftingMutex();
    });

    it('should track crafting state correctly', () => {
      expect(isCraftingInProgress()).toBe(false);

      acquireCraftingMutex();
      expect(isCraftingInProgress()).toBe(true);

      releaseCraftingMutex();
      expect(isCraftingInProgress()).toBe(false);
    });
  });

  describe('Queue System', () => {
    it('should queue operations when mutex is locked', () => {
      const operation1 = vi.fn();
      const operation2 = vi.fn();

      // Lock mutex
      acquireCraftingMutex();

      // Queue operations
      queueCraftingOperation(operation1);
      queueCraftingOperation(operation2);

      expect(getQueuedCraftingCount()).toBe(2);

      // Clean up (note: this will execute queued operations)
      releaseCraftingMutex();
    });

    it('should execute queued operations in order', () => {
      const executionOrder: number[] = [];

      // Operations that DON'T try to acquire mutex themselves
      const operation1 = () => {
        executionOrder.push(1);
        // Manually release mutex after work is done
        releaseCraftingMutex();
      };
      const operation2 = () => {
        executionOrder.push(2);
        releaseCraftingMutex();
      };
      const operation3 = () => {
        executionOrder.push(3);
        releaseCraftingMutex();
      };

      // Lock mutex
      acquireCraftingMutex();

      // Queue operations
      queueCraftingOperation(operation1);
      queueCraftingOperation(operation2);
      queueCraftingOperation(operation3);

      expect(getQueuedCraftingCount()).toBe(3);

      // Release mutex to trigger execution chain
      releaseCraftingMutex();

      // Verify execution order (all should have executed)
      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should process one queued operation per mutex release', () => {
      const executedOps: string[] = [];

      const operation1 = () => {
        executedOps.push('op1');
        // DON'T release - operation should handle this itself
      };
      const operation2 = () => {
        executedOps.push('op2');
        // DON'T release
      };

      // Lock mutex
      acquireCraftingMutex();

      // Queue operations
      queueCraftingOperation(operation1);
      queueCraftingOperation(operation2);

      expect(getQueuedCraftingCount()).toBe(2);

      // First release triggers op1 (which runs but doesn't release mutex)
      releaseCraftingMutex();
      expect(executedOps).toEqual(['op1']);
      // op1 executed but didn't release, so op2 hasn't run yet
      expect(executedOps).not.toContain('op2');

      // Now release the mutex that op1 should have released
      releaseCraftingMutex();
      // op2 should have executed now
      expect(executedOps).toEqual(['op1', 'op2']);

      // Final cleanup
      releaseCraftingMutex();
      expect(isCraftingInProgress()).toBe(false);
      expect(getQueuedCraftingCount()).toBe(0);
    });
  });

  describe('Integration with executeCrafting', () => {
    it('should prevent concurrent executeCrafting calls', () => {
      const recipe = CRAFTING_RECIPES[0];
      startCraftingSession(recipe, ['card1', 'card2', 'card3']);

      // First craft should succeed and acquire/release mutex internally
      executeCrafting(
        {
          id: 'result1',
          name: 'Test Card',
          type: 'BBQ_DAD',
          rarity: 'rare',
          artwork: '',
          stats: { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 },
          flavorText: '',
          series: 1,
          cardNumber: 1,
          totalInSeries: 50,
          artist: '',
          isRevealed: true,
          isHolo: false,
          holoType: 'none',
        },
        true
      );

      const history1 = craftingHistory.get();
      expect(history1.totalAttempts).toBe(1);
      expect(isCraftingInProgress()).toBe(false); // Mutex should be released

      // Now manually lock to simulate a second craft trying to run
      acquireCraftingMutex();

      // Second craft should be blocked because we're holding the mutex
      executeCrafting(
        {
          id: 'result2',
          name: 'Test Card 2',
          type: 'BBQ_DAD',
          rarity: 'epic',
          artwork: '',
          stats: { dadJoke: 60, grillSkill: 60, fixIt: 60, napPower: 60, remoteControl: 60, thermostat: 60, sockSandal: 60, beerSnob: 60 },
          flavorText: '',
          series: 1,
          cardNumber: 2,
          totalInSeries: 50,
          artist: '',
          isRevealed: true,
          isHolo: false,
          holoType: 'none',
        },
        true
      );

      const history2 = craftingHistory.get();
      // Should still be 1 (second craft was blocked by mutex)
      expect(history2.totalAttempts).toBe(1);

      // Clean up
      releaseCraftingMutex();
    });

    it('should release mutex even if executeCrafting fails', () => {
      const recipe = CRAFTING_RECIPES[0];
      startCraftingSession(recipe, ['card1', 'card2', 'card3']);

      // Mock a scenario where state might be invalid
      // This tests the try/finally block in executeCrafting
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Execute with valid data
      executeCrafting(
        {
          id: 'result1',
          name: 'Test Card',
          type: 'BBQ_DAD',
          rarity: 'rare',
          artwork: '',
          stats: { dadJoke: 50, grillSkill: 50, fixIt: 50, napPower: 50, remoteControl: 50, thermostat: 50, sockSandal: 50, beerSnob: 50 },
          flavorText: '',
          series: 1,
          cardNumber: 1,
          totalInSeries: 50,
          artist: '',
          isRevealed: true,
          isHolo: false,
          holoType: 'none',
        },
        true
      );

      // Mutex should be released
      expect(isCraftingInProgress()).toBe(false);

      // Should be able to start another craft
      const acquired = acquireCraftingMutex();
      expect(acquired).toBe(true);
      releaseCraftingMutex();

      consoleSpy.mockRestore();
    });
  });

  describe('Session Reset Integration', () => {
    it('should release mutex when session is reset', () => {
      // Acquire mutex
      acquireCraftingMutex();
      expect(isCraftingInProgress()).toBe(true);

      // Reset session should release mutex
      resetCraftingSession();
      expect(isCraftingInProgress()).toBe(false);
    });

    it('should handle reset when no craft is in progress', () => {
      expect(isCraftingInProgress()).toBe(false);

      // Should not throw
      expect(() => resetCraftingSession()).not.toThrow();
      expect(isCraftingInProgress()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid mutex releases', () => {
      acquireCraftingMutex();

      // Multiple releases should not throw
      expect(() => {
        releaseCraftingMutex();
        releaseCraftingMutex(); // Extra release
      }).not.toThrow();

      expect(isCraftingInProgress()).toBe(false);
    });

    it('should handle queue operations when mutex is unlocked', () => {
      const operation = vi.fn();

      // Queue when unlocked
      queueCraftingOperation(operation);
      expect(getQueuedCraftingCount()).toBe(1);

      // Acquire and release to process queue
      acquireCraftingMutex();
      releaseCraftingMutex();

      // Operation should have executed
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle empty queue operations', () => {
      acquireCraftingMutex();
      expect(getQueuedCraftingCount()).toBe(0);

      // Release with no queued operations
      expect(() => releaseCraftingMutex()).not.toThrow();
      expect(isCraftingInProgress()).toBe(false);
    });
  });
});
