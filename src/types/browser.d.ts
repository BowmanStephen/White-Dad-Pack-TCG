export {};

interface GtagFunction {
  (command: 'js', date: Date): void;
  (command: 'config', targetId: string, config?: Record<string, unknown>): void;
  (command: 'event', eventName: string, params?: Record<string, unknown>): void;
}

interface PlausibleFunction {
  (eventName: string, options?: { props?: Record<string, string | number> }): void;
}

declare global {
  interface Window {
    gtag?: GtagFunction;
    plausible?: PlausibleFunction;
    PLAUSIBLE_BASE_URL?: string;
    webkitAudioContext?: typeof AudioContext;
  }
}
