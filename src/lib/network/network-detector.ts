/**
 * Network Status Detection and Event System
 *
 * Provides real-time network status monitoring with custom events for:
 * - Online/offline status changes
 * - Connection quality monitoring
 * - Retry recommendations
 *
 * @module network-detector
 */

export type NetworkStatus = 'online' | 'offline' | 'unstable';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';

export interface NetworkInfo {
  status: NetworkStatus;
  connectionType: ConnectionType;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
  saveData: boolean;
  lastChange: Date;
}

export interface NetworkChangeEvent extends CustomEvent {
  detail: NetworkInfo;
}

// Event names for network status changes
export const NETWORK_EVENTS = {
  ONLINE: 'daddeck:network-online',
  OFFLINE: 'daddeck:network-offline',
  UNSTABLE: 'daddeck:network-unstable',
  CHANGE: 'daddeck:network-change',
} as const;

/**
 * Network status detector class
 * Monitors connection status and emits events on changes
 */
export class NetworkDetector {
  private currentStatus: NetworkStatus;
  private listeners: Map<string, Set<EventListener>>;
  private retryTimer: number | null = null;
  private unstableThreshold = 3000; // 3 seconds

  constructor() {
    // Determine initial status
    this.currentStatus = navigator.onLine ? 'online' : 'offline';
    this.listeners = new Map();

    // Set up event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }

    // Log initial status
    console.log(`[NetworkDetector] Initial status: ${this.currentStatus}`);
  }

  /**
   * Handle browser online event
   */
  private handleOnline = () => {
    console.log('[NetworkDetector] Browser reports online');

    // Verify with actual network request
    this.verifyConnection();
  };

  /**
   * Handle browser offline event
   */
  private handleOffline = () => {
    console.log('[NetworkDetector] Browser reports offline');
    this.setStatus('offline');
  };

  /**
   * Verify actual network connectivity with a fetch request
   */
  private async verifyConnection(): Promise<boolean> {
    try {
      // Try to fetch a small resource with cache busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch('/?t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Success - we're truly online
      this.setStatus('online');
      return true;
    } catch (error) {
      console.warn('[NetworkDetector] Verification failed:', error);
      this.setStatus('unstable');
      return false;
    }
  }

  /**
   * Update network status and emit appropriate events
   */
  private setStatus(status: NetworkStatus) {
    if (this.currentStatus === status) {
      return; // No change
    }

    const previousStatus = this.currentStatus;
    this.currentStatus = status;

    const info = this.getNetworkInfo();

    console.log(`[NetworkDetector] Status changed: ${previousStatus} → ${status}`);

    // Emit specific event
    if (status === 'online') {
      this.dispatchEvent(NETWORK_EVENTS.ONLINE, info);
    } else if (status === 'offline') {
      this.dispatchEvent(NETWORK_EVENTS.OFFLINE, info);
    } else if (status === 'unstable') {
      this.dispatchEvent(NETWORK_EVENTS.UNSTABLE, info);
    }

    // Always emit generic change event
    this.dispatchEvent(NETWORK_EVENTS.CHANGE, info);

    // Schedule retry for unstable connections
    if (status === 'unstable') {
      this.scheduleRetry();
    } else {
      this.clearRetry();
    }
  }

  /**
   * Emit custom event to all listeners
   */
  private dispatchEvent(eventName: string, detail: NetworkInfo) {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);

    // Also call registered callbacks
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          (callback as EventListener)(event);
        } catch (error) {
          console.error(`[NetworkDetector] Error in ${eventName} listener:`, error);
        }
      });
    }
  }

  /**
   * Schedule automatic retry for unstable connections
   */
  private scheduleRetry() {
    this.clearRetry();

    this.retryTimer = window.setTimeout(() => {
      console.log('[NetworkDetector] Retrying connection...');
      this.verifyConnection();
    }, this.unstableThreshold);
  }

  /**
   * Clear scheduled retry
   */
  private clearRetry() {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  /**
   * Get current network information
   */
  getNetworkInfo(): NetworkInfo {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    return {
      status: this.currentStatus,
      connectionType: this.getConnectionType(),
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData || false,
      lastChange: new Date(),
    };
  }

  /**
   * Determine connection type from Network Information API
   */
  private getConnectionType(): ConnectionType {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (!connection) {
      return 'unknown';
    }

    const type = connection.type;
    if (type === 'wifi' || type === 'cellular' || type === 'ethernet' || type === 'none') {
      return type;
    }

    // Try to infer from effectiveType
    if (connection.effectiveType) {
      return 'cellular';
    }

    return 'unknown';
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.currentStatus === 'online';
  }

  /**
   * Check if currently offline
   */
  isOffline(): boolean {
    return this.currentStatus === 'offline';
  }

  /**
   * Check if connection is unstable
   */
  isUnstable(): boolean {
    return this.currentStatus === 'unstable';
  }

  /**
   * Add event listener for network changes
   */
  addListener(eventName: string, callback: EventListener): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventName);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Remove all event listeners and clean up
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    this.clearRetry();
    this.listeners.clear();
  }
}

// Global singleton instance
let detectorInstance: NetworkDetector | null = null;

/**
 * Get or create the global network detector instance
 */
export function getNetworkDetector(): NetworkDetector {
  if (!detectorInstance) {
    detectorInstance = new NetworkDetector();
  }

  return detectorInstance;
}

/**
 * Convenience function to check if online
 */
export function isOnline(): boolean {
  return getNetworkDetector().isOnline();
}

/**
 * Convenience function to check if offline
 */
export function isOffline(): boolean {
  return getNetworkDetector().isOffline();
}

/**
 * Convenience function to get network info
 */
export function getNetworkInfo(): NetworkInfo {
  return getNetworkDetector().getNetworkInfo();
}

/**
 * Add listener for network coming online
 */
export function onOnline(callback: () => void): () => void {
  return getNetworkDetector().addListener(NETWORK_EVENTS.ONLINE, callback as EventListener);
}

/**
 * Add listener for network going offline
 */
export function onOffline(callback: () => void): () => void {
  return getNetworkDetector().addListener(NETWORK_EVENTS.OFFLINE, callback as EventListener);
}

/**
 * Add listener for any network status change
 */
export function onNetworkChange(callback: (info: NetworkInfo) => void): () => void {
  const wrappedCallback = (event: Event) => {
    const customEvent = event as CustomEvent<NetworkInfo>;
    callback(customEvent.detail);
  };

  return getNetworkDetector().addListener(NETWORK_EVENTS.CHANGE, wrappedCallback as EventListener);
}
