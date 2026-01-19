/**
 * Unit Tests for Cookie Consent Store
 *
 * Tests the cookie consent state management:
 * 1. Initial state
 * 2. needsConsent() - Check if consent banner needed
 * 3. acceptAllCookies() - Accept all cookie categories
 * 4. declineCookies() - Decline non-necessary cookies
 * 5. saveCookiePreferences() - Save custom preferences
 * 6. isCategoryEnabled() - Check specific category status
 * 7. resetCookiePreferences() - Reset for testing
 *
 * User Story: PACK-053
 * Acceptance Criteria: Test cookie consent store functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  cookiePreferences,
  needsConsent,
  acceptAllCookies,
  declineCookies,
  saveCookiePreferences,
  isCategoryEnabled,
  resetCookiePreferences,
  type CookieConsent,
  type CookieCategory,
  type CookiePreferences,
} from '@/stores/cookies';

// localStorage is already mocked globally in tests/setup.ts
// No need to define our own mock

// Default preferences for reset
const DEFAULT_PREFERENCES: CookiePreferences = {
  consent: 'pending',
  categories: {
    necessary: true,
    analytics: false,
    marketing: false,
  },
  timestamp: null,
};

describe('Cookie Consent Store', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    cookiePreferences.set(DEFAULT_PREFERENCES);
    // localStorage is cleared in setup.ts
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have consent as pending initially', () => {
      const prefs = cookiePreferences.get();
      expect(prefs.consent).toBe('pending');
    });

    it('should have necessary cookies enabled by default', () => {
      const prefs = cookiePreferences.get();
      expect(prefs.categories.necessary).toBe(true);
    });

    it('should have analytics cookies disabled by default', () => {
      const prefs = cookiePreferences.get();
      expect(prefs.categories.analytics).toBe(false);
    });

    it('should have marketing cookies disabled by default', () => {
      const prefs = cookiePreferences.get();
      expect(prefs.categories.marketing).toBe(false);
    });

    it('should have null timestamp initially', () => {
      const prefs = cookiePreferences.get();
      expect(prefs.timestamp).toBeNull();
    });
  });

  describe('needsConsent()', () => {
    it('should return true when consent is pending', () => {
      expect(needsConsent()).toBe(true);
    });

    it('should return false when consent is accepted', () => {
      acceptAllCookies();
      expect(needsConsent()).toBe(false);
    });

    it('should return false when consent is declined', () => {
      declineCookies();
      expect(needsConsent()).toBe(false);
    });
  });

  describe('acceptAllCookies()', () => {
    it('should set consent to accepted', () => {
      acceptAllCookies();

      const prefs = cookiePreferences.get();
      expect(prefs.consent).toBe('accepted');
    });

    it('should enable all cookie categories', () => {
      acceptAllCookies();

      const prefs = cookiePreferences.get();
      expect(prefs.categories.necessary).toBe(true);
      expect(prefs.categories.analytics).toBe(true);
      expect(prefs.categories.marketing).toBe(true);
    });

    it('should set timestamp', () => {
      const beforeAccept = Date.now();
      acceptAllCookies();
      const afterAccept = Date.now();

      const prefs = cookiePreferences.get();
      expect(prefs.timestamp).toBeGreaterThanOrEqual(beforeAccept);
      expect(prefs.timestamp).toBeLessThanOrEqual(afterAccept);
    });

    it('should update needsConsent to false', () => {
      expect(needsConsent()).toBe(true);

      acceptAllCookies();

      expect(needsConsent()).toBe(false);
    });
  });

  describe('declineCookies()', () => {
    it('should set consent to declined', () => {
      declineCookies();

      const prefs = cookiePreferences.get();
      expect(prefs.consent).toBe('declined');
    });

    it('should keep necessary cookies enabled', () => {
      declineCookies();

      const prefs = cookiePreferences.get();
      expect(prefs.categories.necessary).toBe(true);
    });

    it('should disable analytics cookies', () => {
      // First accept all
      acceptAllCookies();
      expect(cookiePreferences.get().categories.analytics).toBe(true);

      // Then decline
      declineCookies();

      const prefs = cookiePreferences.get();
      expect(prefs.categories.analytics).toBe(false);
    });

    it('should disable marketing cookies', () => {
      // First accept all
      acceptAllCookies();
      expect(cookiePreferences.get().categories.marketing).toBe(true);

      // Then decline
      declineCookies();

      const prefs = cookiePreferences.get();
      expect(prefs.categories.marketing).toBe(false);
    });

    it('should set timestamp', () => {
      const beforeDecline = Date.now();
      declineCookies();
      const afterDecline = Date.now();

      const prefs = cookiePreferences.get();
      expect(prefs.timestamp).toBeGreaterThanOrEqual(beforeDecline);
      expect(prefs.timestamp).toBeLessThanOrEqual(afterDecline);
    });

    it('should update needsConsent to false', () => {
      expect(needsConsent()).toBe(true);

      declineCookies();

      expect(needsConsent()).toBe(false);
    });
  });

  describe('saveCookiePreferences()', () => {
    it('should save custom category preferences', () => {
      saveCookiePreferences({
        analytics: true,
        marketing: false,
      });

      const prefs = cookiePreferences.get();
      expect(prefs.categories.analytics).toBe(true);
      expect(prefs.categories.marketing).toBe(false);
    });

    it('should set consent to accepted', () => {
      saveCookiePreferences({ analytics: true });

      const prefs = cookiePreferences.get();
      expect(prefs.consent).toBe('accepted');
    });

    it('should always keep necessary cookies enabled', () => {
      // Try to disable necessary (should be ignored)
      saveCookiePreferences({
        necessary: false,
        analytics: true,
      });

      const prefs = cookiePreferences.get();
      expect(prefs.categories.necessary).toBe(true);
    });

    it('should set timestamp', () => {
      const beforeSave = Date.now();
      saveCookiePreferences({ analytics: true });
      const afterSave = Date.now();

      const prefs = cookiePreferences.get();
      expect(prefs.timestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(prefs.timestamp).toBeLessThanOrEqual(afterSave);
    });

    it('should preserve existing preferences not specified', () => {
      // First set both
      saveCookiePreferences({
        analytics: true,
        marketing: true,
      });

      // Then only update analytics
      saveCookiePreferences({ analytics: false });

      const prefs = cookiePreferences.get();
      expect(prefs.categories.analytics).toBe(false);
      expect(prefs.categories.marketing).toBe(true);
    });

    it('should handle empty preferences object', () => {
      saveCookiePreferences({});

      const prefs = cookiePreferences.get();
      expect(prefs.consent).toBe('accepted');
      expect(prefs.categories.necessary).toBe(true);
    });
  });

  describe('isCategoryEnabled()', () => {
    it('should return true for necessary category', () => {
      expect(isCategoryEnabled('necessary')).toBe(true);
    });

    it('should return false for analytics when not accepted', () => {
      expect(isCategoryEnabled('analytics')).toBe(false);
    });

    it('should return false for marketing when not accepted', () => {
      expect(isCategoryEnabled('marketing')).toBe(false);
    });

    it('should return true for analytics after accepting all', () => {
      acceptAllCookies();
      expect(isCategoryEnabled('analytics')).toBe(true);
    });

    it('should return true for marketing after accepting all', () => {
      acceptAllCookies();
      expect(isCategoryEnabled('marketing')).toBe(true);
    });

    it('should return false for analytics after declining', () => {
      acceptAllCookies();
      declineCookies();
      expect(isCategoryEnabled('analytics')).toBe(false);
    });

    it('should reflect custom preferences', () => {
      saveCookiePreferences({
        analytics: true,
        marketing: false,
      });

      expect(isCategoryEnabled('analytics')).toBe(true);
      expect(isCategoryEnabled('marketing')).toBe(false);
    });

    it('should always return true for necessary', () => {
      declineCookies();
      expect(isCategoryEnabled('necessary')).toBe(true);

      acceptAllCookies();
      expect(isCategoryEnabled('necessary')).toBe(true);
    });
  });

  describe('resetCookiePreferences()', () => {
    it('should reset consent to pending', () => {
      acceptAllCookies();
      expect(cookiePreferences.get().consent).toBe('accepted');

      resetCookiePreferences();

      expect(cookiePreferences.get().consent).toBe('pending');
    });

    it('should reset categories to defaults', () => {
      acceptAllCookies();

      resetCookiePreferences();

      const prefs = cookiePreferences.get();
      expect(prefs.categories.necessary).toBe(true);
      expect(prefs.categories.analytics).toBe(false);
      expect(prefs.categories.marketing).toBe(false);
    });

    it('should reset timestamp to null', () => {
      acceptAllCookies();
      expect(cookiePreferences.get().timestamp).not.toBeNull();

      resetCookiePreferences();

      expect(cookiePreferences.get().timestamp).toBeNull();
    });

    it('should make needsConsent return true', () => {
      acceptAllCookies();
      expect(needsConsent()).toBe(false);

      resetCookiePreferences();

      expect(needsConsent()).toBe(true);
    });
  });

  describe('Store Reactivity', () => {
    it('should notify subscribers when preferences change', () => {
      let callCount = 0;
      const unsubscribe = cookiePreferences.subscribe(() => {
        callCount++;
      });

      acceptAllCookies();

      expect(callCount).toBeGreaterThan(0);

      unsubscribe();
    });

    it('should notify on decline', () => {
      let lastConsent: CookieConsent = 'pending';
      const unsubscribe = cookiePreferences.subscribe((prefs) => {
        lastConsent = prefs.consent;
      });

      declineCookies();

      expect(lastConsent).toBe('declined');

      unsubscribe();
    });

    it('should notify on save custom preferences', () => {
      let lastAnalytics = false;
      const unsubscribe = cookiePreferences.subscribe((prefs) => {
        lastAnalytics = prefs.categories.analytics;
      });

      saveCookiePreferences({ analytics: true });

      expect(lastAnalytics).toBe(true);

      unsubscribe();
    });
  });

  describe('Consent Flow Scenarios', () => {
    it('should handle accept -> decline flow', () => {
      // User initially accepts
      acceptAllCookies();
      expect(isCategoryEnabled('analytics')).toBe(true);
      expect(isCategoryEnabled('marketing')).toBe(true);

      // User changes mind and declines
      declineCookies();
      expect(isCategoryEnabled('analytics')).toBe(false);
      expect(isCategoryEnabled('marketing')).toBe(false);
    });

    it('should handle decline -> accept flow', () => {
      // User initially declines
      declineCookies();
      expect(isCategoryEnabled('analytics')).toBe(false);

      // User changes mind and accepts all
      acceptAllCookies();
      expect(isCategoryEnabled('analytics')).toBe(true);
    });

    it('should handle partial acceptance', () => {
      // User wants analytics but not marketing
      saveCookiePreferences({
        analytics: true,
        marketing: false,
      });

      expect(isCategoryEnabled('analytics')).toBe(true);
      expect(isCategoryEnabled('marketing')).toBe(false);
      expect(needsConsent()).toBe(false);
    });

    it('should handle reset and re-accept flow', () => {
      acceptAllCookies();
      resetCookiePreferences();
      acceptAllCookies();

      const prefs = cookiePreferences.get();
      expect(prefs.consent).toBe('accepted');
      expect(prefs.categories.analytics).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consent changes', () => {
      expect(() => {
        for (let i = 0; i < 10; i++) {
          acceptAllCookies();
          declineCookies();
          resetCookiePreferences();
        }
      }).not.toThrow();
    });

    it('should maintain necessary cookies through all operations', () => {
      acceptAllCookies();
      expect(isCategoryEnabled('necessary')).toBe(true);

      declineCookies();
      expect(isCategoryEnabled('necessary')).toBe(true);

      saveCookiePreferences({ necessary: false });
      expect(isCategoryEnabled('necessary')).toBe(true);

      resetCookiePreferences();
      expect(isCategoryEnabled('necessary')).toBe(true);
    });

    it('should handle multiple accept calls', () => {
      acceptAllCookies();
      const timestamp1 = cookiePreferences.get().timestamp;

      acceptAllCookies();
      const timestamp2 = cookiePreferences.get().timestamp;

      // Both should be accepted
      expect(cookiePreferences.get().consent).toBe('accepted');
      // Timestamps may be same or different depending on timing
      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1!);
    });

    it('should handle multiple decline calls', () => {
      declineCookies();
      declineCookies();
      declineCookies();

      expect(cookiePreferences.get().consent).toBe('declined');
    });

    it('should preserve data integrity across operations', () => {
      saveCookiePreferences({ analytics: true });
      const firstTimestamp = cookiePreferences.get().timestamp;

      saveCookiePreferences({ marketing: true });

      const prefs = cookiePreferences.get();
      expect(prefs.categories.analytics).toBe(true);
      expect(prefs.categories.marketing).toBe(true);
      expect(prefs.timestamp).toBeGreaterThanOrEqual(firstTimestamp!);
    });
  });

  describe('CookieCategory Type Coverage', () => {
    it('should support all cookie categories', () => {
      const categories: CookieCategory[] = ['necessary', 'analytics', 'marketing'];

      categories.forEach((category) => {
        const result = isCategoryEnabled(category);
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('CookieConsent Type Coverage', () => {
    it('should support all consent states', () => {
      const validStates: CookieConsent[] = ['pending', 'accepted', 'declined'];

      validStates.forEach((state) => {
        cookiePreferences.set({
          ...DEFAULT_PREFERENCES,
          consent: state,
        });

        expect(cookiePreferences.get().consent).toBe(state);
      });
    });
  });

  describe('GDPR Compliance', () => {
    it('should not enable non-necessary cookies without consent', () => {
      // Initial state should have only necessary cookies
      expect(isCategoryEnabled('necessary')).toBe(true);
      expect(isCategoryEnabled('analytics')).toBe(false);
      expect(isCategoryEnabled('marketing')).toBe(false);
    });

    it('should allow users to decline all non-necessary cookies', () => {
      declineCookies();

      expect(isCategoryEnabled('necessary')).toBe(true);
      expect(isCategoryEnabled('analytics')).toBe(false);
      expect(isCategoryEnabled('marketing')).toBe(false);
    });

    it('should allow users to change preferences at any time', () => {
      // Initial decline
      declineCookies();
      expect(needsConsent()).toBe(false);

      // Change to accept
      acceptAllCookies();
      expect(isCategoryEnabled('analytics')).toBe(true);

      // Change to custom
      saveCookiePreferences({ analytics: false, marketing: true });
      expect(isCategoryEnabled('analytics')).toBe(false);
      expect(isCategoryEnabled('marketing')).toBe(true);
    });

    it('should record timestamp of consent', () => {
      acceptAllCookies();

      const prefs = cookiePreferences.get();
      expect(prefs.timestamp).not.toBeNull();
      expect(typeof prefs.timestamp).toBe('number');
    });

    it('should track consent status explicitly', () => {
      expect(cookiePreferences.get().consent).toBe('pending');

      acceptAllCookies();
      expect(cookiePreferences.get().consent).toBe('accepted');

      declineCookies();
      expect(cookiePreferences.get().consent).toBe('declined');
    });
  });
});
