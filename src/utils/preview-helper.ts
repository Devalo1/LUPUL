/**
 * Helper utilities for preview mode
 *
 * Acest fisier contine utilitati specifice pentru modul de previzualizare (preview)
 * care ajuta la simularea raspunsurilor API si alte functionalitati necesare in acest mediu
 */

import logger from "./logger";

/**
 * Verifica daca aplicatia ruleaza in modul preview
 */
export const isPreviewMode = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    window.location.port === "5174" || // Port standard pentru preview Vite
    window.location.hostname.includes("preview") || // Subdomain pentru preview
    window.location.hostname.includes("netlify") || // Netlify preview deployment
    (import.meta.env.MODE === "production" && !import.meta.env.PROD)
  ); // Build de productie dar nu in productie
};

/**
 * Verifica daca un URL este pentru analytics
 */
export const isAnalyticsUrl = (url: string): boolean => {
  return (
    url.includes("lupulsicorbul.com/api/analytics") ||
    url.includes("/api/analytics-proxy")
  );
};

/**
 * Genereaza un raspuns simulat pentru apelurile API in modul preview
 */
export function generateMockResponse<T>(
  endpoint: string,
  data: Record<string, unknown>
): T {
  const timestamp = new Date().toISOString();

  // Simulam raspunsuri pentru diferite endpoint-uri
  if (isAnalyticsUrl(endpoint)) {
    logger.debug(
      "Generare raspuns simulat pentru analytics in preview mode:",
      data
    );

    return {
      success: true,
      simulated: true,
      simulationSource: "preview-helper",
      message: "Raspuns analytics simulat in mediul preview",
      timestamp,
      data,
    } as unknown as T;
  }

  // Pentru alte endpoint-uri, returnam un raspuns generic
  return {
    success: true,
    simulated: true,
    simulationSource: "preview-helper",
    endpoint,
    message: "Raspuns API simulat in mediul preview",
    timestamp,
    data,
  } as unknown as T;
}

/**
 * Initializeaza helper-ul pentru preview mode
 * - Inregistreaza informatii despre mediul de rulare
 * - Modifica comportamentul fetch() pentru a gestiona erorile 404 in mod silentios pentru analytics
 */
export const initPreviewHelper = (): void => {
  if (!isPreviewMode()) return;

  logger.info("Initializare helper pentru preview mode");

  // Adaugam un handling special pentru fetchuri care esueaza in preview mode
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : String(input);

    try {
      const response = await originalFetch(input, init);
      return response;
    } catch (error) {
      // Daca este un apel catre analytics si esueaza, simulam un raspuns pozitiv
      // pentru a nu intrerupe experienta utilizatorului in preview
      if (isAnalyticsUrl(url)) {
        logger.warn(
          `Fetch catre ${url} a esuat in preview mode. Simulam raspuns.`
        );

        // Simulam un raspuns pozitiv
        const mockBody = JSON.stringify({
          success: true,
          simulated: true,
          simulationReason: "preview_fetch_error",
          message: "Raspuns simulat dupa eroare fetch in preview mode",
          originalUrl: url,
          timestamp: new Date().toISOString(),
        });

        const mockResponse = new Response(mockBody, {
          status: 200,
          statusText: "OK",
          headers: new Headers({
            "Content-Type": "application/json",
          }),
        });

        return mockResponse;
      }

      // Pentru alte URL-uri, propagam eroarea normal
      throw error;
    }
  };

  // Adaugam informatii despre mediul preview in consola
  console.info(`
    🔍 PREVIEW MODE ACTIV
    Unele functionalitati, inclusiv analytics, sunt simulate.
    URL: ${window.location.href}
    User Agent: ${navigator.userAgent}
    Timestamp: ${new Date().toISOString()}
  `);
};

export default {
  isPreviewMode,
  isAnalyticsUrl,
  generateMockResponse,
  initPreviewHelper,
};
