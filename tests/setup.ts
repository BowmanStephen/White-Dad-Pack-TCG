/**
 * Global test setup for Vitest
 * DOM environment is set up by vitest.config.mjs
 * This file provides common mocks and utilities
 */
import { vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Debug: Check current state
console.log('Setup file loaded');
console.log('typeof document:', typeof document);
console.log('typeof global.document:', typeof global.document);
console.log('typeof globalThis.document:', typeof globalThis.document);

// Manually set up jsdom if not already set up
if (typeof document === 'undefined' || typeof document.body === 'undefined') {
  console.log('Setting up jsdom manually...');

  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
  });

  // Define globals manually (must be defined BEFORE any other imports run)
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLAnchorElement = dom.window.HTMLAnchorElement;
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.HTMLDivElement = dom.window.HTMLDivElement;
  globalThis.HTMLSpanElement = dom.window.HTMLSpanElement;
  globalThis.HTMLImageElement = dom.window.HTMLImageElement;
  globalThis.HTMLAudioElement = dom.window.HTMLAudioElement;
  globalThis.Text = dom.window.Text;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  globalThis.Event = dom.window.Event;
  globalThis.EventTarget = dom.window.EventTarget;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.sessionStorage = dom.window.sessionStorage;

  // Browser APIs that Svelte needs
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame;
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame;
  globalThis.requestIdleCallback = dom.window.requestIdleCallback;
  globalThis.performance = dom.window.performance;

  console.log('jsdom globals set up successfully');
} else {
  console.log('Document already defined, skipping jsdom setup');
}
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

// Mock Web Animations API (element.animate())
// jsdom doesn't support this, so we provide a minimal mock
Object.defineProperty(Element.prototype, 'animate', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    finish: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    cancel: vi.fn(),
    reverse: vi.fn(),
    onfinish: null,
    oncancel: null,
    updatePlaybackRate: vi.fn(),
  })),
});

// Reset localStorage between tests
beforeEach(() => {
  localStorageMock.clear();
});

// Mock HTMLAudioElement.play() to return a resolved Promise
// This is needed for tests that use audio stores (PackOpener, etc.)
Object.defineProperty(HTMLAudioElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

// Mock HTMLAudioElement.pause() to prevent errors in tests
Object.defineProperty(HTMLAudioElement.prototype, 'pause', {
  writable: true,
  value: vi.fn().mockImplementation(() => {}),
});

// Mock audio event listeners (addEventListener, removeEventListener)
Object.defineProperty(HTMLAudioElement.prototype, 'addEventListener', {
  writable: true,
  value: vi.fn().mockImplementation(() => {}),
});

Object.defineProperty(HTMLAudioElement.prototype, 'removeEventListener', {
  writable: true,
  value: vi.fn().mockImplementation(() => {}),
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
