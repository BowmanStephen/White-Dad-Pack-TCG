/**
 * Custom Vitest environment for jsdom
 * Manually initializes jsdom globals for @testing-library/svelte
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

// Helper to define global properties safely
function defineGlobal(key: string, value: any) {
  Object.defineProperty(global, key, {
    value,
    writable: true,
    configurable: true,
  });
}

// Set up globals immediately (before tests load)
defineGlobal('window', dom.window);
defineGlobal('document', dom.window.document);
defineGlobal('navigator', dom.window.navigator);
defineGlobal('HTMLElement', dom.window.HTMLElement);
defineGlobal('HTMLAnchorElement', dom.window.HTMLAnchorElement);
defineGlobal('HTMLButtonElement', dom.window.HTMLButtonElement);
defineGlobal('HTMLDivElement', dom.window.HTMLDivElement);
defineGlobal('HTMLSpanElement', dom.window.HTMLSpanElement);
defineGlobal('HTMLImageElement', dom.window.HTMLImageElement);
defineGlobal('HTMLAudioElement', dom.window.HTMLAudioElement);
defineGlobal('Text', dom.window.Text);
defineGlobal('Node', dom.window.Node);
defineGlobal('Element', dom.window.Element);
defineGlobal('Event', dom.window.Event);
defineGlobal('EventTarget', dom.window.EventTarget);
defineGlobal('CustomEvent', dom.window.CustomEvent);
defineGlobal('localStorage', dom.window.localStorage);
defineGlobal('sessionStorage', dom.window.sessionStorage);

// Critical browser globals that Svelte needs
defineGlobal('requestAnimationFrame', dom.window.requestAnimationFrame);
defineGlobal('cancelAnimationFrame', dom.window.cancelAnimationFrame);
defineGlobal('requestIdleCallback', dom.window.requestIdleCallback);
defineGlobal('performance', dom.window.performance);

export default {
  setup() {
    // Additional setup if needed
  },
  teardown() {
    // Clean up if needed
  },
};
