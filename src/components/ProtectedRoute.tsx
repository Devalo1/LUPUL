import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth'; // Updated import path

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
