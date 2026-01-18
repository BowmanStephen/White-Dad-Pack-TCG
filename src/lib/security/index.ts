/**
 * Security Module Exports
 *
 * Centralizes all security-related utilities for DadDeck TCG.
 *
 * @package security
 */

export {
  sanitizeHTML,
  escapeHTML,
  sanitizeFilename,
  sanitizeURL,
  validateJSON,
  sanitizeSearchQuery,
  getCSPHeader,
  XSS_TEST_PAYLOADS,
} from './sanitizer';

export {
  validatePackBeforeOpen,
  detectDuplicatePack,
  validateRarityDistribution,
  detectStatisticalAnomalies,
  type ValidationResult,
  type ValidationViolation,
} from './pack-validator';
