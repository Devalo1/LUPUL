import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">Profilul meu</h1>
          <p className="mt-2 text-blue-100">Gestionează-ți contul și preferințele</p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 
               currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{currentUser.displayName || 'Utilizator'}</h3>
              <p className="text-gray-600">{currentUser.email}</p>
              <p className="text-sm text-gray-500 mt-1">Membru din {new Date(currentUser.metadata.creationTime || Date.now()).toLocaleDateString('ro-RO')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Informații personale</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Nume: <span className="text-gray-700">{currentUser.displayName || 'Nespecificat'}</span></p>
                <p className="text-sm text-gray-500">Email: <span className="text-gray-700">{currentUser.email}</span></p>
                <p className="text-sm text-gray-500">Telefon: <span className="text-gray-700">{currentUser.phoneNumber || 'Nespecificat'}</span></p>
              </div>
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-500">Editează informațiile</button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Preferințe cont</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Preferință comunicare: <span className="text-gray-700">Email</span></p>
                <p className="text-sm text-gray-500">Limba: <span className="text-gray-700">Română</span></p>
              </div>
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-500">Modifică preferințele</button>
            </div>
          </div>
          
          <div className="border-t pt-6 flex justify-end">
            <button 
              onClick={handleSignOut}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Se procesează...' : 'Deconectare'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;