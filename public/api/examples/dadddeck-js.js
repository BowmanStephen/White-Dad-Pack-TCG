/**
 * DadDeck API JavaScript SDK
 *
 * A lightweight JavaScript client for the DadDeck API.
 * Works in both Node.js and browser environments.
 *
 * @example
 * import { DadDeckAPI } from './dadddeck-js.js';
 *
 * const client = new DadDeckAPI({
 *   apiKey: 'ddpk_live_abc123...',
 *   baseUrl: 'https://api.dadddeck.com/v1'
 * });
 *
 * const cards = await client.cards.list({ page: 1, pageSize: 50 });
 */

/**
 * DadDeck API Client
 */
export class DadDeckAPI {
  /**
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Your API key
   * @param {string} [config.baseUrl='https://api.dadddeck.com/v1'] - API base URL
   * @param {number} [config.timeout=30000] - Request timeout in ms
   */
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.dadddeck.com/v1';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make an authenticated API request
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);

      // Parse rate limit headers
      const rateLimit = this._parseRateLimitHeaders(response.headers);

      // Handle error responses
      if (!response.ok) {
        const error = await response.json();
        throw new APIError(error.error?.code || 'API_ERROR', error.error?.message, {
          status: response.status,
          rateLimit,
          requestId: error.meta?.requestId,
        });
      }

      const data = await response.json();
      return {
        ...data,
        rateLimit,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('NETWORK_ERROR', error.message);
    }
  }

  /**
   * Parse rate limit headers from response
   * @private
   */
  _parseRateLimitHeaders(headers) {
    return {
      limit: parseInt(headers.get('X-RateLimit-Limit') || '0', 10),
      remaining: parseInt(headers.get('X-RateLimit-Remaining') || '0', 10),
      resetAt: headers.get('X-RateLimit-Reset')
        ? new Date(parseInt(headers.get('X-RateLimit-Reset'), 10) * 1000)
        : null,
      tier: headers.get('X-RateLimit-Tier') || 'unknown',
    };
  }

  /**
   * Cards API
   */
  get cards() {
    return {
      /**
       * List all cards with pagination and filters
       * @param {Object} [options]
       * @param {number} [options.page=1]
       * @param {number} [options.pageSize=50]
       * @param {string} [options.rarity]
       * @param {string} [options.type]
       * @param {number} [options.series]
       * @param {string} [options.search]
       * @returns {Promise<CardsResponse>}
       */
      list: async (options = {}) => {
        const params = new URLSearchParams();
        if (options.page) params.set('page', options.page);
        if (options.pageSize) params.set('pageSize', options.pageSize);
        if (options.rarity) params.set('rarity', options.rarity);
        if (options.type) params.set('type', options.type);
        if (options.series) params.set('series', options.series);
        if (options.search) params.set('search', options.search);

        const query = params.toString();
        return this._request(`/cards${query ? `?${query}` : ''}`);
      },

      /**
       * Get a specific card by ID
       * @param {string} cardId
       * @returns {Promise<{data: Card}>}
       */
      get: async (cardId) => {
        return this._request(`/cards/${cardId}`);
      },

      /**
       * Get random cards
       * @param {Object} [options]
       * @param {number} [options.count=1]
       * @param {string} [options.rarity]
       * @param {string} [options.type]
       * @param {string[]} [options.exclude]
       * @returns {Promise<{data: {cards: Card[]}}>}
       */
      random: async (options = {}) => {
        const params = new URLSearchParams();
        if (options.count) params.set('count', options.count);
        if (options.rarity) params.set('rarity', options.rarity);
        if (options.type) params.set('type', options.type);

        const query = params.toString();
        return this._request(`/cards/random${query ? `?${query}` : ''}`, {
          method: 'POST',
          body: options.exclude ? JSON.stringify({ exclude: options.exclude }) : undefined,
        });
      },
    };
  }

  /**
   * Packs API
   */
  get packs() {
    return {
      /**
       * Generate new pack(s)
       * @param {Object} options
       * @param {'standard'|'premium'} [options.packType='standard']
       * @param {number} [options.count=1]
       * @param {string} [options.design]
       * @param {number} [options.series]
       * @returns {Promise<{data: PackGenerateResponse}>}
       */
      generate: async (options = {}) => {
        return this._request('/packs/generate', {
          method: 'POST',
          body: JSON.stringify(options),
        });
      },
    };
  }

  /**
   * Collections API
   */
  get collections() {
    return {
      /**
       * Get user's collection
       * @param {string} userId
       * @param {Object} [options]
       * @param {string} [options.rarity]
       * @param {string} [options.sortBy='rarity']
       * @param {'asc'|'desc'} [options.sortOrder='desc']
       * @param {number} [options.page=1]
       * @param {number} [options.pageSize=50]
       * @returns {Promise<{data: CollectionResponse}>}
       */
      get: async (userId, options = {}) => {
        const params = new URLSearchParams();
        if (options.rarity) params.set('rarity', options.rarity);
        if (options.sortBy) params.set('sortBy', options.sortBy);
        if (options.sortOrder) params.set('sortOrder', options.sortOrder);
        if (options.page) params.set('page', options.page);
        if (options.pageSize) params.set('pageSize', options.pageSize);

        const query = params.toString();
        return this._request(`/collections/${userId}${query ? `?${query}` : ''}`);
      },
    };
  }

  /**
   * Leaderboard API
   */
  get leaderboard() {
    return {
      /**
       * Get global leaderboard
       * @param {Object} [options]
       * @param {number} [options.limit=100]
       * @param {number} [options.offset=0]
       * @returns {Promise<{data: LeaderboardResponse}>}
       */
      get: async (options = {}) => {
        const params = new URLSearchParams();
        if (options.limit) params.set('limit', options.limit);
        if (options.offset) params.set('offset', options.offset);

        const query = params.toString();
        return this._request(`/leaderboard${query ? `?${query}` : ''}`);
      },
    };
  }

  /**
   * Events API
   */
  get events() {
    return {
      /**
       * List all events
       * @param {Object} [options]
       * @param {'active'|'upcoming'|'ended'} [options.status]
       * @returns {Promise<{data: {events: Event[]}}>}
       */
      list: async (options = {}) => {
        const params = new URLSearchParams();
        if (options.status) params.set('status', options.status);

        const query = params.toString();
        return this._request(`/events${query ? `?${query}` : ''}`);
      },

      /**
       * Get specific event
       * @param {string} eventId
       * @returns {Promise<{data: Event}>}
       */
      get: async (eventId) => {
        return this._request(`/events/${eventId}`);
      },
    };
  }

  /**
   * Auth API (API Key Management)
   */
  get auth() {
    return {
      /**
       * List all API keys for your account
       * @returns {Promise<{data: {keys: ApiKey[]}}>}
       */
      listKeys: async () => {
        return this._request('/auth/keys');
      },

      /**
       * Create a new API key
       * @param {Object} options
       * @param {string} options.name
       * @param {'free'|'basic'|'pro'|'enterprise'} options.tier
       * @param {Date} [options.expiresAt]
       * @param {string[]} [options.allowedOrigins]
       * @returns {Promise<{data: {key: string, apiKey: ApiKey}}>}
       */
      createKey: async (options) => {
        return this._request('/auth/keys', {
          method: 'POST',
          body: JSON.stringify(options),
        });
      },

      /**
       * Revoke an API key
       * @param {string} keyId
       * @returns {Promise<void>}
       */
      revokeKey: async (keyId) => {
        return this._request(`/auth/keys/${keyId}`, {
          method: 'DELETE',
        });
      },
    };
  }
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  /**
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {Object} [details]
   * @param {number} [details.status]
   * @param {Object} [details.rateLimit]
   * @param {string} [details.requestId]
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = details.status;
    this.rateLimit = details.rateLimit;
    this.requestId = details.requestId;
  }

  /**
   * Check if error is due to rate limiting
   */
  isRateLimitError() {
    return this.code === 'RATE_LIMIT_EXCEEDED';
  }

  /**
   * Check if error is due to authentication
   */
  isAuthError() {
    return this.code === 'UNAUTHORIZED';
  }

  /**
   * Get retry delay in milliseconds
   */
  getRetryDelay() {
    if (this.rateLimit?.resetAt) {
      return this.rateLimit.resetAt.getTime() - Date.now();
    }
    return 60000; // Default: 1 minute
  }
}

