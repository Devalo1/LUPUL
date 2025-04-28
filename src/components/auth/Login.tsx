import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import GoogleLoginButton from "./GoogleLoginButton"; // Import noul buton

interface LoginProps {
  isRegister?: boolean;
}

const Login: React.FC<LoginProps> = ({ isRegister = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Nu mai importăm loginWithGoogle
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister && password !== confirmPassword) {
      return setError("Parolele nu coincid");
    }
    
    try {
      setError("");
      setLoading(true);
      
      if (isRegister) {
        navigate("/");
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage || "A apărut o eroare la autentificare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? "Creează cont nou" : "Autentifică-te în cont"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegister ? "Ai deja cont?" : "Nu ai cont încă?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isRegister ? "Autentifică-te" : "Înregistrează-te"}
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Adresa de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Parola
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isRegister ? "" : "rounded-b-md"
                } focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Parola"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {isRegister && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirmă parola
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmă parola"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {!isRegister && (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Ai uitat parola?
                </Link>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? "Se procesează..." : isRegister ? "Creează cont" : "Autentificare"}
            </Button>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Sau continuă cu</span>
              </div>
            </div>

            {/* Folosim noul buton de Google care utilizează abordarea cu popup */}
            <GoogleLoginButton />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
