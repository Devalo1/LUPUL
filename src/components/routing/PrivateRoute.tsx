import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { CircularProgress, Box } from "@mui/material";
import logger from "../../utils/logger";

// Create a component-specific logger
const routeLogger = logger.createLogger("PrivateRoute");

// Define a proper type for the auth state
interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: {
    uid: string;
    [key: string]: unknown;
  } | null;
}

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading, user } = useSelector((state: { auth: AuthState }) => state.auth);
  
  routeLogger.debug("PrivateRoute checking auth state:", { 
    isAuthenticated, 
    loading, 
    userExists: !!user 
  });

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Direct check with auth instance as a fallback
  const isUserLoggedIn = isAuthenticated || !!user;
  
  if (!isUserLoggedIn) {
    routeLogger.info("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  routeLogger.debug("User is authenticated, rendering protected content");
  return <Outlet />;
};

export default PrivateRoute;