/**
 * Example: Basic usage
 *
 * @example
 * const client = new DadDeckAPI({
 *   apiKey: process.env.DADDECK_API_KEY
 * });
 *
 * // List all rare cards
 * const rareCards = await client.cards.list({ rarity: 'rare', pageSize: 100 });
 * console.log(`Found ${rareCards.data.pagination.totalCards} rare cards`);
 *
 * // Generate a pack
 * const pack = await client.packs.generate({ count: 1 });
 * console.log(`Pulled ${pack.data.packs[0].cards.length} cards!`);
 *
 * // Get leaderboard
 * const leaderboard = await client.leaderboard.get({ limit: 10 });
 * console.log('Top 10 players:', leaderboard.data.entries);
 */

/**
 * Example: Error handling
 *
 * @example
 * try {
 *   const cards = await client.cards.list();
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     if (error.isRateLimitError()) {
 *       console.log(`Rate limited. Retry after ${error.getRetryDelay()}ms`);
 *     } else if (error.isAuthError()) {
 *       console.log('Invalid API key');
 *     } else {
 *       console.log(`API Error: ${error.message}`);
 *     }
 *   }
 * }
 */

/**
 * Example: Pagination
 *
 * @example
 * async function getAllCards() {
 *   let allCards = [];
 *   let page = 1;
 *   let hasMore = true;
 *
 *   while (hasMore) {
 *     const response = await client.cards.list({ page, pageSize: 100 });
 *     allCards.push(...response.data.cards);
 *     hasMore = response.data.pagination.hasNext;
 *     page++;
 *   }
 *
 *   return allCards;
 * }
 */

/**
 * Example: Rate limit handling
 *
 * @example
 * async function fetchWithRetry(fn, maxRetries = 3) {
 *   for (let i = 0; i < maxRetries; i++) {
 *     try {
 *       const result = await fn();
 *       return result;
 *     } catch (error) {
 *       if (error instanceof APIError && error.isRateLimitError()) {
 *         const delay = error.getRetryDelay();
 *         console.log(`Rate limited. Waiting ${delay}ms...`);
 *         await new Promise(resolve => setTimeout(resolve, delay));
 *         continue;
 *       }
 *       throw error;
 *     }
 *   }
 * }
 *
 * const cards = await fetchWithRetry(() => client.cards.list());
 */
