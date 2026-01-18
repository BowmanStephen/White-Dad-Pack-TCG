/**
 * Tests for profile name sanitization (SEC-001)
 *
 * User Story: Sanitize user input in profile names
 * - Escape HTML in display names
 * - Limit name length to 20 characters
 * - Filter profanity (basic list)
 */

import { describe, it, expect } from 'vitest';
import { escapeHtml, filterProfanity, sanitizeProfileName } from '@/lib/security';

describe('Security: Profile Name Sanitization (SEC-001)', () => {
  describe('escapeHtml', () => {
    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape less than signs', () => {
      expect(escapeHtml('Hello<World')).toBe('Hello&lt;World');
    });

    it('should escape greater than signs', () => {
      expect(escapeHtml('Hello>World')).toBe('Hello&gt;World');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("It's great")).toBe('It&#39;s great');
    });

    it('should escape forward slashes', () => {
      expect(escapeHtml('test/path')).toBe('test&#x2F;path');
    });

    it('should escape multiple special characters', () => {
      expect(escapeHtml('<script>alert("XSS")</script>')).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle string with no special characters', () => {
      expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
    });
  });

  describe('filterProfanity', () => {
    it('should filter common profanity with asterisks', () => {
      expect(filterProfanity('What the fuck')).toBe('What the ****');
    });

    it('should filter multiple profane words', () => {
      expect(filterProfanity('Damn this shit')).toBe('**** this ****');
    });

    it('should be case insensitive', () => {
      expect(filterProfanity('FUCK this')).toBe('**** this');
    });

    it('should filter profanity variations', () => {
      expect(filterProfanity('fuk this')).toBe('*** this');
    });

    it('should not filter non-profane words', () => {
      expect(filterProfanity('Hello World')).toBe('Hello World');
    });

    it('should handle empty string', () => {
      expect(filterProfanity('')).toBe('');
    });

    it('should handle mixed profanity and clean text', () => {
      expect(filterProfanity('This is damn good')).toBe('This is **** good');
    });

    it('should preserve word boundaries', () => {
      expect(filterProfanity('assassin')).not.toBe('*******in'); // 'ass' is a substring but not a word
    });
  });

  describe('sanitizeProfileName', () => {
    it('should trim whitespace', () => {
      expect(sanitizeProfileName('  TestName  ')).toBe('TestName');
    });

    it('should limit to 20 characters', () => {
      const longName = 'ThisIsAVeryLongNameThatExceedsTwentyCharacters';
      expect(sanitizeProfileName(longName)).toHaveLength(20);
      expect(sanitizeProfileName(longName)).toBe('ThisIsAVeryLongNameT');
    });

    it('should escape HTML', () => {
      expect(sanitizeProfileName('<script>')).toBe('&lt;script&gt;');
    });

    it('should filter profanity', () => {
      expect(sanitizeProfileName('Damn Name')).toBe('**** Name');
    });

    it('should apply all sanitizations in correct order', () => {
      // 1. Trim whitespace
      // 2. Filter profanity (before HTML escaping)
      // 3. Escape HTML
      // 4. Limit to 20 chars
      const result = sanitizeProfileName('  <Test>Damn Name  ');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('Damn');
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('should handle emoji in names', () => {
      expect(sanitizeProfileName('Dad 🍖')).toBe('Dad 🍖');
    });

    it('should escape HTML in emoji names', () => {
      expect(sanitizeProfileName('Dad<script>🍖')).toBe('Dad&lt;script&gt;🍖');
    });

    it('should handle empty string', () => {
      expect(sanitizeProfileName('')).toBe('');
    });

    it('should preserve valid characters', () => {
      expect(sanitizeProfileName('Test-Name_123')).toBe('Test-Name_123');
    });

    it('should truncate after applying other transformations', () => {
      // Long name with HTML that needs escaping
      const longName = '<script>'.repeat(10); // Very long when escaped
      const result = sanitizeProfileName(longName);
      expect(result.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Integration: Real-world scenarios', () => {
    it('should sanitize XSS attempt', () => {
      const malicious = '<img src=x onerror=alert("XSS")>';
      const result = sanitizeProfileName(malicious);
      expect(result).not.toContain('<img');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    it('should sanitize profanity with HTML', () => {
      const result = sanitizeProfileName('<b>Fuck</b>');
      expect(result).not.toContain('Fuck');
      expect(result).not.toContain('<b>');
      expect(result).not.toContain('</b>');
      expect(result).toContain('****'); // Should have asterisks
    });

    it('should handle long profane names', () => {
      const longProfane = 'ThisIsAVeryLongProfaneNameWithShitInIt';
      const result = sanitizeProfileName(longProfane);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).not.toContain('Shit');
    });

    it('should preserve emoji in short names', () => {
      expect(sanitizeProfileName('Cool Dad 😎')).toBe('Cool Dad 😎');
    });

    it('should trim and escape HTML', () => {
      expect(sanitizeProfileName('  <Test>Name  ')).toBe('&lt;Test&gt;Name');
    });
  });
});
