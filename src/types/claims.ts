import { User } from "firebase/auth";

/**
 * Extends the Firebase User type to include custom claims
 */
export interface ExtendedUserClaims {
  admin?: boolean;
  specialist?: boolean;
  role?: string;
  permissions?: string[];
  [key: string]: any;
}

/**
 * Extends the Firebase User type with our custom claims
 */
export interface UserWithClaims extends User {
  claims?: ExtendedUserClaims;
  customClaims?: ExtendedUserClaims;
}

/**
 * Type for Firebase ID token result that includes our custom claims
 */
export interface CustomIdTokenResult {
  claims: ExtendedUserClaims;
  token: string;
  authTime: string;
  issuedAtTime: string;
  expirationTime: string;
  signInProvider: string | null;
  signInSecondFactor: string | null;
}