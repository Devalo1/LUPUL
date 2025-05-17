/**
 * Standardized error interface
 */
export interface AppError {
  code: string;
  message: string;
  originalError?: any;
}

/**
 * Firebase Auth error codes mapped to user-friendly messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Această adresă de email este deja folosită de un alt cont.",
  "auth/invalid-email": "Adresa de email nu este validă.",
  "auth/user-disabled": "Acest cont a fost dezactivat.",
  "auth/user-not-found": "Nu există cont asociat cu aceste date.",
  "auth/wrong-password": "Parolă incorectă.",
  "auth/weak-password": "Parola este prea slabă. Folosiți minim 6 caractere.",
  "auth/operation-not-allowed": "Operațiunea nu este permisă.",
  "auth/invalid-credential": "Credențiale invalide.",
  "auth/account-exists-with-different-credential": "Există deja un cont cu această adresă de email dar folosind o altă metodă de autentificare.",
  "auth/requires-recent-login": "Această operațiune necesită o autentificare recentă. Vă rugăm să vă reconectați.",
  "auth/too-many-requests": "Prea multe încercări. Vă rugăm să așteptați înainte de a încerca din nou.",
  "auth/expired-action-code": "Codul a expirat. Vă rugăm să solicitați un nou cod.",
  "auth/invalid-action-code": "Codul este invalid sau a fost deja folosit."
};

/**
 * Firebase Firestore error codes mapped to user-friendly messages
 */
export const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied": "Nu aveți permisiunea necesară pentru această operațiune.",
  "not-found": "Documentul sau colecția nu a fost găsit(ă).",
  "already-exists": "Documentul există deja și nu poate fi creat din nou.",
  "deadline-exceeded": "Operațiunea a durat prea mult timp și a expirat.",
  "resource-exhausted": "S-a atins limita de resurse disponibile.",
  "failed-precondition": "Operațiunea nu poate fi executată în starea curentă.",
  "aborted": "Operațiunea a fost anulată.",
  "unavailable": "Serviciul este momentan indisponibil.",
  "invalid-argument": "Argumente invalide în cerere."
};

/**
 * Firebase Storage error codes mapped to user-friendly messages
 */
export const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  "storage/unauthorized": "Nu aveți permisiunea de a accesa acest fișier.",
  "storage/canceled": "Operațiunea a fost anulată.",
  "storage/unknown": "A apărut o eroare necunoscută.",
  "storage/object-not-found": "Fișierul nu a fost găsit.",
  "storage/bucket-not-found": "Bucket-ul pentru stocare nu a fost găsit.",
  "storage/quota-exceeded": "S-a depășit cota de stocare disponibilă.",
  "storage/unauthenticated": "Utilizatorul nu este autentificat.",
  "storage/invalid-url": "URL invalid pentru stocare.",
  "storage/retry-limit-exceeded": "S-a depășit limita de reîncercări."
};

/**
 * Handles Firebase Auth errors and converts them to AppError format with user-friendly messages
 */
export function handleFirebaseAuthError(error: any): AppError {
  const errorCode = error?.code || "unknown-error";
  
  return {
    code: errorCode,
    message: AUTH_ERROR_MESSAGES[errorCode] || error?.message || "A apărut o eroare la autentificare.",
    originalError: error
  };
}

/**
 * Handles Firebase Firestore errors and converts them to AppError format with user-friendly messages
 */
export function handleFirestoreError(error: any): AppError {
  const errorCode = error?.code?.split("/")[1] || "unknown-error";
  
  return {
    code: errorCode,
    message: FIRESTORE_ERROR_MESSAGES[errorCode] || error?.message || "A apărut o eroare la accesarea bazei de date.",
    originalError: error
  };
}

/**
 * Handles Firebase Storage errors and converts them to AppError format with user-friendly messages
 */
export function handleStorageError(error: any): AppError {
  const errorCode = error?.code || "unknown-error";
  
  return {
    code: errorCode,
    message: STORAGE_ERROR_MESSAGES[errorCode] || error?.message || "A apărut o eroare la încărcarea fișierului.",
    originalError: error
  };
}

/**
 * Generic error handler for when the error source is not known
 */
export function handleUnknownError(error: any): AppError {
  if (error?.code?.startsWith("auth/")) {
    return handleFirebaseAuthError(error);
  }
  
  if (error?.code?.startsWith("firestore/")) {
    return handleFirestoreError(error);
  }
  
  if (error?.code?.startsWith("storage/")) {
    return handleStorageError(error);
  }
  
  return {
    code: "unknown-error",
    message: error?.message || "A apărut o eroare necunoscută.",
    originalError: error
  };
}