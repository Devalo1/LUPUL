/**
 * FIRESTORE SERVICE EXPORTS
 * Re-exports Firestore functionality from the central Firebase file.
 * This file helps organize code but all functionality comes from firebase.ts
 */
import * as FirebaseModule from '../firebase';

// Re-export all Firebase exports
export * from '../firebase';

// Named re-exports for backward compatibility
export const { 
  firestore, 
  db, 
  addDocument, 
  getDocument, 
  getCollection, 
  updateDocument, 
  deleteDocument, 
  subscribeToDocument, 
  testFirestoreConnection 
} = FirebaseModule;

// Add custom functions as needed
export const addProduct = async () => {
  try {
    const productData = {
      name: "Dulceață de Afine",
      description: "Dulceața noastră de afine, preparată după o rețetă tradițională.",
      image: "/images/Dulc.jpg",
      inStock: true,
      price: 20,
    };

    const docRef = await addDocument("products", productData);
    console.log("Produs adăugat cu succes! ID:", docRef);
  } catch (error) {
    console.error("Eroare la adăugarea produsului:", error);
  }
};

console.log('Firestore service initialized. All Firebase services should be imported from firebase.ts');