// Auth related types

// Authentication method types
export enum AuthMethod {
  EMAIL = "email",
  GOOGLE = "google",
  FACEBOOK = "facebook",
  PHONE = "phone"
}

// Auth state related types
export interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
}

// Auth user type
export interface AuthUser {
  uid: string;
  email: string; // Changed from string | null to string
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  isAdmin?: boolean;
  authMethod?: AuthMethod;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

// Authentication credentials
export interface AuthCredentials {
  email: string;
  password: string;
}

// Auth context types
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

// Reset password request 
export interface ResetPasswordRequest {
  email: string;
}

// Registration data
export interface RegistrationData {
  email: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
  acceptTerms: boolean;
}

// Login response
export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

// Authentication error
export interface AuthError {
  code: string;
  message: string;
}

// User type
export interface User {
  uid: string;
  email: string; // Changed from string | null to string
  displayName: string | null;
  photoURL: string | null;
  lastLogin?: any;
  updatedAt?: any;
  createdAt?: any;
  isAdmin?: boolean;
  role?: string;
}

export type UserProfile = User & {
  [key: string]: any;
};
