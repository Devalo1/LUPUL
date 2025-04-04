import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configurația Firebase - folosim valori hardcodate pentru a evita probleme cu variabilele de mediu
const firebaseConfig = {
  apiKey: "AIzaSyCZEWoZn-c7NSH1AGbetWEbtxwEz-iaMR4",
  authDomain: "lupulcorbul.firebaseapp.com",
  projectId: "lupulcorbul",
  storageBucket: "lupulcorbul.appspot.com",
  messagingSenderId: "312943074536",
  appId: "1:312943074536:web:13fc0660014bc58c5c7d5d",
  measurementId: "G-38YSZKVXDC",
};

console.log('Inițializez Firebase cu configurația:', firebaseConfig);

// Inițializăm Firebase
const app = initializeApp(firebaseConfig);

// Inițializăm autentificarea
const auth = getAuth(app);

// Setăm persistența la LOCAL pentru a păstra sesiunea utilizatorului
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('Firebase persistence set to LOCAL'))
  .catch(error => console.error('Firebase persistence error:', error));

// Inițializăm Firestore și Storage
const firestore = getFirestore(app);
const storage = getStorage(app);

// Exportăm serviciile
export { auth, firestore, storage };
export default app;
