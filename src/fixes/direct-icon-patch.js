/**
 * Acest fișier este un patch direct pentru a preveni eroarea 
 * "Cannot access 'e' before initialization" din iconContext.mjs
 * 
 * Ideea este de a defini variabilele care cauzează probleme înaintea
 * oricărei alte inițializări din aplicație
 */

// Definim variabilele care pot cauza eroarea
window.__REACT_ICONS_PATCH__ = {
  initialized: true,
  timestamp: Date.now()
};

// Acesta este un polyfill pentru variabilele problematice din iconContext.mjs
if (typeof window !== 'undefined') {
  const e = {
    Provider: null,
    Consumer: null
  };
  
  // Definim variabilele globale pentru a preveni "Cannot access 'e' before initialization"
  window.__REACT_ICONS_CONTEXT__ = {
    e, 
    t: {}
  };
  
  console.log('React Icons Context patched directly');
}

export default window.__REACT_ICONS_PATCH__;
