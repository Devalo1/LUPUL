import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  path?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, path }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (path === '/admin' && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
