import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { MAIN_ADMIN_EMAIL } from "../utils/userRoles";
import AdminService from "../services/adminService";

const AdminPanel: React.FC = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        return;
      }
      
      try {
        if (user.email === MAIN_ADMIN_EMAIL) {
          setIsAdmin(true);
          await AdminService.verificaSiCorecteazaAdminPrincipal();
        } else {
          const isUserAdmin = await AdminService.verificaRolAdmin(user.email || "");
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error("Eroare la verificarea statutului de admin:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);
  
  useEffect(() => {
    if (!loading && !checkingAdmin && !isAdmin && !user) {
      navigate("/login", { state: { from: "/admin" } });
    }
  }, [isAdmin, loading, checkingAdmin, user, navigate]);
  
  if (loading || checkingAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading">Se încarcă...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h2 className="text-lg font-semibold mb-2">Acces restricționat</h2>
          <p>Nu aveți permisiunea de a accesa această pagină.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-page min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Panou de administrare</h1>
            <div className="text-sm text-gray-600">
              Utilizator: <span className="font-medium">{user?.displayName || user?.email}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-blue-800 mb-2">Produse</h3>
              <p className="text-sm mb-4">Gestionează produsele, categoriile și stocurile.</p>
              <div className="flex flex-col space-y-2">
                <a href="/admin/add-product" className="text-blue-600 hover:underline text-sm">➕ Adaugă produs nou</a>
                <a href="/admin/categories" className="text-blue-600 hover:underline text-sm">🏷️ Gestionează categorii</a>
                <a href="/admin/inventory" className="text-blue-600 hover:underline text-sm">📦 Gestionează stocuri</a>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-green-800 mb-2">Evenimente</h3>
              <p className="text-sm mb-4">Gestionează evenimentele și programările.</p>
              <div className="flex flex-col space-y-2">
                <a href="/admin/add-event" className="text-green-600 hover:underline text-sm">➕ Adaugă eveniment nou</a>
                <a href="/admin/events" className="text-green-600 hover:underline text-sm">📊 Toate evenimentele</a>
                <a href="/admin/appointments" className="text-green-600 hover:underline text-sm">📅 Gestionează programări</a>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-purple-800 mb-2">Utilizatori</h3>
              <p className="text-sm mb-4">Gestionează conturile utilizatorilor.</p>
              <div className="flex flex-col space-y-2">
                <a href="/admin/users" className="text-purple-600 hover:underline text-sm">👥 Gestionează utilizatori</a>
                <a href="/admin/make-admin" className="text-purple-600 hover:underline text-sm">🔑 Permisiuni admin</a>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-yellow-800 mb-2">Conținut</h3>
              <p className="text-sm mb-4">Gestionează articolele și conținutul site-ului.</p>
              <div className="flex flex-col space-y-2">
                <a href="/admin/articles" className="text-yellow-600 hover:underline text-sm">📝 Gestionează articole</a>
                <a href="/admin/articles/add" className="text-yellow-600 hover:underline text-sm">➕ Adaugă articol nou</a>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-red-800 mb-2">Comenzi</h3>
              <p className="text-sm mb-4">Gestionează comenzile și facturile.</p>
              <div className="flex flex-col space-y-2">
                <a href="/admin/orders" className="text-red-600 hover:underline text-sm">🛒 Toate comenzile</a>
                <a href="/admin/invoices" className="text-red-600 hover:underline text-sm">📃 Facturi</a>
              </div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-indigo-800 mb-2">Setări</h3>
              <p className="text-sm mb-4">Configurează setările aplicației.</p>
              <div className="flex flex-col space-y-2">
                <a href="/admin/settings" className="text-indigo-600 hover:underline text-sm">⚙️ Setări generale</a>
                <a href="/admin/settings/payment" className="text-indigo-600 hover:underline text-sm">💳 Setări plăți</a>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Produse</h4>
              <p className="text-2xl font-bold text-gray-800">126</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Comenzi</h4>
              <p className="text-2xl font-bold text-gray-800">43</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Utilizatori</h4>
              <p className="text-2xl font-bold text-gray-800">891</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Evenimente</h4>
              <p className="text-2xl font-bold text-gray-800">15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
