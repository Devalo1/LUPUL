import React, { useState, useEffect, ReactNode, useRef } from "react";
import { auth, firestore } from "../firebase";
import { 
  onAuthStateChanged, 
  User
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { isUserSpecialist, isUserAccountant, isUserAdmin } from "../utils/userRoles";
import { AuthResult, AuthContextType } from "./AuthContextType";
import { AuthContext } from "./AuthContextDef";

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function for timeout-protected role checks
const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, defaultValue: T): Promise<T> => {
  try {
    const result = await Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(defaultValue), timeoutMs))
    ]);
    return result;
  } catch (error) {
    console.error("Error in withTimeout:", error);
    return defaultValue;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAccountant, setIsAccountant] = useState<boolean>(false);
  const [isSpecialist, setIsSpecialist] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleCheckError, setRoleCheckError] = useState<string | null>(null);
  
  // Use refs to track if component is still mounted
  const isMounted = useRef(true);
  
  // Track ongoing role check operations
  const roleCheckInProgress = useRef(false);

  // Functions for role checking
  const checkAdminStatus = async (user: User): Promise<void> => {
    try {
      const isAdmin = await withTimeout(isUserAdmin(user.uid), 5000, false);
      if (isMounted.current) {
        setIsAdmin(isAdmin);
      }
    } catch (error) {
      console.error("Admin check failed:", error);
    }
  };
  
  const checkAccountantStatus = async (user: User): Promise<void> => {
    try {
      const isAccountant = await withTimeout(isUserAccountant(user.uid), 5000, false);
      if (isMounted.current) {
        setIsAccountant(isAccountant);
      }
    } catch (error) {
      console.error("Accountant check failed:", error);
    }
  };
  
  const checkSpecialistStatus = async (user: User): Promise<void> => {
    try {
      const isSpecialist = await withTimeout(isUserSpecialist(user.uid), 5000, false);
      if (isMounted.current) {
        setIsSpecialist(isSpecialist);
      }
    } catch (error) {
      console.error("Specialist check failed:", error);
    }
  };
  
  const determineUserRole = async (user: User): Promise<void> => {
    try {
      // Check if we have custom claims in token
      const userRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      let role = "user"; // Default role
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role) {
          role = userData.role;
        }
      }
      
      // Update state if component is still mounted
      if (isMounted.current) {
        setUserRole(role);
        // Cache the role for quick access on reload
        localStorage.setItem("userRole", role);
      }
    } catch (error) {
      console.error("Error determining user role:", error);
      if (isMounted.current) {
        setUserRole("user"); // Default to user role on error
      }
    }
  };

  // Check for cached roles to provide instant feedback
  useEffect(() => {
    const cachedRole = localStorage.getItem("userRole");
    if (cachedRole && !userRole) {
      console.log(`Using cached role from localStorage: ${cachedRole}`);
      setUserRole(cachedRole);
      
      // Set role flags based on cached value
      if (cachedRole === "admin") setIsAdmin(true);
      if (cachedRole === "accountant") setIsAccountant(true);
      if (cachedRole === "specialist") setIsSpecialist(true);
    }
  }, []);

  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Monitor auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Safety mechanism: if role check is already in progress, don't start another one
        if (roleCheckInProgress.current) {
          console.warn("Role check already in progress, skipping duplicate check");
        } else {
          roleCheckInProgress.current = true;
          
          try {
            // Set timeout for the combined role checking process
            const roleCheckPromise = Promise.all([
              checkAdminStatus(currentUser),
              checkAccountantStatus(currentUser),
              checkSpecialistStatus(currentUser),
              determineUserRole(currentUser)
            ]);
            
            // Wait for role checks with a 10 second timeout
            await Promise.race([
              roleCheckPromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Verificarea rolului a expirat")), 10000)
              )
            ]);
          } catch (error) {
            console.error("Role check timed out or failed:", error);
            setRoleCheckError("Verificarea rolului a eșuat. Folosiți butonul de reîmprospătare pentru a încerca din nou.");
            
            // Fall back to user role if timeout occurs
            if (!userRole) setUserRole("user");
          } finally {
            if (isMounted.current) {
              roleCheckInProgress.current = false;
              setLoading(false);
            }
          }
        }
      } else {
        // User is signed out
        setIsAdmin(false);
        setIsAccountant(false);
        setIsSpecialist(false);
        setUserRole(null);
        setLoading(false);
        
        // Clear cached role on logout
        localStorage.removeItem("userRole");
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Function to check if user has a specific role
  const checkUserRole = async (role: string): Promise<boolean> => {
    if (!user) return false;
    
    switch(role.toLowerCase()) {
      case "admin":
        return isAdmin;
      case "accountant":
        return isAccountant;
      case "specialist":
        return isSpecialist;
      case "user":
        return true; // All authenticated users have the basic user role
      default:
        return false;
    }
  };

  // Function to refresh user data after changes
  const refreshUserData = async (): Promise<AuthResult> => {
    try {
      setRoleCheckError(null);
      
      if (!user) {
        return { success: false, error: "No user logged in" };
      }
      
      // Re-run role checks
      await Promise.all([
        checkAdminStatus(user),
        checkAccountantStatus(user),
        checkSpecialistStatus(user),
        determineUserRole(user)
      ]);
      
      return { success: true };
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setRoleCheckError("Failed to refresh user data");
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to refresh user data" 
      };
    }
  };

  // Function to refresh user profile photo
  const refreshUserPhoto = async (): Promise<AuthResult> => {
    try {
      if (!user) {
        return { success: false, error: "No user logged in" };
      }
      
      // In a real implementation, this would reload the user's profile photo
      // For now, just return success
      return { success: true };
    } catch (error) {
      console.error("Error refreshing user photo:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to refresh user photo" 
      };
    }
  };

  // Create context value with all required properties
  const contextValue: AuthContextType = {
    user,
    currentUser: user,
    loading,
    isLoading: loading,
    isAdmin,
    isAccountant,
    isSpecialist,
    userRole,
    userRoles: userRole ? [userRole] : [],
    isAuthenticated: !!user,
    checkUserRole,
    refreshUserData,
    refreshUserPhoto,
    logout: async () => { await auth.signOut(); },
    login: async () => { return { success: false, error: "Not implemented in this provider" }; },
    loginWithGoogle: async () => { return { success: false, error: "Not implemented in this provider" }; },
    register: async () => { return { success: false, error: "Not implemented in this provider" }; },
    resetPassword: async () => { return { success: false, error: "Not implemented in this provider" }; },
    roleCheckError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
