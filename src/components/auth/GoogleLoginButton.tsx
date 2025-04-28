import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthService } from "../../services/GoogleAuthService";
import logger from "../../utils/logger";

// Create component-specific logger
const googleAuthLogger = logger.createLogger("GoogleLoginButton");

/**
 * Buton dedicat pentru autentificarea cu Google
 * Folosește implementarea nouă bazată pe popup
 */
const GoogleLoginButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Setăm explicit calea de redirecționare pentru dashboard
      sessionStorage.setItem("afterLoginRedirect", "/dashboard");
      googleAuthLogger.debug("Inițiere autentificare cu Google...");
      
      const result = await GoogleAuthService.signIn();
      
      if (result.success && result.user) {
        googleAuthLogger.debug("Autentificare Google reușită, redirecționare...");
        
        // Redirecționare diferită pentru admin vs utilizator obișnuit
        const redirectPath = result.isAdmin ? "/admin/dashboard" : "/dashboard";
        
        // Forțăm redirecționarea după o scurtă pauză pentru a permite Firebase să finalizeze procesul
        setTimeout(() => {
          googleAuthLogger.debug("Redirecționare după autentificare către:", redirectPath);
          navigate(redirectPath, { replace: true });
        }, 300);
      } else {
        throw new Error(result.error || "Autentificare Google eșuată");
      }
    } catch (err) {
      googleAuthLogger.error("Eroare la autentificarea cu Google:", err);
      setError("Autentificarea cu Google a eșuat. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        type="button"
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Se procesează...
          </>
        ) : (
          <>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            Autentificare cu Google
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleLoginButton;