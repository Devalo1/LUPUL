import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts";
import Button from "../components/common/Button";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Introduceti adresa de email");
      return;
    }

    try {
      setMessage(null);
      setError(null);
      setLoading(true);
      await resetPassword(email);
      setMessage("Verificați email-ul pentru instrucțiuni de resetare a parolei");
    } catch (err) {
      console.error("Password reset error:", err);
      setError("A apărut o eroare. Verificați adresa de email și încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Resetare parolă
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Introduceți adresa de email și vă vom trimite un link pentru resetarea parolei
          </p>
        </div>
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">Adresă de email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Adresă de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center"
              disabled={loading}
            >
              {loading ? "Se procesează..." : "Resetare parolă"}
            </Button>
          </div>
          
          <div className="text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Înapoi la autentificare
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
