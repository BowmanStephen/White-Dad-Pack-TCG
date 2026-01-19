import { Window } from 'happy-dom';

// Create a happy-dom window instance
const window = new Window();

// Define globals from happy-dom
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

// Copy all window properties to global scope
Object.keys(window).forEach(key => {
  if (!(key in global)) {
    try {
      global[key] = window[key];
    } catch (e) {
      // Skip properties that can't be copied
    }
  }
});

export default {
  name: 'happy-dom-custom',
  setup(global) {
    return {
      teardown(global) {
        // Clean up if needed
      }
    };
  }
};
