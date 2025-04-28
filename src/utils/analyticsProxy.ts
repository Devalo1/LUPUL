// DEZACTIVAT: Acest modul a fost înlocuit cu serviciul de analytics îmbunătățit
import logger from "../utils/logger";

// Logăm faptul că proxy-ul este acum dezactivat
logger.info("AnalyticsProxy este acum dezactivat. Se folosește în schimb serviciul din services/analytics.ts");

// Exportăm referința originală către fetch pentru compatibilitate
export default {
  originalFetch: window.fetch
};