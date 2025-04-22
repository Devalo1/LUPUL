import React, { createContext, useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../firebase";
import authService from "../services/AuthService";
import { doc, getDoc } from "firebase/firestore";
import { handleUnknownError } from "../utils/errorTypes";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (redirectTo?: string) => Promise<unknown>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  logOut: () => Promise<void>; // Alias for logout
  register: (email: string, password: string) => Promise<User>; // Alias for signup
  resetPassword: (email: string) => Promise<void>; // Add resetPassword method
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  error: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log("AuthProvider inițializat");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log("AuthProvider mounted");

    // Auth state change handler
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. Current user:", user);
      setCurrentUser(user);
      setIsAuthenticated(!!user);

      if (user) {
        try {
          // Verificăm dacă utilizatorul are rol de admin în Firestore
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const isUserAdmin = userData.isAdmin === true || userData.role === "admin";
            setIsAdmin(isUserAdmin);
            console.log(`Utilizatorul ${user.email} are rol de admin: ${isUserAdmin}`);
          } else {
            // Verificăm special pentru utilizatorul admin principal
            setIsAdmin(user.email === "dani_popa21@yahoo.ro");
          }
        } catch (err) {
          console.error("Eroare la verificarea rolului de admin:", err);
          // Verificăm special pentru utilizatorul admin principal
          setIsAdmin(user.email === "dani_popa21@yahoo.ro");
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      console.log("AuthProvider unmounted");
      unsubscribe();
    };
  }, []);

  // Login cu email și parolă - folosim AuthService
  const login = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const userCredential = await authService.login(email, password);
      return userCredential.user;
    } catch (error: unknown) {
      console.error("Eroare la autentificare:", error);
      const err = handleUnknownError(error);
      setError(err.message || "Eroare la autentificare");
      throw error;
    }
  };

  // Login cu Google - folosim AuthService
  const loginWithGoogle = async (redirectTo?: string): Promise<unknown> => {
    setError(null);
    try {
      console.log("Starting Google login with redirectTo:", redirectTo || "/dashboard");
      // Store the redirect path in sessionStorage for after authentication
      sessionStorage.setItem("afterLoginRedirect", redirectTo || "/dashboard");
      
      // Call the loginWithGoogle method from AuthService
      const result = await authService.loginWithGoogle(redirectTo || "/dashboard");
      
      console.log("Google login initiated, result:", result);
      
      // Note: The actual redirect will happen in the redirect handler
      // after the Google authentication process completes
      
      return result;
    } catch (error: unknown) {
      console.error("Error initiating Google auth:", error);
      const err = handleUnknownError(error);
      setError(err.message || "Error initiating Google authentication");
      throw error;
    }
  };

  // Înregistrare cu email și parolă - folosim AuthService
  const signup = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const userCredential = await authService.signUp(email, password);
      return userCredential.user;
    } catch (error: unknown) {
      console.error("Eroare la înregistrare:", error);
      const err = handleUnknownError(error);
      setError(err.message || "Eroare la înregistrare");
      throw error;
    }
  };

  // Alias pentru signup -> register (compatibilitate cu componentele existente)
  const register = async (email: string, password: string): Promise<User> => {
    return signup(email, password);
  };

  // Deconectare - folosim AuthService
  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await authService.logout();
    } catch (error: unknown) {
      console.error("Eroare la deconectare:", error);
      const err = handleUnknownError(error);
      setError(err.message || "Eroare la deconectare");
      throw error;
    }
  };

  // Alias pentru logout -> logOut (compatibilitate cu componentele existente)
  const logOut = async (): Promise<void> => {
    return logout();
  };

  // Resetare parolă - folosim AuthService
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      await authService.resetPassword(email);
    } catch (error: unknown) {
      console.error("Eroare la resetarea parolei:", error);
      const err = handleUnknownError(error);
      setError(err.message || "Eroare la resetarea parolei");
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    loginWithGoogle,
    signup,
    logout,
    logOut,
    register,
    resetPassword,
    loading,
    setLoading,
    setCurrentUser,
    error,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export AuthContext for use in the hook
export default AuthContext;