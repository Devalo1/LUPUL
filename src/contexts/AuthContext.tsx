import { createContext, useContext } from "react";
import { User } from "../types/user";
import { User as FirebaseUser } from "firebase/auth";
import { AuthResult } from "../types/AuthContextUtils";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  isAdmin: boolean;
  isSpecialist?: boolean;
  userRole?: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (redirectTo?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<AuthResult>;
  resetAuthError: () => void;
  resetPassword: (email: string) => Promise<AuthResult>;
  refreshUserData: () => Promise<void>;
  currentUser: User | null;
  refreshUserPhoto: () => Promise<void>;
  getProfilePhotoURL: () => string | null;
  profilePhotoTimestamp: number;
}

// Initialize with empty defaults that match the type
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  isAdmin: false,
  isSpecialist: false,
  userRole: null,
  loading: true,
  error: null,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
  resetAuthError: () => {},
  resetPassword: async () => ({ success: false }),
  refreshUserData: async () => {},
  currentUser: null,
  refreshUserPhoto: async () => {},
  getProfilePhotoURL: () => null,
  profilePhotoTimestamp: 0,
};

// Create the context with defaults
export const AuthContext = createContext<AuthContextType>(defaultContext);

// Export the useAuth hook directly from this file
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
