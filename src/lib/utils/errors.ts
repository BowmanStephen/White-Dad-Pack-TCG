/**
 * Error Handling Utilities
 *
 * Provides friendly error messages, recovery actions, and logging
 * for graceful degradation throughout the app.
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error categories for different types of failures
 */
export type ErrorCategory =
  | 'network'        // Network/API failures
  | 'storage'        // LocalStorage quota/access issues
  | 'generation'     // Pack/card generation failures
  | 'validation'     // Invalid data/state
  | 'permission'     // Browser permission denied
  | 'security'       // Security violations/anti-cheat
  | 'banned'         // User account banned
  | 'unknown';       // Catch-all for unexpected errors

/**
 * Recovery action suggestions for users
 */
export interface RecoveryAction {
  label: string;           // User-friendly action text (e.g., "Try Again")
  action: () => void;      // Function to execute
  primary?: boolean;       // Is this the primary action?
}

/**
 * App error interface with user-friendly messaging
 */
export interface AppError {
  id: string;              // Unique error identifier
  category: ErrorCategory;
  title: string;           // Short, friendly error title
  message: string;         // Clear explanation (no jargon)
  icon: string;            // Emoji or icon for visual feedback
  recovery: RecoveryAction[]; // Suggested actions
  timestamp: number;       // When error occurred
  logged: boolean;         // Whether logged to console
}

// ============================================================================
// ERROR MESSAGES (User-Friendly)
// ============================================================================

/**
 * Error message templates for common scenarios
 * These avoid technical jargon and focus on what the user needs to know
 */
const ERROR_MESSAGES: Record<ErrorCategory, { title: string; message: string; icon: string }> = {
  network: {
    title: 'Connection Issue',
    message: "We couldn't connect to our servers. Please check your internet connection and try again.",
    icon: '🌐',
  },
  storage: {
    title: 'Storage Issue',
    message: "Your browser's storage is full or unavailable. Your cards won't be saved, but you can still open packs.",
    icon: '💾',
  },
  generation: {
    title: 'Pack Generation Failed',
    message: "Something went wrong while creating your pack. Don't worry, this isn't your fault!",
    icon: '📦',
  },
  validation: {
    title: 'Data Issue',
    message: 'We encountered some unexpected data. This might be due to a browser extension or cached data.',
    icon: '⚠️',
  },
  permission: {
    title: 'Permission Needed',
    message: 'We need permission to continue. Please check your browser settings.',
    icon: '🔒',
  },
  security: {
    title: 'Security Alert',
    message: 'We detected suspicious activity. Please refresh the page and try again.',
    icon: '🛡️',
  },
  banned: {
    title: 'Account Suspended',
    message: 'Your account has been suspended due to policy violations.',
    icon: '🚫',
  },
  unknown: {
    title: 'Oops! Something Went Wrong',
    message: "We hit a snag. This shouldn't happen, and we're working to fix it.",
    icon: '🤕',
  },
};

// ============================================================================
// ERROR CREATION
// ============================================================================

/**
 * Generate a unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create a friendly app error from a raw error
 */
export function createAppError(
  category: ErrorCategory,
  originalError: Error | string | unknown,
  recovery: RecoveryAction[]
): AppError {
  const templates = ERROR_MESSAGES[category];
  const message = typeof originalError === 'string'
    ? originalError
    : originalError instanceof Error
      ? originalError.message
      : 'An unexpected error occurred';

  return {
    id: generateErrorId(),
    category,
    title: templates.title,
    message: message || templates.message,
    icon: templates.icon,
    recovery,
    timestamp: Date.now(),
    logged: false,
  };
}

/**
 * Create a storage error with default recovery actions
 */
export function createStorageError(
  originalError: Error | string,
  onRetry: () => void,
  onContinue?: () => void
): AppError {
  const recovery: RecoveryAction[] = [
    {
      label: 'Try Again',
      action: onRetry,
      primary: true,
    },
  ];

  if (onContinue) {
    recovery.push({
      label: 'Continue Without Saving',
      action: onContinue,
    });
  }

  return createAppError('storage', originalError, recovery);
}

/**
 * Create a generation error with default recovery actions
 */
export function createGenerationError(
  originalError: Error | string,
  onRetry: () => void
): AppError {
  return createAppError('generation', originalError, [
    {
      label: 'Try Again',
      action: onRetry,
      primary: true,
    },
    {
      label: 'Go Home',
      action: () => {
        window.location.href = '/';
      },
    },
  ]);
}

