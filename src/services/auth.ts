import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from './firestore';
import { User } from '../types/auth';

// Convert Firebase user to our custom User type
const mapFirebaseUserToUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  };
};

// Subscribe to auth state changes - CORECTAREA IMPLEMENTĂRII
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUserToUser(firebaseUser) : null);
  });
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<{success: boolean, user?: User, error?: string}> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: mapFirebaseUserToUser(userCredential.user)
    };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'A apărut o eroare la autentificare';
    console.error('Eroare la autentificare:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Check admin status
export const checkAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;

    const idTokenResult = await firebaseUser.getIdTokenResult();
    if (idTokenResult.claims.admin === true) {
      return true;
    }
    
    const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
    if (userDoc.exists() && userDoc.data().isAdmin === true) {
      return true;
    }
    
    if (firebaseUser.email?.endsWith('@admin.com')) {
      return true;
    }
    
    return false;
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'Error checking admin status';
    console.error('Error checking admin status:', errorMessage);
    return false;
  }
};

// Sign out user
export const logOut = async (): Promise<{success: boolean, error?: string}> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'A apărut o eroare la delogare';
    console.error('Eroare la delogare:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<{success: boolean, error?: string}> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'A apărut o eroare la resetarea parolei';
    console.error('Eroare la resetarea parolei:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<{success: boolean, user?: User, error?: string}> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    await setDoc(doc(firestore, 'users', firebaseUser.uid), {
      email: firebaseUser.email,
      createdAt: new Date(),
      isAdmin: false
    });
    
    return {
      success: true,
      user: mapFirebaseUserToUser(firebaseUser)
    };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'A apărut o eroare la înregistrare';
    console.error('Eroare la înregistrare:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Update user profile
export const updateUserProfile = async (displayName: string, photoURL?: string): Promise<{success: boolean, error?: string}> => {
  try {
    if (!auth.currentUser) {
      return {
        success: false,
        error: 'Nu există niciun utilizator autentificat'
      };
    }
    
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL: photoURL || auth.currentUser.photoURL
    });
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'A apărut o eroare la actualizarea profilului';
    console.error('Eroare la actualizarea profilului:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Sign in with Google - STANDARDIZAREA METODEI DE AUTENTIFICARE
export const signInWithGoogle = async (): Promise<{success: boolean, user?: User, error?: string}> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: mapFirebaseUserToUser(result.user)
    };
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'A apărut o eroare la autentificarea cu Google';
    console.error('Eroare la autentificarea cu Google:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Check if current user is logged in
export const isUserLoggedIn = (): boolean => {
  return !!auth.currentUser;
};
