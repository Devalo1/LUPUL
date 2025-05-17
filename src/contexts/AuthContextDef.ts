import { createContext } from "react";
import { AuthContextType, defaultAuthContextValue } from "./AuthContextType";

// Create the context and export it directly
export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);
