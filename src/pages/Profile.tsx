import React, { useState } from "react";
import { useAuth } from "../contexts";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const userDisplayName = "Utilizator"; // Default value or fetch from another source
  console.log(`Profile page for ${userDisplayName}`);

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
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{userDisplayName}</h3>
              <p className="text-gray-600">Email nespecificat</p>
              <p className="text-sm text-gray-500 mt-1">Membru din nespecificat</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-lg mb-2">Informații personale</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Nume: <span className="text-gray-700">{userDisplayName}</span></p>
                <p className="text-sm text-gray-500">Email: <span className="text-gray-700">Nespecificat</span></p>
                <p className="text-sm text-gray-500">Telefon: <span className="text-gray-700">Nespecificat</span></p>
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
              {loading ? "Se procesează..." : "Deconectare"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;