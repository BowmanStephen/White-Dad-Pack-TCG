/**
 * Admin Authentication Store
 *
 * Manages admin authentication and authorization.
 * Uses localStorage for demo purposes - in production, use server-side auth.
 */

import { atom, map } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import type {
  AuthSession,
  AuthState,
  AdminUser,
  UserRole,
  LoginCredentials,
} from '@/types';

// ============================================================================
// DEFAULT ADMIN USERS (for demo)
// ============================================================================

/**
 * Default admin users.
 * In production, these would be stored server-side with proper password hashing.
 * For demo purposes, we use hardcoded credentials.
 */
const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin_001',
    username: 'admin',
    passwordHash: 'admin123', // In production: bcrypt.hash('admin123', 10)
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    lastLogin: undefined,
    isActive: true,
  },
  {
    id: 'mod_001',
    username: 'moderator',
    passwordHash: 'mod123', // In production: bcrypt.hash('mod123', 10)
    role: 'moderator',
    createdAt: new Date('2024-01-01'),
    lastLogin: undefined,
    isActive: true,
  },
];

// ============================================================================
// PERSISTENT STATE
// ============================================================================

/**
 * Admin users stored in localStorage
 * Note: This is NOT secure for production. Use server-side auth.
 */
const adminUsersStore = persistentAtom<AdminUser[]>('admin-users', DEFAULT_ADMIN_USERS, {
  encode: (value) => JSON.stringify(value),
  decode: (str) => {
    try {
      const parsed = JSON.parse(str);
      // Rehydrate Date objects
      return parsed.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined,
      }));
    } catch {
      return DEFAULT_ADMIN_USERS;
    }
  },
});

/**
 * Current auth session stored in localStorage
 */
const sessionStore = persistentAtom<AuthSession | null>('admin-session', null, {
  encode: (value) => JSON.stringify(value),
  decode: (str) => {
    try {
      if (!str) return null;
      const parsed = JSON.parse(str);
      // Rehydrate Date objects
      return {
        ...parsed,
        expiresAt: new Date(parsed.expiresAt),
        loginAt: new Date(parsed.loginAt),
        lastActivity: new Date(parsed.lastActivity),
      };
    } catch {
      return null;
    }
  },
});

// ============================================================================
// AUTH STATE
// ============================================================================

/**
 * Main authentication state
 */
export const authState = map<AuthState>({
  status: 'unauthenticated',
  session: null,
  error: null,
  isLoading: false,
});

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Initialize auth state from stored session
 * Checks if session exists and is still valid
 */
export function initializeAuth(): void {
  const session = sessionStore.get();
  if (!session) {
    authState.set({
      status: 'unauthenticated',
      session: null,
      error: null,
      isLoading: false,
    });
    return;
  }

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    logout();
    return;
  }

  // Session is valid
  authState.set({
    status: 'authenticated',
    session,
    error: null,
    isLoading: false,
  });
}

/**
 * Login with credentials
 */
export async function login(credentials: LoginCredentials): Promise<boolean> {
  authState.setKey('isLoading', true);
  authState.setKey('error', null);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const users = adminUsersStore.get();
    const user = users.find(
      (u) => u.username === credentials.username &&
             u.passwordHash === credentials.password &&
             u.isActive
    );

    if (!user) {
      authState.set({
        status: 'unauthenticated',
        session: null,
        error: 'Invalid username or password',
        isLoading: false,
      });
      return false;
    }

    // Create session (expires in 24 hours)
    const now = new Date();
    const session: AuthSession = {
      userId: user.id,
      username: user.username,
      role: user.role,
      token: generateSessionToken(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
      loginAt: now,
      lastActivity: now,
    };

    // Update user last login
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, lastLogin: now } : u
    );
    adminUsersStore.set(updatedUsers);

    // Save session
    sessionStore.set(session);

    // Update state
    authState.set({
      status: 'authenticated',
      session,
      error: null,
      isLoading: false,
    });

    return true;
  } catch (error) {
    authState.set({
      status: 'unauthenticated',
      session: null,
      error: error instanceof Error ? error.message : 'Login failed',
      isLoading: false,
    });
    return false;
  }
}

