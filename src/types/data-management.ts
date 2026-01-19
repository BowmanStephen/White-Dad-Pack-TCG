// ============================================================================
// DATA MANAGEMENT TYPES (PACK-075 - Settings - Clear Data)
// ============================================================================

// Result type for data clearing operations
export interface ClearDataResult {
  success: boolean;
  cleared: 'collection' | 'settings' | 'all';
  message: string;
  error?: string;
}
