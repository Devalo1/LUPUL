import React from "react";
import AdminNavigation from "../components/AdminNavigation";

const InventoryManagement: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Gestionare Stocuri</h2>
        
        <p className="text-gray-600">
          Această pagină este în curs de dezvoltare. În curând veți putea gestiona stocurile produselor aici.
        </p>
      </div>
    </div>
  );
};

export default InventoryManagement;
