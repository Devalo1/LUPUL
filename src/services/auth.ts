import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore as db } from './firebase';
import { User } from '../types/auth';  // Updated import path

// Convert Firebase user to our custom User type
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  };
};

// Subscribe to auth state changes
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged((firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUserToUser(firebaseUser) : null);
  });
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUserToUser(userCredential.user);
};

// Check if a user has admin privileges
export const checkAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;

    // Check for custom claims in the ID token
    const idTokenResult = await firebaseUser.getIdTokenResult();
    if (idTokenResult.claims.admin === true) {
      return true;
    }
    
    // If no admin claim in token, check Firestore for admin status
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().isAdmin === true) {
      return true;
    }
    
    // For development purposes, check email domain
    if (user.email?.endsWith('@admin.com')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Sign out user
export const logOut = async (): Promise<void> => {
  return signOut(auth);
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  // Create a user document in Firestore
  await setDoc(doc(db, 'users', firebaseUser.uid), {
    email: firebaseUser.email,
    createdAt: new Date(),
    isAdmin: false // Set admin status to false by default
  });
  
  return mapFirebaseUserToUser(firebaseUser);
};

// Update user profile
export const updateUserProfile = async (displayName: string, photoURL?: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('No user is logged in');
  }
  
  return updateProfile(auth.currentUser, {
    displayName,
    photoURL: photoURL || auth.currentUser.photoURL
  });
};

// Check if current user is logged in
export const isUserLoggedIn = (): boolean => {
  return !!auth.currentUser;
};
