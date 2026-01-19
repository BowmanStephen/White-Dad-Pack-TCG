/**
 * Developer API Types
 *
 * Types for the public DadDeck API that allows developers to:
 * - Fetch card data
 * - Generate packs
 * - Access collections
 * - Query game data
 *
 * REST API endpoints with rate limiting tiers (free vs premium)
 */

/**
 * API key tier levels
 */
export type ApiTier = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * API key status
 */
export type ApiKeyStatus = 'active' | 'suspended' | 'revoked' | 'pending';

/**
 * API key interface
 */
export interface ApiKey {
  key: string;                    // API key token (e.g., "ddpk_xxx...")
  name: string;                   // Human-readable name for the key
  tier: ApiTier;                  // Access tier
  status: ApiKeyStatus;           // Current status
  createdAt: Date;                // When key was created
  lastUsedAt?: Date;              // Last API call timestamp
  expiresAt?: Date;               // Optional expiration date
  rateLimit: ApiRateLimit;        // Rate limit configuration
  usageStats: ApiUsageStats;      // Usage statistics
  allowedOrigins?: string[];      // CORS allowed origins (empty = all)
  permissions: ApiPermission[];   // Granted permissions
}

/**
 * API rate limit configuration per tier
 */
export interface ApiRateLimit {
  requestsPerMinute: number;      // Requests per minute
  requestsPerHour: number;        // Requests per hour
  requestsPerDay: number;         // Requests per day
  concurrentRequests: number;     // Max concurrent requests
}

/**
 * API usage statistics
 */
export interface ApiUsageStats {
  totalRequests: number;          // Lifetime requests
  requestsThisMonth: number;      // Current month usage
  requestsToday: number;          // Today's usage
  lastReset: Date;                // When stats were last reset
}

/**
 * API permission scopes
 */
export type ApiPermission =
  | 'cards:read'          // Read card data
  | 'cards:search'        // Search cards
  | 'packs:generate'      // Generate new packs
  | 'packs:open'          // Open packs (with rate limits)
  | 'collections:read'    // Read collection data
  | 'collections:write'   // Modify collections
  | 'users:read'          // Read user profiles
  | 'leaderboard:read'    // Read leaderboard
  | 'events:read'         // Read events
  | 'admin:full';         // Full admin access

/**
 * API response wrapper (standard format)
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API error format
 */
export interface ApiError {
  code: string;                   // Machine-readable error code
  message: string;                // Human-readable message
  details?: Record<string, unknown>; // Additional error context
}

/**
 * API response metadata
 */
export interface ApiMeta {
  requestId: string;              // Unique request ID
  timestamp: Date;                // Response timestamp
  version: string;                // API version
  rateLimit?: ApiRateLimitInfo;   // Rate limit info
}

/**
 * Rate limit info in response headers
 */
export interface ApiRateLimitInfo {
  limit: number;                  // Total limit
  remaining: number;              // Remaining requests
  resetAt: Date;                  // When limit resets
  tier: ApiTier;                  // Current tier
}

/**
 * Card API response (paginated)
 */
