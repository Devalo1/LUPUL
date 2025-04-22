import React, { useState, useEffect } from "react";
import { makeUserAdmin, isUserAdmin as _isUserAdmin } from "../utils/userRoles";

const MakeAdmin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [currentUserIsAdmin, _setCurrentUserIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIfCurrentUserIsAdmin = async () => {
      console.log("Checking admin status");
    };
    
    checkIfCurrentUserIsAdmin();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setDebugInfo("");
    
    try {
      setDebugInfo("Începe procesul de acordare a rolului de administrator...");
      const success = await makeUserAdmin(email);
      
      if (success) {
        setResult({
          success: true,
          message: `Utilizatorul ${email} este acum administrator!`
        });
        setDebugInfo("Rolul de administrator a fost acordat cu succes!");
      } else {
        setResult({
          success: false,
          message: "Nu s-a putut acorda rolul de administrator."
        });
        setDebugInfo("Funcția a returnat false. Verificați consola pentru detalii.");
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Eroare: ${error.message || "Necunoscută"}`
      });
      setDebugInfo(`Excepție: ${error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Creare Cont Administrator</h1>
      
      {currentUserIsAdmin !== null && (
        <div className={`mb-4 p-3 rounded-md ${currentUserIsAdmin ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {currentUserIsAdmin 
            ? "Sunteți administrator. Puteți acorda drepturi de administrator altor utilizatori." 
            : "Nu aveți drepturi de administrator, dar puteți încerca să acordați acest rol."}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email-ul utilizatorului
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="exemplu@email.com"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Se procesează..." : "Fă utilizatorul administrator"}
          </button>
        </form>
        
        {result && (
          <div className={`mt-4 p-3 rounded-md ${result.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
            <li>Introdu email-ul utilizatorului care trebuie să devină administrator</li>
            <li>Apasă butonul pentru a încerca acordarea rolului</li>
            <li>Verifică mesajul de confirmare sau eroare</li>
            <li>Pentru erori, verifică consola dezvoltatorului (F12) pentru detalii</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            <p className="font-medium">Notă:</p>
            <p className="mt-1">Dacă întâmpini probleme, asigură-te că:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Ești conectat la Firebase</li>
              <li>Ai permisiuni de scriere pentru colecția 'admins'</li>
              <li>Email-ul introdus este valid</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeAdmin;
