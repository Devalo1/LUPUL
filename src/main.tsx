import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Import debug utilities pentru development
import { debugAdminRoles } from "./utils/debugAdmin";
import adminRoleFixer from "./utils/adminRoleFixer";

// Pune utilitarele de debug pe obiectul global window pentru access din consolă
if (typeof window !== "undefined") {
  (
    window as unknown as {
      debugAdminRoles?: typeof debugAdminRoles;
      adminRoleFixer?: typeof adminRoleFixer;
    }
  ).debugAdminRoles = debugAdminRoles;
  (
    window as unknown as {
      debugAdminRoles?: typeof debugAdminRoles;
      adminRoleFixer?: typeof adminRoleFixer;
    }
  ).adminRoleFixer = adminRoleFixer;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
