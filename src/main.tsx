// Importăm mai întâi firebase-init pentru a asigura inițializarea
import { ensureFirebaseInitialized } from "./firebase-init";
import { isProd } from "./utils/environment";
import { preventTDZ, preloadVendorChunks } from "./utils/tdz-prevention";
import { initPreviewHelper } from "./utils/preview-helper";

// Activăm prevenirea TDZ - foarte important să fie apelat înaintea oricărui alt cod
preventTDZ();

// Inițializăm helper-ul pentru preview mode
if (typeof window !== "undefined") {
  initPreviewHelper();
}

// Intercepție globală pentru cererile analytics doar în medii de dezvoltare (localhost)
if (
  typeof window !== "undefined" &&
  !isProd &&
  window.location.hostname === "localhost"
) {
  // ===== FETCH INTERCEPTOR =====
  const originalFetch = window.fetch;
  window.fetch = function (resource, init) {
    const url = resource instanceof Request ? resource.url : String(resource);

    // Interceptează toate cererile către API-ul de analytics
    if (url.includes("lupulsicorbul.com/api/analytics")) {
      console.log(
        `[${import.meta.env.MODE.toUpperCase()}] Cerere către API-ul de analytics interceptată:`,
        {
          url,
          method: init?.method || "GET",
          mode: init?.mode,
        }
      );

      // Verificăm dacă este preflight OPTIONS
      const isPreflightRequest = init?.method === "OPTIONS";

      // Construim headerele corespunzătoare în funcție de tipul cererii
      const headers = new Headers({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": "86400", // 24 ore pentru cache preflight
      });

      // Pentru cereri non-preflight, adăugăm și Content-Type
      if (!isPreflightRequest) {
        headers.append("Content-Type", "application/json");
      }

      // Returnăm un răspuns simulat adaptat în funcție de tipul cererii
      return Promise.resolve(
        new Response(
          // Preflight cererile nu ar trebui să aibă corp
          isPreflightRequest
            ? null
            : JSON.stringify({
                success: true,
                simulated: true,
                environment: import.meta.env.MODE,
                timestamp: new Date().toISOString(),
                message:
                  "Răspuns simulat pentru cererea de analytics în mediul de non-producție",
              }),
          {
            status: 200,
            headers: headers,
          }
        )
      );
    }

    // Pentru toate celelalte cereri, folosim fetch-ul original
    return originalFetch(resource, init);
  };

  // ===== XMLHttpRequest INTERCEPTOR =====
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;

  // Interceptăm metoda open pentru a identifica cererile către analytics
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async: boolean = true,
    username?: string | null,
    password?: string | null
  ): void {
    const urlString = url instanceof URL ? url.toString() : url;

    // Marcăm obiectul xhr dacă este o cerere către analytics
    if (
      typeof urlString === "string" &&
      urlString.includes("lupulsicorbul.com/api/analytics")
    ) {
      console.log(
        `[${import.meta.env.MODE.toUpperCase()}] Cerere XHR către API-ul de analytics interceptată:`,
        {
          url: urlString,
          method,
        }
      );

      // Adăugăm proprietate personalizată pentru a marca acest XHR ca fiind pentru analytics
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).__isAnalyticsRequest = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).__analyticsMethod = method;
    }

    // Apelăm metoda originală
    originalXhrOpen.call(this, method, url, async, username, password);
  };

  // Interceptăm metoda send pentru a simula răspunsul pentru cererile de analytics
  XMLHttpRequest.prototype.send = function (
    body?: Document | XMLHttpRequestBodyInit | null
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this as any).__isAnalyticsRequest) {
      // Simulăm progresul și răspunsul pentru o cerere reușită

      // Setăm headers pentru CORS
      this.setRequestHeader("Access-Control-Allow-Origin", "*");
      this.setRequestHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, DELETE"
      );
      this.setRequestHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );

      // Creăm event pentru a-l folosi în callbacks
      const createProgressEvent = () => {
        return new Event("readystatechange") as Event;
      };

      // Folosim defineProperty pentru a modifica proprietăți read-only
      const self = this;

      // Simulăm evenimentele asincron
      setTimeout(() => {
        // Simulăm event de deschidere a conexiunii
        if (typeof self.onreadystatechange === "function") {
          Object.defineProperty(self, "readyState", {
            value: 1,
            configurable: true,
          }); // OPENED
          self.onreadystatechange(createProgressEvent());
        }

        // Simulăm primirea header-urilor
        setTimeout(() => {
          if (typeof self.onreadystatechange === "function") {
            Object.defineProperty(self, "readyState", {
              value: 2,
              configurable: true,
            }); // HEADERS_RECEIVED
            self.onreadystatechange(createProgressEvent());
          }

          // Simulăm încărcarea datelor
          setTimeout(() => {
            if (typeof self.onreadystatechange === "function") {
              Object.defineProperty(self, "readyState", {
                value: 3,
                configurable: true,
              }); // LOADING
              self.onreadystatechange(createProgressEvent());
            }

            // Simulăm finalizarea cererii
            setTimeout(() => {
              // Setăm proprietățile pentru răspuns
              Object.defineProperty(self, "status", {
                value: 200,
                configurable: true,
              });
              Object.defineProperty(self, "statusText", {
                value: "OK",
                configurable: true,
              });

              // Setăm conținutul răspunsului
              const responseData = JSON.stringify({
                success: true,
                simulated: true,
                environment: import.meta.env.MODE,
                timestamp: new Date().toISOString(),
                message: "Răspuns simulat XHR pentru cererea de analytics",
              });

              Object.defineProperty(self, "responseText", {
                value: responseData,
                configurable: true,
              });
              Object.defineProperty(self, "response", {
                value: responseData,
                configurable: true,
              });

              // Finalizăm cererea simulată
              Object.defineProperty(self, "readyState", {
                value: 4,
                configurable: true,
              }); // DONE

              // Declanșăm evenimentele corespunzătoare
              if (typeof self.onreadystatechange === "function") {
                self.onreadystatechange(createProgressEvent());
              }

              if (typeof self.onload === "function") {
                // Creăm un ProgressEvent pentru onload
                const progressEvent = new ProgressEvent("load", {
                  lengthComputable: true,
                  loaded: responseData.length,
                  total: responseData.length,
                });
                self.onload(progressEvent);
              }
            }, 10);
          }, 10);
        }, 10);
      }, 10);

      // Returnăm fără a trimite cererea reală
      return;
    }

    // Pentru toate celelalte cereri, folosim comportamentul original
    originalXhrSend.call(this, body);
  };

  console.log(
    `[${import.meta.env.MODE.toUpperCase()}] Interceptare globală a cererilor către API-ul de analytics activată`
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./assets/styles/main.css"; // Stiluri principale
import "./assets/styles/mobile-galaxy-fix.css"; // Fix pentru Galaxy S24 FE și mobile
import { reportWebVitals } from "./utils/webVitals"; // Importăm utilitar pentru Web Vitals

// Declarații pentru TypeScript
declare global {
  interface Window {
    __FORCE_VENDOR_CHUNK_LOAD__?: boolean;
    __FIREBASE_INITIALIZED__?: boolean;
    __FIREBASE_INITIALIZATION_ERROR__?: boolean;
    __TDZ_PREVENTION_EXECUTED__?: boolean;
  }
}

// Forțăm încărcarea chunk-urilor vendor înainte de execuție pentru a preveni TDZ
window.__FORCE_VENDOR_CHUNK_LOAD__ = true;

// Implementăm un handler global pentru erori pentru a prinde erorile de inițializare
const handleInitializationErrors = () => {
  window.addEventListener("error", (event) => {
    // Logăm detaliile erorii
    console.error("Eroare de inițializare a aplicației:", event.error);

    // Dacă eroarea conține referința la 'e', este probabil o eroare TDZ
    const errorMessage = event.error?.message || event.message || "";
    const isTDZError =
      errorMessage.includes("Cannot access") &&
      (errorMessage.includes("before initialization") ||
        errorMessage.includes("is not defined"));

    if (isTDZError) {
      console.warn(
        "Detectată posibilă eroare TDZ. Încercăm reîncărcarea aplicației..."
      );
      // Marcăm eroarea și reîncărcăm pagina după o scurtă întârziere
      window.__FIREBASE_INITIALIZATION_ERROR__ = true;
      setTimeout(() => window.location.reload(), 1000);
      return;
    }

    // Afișăm un mesaj de eroare prietenos dacă aplicația nu a reușit să pornească
    if (document.getElementById("root")?.children.length === 0) {
      const errorDiv = document.createElement("div");
      errorDiv.style.padding = "20px";
      errorDiv.style.margin = "50px auto";
      errorDiv.style.maxWidth = "600px";
      errorDiv.style.backgroundColor = "#fff8f8";
      errorDiv.style.border = "1px solid #ffcdd2";
      errorDiv.style.borderRadius = "4px";
      errorDiv.style.fontFamily = "Arial, sans-serif";
      errorDiv.style.lineHeight = "1.5";
      errorDiv.style.color = "#d32f2f";

      errorDiv.innerHTML = `
        <h2 style="margin-top: 0; color: #b71c1c;">Eroare de inițializare</h2>
        <p>Ne pare rău, a apărut o eroare la inițializarea aplicației.</p>
        <p>Vă rugăm să reîncărcați pagina sau să încercați din nou mai târziu.</p>
        <p style="font-size: 0.9em; margin-top: 20px; color: #555;">
          Dacă problema persistă, vă rugăm să ne contactați.
        </p>
        <button id="reload-app" style="padding: 8px 16px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
          Reîncarcă aplicația
        </button>
      `;

      document.getElementById("root")?.appendChild(errorDiv);

      // Adăugăm handler pentru reîncărcare
      document.getElementById("reload-app")?.addEventListener("click", () => {
        window.location.reload();
      });
    }
  });
};

// Activăm handler-ul de erori
handleInitializationErrors();

// Funcția principală pentru inițializarea și randarea aplicației
async function initializeAndRenderApp() {
  try {
    // Preload vendor chunks first to avoid TDZ errors
    await preloadVendorChunks();

    // Verificăm dacă am avut o eroare anterioară și forțăm un hard refresh al cache-ului
    if (window.__FIREBASE_INITIALIZATION_ERROR__) {
      console.info(
        "Recuperare după eroare de inițializare. Curățăm cache-ul..."
      );
      // Clear any cached resources that might be causing issues
      if ("caches" in window) {
        try {
          const cacheNames = await window.caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => window.caches.delete(cacheName))
          );
          console.info("Cache curățat cu succes");
        } catch (e) {
          console.warn("Nu s-a putut curăța cache-ul", e);
        }
      }
    }

    // Așteptăm inițializarea Firebase
    console.info("Inițializare Firebase...");
    const firebaseInitialized = await ensureFirebaseInitialized();

    if (!firebaseInitialized) {
      throw new Error("Firebase nu a putut fi inițializat");
    }

    // Logăm versiunea aplicației
    const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
    console.info(
      `Aplicația Lupul și Corbul s-a inițializat - Versiune: ${appVersion}`
    ); // Randăm aplicația doar după ce Firebase a fost inițializat
    ReactDOM.createRoot(document.getElementById("root")!).render(
      isProd ? (
        <React.StrictMode>
          <App />
        </React.StrictMode>
      ) : (
        <App />
      )
    );

    // Raportare Web Vitals - activă doar în producție
    if (import.meta.env.PROD) {
      reportWebVitals();
    }
  } catch (error) {
    console.error("Eroare critică la inițializarea aplicației:", error);

    // Afișăm un mesaj de eroare prietenos
    const errorContainer = document.getElementById("root");
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div style="padding: 20px; margin: 50px auto; max-width: 600px; background-color: #fff8f8; border: 1px solid #ffcdd2; border-radius: 4px; font-family: Arial, sans-serif; line-height: 1.5; color: #d32f2f;">
          <h2 style="margin-top: 0; color: #b71c1c;">Eroare la încărcarea aplicației</h2>
          <p>Ne pare rău, a apărut o eroare la încărcarea aplicației.</p>
          <p>Vă rugăm să reîncărcați pagina sau să încercați din nou mai târziu.</p>
          <div style="margin-top: 15px; padding: 8px; background-color: #ffebee; border-radius: 4px; font-size: 0.9em;">
            <strong>Detalii eroare:</strong> ${error instanceof Error ? error.message : "Eroare necunoscută"}
          </div>
          <button onclick="window.location.reload()" style="padding: 8px 16px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
            Reîncarcă aplicația
          </button>
        </div>
      `;
    }
  }
}

// Începem inițializarea aplicației
initializeAndRenderApp();

console.log("DEBUG GLOBAL import.meta.env:", import.meta.env);
