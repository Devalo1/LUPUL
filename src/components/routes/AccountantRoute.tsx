import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

interface AccountantRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componentă de protecție a rutelor care necesită rol de contabil
 * Verifică dacă utilizatorul este contabil și redirecționează dacă nu
 */
const AccountantRoute: React.FC<AccountantRouteProps> = ({
  children,
  redirectTo = "/dashboard"
}) => {
  const { user, loading } = useAuth();
  const [isAccountant, setIsAccountant] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(true);
  const navigate = useNavigate(); // Add useNavigate for programmatic navigation

  useEffect(() => {
    const checkAccountantStatus = async () => {
      if (!user) {
        console.log("AccountantRoute: No user, redirecting");
        setIsAccountant(false);
        setChecking(false);
        return;
      }

      try {
        console.log("AccountantRoute: Checking accountant status for user:", user.uid);
        
        // Always verify with database for consistent behavior
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("AccountantRoute: User data:", userData);
          
          // Expand role check to handle all possible variations
          const isAccountantRole = 
            userData.role === "accountant" || 
            userData.role === "ACCOUNTANT" ||
            userData.isAccountant === true ||
            (userData.roles && (
              userData.roles.accountant === true || 
              userData.roles.ACCOUNTANT === true
            ));
          
          console.log("AccountantRoute: Final role check result:", isAccountantRole);
          setIsAccountant(isAccountantRole);
        } else {
          console.log("AccountantRoute: User document doesn't exist");
          setIsAccountant(false);
        }
      } catch (error) {
        console.error("Error checking accountant status:", error);
        setIsAccountant(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccountantStatus();
  }, [user]);

  // Forcing a more direct approach when navigation is needed
  useEffect(() => {
    if (!loading && !checking && isAccountant === false) {
      console.log("AccountantRoute: Accountant check complete, not an accountant, redirecting to", redirectTo);
      navigate(redirectTo);
    }
  }, [isAccountant, checking, loading, navigate, redirectTo]);

  // Display loading spinner while checking
  if (loading || checking) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-blue-500">Verificare rol contabil...</p>
      </div>
    );
  }

  // Return the protected content if user is an accountant
  if (user && isAccountant) {
    console.log("AccountantRoute: Access granted to accountant panel");
    return <>{children}</>;
  }

  // Default case - redirect to dashboard using Navigate component
  console.log("AccountantRoute: Access denied, redirecting to dashboard");
  return <Navigate to={redirectTo} replace />;
};

export default AccountantRoute;