import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChanged, signOut } from '../services/auth';

// Definirea tipului pentru context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Crearea contextului
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizat pentru accesarea contextului de autentificare
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie utilizat în interiorul unui AuthProvider');
  }
  return context;
};

// Furnizorul de context pentru autentificare
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Abonare la schimbările stării de autentificare
    const unsubscribe = onAuthChanged((user: User | null) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Curățare la demontare
    return unsubscribe;
  }, []);

  // Funcție pentru delogare
  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Eroare la deconectare:', error);
      throw error;
    }
  };

  // Valorile furnizate de context
  const value: AuthContextType = {
    currentUser,
    loading,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export implicit pentru hook
export default useAuth;
