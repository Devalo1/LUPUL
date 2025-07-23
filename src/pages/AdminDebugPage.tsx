import React, { useState } from "react";
import { debugAdminRoles } from "../utils/debugAdmin";
import adminRoleFixer from "../utils/adminRoleFixer";
import { useAuth } from "../contexts/AuthContext";

const AdminDebugPage: React.FC = () => {
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  // Verifică dacă utilizatorul este admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acces interzis
          </h1>
          <p className="text-gray-700">
            Nu aveți permisiunea de a accesa această pagină de debug.
          </p>
        </div>
      </div>
    );
  }

  const handleCheckStatus = async () => {
    if (!userEmail.trim()) {
      setResult("Te rog introdu un email valid.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.clear();
      await debugAdminRoles.checkAdminStatus(userEmail.trim());
      setResult(
        "Verificarea a fost finalizată. Verifică consola pentru detalii."
      );
    } catch (error) {
      setResult(`Eroare la verificare: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixRole = async () => {
    if (!userEmail.trim()) {
      setResult("Te rog introdu un email valid.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const success = await adminRoleFixer.fixUserAdminRole(userEmail.trim());
      if (success) {
        setResult(`✅ Rolurile de admin au fost reparate pentru ${userEmail}`);
      } else {
        setResult(`❌ Nu s-au putut repara rolurile pentru ${userEmail}`);
      }
    } catch (error) {
      setResult(`Eroare la reparare: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListAllAdmins = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.clear();
      await debugAdminRoles.listAllAdmins();
      await adminRoleFixer.checkAllAdminStatus();
      setResult("Lista administratorilor a fost afișată în consolă.");
    } catch (error) {
      setResult(`Eroare la listare: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixAllRoles = async () => {
    const confirmFix = window.confirm(
      "Ești sigur că vrei să repari toate rolurile de admin din sistem? Această operațiune poate avea efecte majore."
    );

    if (!confirmFix) return;

    setIsLoading(true);
    setResult(null);

    try {
      await adminRoleFixer.fixAllAdminRoles();
      setResult("✅ Toate rolurile de admin au fost reparate.");
    } catch (error) {
      setResult(`Eroare la repararea completă: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔧 Debug Roluri Administrator
          </h1>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Atenție</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Această pagină este destinată debug-ului și reparării
                  problemelor cu rolurile de administrator. Verifică consola
                  dezvoltatorului (F12) pentru informații detaliate.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Secțiune pentru verificarea unui utilizator specific */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">
                Verifică utilizator specific
              </h2>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label
                    htmlFor="userEmail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email utilizator:
                  </label>
                  <input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="exemplu@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCheckStatus}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Se verifică..." : "Verifică Status"}
                  </button>

                  <button
                    onClick={handleFixRole}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Se repară..." : "Repară Rol"}
                  </button>
                </div>
              </div>
            </div>

            {/* Secțiune pentru operațiuni globale */}
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-4">
                Operațiuni globale
              </h2>

              <div className="flex gap-4">
                <button
                  onClick={handleListAllAdmins}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Se încarcă..."
                    : "Listează toți administratorii"}
                </button>

                <button
                  onClick={handleFixAllRoles}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Se repară..." : "Repară toate rolurile"}
                </button>
              </div>
            </div>

            {/* Informații despre utilizatorul curent */}
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Informații utilizator curent
              </h2>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Email:</strong> {user?.email || "N/A"}
                </p>
                <p>
                  <strong>UID:</strong> {user?.uid || "N/A"}
                </p>
                <p>
                  <strong>Este Admin:</strong> {isAdmin ? "✅ Da" : "❌ Nu"}
                </p>
                <p>
                  <strong>Display Name:</strong> {user?.displayName || "N/A"}
                </p>
              </div>
            </div>

            {/* Rezultat */}
            {result && (
              <div
                className={`border rounded-md p-4 ${
                  result.includes("✅")
                    ? "bg-green-50 border-green-200 text-green-800"
                    : result.includes("❌")
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                }`}
              >
                <p className="font-medium">Rezultat:</p>
                <p className="mt-1">{result}</p>
              </div>
            )}
          </div>

          {/* Instrucțiuni */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📋 Instrucțiuni de utilizare
            </h3>

            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>
                Introdu email-ul utilizatorului pentru care vrei să verifici sau
                să repari rolurile
              </li>
              <li>
                Apasă "Verifică Status" pentru a vedea statusul curent în
                consolă
              </li>
              <li>
                Apasă "Repară Rol" pentru a seta utilizatorul ca administrator
              </li>
              <li>
                Folosește "Listează toți administratorii" pentru a vedea toți
                admin-ii din sistem
              </li>
              <li>
                Folosește "Repară toate rolurile" doar în situații extreme când
                sistemul are probleme majore
              </li>
            </ol>

            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Notă:</strong> După repararea rolurilor, utilizatorul
                afectat va trebui să se deconecteze și să se reconecteze pentru
                ca modificările să aibă efect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDebugPage;
