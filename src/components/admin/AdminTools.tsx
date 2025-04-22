import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth"; // Update this import
import { AdminService } from "../../services/adminService";
import { verificaRestaurareProdusTradițional } from "../../services/productService";
import { curataEvenimenteDuplicate } from "../../services/eventService";

interface ResultState {
  admin?: { success: boolean; message: string };
  evenimente?: { success: boolean; message: string };
  produs?: { success: boolean; message: string };
}

const AdminTools: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [rezultate, setRezultate] = useState<ResultState>({});
  const { user } = useAuth();

  useEffect(() => {
    // Verificăm automat rolul de admin la încărcarea componentei
    if (user?.email === "dani_popa21@yahoo.ro") {
      verificaAdmin();
    }
  }, [user]);

  const verificaAdmin = async () => {
    setLoading(true);
    try {
      const success = await AdminService.verificaSiCorecteazaAdminPrincipal();
      setRezultate(prev => ({ 
        ...prev, 
        admin: { 
          success, 
          message: success 
            ? "Rolul de admin a fost verificat și corectat cu succes" 
            : "Nu s-a putut verifica/corecta rolul de admin" 
        } 
      }));
    } catch (error) {
      console.error("Eroare la verificarea admin:", error);
      setRezultate(prev => ({ 
        ...prev, 
        admin: { 
          success: false, 
          message: "Eroare la verificarea rolului de admin" 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const restaureazaProdus = async () => {
    setLoading(true);
    try {
      const result = await verificaRestaurareProdusTradițional();
      setRezultate(prev => ({ 
        ...prev, 
        produs: result 
      }));
    } catch (error) {
      console.error("Eroare la restaurarea produsului:", error);
      setRezultate(prev => ({ 
        ...prev, 
        produs: { 
          success: false, 
          message: "Eroare la procesarea produsului" 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const curataEvenimente = async () => {
    setLoading(true);
    try {
      const result = await curataEvenimenteDuplicate();
      setRezultate(prev => ({ 
        ...prev, 
        evenimente: result 
      }));
    } catch (error) {
      console.error("Eroare la curățarea evenimentelor:", error);
      setRezultate(prev => ({ 
        ...prev, 
        evenimente: { 
          success: false, 
          message: "Eroare la procesarea evenimentelor" 
        } 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-tools-container">
      <h2>Instrumente de administrare</h2>
      
      <div className="admin-tools-grid">
        <div className="admin-tool-card">
          <h3>Verifică și repară rolul de admin</h3>
          <p>Verifică și repară rolul de admin pentru dani_popa21@yahoo.ro</p>
          <button 
            onClick={verificaAdmin} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Se procesează..." : "Verifică admin"}
          </button>
          {rezultate.admin && (
            <div className={`result ${rezultate.admin.success ? "success" : "error"}`}>
              {rezultate.admin.message}
            </div>
          )}
        </div>
        
        <div className="admin-tool-card">
          <h3>Restaurează produsul "Dulceață de afine"</h3>
          <p>Verifică și restaurează produsul în categoria produselor tradiționale</p>
          <button 
            onClick={restaureazaProdus} 
            disabled={loading}
            className="btn btn-success"
          >
            {loading ? "Se procesează..." : "Restaurează produs"}
          </button>
          {rezultate.produs && (
            <div className={`result ${rezultate.produs.success ? "success" : "error"}`}>
              {rezultate.produs.message}
            </div>
          )}
        </div>
        
        <div className="admin-tool-card">
          <h3>Curăță evenimente duplicate</h3>
          <p>Elimină evenimentele duplicate din baza de date</p>
          <button 
            onClick={curataEvenimente} 
            disabled={loading}
            className="btn btn-warning"
          >
            {loading ? "Se procesează..." : "Curăță evenimente"}
          </button>
          {rezultate.evenimente && (
            <div className={`result ${rezultate.evenimente.success ? "success" : "error"}`}>
              {rezultate.evenimente.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTools;
