/**
 * DadDeck™ Encoder Utilities
 *
 * Reusable encoder/decoder utilities for Nanostores persistentAtom.
 * Handles Date serialization for LocalStorage persistence.
 */

/**
 * Creates a custom encoder for Nanostores persistentAtom that handles Date serialization.
 *
 * This utility eliminates duplicated encoder code across multiple stores by providing
 * a generic way to encode/decode objects containing Date fields.
 *
 * @template T - The type of data being encoded/decoded
 * @param dateFields - Array of dot-notation paths to Date fields (e.g., ['metadata.created', 'packs.openedAt'])
 * @returns A Nanostores-compatible encoder with encode/decode methods
 *
 * @example
 * ```typescript
 * // Simple case: top-level Date fields
 * const encoder = createDateEncoder<Achievement>({
 *   dateFields: ['unlockedAt']
 * });
 *
 * // Nested case: dot notation for nested Date fields
 * const collectionEncoder = createDateEncoder<Collection>({
 *   dateFields: [
 *     'metadata.created',
 *     'metadata.lastOpenedAt',
 *     'packs.openedAt'
 *   ]
 * });
 *
 * // Array case: Date fields in array elements
 * const historyEncoder = createDateEncoder<BattleHistoryEntry[]>({
 *   dateFields: ['timestamp', 'result.timestamp']
 * });
 * ```
 */
export function createDateEncoder<T>({
  dateFields = [],
}: {
  /**
   * Array of dot-notation paths to Date fields in the data structure.
   *
   * Examples:
   * - 'unlockedAt' → Top-level field
   * - 'metadata.created' → Nested field
   * - 'packs.openedAt' → Field in array elements
   * - 'result.timestamp' → Field in nested object
   */
  dateFields?: string[];
}) {
  return {
    /**
     * Encodes data to JSON string, converting Date objects to ISO strings.
     *
     * @param data - The data to encode
     * @returns JSON string with Dates as ISO strings
     */
    encode(data: T): string {
      return JSON.stringify(data, (_key, value) => {
        // Convert Date objects to ISO strings during JSON.stringify
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
    },

    /**
     * Decodes JSON string back to data type, converting ISO strings back to Date objects.
     *
     * This handles both simple cases (single Date field) and complex cases
     * (nested objects, arrays, multiple Date fields per object).
     *
     * @param str - The JSON string to decode
     * @returns The decoded data with Date objects restored
     */
    decode(str: string): T {
      const data = JSON.parse(str);

      // If no date fields specified, return data as-is
      if (dateFields.length === 0) {
        return data;
      }

      // Convert ISO strings back to Date objects based on field paths
      for (const fieldPath of dateFields) {
        // Split path into parts (e.g., 'metadata.created' → ['metadata', 'created'])
        const parts = fieldPath.split('.');

        if (parts.length === 1) {
          // Simple case: top-level field
          const fieldName = parts[0];
          if (Array.isArray(data)) {
            // Handle array of objects
            data.forEach((item: any) => {
              if (item[fieldName]) {
                item[fieldName] = new Date(item[fieldName]);
              }
            });
          } else if (data[fieldName]) {
            // Handle single object
            data[fieldName] = new Date(data[fieldName]);
          }
        } else {
          // Complex case: nested field or field in array elements
          const parentPath = parts.slice(0, -1).join('.');
          const leafField = parts[parts.length - 1];

          // Navigate to parent object/array
          let parent = data;
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];

            // Handle array indices (e.g., 'packs.0.openedAt')
            if (typeof parent === 'object' && parent !== null) {
              if (Array.isArray(parent)) {
                // Apply to all elements in array
                parent.forEach((item: any) => {
                  if (item && item[leafField]) {
                    item[leafField] = new Date(item[leafField]);
                  }
                });
                break; // Done processing array
              } else if (part in parent) {
                parent = parent[part];
              } else {
                break; // Path doesn't exist
              }
            } else {
              break; // Can't navigate further
            }
          }

          // Convert leaf field to Date
          if (parent && parent[leafField]) {
            if (Array.isArray(parent)) {
              // Handle array of objects with the same field
              parent.forEach((item: any) => {
                if (item && item[leafField]) {
                  item[leafField] = new Date(item[leafField]);
                }
              });
            } else if (typeof parent === 'object' && parent[leafField]) {
              parent[leafField] = new Date(parent[leafField]);
            }
          }
        }
      }

      return data;
    },
  };
}
