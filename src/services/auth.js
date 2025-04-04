// @strict

import { auth } from '../firebase/config';
import { 
  signInWithEmailAndPassword as firebaseSignIn, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { logger } from '../utils/debug';

// Monitorizează schimbările de stare a autentificării
export const onAuthChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Autentificare cu email și parolă
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    logger.info('Autentificare reușită', { data: { email } });
    return userCredential.user;
  } catch (error) {
    logger.error('Eroare la autentificare', error);
    throw error;
  }
};

// Înregistrare cu email și parolă
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Adăugare nume de afișare
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    logger.info('Înregistrare reușită', { data: { email } });
    return userCredential.user;
  } catch (error) {
    logger.error('Eroare la înregistrare', error);
    throw error;
  }
};

// Deconectare
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    logger.info('Deconectare reușită');
    return true;
  } catch (error) {
    logger.error('Eroare la deconectare', error);
    throw error;
  }
};

// Obține utilizatorul curent
export const getCurrentUser = () => {
  return auth.currentUser;
};
