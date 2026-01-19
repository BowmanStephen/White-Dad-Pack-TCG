import { JSDOM } from 'jsdom';

// Create a basic jsdom environment
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

// Define globals
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.HTMLElement = window.HTMLElement;
global.HTMLAnchorElement = window.HTMLAnchorElement;
global.HTMLButtonElement = window.HTMLButtonElement;
global.HTMLDivElement = window.HTMLDivElement;
global.HTMLSpanElement = window.HTMLSpanElement;
global.HTMLImageElement = window.HTMLImageElement;
global.HTMLAudioElement = window.HTMLAudioElement;
global.Text = window.Text;
global.Node = window.Node;
global.Element = window.Element;
global.Event = window.Event;
global.EventTarget = window.EventTarget;
global.CustomEvent = window.CustomEvent;
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;

// Browser APIs that Svelte needs
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;
global.requestIdleCallback = window.requestIdleCallback;
global.performance = window.performance;

// Copy global properties from jsdom window to global scope
Object.keys(window).forEach(key => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

export default {
  name: 'jsdom-custom',
  transformMode: 'ssr',
  setup(global) {
    return {
      teardown(global) {
        // Clean up if needed
      }
    };
  }
};
