// Acest fișier servește ca punct central de export pentru toate serviciile Firebase

// Import și re-export serviciile Firebase din firestore.ts
import { auth, firestore, storage } from "./firestore";

// Import și re-export funcțiile de autentificare din auth.ts
import {
  onAuthChanged,
  signIn,
  checkAdmin,
  logOut,
  resetPassword,
  signUp,
  updateUserProfile,
  isUserLoggedIn,
  signInWithGoogle
} from "./auth";

// Exportă toate serviciile și funcțiile pentru a fi folosite în aplicație
export {
  // Firebase services
  auth,
  firestore,
  storage,
  
  // Auth methods
  onAuthChanged,
  signIn,
  checkAdmin,
  logOut,
  resetPassword,
  signUp,
  updateUserProfile,
  isUserLoggedIn,
  signInWithGoogle
};