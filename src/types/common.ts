/**
 * Common types used across the application
 */

// Generic response type for API calls
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Error type for handling exceptions
export interface AppError {
  message: string;
  code?: string;
  originalError?: Error;
}

// User related types
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData?: unknown[];
}

// Auth provider data
export interface AuthProviderData {
  providerId: string;
  uid: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
}

// Debug related types
export interface LoggingOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  context?: string;
  data?: Record<string, unknown>;
  nodeEnv?: string;
  exports?: string[];
  buildTime?: string;
  projectId?: string;
  authDomain?: string;
}
