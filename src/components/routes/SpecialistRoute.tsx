import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isUserSpecialist } from "../../utils/userRoles";
import { LoadingFallback } from "../index";

interface SpecialistRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * Componentă pentru protejarea rutelor care necesită rol de specialist
 */
const SpecialistRoute: React.FC<SpecialistRouteProps> = ({ 
  children, 
  redirectPath = "/login" 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isSpecialist, setIsSpecialist] = React.useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkSpecialistStatus = async () => {
      if (!user) {
        setIsSpecialist(false);
        setCheckingRole(false);
        return;
      }

      try {
        const specialistStatus = await isUserSpecialist(user.email || "");
        setIsSpecialist(specialistStatus);
      } catch (error) {
        console.error("Eroare la verificarea statutului de specialist:", error);
        setIsSpecialist(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!loading) {
      checkSpecialistStatus();
    }
  }, [user, loading]);

  // Afișăm un indicator de încărcare în timp ce se verifică autentificarea și rolul de specialist
  if (loading || checkingRole) {
    return <LoadingFallback message="Se verifică drepturile de specialist..." />;
  }

  // Verificăm dacă utilizatorul este autentificat
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

  // Verificăm dacă utilizatorul are rolul de specialist
  if (!isSpecialist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="text-amber-600 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Acces restricționat</h1>
          <p className="text-center text-gray-600 mb-6">
            Doar specialiștii pot accesa această secțiune. Nu aveți permisiunile necesare.
          </p>
          {user.email && (
            <p className="text-center text-gray-500 mb-4">
              Email: {user.email}
            </p>
          )}
          <div className="flex justify-center">
            <a
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Înapoi la pagina principală
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Dacă utilizatorul este specialist, permitem accesul la ruta protejată
  return <>{children}</>;
};

export default SpecialistRoute;