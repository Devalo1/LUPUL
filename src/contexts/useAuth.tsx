import { useContext } from "react";
import { AuthContext } from "./AuthContextDef";
import { AuthContextType } from "./AuthContextType";

// Export the useAuth hook
export const useAuth = (): AuthContextType => useContext(AuthContext);
