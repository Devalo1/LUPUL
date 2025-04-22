import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import logger from "../utils/logger";
import { handleUnknownError } from "../utils/errorTypes";

const Login = () => {
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Vă rugăm să completați toate câmpurile");
            return;
        }
        
        try {
            setError(null);
            setLoading(true);
            logger.info("Încercând autentificarea cu email:", email);
            const result = await login(email, password);
            
            // Verificăm dacă autentificarea a reușit
            if (result.success) {
                logger.info("Autentificare reușită, redirecționare...");
                // Redirecționarea se va face automat prin AuthContext
            } else {
                setError(result.error?.toString() || "Autentificare eșuată. Verificați datele de conectare.");
            }
        } catch (err: unknown) {
            const error = handleUnknownError(err);
            logger.error("Eroare detaliată la autentificare:", error);
            setError("Autentificare eșuată. Verificați datele de conectare.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError(null);
            setLoading(true);
            logger.info("Începe autentificarea cu Google...");
            
            // Setăm explicit calea de redirecționare pentru a fi siguri că este disponibilă
            sessionStorage.setItem("afterLoginRedirect", "/dashboard");
            
            // Folosim loginWithGoogle din useAuth
            const result = await loginWithGoogle("/dashboard");
            
            if (result && result.success) {
                logger.info("Autentificare Google reușită", result);
                
                // Redirecționăm utilizatorul către dashboard sau admin dashboard
                const redirectPath = result.isAdmin ? "/admin/dashboard" : "/dashboard";
                logger.info("Redirecționare către:", redirectPath);
                
                // Forțăm redirecționarea manuală în caz că cea automată nu funcționează
                navigate(redirectPath, { replace: true });
            } else if (result && result.error) {
                if (result && typeof result.error === "object") {
                    throw new Error(String(result.error));
                } else {
                    throw new Error(typeof result.error === "string" ? result.error : "Authentication failed");
                }
            } else if (!result) {
                // În cazul în care nu avem rezultat, redirecționăm manual la dashboard
                logger.info("Nu avem un rezultat specific, se încearcă redirecționarea implicită");
                navigate("/dashboard", { replace: true });
            }
        } catch (err: unknown) {
            const error = handleUnknownError(err);
            logger.error("Eroare la autentificarea cu Google:", error);
            setError(error.message || "Autentificarea cu Google a eșuat. Încercați din nou.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Autentificare
                    </h2>
                </div>
                {error && (
                    <div className="rounded-md bg-red-50 p-4 mt-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Parolă</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Parolă"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                                Ai uitat parola?
                            </Link>
                        </div>
                        <div className="text-sm">
                            <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                                Nu ai cont? Înregistrează-te
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? "Se procesează..." : "Autentificare"}
                        </button>
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
                        
                        <div className="mt-6">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                type="button"
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
