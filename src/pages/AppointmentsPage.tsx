import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecționare către primul pas al procesului de programare
    navigate("/appointments/specialist");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Se încarcă pagina de programări...</p>
      </div>
    </div>
  );
};

export default AppointmentsPage;