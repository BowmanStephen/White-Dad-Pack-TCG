/**
 * Browser Support Detection & Graceful Degradation
 *
 * Detects unsupported browser features and provides upgrade messaging
 * with graceful degradation for older browsers.
 *
 * @module browser-support
 */

export interface BrowserSupport {
  isSupported: boolean;
  unsupportedFeatures: string[];
  browserName: string;
  browserVersion: number;
  recommendations: string[];
}

export interface SupportCheck {
  feature: string;
  supported: boolean;
  required: boolean;
  polyfillUrl?: string;
}

/**
 * Checks if LocalStorage is available and functional
 */
function checkLocalStorage(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if ES6 features are available
 */
function checkES6Features(): boolean {
  try {
    // Test arrow functions
    const arrow = () => true;

    // Test template literals
    const template = `test`;

    // Test destructuring
    const [a] = [1];

    // Test spread operator
    const spread = [...[1, 2]];

    // Test classes
    class _Test {}

    // Test async/await (basic check)
    return arrow() && template === 'test' && a === 1 && spread.length === 2;
  } catch {
    return false;
  }
}

/**
 * Checks if modern DOM APIs are available
 */
function checkDOMSupport(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    'querySelector' in document &&
    'addEventListener' in window &&
    'classList' in document.createElement('div')
  );
}

/**
 * Checks if CSS Grid is supported
 */
function checkCSSGrid(): boolean {
  try {
    return CSS.supports('display', 'grid');
  } catch {
    return false;
  }
}

/**
 * Checks if CSS Flexbox is supported
 */
function checkFlexbox(): boolean {
  try {
    return CSS.supports('display', 'flex');
  } catch {
    return false;
  }
}

/**
 * Checks if CSS Custom Properties (variables) are supported
 */
function checkCSSVariables(): boolean {
  try {
    return CSS.supports('--test', 'red');
  } catch {
    return false;
  }
}

/**
 * Detects browser name and version
 */
function detectBrowser(): { name: string; version: number } {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 0;

  // Chrome
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1) {
    name = 'Chrome';
    version = parseInt(ua.match(/Chrome\/(\d+)/)?.[1] || '0', 10);
  }
  // Firefox
  else if (ua.indexOf('Firefox') > -1) {
    name = 'Firefox';
    version = parseInt(ua.match(/Firefox\/(\d+)/)?.[1] || '0', 10);
  }
  // Safari
  else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    name = 'Safari';
    version = parseInt(ua.match(/Version\/(\d+)/)?.[1] || '0', 10);
  }
  // Edge
  else if (ua.indexOf('Edge') > -1) {
    name = 'Edge';
    version = parseInt(ua.match(/Edge\/(\d+)/)?.[1] || '0', 10);
  }
  // IE
  else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
    name = 'Internet Explorer';
    version = parseInt(ua.match(/(?:MSIE |rv:)(\d+)/)?.[1] || '0', 10);
  }

  return { name, version };
}

/**
 * Checks browser support for all required features
 */
function runSupportChecks(): SupportCheck[] {
  const checks: SupportCheck[] = [
    {
      feature: 'Local Storage',
      supported: checkLocalStorage(),
      required: true,
    },
    {
      feature: 'ES6 Features',
      supported: checkES6Features(),
      required: true,
    },
    {
      feature: 'Modern DOM APIs',
      supported: checkDOMSupport(),
      required: true,
    },
    {
      feature: 'CSS Grid',
      supported: checkCSSGrid(),
      required: false, // Graceful degradation available
    },
    {
      feature: 'CSS Flexbox',
      supported: checkFlexbox(),
      required: false, // Graceful degradation available
    },
    {
      feature: 'CSS Variables',
      supported: checkCSSVariables(),
      required: false, // Graceful degradation available
    },
  ];

  return checks;
}

/**
 * Generates upgrade recommendations based on unsupported features
 */
function generateRecommendations(unsupportedFeatures: string[]): string[] {
  const recommendations: string[] = [];

  // Critical features missing
  if (unsupportedFeatures.includes('Local Storage')) {
    recommendations.push(
      'Your browser does not support Local Storage. Please enable cookies or upgrade your browser.'
    );
  }

  if (unsupportedFeatures.includes('ES6 Features')) {
    recommendations.push(
      'Your browser does not support modern JavaScript. Please upgrade to a modern browser.'
    );
  }

  if (unsupportedFeatures.includes('Modern DOM APIs')) {
    recommendations.push(
      'Your browser does not support modern web standards. Please upgrade to a modern browser.'
    );
  }

  // Optional features missing (graceful degradation)
  const optionalUnsupported = unsupportedFeatures.filter(f =>
    ['CSS Grid', 'CSS Flexbox', 'CSS Variables'].includes(f)
  );

  if (optionalUnsupported.length > 0) {
    recommendations.push(
      'Some visual features may not display correctly. For the best experience, please upgrade your browser.'
    );
  }

  return recommendations;
}

/**
 * Main browser support check function
 */
export function checkBrowserSupport(): BrowserSupport {
  const checks = runSupportChecks();
  const { name: browserName, version: browserVersion } = detectBrowser();

  const unsupportedRequired = checks.filter(c => !c.supported && c.required);

  const unsupportedOptional = checks.filter(c => !c.supported && !c.required);

  const unsupportedFeatures = [
    ...unsupportedRequired.map(c => c.feature),
    ...unsupportedOptional.map(c => c.feature),
  ];

  const isSupported = unsupportedRequired.length === 0;
  const recommendations = generateRecommendations(unsupportedFeatures);

  return {
    isSupported,
    unsupportedFeatures,
    browserName,
    browserVersion,
    recommendations,
  };
}

/**
 * Returns upgrade URLs for common browsers
 */
export function getUpgradeUrls(): Record<string, string> {
  return {
    Chrome: 'https://www.google.com/chrome/',
    Firefox: 'https://www.mozilla.org/firefox/',
    Safari: 'https://www.apple.com/safari/',
    Edge: 'https://www.microsoft.com/edge',
    'Internet Explorer': 'https://www.microsoft.com/edge',
  };
}

/**
 * Gets the upgrade URL for the current browser
 */
export function getCurrentBrowserUpgradeUrl(): string {
  const { name: browserName } = detectBrowser();
  const urls = getUpgradeUrls();

  return urls[browserName] || urls['Chrome'];
}

/**
 * Checks if the browser is Internet Explorer (always unsupported)
 */
export function isIE(): boolean {
  const ua = navigator.userAgent;
  return ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1;
}

/**
 * Checks if the browser is outdated (more than 2 major versions old)
 */
export function isOutdatedBrowser(): boolean {
  const { name: browserName, version: browserVersion } = detectBrowser();

  const minVersions: Record<string, number> = {
    Chrome: 90,
    Firefox: 88,
    Safari: 14,
    Edge: 90,
    'Internet Explorer': 999, // Always outdated
  };

  const minVersion = minVersions[browserName] || 0;
  return browserVersion < minVersion;
}

/**
 * Returns a user-friendly message about browser support
 */
export function getBrowserSupportMessage(): string {
  const support = checkBrowserSupport();

  if (support.isSupported && !isOutdatedBrowser()) {
    return '';
  }

  if (isIE()) {
    return 'Internet Explorer is not supported. Please upgrade to Microsoft Edge or another modern browser.';
  }

  if (isOutdatedBrowser()) {
    return `Your ${support.browserName} browser is outdated. For the best experience, please update to the latest version.`;
  }

  if (!support.isSupported) {
    return 'Your browser does not support all required features. Please upgrade to a modern browser.';
  }

  return '';
}
