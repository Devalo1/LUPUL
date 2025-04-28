import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User
} from "firebase/auth";
import { auth } from "../firebase";

// Define the AuthContextType interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  redirectToAppointments: () => void;
}

// Create the context with a default value that matches the type
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const redirectToAppointments = () => {
    navigate("/appointments");
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    redirectToAppointments,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext };