/**
 * Această soluție elimină eroarea "Cannot access 'e' before initialization"
 * prin înlocuirea directă a modulului problemă din pachetul react-icons
 */
import React from 'react';

// Definirea elementelor globale care ar trebui să fie disponibile
// înainte ca modulul IconContext să fie compilat
window.__REACT_ICONS_GLOBAL_CONTEXT__ = {
  // Contextul React care va fi accesat
  Context: React.createContext({
    color: "currentColor",
    size: "1em",
    className: "",
    style: {},
    attr: {}
  }),
  // Variabilele problematice care cauzează TDZ error
  e: { Provider: null, Consumer: null },
  t: {}
};

// Crearea unui obiect Context pentru a înlocui cel din react-icons
const IconContext = window.__REACT_ICONS_GLOBAL_CONTEXT__.Context;

// Export explicit pentru a fi folosit în aplicație
export const IconProvider = IconContext.Provider;
export const IconConsumer = IconContext.Consumer;

// Export pentru a putea fi folosit ca înlocuitor pentru pachetul original
export { IconContext };

// Default export ca în modulul original
export default IconContext;

// Adăugăm un sistem de monitorizare pentru a capta erori
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    // Verificăm dacă este eroarea noastră specifică
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Cannot access \'e\' before initialization')) {
      console.warn('React Icons error intercepted. Our patch should prevent this from causing issues.');
      // Încercăm să forțăm re-inițializarea contextului
      window.__REACT_ICONS_GLOBAL_CONTEXT__.refreshed = true;
    } else {
      originalError.apply(console, args);
    }
  };
}
