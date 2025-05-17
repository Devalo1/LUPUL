// Re-export all from firebase/auth
export * from "firebase/auth";

// Explicitly export GoogleAuthProvider and other auth providers that might be missing
export class GoogleAuthProvider {
  static PROVIDER_ID = "google.com";
  static GOOGLE_SIGN_IN_METHOD = "google.com";
  
  addScope(scope: string): GoogleAuthProvider {
    // Mock implementation
    return this;
  }
  
  setCustomParameters(params: Record<string, string>): GoogleAuthProvider {
    // Mock implementation
    return this;
  }
}
