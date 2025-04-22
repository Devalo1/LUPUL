import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Verifică dacă ruta curentă este activă
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-white border-b border-gray-200 mb-4 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">
            <Link to="/admin" className="hover:text-blue-600 transition-colors">
              Panou Administrativ
            </Link>
          </h1>
          
          {user && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Autentificat ca:</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          )}
        </div>
        
        <nav className="hidden md:flex flex-wrap -mb-px py-2">
          {/* Dashboard principal */}
          <Link
            to="/admin"
            className={`py-4 px-4 font-medium transition-colors flex items-center ${
              isActive("/admin") 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </Link>
          
          <div className="relative group">
            <Link
              to="/admin/add-product"
              className={`py-4 px-4 font-medium transition-colors flex items-center ${
                isActive("/admin/add-product") || isActive("/admin/categories") || isActive("/admin/inventory")
                  ? "border-b-2 border-blue-600 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Produse
            </Link>
          </div>
          
          <div className="relative group">
            <Link
              to="/admin/add-event"
              className={`py-4 px-4 font-medium transition-colors flex items-center ${
                isActive("/admin/add-event") || isActive("/admin/appointments")
                  ? "border-b-2 border-blue-600 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Evenimente
            </Link>
          </div>
          
          <div className="relative group">
            <Link
              to="/admin/users"
              className={`py-4 px-4 font-medium transition-colors flex items-center ${
                isActive("/admin/users") || isActive("/admin/make-admin")
                  ? "border-b-2 border-blue-600 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Utilizatori
            </Link>
          </div>
        </nav>
        
        {/* Mobile navigation */}
        <div className="md:hidden py-3">
          <select 
            onChange={(e) => window.location.href = e.target.value}
            value={location.pathname}
            className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="/admin">Dashboard</option>
            <optgroup label="Produse">
              <option value="/admin/add-product">Adaugă Produs</option>
              <option value="/admin/categories">Categorii</option>
              <option value="/admin/inventory">Stocuri</option>
            </optgroup>
            <optgroup label="Evenimente">
              <option value="/admin/add-event">Adaugă Eveniment</option>
              <option value="/admin/appointments">Programări</option>
            </optgroup>
            <optgroup label="Utilizatori">
              <option value="/admin/users">Gestionare Utilizatori</option>
              <option value="/admin/make-admin">Permisiuni Admin</option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
