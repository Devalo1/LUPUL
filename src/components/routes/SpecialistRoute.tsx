import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isUserSpecialist } from "../../utils/authUtils";
import { canAccessSpecialistFeatures } from "../../utils/roleUtils";

interface SpecialistRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componentă de protecție a rutelor care necesită rol de specialist
 * Verifică dacă utilizatorul este specialist și redirecționează dacă nu
 */
const SpecialistRoute: React.FC<SpecialistRouteProps> = ({
  children,
  redirectTo = "/dashboard"
}) => {
  const { user, loading, userRole, isSpecialist: contextIsSpecialist } = useAuth();
  const [isSpecialist, setIsSpecialist] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkSpecialistStatus = async () => {
      if (!user) {
        setIsSpecialist(false);
        setChecking(false);
        return;
      }

      try {
        // Prima dată verificăm dacă AuthContext deja știe că utilizatorul e specialist
        if (contextIsSpecialist || userRole === "specialist" || userRole === "SPECIALIST") {
          console.log("Acces specialist autorizat via context de autentificare");
          setIsSpecialist(true);
          setChecking(false);
          return;
        }

        // Apoi verificăm cu metoda canAccessSpecialistFeatures care combină verificări multiple
        const canAccess = await canAccessSpecialistFeatures(user);
        if (canAccess) {
          console.log("Acces specialist autorizat via canAccessSpecialistFeatures");
          setIsSpecialist(true);
          setChecking(false);
          return;
        }

        // În cele din urmă verificăm direct în baza de date ca metodă de rezervă
        const specialistStatus = await isUserSpecialist(user.uid);
        console.log("Acces specialist verificat direct în baza de date:", specialistStatus);
        setIsSpecialist(specialistStatus);
      } catch (error) {
        console.error("Error checking specialist status:", error);
        setIsSpecialist(false);
      } finally {
        setChecking(false);
      }
    };

    checkSpecialistStatus();
  }, [user, userRole, contextIsSpecialist]);

  // Afișăm indicator de încărcare în timpul verificării
  if (loading || checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirecționăm dacă utilizatorul nu e specialist
  if (!user || !isSpecialist) {
    console.log("Redirecționare de la ruta protejată pentru specialist - utilizator neautorizat");
    return <Navigate to={redirectTo} replace />;
  }

  // Returnăm conținutul protejat dacă utilizatorul e specialist
  return <>{children}</>;
};

export default SpecialistRoute;