/**
 * Global type declarations for Sentry integration
 */

// App version injected by Vite define
declare const APP_VERSION: string;

// Sentry debug flag
declare const __SENTRY_DEBUG__: boolean;

// Extend ImportMeta for public variables
interface ImportMetaEnv {
  readonly PUBLIC_SENTRY_DSN?: string;
  readonly PUBLIC_VERCEL_ENV?: string;
  readonly PUBLIC_APP_VERSION?: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
