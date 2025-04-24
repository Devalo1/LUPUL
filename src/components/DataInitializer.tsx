import React, { useEffect, useState } from "react";
import seedProducts from "../utils/seedProducts";
import seedCategories from "../utils/seedCategories";
import logger from "../utils/logger";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

// Create component-specific logger
const dataLogger = logger.createLogger("DataInitializer");

/**
 * Componentă care inițializează datele necesare pentru aplicație
 * Se montează doar o dată la pornirea aplicației și încarcă date de bază în Firestore
 * doar dacă acestea nu există deja
 */
const DataInitializer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        // Evităm inițializarea dublă
        if (isLoading) return;
        setIsLoading(true);

        const db = getFirestore();
        
        // Verificăm dacă există deja categorii
        const categoriesQuery = query(collection(db, "categories"), limit(1));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        // Verificăm dacă există deja produse
        const productsQuery = query(collection(db, "products"), limit(1));
        const productsSnapshot = await getDocs(productsQuery);
        
        let categoriesInitialized = !categoriesSnapshot.empty;
        let productsInitialized = !productsSnapshot.empty;
        
        dataLogger.info("Verificare date existente:", { 
          categoriesExist: categoriesInitialized, 
          productsExist: productsInitialized 
        });

        // Inițializăm doar dacă este necesar
        if (!categoriesInitialized) {
          dataLogger.info("Se inițializează categoriile...");
          await seedCategories();
          categoriesInitialized = true;
        }
        
        if (!productsInitialized && categoriesInitialized) {
          dataLogger.info("Se inițializează produsele...");
          await seedProducts();
        }
        
        dataLogger.info("Verificarea/inițializarea datelor a fost finalizată");
      } catch (err: unknown) {
        const error = err as Error;
        dataLogger.error("Eroare la inițializarea datelor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Componenta nu afișează nimic
  return null;
};

export default React.memo(DataInitializer);