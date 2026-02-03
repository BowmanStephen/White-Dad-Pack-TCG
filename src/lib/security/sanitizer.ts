/**
 * Security - Input Sanitization Utilities
 *
 * Provides XSS prevention and input sanitization for DadDeck TCG.
 * Implements Content Security Policy compliant sanitization.
 *
 * @package security
 */

import DOMPurify from 'dompurify';

/**
 * DOMPurify configuration for DadDeck security requirements
 *
 * ALLOWED_TAGS: Minimal HTML for card descriptions and UI text
 * ALLOWED_ATTR: Safe attributes that don't enable XSS
 *
 * Security decisions:
 * - No <script>, <iframe>, <object>, <embed> (XSS vectors)
 * - No onclick, onerror, onload (event handler XSS)
 * - No data: or javascript: URLs (URI-based XSS)
 * - Limited to safe formatting tags: <b>, <i>, <em>, <strong>, <p>, <br>
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],
  ALLOWED_ATTR: ['class'],
  ALLOW_DATA_ATTR: false,
  SAFE_FOR_TEMPLATES: true,
};

/**
 * Sanitize HTML string to prevent XSS attacks
 *
 * Use this for ANY user-generated content that will be rendered as HTML:
 * - Search queries (if they contain HTML)
 * - User-entered deck names
 * - Custom card descriptions
 * - Trade notes or messages
 *
 * @param input - Potentially unsafe HTML string
 * @param strict - Use strict mode (fewer allowed tags) for highly sensitive inputs
 * @returns Sanitized HTML safe to render
 *
 * @example
 * ```ts
 * const userInput = '<script>alert("XSS")</script>Hello';
 * const safe = sanitizeHTML(userInput); // "Hello"
 * ```
 */
export function sanitizeHTML(input: string, strict: boolean = false): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // SSR-safe: if DOMPurify is not available, use fallback
  if (typeof DOMPurify === 'undefined' || typeof DOMPurify.sanitize !== 'function') {
    // Fallback: escape all HTML
    return escapeHTML(input);
  }

  const config = strict
    ? { ALLOWED_TAGS: [], ALLOWED_ATTR: [], KEEP_CONTENT: true } // Strip ALL HTML but keep text content in strict mode
    : SANITIZE_CONFIG;

  return DOMPurify.sanitize(input, config);
}

/**
 * Sanitize a text string by escaping HTML entities
 *
 * Use this for plain text that should NEVER contain HTML:
 * - Card names
 * - User display names
 * - Stat labels
 * - Form inputs (text, textarea)
 *
 * This is more restrictive than sanitizeHTML() and should be used
 * when you want to display text exactly as entered without any formatting.
 *
 * @param input - Potentially unsafe string
 * @returns Text with HTML entities escaped
 *
 * @example
 * ```ts
 * const userInput = '<img src=x onerror=alert(1)>';
 * const safe = escapeHTML(userInput); // "&lt;img src=x onerror=alert(1)&gt;"
 * ```
 */
export function escapeHTML(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Always use manual escaping for consistency across environments
  // This ensures consistent behavior in SSR, browser, and test environments
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize a filename/path component
 *
 * Use this for user-provided filenames or paths to prevent path traversal:
 * - Uploaded card images
 * - Export files
 * - Custom deck imports
 *
 * @param filename - User-provided filename
 * @returns Sanitized filename safe for filesystem use
 *
 * @example
 * ```ts
 * const userInput = '../../etc/passwd';
 * const safe = sanitizeFilename(userInput); // "....etcpasswd"
 * // or with extension: "safe-export.json"
 * ```
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed';
  }

  // Remove path traversal attempts
  let sanitized = filename.replace(/[\\/]/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Limit length (255 is common filesystem limit)
  if (sanitized.length > 200) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 190);
    sanitized = ext ? `${name}.${ext}` : name;
  }

  // Remove leading dots (hidden files on Unix)
  sanitized = sanitized.replace(/^\.+/, '');

  return sanitized || 'unnamed';
}

