/**
 * Browser detection utility
 * Provides safe access to browser APIs without SSR issues
 */

/**
 * Check if code is running in browser environment
 */
export const browser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Check if code is running in server environment
 */
export const server = !browser;

/**
 * Safe window access (returns null on server)
 */
export const getWindow = (): Window | null => {
  return browser ? window : null;
};

/**
 * Safe document access (returns null on server)
 */
export const getDocument = (): Document | null => {
  return browser ? document : null;
};

/**
 * Safe localStorage access (returns null on server or if unavailable)
 */
export const getLocalStorage = (): Storage | null => {
  if (!browser) return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/**
 * Safe sessionStorage access (returns null on server or if unavailable)
 */
export const getSessionStorage = (): Storage | null => {
  if (!browser) return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/**
 * Safe navigator access (returns null on server)
 */
export const getNavigator = (): Navigator | null => {
  return browser ? navigator : null;
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  const storage = getLocalStorage();
  return storage !== null;
};

/**
 * Check if sessionStorage is available
 */
export const isSessionStorageAvailable = (): boolean => {
  const storage = getSessionStorage();
  return storage !== null;
};

/**
 * Check if service worker is supported
 */
export const isServiceWorkerSupported = (): boolean => {
  return browser && 'serviceWorker' in navigator;
};

/**
 * Check if notification API is supported
 */
export const isNotificationSupported = (): boolean => {
  return browser && 'Notification' in window;
};

/**
 * Check if device orientation is supported
 */
export const isDeviceOrientationSupported = (): boolean => {
  return browser && 'DeviceOrientationEvent' in window;
};
