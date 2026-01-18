/**
 * Sentry Error Tracking Configuration
 *
 * Initializes Sentry for production error tracking and performance monitoring.
 * Only active when PUBLIC_SENTRY_DSN is set and environment is production.
 *
 * Documentation: https://docs.sentry.io/platforms/javascript/
 */

import * as Sentry from '@sentry/astro';

const SENTRY_DSN = import.meta.env.PUBLIC_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.PUBLIC_VERCEL_ENV || import.meta.env.MODE || 'development';
const SAMPLE_RATE = ENVIRONMENT === 'production' ? 0.1 : 1.0; // 10% sampling in production

/**
 * Initialize Sentry for error tracking
 */
export function initSentry() {
  // Only initialize in production if DSN is provided
  if (ENVIRONMENT !== 'production' || !SENTRY_DSN) {
    if (ENVIRONMENT === 'development') {
      console.log('🔧 Sentry disabled in development (enable with PUBLIC_SENTRY_DSN)');
    }
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,

      // Release version from package.json
      release: getReleaseVersion(),

      // Tracing sample rate (10% of transactions)
      tracesSampleRate: SAMPLE_RATE,

      // Session replay sample rate (1% of sessions)
      replaysSessionSampleRate: 0.01,
      replaysOnErrorSampleRate: 1.0, // 100% on error

      // Integrations
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
        Sentry.captureConsoleIntegration({
          levels: ['error'],
        }),
      ],

      // Filter out sensitive data
      beforeSend(event) {
        // Don't send in development
        if (ENVIRONMENT === 'development') {
          return null;
        }

        // Filter out localhost errors
        if (event.request?.url?.includes('localhost')) {
          return null;
        }

        // Add custom context
        event.contexts = {
          ...event.contexts,
          app: {
            name: 'DadDeck TCG',
            environment: ENVIRONMENT,
          },
        };

        return event;
      },

      // Error stack trace frames to skip
      stackParser: (stack) => {
        // Filter out node_modules and internal scripts
        return stack.filter((frame) => {
          if (!frame.filename) return false;
          return !frame.filename.includes('node_modules');
        });
      },
    });

    console.log('✅ Sentry initialized for error tracking');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Get release version from package.json
 */
function getReleaseVersion(): string {
  // Version is injected by Vite during build
  // @ts-ignore - APP_VERSION is defined by Vite define
  if (typeof APP_VERSION !== 'undefined') {
    return APP_VERSION;
  }

  // Fallback to import.meta.env
  return import.meta.env.PUBLIC_APP_VERSION || '0.1.0';
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window === 'undefined') return;

  Sentry.captureMessage(message, {
    level,
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: { id?: string; email?: string; username?: string }) {
  if (typeof window === 'undefined') return;

  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

/**
 * Create a test error (for debugging)
 */
export function triggerTestError() {
  try {
    throw new Error('Sentry test error - DadDeck TCG');
  } catch (error) {
    captureException(error as Error, {
      test: true,
      timestamp: new Date().toISOString(),
    });
  }
}
