import React, { useMemo, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import AppLayout from "./components/AppLayout";
import { AuthProvider } from "./contexts/AuthContextProvider";
import { NavigationProvider } from "./contexts/NavigationContext";
import { CartProvider } from "./contexts/CartContext";
import { CategoryProvider } from "./contexts/CategoryContext";
import DataInitializer from "./components/DataInitializer";
import ProtectedRoute from "./components/ProtectedRoute";
import Appointments from "./pages/Appointments";
import { initPerformanceMonitoring, prefetchCriticalResources } from "./utils/performance";
import "./App.css";

/**
 * Componenta principală a aplicației
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

  // Utilizăm useMemo pentru a optimiza structura Routes
  const appRoutes = useMemo(() => (
    <Routes>
      <Route path="/programari" element={
        <ProtectedRoute>
          <Appointments />
        </ProtectedRoute>
      } />
    </Routes>
  ), []);

  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationProvider>
            <CartProvider>
              <CategoryProvider>
                {/* Componenta care inițializează datele în Firestore */}
                <DataInitializer />
                {appRoutes}
                <AppLayout />
              </CategoryProvider>
            </CartProvider>
          </NavigationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default React.memo(App);
