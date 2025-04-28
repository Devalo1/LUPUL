import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * @deprecated Use pages/Admin.tsx instead
 * Acest component redirectează către noua pagină de administrare unificată în Admin.tsx
 */
const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.warn("AdminPage.tsx este depreciat. Folosiți pagina /admin/dashboard sau /admin în schimb.");
    navigate("/admin", { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="loading">Redirecționare către pagina de administrare...</div>
    </div>
  );
};

export default AdminPage;
