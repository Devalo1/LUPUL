import { createContext, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { ApiResponse, UserData, AppError } from '../types/common';

// Define the AuthContext type
export interface AuthContextType {
  currentUser: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<ApiResponse<UserData>>;
  login: (email: string, password: string) => Promise<ApiResponse<UserData>>;
  signOut: () => Promise<ApiResponse<void>>;
  resetPassword: (email: string) => Promise<ApiResponse<void>>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Format auth error messages
export const formatAuthError = (error: AppError): string => {
  if (!error) return 'An unknown error occurred';

  const errorCode = error.code || '';
  
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email address is already in use';
    case 'auth/weak-password':
      return 'Password is too weak. It should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address format';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection';
    case 'auth/popup-closed-by-user':
      return 'Authentication popup was closed before completion';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed';
    default:
      return error.message || 'An error occurred during authentication';
  }
};

// Format user data
export const formatUserData = (user: FirebaseUser): UserData => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  phoneNumber: user.phoneNumber,
  emailVerified: user.emailVerified,
  isAnonymous: user.isAnonymous,
  metadata: {
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime
  },
  providerData: user.providerData
});

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
