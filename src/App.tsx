import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./ErrorBoundary";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from "./contexts/AuthContextProvider";
import { NavigationProvider } from "./contexts/NavigationContext";
import { CartProvider } from "./contexts/CartContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import DataInitializer from "./components/DataInitializer";
import {
  initPerformanceMonitoring,
  prefetchCriticalResources,
} from "./utils/performance";
import "./App.css";
import { AssistantProfileProvider } from "./contexts/AssistantProfileContext";
import { ConversationsProvider } from "./contexts/ConversationsContext";

/**
 * Componenta principală a aplicației - TEST MODIFICARE VITE
 */
const App: React.FC = () => {
  // Inițializăm monitorizarea performanței
  useEffect(() => {
    // Inițializăm monitorizarea performanței
    initPerformanceMonitoring();

    // Preîncărcăm resursele critice pentru îmbunătățirea performanței
    prefetchCriticalResources([
      // Adăugăm rutele importante care vor fi accesate probabil
      "/programari",
      "/assets/images/background.jpeg", // Exemplu de imagine importantă
    ]);
  }, []);
  // Rutele sunt gestionate de AppLayout/AppRoutes
  // Nu mai definim rute duplicate aici pentru a evita conflictele
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationProvider>
            <CartProvider>
              <CategoryProvider>
                <AssistantProfileProvider>
                  <ConversationsProvider>
                    {" "}
                    {/* Componenta care inițializează datele în Firestore */}
                    <DataInitializer />{" "}
                    {/* Toate rutele sunt gestionate în AppLayout */}{" "}
                    <AppLayout />
                    <ToastContainer
                      position="top-right"
                      autoClose={4000}
                      hideProgressBar={false}
                      newestOnTop={false}
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                    />
                  </ConversationsProvider>
                </AssistantProfileProvider>
              </CategoryProvider>
            </CartProvider>
          </NavigationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default React.memo(App);
