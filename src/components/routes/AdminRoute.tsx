import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Loading component that was missing
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-gray-600">{message}</p>
  </div>
);

interface AdminRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * Componentă pentru protejarea rutelor care necesită drepturi de administrator
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  redirectPath = "/dashboard" 
}) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Afișăm un indicator de încărcare în timp ce se verifică autentificarea și drepturile de admin
  if (loading) {
    return <LoadingFallback message="Se verifică drepturile de administrator..." />;
  }

  // Verificăm dacă utilizatorul este autentificat
  if (!user) {
    // Salvăm calea curentă pentru a reveni după autentificare
    sessionStorage.setItem("afterLoginRedirect", location.pathname);
    
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace
      />
    );
  }

  // Verificăm dacă utilizatorul are drepturi de administrator
  if (!isAdmin) {
    console.warn("Acces restricționat: Utilizatorul nu are drepturi de administrator");
    
    return (
      <Navigate 
        to={redirectPath} 
        state={{ message: "Acces restricționat: Trebuie să fii administrator pentru a accesa această pagină." }} 
        replace
      />
    );
  }

  // Dacă utilizatorul este administrator, permitem accesul la ruta protejată
  return <>{children}</>;
};

export default AdminRoute;