import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSpecialists() {
  try {
    console.log('Checking specialists collection...');
    const specialistsRef = collection(db, 'specialists');
    const snapshot = await getDocs(specialistsRef);
    
    if (snapshot.empty) {
      console.log('No specialists found in database');
      return [];
    }
    
    console.log(`Found ${snapshot.docs.length} specialists:`);
    snapshot.docs.forEach(doc => {
      console.log('ID:', doc.id);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error checking specialists:', error);
  }
}

checkSpecialists().then(() => {
  process.exit(0);
});
