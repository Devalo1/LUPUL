import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextProps } from '../types';
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
import { auth } from '../services/firebase';

// Export the context so it can be imported in other files
export const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  login: async () => {},
  logOut: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  signInWithGoogle: async () => {}
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = async () => {
    return signOut(auth);
  };

  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) {
      throw new Error('No user is logged in');
    }
    
    // Update Firebase profile
    if (data.displayName || data.photoURL) {
      await firebaseUpdateProfile(auth.currentUser!, {
        displayName: data.displayName || currentUser.displayName,
        photoURL: data.photoURL || currentUser.photoURL
      });
    }
    
    // Update additional user data in Firestore if needed
    // ...
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAdmin: false // Default value, you might want to check from Firestore
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logOut,
    signUp,
    resetPassword,
    updateProfile,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
