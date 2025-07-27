import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts";
import "../styles/AuthPages.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Vă rugăm introduceți adresa de email");
      return;
    }

    // Validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Vă rugăm introduceți o adresă de email validă");
      return;
    }

    try {
      setMessage(null);
      setError(null);
      setLoading(true);

      await resetPassword(email.trim());

      setMessage(
        "✅ Email trimis cu succes! Verificați căsuța poștală și folderul de spam."
      );

      // Clear form after success
      setTimeout(() => {
        setEmail("");
      }, 2000);
    } catch (err: any) {
      console.error("Password reset error:", err);

      // Handle specific Firebase errors
      if (err.message?.includes("user-not-found")) {
        setError("❌ Nu există niciun cont cu această adresă de email");
      } else if (err.message?.includes("invalid-email")) {
        setError("❌ Adresa de email nu este validă");
      } else if (err.message?.includes("too-many-requests")) {
        setError("⚠️ Prea multe încercări. Încercați din nou în câteva minute");
      } else if (err.message?.includes("no-password")) {
        setError(
          "🔗 Acest cont a fost creat cu Google. Vă rugăm să vă autentificați direct cu Google - nu aveți o parolă separată pentru resetat."
        );
      } else {
        setError(
          "❌ A apărut o eroare. Verificați adresa de email și încercați din nou."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse-soft">
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.69.193l-2.799 1.154A3.46 3.46 0 018.5 12.5v0c0-.002 0-.005.002-.007A3.505 3.505 0 0112 9c2.089 0 4.5 1.5 4.5 4.5z"
              />
            </svg>
          </div>
          <h2 className="auth-title">🔐 Recuperare Parolă</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Introduceți adresa de email și vă vom trimite instrucțiuni pentru
            resetarea parolei
          </p>
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm">
                <p className="text-blue-800 font-medium">📌 Notă importantă</p>
                <p className="text-blue-700 mt-1">
                  Dacă v-ați înregistrat cu Google, nu aveți o parolă separată.
                  Vă rugăm să vă autentificați direct cu butonul "Continuă cu
                  Google".
                </p>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 text-green-800 px-4 py-4 rounded-r-lg mb-6 animate-slide-down">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{message}</span>
            </div>
            <div className="mt-2 text-sm text-green-700">
              Verificați și folderul de <strong>spam/junk mail</strong>
            </div>
          </div>
        )}

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

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              htmlFor="email-address"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              📧 Adresa de Email
            </label>
            <div className="relative">
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200"
                placeholder="exemplu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          <div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition-all duration-200 ${
                loading || !email.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 hover:shadow-lg"
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
                  Se trimite...
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
                      d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  🚀 Trimite Link de Resetare
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-3">
            <Link
              to="/login"
              className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Înapoi la autentificare
            </Link>
            <div className="text-sm text-gray-500">
              Nu ai cont?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Înregistrează-te aici
              </Link>
            </div>
          </div>
        </form>

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
              Suport 24/7
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
