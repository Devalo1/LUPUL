import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';

// Definim tipul utilizatorului
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Definim tipul contextului
interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
}

// Cream contextul
const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  loading: true,
  login: async () => ({ success: false }),
  logOut: async () => false,
  signUp: async () => ({}),
  resetPassword: async () => {},
  updateProfile: async () => {},
  signInWithGoogle: async () => ({ success: false })
});

// Hook pentru a folosi contextul
export const useAuth = () => useContext(AuthContext);

// Provider-ul de autentificare
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitorizăm starea de autentificare
  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User ${user.uid}` : 'No user');
      if (user) {
        // Actualizăm starea cu utilizatorul curent
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Funcția de înregistrare
  const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Funcția de autentificare
  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Dacă utilizatorul nu are displayName, setăm unul implicit
      if (userCredential.user && !userCredential.user.displayName) {
        const username = email.split('@')[0];
        try {
          await firebaseUpdateProfile(userCredential.user, {
            displayName: username.charAt(0).toUpperCase() + username.slice(1)
          });
        } catch (profileError) {
          console.error("Couldn't update profile with displayName:", profileError);
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  }

  // Funcția de deconectare
  const logOut = async () => {
    try {
      await signOut(auth);
      
      // Forțăm o reîncărcare completă pentru a curăța starea
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  // Resetare parolă
  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Actualizare profil
  const updateProfile = async (data: Partial<User>) => {
    if (!auth.currentUser) {
      throw new Error('No user is logged in');
    }
    
    await firebaseUpdateProfile(auth.currentUser, {
      displayName: data.displayName || currentUser?.displayName || null,
      photoURL: data.photoURL || currentUser?.photoURL || null
    });
  };

  // Autentificare cu Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      return { success: false, error: error.message };
    }
  };

  // Valoarea contextului
  const value = {
    currentUser,
    loading,
    login,
    logOut,
    signUp,
    resetPassword,
    updateProfile,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
