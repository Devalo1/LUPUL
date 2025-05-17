/**
 * FIRESTORE SERVICE EXPORTS
 * Re-exports Firestore functionality from the central Firebase file.
 * This file helps organize code but all functionality comes from firebase.ts
 */
import * as FirebaseModule from "../firebase";

// Re-export all Firebase exports
export * from "../firebase";

// Named re-exports for backward compatibility
export const { 
  firestore, 
  db
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

    // Use direct Firestore methods instead of non-existent methods
    const { collection, addDoc } = require("firebase/firestore");
    const docRef = await addDoc(collection(db, "products"), productData);
    console.log("Produs adăugat cu succes! ID:", docRef.id);
  } catch (error) {
    console.error("Eroare la adăugarea produsului:", error);
  }
};

console.log("Firestore service initialized. All Firebase services should be imported from firebase.ts");