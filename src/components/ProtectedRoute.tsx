import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Loading component
const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">Se încarcă...</p>
    </div>
  );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only skip redirection if we're already at the dashboard
    if (isAuthenticated && !loading && !hasRedirected.current && location.pathname !== "/dashboard") {
      hasRedirected.current = true;
      navigate("/dashboard", { replace: true });
    }

    // Reset flag when user becomes unauthenticated
    if (!isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, loading, navigate, location.pathname]);

  useEffect(() => {
    // Only redirect if not authenticated, not in loading state, and haven't redirected yet
    if (!isAuthenticated && !loading && !hasRedirected.current) {
      hasRedirected.current = true;
      // Use navigate instead of Navigate component
      navigate("/login", { 
        state: { from: location },
        replace: true 
      });
    }
    
    // Reset flag when user becomes authenticated
    if (isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, loading, navigate, location]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // If authenticated, render children
  // If not authenticated, the useEffect will handle the redirect
  // and we'll just render a placeholder until that happens
  return isAuthenticated ? <>{children}</> : <LoadingSpinner />;
};

export default ProtectedRoute;
