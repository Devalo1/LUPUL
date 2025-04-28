/**
 * Helper utilities for preview mode
 * 
 * Acest fișier conține utilități specifice pentru modul de previzualizare (preview)
 * care ajută la simularea răspunsurilor API și alte funcționalități necesare în acest mediu
 */

import logger from "./logger";

/**
 * Verifică dacă aplicația rulează în modul preview
 */
export const isPreviewMode = (): boolean => {
  if (typeof window === "undefined") return false;
  
  return window.location.port === "5174" || // Port standard pentru preview Vite
         window.location.hostname.includes("preview") || // Subdomain pentru preview
         window.location.hostname.includes("netlify") || // Netlify preview deployment
         (import.meta.env.MODE === "production" && !import.meta.env.PROD); // Build de producție dar nu în producție
};

/**
 * Verifică dacă un URL este pentru analytics
 */
export const isAnalyticsUrl = (url: string): boolean => {
  return url.includes("lupulsicorbul.com/api/analytics") || 
         url.includes("/api/analytics-proxy");
};

/**
 * Generează un răspuns simulat pentru apelurile API în modul preview
 */
export const generateMockResponse = <T>(
  endpoint: string, 
  data: Record<string, unknown>
): T => {
  const timestamp = new Date().toISOString();
  
  // Simulăm răspunsuri pentru diferite endpoint-uri
  if (isAnalyticsUrl(endpoint)) {
    logger.debug("Generare răspuns simulat pentru analytics în preview mode:", data);
    
    return {
      success: true,
      simulated: true,
      simulationSource: "preview-helper",
      message: "Răspuns analytics simulat în mediul preview",
      timestamp,
      data
    } as unknown as T;
  }
  
  // Pentru alte endpoint-uri, returnam un răspuns generic
  return {
    success: true,
    simulated: true,
    simulationSource: "preview-helper",
    endpoint,
    message: "Răspuns API simulat în mediul preview",
    timestamp,
    data
  } as unknown as T;
};

/**
 * Inițializează helper-ul pentru preview mode
 * - Înregistrează informații despre mediul de rulare
 * - Modifică comportamentul fetch() pentru a gestiona erorile 404 în mod silențios pentru analytics
 */
export const initPreviewHelper = (): void => {
  if (!isPreviewMode()) return;
  
  logger.info("Inițializare helper pentru preview mode");
  
  // Adăugăm un handling special pentru fetchuri care eșuează în preview mode
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : String(input);
    
    try {
      const response = await originalFetch(input, init);
      return response;
    } catch (error) {
      // Dacă este un apel către analytics și eșuează, simulăm un răspuns pozitiv
      // pentru a nu întrerupe experiența utilizatorului în preview
      if (isAnalyticsUrl(url)) {
        logger.warn(`Fetch către ${url} a eșuat în preview mode. Simulăm răspuns.`);
        
        // Simulăm un răspuns pozitiv
        const mockBody = JSON.stringify({
          success: true,
          simulated: true,
          simulationReason: "preview_fetch_error",
          message: "Răspuns simulat după eroare fetch în preview mode",
          originalUrl: url,
          timestamp: new Date().toISOString()
        });
        
        const mockResponse = new Response(mockBody, {
          status: 200,
          statusText: "OK",
          headers: new Headers({
            "Content-Type": "application/json"
          })
        });
        
        return mockResponse;
      }
      
      // Pentru alte URL-uri, propagăm eroarea normal
      throw error;
    }
  };
  
  // Adăugăm informații despre mediul preview în consolă
  console.info(`
    🔍 PREVIEW MODE ACTIV
    Unele funcționalități, inclusiv analytics, sunt simulate.
    URL: ${window.location.href}
    User Agent: ${navigator.userAgent}
    Timestamp: ${new Date().toISOString()}
  `);
};

export default {
  isPreviewMode,
  isAnalyticsUrl,
  generateMockResponse,
  initPreviewHelper
};