/**
 * Sanitize a URL to prevent javascript: and data: attacks
 *
 * Use this for user-provided URLs:
 * - Avatar images
 * - Card artwork URLs
 * - Social media links
 *
 * @param url - User-provided URL
 * @returns Sanitized URL or empty string if unsafe
 *
 * @example
 * ```ts
 * const userInput = 'javascript:alert(1)';
 * const safe = sanitizeURL(userInput); // ""
 *
 * const valid = 'https://example.com/image.png';
 * sanitizeURL(valid); // "https://example.com/image.png"
 * ```
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsed = new URL(url);

    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.href;
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Validate and sanitize JSON data
 *
 * Use this for JSON imports (custom decks, card data, etc.):
 * - Prevents prototype pollution
 * - Validates structure
 * - Sanitizes string values
 *
 * @param json - JSON string to validate
 * @param schema - Optional schema validation function
 * @returns Parsed and sanitized object, or null if invalid
 *
 * @example
 * ```ts
 * const userInput = '{"name":"<script>alert(1)</script>"}';
 * const data = validateJSON(userInput);
 * // data = { name: "alert(1)" } (script tags removed)
 * ```
 */
export function validateJSON<T = unknown>(
  json: string,
  schema?: (data: unknown) => data is T
): T | null {
  if (!json || typeof json !== 'string') {
    return null;
  }

  try {
    // Prevent prototype pollution via JSON.parse
    const data = JSON.parse(json) as T;

    // Run schema validation if provided
    if (schema && !schema(data)) {
      return null;
    }

    // Recursively sanitize all string properties
    return sanitizeObject(data) as T;
  } catch {
    return null;
  }
}

/**
 * Recursively sanitize an object's string properties
 *
 * @internal
 */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return escapeHTML(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      sanitized[key] = sanitizeObject(value);
    }

    return sanitized;
  }

  return obj;
}

/**
 * Sanitize a search query for safe rendering
 *
 * Search queries need special handling:
 * 1. Preserve special characters for search (*, ?, etc.)
 * 2. Escape HTML for rendering
 * 3. Remove control characters
 *
 * @param query - Search query string
 * @returns Sanitized query safe for search and display
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove control characters (except tab, newline, carriage return)
  /* eslint-disable no-control-regex */
  const controlCharsRegex = new RegExp(
    '[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]',
    'g'
  );
  /* eslint-enable no-control-regex */
  let sanitized = query.replace(controlCharsRegex, '');

  // Limit length (prevent DoS via massive queries)
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }

  // Escape HTML for display
  return escapeHTML(sanitized);
}

/**
 * Content Security Policy header configuration
 *
 * Generates CSP headers for deployment platforms (Vercel, Netlify, etc.)
 *
 * @returns CSP header value
 */
export function getCSPHeader(): string {
  return [
    "default-src 'self'", // Only allow resources from same origin
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Scripts from same origin, allow inline for Svelte
    "style-src 'self' 'unsafe-inline'", // Styles from same origin, allow inline for Tailwind
    "img-src 'self' data: blob: https://*", // Images from same origin, data URLs, and any HTTPS
    "font-src 'self' data:", // Fonts from same origin and data URLs
    "connect-src 'self' https://api.github.com", // API connections
    "frame-src 'none'", // Block all iframes
    "object-src 'none'", // Block plugins (Flash, etc.)
    "base-uri 'self'", // Restrict <base> tag
    "form-action 'self'", // Restrict form submissions
    "frame-ancestors 'none'", // Prevent clickjacking
  ].join('; ');
}

/**
 * Test XSS payload detection (for development/testing)
 *
 * @returns Array of XSS payloads that should be sanitized
 * @internal
 */
export const XSS_TEST_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)">',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
  '<body onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  '<select onfocus=alert(1) autofocus>',
  '<textarea onfocus=alert(1) autofocus>',
  '"><script>alert(document.cookie)</script>',
  '<script>document.location="http://evil.com"</script>',
  '<meta http-equiv="refresh" content="0;url=http://evil.com">',
];
