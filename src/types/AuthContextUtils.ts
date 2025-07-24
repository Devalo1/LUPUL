import { User as FirebaseUser } from "firebase/auth";

export interface AuthState {
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  isAdmin: boolean;
  isSpecialist: boolean;
  isAccountant: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: FirebaseUser;
  isAdmin?: boolean;
  redirectPath?: string;
  error?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (redirectTo?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<AuthResult>;
  resetAuthError: () => void;
  resetPassword: (email: string) => Promise<AuthResult>;
}
