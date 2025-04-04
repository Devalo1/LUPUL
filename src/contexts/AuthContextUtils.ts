import { createContext, useContext } from 'react';
import { UserData, ApiResponse } from '../types/common';

// Define the AuthContext type
interface AuthContextType {
  currentUser: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<UserData>>;
  signUp: (email: string, password: string) => Promise<ApiResponse<UserData>>;
  resetPassword: (email: string) => Promise<ApiResponse<void>>;
  signOut: () => Promise<ApiResponse<void>>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
