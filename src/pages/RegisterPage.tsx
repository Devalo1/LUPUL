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

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User registration page loaded");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Parolele nu se potrivesc.");
      setLoading(false);
      return;
    }

    try {
      // The register function only accepts email and password (not username)
      await register(email, trimmedPassword);
      // You can handle username storage separately as needed
      // For example, you might update the user profile after registration
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "A apărut o eroare la înregistrare");
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
      setError(`Autentificarea cu Google a eșuat: ${error.code || error.message || "Eroare necunoscută"}`);
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Creează un cont</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ai deja un cont?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Autentifică-te
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Nume utilizator</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClassName} rounded-t-md`}
                placeholder="Nume utilizator"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="Adresa de email"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Parola</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
                placeholder="Parola"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">Confirmă Parola</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputClassName} rounded-b-md`}
                placeholder="Confirmă Parola"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? "Se încarcă..." : "Creează cont"}
            </button>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Sau</span>
              </div>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={handleGoogleLogin}
                className="google-button"
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" fill="#4285F4"></path>
                  </g>
                </svg>
                <span>Autentificare cu Google</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
