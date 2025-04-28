import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { AdminService } from "../services/adminService";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    async function verificaAdmin() {
      if (!user || !user.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      try {
        // Verificăm dacă email-ul curent este pentru admin
        const esteAdmin = await AdminService.verificaRolAdmin(user.email);
        setIsAdmin(esteAdmin);
        setError(null);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
        setError("Nu s-a putut verifica rolul de administrator");
      } finally {
        setLoading(false);
      }
    }
    
    verificaAdmin();
  }, [user]);
  
  return { isAdmin, loading, error };
};
