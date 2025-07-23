import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { AdminService } from "../../services/adminService";

interface ResultState {
  admin?: { success: boolean; message: string };
}

const AdminTools: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [rezultate, setRezultate] = useState<ResultState>({});
  const { user } = useAuth();

  useEffect(() => {
    // Verificăm automat rolul de admin la încărcarea componentei doar pentru admin principal
    if (user?.email === "dani_popa21@yahoo.ro") {
      console.log("🔍 Verificare automată admin pentru:", user.email);
      verificaAdmin();
    }
  }, [user]);

  const verificaAdmin = async () => {
    setLoading(true);
    try {
      const success = await AdminService.verificaSiCorecteazaAdminPrincipal();
      setRezultate((prev) => ({
        ...prev,
        admin: {
          success,
          message: success
            ? "Rolul de admin a fost verificat și corectat cu succes"
            : "Nu s-a putut verifica/corecta rolul de admin",
        },
      }));
    } catch (error) {
      console.error("Eroare la verificarea admin:", error);
      setRezultate((prev) => ({
        ...prev,
        admin: {
          success: false,
          message: "Eroare la verificarea rolului de admin",
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        🛠️ Instrumente de administrare
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card pentru verificarea admin */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            👤 Verificare Administrator
          </h3>
          <p className="text-blue-700 mb-4">
            Verifică și repară rolul de administrator pentru utilizatorul
            principal
          </p>
          <button
            onClick={verificaAdmin}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              loading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "⏳ Se procesează..." : "🔍 Verifică Admin"}
          </button>

          {rezultate.admin && (
            <div
              className={`mt-4 p-3 rounded-md ${
                rezultate.admin.success
                  ? "bg-green-100 border border-green-300 text-green-800"
                  : "bg-red-100 border border-red-300 text-red-800"
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">
                  {rezultate.admin.success ? "✅" : "❌"}
                </span>
                {rezultate.admin.message}
              </div>
            </div>
          )}
        </div>

        {/* Card pentru debug panel */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
            🔧 Instrumente Avansate
          </h3>
          <p className="text-purple-700 mb-4">
            Acces la panoul de debug pentru probleme complexe și întreținere
            sistem
          </p>
          <a
            href="/admin/debug"
            className="inline-block w-full text-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
          >
            🔍 Acces Debug Panel
          </a>

          <div className="mt-4 text-sm text-purple-600">
            <p>• Verifică statusul rolurilor</p>
            <p>• Repară inconsistențe</p>
            <p>• Analiză detaliată sistem</p>
          </div>
        </div>
      </div>

      {/* Informații suplimentare */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          📋 Instrucțiuni de utilizare:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • <strong>Verificare Admin:</strong> Rulează automat la încărcare
            pentru utilizatorul principal
          </li>
          <li>
            • <strong>Debug Panel:</strong> Folosește pentru probleme complexe
            cu rolurile utilizatorilor
          </li>
          <li>
            • <strong>Status:</strong> Verifică mesajele de confirmare după
            fiecare operație
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminTools;
