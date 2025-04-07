import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="flex -mb-px">
        <Link
          to="/admin"
          className={`py-4 px-6 font-medium ${isActive('/admin') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Produse
        </Link>
        <Link
          to="/admin-panel"
          className={`py-4 px-6 font-medium ${isActive('/admin-panel') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Scrisori și Evenimente
        </Link>
        <Link
          to="/admin/orders"
          className={`py-4 px-6 font-medium ${isActive('/admin/orders') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Comenzi
        </Link>
        <Link
          to="/admin/users"
          className={`py-4 px-6 font-medium ${isActive('/admin/users') ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Utilizatori
        </Link>
      </nav>
    </div>
  );
};

export default AdminNavigation;
