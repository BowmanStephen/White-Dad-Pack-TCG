/**
 * Global test setup for Vitest
 * Provides DOM environment and common mocks
 */
import { vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock localStorage for all tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Mock IndexedDB for tests
const indexedDBMock = {
  open: vi.fn(() => ({
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
        })),
      })),
    },
    onsuccess: null as any,
    onerror: null as any,
  })),
  deleteDatabase: vi.fn(),
};

Object.defineProperty(globalThis, 'indexedDB', {
  value: indexedDBMock,
});

// Mock matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  value: ResizeObserverMock,
});

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(callback: IntersectionObserverCallback) {
    // Store callback if needed for testing
  }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  value: IntersectionObserverMock,
});

// Reset localStorage between tests
beforeEach(() => {
  localStorageMock.clear();
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
