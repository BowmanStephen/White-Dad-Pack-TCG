/**
 * API Key Management System
 *
 * Generates, validates, and manages API keys for the DadDeck public API.
 *
 * Key format: ddpk_{environment}_{key}
 * - environment: live, test, dev
 * - key: 32-character cryptographically random string
 *
 * Example: ddpk_live_abc123def456789abc123def456789ab
 */

import type {
  ApiKey,
  ApiKeyStatus,
  ApiTier,
  ApiPermission,
  ApiUsageStats,
  ApiRateLimit,
} from '../../types/api';
import { API_TIER_CONFIGS } from '../../types/api';

/**
 * API key prefix
 */
const API_KEY_PREFIX = 'ddpk_';

/**
 * Storage key prefix
 */
const STORAGE_PREFIX = 'api_keys_';

/**
 * API key lengths
 */
const KEY_LENGTH = 32;
const KEY_ID_LENGTH = 8;

/**
 * Valid environments for API keys
 */
type KeyEnvironment = 'live' | 'test' | 'dev';

/**
 * Stored API key data (includes secret)
 */
interface StoredApiKey extends ApiKey {
  secret: string;                 // Full secret key (only shown once)
  keyId: string;                  // Short ID for lookup
  environment: KeyEnvironment;    // Environment
}

/**
 * API key storage (in memory + localStorage)
 */
interface ApiKeyStorage {
  keys: StoredApiKey[];
  nextKeyId: number;              // Counter for generating key IDs
}

/**
 * Generate a cryptographically random string
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
  const env: KeyEnvironment = 'live'; // Default to live
  const randomPart = generateRandomString(KEY_LENGTH);
  return `${API_KEY_PREFIX}${env}_${randomPart}`;
}

/**
 * Create a new API key with configuration
 */
export function createApiKey(params: {
  name: string;
  tier: ApiTier;
  permissions?: ApiPermission[];
  allowedOrigins?: string[];
  expiresAt?: Date;
}): ApiKey {
  const secret = generateApiKey();
  const keyId = generateRandomString(KEY_ID_LENGTH);
  const environment: KeyEnvironment = 'live';

  const now = new Date();
  const tierConfig = API_TIER_CONFIGS[params.tier];

  const apiKey: StoredApiKey = {
    key: truncateKey(secret),
    name: params.name,
    tier: params.tier,
    status: 'active',
    createdAt: now,
    expiresAt: params.expiresAt,
    rateLimit: tierConfig.rateLimit,
    usageStats: {
      totalRequests: 0,
      requestsThisMonth: 0,
      requestsToday: 0,
      lastReset: now,
    },
    allowedOrigins: params.allowedOrigins || [],
    permissions: params.permissions || tierConfig.permissions,
    secret, // Store full secret for initial return only
    keyId,
    environment,
  };

  // Store the key
  saveApiKey(apiKey);

  // Return without the secret (except in initial creation)
  const { secret: _, ...publicKey } = apiKey;
  return publicKey;
}

/**
 * Truncate API key for display (show first 8 and last 4 characters)
 */
function truncateKey(key: string): string {
  if (key.length <= 16) return key;
  return `${key.substring(0, 15)}...${key.substring(key.length - 4)}`;
}

/**
 * Validate an API key format
 */
export function validateApiKeyFormat(key: string): boolean {
  const pattern = /^ddpk_(live|test|dev)_[a-z0-9]{32}$/;
  return pattern.test(key);
}

/**
 * Parse an API key to extract components
 */
export function parseApiKey(key: string): {
  prefix: string;
  environment: KeyEnvironment;
  randomPart: string;
} | null {
  if (!validateApiKeyFormat(key)) {
    return null;
  }

  const parts = key.split('_');
  return {
    prefix: parts[0],
    environment: parts[1] as KeyEnvironment,
    randomPart: parts[2],
  };
}

/**
 * Look up an API key by its value
 */
export function lookupApiKey(key: string): ApiKey | null {
  if (!validateApiKeyFormat(key)) {
    return null;
  }

  const storage = getStorage();
  const found = storage.keys.find((k) => k.secret === key);

  if (!found) {
    return null;
  }

  // Check if expired
  if (found.expiresAt && new Date() > found.expiresAt) {
    revokeApiKey(found.keyId);
    return null;
  }

  // Check if suspended or revoked
  if (found.status !== 'active') {
    return null;
  }

  // Return without secret
  const { secret: _, ...publicKey } = found;
  return publicKey;
}

/**
 * Verify an API key has required permissions
 */
export function verifyApiKeyPermissions(
  key: string,
  requiredPermissions: ApiPermission[]
): { valid: boolean; missing?: ApiPermission[] } {
  const apiKey = lookupApiKey(key);

  if (!apiKey) {
    return { valid: false };
  }

  const missing = requiredPermissions.filter(
    (perm) => !apiKey.permissions.includes(perm) && !apiKey.permissions.includes('admin:full')
  );

  return {
    valid: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined,
  };
}

/**
 * Check rate limit for an API key
 */
