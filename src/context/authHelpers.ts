import { User, UserCredential } from 'firebase/auth';
import { AppError } from '../types/common';

/**
 * Helper functions for authentication related operations
 */

export const helperFunction = (): string => {
  return 'Helper function is working';
};

// Auth error codes
export const AUTH_ERRORS = {
  // Email/password errors
  'auth/invalid-email': 'Adresa de email este invalidă.',
  'auth/user-disabled': 'Acest cont a fost dezactivat. Contactați administratorul.',
  'auth/user-not-found': 'Nu există un cont asociat acestui email.',
  'auth/wrong-password': 'Parola este incorectă.',
  // Creation errors
  'auth/email-already-in-use': 'Există deja un cont asociat acestui email.',
  'auth/weak-password': 'Parola este prea slabă. Folosiți cel puțin 6 caractere.',
  // Network errors
  'auth/network-request-failed': 'Eroare de conexiune. Verificați conexiunea la internet.',
  // Google sign-in errors
  'auth/popup-closed-by-user': 'Autentificarea a fost anulată.',
  'auth/popup-blocked': 'Fereastra de autentificare a fost blocată de browser.',
  // Other errors
  'auth/too-many-requests': 'Prea multe încercări. Încercați din nou mai târziu.'
};

/**
 * Format error messages from Firebase authentication errors
 */
export const formatAuthError = (error: AppError): string => {
  if (!error) return 'An unknown error occurred';

  // Default message
  let message = 'A apărut o eroare. Încercați din nou mai târziu.';

  // Handle Firebase-specific error codes
  const errorCode = error.code || '';

  // Use type assertion to tell TypeScript this is a valid index access
  message = (AUTH_ERRORS as Record<string, string>)[errorCode] || error.message || message;

  return message;
};

/**
 * Extract user profile information
 */
export function extractUserProfile(user: User) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    createdAt: user.metadata.creationTime,
    lastLoginAt: user.metadata.lastSignInTime
  };
}

/**
 * Process authentication result
 */
export function processAuthResult(result: UserCredential) {
  return {
    user: extractUserProfile(result.user),
    isNewUser: false, // Remove property that doesn't exist
    credential: null, // Replace with null since it doesn't exist
    operationType: result.operationType
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { 
  isValid: boolean; 
  message?: string;
} {
  if (password.length < 6) {
    return { 
      isValid: false, 
      message: 'Parola trebuie să conțină cel puțin 6 caractere.' 
    };
  }
  
  // Check for stronger password - optional
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChar]
    .filter(Boolean).length;
  
  if (strength < 3) {
    return {
      isValid: true, // Still valid but warn user
      message: 'Parolă slabă. Adăugați majuscule, cifre și caractere speciale pentru mai multă securitate.'
    };
  }
  
  return { isValid: true };
}
