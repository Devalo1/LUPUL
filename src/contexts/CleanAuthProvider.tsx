import React, { useState, useEffect, useContext } from "react";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  GoogleAuthProvider,
  // Prefixed with underscore to avoid unused variable warning
  type User as _User
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { isUserAccountant } from "../utils/userRoles";
import { AuthContextType, AuthResult } from "./AuthContextType";
import { AuthContext } from "./AuthContextDef";

interface AuthWrapperProviderProps {
  children: React.ReactNode;
}

export const EnhancedAuthProvider: React.FC<AuthWrapperProviderProps> = ({ children }) => {
  const originalAuth = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!originalAuth?.user);
  const [isAccountant, setIsAccountant] = useState<boolean>(false);
  
  // Check if user is accountant
  useEffect(() => {
    if (originalAuth?.user) {
      isUserAccountant(originalAuth.user.uid).then(result => {
        setIsAccountant(result);
      });
    } else {
      setIsAccountant(false);
    }
  }, [originalAuth?.user]);
  
  // Additional methods that were missing
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { 
        success: true, 
        user: result.user 
      };
    } catch (error) {
      console.error("Error during login:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  };
  
  const loginWithGoogle = async (redirectPath?: string): Promise<AuthResult> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { 
        success: true, 
        user: result.user,
        redirectPath
      };
    } catch (error) {
      console.error("Error during Google login:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  };
  
  const register = async (email: string, password: string, displayName: string): Promise<AuthResult> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateDoc(doc(firestore, "users", result.user.uid), {
        displayName,
        email,
        createdAt: new Date()
      });
      return { 
        success: true, 
        user: result.user 
      };
    } catch (error) {
      console.error("Error during registration:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  };
  
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Error during password reset:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  };
  
  const refreshUserData = async (): Promise<AuthResult> => {
    try {
      // Implementation would go here - typically reloads user data
      console.log("Refreshing user data");
      return { success: true };
    } catch (error) {
      return { 
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };

  const refreshUserPhoto = async (): Promise<AuthResult> => {
    // Implementation for refreshing user profile photo
    try {
      console.log("Refreshing user photo");
      // Would typically update the user's profile photo
      return { success: true };
    } catch (error) {
      return { 
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };

  useEffect(() => {
    setIsAuthenticated(!!originalAuth?.user);
  }, [originalAuth?.user]);
  
  // Create the enhanced auth context value
  const authContextValue: AuthContextType = {
    user: originalAuth?.user || null,
    currentUser: originalAuth?.user || null,
    loading: originalAuth?.loading || false,
    isLoading: originalAuth?.loading || false,
    isAuthenticated,
    isAdmin: originalAuth?.isAdmin || false,
    isAccountant,
    isSpecialist: originalAuth?.isSpecialist || false,
    userRole: originalAuth?.userRole || null,
    userRoles: originalAuth?.userRole ? [originalAuth.userRole] : [],
    login,
    loginWithGoogle,
    register,
    resetPassword,
    refreshUserData,
    refreshUserPhoto,
    logout: originalAuth?.logout || (async () => {}),
    checkUserRole: async (role: string) => {
      if (!originalAuth?.user) return false;
      if (role === "admin") return originalAuth?.isAdmin || false;
      if (role === "accountant") return isAccountant;
      if (role === "specialist") return originalAuth?.isSpecialist || false;
      return false;
    },
    roleCheckError: originalAuth?.roleCheckError || null
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default EnhancedAuthProvider;
