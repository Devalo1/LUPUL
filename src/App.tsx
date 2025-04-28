import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from "./contexts/AuthContextProvider";
import { NavigationProvider } from "./contexts/NavigationContext";
import { CartProvider } from "./contexts/CartContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import DataInitializer from "./components/DataInitializer";
import AuthDebugger from "./components/AuthDebugger";
import ProfileSynchronizer from "./components/ProfileSynchronizer";
import TokenRecoveryModal from "./components/TokenRecoveryModal";
import { initPerformanceMonitoring, prefetchCriticalResources } from "./utils/performance";
import TokenHealthMonitor from "./components/TokenHealthMonitor";
import TokenBlocker from "./firebase/tokenBlocker";
import TokenManager from "./utils/TokenManager";
import "./App.css";

// Adăugăm un captor global de erori pentru a detecta probleme de autentificare, dar mai puțin agresiv
const setupErrorCaptureForRecovery = () => {
  const originalConsoleError = console.error;
  let errorCount = 0;
  const ERROR_THRESHOLD = 5; // Număr minim de erori înainte de a lua măsuri
  
  // Suprascriem console.error pentru a putea detecta erorile legate de autentificare
  console.error = (...args) => {
    // Apelăm funcția originală
    originalConsoleError.apply(console, args);
    
    // Verificăm dacă eroarea este legată de autentificare
    const errorMessage = args.join(" ");
    if (
      errorMessage.includes("auth/quota-exceeded") || 
      errorMessage.includes("400 Bad Request") ||
      errorMessage.includes("auth/invalid-credential")
    ) {
      // Salvăm eroarea într-o proprietate globală pentru a fi verificată de TokenRecoveryModal
      (window as unknown as Record<string, string>).__lastError = errorMessage;
      
      // Incrementăm contorul de erori
      errorCount++;
      
      // Activăm blocarea TokenBlocker pentru erori severe
      if (errorCount >= ERROR_THRESHOLD) {
        TokenBlocker.blockTokenRequests(`Prag de erori de consolă atins: ${ERROR_THRESHOLD}`);
      }
    } else {
      // Reducem treptat contorul pentru alte tipuri de erori
      if (errorCount > 0) errorCount--;
    }
  };
};

/**
 * Componenta principală a aplicației
 */
const App: React.FC = () => {
  // Inițializăm monitorizarea performanței și captarea erorilor
  useEffect(() => {
    // Inițializăm captarea erorilor pentru recuperare
    setupErrorCaptureForRecovery();
    
    // Inițializăm monitorizarea performanței
    initPerformanceMonitoring();
    
    // Preîncărcăm resursele critice pentru îmbunătățirea performanței
    prefetchCriticalResources([
      // Adăugăm rutele importante care vor fi accesate probabil
      "/programari",
      "/assets/images/background.jpeg", // Exemplu de imagine importantă
    ]);
    
    // Adăugăm un buton de urgență discret pentru a rezolva problema manual
    const addEmergencyButton = () => {
      const existingButton = document.getElementById("emergency-auth-fix");
      if (existingButton) return;
      
      const emergencyButton = document.createElement("button");
      emergencyButton.id = "emergency-auth-fix";
      emergencyButton.textContent = "Rezolvă probleme autentificare";
      emergencyButton.style.position = "fixed";
      emergencyButton.style.bottom = "20px";
      emergencyButton.style.right = "20px";
      emergencyButton.style.zIndex = "999"; // Zindex mai mic pentru a nu acoperi interfața
      emergencyButton.style.backgroundColor = "#ff5722";
      emergencyButton.style.color = "white";
      emergencyButton.style.border = "none";
      emergencyButton.style.borderRadius = "4px";
      emergencyButton.style.padding = "8px 12px"; // Puțin mai mic
      emergencyButton.style.cursor = "pointer";
      emergencyButton.style.fontSize = "12px"; // Text mai mic
      emergencyButton.style.opacity = "0.7"; // Setat la semi-transparent
      emergencyButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
      
      // Adăugăm un hover effect pentru a crește vizibilitatea la nevoie
      emergencyButton.onmouseover = () => {
        emergencyButton.style.opacity = "1";
      };
      
      emergencyButton.onmouseout = () => {
        emergencyButton.style.opacity = "0.7";
      };
      
      // Se activează doar când utilizatorul apasă manual butonul
      emergencyButton.onclick = () => {
        if (confirm("Doriți să curățați datele de autentificare? Veți fi deconectat.")) {
          // Utilizăm TokenManager direct pentru curățare și deconectare
          TokenManager.clearTokensAndLogout();
        }
      };
      
      document.body.appendChild(emergencyButton);
    };
    
    // Adăugăm butonul după încărcarea completă a paginii, dar cu întârziere mai mare
    setTimeout(addEmergencyButton, 5000);
  }, []);
  
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationProvider>
            <CartProvider>
              <CategoryProvider>
                {/* Componenta care inițializează datele în Firestore */}
                <DataInitializer />
                {/* Sincronizatorul de profil global */}
                <ProfileSynchronizer />
                {/* Monitor pentru sănătatea token-urilor */}
                <TokenHealthMonitor />
                <AuthDebugger />
                {/* Modal pentru recuperarea după erori de autentificare */}
                <TokenRecoveryModal />
                
                {/* Utilizăm doar AppLayout pentru a gestiona toate rutele */}
                <AppLayout />
              </CategoryProvider>
            </CartProvider>
          </NavigationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

// Replace any with more specific types
type AppData = { id: string; name: string; /* other properties */ };

const _handleSomething = (_data: AppData) => {
  // Function logic here
};

// Change GenericObject to _GenericObject since it's unused
type _GenericObject = Record<string, unknown>;

// Replace 'any' with a more specific type
const _someFunction = (_param: string): void => {
  // implementation
}

export default React.memo(App);
