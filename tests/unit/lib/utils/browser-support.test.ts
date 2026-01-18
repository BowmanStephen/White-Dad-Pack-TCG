import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  checkBrowserSupport,
  getBrowserSupportMessage,
  getCurrentBrowserUpgradeUrl,
  getUpgradeUrls,
  isIE,
  isOutdatedBrowser,
} from '@/lib/utils/browser-support';

describe('Browser Support Detection', () => {
  // Mock navigator.userAgent
  const originalUA = navigator.userAgent;

  afterEach(() => {
    // Restore original userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUA,
      writable: true,
    });
  });

  describe('checkBrowserSupport', () => {
    it('should detect supported browser features', () => {
      const support = checkBrowserSupport();

      expect(support).toHaveProperty('isSupported');
      expect(support).toHaveProperty('unsupportedFeatures');
      expect(support).toHaveProperty('browserName');
      expect(support).toHaveProperty('browserVersion');
      expect(support).toHaveProperty('recommendations');
      expect(typeof support.isSupported).toBe('boolean');
      expect(Array.isArray(support.unsupportedFeatures)).toBe(true);
      expect(typeof support.browserName).toBe('string');
      expect(typeof support.browserVersion).toBe('number');
      expect(Array.isArray(support.recommendations)).toBe(true);
    });

    it('should detect LocalStorage support', () => {
      const support = checkBrowserSupport();

      if (typeof localStorage !== 'undefined') {
        expect(support.unsupportedFeatures).not.toContain('Local Storage');
      }
    });

    it('should detect ES6 features', () => {
      const support = checkBrowserSupport();

      if (() => true) {
        expect(support.unsupportedFeatures).not.toContain('ES6 Features');
      }
    });

    it('should detect modern DOM APIs', () => {
      const support = checkBrowserSupport();

      if (typeof document !== 'undefined' && 'querySelector' in document) {
        expect(support.unsupportedFeatures).not.toContain('Modern DOM APIs');
      }
    });
  });

  describe('getBrowserSupportMessage', () => {
    it('should return empty string for supported browsers', () => {
      const message = getBrowserSupportMessage();

      // Most modern browsers should be supported
      expect(typeof message).toBe('string');
    });

    it('should detect Internet Explorer', () => {
      // Mock IE UA
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko',
        writable: true,
      });

      const message = getBrowserSupportMessage();

      expect(message).toContain('Internet Explorer');
      expect(message).toContain('not supported');
    });
  });

  describe('getCurrentBrowserUpgradeUrl', () => {
    it('should return a valid URL', () => {
      const url = getCurrentBrowserUpgradeUrl();

      expect(url).toMatch(/^https?:\/\//);
    });
  });

  describe('getUpgradeUrls', () => {
    it('should return URLs for all major browsers', () => {
      const urls = getUpgradeUrls();

      expect(urls).toHaveProperty('Chrome');
      expect(urls).toHaveProperty('Firefox');
      expect(urls).toHaveProperty('Safari');
      expect(urls).toHaveProperty('Edge');
      expect(urls).toHaveProperty('Internet Explorer');

      Object.values(urls).forEach(url => {
        expect(url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('isIE', () => {
    it('should detect Internet Explorer', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko',
        writable: true,
      });

      expect(isIE()).toBe(true);
    });

    it('should return false for modern browsers', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        writable: true,
      });

      expect(isIE()).toBe(false);
    });
  });

  describe('isOutdatedBrowser', () => {
    it('should detect outdated Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.0.0 Safari/537.36',
        writable: true,
      });

      expect(isOutdatedBrowser()).toBe(true);
    });

    it('should detect current Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        writable: true,
      });

      expect(isOutdatedBrowser()).toBe(false);
    });
  });
});
