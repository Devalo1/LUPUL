// Firebase Auth type augmentation
// This file extends the firebase/auth module with our custom User properties

declare module "firebase/auth" {
  // Extend the User interface with all Firebase properties and our custom properties
  interface User {
    // Standard Firebase User properties from UserInfo
    readonly uid: string;
    readonly email: string | null;
    readonly displayName: string | null;
    readonly photoURL: string | null;
    readonly phoneNumber: string | null;
    readonly providerId: string;

    // Additional Firebase User properties
    readonly emailVerified: boolean;
    readonly isAnonymous: boolean;
    readonly metadata: {
      readonly creationTime?: string;
      readonly lastSignInTime?: string;
    };
    readonly providerData: Array<{
      readonly uid: string;
      readonly email: string | null;
      readonly displayName: string | null;
      readonly photoURL: string | null;
      readonly phoneNumber: string | null;
      readonly providerId: string;
    }>;
    readonly refreshToken: string;
    readonly tenantId: string | null;

    // Firebase User methods
    delete(): Promise<void>;
    getIdToken(forceRefresh?: boolean): Promise<string>;
    getIdTokenResult(forceRefresh?: boolean): Promise<{
      token: string;
      authTime: string;
      issuedAtTime: string;
      expirationTime: string;
      signInProvider: string | null;
      signInSecondFactor: string | null;
      claims: Record<string, unknown>;
    }>;
    reload(): Promise<void>; // Our custom properties
    isAdmin?: boolean;
    isAccountant?: boolean;
    createdAt?: Date | number | string;
  }

  // Firebase Auth exports
  export function getAuth(app?: any): any;
  export function onAuthStateChanged(
    auth: any,
    nextOrObserver: (user: User | null) => void,
    error?: (error: Error) => void,
    completed?: () => void
  ): () => void;
  export function signInWithEmailAndPassword(
    auth: any,
    email: string,
    password: string
  ): Promise<any>;
  export function createUserWithEmailAndPassword(
    auth: any,
    email: string,
    password: string
  ): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export function sendPasswordResetEmail(
    auth: any,
    email: string,
    actionCodeSettings?: any
  ): Promise<void>;
  export function updateProfile(user: User, profile: any): Promise<void>;
  export class GoogleAuthProvider {
    readonly providerId: string;
    constructor();
    static credential(
      idToken?: string | null,
      accessToken?: string | null
    ): any;
    addScope(scope: string): GoogleAuthProvider;
    setCustomParameters(
      customOAuthParameters: Record<string, string>
    ): GoogleAuthProvider;
  }
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export function signInWithRedirect(auth: any, provider: any): Promise<void>;
  export function getRedirectResult(auth: any): Promise<any>;
  export function connectAuthEmulator(
    auth: any,
    url: string,
    options?: any
  ): void;

  export interface Auth {
    currentUser: User | null;
  }

  export interface UserCredential {
    user: User;
    operationType?: string;
    providerId?: string | null;
  }

  export interface AuthProvider {
    providerId: string;
  }

  export interface ActionCodeSettings {
    url: string;
    iOS?: { bundleId: string };
    android?: {
      packageName: string;
      installApp?: boolean;
      minimumVersion?: string;
    };
    handleCodeInApp?: boolean;
    dynamicLinkDomain?: string;
  }

  export interface IdTokenResult {
    token: string;
    authTime: string;
    issuedAtTime: string;
    expirationTime: string;
    signInProvider: string | null;
    signInSecondFactor: string | null;
    claims: Record<string, unknown>;
  }
}
