import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

const UserHome: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/'); // Redirect guests to the main page
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-700 to-blue-600 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo */}
          <div
            className="cursor-pointer flex items-center"
            onClick={() => navigate(currentUser ? '/user-home' : '/')}
          >
            <img
              src="/images/LC.png" // Ensure this path is correct
              alt="Lupul și Corbul"
              className="h-12 w-auto mr-2" // Updated height for consistency
            />
            <h1 className="text-xl font-bold">Lupul și Corbul</h1>
          </div>

          {/* Navigation Links */}
          <ul className="flex space-x-6">
            <li>
              <Link
                to={currentUser ? '/user-home' : '/'}
                className="px-3 py-2 rounded-md bg-blue-800 hover:bg-blue-900 transition-colors text-white font-medium"
              >
                Acasă
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="px-3 py-2 rounded-md bg-blue-800 hover:bg-blue-900 transition-colors text-white font-medium"
              >
                Produse
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-md bg-blue-800 hover:bg-blue-900 transition-colors text-white font-medium"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Dashboard */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-yellow-400">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaShoppingCart className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Bun venit, {currentUser.displayName || currentUser.email || 'Utilizator'}!
              </h2>
              <p className="text-gray-600">
                Membru din {new Date(currentUser.metadata?.creationTime || Date.now()).toLocaleDateString('ro-RO')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;