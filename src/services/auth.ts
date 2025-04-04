import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';
import { logger } from '../utils/debug';

// Debug function to check if this module is loaded properly
logger.info("Auth service initialized", { context: "Auth" });

// Register a new user
export const registerUser = async (email: string, password: string, name?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile with display name if provided
  if (name && userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName: name
    });
  }
  
  return userCredential;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      prompt: 'select_account',
      redirect_uri: window.location.origin  // ensures correct redirect
    });
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error: unknown) {
    logger.error("Login failed", error as Error, { context: "Auth" });
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  return firebaseSignOut(auth);
};

// Make sure this function is properly exported and defined
export function onAuthChanged(callback: (user: User | null) => void) {
  logger.info("Auth service - onAuthChanged called", { context: "Auth" });
  return firebaseOnAuthStateChanged(auth, callback);
}

// Export it again to be 100% sure
export { onAuthChanged as listenAuthStateChanged };

// Update user profile
export const updateUserProfile = async (displayName?: string, photoURL?: string) => {
  if (!auth.currentUser) throw new Error('No user logged in');
  
  const updateData: {displayName?: string, photoURL?: string} = {};
  if (displayName) updateData.displayName = displayName;
  if (photoURL) updateData.photoURL = photoURL;
  
  return updateProfile(auth.currentUser, updateData);
};

// Reset password
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// Get current user
export const getCurrentUser = () => auth.currentUser;

// Add this to create a test export object that we can check
const testExport = { 
  onAuthChanged, 
  registerUser, 
  signIn, 
  signOut,
  signInWithGoogle
};
logger.info("Auth service exports available", { context: "Auth", exports: Object.keys(testExport) });

export default testExport;
