import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: "lupulcorbul.firebaseapp.com",
  projectId: "lupulcorbul",
  storageBucket: "lupulcorbul.firebasestorage.app",
  messagingSenderId: "312943074536",
  appId: "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: "G-38YSZKVXDC"
};

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
initAnalytics().then(result => {
  analytics = result;
});

export { analytics };
export default app;
