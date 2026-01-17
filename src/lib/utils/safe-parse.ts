/**
 * Safely parse JSON with error handling and optional default value.
 * 
 * @param json - The JSON string to parse
 * @param defaultValue - Optional fallback value if parsing fails
 * @returns Parsed value, default value, or null if parsing fails
 */
export function safeJsonParse<T>(json: string, defaultValue?: T): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue ?? null;
  }
}

/**
 * Safely parse JSON from localStorage with error handling.
 * Handles both missing keys and invalid JSON.
 * 
 * @param key - The localStorage key to read
 * @param defaultValue - Fallback value if key missing or parse fails
 * @returns Parsed value or default
 */
export function safeLocalStorageParse<T>(key: string, defaultValue: T): T {
  if (typeof localStorage === 'undefined') {
    return defaultValue;
  }
  
  const stored = localStorage.getItem(key);
  if (!stored) {
    return defaultValue;
  }
  
  return safeJsonParse<T>(stored, defaultValue) ?? defaultValue;
}
