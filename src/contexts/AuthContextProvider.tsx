import React from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestore as db } from "../firebase";
import { useNavigate } from "react-router-dom";
import authService from "../services/AuthService";
import { handleUnknownError } from "../utils/errorTypes";
import logger from "../utils/logger";
import { AuthState, AuthResult } from "../types/AuthContextUtils";
import {
  isUserAdmin,
  isUserSpecialist,
  isUserAccountant,
  MAIN_ADMIN_EMAIL,
} from "../utils/userRoles";
import {
  formatUserData,
  convertFirebaseUser,
} from "../utils/authContextHelpers";
import { AuthContext, AuthContextType } from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isAdmin: false,
    isSpecialist: false,
    isAccountant: false,
    loading: true,
    error: null,
  });

  const auth = getAuth();
  const navigate = useNavigate();
  const authLogger = logger.createLogger("AuthContext");

  React.useEffect(() => {
    authLogger.debug("Setting up auth state listener");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      authLogger.debug("Auth state changed", firebaseUser?.email);
      setAuthState((prev: AuthState) => ({ ...prev, loading: true }));

      try {
        if (firebaseUser) {
          let isUserAdminFlag: boolean = false;
          let isUserSpecialistFlag: boolean = false;
          let isUserAccountantFlag: boolean = false;

          if (firebaseUser.email) {
            // First check hardcoded admin email
            if (firebaseUser.email === MAIN_ADMIN_EMAIL) {
              isUserAdminFlag = true;
              authLogger.debug("Main admin email detected");
            } else {
              // Then check database and all roles
              try {
                const [isAdmin, isSpecialist, isAccountant] = await Promise.all(
                  [
                    isUserAdmin(firebaseUser.email),
                    isUserSpecialist(firebaseUser.email),
                    isUserAccountant(firebaseUser.email),
                  ]
                );

                isUserAdminFlag = isAdmin;
                isUserSpecialistFlag = isSpecialist;
                isUserAccountantFlag = isAccountant;

                // Ensure user document exists
                const userRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                  await setDoc(userRef, formatUserData(firebaseUser));
                }
              } catch (error) {
                authLogger.error("Error checking user roles:", error);
              }
            }
          }

          setAuthState({
            isAuthenticated: true,
            user: firebaseUser,
            isAdmin: isUserAdminFlag,
            isSpecialist: isUserSpecialistFlag,
            isAccountant: isUserAccountantFlag,
            loading: false,
            error: null,
          });

          authLogger.debug("User authenticated, isAdmin:", isUserAdminFlag);
        } else {
          authLogger.debug("User is signed out");
          setAuthState({
            isAuthenticated: false,
            user: null,
            isAdmin: false,
            isSpecialist: false,
            isAccountant: false,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        authLogger.error("Error in onAuthStateChanged:", error);
        const err = handleUnknownError(error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isAdmin: false,
          isSpecialist: false,
          isAccountant: false,
          loading: false,
          error: err.message || "Unknown error",
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      setAuthState((prev: AuthState) => ({
        ...prev,
        loading: true,
        error: null,
      }));
      authLogger.debug("Attempting login with email and password");

      const userCredential = await authService.login(email, password);
      const user = userCredential.user;

      let isAdmin = false;
      if (user.email) {
        const userIsAdmin = await isUserAdmin(user.email);
        isAdmin = userIsAdmin;
      }

      authLogger.info("Email login successful, isAdmin:", isAdmin);

      setAuthState((prev: AuthState) => ({
        ...prev,
        isAuthenticated: true,
        user,
        isAdmin,
        loading: false,
        error: null,
      }));

      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        const afterLoginRedirect = sessionStorage.getItem("afterLoginRedirect");
        if (afterLoginRedirect) {
          authLogger.debug(`Redirect after login to: ${afterLoginRedirect}`);
          navigate(afterLoginRedirect);
          sessionStorage.removeItem("afterLoginRedirect");
        } else {
          navigate("/user-home");
        }
      }

      return { success: true, user, isAdmin };
    } catch (error: unknown) {
      authLogger.error("Login error:", error);

      const err = handleUnknownError(error);
      let errorMessage =
        "A apărut o eroare la autentificare. Vă rugăm încercați din nou.";

      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        errorMessage = "Email sau parolă incorectă";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Prea multe încercări eșuate. Încercați mai târziu.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setAuthState((prev: AuthState) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));

      return { success: false, error: errorMessage };
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      setAuthState((prev: AuthState) => ({
        ...prev,
        loading: true,
        error: null,
      }));
      authLogger.debug("Attempting to register new user");

      const userCredential = await authService.signUp(email, password);
      const user = userCredential.user;

      authLogger.info("Registration successful");

      setAuthState((prev: AuthState) => ({
        ...prev,
        isAuthenticated: true,
        user,
        isAdmin: false,
        loading: false,
        error: null,
      }));

      const afterLoginRedirect = sessionStorage.getItem("afterLoginRedirect");
      if (afterLoginRedirect) {
        authLogger.debug(
          `Redirect after registration to: ${afterLoginRedirect}`
        );
        navigate(afterLoginRedirect);
        sessionStorage.removeItem("afterLoginRedirect");
      } else {
        navigate("/user-home");
      }

      return { success: true, user };
    } catch (error: unknown) {
      authLogger.error("Registration error:", error);

      const err = handleUnknownError(error);
      let errorMessage = "An unknown error occurred";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email-ul este deja utilizat";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Parola este prea slabă";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setAuthState((prev: AuthState) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));

      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (redirectTo?: string): Promise<AuthResult> => {
    const authLogger = logger.createLogger("AuthContext");
    try {
      setAuthState((prev: AuthState) => ({
        ...prev,
        loading: true,
        error: null,
      }));
      authLogger.debug("Starting Google login process via popup");

      const redirectPath = redirectTo || "/dashboard";
      authLogger.debug(
        "Setting redirect path for Google login to:",
        redirectPath
      );

      const result = await authService.loginWithGoogle(redirectPath);

      if (result.success && result.user) {
        authLogger.info("Google login successful");
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          isAdmin: !!result.isAdmin,
          isSpecialist: false, // Will be updated by role verification
          isAccountant: false, // Will be updated by role verification
          loading: false,
          error: null,
        });

        if (result.redirectPath) {
          navigate(result.redirectPath, { replace: true });
        }
      } else {
        throw new Error(
          result.error?.toString() || "Google authentication failed"
        );
      }

      return result;
    } catch (error: unknown) {
      authLogger.error("Error with Google login:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to login with Google";

      setAuthState((prev: AuthState) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    const authLogger = logger.createLogger("AuthContext");
    try {
      authLogger.debug("Logging out user");
      await authService.logout();

      setAuthState({
        isAuthenticated: false,
        user: null,
        isAdmin: false,
        isSpecialist: false,
        isAccountant: false,
        loading: false,
        error: null,
      });

      navigate("/");

      authLogger.info("Logout successful");
    } catch (error) {
      authLogger.error("Logout error:", error);

      const err = handleUnknownError(error);
      setAuthState((prev: AuthState) => ({
        ...prev,
        error: err.message || "Failed to logout",
      }));
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    const authLogger = logger.createLogger("AuthContext");
    try {
      authLogger.debug("Attempting to reset password for:", email);
      await authService.resetPassword(email);
      authLogger.info("Password reset email sent successfully");
      return { success: true };
    } catch (error) {
      authLogger.error("Password reset error:", error);
      const err = handleUnknownError(error);
      return {
        success: false,
        error: err.message || "Failed to reset password",
      };
    }
  };

  const resetAuthError = () => {
    setAuthState((prev: AuthState) => ({ ...prev, error: null }));
  };

  const refreshUserRoles = async () => {
    if (authState.user?.email) {
      try {
        const [isAdmin, isSpecialist, isAccountant] = await Promise.all([
          isUserAdmin(authState.user.email),
          isUserSpecialist(authState.user.email),
          isUserAccountant(authState.user.email),
        ]);

        setAuthState((prev: AuthState) => ({
          ...prev,
          isAdmin,
          isSpecialist,
          isAccountant,
        }));

        authLogger.info("User roles refreshed:", {
          isAdmin,
          isSpecialist,
          isAccountant,
        });
      } catch (error) {
        authLogger.error("Error refreshing user roles:", error);
      }
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    loginWithGoogle,
    logout,
    register,
    resetAuthError,
    resetPassword,
    refreshAdminStatus: refreshUserRoles,
    currentUser: authState.user ? convertFirebaseUser(authState.user) : null,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
