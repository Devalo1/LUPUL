import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./assets/styles/main.css"; // Stiluri principale
import { initializeFirebase } from "./firebase"; // Inițializare Firebase
import { reportWebVitals } from "./utils/webVitals"; // Importăm utilitar pentru Web Vitals

// Add this declaration for the window property to avoid TypeScript errors
declare global {
  interface Window {
    __FORCE_VENDOR_CHUNK_LOAD__?: boolean;
  }
}

// Add this line to force the JavaScript engine to evaluate the vendor bundle first
window.__FORCE_VENDOR_CHUNK_LOAD__ = true;

// Implementăm un handler global pentru erori pentru a prinde erorile de inițializare
const handleInitializationErrors = () => {
  window.addEventListener("error", (event) => {
    // Log error details
    console.error("Application initialization error:", event.error);
    
    // Display user-friendly error if the app fails to start
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
      
      // Add reload handler
      document.getElementById("reload-app")?.addEventListener("click", () => {
        window.location.reload();
      });
    }
  });
};

// Activăm handler-ul de erori
handleInitializationErrors();

// Înfășurăm inițializarea în try-catch pentru a prinde orice eroare potențială
try {
  // Inițializăm Firebase înainte de a randa aplicația
  initializeFirebase();

  // Logăm versiunea aplicației
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
  console.log(`Aplicația Lupul și Corbul s-a inițializat - Versiune: ${appVersion}`);

  // Rendering-ul aplicației
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
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
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
          Reîncarcă aplicația
        </button>
      </div>
    `;
  }
}