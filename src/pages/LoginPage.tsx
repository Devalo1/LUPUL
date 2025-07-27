import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts";
import logger from "../utils/logger";
import "../styles/AuthPages.css";

// Create component-specific logger
const loginLogger = logger.createLogger("LoginPage");

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Always use dashboard as the default redirection path
  const from = "/dashboard";

  // Debug path state in location
  loginLogger.debug("Login Page - location.state:", location.state);

  // Verifică dacă utilizatorul este deja autentificat
  useEffect(() => {
    if (user) {
      loginLogger.debug(
        "Utilizator deja autentificat, redirecționare către:",
        from
      );

      // Force redirect to dashboard
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("❌ Te rugăm să completezi atât email-ul cât și parola.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("❌ Te rugăm să introduci o adresă de email validă.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      loginLogger.debug("Încercare de autentificare cu:", email);
      sessionStorage.setItem("afterLoginRedirect", from);

      const result = await login(email.trim(), password.trim());

      if (!result || !result.success) {
        throw new Error(result?.error?.toString() || "Autentificare eșuată");
      }

      loginLogger.debug("Autentificare reușită, redirecționare către:", from);
      navigate(from, { replace: true });
    } catch (err) {
      loginLogger.error("Eroare detaliată la autentificare:", err);

      let errorMessage =
        "❌ A apărut o eroare la autentificare. Vă rugăm să încercați din nou.";

      if (typeof err === "object" && err !== null) {
        const error = err as { code?: string; message?: string };
        if (
          error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-credential"
        ) {
          errorMessage =
            "❌ Email sau parolă incorectă. Verificați datele și încercați din nou.";
        } else if (error.code === "auth/user-not-found") {
          errorMessage = "❌ Nu există niciun cont asociat cu acest email.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "❌ Adresa de email nu este validă.";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage =
            "⚠️ Prea multe încercări eșuate. Vă rugăm să încercați mai târziu.";
        } else if (error.message) {
          errorMessage = `❌ ${error.message}`;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      loginLogger.debug(
        "Încercare de autentificare cu Google, redirectPath:",
        from
      );

      sessionStorage.setItem("afterLoginRedirect", from);
      sessionStorage.setItem("googleAuthOriginalPath", from);

      const result = await loginWithGoogle(from);

      if (result && !result.success) {
        throw new Error(result.error?.toString() || "Autentificare eșuată");
      }

      loginLogger.debug(
        "Google login initiated, will redirect after authentication"
      );
    } catch (err) {
      loginLogger.error("Eroare la autentificarea cu Google:", err);
      setError(
        "❌ A apărut o eroare la autentificarea cu Google. Încercați din nou."
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 animate-pulse-soft">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="auth-title">🚀 Bine ai revenit!</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Conectează-te la contul tău pentru a continua experiența
          </p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 text-red-800 px-4 py-4 rounded-r-lg mb-6 animate-shake">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="form-group">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              📧 Adresa de Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="exemplu@email.com"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              🔒 Parola
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Introdu parola ta"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition-all duration-200 ${
                loading || !email.trim() || !password.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 hover:shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Se autentifică...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  🔐 Autentificare
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                sau continuă cu
              </span>
            </div>
          </div>

          {/* Google Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="google-button group"
              disabled={loading}
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
                    fill="#4285F4"
                  ></path>
                </g>
              </svg>
              <span className="group-hover:text-gray-800 transition-colors duration-200">
                🚀 Continuă cu Google
              </span>
            </button>
          </div>
        </form>

        {/* Links */}
        <div className="text-center pt-6 space-y-3">
          <div>
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              🔑 Am uitat parola
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            Nu ai cont?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Înregistrează-te aici
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Securizat SSL
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM4 7h12v8a1 1 0 01-1 1H5a1 1 0 01-1-1V7z"
                  clipRule="evenodd"
                />
              </svg>
              Date Protejate
            </div>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-1 text-purple-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 8A8 8 0 11 2 8a8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 9z"
                  clipRule="evenodd"
                />
              </svg>
              Acces Rapid
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
