import React, { useState, useEffect } from "react";
import {
  makeUserAdmin,
  makeUserAccountant,
  removeAccountantRole,
  isUserAdmin as _isUserAdmin,
  isUserAccountant,
} from "../utils/userRoles";

const MakeAdmin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [currentUserIsAdmin, _setCurrentUserIsAdmin] = useState<boolean | null>(
    null
  );
  const [actionType, setActionType] = useState<
    "admin" | "accountant" | "remove-accountant"
  >("admin");
  const [userStatus, setUserStatus] = useState<{
    isAdmin: boolean;
    isAccountant: boolean;
  } | null>(null);
  useEffect(() => {
    const checkIfCurrentUserIsAdmin = async () => {
      console.log("Checking admin status");
    };

    checkIfCurrentUserIsAdmin();
  }, []);

  const checkUserStatus = async () => {
    if (!email) return;

    try {
      const [isAdmin, isAccountant] = await Promise.all([
        _isUserAdmin(email),
        isUserAccountant(email),
      ]);

      setUserStatus({ isAdmin, isAccountant });
    } catch (error) {
      console.error("Error checking user status:", error);
      setUserStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setDebugInfo("");

    try {
      let success = false;
      let message = "";

      if (actionType === "admin") {
        setDebugInfo(
          "Începe procesul de acordare a rolului de administrator..."
        );
        success = await makeUserAdmin(email);
        message = success
          ? `Utilizatorul ${email} este acum administrator!`
          : "Nu s-a putut acorda rolul de administrator.";
      } else if (actionType === "accountant") {
        setDebugInfo("Începe procesul de acordare a rolului de contabil...");
        success = await makeUserAccountant(email);
        message = success
          ? `Utilizatorul ${email} este acum contabil!`
          : "Nu s-a putut acorda rolul de contabil.";
      } else if (actionType === "remove-accountant") {
        setDebugInfo("Începe procesul de eliminare a rolului de contabil...");
        success = await removeAccountantRole(email);
        message = success
          ? `Rolul de contabil a fost eliminat pentru ${email}!`
          : "Nu s-a putut elimina rolul de contabil.";
      }

      setResult({ success, message });

      if (success) {
        setDebugInfo("Operația a fost realizată cu succes!");
        // Refresh user status after successful operation
        await checkUserStatus();
      } else {
        setDebugInfo(
          "Funcția a returnat false. Verificați consola pentru detalii."
        );
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Eroare: ${error.message || "Necunoscută"}`,
      });
      setDebugInfo(`Excepție: ${error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestionare Roluri Utilizatori</h1>

      {currentUserIsAdmin !== null && (
        <div
          className={`mb-4 p-3 rounded-md ${currentUserIsAdmin ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
        >
          {currentUserIsAdmin
            ? "Sunteți administrator. Puteți acorda drepturi de administrator altor utilizatori."
            : "Nu aveți drepturi de administrator, dar puteți încerca să acordați acest rol."}
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email-ul utilizatorului
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setUserStatus(null); // Reset status when email changes
              }}
              onBlur={checkUserStatus}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="exemplu@email.com"
            />
          </div>{" "}
          {userStatus && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border">
              <h4 className="font-medium text-gray-700 mb-2">
                Status curent utilizator:
              </h4>
              <div className="space-y-1 text-sm">
                <div
                  className={`flex items-center ${userStatus.isAdmin ? "text-green-600" : "text-gray-500"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${userStatus.isAdmin ? "bg-green-500" : "bg-gray-300"}`}
                  ></span>
                  Administrator: {userStatus.isAdmin ? "Da" : "Nu"}
                </div>
                <div
                  className={`flex items-center ${userStatus.isAccountant ? "text-blue-600" : "text-gray-500"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${userStatus.isAccountant ? "bg-blue-500" : "bg-gray-300"}`}
                  ></span>
                  Contabil: {userStatus.isAccountant ? "Da" : "Nu"}
                </div>
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Acțiune
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="admin"
                  checked={actionType === "admin"}
                  onChange={(e) =>
                    setActionType(
                      e.target.value as
                        | "admin"
                        | "accountant"
                        | "remove-accountant"
                    )
                  }
                  className="mr-2"
                />
                <span>Acordă rol de administrator</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="accountant"
                  checked={actionType === "accountant"}
                  onChange={(e) =>
                    setActionType(
                      e.target.value as
                        | "admin"
                        | "accountant"
                        | "remove-accountant"
                    )
                  }
                  className="mr-2"
                />
                <span>Acordă rol de contabil</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="remove-accountant"
                  checked={actionType === "remove-accountant"}
                  onChange={(e) =>
                    setActionType(
                      e.target.value as
                        | "admin"
                        | "accountant"
                        | "remove-accountant"
                    )
                  }
                  className="mr-2"
                />
                <span>Elimină rol de contabil</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Se procesează..."
              : actionType === "admin"
                ? "Fă utilizatorul administrator"
                : actionType === "accountant"
                  ? "Fă utilizatorul contabil"
                  : "Elimină rolul de contabil"}
          </button>
        </form>

        {result && (
          <div
            className={`mt-4 p-3 rounded-md ${result.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {result.message}
          </div>
        )}

        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs font-mono">
            <p className="font-semibold mb-1">Informații de debugging:</p>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">Instrucțiuni:</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Introdu email-ul utilizatorului pentru care vrei să modifici
              rolurile
            </li>
            <li>
              Verifică statusul curent al utilizatorului (se afișează automat)
            </li>
            <li>
              Selectează acțiunea dorită: acordă rol de administrator, acordă
              rol de contabil, sau elimină rol de contabil
            </li>
            <li>Apasă butonul pentru a aplica modificarea</li>
            <li>Verifică mesajul de confirmare sau eroare</li>
            <li>
              Pentru erori, verifică consola dezvoltatorului (F12) pentru
              detalii
            </li>
          </ol>

          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            <p className="font-medium">Notă:</p>
            <p className="mt-1">Rolurile disponibile:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                <strong>Administrator:</strong> Acces complet la toate
                funcționalitățile platformei
              </li>
              <li>
                <strong>Contabil:</strong> Acces la panoul de contabilitate
                pentru vizualizare și gestionare
              </li>
            </ul>
            <p className="mt-2">Asigură-te că:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Ești conectat la Firebase</li>
              <li>Ai permisiuni de scriere pentru colecțiile relevante</li>
              <li>Email-ul introdus este valid și există în sistem</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeAdmin;
