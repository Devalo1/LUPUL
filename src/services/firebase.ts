import { 
  signInWithEmailAndPassword as firebaseSignIn,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { logger } from '../utils/debug';
// Import Firebase instances from the main config instead of initializing again
import { auth, app } from '../firebase/index';

// Debug function to check if this module is loaded properly
logger.info("Auth service initialized", { context: "Auth" });

// Add Google sign-in function
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
    logger.error("Google login failed", error instanceof Error ? error : new Error(String(error)), { context: "Auth" });
    throw error;
  }
};

// Add debug interceptors for Firebase
const debugAuth = (email: string, password: string) => {
  logger.info('Attempting sign in', { data: { email } });
  return firebaseSignIn(auth, email, password);
};

// Export firebase app instance
export { app, auth };
export const signInWithEmailAndPassword = debugAuth;
