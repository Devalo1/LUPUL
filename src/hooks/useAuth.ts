import { useContext } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";

/**
 * Hook to access the auth context throughout the application
 * @returns {AuthContextType} The auth context with all authentication functions and state
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
