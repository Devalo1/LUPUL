import { User } from "firebase/auth";

/**
 * The result of an authentication operation
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string | Error;
  redirectPath?: string;
}

// Create a new interface that includes all the required methods
export interface AuthContextType {
  user: User | null;
  currentUser: User | null; // Alias for backward compatibility
  loading: boolean;
  isLoading: boolean; // Alias for backward compatibility
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAccountant: boolean;
  isSpecialist: boolean;
  userRole: string | null;
  userRoles: string[];  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (redirectPath?: string) => Promise<AuthResult>;
  register: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  checkUserRole: (role: string) => Promise<boolean>;
  refreshUserData: () => Promise<AuthResult>;
  refreshUserPhoto: () => Promise<AuthResult>;
  roleCheckError: string | null;
}

// Default auth context value
export const defaultAuthContextValue: AuthContextType = {
  user: null,
  currentUser: null,
  loading: true,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isAccountant: false,
  isSpecialist: false,
  userRole: null,
  userRoles: [],  login: async () => { 
    throw new Error("Not implemented");
    return { success: false, error: "Not implemented" };
  },
  loginWithGoogle: async () => { 
    throw new Error("Not implemented");
    return { success: false, error: "Not implemented" };
  },
  register: async () => { 
    throw new Error("Not implemented");
    return { success: false, error: "Not implemented" };
  },
  resetPassword: async () => { throw new Error("Not implemented"); },
  logout: async () => { throw new Error("Not implemented"); },
  checkUserRole: async () => false,  refreshUserData: async () => { 
    throw new Error("Not implemented");
    return { success: false, error: "Not implemented" };
  },
  refreshUserPhoto: async () => { 
    throw new Error("Not implemented");
    return { success: false, error: "Not implemented" };
  },
  roleCheckError: null
};
