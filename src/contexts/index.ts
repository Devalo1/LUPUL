// Export contexts
import { AuthContext } from "./AuthContext";
import ThemeContext from "./ThemeContext";
import CategoryContext from "./CategoryContext";
import { NavigationContext } from "./navigation/NavigationContextValue";

// Export providers
import { AuthProvider } from "./AuthContextProvider";
import { ThemeProvider } from "./ThemeContext";
import { CategoryProvider } from "./CategoryContext";
import { NavigationProvider } from "./NavigationContext";

// Export hooks
import { useAuth } from "./AuthContext"; // Import directly from AuthContext
import { useTheme } from "../hooks/useTheme";
import { useCategories } from "../hooks/useCategories";
import { useNavigation } from "../hooks/useNavigation";

// Export everything together
export {
  // Contexts
  AuthContext,
  ThemeContext,
  CategoryContext,
  NavigationContext,
  
  // Providers
  AuthProvider,
  ThemeProvider,
  CategoryProvider,
  NavigationProvider,
  
  // Hooks
  useAuth,
  useTheme,
  useCategories,
  useNavigation
};
