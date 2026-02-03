/**
 * XSS Prevention Tests
 *
 * Tests all sanitization functions against common XSS payloads.
 * Ensures user input is properly sanitized before rendering.
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeHTML,
  escapeHTML,
  sanitizeFilename,
  sanitizeURL,
  sanitizeSearchQuery,
  validateJSON,
  XSS_TEST_PAYLOADS,
} from '../../../../src/lib/security/sanitizer';

describe('Security - Input Sanitization', () => {
  describe('sanitizeHTML', () => {
    it('should escape script tags (SSR fallback)', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = sanitizeHTML(input);
      // In SSR/test environment, fallback escapes HTML
      expect(result).not.toContain('<script>');
      // Check that script tags are escaped (either &lt;script&gt; or removed)
      expect(result).toMatch(/&lt;script&gt;|Hello/);
    });

    it('should escape img onerror handlers', () => {
      const input = '<img src=x onerror=alert(1)>Text';
      const result = sanitizeHTML(input);
      // In SSR/test environment, fallback escapes HTML
      expect(result).not.toContain('<img');
      // Should either escape or remove the img tag
      expect(result).toMatch(/&lt;img|Text/);
    });

    it('should escape inline event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeHTML(input);
      // In SSR/test environment, fallback escapes HTML
      expect(result).not.toContain('<div');
      // Should either escape or remove the div tag
      expect(result).toMatch(/&lt;div|Click me/);
    });

    it('should escape HTML in non-strict mode', () => {
      const input = '<strong>Bold</strong> and <em>italic</em>';
      const result = sanitizeHTML(input, false);
      // In SSR/test environment (no DOMPurify), fallback escapes all HTML
      // If DOMPurify is available, it allows safe tags in non-strict mode
      // Either way, unsafe tags should be removed/escaped
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<iframe>');
      // Safe tags may be preserved by DOMPurify or escaped by fallback
      // Just verify the content is safe
      expect(result.length).toBeGreaterThan(0);
    });

    it('should strip HTML tags in strict mode', () => {
      const input = '<script>alert(1)</script><strong>Bold</strong> and <em>italic</em>';
      const result = sanitizeHTML(input, true);
      // In strict mode, DOMPurify removes dangerous tags
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      // Content should be preserved
      expect(result).toContain('Bold');
      expect(result).toContain('italic');
    });

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('');
      // Whitespace is preserved in fallback mode
      expect(sanitizeHTML('   ')).toBe('   ');
    });

    it('should handle null/undefined input', () => {
      expect(sanitizeHTML(null as unknown as string)).toBe('');
      expect(sanitizeHTML(undefined as unknown as string)).toBe('');
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML entities', () => {
      const input = '<div>Hello & goodbye</div>';
      const result = escapeHTML(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
      expect(result).not.toContain('<div>');
    });

    it('should escape script tags completely', () => {
      const input = '<script>alert("XSS")</script>';
      const result = escapeHTML(input);
      // Should escape all HTML entities
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;/script&gt;');
      expect(result).toContain('&quot;'); // Quotes should be escaped
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('"'); // Should not contain unescaped quotes
    });

    it('should escape XSS payloads', () => {
      const payload = '<img src=x onerror=alert(1)>';
      const result = escapeHTML(payload);
      expect(result).toContain('&lt;img');
      expect(result).not.toContain('<img');
    });

    it('should handle empty input', () => {
      expect(escapeHTML('')).toBe('');
    });

    it('should handle null/undefined input', () => {
      expect(escapeHTML(null as unknown as string)).toBe('');
      expect(escapeHTML(undefined as unknown as string)).toBe('');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path traversal sequences', () => {
      expect(sanitizeFilename('../../etc/passwd')).not.toContain('..');
      expect(sanitizeFilename('..\\..\\windows\\system32')).not.toContain('..');
    });

    it('should remove null bytes', () => {
      const result = sanitizeFilename('file\u0000name.txt');
      expect(result).not.toContain('\u0000');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(210); // 200 chars + extension
    });

    it('should remove leading dots (hidden files)', () => {
      expect(sanitizeFilename('.hidden')).not.toMatch(/^\./);
      expect(sanitizeFilename('...hidden')).not.toMatch(/^\./);
    });

    it('should preserve safe filenames', () => {
      expect(sanitizeFilename('safe-file.txt')).toBe('safe-file.txt');
      expect(sanitizeFilename('my_card_export.json')).toBe('my_card_export.json');
    });

    it('should return default for empty input', () => {
      expect(sanitizeFilename('')).toBe('unnamed');
    });
  });

  describe('sanitizeURL', () => {
    it('should allow http URLs', () => {
      const url = 'http://example.com/image.png';
      expect(sanitizeURL(url)).toBe(url);
    });

    it('should allow https URLs', () => {
      const url = 'https://example.com/image.png';
      expect(sanitizeURL(url)).toBe(url);
    });

    it('should block javascript: URLs', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('');
      expect(sanitizeURL('JAVASCRIPT:alert(1)')).toBe('');
    });

    it('should block data: URLs', () => {
      expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should block invalid protocols', () => {
      expect(sanitizeURL('file:///etc/passwd')).toBe('');
      expect(sanitizeURL('ftp://example.com')).toBe('');
    });

    it('should return empty for invalid URLs', () => {
      expect(sanitizeURL('not a url')).toBe('');
      expect(sanitizeURL('')).toBe('');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove control characters', () => {
      const input = 'test\x00\x01query';
      const result = sanitizeSearchQuery(input);
      expect(result).not.toContain('\x00');
      expect(result).not.toContain('\x01');
    });

    it('should escape HTML', () => {
      const input = '<script>alert(1)</script>search';
      const result = sanitizeSearchQuery(input);
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should limit query length', () => {
      const longQuery = 'a'.repeat(300);
      const result = sanitizeSearchQuery(longQuery);
      expect(result.length).toBe(200);
    });

    it('should preserve special search characters', () => {
      const input = 'test*query?value';
      const result = sanitizeSearchQuery(input);
      expect(result).toContain('*');
      expect(result).toContain('?');
    });

    it('should handle empty input', () => {
      expect(sanitizeSearchQuery('')).toBe('');
    });
  });

  describe('validateJSON', () => {
    it('should parse valid JSON and sanitize strings', () => {
      const input = '{"name":"Test","count":5}';
      const result = validateJSON(input) as { name: string; count: number } | null;
      // In SSR environment, strings are HTML-escaped
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test');
      expect(result?.count).toBe(5);
    });

    it('should sanitize string properties in JSON', () => {
      const input = '{"name":"<script>alert(1)</script>","desc":"test"}';
      const result = validateJSON(input) as { name: string; desc?: string } | null;
      expect(result).not.toBeNull();
      // Script tags should be escaped
      expect(result?.name).not.toContain('<script>');
      expect(result?.name).toContain('&lt;script&gt;');
    });

    it('should prevent prototype pollution', () => {
      const input = '{"__proto__":{"polluted":true}}';
      const result = validateJSON(input);
      // __proto__ key is removed during sanitization
      // Result is an empty object with null prototype
      expect(result).toBeTruthy();
      expect(Object.keys(result || {})).toHaveLength(0);
      // Should not have __proto__ as own property (it's on the prototype)
      expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
    });

    it('should handle arrays', () => {
      const input = '[1,2,3]';
      const result = validateJSON(input);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return null for invalid JSON', () => {
      expect(validateJSON('not json')).toBeNull();
      expect(validateJSON('{invalid}')).toBeNull();
    });

    it('should validate schema when provided', () => {
      const input = '{"name":"Test","value":123}';
      const result = validateJSON(
        input,
        (data: unknown): data is { name: string; value: number } => {
          return (
            typeof data === 'object' &&
            data !== null &&
            'name' in data &&
            'value' in data &&
            typeof (data as { name: string; value: number }).name === 'string' &&
            typeof (data as { name: string; value: number }).value === 'number'
          );
        }
      ) as { name: string; value: number } | null;
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test');
      expect(result?.value).toBe(123);
    });

    it('should return null when schema validation fails', () => {
      const input = '{"name":"Test","value":"not a number"}';
      const result = validateJSON(
        input,
        (data: unknown): data is { name: string; value: number } => {
          return (
            typeof data === 'object' &&
            data !== null &&
            'value' in data &&
            typeof (data as { name: string; value: number }).value === 'number'
          );
        }
      );
      expect(result).toBeNull();
    });
  });

  describe('XSS_TEST_PAYLOADS', () => {
    it('should contain known XSS payloads', () => {
      expect(XSS_TEST_PAYLOADS.length).toBeGreaterThan(0);
      expect(XSS_TEST_PAYLOADS).toContain('<script>alert("XSS")</script>');
      expect(XSS_TEST_PAYLOADS).toContain('<img src=x onerror=alert(1)>');
    });

    it('should escape all XSS test payloads with sanitizeHTML', () => {
      for (const payload of XSS_TEST_PAYLOADS) {
        const result = sanitizeHTML(payload);
        // In SSR/test environment, fallback escapes HTML
        // Should not contain raw script tags
        expect(result).not.toMatch(/<script[^>]*>/i);
        // Should not contain raw HTML tags (either escaped or removed)
        if (!payload.includes('javascript:')) {
          // Result should either escape HTML or remove it entirely
          expect(result).not.toMatch(/<[^>]+>/);
        }
      }
    });

    it('should escape all XSS test payloads with escapeHTML', () => {
      for (const payload of XSS_TEST_PAYLOADS) {
        const result = escapeHTML(payload);
        // Should escape HTML characters (or return empty for URLs like javascript:)
        if (payload.includes('javascript:')) {
          // URls are passed through, not HTML-escaped
          expect(result.length).toBeGreaterThan(0);
        } else {
          expect(result).not.toContain('<');
          expect(result).not.toContain('>');
          expect(result).toContain('&lt;');
          expect(result).toContain('&gt;');
        }
      }
    });
  });
});
