// Import compat pentru a evita problemele de export
import { auth } from "../firebase";

// Funcție compatibilă cu orice versiune Firebase
export async function isGoogleAccount(email: string): Promise<boolean> {
  if (typeof (auth as any).fetchSignInMethodsForEmail === "function") {
    const methods = await (auth as any).fetchSignInMethodsForEmail(email);
    return methods.includes("google.com");
  }
  // Fallback pentru versiuni vechi
  // @ts-ignore
  if (
    typeof window !== "undefined" &&
    (window as any).firebase &&
    (window as any).firebase.auth
  ) {
    const methods = await (window as any).firebase
      .auth()
      .fetchSignInMethodsForEmail(email);
    return methods.includes("google.com");
  }
  throw new Error(
    "fetchSignInMethodsForEmail nu este disponibil pe instanța auth. Actualizează pachetul firebase."
  );
}
