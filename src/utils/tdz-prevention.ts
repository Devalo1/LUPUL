/**
 * Utility for preventing Temporal Dead Zone (TDZ) errors
 * 
 * Aceste funcții sunt folosite pentru a preveni erorile TDZ (Temporal Dead Zone)
 * care apar la bundluri de JavaScript minificate, în special în vendor chunks
 * când variabilele sunt declarate și inițializate folosind let/const
 */

// Declarația de tip pentru proprietatea __emotion_insertion_point__
declare global {
  interface Window {
    __emotion_insertion_point__?: string;
    __TDZ_PREVENTION_EXECUTED__?: boolean;
  }
}

/**
 * Pre-inițializează variabile pentru a preveni erori TDZ
 */
export function preventTDZ(): void {
  if (typeof window !== "undefined") {
    // Flag pentru a indica faptul că TDZ prevention a fost executat
    window.__TDZ_PREVENTION_EXECUTED__ = true;
    
    // Pre-alocăm variabile comune care ar putea cauza erori TDZ
    // Acest lucru face ca referințele să existe înainte de inițializarea reală
    const globals = window as any;
    
    // Asigurăm-ne că obiectele comune există înainte de a fi folosite
    if (!globals.__tdz_e) globals.__tdz_e = {};
    if (!globals.__tdz_handlers) globals.__tdz_handlers = [];
    if (!globals.__tdz_cache) globals.__tdz_cache = new Map();
    if (!globals.__tdz_load_promises) globals.__tdz_load_promises = {};
    
    console.info("[TDZ Prevention] Initialized TDZ prevention utilities");

    // Prevent Temporal Dead Zone issues with Emotion
    window.__emotion_insertion_point__ = '';
  }
}

// Prevent Temporal Dead Zone issues with Emotion
if (typeof window !== "undefined") {
  // Force initialization order
  window.__emotion_insertion_point__ = "";
}

/**
 * Forțează încărcarea tuturor chunk-urilor vendor înaintea execuției aplicației
 * pentru a preveni erori TDZ
 */
export async function preloadVendorChunks(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      // Căutăm toate script-urile cu "vendor" în numele fișierului
      const scriptTags = document.querySelectorAll("script[src*=\"vendor\"]");
      
      if (scriptTags.length > 0) {
        console.info(`[TDZ Prevention] Preloading ${scriptTags.length} vendor chunks...`);
        
        // Pentru fiecare script vendor, încercăm să-l încărcăm explicit
        const preloadPromises = Array.from(scriptTags).map(script => {
          const src = script.getAttribute("src");
          if (!src) return Promise.resolve();
          
          return new Promise<void>((resolve) => {
            const preloadLink = document.createElement("link");
            preloadLink.rel = "preload";
            preloadLink.as = "script";
            preloadLink.href = src;
            preloadLink.onload = () => {
              console.debug(`[TDZ Prevention] Preloaded: ${src}`);
              resolve();
            };
            preloadLink.onerror = () => {
              console.warn(`[TDZ Prevention] Failed to preload: ${src}`);
              resolve(); // Rezolvăm oricum pentru a nu bloca restul
            };
            document.head.appendChild(preloadLink);
          });
        });
        
        // Așteptăm ca toate să se încarce
        await Promise.all(preloadPromises);
        console.info("[TDZ Prevention] All vendor chunks preloaded");
      } else {
        console.info("[TDZ Prevention] No vendor chunks found to preload");
      }
    } catch (error) {
      console.warn("[TDZ Prevention] Error during vendor chunk preloading:", error);
    }
  }
}

// Exportăm un obiect default cu utilitarele pentru a fi importate mai ușor
export default {
  preventTDZ,
  preloadVendorChunks
};
