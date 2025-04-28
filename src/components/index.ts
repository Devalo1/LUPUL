// Exporturile standard pentru toate componentele comune

// Common UI components
export { default as Button } from "./common/Button";
export { default as ErrorMessage } from "./common/ErrorMessage";
export { default as LoadingFallback } from "./ui/LoadingFallback";
export { default as Card } from "./common/Card";

// Form components
export { default as Input } from "./common/Input";
export { default as Checkbox } from "./common/Checkbox";
export { default as Select } from "./common/Select";
export { default as TextArea } from "./common/TextArea";

// Layout components
export { default as Layout } from "./layout/Layout";
export { default as Navbar } from "./layout/Navbar";
export { default as Footer } from "./layout/Footer";
export { default as SideNavigation } from "./navigation/SideNavigation";

// Auth components
export { default as Login } from "./auth/Login";
export { default as GoogleLoginButton } from "./auth/GoogleLoginButton";
export { default as ProtectedRoute } from "./routes/ProtectedRoute";
export { default as AdminRoute } from "./routes/AdminRoute";
export { default as SpecialistRoute } from "./routes/SpecialistRoute";
export { default as AuthDebugger } from "./AuthDebugger";

// Other exports
export { default as AdminNavigation } from "./AdminNavigation";
export { default as ProductsHeader } from "./ProductsHeader";
export { default as CartTable } from "./CartTable";