export function checkApiRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
} {
  const apiKey = lookupApiKey(key);

  if (!apiKey) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 60000),
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Reset daily stats if new day
  if (apiKey.usageStats.lastReset < today) {
    resetUsageStats(key);
  }

  const remaining = Math.max(
    0,
    apiKey.rateLimit.requestsPerDay - apiKey.usageStats.requestsToday
  );

  return {
    allowed: remaining > 0,
    remaining,
    resetAt: new Date(today.getTime() + 86400000), // Tomorrow
  };
}

/**
 * Record an API request
 */
export function recordApiRequest(key: string): boolean {
  const rateLimit = checkApiRateLimit(key);

  if (!rateLimit.allowed) {
    return false;
  }

  const storage = getStorage();
  const apiKey = storage.keys.find((k) => k.secret === key);

  if (apiKey) {
    apiKey.usageStats.totalRequests++;
    apiKey.usageStats.requestsThisMonth++;
    apiKey.usageStats.requestsToday++;
    apiKey.lastUsedAt = new Date();
    saveStorage(storage);
  }

  return true;
}

/**
 * Revoke an API key
 */
export function revokeApiKey(keyId: string): boolean {
  const storage = getStorage();
  const index = storage.keys.findIndex((k) => k.keyId === keyId);

  if (index === -1) {
    return false;
  }

  storage.keys[index].status = 'revoked';
  saveStorage(storage);
  return true;
}

/**
 * Suspend an API key temporarily
 */
export function suspendApiKey(keyId: string, reason?: string): boolean {
  const storage = getStorage();
  const index = storage.keys.findIndex((k) => k.keyId === keyId);

  if (index === -1) {
    return false;
  }

  storage.keys[index].status = 'suspended';
  saveStorage(storage);
  return true;
}

/**
 * Reactivate a suspended key
 */
export function reactivateApiKey(keyId: string): boolean {
  const storage = getStorage();
  const index = storage.keys.findIndex((k) => k.keyId === keyId);

  if (index === -1) {
    return false;
  }

  storage.keys[index].status = 'active';
  saveStorage(storage);
  return true;
}

/**
 * List all API keys
 */
export function listApiKeys(): ApiKey[] {
  const storage = getStorage();
  return storage.keys.map(({ secret: _, ...publicKey }) => publicKey);
}

/**
 * Get API key by ID
 */
export function getApiKey(keyId: string): ApiKey | null {
  const storage = getStorage();
  const found = storage.keys.find((k) => k.keyId === keyId);

  if (!found) {
    return null;
  }

  const { secret: _, ...publicKey } = found;
  return publicKey;
}

/**
 * Reset usage statistics for a key
 */
function resetUsageStats(key: string): void {
  const storage = getStorage();
  const apiKey = storage.keys.find((k) => k.secret === key);

  if (apiKey) {
    apiKey.usageStats.requestsToday = 0;
    apiKey.usageStats.lastReset = new Date();
    saveStorage(storage);
  }
}

/**
 * Get storage from localStorage
 */
function getStorage(): ApiKeyStorage {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}storage`);
    if (stored) {
      return JSON.parse(stored) as ApiKeyStorage;
    }
  } catch {
    // Storage not available
  }

  return {
    keys: [],
    nextKeyId: 1,
  };
}

/**
 * Save storage to localStorage
 */
function saveStorage(storage: ApiKeyStorage): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}storage`, JSON.stringify(storage));
  } catch {
    // Storage not available
  }
}

/**
 * Save an API key to storage
 */
function saveApiKey(apiKey: StoredApiKey): void {
  const storage = getStorage();
  storage.keys.push(apiKey);
  saveStorage(storage);
}

/**
 * Generate a key ID from sequential counter
 */
function generateKeyId(): string {
  const storage = getStorage();
  const id = storage.nextKeyId++;
  saveStorage(storage);

  // Convert to base36 for shorter IDs
  return id.toString(36).toUpperCase();
}

/**
 * Export API keys for backup (excludes secrets)
 */
export function exportApiKeys(): string {
  const keys = listApiKeys();
  return JSON.stringify(keys, null, 2);
}

/**
 * Clear all API keys (for testing)
 */
export function clearAllApiKeys(): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}storage`);
  } catch {
    // Ignore
  }
}

/**
 * Validate API key permissions
 */
export function hasPermission(
  apiKey: ApiKey,
  permission: ApiPermission
): boolean {
  return (
    apiKey.permissions.includes(permission) ||
    apiKey.permissions.includes('admin:full')
  );
}

/**
 * Get rate limit tier for a key
 */
export function getRateLimitTier(tier: ApiTier): ApiRateLimit {
  return API_TIER_CONFIGS[tier].rateLimit;
}

/**
 * Calculate rate limit cost for an endpoint
 */
export function getRateLimitCost(endpoint: string): number {
  const costs: Record<string, number> = {
    '/cards': 1,
    '/cards/{cardId}': 1,
    '/cards/random': 1,
    '/packs/generate': 3, // Higher cost for pack generation
    '/collections/{userId}': 2,
    '/leaderboard': 1,
    '/events': 1,
    '/events/{eventId}': 1,
    '/auth/keys': 0, // Key management is free
  };

  return costs[endpoint] || 1;
}
