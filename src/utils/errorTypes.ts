/**
 * Error handling utilities
 * Provides consistent error handling across the application
 */

// Base application error with code, message and optional metadata
export interface AppError extends Error {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

// Auth error types with specific codes
export type FirebaseErrorCode = 
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/email-already-in-use"
  | "auth/weak-password"
  | "auth/invalid-email"
  | "auth/requires-recent-login"
  | "auth/operation-not-allowed"
  | "auth/account-exists-with-different-credential"
  | "auth/invalid-credential"
  | "auth/invalid-verification-code"
  | "auth/invalid-verification-id"
  | "auth/network-request-failed"
  | "auth/popup-closed-by-user"
  | "auth/user-disabled"
  | "auth/user-token-expired"
  | "auth/too-many-requests"
  | "permission-denied"
  | "unauthorized"
  | string;

/**
 * Convert any error to a typed AppError
 */
export function handleUnknownError(error: unknown): AppError {
  // If error is already an AppError, return it
  if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
    return error as AppError;
  }
  
  // If error is a Firebase error
  if (typeof error === "object" && error !== null && "code" in error) {
    return {
      name: "FirebaseError",
      code: (error as { code: string }).code,
      message: (error as { message?: string }).message || "An unknown Firebase error occurred",
      status: 500
    };
  }
  
  // If error is a standard Error
  if (error instanceof Error) {
    return {
      name: error.name,
      code: "unknown",
      message: error.message,
      status: 500
    };
  }
  
  // For string errors
  if (typeof error === "string") {
    return {
      name: "Error",
      code: "unknown",
      message: error,
      status: 500
    };
  }
  
  // For any other type
  return {
    name: "UnknownError",
    code: "unknown",
    message: "An unknown error occurred",
    status: 500
  };
}

/**
 * Create an AppError with specific code and message
 */
export function createAppError(code: string, message: string, details?: Record<string, unknown>): AppError {
  return {
    name: "AppError",
    code,
    message,
    details,
    status: 500
  };
}

/**
 * Map common Firebase error codes to user-friendly messages
 */
export function getErrorMessage(errorCode: FirebaseErrorCode): string {
  const errorMessages: Record<string, string> = {
    "auth/user-not-found": "Nu există niciun utilizator cu acest email",
    "auth/wrong-password": "Parolă incorectă",
    "auth/email-already-in-use": "Acest email este deja folosit",
    "auth/weak-password": "Parola trebuie să aibă cel puțin 6 caractere",
    "auth/invalid-email": "Adresa de email nu este validă",
    "auth/requires-recent-login": "Această operațiune necesită autentificare recentă. Te rugăm să te reautentifici",
    "auth/operation-not-allowed": "Această operațiune nu este permisă",
    "auth/user-disabled": "Acest cont a fost dezactivat",
    "auth/user-token-expired": "Sesiunea a expirat. Te rugăm să te reautentifici",
    "auth/too-many-requests": "Prea multe încercări. Te rugăm să încerci mai târziu",
    "auth/popup-closed-by-user": "Fereastra de autentificare a fost închisă înainte de finalizare",
    "permission-denied": "Nu ai permisiunea necesară pentru această acțiune",
    "unauthorized": "Nu ești autorizat să efectuezi această acțiune"
  };

  return errorMessages[errorCode] || "A apărut o eroare. Te rugăm să încerci din nou.";
}

export default {
  handleUnknownError,
  createAppError,
  getErrorMessage
};