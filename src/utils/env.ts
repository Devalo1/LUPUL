// Utility to detect development environment reliably across Vite, Node and browser
export const isDev: boolean = (() => {
  try {
    // Vite exposes import.meta.env.MODE - try reading it directly inside try/catch
    try {
      const mode = (import.meta as any)?.env?.MODE;
      if (mode === "development") return true;
    } catch (e) {
      // import.meta may not be supported in some environments/builders
    }
  } catch (e) {
    // ignore
  }

  try {
    if (typeof process !== "undefined" && (process as any).env?.NODE_ENV === "development") return true;
  } catch (e) {}

  // Browser fallback: localhost is usually dev
  try {
    if (typeof window !== "undefined") {
      const host = window.location.hostname || "";
      if (host.includes("localhost") || host === "127.0.0.1") return true;
    }
  } catch (e) {}

  return false;
})();

export default isDev;
