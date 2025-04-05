import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics'; // Verificăm dacă Analytics este suportat

// Configurația Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: "lupulcorbul.firebaseapp.com",
  projectId: "lupulcorbul",
  storageBucket: "lupulcorbul.firebasestorage.app",
  messagingSenderId: "312943074536",
  appId: "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: "G-38YSZKVXDC"
};

// Inițializarea Firebase - prevenim inițializările multiple
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Serviciile Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

// Inițializăm Analytics doar dacă este suportat
export const analytics = isSupported().then((supported) => supported ? getAnalytics(app) : null);

export default app;
