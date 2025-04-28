import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import TokenBlocker from "./tokenBlocker";

// Configurația Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inițializăm Firebase
const app = initializeApp(firebaseConfig);

// Inițializăm serviciile Firebase
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Inițializăm TokenBlocker pentru a preveni problemele de autentificare
TokenBlocker.initTokenBlocker();