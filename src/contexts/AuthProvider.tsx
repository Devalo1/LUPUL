import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('AuthProvider inițializat');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('AuthProvider mounted');

    // Eliminat apelul către getAuthState
    const authState = null; // Inițializare cu null sau altă valoare implicită
    console.log('Restored auth state:', authState);

    // Additional log for user authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. Current user:', user);
      setCurrentUser(user);
      setIsAuthenticated(!!user);

      if (user) {
        // Check if the user has the admin claim
        const idTokenResult = await user.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      console.log('AuthProvider unmounted');
      unsubscribe();
    };
  }, []);

  // Login cu email și parolă
  const login = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error("Eroare la autentificare:", error);
      setError(error.message || "Eroare la autentificare");
      throw error;
    }
  };

  // Login cu Google
  const loginWithGoogle = async (): Promise<User> => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (error: any) {
      console.error("Eroare la autentificare cu Google:", error);
      setError(error.message || "Eroare la autentificare cu Google");
      throw error;
    }
  };

  // Înregistrare cu email și parolă
  const signup = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error("Eroare la înregistrare:", error);
      setError(error.message || "Eroare la înregistrare");
      throw error;
    }
  };

  // Alias pentru signup -> register (compatibilitate cu componentele existente)
  const register = async (email: string, password: string): Promise<User> => {
    return signup(email, password);
  };

  // Deconectare
  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Eroare la deconectare:", error);
      setError(error.message || "Eroare la deconectare");
      throw error;
    }
  };

  // Alias pentru logout -> logOut (compatibilitate cu componentele existente)
  const logOut = async (): Promise<void> => {
    return logout();
  };

  // Resetare parolă
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Eroare la resetarea parolei:", error);
      setError(error.message || "Eroare la resetarea parolei");
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

export const useAuth = () => {
  console.log('useAuth apelat');
  const context = useContext(AuthContext);
  if (!context) {
    console.error('Context nu a fost găsit în useAuth');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};