/**
 * Logout current user
 */
export function logout(): void {
  sessionStore.set(null);
  authState.set({
    status: 'unauthenticated',
    session: null,
    error: null,
    isLoading: false,
  });
}

/**
 * Check if current user has required role
 */
export function hasRole(requiredRole: UserRole): boolean {
  const session = authState.get().session;
  if (!session) return false;

  // Admin has all permissions
  if (session.role === 'admin') return true;

  // Moderator can access moderator-level and below
  if (requiredRole === 'moderator' && session.role === 'moderator') return true;
  if (requiredRole === 'user') return true;

  return false;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return authState.get().status === 'authenticated';
}

/**
 * Get current session
 */
export function getSession(): AuthSession | null {
  return authState.get().session;
}

/**
 * Update session activity (refresh token expiration)
 */
export function updateActivity(): void {
  const session = sessionStore.get();
  if (!session) return;

  const now = new Date();
  const updatedSession: AuthSession = {
    ...session,
    lastActivity: now,
    // Extend expiration by 1 hour from now
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  };

  sessionStore.set(updatedSession);
  authState.setKey('session', updatedSession);
}

// ============================================================================
// USER MANAGEMENT FUNCTIONS (for admin)
// ============================================================================

/**
 * Get all admin users
 */
export function getAllAdminUsers(): AdminUser[] {
  return adminUsersStore.get();
}

/**
 * Create a new admin user
 */
export async function createAdminUser(
  username: string,
  password: string,
  role: UserRole
): Promise<AdminUser | null> {
  const users = adminUsersStore.get();

  // Check if username exists
  if (users.some((u) => u.username === username)) {
    authState.setKey('error', 'Username already exists');
    return null;
  }

  const newUser: AdminUser = {
    id: `admin_${Date.now()}`,
    username,
    passwordHash: password, // In production: bcrypt.hash(password, 10)
    role,
    createdAt: new Date(),
    isActive: true,
  };

  const updatedUsers = [...users, newUser];
  adminUsersStore.set(updatedUsers);

  return newUser;
}

/**
 * Update admin user
 */
export async function updateAdminUser(
  userId: string,
  updates: Partial<Pick<AdminUser, 'role' | 'isActive'>>
): Promise<boolean> {
  const users = adminUsersStore.get();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    authState.setKey('error', 'User not found');
    return false;
  }

  const updatedUsers = [...users];
  updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...updates };
  adminUsersStore.set(updatedUsers);

  return true;
}

/**
 * Change admin user password
 */
export async function changePassword(
  userId: string,
  newPassword: string
): Promise<boolean> {
  const users = adminUsersStore.get();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    authState.setKey('error', 'User not found');
    return false;
  }

  const updatedUsers = [...users];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    passwordHash: newPassword, // In production: bcrypt.hash(newPassword, 10)
  };
  adminUsersStore.set(updatedUsers);

  return true;
}

/**
 * Delete admin user
 */
export async function deleteAdminUser(userId: string): Promise<boolean> {
  const users = adminUsersStore.get();

  // Cannot delete yourself
  const currentSession = sessionStore.get();
  if (currentSession && currentSession.userId === userId) {
    authState.setKey('error', 'Cannot delete your own account');
    return false;
  }

  if (!users.some((u) => u.id === userId)) {
    authState.setKey('error', 'User not found');
    return false;
  }

  const updatedUsers = users.filter((u) => u.id !== userId);
  adminUsersStore.set(updatedUsers);

  return true;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a random session token
 */
function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Auto-refresh activity check (call periodically)
 */
export function startActivityCheck(): () => void {
  const interval = setInterval(() => {
    if (isAuthenticated()) {
      updateActivity();
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  return () => clearInterval(interval);
}

// Initialize auth on module load
initializeAuth();
