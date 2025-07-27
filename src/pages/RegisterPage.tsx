import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts";
import "../styles/AuthPages.css"; // Import the styles used by LoginPage

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User registration page loaded");
  }, [navigate]);

  // Password strength calculator
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 25) return { text: "Foarte Slabă", color: "text-red-600" };
    if (strength < 50) return { text: "Slabă", color: "text-orange-500" };
    if (strength < 75) return { text: "Medie", color: "text-yellow-500" };
    return { text: "Puternică", color: "text-green-600" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validations
    if (!username.trim()) {
      setError("Numele de utilizator este obligatoriu");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Adresa de email este obligatorie");
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError("Trebuie să acceptați termenii și condițiile");
      setLoading(false);
      return;
    }

    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedPassword.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere");
      setLoading(false);
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Parolele nu se potrivesc.");
      setLoading(false);
      return;
    }

    try {
      await register(email.trim(), trimmedPassword);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Handle specific Firebase errors
        if (error.message.includes("email-already-in-use")) {
          setError(
            "❌ Acest email este deja folosit. Încercați să vă autentificați."
          );
        } else if (error.message.includes("weak-password")) {
          setError(
            "❌ Parola este prea slabă. Folosiți cel puțin 6 caractere."
          );
        } else if (error.message.includes("invalid-email")) {
          setError("❌ Adresa de email nu este validă.");
        } else {
          setError(error.message || "A apărut o eroare la înregistrare");
        }
      } else {
        setError("A apărut o eroare la înregistrare");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    console.log("Încercare de autentificare cu Google");

    try {
      await loginWithGoogle();
      console.log("Autentificare Google reușită!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Eroare detaliată la autentificare cu Google:", error);
      setError(
        `Autentificarea cu Google a eșuat: ${error.code || error.message || "Eroare necunoscută"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="auth-title">🎉 Creează-ți Contul</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Alătură-te comunității noastre și începe aventura digitală
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              👤 Nume Utilizator
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Introdu numele tău de utilizator"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Email */}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          {/* Password */}
          <div className="form-group">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              🔒 Parola
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Creează o parolă puternică"
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
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">
                    Puterea parolei:
                  </span>
                  <span
                    className={`text-xs font-semibold ${getPasswordStrengthText(passwordStrength).color}`}
                  >
                    {getPasswordStrengthText(passwordStrength).text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 strength-bar ${
                      passwordStrength < 25
                        ? "bg-red-500"
                        : passwordStrength < 50
                          ? "bg-orange-500"
                          : passwordStrength < 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                    }`}
                    data-width={passwordStrength}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              🔐 Confirmă Parola
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`appearance-none relative block w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } placeholder-gray-500 text-gray-900`}
                placeholder="Repetă parola"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Parolele nu se potrivesc
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Parolele se potrivesc
              </p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 leading-relaxed"
            >
              Sunt de acord cu{" "}
              <Link
                to="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-500 underline transition-colors duration-200 inline-flex items-center"
              >
                Termenii și Condițiile
                <svg
                  className="w-3 h-3 ml-1 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>{" "}
              și{" "}
              <Link
                to="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-500 underline transition-colors duration-200 inline-flex items-center"
              >
                Politica de Confidențialitate
                <svg
                  className="w-3 h-3 ml-1 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={
                loading ||
                !agreedToTerms ||
                password !== confirmPassword ||
                !email.trim() ||
                !username.trim()
              }
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition-all duration-200 ${
                loading ||
                !agreedToTerms ||
                password !== confirmPassword ||
                !email.trim() ||
                !username.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 hover:shadow-lg"
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
                  Se creează contul...
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  🚀 Creează Contul Meu
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
                🔐 Înregistrare cu Google
              </span>
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Ai deja un cont?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Autentifică-te aici
            </Link>
          </p>
        </div>

        {/* Trust indicators */}
        <div className="mt-6">
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
              Cont Gratuit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
