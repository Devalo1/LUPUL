import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // For admin routes, you would check a custom claim or a specific property
  // This is a simplified example
  if (adminOnly) {
    // Check if user has admin permissions
    // For example: if (!currentUser.email?.endsWith('@admin.com'))
    // Replace with your actual admin check logic
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
