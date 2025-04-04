import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return <LoadingSpinner fullScreen text="Verificăm autentificarea..." />;
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // For admin-only routes, check if user has admin role
  // This assumes your user object has an isAdmin property
  // You would need to implement this logic according to your app's needs
  if (adminOnly) {
    // Replace with your actual admin check logic
    const isAdmin = currentUser.email === 'admin@example.com'; // Example check
    
    if (!isAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated (and is admin if required), render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
