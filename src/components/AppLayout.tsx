import React from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "../routes/appRoutes"; // Importăm rutele definite anterior
import { Layout } from "./index";

/**
 * Componenta de layout pentru întreaga aplicație
 * Gestionează structura și rutele aplicației
 */
const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  
  // Detectăm dacă suntem pe o pagină de autentificare
  const isAuthPage = 
    location.pathname === "/login" || 
    location.pathname === "/register" || 
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  // Pentru paginile de autentificare nu afișăm header și footer
  if (isAuthPage) {
    return <AppRoutes />;
  }

  return (
    <Layout isAdmin={isAdminRoute}>
      <AppRoutes />
    </Layout>
  );
};

export default AppLayout;
