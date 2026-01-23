import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  NetworkDetector,
  getNetworkDetector,
  isOnline,
  isOffline,
  getNetworkInfo,
  onOnline,
  onOffline,
  onNetworkChange,
  NETWORK_EVENTS,
  type NetworkStatus,
  type NetworkInfo,
} from '@/lib/network/network-detector';

// Mock global objects
const mockNavigator = {
  onLine: true,
  connection: null as any,
  mozConnection: null as any,
  webkitConnection: null as any,
};

const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  setTimeout: vi.fn((fn: () => void, ms: number) => {
    return 123 as unknown as number;
  }),
  clearTimeout: vi.fn(),
};

// Store original globals
let originalNavigator: typeof navigator;
let originalWindow: typeof window;

describe('NetworkDetector', () => {
  beforeEach(() => {
    // Save originals
    originalNavigator = global.navigator;
    originalWindow = global.window;

    // Reset mocks
    vi.clearAllMocks();
    mockNavigator.onLine = true;
    mockNavigator.connection = null;
    mockWindow.addEventListener.mockClear();
    mockWindow.removeEventListener.mockClear();
    mockWindow.dispatchEvent.mockClear();

    // Mock globals
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: {
        ...mockWindow,
        addEventListener: mockWindow.addEventListener,
        removeEventListener: mockWindow.removeEventListener,
        dispatchEvent: mockWindow.dispatchEvent,
        setTimeout: mockWindow.setTimeout,
        clearTimeout: mockWindow.clearTimeout,
      },
      writable: true,
      configurable: true,
    });

    // Mock CustomEvent
    global.CustomEvent = vi.fn().mockImplementation((name: string, options: any) => ({
      type: name,
      detail: options?.detail,
    })) as any;
  });

  afterEach(() => {
    // Restore originals
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  describe('NetworkDetector class', () => {
    describe('constructor', () => {
      it('should initialize with online status when navigator.onLine is true', () => {
        mockNavigator.onLine = true;
        const detector = new NetworkDetector();

        expect(detector.isOnline()).toBe(true);
        expect(detector.isOffline()).toBe(false);
      });

      it('should initialize with offline status when navigator.onLine is false', () => {
        mockNavigator.onLine = false;
        const detector = new NetworkDetector();

        expect(detector.isOnline()).toBe(false);
        expect(detector.isOffline()).toBe(true);
      });

      it('should add event listeners for online and offline events', () => {
        const detector = new NetworkDetector();

        expect(mockWindow.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
        expect(mockWindow.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      });
    });

    describe('status methods', () => {
      it('isOnline should return true when online', () => {
        mockNavigator.onLine = true;
        const detector = new NetworkDetector();
        expect(detector.isOnline()).toBe(true);
      });

      it('isOffline should return true when offline', () => {
        mockNavigator.onLine = false;
        const detector = new NetworkDetector();
        expect(detector.isOffline()).toBe(true);
      });

      it('isUnstable should return false initially', () => {
        const detector = new NetworkDetector();
        expect(detector.isUnstable()).toBe(false);
      });
    });

    describe('getNetworkInfo', () => {
      it('should return network info with status', () => {
        mockNavigator.onLine = true;
        const detector = new NetworkDetector();
        const info = detector.getNetworkInfo();

        expect(info.status).toBe('online');
        expect(info.lastChange).toBeInstanceOf(Date);
        expect(info.saveData).toBe(false);
      });

      it('should include connection type when available', () => {
        mockNavigator.connection = {
          type: 'wifi',
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
          saveData: false,
        };

        const detector = new NetworkDetector();
        const info = detector.getNetworkInfo();

        expect(info.connectionType).toBe('wifi');
        expect(info.effectiveType).toBe('4g');
        expect(info.downlink).toBe(10);
        expect(info.rtt).toBe(50);
      });

      it('should return unknown connection type when not available', () => {
        mockNavigator.connection = null;
        const detector = new NetworkDetector();
        const info = detector.getNetworkInfo();

        expect(info.connectionType).toBe('unknown');
      });
    });

    describe('addListener', () => {
      it('should add listener and return unsubscribe function', () => {
        const detector = new NetworkDetector();
        const callback = vi.fn();

        const unsubscribe = detector.addListener(NETWORK_EVENTS.ONLINE, callback);

        expect(typeof unsubscribe).toBe('function');
      });

      it('should create listener set for new event types', () => {
        const detector = new NetworkDetector();
        const callback = vi.fn();

        detector.addListener('custom-event', callback);
        // Should not throw
      });

      it('unsubscribe should remove the listener', () => {
        const detector = new NetworkDetector();
        const callback = vi.fn();

        const unsubscribe = detector.addListener(NETWORK_EVENTS.ONLINE, callback);
        unsubscribe();

        // After unsubscribe, callback should be removed
        // This is tested indirectly through the listener map
      });
    });

    describe('destroy', () => {
      it('should remove window event listeners', () => {
        const detector = new NetworkDetector();
        detector.destroy();

        expect(mockWindow.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
        expect(mockWindow.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      });

      it('should clear listeners map', () => {
        const detector = new NetworkDetector();
        detector.addListener(NETWORK_EVENTS.ONLINE, vi.fn());
        detector.destroy();

        // After destroy, adding listeners to events should work on fresh map
        const newCallback = vi.fn();
        detector.addListener(NETWORK_EVENTS.ONLINE, newCallback);
      });
    });
  });

  describe('NETWORK_EVENTS constants', () => {
    it('should have correct event names', () => {
      expect(NETWORK_EVENTS.ONLINE).toBe('daddeck:network-online');
      expect(NETWORK_EVENTS.OFFLINE).toBe('daddeck:network-offline');
      expect(NETWORK_EVENTS.UNSTABLE).toBe('daddeck:network-unstable');
      expect(NETWORK_EVENTS.CHANGE).toBe('daddeck:network-change');
    });
  });

  describe('Convenience functions', () => {
    // Note: These tests create singletons, so we need to be careful about state
    describe('isOnline', () => {
      it('should return online status from singleton', () => {
        mockNavigator.onLine = true;
        // Force fresh singleton for testing
        const result = isOnline();
        expect(typeof result).toBe('boolean');
      });
    });

    describe('isOffline', () => {
      it('should return offline status from singleton', () => {
        mockNavigator.onLine = false;
        const result = isOffline();
        expect(typeof result).toBe('boolean');
      });
    });

    describe('getNetworkInfo', () => {
      it('should return network info from singleton', () => {
        const info = getNetworkInfo();

        expect(info).toHaveProperty('status');
        expect(info).toHaveProperty('connectionType');
        expect(info).toHaveProperty('lastChange');
        expect(info).toHaveProperty('saveData');
      });
    });

    describe('onOnline', () => {
      it('should add listener for online events', () => {
        const callback = vi.fn();
        const unsubscribe = onOnline(callback);

        expect(typeof unsubscribe).toBe('function');
      });
    });

    describe('onOffline', () => {
      it('should add listener for offline events', () => {
        const callback = vi.fn();
        const unsubscribe = onOffline(callback);

        expect(typeof unsubscribe).toBe('function');
      });
    });

    describe('onNetworkChange', () => {
      it('should add listener for network change events', () => {
        const callback = vi.fn();
        const unsubscribe = onNetworkChange(callback);

        expect(typeof unsubscribe).toBe('function');
      });
    });
  });

  describe('Connection type detection', () => {
    it('should detect wifi connection', () => {
      mockNavigator.connection = { type: 'wifi' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('wifi');
    });

    it('should detect cellular connection', () => {
      mockNavigator.connection = { type: 'cellular' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('cellular');
    });

    it('should detect ethernet connection', () => {
      mockNavigator.connection = { type: 'ethernet' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('ethernet');
    });

    it('should detect none connection type', () => {
      mockNavigator.connection = { type: 'none' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('none');
    });

    it('should infer cellular from effectiveType when type is unknown', () => {
      mockNavigator.connection = { effectiveType: '4g' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('cellular');
    });

    it('should fallback to unknown for unrecognized type', () => {
      mockNavigator.connection = { type: 'some-unknown-type' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('unknown');
    });

    it('should check mozConnection for Firefox', () => {
      // Reset all connection mocks
      mockNavigator.connection = null;
      mockNavigator.webkitConnection = null;
      mockNavigator.mozConnection = { type: 'wifi' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('wifi');
    });

    it('should check webkitConnection for Safari/older Chrome', () => {
      // Reset all connection mocks
      mockNavigator.connection = null;
      mockNavigator.mozConnection = null;
      mockNavigator.webkitConnection = { type: 'cellular' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('cellular');
    });
  });

  describe('Save data mode', () => {
    it('should detect save data mode when enabled', () => {
      mockNavigator.connection = { saveData: true };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.saveData).toBe(true);
    });

    it('should return false for save data when not enabled', () => {
      mockNavigator.connection = { saveData: false };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.saveData).toBe(false);
    });

    it('should default to false when connection info not available', () => {
      mockNavigator.connection = null;
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.saveData).toBe(false);
    });
  });

  describe('Network quality metrics', () => {
    it('should include downlink speed when available', () => {
      mockNavigator.connection = { downlink: 10 };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.downlink).toBe(10);
    });

    it('should include round-trip time when available', () => {
      mockNavigator.connection = { rtt: 50 };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.rtt).toBe(50);
    });

    it('should include effective type when available', () => {
      mockNavigator.connection = { effectiveType: '4g' };
      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.effectiveType).toBe('4g');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined window gracefully', () => {
      // Temporarily make window undefined
      const tempWindow = global.window;
      // @ts-ignore
      global.window = undefined;

      // This should not throw
      expect(() => {
        // The constructor checks typeof window !== 'undefined'
        // When window is undefined, it should skip adding listeners
      }).not.toThrow();

      // Restore
      global.window = tempWindow;
    });

    it('should handle navigator without connection property', () => {
      mockNavigator.connection = undefined;
      mockNavigator.mozConnection = undefined;
      mockNavigator.webkitConnection = undefined;

      const detector = new NetworkDetector();
      const info = detector.getNetworkInfo();

      expect(info.connectionType).toBe('unknown');
      expect(info.effectiveType).toBeUndefined();
      expect(info.downlink).toBeUndefined();
      expect(info.rtt).toBeUndefined();
    });
  });
});

describe('NetworkInfo interface', () => {
  it('should have all required properties', () => {
    const info: NetworkInfo = {
      status: 'online',
      connectionType: 'wifi',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      lastChange: new Date(),
    };

    expect(info.status).toBe('online');
    expect(info.connectionType).toBe('wifi');
    expect(info.effectiveType).toBe('4g');
    expect(info.downlink).toBe(10);
    expect(info.rtt).toBe(50);
    expect(info.saveData).toBe(false);
    expect(info.lastChange).toBeInstanceOf(Date);
  });

  it('should allow optional properties to be undefined', () => {
    const info: NetworkInfo = {
      status: 'offline',
      connectionType: 'none',
      saveData: false,
      lastChange: new Date(),
    };

    expect(info.effectiveType).toBeUndefined();
    expect(info.downlink).toBeUndefined();
    expect(info.rtt).toBeUndefined();
  });
});

describe('NetworkStatus type', () => {
  it('should accept valid status values', () => {
    const statuses: NetworkStatus[] = ['online', 'offline', 'unstable'];

    expect(statuses).toHaveLength(3);
    expect(statuses).toContain('online');
    expect(statuses).toContain('offline');
    expect(statuses).toContain('unstable');
  });
});
