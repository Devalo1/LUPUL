import React from "react";
import { getAuth, onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestore as db } from "../firebase";
import { useNavigate } from "react-router-dom";
import authService from "../services/AuthService";
import { handleUnknownError } from "../utils/errorTypes";
import logger from "../utils/logger";
import { AuthState, AuthResult } from "../types/AuthContextUtils";
import { UserRole, getRoleFromUser, refreshAuthToken } from "../utils/userRoles";
import { formatUserData, convertFirebaseUser } from "../utils/authContextHelpers";
import { AuthContext, AuthContextType } from "./AuthContext";
import TokenBlocker from "../firebase/tokenBlocker";
import { ProfilePhotoService } from "../services/ProfilePhotoService";
import { User } from "../types/user";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Define UserData interface with role property
interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
  lastLogin: Date;
  isAdmin: boolean;
  role?: string;
  // ...other properties...
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isAdmin: false,
    isSpecialist: false,
    userRole: null,
    loading: true,
    error: null,
  });

  const [profilePhotoTimestamp, setProfilePhotoTimestamp] = React.useState<number>(Date.now());

  const auth = getAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const authLogger = logger.createLogger("AuthContext");
    authLogger.debug("Setting up auth state listener");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      authLogger.debug("Auth state changed", firebaseUser?.email);
      setAuthState((prev: AuthState) => ({ ...prev, loading: true }));

      try {
        if (firebaseUser) {
          const _tokenResult = await getIdTokenResult(firebaseUser);

          // Type userRole explicitly
          let userRole: string | null = null;
          userRole = await getRoleFromUser(firebaseUser);
          const isUserAdminFlag = userRole === UserRole.ADMIN;
          const isSpecialistFlag = userRole === UserRole.SPECIALIST;

          const roleAsString = userRole
            ? userRole === UserRole.ADMIN
              ? "admin"
              : userRole === UserRole.SPECIALIST
              ? "specialist"
              : "user"
            : "user";

          authLogger.debug(`User role determined: ${roleAsString} (enum value: ${userRole})`);

          try {
            const userRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
              const userData: UserData = { 
                uid: firebaseUser.uid,
                ...formatUserData(firebaseUser),
                role: roleAsString,
              };
              await setDoc(userRef, userData);
              authLogger.debug("Created new user document");
            }
          } catch (error) {
            authLogger.error("Error managing user document:", error);
          }

          setAuthState({
            isAuthenticated: true,
            user: firebaseUser,
            isAdmin: isUserAdminFlag,
            isSpecialist: isSpecialistFlag,
            userRole: roleAsString,
            loading: false,
            error: null,
          });

          authLogger.debug(`User authenticated, isAdmin: ${isUserAdminFlag}, isSpecialist: ${isSpecialistFlag}, role: ${roleAsString}`);
        } else {
          authLogger.debug("User is signed out");
          setAuthState({
            isAuthenticated: false,
            user: null,
            isAdmin: false,
            isSpecialist: false,
            userRole: null,
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
          userRole: null,
          loading: false,
          error: err.message || "Unknown error",
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const authLogger = logger.createLogger("AuthContext");
    try {
      setAuthState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
      authLogger.debug("Attempting login with email and password");

      const userCredential = await authService.login(email, password);
      const user = userCredential.user;

      let userRole: string | null = null;
      if (user.email) {
        userRole = await getRoleFromUser(user);
      }

      const isAdmin = userRole === UserRole.ADMIN;
      const isSpecialist = userRole === UserRole.SPECIALIST;

      authLogger.info("Email login successful, role:", userRole);

      setAuthState((prev: AuthState) => ({
        ...prev,
        isAuthenticated: true,
        user,
        isAdmin,
        isSpecialist,
        userRole,
        loading: false,
        error: null,
      }));

      if (isAdmin) {
        navigate("/admin/dashboard");
      } else if (isSpecialist) {
        navigate("/specialist/dashboard");
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
      let errorMessage = "A apărut o eroare la autentificare. Vă rugăm încercați din nou.";

      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
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

  const register = async (email: string, password: string): Promise<AuthResult> => {
    const authLogger = logger.createLogger("AuthContext");
    try {
      setAuthState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
      authLogger.debug("Attempting to register new user");

      const userCredential = await authService.signUp(email, password);
      const user = userCredential.user;

      authLogger.info("Registration successful");

      setAuthState((prev: AuthState) => ({
        ...prev,
        isAuthenticated: true,
        user,
        isAdmin: false,
        isSpecialist: false,
        userRole: UserRole.USER,
        loading: false,
        error: null,
      }));

      const afterLoginRedirect = sessionStorage.getItem("afterLoginRedirect");
      if (afterLoginRedirect) {
        authLogger.debug(`Redirect after registration to: ${afterLoginRedirect}`);
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
      setAuthState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
      authLogger.debug("Starting Google login process via popup");

      const redirectPath = redirectTo || "/dashboard";
      authLogger.debug("Setting redirect path for Google login to:", redirectPath);

      const result = await authService.loginWithGoogle(redirectPath);

      if (result.success && result.user) {
        const userRole = await getRoleFromUser(result.user);
        const isAdmin = userRole === UserRole.ADMIN;
        const isSpecialist = userRole === UserRole.SPECIALIST;

        authLogger.info("Google login successful");
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          isAdmin,
          isSpecialist,
          userRole,
          loading: false,
          error: null,
        });

        if (result.redirectPath) {
          navigate(result.redirectPath, { replace: true });
        }
      } else {
        throw new Error(result.error?.toString() || "Google authentication failed");
      }

      return result;
    } catch (error: unknown) {
      authLogger.error("Error with Google login:", error);

      const errorMessage = error instanceof Error ? error.message : "Failed to login with Google";

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
        userRole: null,
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
      return { success: false, error: err.message || "Failed to reset password" };
    }
  };

  const resetAuthError = () => {
    setAuthState((prev: AuthState) => ({ ...prev, error: null }));
  };

  const refreshUserData = React.useCallback(async (): Promise<void> => {
    if (TokenBlocker.isBlocked()) {
      console.warn("RefreshUserData ignorat - blocarea token-urilor este activă");
      return;
    }

    if (!auth.currentUser) return;

    try {
      // Fix refreshAuthToken call - if it doesn't expect arguments, remove them
      await refreshAuthToken();

      setAuthState((prev: AuthState) => ({
        ...prev,
        user: auth.currentUser,
        loading: false,
      }));
    } catch (error) {
      console.error("Eroare la reîmprospătarea datelor utilizatorului:", error);
    }
  }, [auth]);

  const refreshUserPhoto = React.useCallback(async (): Promise<void> => {
    const authLogger = logger.createLogger("AuthContext");

    if (!auth.currentUser?.uid) {
      authLogger.debug("Nu se poate reîmprospăta fotografia - utilizatorul nu este autentificat");
      return;
    }

    try {
      authLogger.debug("Reîmprospătare fotografie de profil pentru:", auth.currentUser.uid);

      await ProfilePhotoService.refreshImageCache(auth.currentUser.uid);

      setProfilePhotoTimestamp(Date.now());

      setAuthState((prev: AuthState) => ({
        ...prev,
        user: auth.currentUser,
      }));

      authLogger.debug("Fotografia de profil a fost reîmprospătată cu succes");
    } catch (error) {
      authLogger.error("Eroare la reîmprospătarea fotografiei de profil:", error);
    }
  }, [auth]);

  const getProfilePhotoURL = React.useCallback((): string | null => {
    if (!auth.currentUser?.uid) return null;

    const cachedURL = ProfilePhotoService.imageCache?.[auth.currentUser.uid];
    if (cachedURL) return cachedURL;

    if (auth.currentUser.photoURL) {
      const photoURLWithAntiCache = `${auth.currentUser.photoURL}${
        auth.currentUser.photoURL.includes("?") ? "&" : "?"
      }t=${profilePhotoTimestamp}`;

      return photoURLWithAntiCache;
    }

    return null;
  }, [auth, profilePhotoTimestamp]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    loginWithGoogle,
    logout,
    register,
    resetAuthError,
    resetPassword,
    refreshUserData,
    currentUser: authState.user ? (convertFirebaseUser(authState.user) as User) : null,
    refreshUserPhoto,
    getProfilePhotoURL,
    profilePhotoTimestamp,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};