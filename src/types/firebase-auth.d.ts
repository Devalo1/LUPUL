// Firebase Auth type extensions
import { FirebaseApp } from "firebase/app";

declare module "firebase/auth" {
  // Main User interface extensions
  interface User {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    isAnonymous: boolean;
    tenantId: string | null;
    providerData: UserInfo[];
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
    
    // Our custom properties
    isAdmin?: boolean;
    createdAt?: Date | number | string;
    
    // Methods
    getIdTokenResult(): Promise<IdTokenResult>;
  }

  // Auth functions
  export function getAuth(app?: FirebaseApp): Auth;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: NextOrObserver<User | null>): Unsubscribe;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function sendPasswordResetEmail(auth: Auth, email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;
  export function updateProfile(user: User, profile: {displayName?: string, photoURL?: string}): Promise<void>;
  export function getRedirectResult(auth: Auth): Promise<UserCredential | null>;
  export function connectAuthEmulator(auth: Auth, url: string, options?: any): void;
  export function signInWithRedirect(auth: Auth, provider: AuthProvider | GoogleAuthProvider): Promise<never>;
  export function signInWithPopup(auth: Auth, provider: AuthProvider | GoogleAuthProvider): Promise<UserCredential>;
  
  // Provider classes
  export class GoogleAuthProvider implements AuthProvider {
    constructor();
    addScope(scope: string): GoogleAuthProvider;
    setCustomParameters(customOAuthParameters: Object): GoogleAuthProvider;
    providerId: string;
    static PROVIDER_ID: string;
    static GOOGLE_SIGN_IN_METHOD: string;
  }

  // Essential interfaces
  export interface Auth {
    app: FirebaseApp;
    name: string;
    currentUser: User | null;
  }

  export interface UserCredential {
    user: User;
    providerId: string | null;
    operationType?: string;
  }

  export interface AuthProvider {
    providerId: string;
  }

  export interface UserInfo {
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    providerId: string;
  }
  
  export interface IdTokenResult {
    claims: {
      [key: string]: any;
      admin?: boolean;
    };
    token: string;
    authTime: string;
    issuedAtTime: string;
    expirationTime: string;
    signInProvider?: string | null;
  }

  export interface ActionCodeSettings {
    url: string;
    [key: string]: any;
  }

  // Utility types
  export type NextOrObserver<T> = ((a: T) => any) | Observer<T>;
  export interface Observer<T> {
    next: (a: T) => void;
    error?: (error: Error) => void;
    complete?: () => void;
  }
  export type Unsubscribe = () => void;
}