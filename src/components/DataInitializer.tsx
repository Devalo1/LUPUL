import React, { useEffect } from "react";
import seedProducts from "../utils/seedProducts";
import seedCategories from "../utils/seedCategories";
import logger from "../utils/logger";

// Create component-specific logger
const dataLogger = logger.createLogger("DataInitializer");

/**
 * Componentă care inițializează datele necesare pentru aplicație
 * Se montează doar o dată la pornirea aplicației și încarcă date de bază în Firestore
 */
const DataInitializer: React.FC = () => {
  useEffect(() => {
    const initData = async () => {
      try {
        dataLogger.info("Se inițializează datele aplicației...");
        
        // Inițializăm categoriile mai întâi (pentru a putea asocia produsele cu ele)
        await seedCategories();
        
        // Apoi inițializăm produsele
        await seedProducts();
        
        dataLogger.info("Datele au fost inițializate cu succes");
      } catch (err: unknown) {
        const error = err as Error;
        dataLogger.error("Eroare la inițializarea datelor:", error);
      }
    };

    initData();
  }, []);

  return null; // Această componentă nu afișează nimic
};

export default DataInitializer;