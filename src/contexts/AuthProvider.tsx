import React, { createContext, useState, useEffect } from "react";
import { User, onAuthStateChanged, getAuth, updateProfile } from "firebase/auth";
import { auth, firestore } from "../firebase";
import authService from "../services/AuthService";
import { doc, getDoc } from "firebase/firestore";
import { handleUnknownError } from "../utils/errorTypes";
import { initializeTokenRefreshListener, forceTokenRefresh } from "../utils/tokenRefresh";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (redirectTo?: string) => Promise<unknown>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  logOut: () => Promise<void>; // Alias pentru logout
  register: (email: string, password: string) => Promise<User>; // Alias pentru signup
  resetPassword: (email: string) => Promise<void>; // Adăugăm metoda resetPassword
  refreshUserData: () => Promise<void>; // Adăugăm metoda pentru reîmprospătarea datelor utilizatorului
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  error: string | null;
  isAdmin: boolean;
  isSpecialist: boolean; // Adăugat flag pentru rolul specialist
  userRole: string | null; // Adăugat pentru a urmări valoarea efectivă a rolului
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log("AuthProvider inițializat");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    console.log("AuthProvider mounted");

    // Inițializăm listener-ul pentru reîmprospătarea automată a token-urilor
    initializeTokenRefreshListener();

    // Auth state change handler
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. Current user:", user);
      setCurrentUser(user);
      setIsAuthenticated(!!user);

      // Reset role states when user logs out
      if (!user) {
        setIsAdmin(false);
        setIsSpecialist(false);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // Forțăm reîmprospătarea token-ului la autentificare pentru a evita problemele cu token-urile
        await forceTokenRefresh();

        // Verificăm rolul utilizatorului în Firestore
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Setăm rolul utilizatorului
          const role = userData.role || "user";
          setUserRole(role);
          
          // Verificăm dacă este admin
          const isUserAdmin = userData.isAdmin === true || role === "admin";
          setIsAdmin(isUserAdmin);
          
          // Verificăm dacă este specialist
          const isUserSpecialist = role === "specialist";
          setIsSpecialist(isUserSpecialist);
          
          console.log(`Utilizator ${user.email} - Rol: ${role}, Admin: ${isUserAdmin}, Specialist: ${isUserSpecialist}`);
        } else {
          // Verificăm special pentru utilizatorul admin principal
          const isMainAdmin = user.email === "dani_popa21@yahoo.ro";
          setIsAdmin(isMainAdmin);
          setIsSpecialist(false);
          setUserRole(isMainAdmin ? "admin" : "user");
          
          console.log(`Utilizator fără document Firestore - Email: ${user.email}, Admin: ${isMainAdmin}`);
        }
      } catch (err) {
        console.error("Eroare la verificarea rolului utilizatorului:", err);
        // Verificăm special pentru utilizatorul admin principal
        const isMainAdmin = user.email === "dani_popa21@yahoo.ro";
        setIsAdmin(isMainAdmin);
        setIsSpecialist(false);
        setUserRole(isMainAdmin ? "admin" : "user");
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

  // Implementăm funcția refreshUserData pentru a actualiza datele utilizatorului
  const refreshUserData = async (): Promise<void> => {
    if (!currentUser) return;
    
    try {
      console.log("Reîmprospătarea datelor utilizatorului...");
      setLoading(true);
      
      // Reîmprospătăm token-ul pentru a asigura datele actuale
      await forceTokenRefresh();
      
      // Obținem utilizatorul curent din auth
      const auth = getAuth();
      const refreshedUser = auth.currentUser;
      
      if (refreshedUser) {
        // Actualizăm starea currentUser
        setCurrentUser(refreshedUser);
        
        // Verificăm rolul utilizatorului în Firestore
        const userRef = doc(firestore, "users", refreshedUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Setăm rolul utilizatorului
          const role = userData.role || "user";
          setUserRole(role);
          
          // Verificăm dacă este admin
          const isUserAdmin = userData.isAdmin === true || role === "admin";
          setIsAdmin(isUserAdmin);
          
          // Verificăm dacă este specialist
          const isUserSpecialist = role === "specialist";
          setIsSpecialist(isUserSpecialist);
          
          // Sincronizăm fotografia de profil:
          // 1. Dacă există în Firestore, actualizăm utilizatorul din Auth
          // 2. Dacă există în Auth dar nu în Firestore, actualizăm Firestore
          
          // Verificăm dacă există fotografie în Firestore
          if (userData.photoURL && (!refreshedUser.photoURL || userData.photoURL !== refreshedUser.photoURL)) {
            try {
              // Verificăm dacă este base64 (prea lung pentru Auth) sau URL normal
              if (userData.photoURL.startsWith("data:") && userData.photoURL.length > 1000) {
                // Utilizăm avatarURL din Firestore pentru Auth (mai scurt)
                if (userData.avatarURL) {
                  await updateProfile(refreshedUser, { photoURL: userData.avatarURL });
                  console.log("Auth profile updated with avatarURL from Firestore");
                }
              } else {
                // Actualizăm Auth cu photoURL din Firestore
                await updateProfile(refreshedUser, { photoURL: userData.photoURL });
                console.log("Auth profile updated with photoURL from Firestore");
              }
              
              // Actualizăm starea currentUser după update
              setCurrentUser({ ...refreshedUser });
            } catch (photoError) {
              console.error("Error updating Auth profile photo:", photoError);
            }
          }
          
          console.log(`Utilizator reîmprospătat ${refreshedUser.email} - Rol: ${role}, Admin: ${isUserAdmin}, Specialist: ${isUserSpecialist}`);
        }
      }
      
      console.log("Reîmprospătare date utilizator finalizată");
    } catch (error) {
      console.error("Eroare la reîmprospătarea datelor utilizatorului:", error);
    } finally {
      setLoading(false);
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
    refreshUserData, // Adăugăm funcția la context
    loading,
    setLoading,
    setCurrentUser,
    error,
    isAdmin,
    isSpecialist,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export AuthContext for use in the hook
export default AuthContext;