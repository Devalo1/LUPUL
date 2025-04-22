import React from "react";
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
import "./App.css";

/**
 * Componenta principală a aplicației
 */
const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationProvider>
            <CartProvider>
              <CategoryProvider>
                {/* Componenta care inițializează datele în Firestore */}
                <DataInitializer />
                <Routes>
                  <Route path="/programari" element={
                    <ProtectedRoute>
                      <Appointments />
                    </ProtectedRoute>
                  } />
                </Routes>
                <AppLayout />
              </CategoryProvider>
            </CartProvider>
          </NavigationProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
