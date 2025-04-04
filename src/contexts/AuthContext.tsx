import React, { useState, useEffect } from 'react';
// Import auth from the main Firebase config
import { auth } from '../firebase/index';
import { logger } from '../utils/debug';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { ApiResponse, UserData, AppError } from '../types/common';
// Fix the import path to point to the correct directory
import { AuthContext, formatAuthError, formatUserData } from '../contexts/authContextUtils';

// Define interface for props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Only export the component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use onAuthStateChanged directly instead of auth.onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      logger.info('Auth state changed', { context: 'Auth', data: { userExists: !!user } });
      setCurrentUser(user ? formatUserData(user) : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string): Promise<ApiResponse<UserData>> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        data: formatUserData(userCredential.user)
      };
    } catch (error) {
      return {
        success: false,
        error: formatAuthError(error as AppError)
      };
    }
  };

  const login = async (email: string, password: string): Promise<ApiResponse<UserData>> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        data: formatUserData(userCredential.user)
      };
    } catch (error) {
      return {
        success: false,
        error: formatAuthError(error as AppError)
      };
    }
  };

  const signOut = async (): Promise<ApiResponse<void>> => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: formatAuthError(error as AppError)
      };
    }
  };

  const resetPassword = async (email: string): Promise<ApiResponse<void>> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: formatAuthError(error as AppError)
      };
    }
  };

  const value = {
    currentUser,
    loading,
    signUp,
    login,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
