// Utilitar pentru măsurarea și raportarea Web Vitals (metrici de performanță)
import { ReportHandler } from "web-vitals";
import analyticsService from "../services/analytics";
import logger from "./logger";
import { isProd } from "./environment";

// Funcție pentru a trimite metricile la serviciul de analytics
const sendToAnalytics = async ({ name, delta, id, value }: {
  name: string;
  delta: number;
  id: string;
  value: number;
}) => {
  try {
    // Adăugăm informații despre metrică și contextul utilizatorului
    const webVitalData = {
      type: "web-vital",
      metric: name,      // Numele metricii (CLS, FID, LCP, etc.)
      delta,             // Delta față de ultima măsurătoare
      id,                // ID unic pentru această măsurătoare
      value,             // Valoarea actuală a metricii
      path: window.location.pathname, // Calea curentă
      userAgent: navigator.userAgent,  // User agent pentru diagnostic
      timestamp: Date.now()           // Timestamp
    };

    // Trimitem datele folosind serviciul de analytics care gestionează CORS
    await analyticsService.trackEvent("web_vitals", webVitalData);
    
    if (!isProd) {
      // În dev, logăm în consolă pentru debugging
      logger.debug("Web Vitals:", webVitalData);
    }
  } catch (error) {
    // În caz de eroare, doar logăm, nu întrerupem experiența utilizatorului
    logger.error("Eroare la trimiterea metricilor web-vitals:", error);
  }
};

// Funcție pentru a raporta LCP (Largest Contentful Paint)
export const reportLCP = (onReport: ReportHandler) => {
  import("web-vitals").then(({ onLCP }) => {
    onLCP(onReport);
  });
};

// Funcție pentru a raporta FID (First Input Delay)
export const reportFID = (onReport: ReportHandler) => {
  import("web-vitals").then(({ onFID }) => {
    onFID(onReport);
  });
};

// Funcție pentru a raporta CLS (Cumulative Layout Shift)
export const reportCLS = (onReport: ReportHandler) => {
  import("web-vitals").then(({ onCLS }) => {
    onCLS(onReport);
  });
};

// Funcție pentru a raporta toate metricile importante
export const reportWebVitals = (onReport: ReportHandler = sendToAnalytics) => {
  import("web-vitals").then(({ onCLS, onFID, onLCP, onTTFB, onFCP }) => {
    onCLS(onReport);  // Raportează Cumulative Layout Shift
    onFID(onReport);  // Raportează First Input Delay
    onLCP(onReport);  // Raportează Largest Contentful Paint
    onTTFB(onReport); // Raportează Time to First Byte
    onFCP(onReport);  // Raportează First Contentful Paint
  });
};