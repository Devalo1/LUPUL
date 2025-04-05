import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const UserHome: React.FC = () => {
  const { currentUser, loading } = useAuth();

  // Redirecționează utilizatorii neautentificați
  if (!loading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-yellow-400">
            <h2 className="text-2xl font-semibold text-gray-800">
              Bun venit, {currentUser?.displayName || currentUser?.email || 'Utilizator'}!
            </h2>
            <p className="text-gray-600">
              Membru din {new Date(currentUser?.metadata?.creationTime || Date.now()).toLocaleDateString('ro-RO')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserHome;