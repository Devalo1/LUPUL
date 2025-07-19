import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
// Validate that no placeholder or missing values exist
// Ensure all Firebase config values are provided and not placeholders
Object.entries(firebaseConfig).forEach(([key, value]) => {
  if (!value || value.toString().toLowerCase().includes("your_")) {
    throw new Error(
      `Firebase configuration error: '${key}' is missing or still using a placeholder value ('${value}'). ` +
        "Please set the correct environment variable."
    );
  }
});

// Initialize Firebase only if it hasn't been initialized already
let app: FirebaseApp;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Initialize analytics only if it's supported in the current environment
const initAnalytics = async (): Promise<Analytics | null> => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

// We'll initialize analytics and export it
initAnalytics().then((result) => {
  analytics = result;
});

export { analytics };
export default app;
