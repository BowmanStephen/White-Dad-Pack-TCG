/**
 * Security utility functions
 *
 * Common utilities for the anti-cheat system:
 * - Violation creation
 * - Device fingerprinting
 * - Hash generation
 */

import type { SecurityViolation, ViolationSeverity, ViolationType, DeviceFingerprint } from '../../types/security';

/**
 * Create a security violation record
 */
export function createSecurityViolation(
  type: ViolationType,
  severity: ViolationSeverity,
  details: Record<string, unknown>
): SecurityViolation {
  return {
    id: generateViolationId(),
    type,
    severity,
    timestamp: new Date(),
    details: details.message ? String(details.message) : JSON.stringify(details),
    metadata: details,
    fingerprint: details.fingerprint ? String(details.fingerprint) : 'unknown',
  };
}

/**
 * Generate a unique violation ID
 */
function generateViolationId(): string {
  return `viol_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a device fingerprint for identifying users/devices
 * This is a simplified version - in production, use a proper fingerprinting library
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const fingerprint: DeviceFingerprint = {
    browser: getBrowserInfo(),
    os: getOSInfo(),
    screen: getScreenInfo(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    canvas: await getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    audio: getAudioFingerprint(),
    hash: '', // Will be set after collecting all data
  };

  // Generate hash from collected data
  fingerprint.hash = await hashFingerprintData(fingerprint);

  return fingerprint;
}

/**
 * Get browser information
 */
function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Unknown';
}

/**
 * Get OS information
 */
function getOSInfo(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Unknown';
}

/**
 * Get screen information
 */
function getScreenInfo(): string {
  if (typeof screen === 'undefined') return 'unknown';
  return `${screen.width}x${screen.height}x${screen.colorDepth}`;
}

/**
 * Get canvas fingerprint
 * Creates a unique signature based on canvas rendering
 */
async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unavailable';

    // Draw some text and shapes
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('DadDeck TCG Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Security Check', 4, 45);

    // Get data URL and hash it
    const dataUrl = canvas.toDataURL();
    return simpleHash(dataUrl);
  } catch {
    return 'error';
  }
}

/**
 * Get WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    if (typeof document === 'undefined') return 'unavailable';

    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return 'unavailable';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return simpleHash(`${vendor}|${renderer}`);
  } catch {
    return 'error';
  }
}

/**
 * Get audio fingerprint
 */
function getAudioFingerprint(): string {
  try {
    const context = new AudioContext();
    const fingerprint = `${context.sampleRate}|${context.state}`;
    context.close();
    return simpleHash(fingerprint);
  } catch {
    return 'unavailable';
  }
}

/**
 * Simple hash function for fingerprint data
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Hash fingerprint data for storage
 */
async function hashFingerprintData(fingerprint: Omit<DeviceFingerprint, 'hash'>): Promise<string> {
  const data = JSON.stringify(fingerprint);
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if two fingerprints match
 */
export function fingerprintsMatch(fp1: string, fp2: string): boolean {
  return fp1 === fp2;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

/**
 * Validate pack ID format
 */
export function isValidPackId(id: string): boolean {
  // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Rate limit key generator
 */
export function generateRateLimitKey(action: string, identifier: string): string {
  return `ratelimit:${action}:${identifier}`;
}

/**
 * Time until a timestamp expires (in seconds)
 */
export function getSecondsUntil(expiresAt: Date): number {
  const ms = expiresAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Parse a date from various formats
 */
export function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge two objects (shallow merge)
 */
export function shallowMerge<T extends Record<string, unknown>>(a: T, b: Partial<T>): T {
  return { ...a, ...b };
}
