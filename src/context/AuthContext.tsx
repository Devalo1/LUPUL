import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/index';
import { ApiResponse, UserData, AppError } from '../types/common';

// Update the import path to the correct filename
import { AuthContext, formatAuthError, formatUserData } from './authContextUtils';

// Only export the component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use onAuthStateChanged directly instead of auth.onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      logger.info('Auth state changed', { context: 'Auth', data: { userExists: !!user } });
      setCurrentUser(user ? formatUserData(user) : null);
      // Ensure loading is set to false regardless of authentication status
      setLoading(false);
    });

    // Handle potential errors in auth state change
    const authErrorHandler = () => {
      // If there's an error, still set loading to false so UI isn't blocked
      setLoading(false);
    };

    // Add error handling
    auth.onAuthStateChanged(null, authErrorHandler);

    return () => {
      unsubscribe();
    };
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
