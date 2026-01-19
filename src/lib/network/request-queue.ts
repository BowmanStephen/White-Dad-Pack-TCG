/**
 * Request Queue with Automatic Retry
 *
 * Queues failed requests when offline and retries when connection is restored.
 * Provides persistent queue storage across page reloads.
 *
 * @module request-queue
 */

export interface QueuedRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'normal' | 'low';
}

export interface QueueStats {
  total: number;
  pending: number;
  succeeded: number;
  failed: number;
}

const QUEUE_STORAGE_KEY = 'daddeck-request-queue';
const MAX_QUEUE_SIZE = 100;
const DEFAULT_MAX_RETRIES = 3;

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private networkDetector: any;

  constructor(networkDetector?: any) {
    this.networkDetector = networkDetector;

    // Load persisted queue on init
    this.loadFromStorage();

    // Listen for network coming back online
    if (typeof window !== 'undefined') {
      window.addEventListener('daddeck:network-online', this.handleOnline);
    }
  }

  /**
   * Handle network coming back online
   */
  private handleOnline = () => {
    console.log('[RequestQueue] Network online, processing queue...');
    this.processQueue();
  };

  /**
   * Load queue from LocalStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[RequestQueue] Loaded ${this.queue.length} queued requests`);
      }
    } catch (error) {
      console.error('[RequestQueue] Failed to load from storage:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to LocalStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[RequestQueue] Failed to save to storage:', error);
    }
  }

  /**
   * Add a request to the queue
   */
  add(config: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    priority?: 'high' | 'normal' | 'low';
    maxRetries?: number;
  }): string {
    const id = crypto.randomUUID();

    const request: QueuedRequest = {
      id,
      url: config.url,
      method: config.method || 'POST',
      body: config.body,
      headers: config.headers,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      priority: config.priority || 'normal',
    };

    // Check queue size limit
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      console.warn('[RequestQueue] Queue full, removing oldest low-priority request');

      // Remove oldest low-priority request
      const lowPriorityIndex = this.queue.findIndex(
        (req) => req.priority === 'low'
      );

      if (lowPriorityIndex !== -1) {
        this.queue.splice(lowPriorityIndex, 1);
      } else {
        // Remove oldest request if no low priority
        this.queue.shift();
      }
    }

    // Insert based on priority (high first)
    if (request.priority === 'high') {
      this.queue.unshift(request);
    } else {
      this.queue.push(request);
    }

    this.saveToStorage();

    console.log(`[RequestQueue] Added request ${id} (${request.method} ${request.url})`);

    return id;
  }

  /**
   * Process the queue, attempting to send all queued requests
   */
  async processQueue(): Promise<QueueStats> {
    if (this.processing) {
      console.log('[RequestQueue] Already processing, skipping');
      return this.getStats();
    }

    if (this.queue.length === 0) {
      console.log('[RequestQueue] Queue empty');
      return this.getStats();
    }

    this.processing = true;

    const stats: QueueStats = {
      total: this.queue.length,
      pending: 0,
      succeeded: 0,
      failed: 0,
    };

    console.log(`[RequestQueue] Processing ${this.queue.length} requests`);

    // Process requests in order
    const remaining: QueuedRequest[] = [];

    for (const request of this.queue) {
      try {
        const success = await this.retryRequest(request);

        if (success) {
          stats.succeeded++;
          console.log(`[RequestQueue] ✓ Request ${request.id} succeeded`);
        } else {
          stats.failed++;
          remaining.push(request);
          console.log(`[RequestQueue] ✗ Request ${request.id} failed after ${request.retryCount} attempts`);
        }
      } catch (error) {
        stats.failed++;
        remaining.push(request);
        console.error(`[RequestQueue] ✗ Request ${request.id} error:`, error);
      }
    }

    // Update queue with remaining requests
    this.queue = remaining;
    this.saveToStorage();
    this.processing = false;

    console.log(`[RequestQueue] Processing complete: ${stats.succeeded} succeeded, ${stats.failed} failed`);

    return stats;
  }

  /**
   * Retry a single request with exponential backoff
   */
  private async retryRequest(request: QueuedRequest): Promise<boolean> {
    const maxRetries = request.maxRetries;

    while (request.retryCount < maxRetries) {
      request.retryCount++;

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = Math.pow(2, request.retryCount - 1) * 1000;

      if (request.retryCount > 1) {
        console.log(`[RequestQueue] Retrying ${request.id} (attempt ${request.retryCount}/${maxRetries}) after ${delay}ms`);
        await this.sleep(delay);
      }

      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            ...request.headers,
          },
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        if (response.ok) {
          return true;
        }

        // Not OK but could be server error - retry
        if (response.status >= 500 || response.status === 429) {
          console.warn(`[RequestQueue] Request ${request.id} returned ${response.status}, retrying...`);
          continue;
        }

        // Client error (4xx) - don't retry
        console.error(`[RequestQueue] Request ${request.id} returned ${response.status}, not retrying`);
        return false;
      } catch (error) {
        // Network error - retry
        console.warn(`[RequestQueue] Request ${request.id} network error, retrying...`, error);
        continue;
      }
    }

    // Max retries exceeded
    return false;
  }

  /**
   * Sleep helper for backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Remove a request from the queue
   */
  remove(id: string): boolean {
    const index = this.queue.findIndex((req) => req.id === id);

    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      console.log(`[RequestQueue] Removed request ${id}`);
      return true;
    }

    return false;
  }

  /**
   * Clear all requests from the queue
   */
  clear(): void {
    const count = this.queue.length;
    this.queue = [];
    this.saveToStorage();
    console.log(`[RequestQueue] Cleared ${count} requests`);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      total: this.queue.length,
      pending: this.queue.filter((req) => req.retryCount === 0).length,
      succeeded: 0,
      failed: this.queue.filter((req) => req.retryCount >= req.maxRetries).length,
    };
  }

  /**
   * Get all queued requests
   */
  getAll(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('daddeck:network-online', this.handleOnline);
    }
  }
}

// Global singleton instance
let queueInstance: RequestQueue | null = null;

/**
 * Get or create the global request queue instance
 */
export function getRequestQueue(networkDetector?: any): RequestQueue {
  if (!queueInstance) {
    queueInstance = new RequestQueue(networkDetector);
  }

  return queueInstance;
}

/**
 * Convenience function to queue a request
 */
export function queueRequest(config: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  priority?: 'high' | 'normal' | 'low';
}): string {
  return getRequestQueue().add(config);
}
