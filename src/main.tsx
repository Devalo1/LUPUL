import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./assets/styles/main.css"; // Stiluri principale
import { initializeFirebase } from "./firebase"; // Inițializare Firebase
import { reportWebVitals } from "./utils/webVitals"; // Importăm utilitar pentru Web Vitals

// Inițializăm Firebase înainte de a randa aplicația
initializeFirebase();

// Logăm versiunea aplicației
const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
console.log(`Aplicația Lupul și Corbul s-a inițializat - Versiune: ${appVersion}`);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Raportare Web Vitals - activă doar în producție
if (import.meta.env.PROD) {
  reportWebVitals();
}