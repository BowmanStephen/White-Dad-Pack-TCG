/**
 * Admin Panel and CMS Types
 *
 * This module defines all types for the admin content management system including:
 * - Authentication and authorization
 * - Card CRUD operations
 * - Pack configuration
 * - Announcement management
 * - User moderation
 * - Analytics dashboard
 */

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * User role types for authorization
 */
export type UserRole = 'admin' | 'moderator' | 'user';

/**
 * Authentication session status
 */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'pending';

/**
 * User credentials for login
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Authentication session data
 */
export interface AuthSession {
  userId: string;
  username: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
  loginAt: Date;
  lastActivity: Date;
}

/**
 * Authentication state for UI
 */
export interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Admin user configuration (for demo/local storage)
 * In production, this would be stored server-side
 */
export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string; // Hashed password
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// ============================================================================
// CARD CRUD TYPES
// ============================================================================

/**
 * Card creation form data
 */
export interface CardFormData {
  id: string;
  name: string;
  subtitle: string;
  type: import('./index').DadType;
  rarity: import('./index').Rarity;
  artwork: string;
  stats: import('./index').CardStats;
  flavorText: string;
  abilities: import('./index').CardAbility[];
  series: number;
  cardNumber: number;
  totalInSeries: number;
  artist: string;
  holoVariant?: import('./index').HoloVariant;
  seasonId?: import('./index').SeasonId;
}

/**
 * Card edit state
 */
export type CardEditState = 'idle' | 'creating' | 'editing' | 'saving' | 'deleting';

/**
 * Card management state
 */
export interface CardManagementState {
  editState: CardEditState;
  selectedCardId: string | null;
  formData: CardFormData | null;
  validationErrors: string[];
  searchQuery: string;
  filterRarity: import('./index').Rarity | null;
  filterType: import('./index').DadType | null;
}

/**
 * Bulk import result
 */
export interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ cardId: string; error: string }>;
}

// ============================================================================
// PACK CONFIGURATION TYPES
// ============================================================================

/**
 * Pack configuration slot (editable)
 */
export interface PackConfigSlot {
  slot: number;
  guaranteedRarity?: import('./index').Rarity;
  rarityPool: boolean;
  probability: Partial<Record<import('./index').Rarity, number>>;
}

/**
 * Editable pack configuration
 */
export interface EditablePackConfig {
  id: string;
  name: string;
  cardsPerPack: number;
  holoChance: number; // 0-1
  slots: PackConfigSlot[];
  isActive: boolean;
}

/**
 * Pack configuration state
 */
export interface PackConfigState {
  configs: EditablePackConfig[];
  selectedConfigId: string | null;
  isEditing: boolean;
  isSaving: boolean;
  validationErrors: string[];
}

// ============================================================================
// ANNOUNCEMENT TYPES
// ============================================================================

/**
 * Announcement priority
 */
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Announcement status
 */
export type AnnouncementStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';

/**
 * Announcement data
 */
export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  createdAt: Date;
  createdBy: string; // Admin username
  scheduledFor?: Date;
  expiresAt?: Date;
  targetAudience?: 'all' | 'logged_in' | 'daddypass' | 'new_users';
  cta?: {
    label: string;
    url: string;
  };
}

/**
 * Announcement form data
 */
export interface AnnouncementFormData {
  title: string;
  message: string;
  priority: AnnouncementPriority;
  scheduledFor?: Date;
  expiresAt?: Date;
  targetAudience: 'all' | 'logged_in' | 'daddypass' | 'new_users';
  cta?: {
    label: string;
    url: string;
  };
}

/**
 * Announcement management state
 */
export interface AnnouncementState {
  announcements: Announcement[];
  selectedAnnouncementId: string | null;
  isEditing: boolean;
  isCreating: boolean;
  formData: AnnouncementFormData | null;
}

// ============================================================================
// USER MODERATION TYPES
// ============================================================================

/**
 * Moderation action types
 */
export type ModerationAction =
  | 'warn'
  | 'mute'
  | 'suspend'
  | 'ban'
  | 'unban'
  | 'delete_content'
  | 'verify';

/**
 * User moderation status
 */
export type ModerationStatus = 'clean' | 'warned' | 'muted' | 'suspended' | 'banned';

/**
 * Moderatable user data (anonymous profile)
 */
export interface ModeratableUser {
  playerId: string;
  username: string;
  pseudonym: string;
  avatarId: import('./index').AvatarId;
  status: ModerationStatus;
  joinedAt: Date;
  lastActive: Date;
  stats: {
    packsOpened: number;
    reportsReceived: number;
    warningsReceived: number;
  };
  securityViolations: number;
  notes: string;
}

/**
 * Moderation action record
 */
export interface ModerationActionRecord {
  id: string;
  userId: string;
  action: ModerationAction;
  reason: string;
  duration?: number; // For suspensions/mutes (hours)
  performedBy: string; // Admin username
  performedAt: Date;
  expiresAt?: Date;
  notes?: string;
}

/**
 * User moderation state
 */
export interface UserModerationState {
  users: ModeratableUser[];
  selectedUserId: string | null;
  actionHistory: ModerationActionRecord[];
  searchQuery: string;
  statusFilter: ModerationStatus | null;
  isPerformingAction: boolean;
}

// ============================================================================
// ANALYTICS DASHBOARD TYPES
// ============================================================================

/**
 * Time range for analytics
 */
export type AnalyticsTimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

/**
 * Analytics metric data point
 */
export interface AnalyticsDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

/**
 * Pack opening analytics
 */
export interface PackOpeningAnalytics {
  totalPacks: number;
  averagePerDay: number;
  byDesign: Record<string, number>;
  byRarity: Record<import('./index').Rarity, number>;
  holoRate: number;
  timeSeries: AnalyticsDataPoint[];
}

/**
 * User analytics
 */
export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  averageSessionDuration: number; // minutes
  timeSeries: AnalyticsDataPoint[];
}

/**
 * Security analytics
 */
export interface SecurityAnalytics {
  totalViolations: number;
  activeBans: number;
  topViolationTypes: Record<import('./security').ViolationType, number>;
  bySeverity: Record<import('./security').ViolationSeverity, number>;
  timeSeries: AnalyticsDataPoint[];
}

/**
 * Monetization analytics
 */
export interface MonetizationAnalytics {
  totalRevenue: number;
  premiumPacksSold: number;
  daddypassSubscriptions: number;
  averageOrderValue: number;
  conversionRate: number;
  timeSeries: AnalyticsDataPoint[];
}

/**
 * Analytics dashboard data
 */
export interface AnalyticsDashboardData {
  timeRange: AnalyticsTimeRange;
  lastUpdated: Date;
  packOpenings: PackOpeningAnalytics;
  users: UserAnalytics;
  security: SecurityAnalytics;
  monetization: MonetizationAnalytics;
}

/**
 * Analytics dashboard state
 */
export interface AnalyticsDashboardState {
  data: AnalyticsDashboardData | null;
  timeRange: AnalyticsTimeRange;
  isLoading: boolean;
  error: string | null;
  refreshInterval: number; // seconds
}

// ============================================================================
// ADMIN UI STATE
// ============================================================================

/**
 * Admin navigation sections
 */
export type AdminSection =
  | 'dashboard'
  | 'cards'
  | 'packs'
  | 'announcements'
  | 'users'
  | 'analytics'
  | 'settings';

/**
 * Overall admin panel state
 */
export interface AdminPanelState {
  currentSection: AdminSection;
  sidebarCollapsed: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
}

/**
 * Admin settings configuration
 */
export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  minVersion: string;
  announcementBanner: string | null;
}
