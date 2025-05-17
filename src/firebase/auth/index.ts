// filepath: d:\LUPUL\my-typescript-app\src\firebase\auth\index.ts

// Define Firebase types that we need
export type FirebaseApp = {
  name: string;
  options: Record<string, unknown>;
  automaticDataCollectionEnabled: boolean;
};

// Define Auth and User interfaces
export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  isAnonymous: boolean;
  tenantId: string | null;
  providerId?: string;
  providerData: Array<{
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
    phoneNumber: string | null;
    providerId: string;
  }>;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  refreshToken?: string;
}

// Define Auth interface
export interface Auth {
  app: FirebaseApp;
  name: string;
  currentUser: User | null;
}

// Provider interface for type safety
export interface AuthProvider {
  providerId: string;
  addScope?(scope: string): AuthProvider;
  setCustomParameters?(params: Record<string, string>): AuthProvider;
}

// Export functions using dynamic require to avoid circular references
export function getAuth(app?: FirebaseApp): Auth {
  // Use dynamic import for Firebase Auth
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.getAuth(app);
}

export function onAuthStateChanged(
  auth: Auth,
  nextOrObserver: ((user: User | null) => void),
  error?: (error: Error) => void,
  completed?: () => void
): (() => void) {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.onAuthStateChanged(auth, nextOrObserver, error, completed);
}

export function signInWithRedirect(auth: Auth, provider: AuthProvider): Promise<void> {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.signInWithRedirect(auth, provider);
}

export function connectAuthEmulator(auth: Auth, url: string, options?: { disableWarnings?: boolean }): void {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.connectAuthEmulator(auth, url, options);
}

// Export commonly used functions with better type definitions
export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{user: User}> {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.signInWithEmailAndPassword(auth, email, password);
}

export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<{user: User}> {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
}

export function signOut(auth: Auth): Promise<void> {
  const firebaseAuth = require("firebase/auth");
  return firebaseAuth.signOut(auth);
}

// Class for Google Auth Provider, static methods to create the provider
export class GoogleAuthProviderClass implements AuthProvider {
  providerId = "google.com";
  
  constructor() {
    const firebase = require("firebase/auth");
    return new firebase.GoogleAuthProvider();
  }
}

// Export GoogleAuthProvider namespace for static methods
export const GoogleProviderUtils = {
  PROVIDER_ID: "google.com",
  GOOGLE_SIGN_IN_METHOD: "google.com",
  
  credential: (idToken?: string, accessToken?: string) => {
    const firebaseAuth = require("firebase/auth");
    return firebaseAuth.GoogleAuthProvider.credential(idToken, accessToken);
  },
  
  create: (): AuthProvider => {
    const firebaseAuth = require("firebase/auth");
    return new firebaseAuth.GoogleAuthProvider();
  }
};
