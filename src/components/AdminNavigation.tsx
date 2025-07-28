import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MAIN_ADMIN_EMAIL, isUserAdmin } from "../utils/userRoles";
import "../styles/AdminNavigation.css";

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // State pentru dropdown-uri pe mobil
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Verifică dacă utilizatorul este admin la montarea componentei
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        // Verificare directă pentru email-ul admin principal
        if (user.email === MAIN_ADMIN_EMAIL) {
          setIsAdmin(true);
          return;
        }

        // Verificare prin funcția isUserAdmin
        const adminStatus = await isUserAdmin(user.email);
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          // Redirecționare la pagina principală dacă nu are drepturi admin
          navigate("/", { replace: true });
        }
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  // Verifică dacă ruta curentă este activă
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Verifică dacă ruta curentă face parte dintr-o categorie
  const isCategoryActive = (paths: string[]) => {
    return paths.some((path) => location.pathname.startsWith(path));
  };

  // Toggle dropdown pe mobil
  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Verifică dacă utilizatorul nu este admin și redirecționează
  if (user && !isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Acces restricționat
          </h2>
          <p className="mt-2 mb-4">
            Nu aveți permisiunile necesare pentru a accesa panoul de
            administrare.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 mb-2 sm:mb-4 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between py-2 sm:py-3 lg:py-4 border-b border-gray-100">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">
            <Link to="/admin" className="hover:text-blue-600 transition-colors">
              <span className="hidden sm:inline">Panou Administrativ</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </h1>

          {user && (
            <div className="flex items-center ml-2">
              <span className="text-xs text-gray-500 mr-1 hidden md:inline">
                Autentificat ca:
              </span>
              <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-[200px]">
                {user.email}
              </span>
            </div>
          )}
        </div>

        {/* Navigare desktop - ascunsă pe mobil */}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </Link>
          {/* Secțiunea Produse */}
          <div className="relative group">
            <Link
              to="/admin/inventory"
              className={`py-4 px-4 font-medium transition-colors flex items-center ${
                isCategoryActive([
                  "/admin/add-product",
                  "/admin/categories",
                  "/admin/inventory",
                  "/admin/products",
                ])
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            Programări
          </Link>
          
          {/* Secțiunea Embleme */}
          <div className="relative group">
            <Link
              to="/admin/emblems"
              className={`py-4 px-4 font-medium transition-colors flex items-center ${
                isCategoryActive(["/admin/emblems", "/admin/emblems-marketplace", "/admin/emblems-stats"])
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Embleme NFT
            </Link>
            <div className="hidden group-hover:block absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-100 z-10">
              <div className="py-1">
                <Link
                  to="/admin/emblems"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Gestionare Embleme
                </Link>
                <Link
                  to="/admin/emblems-marketplace"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Marketplace
                </Link>
                <Link
                  to="/admin/emblems-stats"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Statistici
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            Comenzi
          </Link>{" "}
          {/* Secțiunea Articole/Blog */}
          <Link
            to="/admin/articles"
            className={`py-4 px-4 font-medium transition-colors flex items-center ${
              isActive("/admin/articles")
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                clipRule="evenodd"
              />
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
            </svg>
            Articole
          </Link>{" "}
          {/* Secțiunea Informații Utilizatori */}
          <Link
            to="/admin/userinfo"
            className={`py-4 px-4 font-medium transition-colors flex items-center ${
              isActive("/admin/userinfo")
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Info Utilizatori
          </Link>
          {/* Secțiunea Setări */}
          <Link
            to="/admin/settings"
            className={`py-4 px-4 font-medium transition-colors flex items-center ${
              isActive("/admin/settings")
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Setări
          </Link>
          {/* Buton de ieșire din admin către site-ul principal */}
          <Link
            to="/"
            className="py-4 px-4 font-medium transition-colors flex items-center ml-auto text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
                clipRule="evenodd"
              />
            </svg>
            Către site
          </Link>
        </nav>
        {/* Navigare mobilă */}
        <div className="md:hidden py-2">
          <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pb-4 admin-nav-mobile">
            {/* Dashboard buton */}
            <Link
              to="/admin"
              className={`flex items-center justify-between w-full p-3 rounded-lg text-sm admin-nav-button ${
                isActive("/admin")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              } transition-colors duration-200`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </div>
            </Link>
            {/* Produse dropdown */}
            <div className="rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={() => toggleDropdown("products")}
                className={`flex items-center justify-between w-full p-3 text-sm ${
                  isCategoryActive([
                    "/admin/add-product",
                    "/admin/categories",
                    "/admin/inventory",
                    "/admin/products",
                  ])
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Produse</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${activeDropdown === "products" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeDropdown === "products" && (
                <div className="bg-white border-t border-gray-200 divide-y divide-gray-100">
                  <Link
                    to="/admin/add-product"
                    className="block pl-10 pr-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span>Adaugă produs nou</span>
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="block pl-10 pr-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span>Categorii produse</span>
                  </Link>
                  <Link
                    to="/admin/inventory"
                    className="block pl-10 pr-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Gestionare stocuri</span>
                  </Link>
                  <Link
                    to="/admin/products"
                    className="block pl-14 pr-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Toate produsele</span>
                  </Link>
                </div>
              )}
            </div>
            {/* Evenimente dropdown */}
            <div className="rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={() => toggleDropdown("events")}
                className={`flex items-center justify-between w-full p-4 ${
                  isCategoryActive(["/admin/add-event", "/admin/events"])
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium text-base">Evenimente</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${activeDropdown === "events" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeDropdown === "events" && (
                <div className="bg-white border-t border-gray-200 divide-y divide-gray-100">
                  <Link
                    to="/admin/add-event"
                    className="block pl-14 pr-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Adaugă eveniment</span>
                  </Link>
                  <Link
                    to="/admin/events"
                    className="block pl-14 pr-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Toate evenimentele</span>
                  </Link>
                </div>
              )}
            </div>
            {/* Programări */}
            <Link
              to="/admin/appointments"
              className={`flex items-center justify-between w-full p-4 rounded-lg ${
                isActive("/admin/appointments")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              } transition-colors duration-200`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-base">Programări</span>
              </div>
            </Link>
            
            {/* Embleme dropdown */}
            <div className="rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={() => toggleDropdown("emblems")}
                className={`flex items-center justify-between w-full p-4 ${
                  isCategoryActive(["/admin/emblems", "/admin/emblems-stats"])
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium text-base">Embleme NFT</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${activeDropdown === "emblems" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeDropdown === "emblems" && (
                <div className="bg-white border-t border-gray-200 divide-y divide-gray-100">
                  <Link
                    to="/admin/emblems"
                    className="block pl-14 pr-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Gestionare Embleme</span>
                  </Link>
                  <Link
                    to="/admin/emblems-marketplace"
                    className="block pl-14 pr-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Marketplace</span>
                  </Link>
                  <Link
                    to="/admin/emblems-stats"
                    className="block pl-14 pr-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Statistici</span>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Utilizatori dropdown */}
            <div className="rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={() => toggleDropdown("users")}
                className={`flex items-center justify-between w-full p-4 ${
                  isCategoryActive(["/admin/users", "/admin/make-admin"])
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                } transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span className="font-medium text-base">Utilizatori</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${activeDropdown === "users" ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeDropdown === "users" && (
                <div className="bg-white border-t border-gray-200 divide-y divide-gray-100">
                  <Link
                    to="/admin/users"
                    className="block pl-14 pr-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Gestionare utilizatori</span>
                  </Link>
                  <Link
                    to="/admin/make-admin"
                    className="block pl-14 pr-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="text-base">Permisiuni admin</span>
                  </Link>
                </div>
              )}
            </div>
            {/* Comenzi */}
            <Link
              to="/admin/orders"
              className={`flex items-center justify-between w-full p-4 rounded-lg ${
                isActive("/admin/orders")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              } transition-colors duration-200`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-base">Comenzi</span>
              </div>
            </Link>{" "}
            {/* Articole */}
            <Link
              to="/admin/articles"
              className={`flex items-center justify-between w-full p-4 rounded-lg ${
                isActive("/admin/articles")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              } transition-colors duration-200`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                    clipRule="evenodd"
                  />
                  <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                </svg>
                <span className="font-medium text-base">Articole</span>
              </div>
            </Link>{" "}
            {/* Info Utilizatori */}
            <Link
              to="/admin/userinfo"
              className={`flex items-center justify-between w-full p-4 rounded-lg ${
                isActive("/admin/userinfo")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              } transition-colors duration-200`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="font-medium text-base">Info Utilizatori</span>
              </div>
            </Link>
            {/* Setări */}
            <Link
              to="/admin/settings"
              className={`flex items-center justify-between w-full p-4 rounded-lg ${
                isActive("/admin/settings")
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              } transition-colors duration-200`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-base">Setări</span>
              </div>
            </Link>
            {/* Către site principal */}
            <Link
              to="/"
              className="flex items-center justify-between w-full p-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 transition-all duration-200 border border-gray-200"
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-base">Către site</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
