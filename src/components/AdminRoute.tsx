import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isUserAdmin } from '../utils/userRoles';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        const admin = await isUserAdmin(currentUser.email || '');
        setIsAdmin(admin);
      }
      setCheckingAdmin(false);
    };

    if (!loading) {
      checkAdmin();
    }
  }, [currentUser, loading]);

  if (loading || checkingAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Se verifică permisiunile...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
