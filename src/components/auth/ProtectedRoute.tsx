import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../contexts/AuthContext'; // Changed to default import
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { currentUser, loading }: { currentUser: { isAdmin: boolean } | null; loading: boolean } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verificare autentificare..." />;
  }

  if (!currentUser) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If route requires admin privileges and user is not admin
  if (adminOnly && !currentUser.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
