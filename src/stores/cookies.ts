/**
 * Cookie Consent Store
 *
 * Manages user cookie preferences with LocalStorage persistence.
 * GDPR-compliant consent tracking.
 */

import { persistentAtom } from '@/lib/utils/persistent';

export type CookieConsent = 'pending' | 'accepted' | 'declined';
export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookiePreferences {
  consent: CookieConsent;
  categories: {
    necessary: boolean;      // Always true (required)
    analytics: boolean;      // Google Analytics, Plausible
    marketing: boolean;      // Future marketing cookies
  };
  timestamp: number | null;  // When consent was given
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  consent: 'pending',
  categories: {
    necessary: true,         // Required cookies always enabled
    analytics: false,
    marketing: false,
  },
  timestamp: null,
};

/**
 * Persistent store for cookie preferences
 * Encodes/decodes automatically with LocalStorage
 */
export const cookiePreferences = persistentAtom<CookiePreferences>(
  'daddeck-cookie-preferences',
  DEFAULT_PREFERENCES,
  {
    encode: (value) => JSON.stringify(value),
    decode: (value) => {
      try {
        const parsed = JSON.parse(value);
        // Ensure necessary cookies are always true
        if (parsed.categories) {
          parsed.categories.necessary = true;
        }
        return parsed;
      } catch {
        return DEFAULT_PREFERENCES;
      }
    },
  }
);

/**
 * Check if user needs to see cookie banner
 */
export const needsConsent = () => {
  const prefs = cookiePreferences.get();
  return prefs.consent === 'pending';
};

/**
 * Accept all cookies
 */
export const acceptAllCookies = () => {
  const prefs = cookiePreferences.get();
  cookiePreferences.set({
    ...prefs,
    consent: 'accepted',
    categories: {
      necessary: true,
      analytics: true,
      marketing: true,
    },
    timestamp: Date.now(),
  });
};

/**
 * Decline non-necessary cookies
 */
export const declineCookies = () => {
  const prefs = cookiePreferences.get();
  cookiePreferences.set({
    ...prefs,
    consent: 'declined',
    categories: {
      necessary: true,
      analytics: false,
      marketing: false,
    },
    timestamp: Date.now(),
  });
};

/**
 * Save custom preferences
 */
export const saveCookiePreferences = (categories: Partial<CookiePreferences['categories']>) => {
  const prefs = cookiePreferences.get();
  cookiePreferences.set({
    ...prefs,
    consent: 'accepted',
    categories: {
      ...prefs.categories,
      ...categories,
      necessary: true, // Always true
    },
    timestamp: Date.now(),
  });
};

/**
 * Check if specific category is enabled
 */
export const isCategoryEnabled = (category: CookieCategory): boolean => {
  const prefs = cookiePreferences.get();
  return prefs.categories[category];
};

/**
 * Reset preferences (for testing purposes)
 */
export const resetCookiePreferences = () => {
  cookiePreferences.set(DEFAULT_PREFERENCES);
};
