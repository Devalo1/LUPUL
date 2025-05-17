// Export contexts
import { AuthContext } from "./AuthContextDef";
import ThemeContext from "./ThemeContext";
import CategoryContext from "./CategoryContext";
import { NavigationContext } from "./navigation/NavigationContextValue";

// Export providers
import { AuthProvider } from "./AuthContextComponent";
import { EnhancedAuthProvider as AuthWrapperProvider } from "./CleanAuthProvider";
import { ThemeProvider } from "./ThemeContext";
import { CategoryProvider } from "./CategoryContext";
import { NavigationProvider } from "./NavigationContext";

// Export hooks
import { useAuth } from "./useAuth"; // Import from the new useAuth file
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
  AuthWrapperProvider,
  ThemeProvider,
  CategoryProvider,
  NavigationProvider,
  
  // Hooks
  useAuth,
  useTheme,
  useCategories,
  useNavigation
};
