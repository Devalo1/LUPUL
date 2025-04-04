import { AppError } from '../types/common';

// Auth error codes
export const AUTH_ERRORS = {
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  INVALID_EMAIL: 'auth/invalid-email',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  NETWORK_ERROR: 'auth/network-request-failed',
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',
};

// Format auth error messages
export const formatAuthError = (error: AppError): string => {
  if (!error) return 'An unknown error occurred';

  const errorCode = error.code || '';
  
  switch (errorCode) {
    case AUTH_ERRORS.USER_NOT_FOUND:
      return 'No user found with this email address';
    case AUTH_ERRORS.WRONG_PASSWORD:
      return 'Incorrect password';
    case AUTH_ERRORS.EMAIL_ALREADY_IN_USE:
      return 'Email address is already in use';
    case AUTH_ERRORS.WEAK_PASSWORD:
      return 'Password is too weak. It should be at least 6 characters';
    case AUTH_ERRORS.INVALID_EMAIL:
      return 'Invalid email address format';
    case AUTH_ERRORS.TOO_MANY_REQUESTS:
      return 'Too many unsuccessful login attempts. Please try again later';
    case AUTH_ERRORS.NETWORK_ERROR:
      return 'Network error. Please check your internet connection';
    case AUTH_ERRORS.POPUP_CLOSED:
      return 'Authentication popup was closed before completion';
    case AUTH_ERRORS.OPERATION_NOT_ALLOWED:
      return 'This operation is not allowed';
    default:
      return error.message || 'An error occurred during authentication';
  }
};
