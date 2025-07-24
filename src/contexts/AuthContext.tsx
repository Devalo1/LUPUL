import { createContext, useContext } from "react";
import { User } from "../types/user";
import { User as FirebaseUser } from "firebase/auth";
import { AuthResult } from "../types/AuthContextUtils";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  isAdmin: boolean;
  isSpecialist: boolean;
  isAccountant: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (redirectTo?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<AuthResult>;
  resetAuthError: () => void;
  resetPassword: (email: string) => Promise<AuthResult>;
  currentUser: User | null;
  userRole?: string | null;
  refreshUserData?: () => Promise<void>;
  refreshUserPhoto?: () => Promise<void>;
  refreshAdminStatus?: () => Promise<void>;
}

// Initialize with empty defaults that match the type
const defaultContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  isAdmin: false,
  isSpecialist: false,
  isAccountant: false,
  loading: true,
  error: null,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => {},
  register: async () => ({ success: false }),
  resetAuthError: () => {},
  resetPassword: async () => ({ success: false }),
  currentUser: null,
  userRole: null,
  refreshUserData: async () => {},
  refreshUserPhoto: async () => {},
  refreshAdminStatus: async () => {},
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
