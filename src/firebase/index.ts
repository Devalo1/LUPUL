// Export Firebase app and all modules
export * from "./app";
export * from "./auth";
export * from "./firestore";
export * from "./storage";
export * from "./functions";
export * from "./analytics";

// Export TokenBlocker
export { default as TokenBlocker } from "./tokenBlocker";

// Re-export the initialization components for convenience
import { initializeApp } from "./app";
import { getAuth } from "./auth";
import { getFirestore } from "./firestore";
import { getStorage } from "./storage";
import { getFunctions } from "./functions";
import { getAnalytics, isSupported } from "./analytics";

// Firebase configuration from environment variables or defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lupulcorbul.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lupulcorbul",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lupulcorbul.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "312943074536",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-38YSZKVXDC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics only in browser and not in SSR or test environments
let analytics = null;
if (typeof window !== "undefined" && import.meta.env.MODE !== "test") {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(err => {
    console.warn("Firebase Analytics could not be initialized:", err);
  });
}

export { analytics };

// Inițializăm TokenBlocker pentru a preveni problemele de autentificare
TokenBlocker.initTokenBlocker();