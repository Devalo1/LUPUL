// Utilitar pentru măsurarea și raportarea Web Vitals (metrici de performanță)
import { ReportHandler } from "web-vitals";

// Obține URL-ul endpoint-ului pentru a trimite metricile
// În producție, ar trebui să trimiteți la un serviciu analitic sau un backend propriu
const getAnalyticsEndpoint = () => {
  const isProd = import.meta.env.PROD || import.meta.env.VITE_ENVIRONMENT === "production";
  return isProd
    ? import.meta.env.VITE_ANALYTICS_ENDPOINT || "https://lupulsicorbul.com/api/analytics"
    : "/api/analytics-dev"; // Endpoint local pentru dezvoltare
};

// Funcție pentru a trimite metricile la un endpoint
const sendToAnalytics = async ({ name, delta, id, value }: {
  name: string;
  delta: number;
  id: string;
  value: number;
}) => {
  try {
    // Adăugăm informații despre utilizator și sesiune
    const body = {
      name,            // Numele metricii (CLS, FID, LCP, etc.)
      delta,           // Delta față de ultima măsurătoare
      id,              // ID unic pentru această măsurătoare
      value,           // Valoarea actuală a metricii
      path: window.location.pathname, // Calea curentă
      userAgent: navigator.userAgent,  // User agent pentru diagnostic
      timestamp: Date.now()           // Timestamp
    };

    // În producție, trimitem datele la endpoint-ul de analiză
    if (import.meta.env.PROD) {
      const analyticsEndpoint = getAnalyticsEndpoint();
      
      await fetch(analyticsEndpoint, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        keepalive: true // Asigură trimiterea datelor chiar dacă pagina se închide
      });
    } else {
      // În dev, doar logăm în consolă pentru debugging
      console.log("Web Vitals:", body);
    }
  } catch (error) {
    // În caz de eroare, doar logăm, nu întrerupem experiența utilizatorului
    console.error("Error sending web-vitals:", error);
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