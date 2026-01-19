/**
 * Notifications Store Tests
 * Tests for notification preferences management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  notificationPreferences,
  togglePushEnabled,
  setPushEnabled,
  updatePushPermission,
  toggleDailyRewardNotifications,
  setDailyRewardNotifications,
  toggleTradeNotifications,
  setTradeNotifications,
  toggleAchievementNotifications,
  setAchievementNotifications,
  toggleGeneralNotifications,
  setGeneralNotifications,
  toggleNotificationSound,
  setNotificationSound,
  toggleNotificationVibration,
  setNotificationVibration,
  toggleQuietHours,
  setQuietHours,
  setQuietHoursStart,
  setQuietHoursEnd,
  setQuietHoursRange,
  isInQuietHours,
  canShowNotification,
  canPlayNotificationSound,
  canVibrateNotification,
  resetNotificationPreferences,
  getNotificationPreferences,
} from '@/stores/notifications';

// Default preferences for resetting
const DEFAULT_PREFERENCES = {
  pushEnabled: false,
  pushPermission: 'default' as const,
  dailyRewardNotifications: true,
  tradeNotifications: true,
  achievementNotifications: true,
  generalNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

describe('Notifications Store', () => {
  beforeEach(() => {
    // Reset store to default state
    notificationPreferences.set({ ...DEFAULT_PREFERENCES });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have pushEnabled disabled by default', () => {
      expect(notificationPreferences.get().pushEnabled).toBe(false);
    });

    it('should have pushPermission as default', () => {
      expect(notificationPreferences.get().pushPermission).toBe('default');
    });

    it('should have daily reward notifications enabled', () => {
      expect(notificationPreferences.get().dailyRewardNotifications).toBe(true);
    });

    it('should have trade notifications enabled', () => {
      expect(notificationPreferences.get().tradeNotifications).toBe(true);
    });

    it('should have achievement notifications enabled', () => {
      expect(notificationPreferences.get().achievementNotifications).toBe(true);
    });

    it('should have general notifications disabled', () => {
      expect(notificationPreferences.get().generalNotifications).toBe(false);
    });

    it('should have sound enabled', () => {
      expect(notificationPreferences.get().soundEnabled).toBe(true);
    });

    it('should have vibration enabled', () => {
      expect(notificationPreferences.get().vibrationEnabled).toBe(true);
    });

    it('should have quiet hours disabled', () => {
      expect(notificationPreferences.get().quietHoursEnabled).toBe(false);
    });

    it('should have default quiet hours range', () => {
      const prefs = notificationPreferences.get();
      expect(prefs.quietHoursStart).toBe('22:00');
      expect(prefs.quietHoursEnd).toBe('08:00');
    });
  });

  describe('Push Notification Settings', () => {
    describe('togglePushEnabled()', () => {
      it('should toggle push from false to true', () => {
        togglePushEnabled();
        expect(notificationPreferences.get().pushEnabled).toBe(true);
      });

      it('should toggle push from true to false', () => {
        setPushEnabled(true);
        togglePushEnabled();
        expect(notificationPreferences.get().pushEnabled).toBe(false);
      });
    });

    describe('setPushEnabled()', () => {
      it('should set push enabled to true', () => {
        setPushEnabled(true);
        expect(notificationPreferences.get().pushEnabled).toBe(true);
      });

      it('should set push enabled to false', () => {
        setPushEnabled(true);
        setPushEnabled(false);
        expect(notificationPreferences.get().pushEnabled).toBe(false);
      });
    });

    describe('updatePushPermission()', () => {
      it('should update permission to granted', () => {
        updatePushPermission('granted');
        expect(notificationPreferences.get().pushPermission).toBe('granted');
      });

      it('should update permission to denied', () => {
        updatePushPermission('denied');
        expect(notificationPreferences.get().pushPermission).toBe('denied');
      });

      it('should update permission to default', () => {
        updatePushPermission('granted');
        updatePushPermission('default');
        expect(notificationPreferences.get().pushPermission).toBe('default');
      });
    });
  });

  describe('Category Notification Toggles', () => {
    describe('Daily Reward Notifications', () => {
      it('should toggle daily reward notifications', () => {
        toggleDailyRewardNotifications();
        expect(notificationPreferences.get().dailyRewardNotifications).toBe(false);

        toggleDailyRewardNotifications();
        expect(notificationPreferences.get().dailyRewardNotifications).toBe(true);
      });

      it('should set daily reward notifications', () => {
        setDailyRewardNotifications(false);
        expect(notificationPreferences.get().dailyRewardNotifications).toBe(false);

        setDailyRewardNotifications(true);
        expect(notificationPreferences.get().dailyRewardNotifications).toBe(true);
      });
    });

    describe('Trade Notifications', () => {
      it('should toggle trade notifications', () => {
        toggleTradeNotifications();
        expect(notificationPreferences.get().tradeNotifications).toBe(false);

        toggleTradeNotifications();
        expect(notificationPreferences.get().tradeNotifications).toBe(true);
      });

      it('should set trade notifications', () => {
        setTradeNotifications(false);
        expect(notificationPreferences.get().tradeNotifications).toBe(false);

        setTradeNotifications(true);
        expect(notificationPreferences.get().tradeNotifications).toBe(true);
      });
    });

    describe('Achievement Notifications', () => {
      it('should toggle achievement notifications', () => {
        toggleAchievementNotifications();
        expect(notificationPreferences.get().achievementNotifications).toBe(false);

        toggleAchievementNotifications();
        expect(notificationPreferences.get().achievementNotifications).toBe(true);
      });

      it('should set achievement notifications', () => {
        setAchievementNotifications(false);
        expect(notificationPreferences.get().achievementNotifications).toBe(false);

        setAchievementNotifications(true);
        expect(notificationPreferences.get().achievementNotifications).toBe(true);
      });
    });

    describe('General Notifications', () => {
      it('should toggle general notifications', () => {
        toggleGeneralNotifications();
        expect(notificationPreferences.get().generalNotifications).toBe(true);

        toggleGeneralNotifications();
        expect(notificationPreferences.get().generalNotifications).toBe(false);
      });

      it('should set general notifications', () => {
        setGeneralNotifications(true);
        expect(notificationPreferences.get().generalNotifications).toBe(true);

        setGeneralNotifications(false);
        expect(notificationPreferences.get().generalNotifications).toBe(false);
      });
    });
  });

  describe('Sound & Vibration Settings', () => {
    describe('Sound Settings', () => {
      it('should toggle notification sound', () => {
        toggleNotificationSound();
        expect(notificationPreferences.get().soundEnabled).toBe(false);

        toggleNotificationSound();
        expect(notificationPreferences.get().soundEnabled).toBe(true);
      });

      it('should set notification sound', () => {
        setNotificationSound(false);
        expect(notificationPreferences.get().soundEnabled).toBe(false);

        setNotificationSound(true);
        expect(notificationPreferences.get().soundEnabled).toBe(true);
      });
    });

    describe('Vibration Settings', () => {
      it('should toggle notification vibration', () => {
        toggleNotificationVibration();
        expect(notificationPreferences.get().vibrationEnabled).toBe(false);

        toggleNotificationVibration();
        expect(notificationPreferences.get().vibrationEnabled).toBe(true);
      });

      it('should set notification vibration', () => {
        setNotificationVibration(false);
        expect(notificationPreferences.get().vibrationEnabled).toBe(false);

        setNotificationVibration(true);
        expect(notificationPreferences.get().vibrationEnabled).toBe(true);
      });
    });
  });

  describe('Quiet Hours Configuration', () => {
    describe('toggleQuietHours()', () => {
      it('should toggle quiet hours enabled', () => {
        toggleQuietHours();
        expect(notificationPreferences.get().quietHoursEnabled).toBe(true);

        toggleQuietHours();
        expect(notificationPreferences.get().quietHoursEnabled).toBe(false);
      });
    });

    describe('setQuietHours()', () => {
      it('should set quiet hours enabled', () => {
        setQuietHours(true);
        expect(notificationPreferences.get().quietHoursEnabled).toBe(true);

        setQuietHours(false);
        expect(notificationPreferences.get().quietHoursEnabled).toBe(false);
      });
    });

    describe('setQuietHoursStart()', () => {
      it('should set quiet hours start time', () => {
        setQuietHoursStart('21:00');
        expect(notificationPreferences.get().quietHoursStart).toBe('21:00');
      });
    });

    describe('setQuietHoursEnd()', () => {
      it('should set quiet hours end time', () => {
        setQuietHoursEnd('09:00');
        expect(notificationPreferences.get().quietHoursEnd).toBe('09:00');
      });
    });

    describe('setQuietHoursRange()', () => {
      it('should set both start and end times', () => {
        setQuietHoursRange('23:00', '07:00');
        
        const prefs = notificationPreferences.get();
        expect(prefs.quietHoursStart).toBe('23:00');
        expect(prefs.quietHoursEnd).toBe('07:00');
      });
    });
  });

  describe('isInQuietHours()', () => {
    it('should return false when quiet hours are disabled', () => {
      setQuietHours(false);
      expect(isInQuietHours()).toBe(false);
    });

    // Note: Time-based tests are skipped because vi.setSystemTime is not available in bun test
    // These functions are tested via integration tests or manual testing
  });

  describe('canShowNotification()', () => {
    it('should return false when category is disabled', () => {
      setGeneralNotifications(false);
      expect(canShowNotification('general')).toBe(false);
    });

    it('should return true when category is enabled and quiet hours disabled', () => {
      setQuietHours(false);
      setDailyRewardNotifications(true);
      expect(canShowNotification('daily_reward')).toBe(true);
    });

    it('should check daily_reward category correctly', () => {
      setQuietHours(false);
      setDailyRewardNotifications(true);
      expect(canShowNotification('daily_reward')).toBe(true);

      setDailyRewardNotifications(false);
      expect(canShowNotification('daily_reward')).toBe(false);
    });

    it('should check trade category correctly', () => {
      setQuietHours(false);
      setTradeNotifications(true);
      expect(canShowNotification('trade')).toBe(true);

      setTradeNotifications(false);
      expect(canShowNotification('trade')).toBe(false);
    });

    it('should check achievement category correctly', () => {
      setQuietHours(false);
      setAchievementNotifications(true);
      expect(canShowNotification('achievement')).toBe(true);

      setAchievementNotifications(false);
      expect(canShowNotification('achievement')).toBe(false);
    });

    it('should check general category correctly', () => {
      setQuietHours(false);
      setGeneralNotifications(true);
      expect(canShowNotification('general')).toBe(true);

      setGeneralNotifications(false);
      expect(canShowNotification('general')).toBe(false);
    });
  });

  describe('canPlayNotificationSound()', () => {
    it('should return true when sound enabled and quiet hours disabled', () => {
      setNotificationSound(true);
      setQuietHours(false);
      expect(canPlayNotificationSound()).toBe(true);
    });

    it('should return false when sound disabled', () => {
      setNotificationSound(false);
      expect(canPlayNotificationSound()).toBe(false);
    });
  });

  describe('canVibrateNotification()', () => {
    it('should return true when vibration enabled and quiet hours disabled', () => {
      setNotificationVibration(true);
      setQuietHours(false);
      expect(canVibrateNotification()).toBe(true);
    });

    it('should return false when vibration disabled', () => {
      setNotificationVibration(false);
      expect(canVibrateNotification()).toBe(false);
    });
  });

  describe('resetNotificationPreferences()', () => {
    it('should reset all preferences to defaults', () => {
      // Change some settings
      setPushEnabled(true);
      setDailyRewardNotifications(false);
      setNotificationSound(false);
      setQuietHours(true);

      // Reset
      resetNotificationPreferences();

      const prefs = notificationPreferences.get();
      expect(prefs.pushEnabled).toBe(false);
      expect(prefs.dailyRewardNotifications).toBe(true);
      expect(prefs.soundEnabled).toBe(true);
      expect(prefs.quietHoursEnabled).toBe(false);
    });
  });

  describe('getNotificationPreferences()', () => {
    it('should return current preferences', () => {
      setPushEnabled(true);
      setNotificationSound(false);

      const prefs = getNotificationPreferences();
      expect(prefs.pushEnabled).toBe(true);
      expect(prefs.soundEnabled).toBe(false);
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when preferences change', () => {
      let callCount = 0;
      const unsubscribe = notificationPreferences.subscribe(() => {
        callCount++;
      });

      togglePushEnabled();
      toggleNotificationSound();

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should provide current value to new subscribers', () => {
      setPushEnabled(true);

      let receivedValue = false;
      const unsubscribe = notificationPreferences.subscribe((prefs) => {
        receivedValue = prefs.pushEnabled;
      });

      expect(receivedValue).toBe(true);
      unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggles without errors', () => {
      expect(() => {
        for (let i = 0; i < 20; i++) {
          togglePushEnabled();
          toggleNotificationSound();
          toggleQuietHours();
        }
      }).not.toThrow();
    });

    it('should handle all category types', () => {
      setQuietHours(false);
      const categories = ['daily_reward', 'trade', 'achievement', 'general'] as const;

      categories.forEach((category) => {
        // Enable and check
        switch (category) {
          case 'daily_reward':
            setDailyRewardNotifications(true);
            break;
          case 'trade':
            setTradeNotifications(true);
            break;
          case 'achievement':
            setAchievementNotifications(true);
            break;
          case 'general':
            setGeneralNotifications(true);
            break;
        }

        expect(canShowNotification(category)).toBe(true);
      });
    });

    it('should maintain preference independence', () => {
      // Change one setting
      setNotificationSound(false);

      // Others should be unchanged
      expect(notificationPreferences.get().vibrationEnabled).toBe(true);
      expect(notificationPreferences.get().pushEnabled).toBe(false);
      expect(notificationPreferences.get().dailyRewardNotifications).toBe(true);
    });
  });
});
