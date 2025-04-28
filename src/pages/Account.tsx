import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Correct import
import Button from "../components/common/Button";

const Account: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      console.log("User logged out");
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Tablou de bord</h1>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Comenzile mele</h3>
                <p className="text-sm text-gray-600 mb-3">Vizualizează și gestionează comenzile tale</p>
                <Button onClick={() => navigate("/comenzi")} variant="outline" size="sm">
                  Vezi comenzi
                </Button>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Informații personale</h3>
                <p className="text-sm text-gray-600 mb-3">Actualizează detaliile contului tău</p>
                <Button onClick={() => navigate("/profil")} variant="outline" size="sm">
                  Editează profil
                </Button>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Programări terapie</h3>
                <p className="text-sm text-gray-600 mb-3">Vizualizează și gestionează programările</p>
                <Button onClick={() => navigate("/programari")} variant="outline" size="sm">
                  Vezi programări
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:bg-red-50">
            Deconectare
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Account;