export interface CardsResponse {
  cards: ApiCard[];
  pagination: {
    page: number;
    pageSize: number;
    totalCards: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Card data in API format (minimal, no sensitive data)
 */
export interface ApiCard {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  rarity: string;
  artwork: string;
  stats: {
    dadJoke: number;
    grillSkill: number;
    fixIt: number;
    napPower: number;
    remoteControl: number;
    thermostat: number;
    sockSandal: number;
    beerSnob: number;
  };
  flavorText: string;
  abilities: Array<{
    name: string;
    description: string;
  }>;
  series: number;
  cardNumber: number;
  totalInSeries: number;
  artist: string;
  seasonId?: number;
}

/**
 * Pack generation request
 */
export interface PackGenerateRequest {
  packType?: 'standard' | 'premium';
  count?: number;                 // Number of packs to generate (1-10)
  design?: string;                // Specific pack design (optional)
  series?: number;                // Specific series (optional)
}

/**
 * Generated pack response
 */
export interface PackGenerateResponse {
  packs: GeneratedPack[];
  meta: {
    totalCards: number;
    rarityBreakdown: Record<string, number>;
    holoCount: number;
    generationTime: number;       // ms
  };
}

/**
 * Generated pack data
 */
export interface GeneratedPack {
  id: string;
  design: string;
  cards: ApiCard[];
  openedAt: Date;
  bestRarity: string;
}

/**
 * Collection query filters
 */
export interface CollectionQuery {
  userId?: string;
  rarity?: string[];
  type?: string[];
  minStats?: {
    dadJoke?: number;
    grillSkill?: number;
    fixIt?: number;
    napPower?: number;
    remoteControl?: number;
    thermostat?: number;
    sockSandal?: number;
    beerSnob?: number;
  };
  sortBy?: 'rarity' | 'name' | 'date_obtained';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  pseudonym: string;
  avatarId: string;
  stats: {
    totalPacks: number;
    totalCards: number;
    uniqueCards: number;
    rarePulls: number;
    epicPulls: number;
    legendaryPulls: number;
    mythicPulls: number;
  };
}

/**
 * Event data
 */
export interface EventData {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
  bonuses: Array<{
    type: string;
    description: string;
    multiplier: number;
  }>;
}

/**
 * API tier configurations
 */
export const API_TIER_CONFIGS: Record<ApiTier, {
  name: string;
  price: number;              // Monthly price in USD
  rateLimit: ApiRateLimit;
  permissions: ApiPermission[];
  features: string[];
}> = {
  free: {
    name: 'Free',
    price: 0,
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 100,
      requestsPerDay: 500,
      concurrentRequests: 2,
    },
    permissions: ['cards:read', 'cards:search', 'leaderboard:read'],
    features: [
      'Read card database',
      'Search cards',
      'View leaderboard',
      'Community support',
    ],
  },
  basic: {
    name: 'Basic',
    price: 9.99,
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      concurrentRequests: 5,
    },
    permissions: ['cards:read', 'cards:search', 'packs:generate', 'leaderboard:read', 'events:read'],
    features: [
      'Everything in Free',
      'Generate packs',
      'Access event data',
      'Email support',
      'API keys: 3',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49.99,
    rateLimit: {
      requestsPerMinute: 300,
      requestsPerHour: 10000,
      requestsPerDay: 100000,
      concurrentRequests: 20,
    },
    permissions: [
      'cards:read',
      'cards:search',
      'packs:generate',
      'packs:open',
      'collections:read',
      'leaderboard:read',
      'events:read',
      'users:read',
    ],
    features: [
      'Everything in Basic',
      'Open packs via API',
      'Read collection data',
      'Read user profiles',
      'Priority support',
      'Webhooks',
      'API keys: 10',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 499.99,
    rateLimit: {
      requestsPerMinute: 1000,
      requestsPerHour: 100000,
      requestsPerDay: 1000000,
      concurrentRequests: 100,
    },
    permissions: [
      'cards:read',
      'cards:search',
      'packs:generate',
      'packs:open',
      'collections:read',
      'collections:write',
      'leaderboard:read',
      'events:read',
      'users:read',
      'admin:full',
    ],
    features: [
      'Everything in Pro',
      'Write to collections',
      'Admin access',
      'Dedicated support',
      'Custom rate limits',
      'SLA guarantee',
      'Unlimited API keys',
      'On-premise option',
    ],
  },
};

/**
 * API endpoint definitions (for OpenAPI spec generation)
 */
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: Record<string, ApiResponseSchema>;
  security: ApiSecurityRequirement[];
  rateLimitCost?: number;        // How many "points" this request costs
}

/**
 * API parameter (for query/path params)
 */
export interface ApiParameter {
  name: string;
  in: 'query' | 'path' | 'header';
  description: string;
  required: boolean;
  schema: ApiSchema;
  example?: unknown;
}

/**
 * API request body schema
 */
export interface ApiRequestBody {
  description: string;
  required: boolean;
  content: Record<string, ApiMediaType>;
}

/**
 * API media type (e.g., application/json)
 */
export interface ApiMediaType {
  schema: ApiSchema;
  example?: unknown;
  examples?: Record<string, { summary: string; value: unknown }>;
}

/**
 * API schema definition
 */
export interface ApiSchema {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  format?: string;               // e.g., 'uuid', 'email', 'date-time'
  description?: string;
  properties?: Record<string, ApiSchema>;
  items?: ApiSchema;             // For array types
  required?: string[];
  enum?: unknown[];              // For enum values
  $ref?: string;                 // Reference to another schema
  example?: unknown;
  nullable?: boolean;
}

/**
 * API response schema
 */
export interface ApiResponseSchema {
  description: string;
  content?: Record<string, ApiMediaType>;
  headers?: Record<string, ApiParameter>;
}

/**
 * API security requirement
 */
export interface ApiSecurityRequirement {
  apiKey: string[];              // API key authentication
  // Add OAuth, JWT, etc. as needed
}

/**
 * OpenAPI specification structure
 */
export interface OpenApiSpec {
  openapi: string;               // Version (e.g., '3.0.0')
  info: {
    title: string;
    version: string;
    description: string;
    termsOfService?: string;
    contact?: {
      name: string;
      email: string;
      url: string;
    };
    license?: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
    variables?: Record<string, { default: string; description: string }>;
  }>;
  tags: Array<{
    name: string;
    description: string;
    externalDocs?: { description: string; url: string };
  }>;
  paths: Record<string, Record<string, ApiEndpoint>>;
  components: {
    securitySchemes: Record<string, {
      type: string;
      description: string;
      name: string;
      in: string;
    }>;
    schemas: Record<string, ApiSchema>;
    responses: Record<string, ApiResponseSchema>;
  };
  security: ApiSecurityRequirement[];
}

/**
 * API webhook event types
 */
export type ApiWebhookEventType =
  | 'pack.opened'
  | 'card.revealed'
  | 'collection.updated'
  | 'user.achievement'
  | 'event.started'
  | 'event.ended';

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  id: string;
  url: string;
  events: ApiWebhookEventType[];
  secret: string;                 // HMAC secret for verification
  active: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount: number;
}

/**
 * Webhook payload
 */
export interface WebhookPayload {
  id: string;                     // Unique event ID
  eventType: ApiWebhookEventType;
  timestamp: Date;
  data: unknown;                  // Event-specific data
  signature: string;              // HMAC signature
}
