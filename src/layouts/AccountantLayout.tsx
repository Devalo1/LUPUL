import React, { useState, useEffect } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts";
import { FaFileInvoiceDollar, FaChartLine, FaLandmark, FaTimes, FaBars, FaHome } from "react-icons/fa";

/**
 * Layout pentru contabili, cu sidebar și navigare specifică pentru contabilitate
 */
const AccountantLayout: React.FC = () => {
  // Use destructuring with underscore prefix for unused variables
  const { user, isLoading, isAccountant } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // No need to check userRoles.accountant as we now have isAccountant directly from auth context

  // Închide sidebar-ul pe dispozitive mobile când se schimbă ruta
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirecționare dacă utilizatorul nu este contabil
  if (!user || !isAccountant) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar pentru mobil cu overlay */}
      <div className={`lg:hidden fixed inset-0 z-40 ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Închide meniul</span>
              <FaTimes className="h-6 w-6 text-white" />
            </button>
          </div>
          {/* Sidebar mobile content */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-white text-xl font-bold">Panou Contabilitate</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              <SidebarLinks />
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar pentru desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-blue-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-white text-xl font-bold">Panou Contabilitate</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <SidebarLinks />
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Deschide meniul</span>
            <FaBars className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Componenta pentru link-urile din sidebar
const SidebarLinks: React.FC = () => {
  const location = useLocation();
  
  // Array cu link-urile din sidebar
  const links = [
    {
      to: "/accountant/panel",
      icon: <FaHome className="mr-3 h-5 w-5" />,
      text: "Dashboard"
    },
    {
      to: "/accountant/invoices",
      icon: <FaFileInvoiceDollar className="mr-3 h-5 w-5" />,
      text: "Facturi"
    },
    {
      to: "/accountant/reports",
      icon: <FaChartLine className="mr-3 h-5 w-5" />,
      text: "Rapoarte"
    },
    {
      to: "/accountant/banking",
      icon: <FaLandmark className="mr-3 h-5 w-5" />,
      text: "Operațiuni bancare"
    }
  ];
  
  return (
    <>
      {links.map((link) => {
        const isCurrent = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`${
              isCurrent
                ? "bg-blue-900 text-white"
                : "text-blue-100 hover:bg-blue-700"
            } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
            aria-current={isCurrent ? "page" : undefined}
          >
            {link.icon}
            {link.text}
          </Link>
        );
      })}
      
      {/* Link către homepage */}
      <Link
        to="/"
        className="mt-8 text-blue-100 hover:bg-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
      >
        <FaHome className="mr-3 h-5 w-5" />
        Înapoi la site
      </Link>
    </>
  );
};

export default AccountantLayout;