/**
 * Create a network error with default recovery actions
 */
export function createNetworkError(
  originalError: Error | string,
  onRetry: () => void
): AppError {
  return createAppError('network', originalError, [
    {
      label: 'Retry',
      action: onRetry,
      primary: true,
    },
  ]);
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Log error details to console for debugging
 * Logs include: error ID, category, timestamp, user agent, URL, and original error
 */
export function logError(error: AppError, originalError?: Error | unknown): void {
  if (error.logged) return; // Already logged

  const logStyle = 'color: #ef4444; font-weight: bold;';
  const labelStyle = 'color: #94a3b8;';

  console.group(
    `%c❌ DadDeck Error: ${error.title}`,
    logStyle
  );

  console.log(`%cError ID:`, labelStyle, error.id);
  console.log(`%cCategory:`, labelStyle, error.category);
  console.log(`%cTime:`, labelStyle, new Date(error.timestamp).toISOString());

  // Add user agent and URL for debugging
  if (typeof window !== 'undefined') {
    console.log(`%cURL:`, labelStyle, window.location.href);
    console.log(`%cUser Agent:`, labelStyle, navigator.userAgent);
  }

  console.log(`%cMessage:`, labelStyle, error.message);

  if (originalError) {
    console.log(`%cOriginal Error:`, labelStyle, originalError);
    if (originalError instanceof Error && originalError.stack) {
      console.log(`%cStack Trace:`, labelStyle, originalError.stack);
    }
  }

  console.groupEnd();

  // Log to Sentry if available
  logToSentry(error, originalError);

  error.logged = true;
}

/**
 * Log error to Sentry with context
 */
function logToSentry(error: AppError, originalError?: Error | unknown): void {
  // Sentry will be imported dynamically to avoid SSR issues
  import('@/lib/sentry').then(({ captureException }) => {
    const context = {
      errorId: error.id,
      category: error.category,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date(error.timestamp).toISOString(),
    };

    if (originalError instanceof Error) {
      captureException(originalError, context);
    } else {
      // Create error from message for non-Error objects
      captureException(new Error(error.message), context);
    }
  }).catch(err => {
    // Silently fail if Sentry is not available
    console.debug('Sentry logging failed:', err);
  });
}

/**
 * Log a warning (non-fatal issue)
 */
export function logWarning(message: string, data?: unknown): void {
  const logStyle = 'color: #f59e0b; font-weight: bold;';
  const labelStyle = 'color: #94a3b8;';

  console.group(`%c⚠️ DadDeck Warning`, logStyle);
  console.log(`%cMessage:`, labelStyle, message);
  if (data) {
    console.log(`%cData:`, labelStyle, data);
  }
  console.groupEnd();
}

/**
 * Log debug info (development only)
 */
export function logDebug(message: string, data?: unknown): void {
  if (import.meta.env.DEV) {
    const logStyle = 'color: #3b82f6; font-weight: bold;';
    const labelStyle = 'color: #94a3b8;';

    console.group(`%c🔍 DadDeck Debug`, logStyle);
    console.log(`%cMessage:`, labelStyle, message);
    if (data) {
      console.log(`%cData:`, labelStyle, data);
    }
    console.groupEnd();
  }
}

// ============================================================================
// ERROR CATEGORIZATION
// ============================================================================

/**
 * Categorize an error based on its properties
 */
export function categorizeError(error: Error | string | unknown): ErrorCategory {
  if (typeof error === 'string') {
    if (error.toLowerCase().includes('storage') || error.toLowerCase().includes('quota')) {
      return 'storage';
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      return 'network';
    }
    return 'unknown';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Storage errors
    if (
      message.includes('storage') ||
      message.includes('quota') ||
      message.includes('localStorage') ||
      name.includes('quotaexceedederror')
    ) {
      return 'storage';
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      name.includes('networkerror')
    ) {
      return 'network';
    }

    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('denied') ||
      message.includes('blocked')
    ) {
      return 'permission';
    }

    // Validation errors
    if (
      message.includes('invalid') ||
      message.includes('parse') ||
      message.includes('expected') ||
      name.includes('syntaxerror')
    ) {
      return 'validation';
    }
  }

  return 'unknown';
}
