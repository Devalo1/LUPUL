import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import { isUserAdmin, isUserSpecialist, isUserAccountant } from "../utils/userRoles";

const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goToUserHome = async () => {
    if (!user) {
      navigate("/");
      return;
    }

    try {
      // Verificăm rolurile utilizatorului pentru a-l redirecționa la panoul corespunzător
      const isAdmin = await isUserAdmin(user.uid);
      if (isAdmin) {
        navigate("/admin");
        return;
      }

      const isAccountant = await isUserAccountant(user.uid);
      if (isAccountant) {
        navigate("/accounting");
        return;
      }

      const isSpecialist = await isUserSpecialist(user.uid);
      if (isSpecialist) {
        navigate("/specialist");
        return;
      }

      // Dacă nu are un rol specific, îl redirecționăm la pagina de acasă pentru utilizatori
      navigate("/user-home");
    } catch (error) {
      console.error("Eroare la verificarea rolurilor:", error);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acces restricționat</h1>
        
        <p className="text-gray-600 mb-6">
          Ne pare rău, nu aveți permisiunile necesare pentru a accesa această pagină.
          Vă rugăm să contactați administratorul dacă considerați că ar trebui să aveți acces.
        </p>

        <div className="flex flex-col space-y-3">
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Înapoi la pagina anterioară
          </button>

          <button
            onClick={goToUserHome}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Mergi la panoul tău
          </button>
          
          <Link
            to="/"
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            Pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;