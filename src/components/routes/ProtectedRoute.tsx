import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Layout><HomePage /></Layout>} />
    <Route path="/login" element={<Layout><LoginPage /></Layout>} />
    <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/userhome"
      element={
        <ProtectedRoute>
          <Layout><UserHome /></Layout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default ProtectedRoute;
