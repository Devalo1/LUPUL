import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { createLogger } from "./logger";

const logger = createLogger("seedProducts");

/**
 * Încarcă produse de bază în colecția 'products' din Firestore
 * Această funcție verifică mai întâi dacă există produse în baza de date
 * și adaugă doar datele esențiale dacă colecția este goală
 */
export const seedProducts = async (): Promise<boolean> => {
  try {
    logger.info("Verificăm colecția de produse...");
    
    // Referință la colecția de produse
    const productsRef = collection(db, "products");
    
    // Verificăm dacă există deja produse
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      logger.info("Nu s-au găsit produse în baza de date. Se adaugă produse implicite...");
      
      // Lista de produse de bază pentru încărcare
      const sampleProducts = [
        {
          name: "Dulceață de Afine",
          description: "Dulceața noastră de afine, preparată după o rețetă tradițională, este rezultatul muncii pasionate: afine culese manual din pădurile românești.",
          price: 20,
          image: "/images/Dulc.jpg",
          inStock: true,
          stock: 100,
          category: "traditionale",
          ingredients: ["afine sălbatice", "zahăr", "suc de lămâie"],
          weight: "250g",
          ratings: { 
            average: 4.7, 
            count: 12,
            userRatings: [
              {
                userId: "user1",
                userName: "Maria P.",
                rating: 5,
                date: new Date().toISOString(),
                comment: "Excelentă! O savoare autentică ce îmi amintește de copilărie.",
                verified: true
              },
              {
                userId: "user2",
                userName: "Andrei M.",
                rating: 4,
                date: new Date().toISOString(),
                comment: "Un gust natural, nu prea dulce. Recomand!",
                verified: true
              }
            ]
          }
        },
        {
          name: "Miere de Albine cu Propolis",
          description: "Miere naturală 100%, direct de la apicultori locali, îmbogățită cu propolis pentru proprietăți antibacteriene sporite.",
          price: 25,
          image: "/images/AdobeStock_367103665.jpeg",
          inStock: true,
          stock: 50,
          category: "traditionale",
          ingredients: ["miere de albine", "propolis"],
          weight: "350g",
          ratings: { 
            average: 4.9, 
            count: 8,
            userRatings: []
          }
        },
        {
          name: "Ceai Detoxifiant Natural",
          description: "Amestec de plante medicinale care susțin procesul natural de detoxifiere al organismului.",
          price: 18.50,
          image: "/images/AdobeStock_370191089.jpeg",
          inStock: true,
          stock: 30,
          category: "suplimente",
          ingredients: ["urzică", "mentă", "rozmarin", "ceai verde", "salvie"],
          weight: "100g",
          ratings: { 
            average: 4.3, 
            count: 5,
            userRatings: []
          }
        },
        {
          name: "Ghid Practic de Nutriție",
          description: "Carte cu informații practice despre o alimentație sănătoasă și echilibrată, adaptată stilului de viață modern.",
          price: 45,
          image: "/images/AdobeStock_217770381.jpeg",
          inStock: true,
          stock: 15,
          category: "carti",
          weight: "450g",
          ratings: { 
            average: 4.6, 
            count: 3,
            userRatings: []
          }
        }
      ];
      
      // Adăugăm produsele în Firestore
      for (const product of sampleProducts) {
        try {
          // Verificăm dacă produsul există deja după nume
          const q = query(productsRef, where("name", "==", product.name));
          const productCheck = await getDocs(q);
          
          if (productCheck.empty) {
            const docRef = await addDoc(productsRef, {
              ...product,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            logger.info(`Produs adăugat cu succes: ${product.name} (ID: ${docRef.id})`);
          } else {
            logger.info(`Produsul ${product.name} există deja.`);
          }
        } catch (error) {
          logger.error(`Eroare la adăugarea produsului ${product.name}:`, error);
        }
      }
      
      logger.info("Produsele de bază au fost adăugate cu succes!");
      return true;
    } else {
      logger.info(`Colecția de produse conține deja ${snapshot.docs.length} documente.`);
      return false;
    }
  } catch (error) {
    logger.error("Eroare la inițializarea produselor:", error);
    return false;
  }
};

export default seedProducts;