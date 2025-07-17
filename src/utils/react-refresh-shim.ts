// React Refresh Shim pentru Edge Browser Compatibility
// Acest fișier previne erorile $RefreshSig$ în Edge

// Definim tipurile pentru React Refresh
declare global {
  interface Window {
    $RefreshReg$?: (type: any, id: string) => void;
    $RefreshSig$?: () => (type: any) => any;
  }

  var $RefreshReg$: ((type: any, id: string) => void) | undefined;
  var $RefreshSig$: (() => (type: any) => any) | undefined;
}

// Verificăm dacă suntem în mediul de dezvoltare
if (typeof window !== "undefined" && import.meta.env.DEV) {
  // Definim funcțiile React Refresh dacă nu există
  if (typeof window.$RefreshReg$ === "undefined") {
    window.$RefreshReg$ = () => {};
  }

  if (typeof window.$RefreshSig$ === "undefined") {
    window.$RefreshSig$ = () => (type: any) => type;
  }

  // Pentru compatibilitate cu Edge, definim și globalThis
  if (typeof globalThis.$RefreshReg$ === "undefined") {
    globalThis.$RefreshReg$ = window.$RefreshReg$;
  }

  if (typeof globalThis.$RefreshSig$ === "undefined") {
    globalThis.$RefreshSig$ = window.$RefreshSig$;
  }
}

export {};
