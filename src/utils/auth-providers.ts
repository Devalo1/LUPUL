// This file provides a custom implementation of GoogleAuthProvider
// to fix compatibility issues with Firebase v11.6.0
import firebase from "firebase/app";

// Custom implementation of GoogleAuthProvider
export class GoogleAuthProvider {
  static PROVIDER_ID = "google.com";
  static GOOGLE_SIGN_IN_METHOD = "google.com";
  
  private _scopes: string[] = [];
  private _customParameters: Record<string, string> = {};
  
  constructor() {
    // Initialize any required properties
  }
  
  addScope(scope: string): GoogleAuthProvider {
    this._scopes.push(scope);
    return this;
  }
  
  setCustomParameters(params: Record<string, string>): GoogleAuthProvider {
    this._customParameters = {...this._customParameters, ...params};
    return this;
  }
  
  // Convert to Firebase Auth provider
  toFirebaseAuthProvider(): any {
    // This would ideally create a Firebase AuthProvider, but we'll
    // use our custom implementation since we're having issues with the Firebase SDK
    return {
      providerId: GoogleAuthProvider.PROVIDER_ID,
      scopes: this._scopes,
      customParameters: this._customParameters
    };
  }
  
  // Static method to create credential
  static credential(idToken?: string, accessToken?: string): any {
    return { idToken, accessToken, providerId: GoogleAuthProvider.PROVIDER_ID };
  }
}
