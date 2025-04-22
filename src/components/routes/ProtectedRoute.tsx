import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingFallback } from "../index";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * Componentă pentru protejarea rutelor care necesită autentificare
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectPath = "/login" 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Afișăm un indicator de încărcare în timp ce se verifică autentificarea
  if (loading) {
    return <LoadingFallback message="Se verifică autentificarea..." />;
  }

  // Dacă utilizatorul nu este autentificat, redirecționăm către pagina de login
  // și stocăm calea curentă pentru a reveni după autentificare
  if (!user) {
    // Salvăm calea curentă pentru a reveni după autentificare
    sessionStorage.setItem("afterLoginRedirect", location.pathname);
    
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location.pathname }} 
        replace
      />
    );
  }

  // Dacă utilizatorul este autentificat, permitem accesul la ruta protejată
  return <>{children}</>;
};

export default ProtectedRoute;
