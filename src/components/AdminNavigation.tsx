import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserMd, FaUserCog, FaExchangeAlt, FaTools } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth(); // Use useAuth hook instead of useContext
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "roleChangeRequests"),
          where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        setPendingRequests(snapshot.docs.length);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequests();
  }, [user]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isCategoryActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  // Function to check if current path is dashboard path
  const isDashboardActive = () => {
    return location.pathname === "/admin" || location.pathname === "/admin/dashboard";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold flex items-center">
          <Link to="/admin" className="text-gray-900 hover:text-gray-700">
            Panou Administrativ
          </Link>
        </h1>

        {user && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2 hidden md:inline">Autentificat ca:</span>
            <span className="text-sm font-medium">{user.email}</span>

            {/* Mobile menu button */}
            <button 
              onClick={toggleMobileMenu}
              className="ml-4 p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Navigare desktop - ascunsă pe mobil */}
      <nav className="hidden md:flex flex-wrap -mb-px py-2 border-b border-gray-200">
        {/* Dashboard principal */}
        <Link
          to="/admin/dashboard"
          className={`py-4 px-4 font-medium transition-colors flex items-center ${
            isDashboardActive() 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Dashboard
        </Link>

        {/* Secțiunea Produse */}
        <div className="relative group">
          <Link
            to="/admin/inventory"
            className={`py-4 px-4 font-medium transition-colors flex items-center ${
              isCategoryActive(["/admin/add-product", "/admin/categories", "/admin/inventory", "/admin/products"])
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            Produse
          </Link>
          <div className="hidden group-hover:block absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-100 z-10">
            <div className="py-1">
              <Link 
                to="/admin/add-product" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Adaugă produs nou
              </Link>
              <Link 
                to="/admin/categories" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Categorii produse
              </Link>
              <Link 
                to="/admin/inventory" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Gestionare stocuri
              </Link>
              <Link 
                to="/admin/products" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Toate produsele
              </Link>
            </div>
          </div>
        </div>

        {/* Secțiunea Evenimente */}
        <div className="relative group">
          <Link
            to="/admin/events"
            className={`py-4 px-4 font-medium transition-colors flex items-center ${
              isCategoryActive(["/admin/add-event", "/admin/events"])
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Evenimente
          </Link>
          <div className="hidden group-hover:block absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-100 z-10">
            <div className="py-1">
              <Link 
                to="/admin/add-event" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Adaugă eveniment
              </Link>
              <Link 
                to="/admin/events" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Toate evenimentele
              </Link>
            </div>
          </div>
        </div>

        {/* Secțiunea Programări */}
        <Link
          to="/admin/appointments"
          className={`py-4 px-4 font-medium transition-colors flex items-center ${
            isActive("/admin/appointments") 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Programări
        </Link>

        {/* Secțiunea Specialiști - Noul dropdown */}
        <div className="relative group">
          <Link
            to="/admin/specialists"
            className={`py-4 px-4 font-medium transition-colors flex items-center ${
              isCategoryActive(["/admin/specialists", "/admin/specializations", "/admin/services"])
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaUserMd className="mr-1.5" />
            Specialiști
            {pendingRequests > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                {pendingRequests}
              </span>
            )}
          </Link>
          <div className="hidden group-hover:block absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-100 z-10">
            <div className="py-1">
              <Link 
                to="/admin/specialists" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaUserCog className="inline mr-2" />
                Gestiune specialiști
              </Link>
              <Link 
                to="/admin/specializations" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaExchangeAlt className="inline mr-2" />
                <span>Cereri specializare</span>
                {pendingRequests > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                    {pendingRequests}
                  </span>
                )}
              </Link>
              <Link 
                to="/admin/services" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaTools className="inline mr-2" />
                Servicii specializate
              </Link>
            </div>
          </div>
        </div>

        {/* Secțiunea Utilizatori */}
        <div className="relative group">
          <Link
            to="/admin/users"
            className={`py-4 px-4 font-medium transition-colors flex items-center ${
              isCategoryActive(["/admin/users", "/admin/make-admin"])
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Utilizatori
          </Link>
          <div className="hidden group-hover:block absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-100 z-10">
            <div className="py-1">
              <Link 
                to="/admin/users" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Gestionare utilizatori
              </Link>
              <Link 
                to="/admin/make-admin" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Permisiuni admin
              </Link>
            </div>
          </div>
        </div>

        {/* Secțiunea Comenzi */}
        <Link
          to="/admin/orders"
          className={`py-4 px-4 font-medium transition-colors flex items-center ${
            isActive("/admin/orders") 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
          Comenzi
        </Link>
      </nav>

      {/* Mobile menu - visible when toggled */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-b border-gray-200 py-2">
          <Link
            to="/admin/dashboard"
            className={`block py-2 px-4 ${isDashboardActive() ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/admin/inventory"
            className={`block py-2 px-4 ${isActive("/admin/inventory") ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Produse
          </Link>

          <Link
            to="/admin/events"
            className={`block py-2 px-4 ${isActive("/admin/events") ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Evenimente
          </Link>

          <Link
            to="/admin/appointments"
            className={`block py-2 px-4 ${isActive("/admin/appointments") ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Programări
          </Link>

          <Link
            to="/admin/specialists"
            className={`block py-2 px-4 ${isActive("/admin/specialists") ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Specialiști {pendingRequests > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">{pendingRequests}</span>}
          </Link>

          <Link
            to="/admin/users"
            className={`block py-2 px-4 ${isActive("/admin/users") ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Utilizatori
          </Link>

          <Link
            to="/admin/orders"
            className={`block py-2 px-4 ${isActive("/admin/orders") ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Comenzi
          </Link>
        </nav>
      )}
    </>
  );
};

export default AdminNavigation;
