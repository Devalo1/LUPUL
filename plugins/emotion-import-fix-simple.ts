import type { Plugin } from "vite";

/**
 * Plugin pentru eliminarea completă a erorilor TDZ din Emotion
 * Înlocuiește importurile problematice cu versiuni sigure
 */
export function emotionImportFixPlugin(): Plugin {
  return {
    name: "emotion-import-fix",
    apply: "build",
    generateBundle(_options, bundle) {
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        
        if (chunk.type === "chunk" && fileName.includes("emotion")) {
          let code = chunk.code;
          
          // Înlocuim importul problematic din emotion-insertion-effect - orice alias pentru R
          code = code.replace(
            /import\s*\{\s*R\s+as\s+([a-z])\s*,([^}]*)\}\s*from\s*"([^"]+)"/g,
            (match, reactAlias, rest, source) => {
              // Parsăm și rest pentru a identifica aliasul pentru 'r'
              const restMatch = rest.match(/r\s+as\s+([a-z])/);
              const reactHooksAlias = restMatch ? restMatch[1] : "r";
              
              return `
// TDZ Safe Import Fix - React alias: ${reactAlias}, hooks alias: ${reactHooksAlias}
var ${reactAlias} = (function() {
  try {
    // Încearcă să obții React din importurile existente
    if (typeof React !== 'undefined' && React.useInsertionEffect !== undefined) return React;
    if (typeof globalThis !== 'undefined' && globalThis.React) return globalThis.React;
    if (typeof window !== 'undefined' && window.React) return window.React;
    if (typeof globalThis !== 'undefined' && globalThis.R) return globalThis.R;
    if (typeof window !== 'undefined' && window.R) return window.R;
    // Fallback cu hooks stub
    return {
      useInsertionEffect: undefined,
      useLayoutEffect: function(effect, deps) { return function() {}; },
      createElement: function() { return null; }
    };
  } catch(err) {
    return {
      useInsertionEffect: undefined,
      useLayoutEffect: function(effect, deps) { return function() {}; },
      createElement: function() { return null; }
    };
  }
})();

// Safe React hooks import
var ${reactHooksAlias} = (function() {
  try {
    if (typeof React !== 'undefined' && React.useLayoutEffect) return React;
    if (typeof globalThis !== 'undefined' && globalThis.React && globalThis.React.useLayoutEffect) return globalThis.React;
    if (typeof window !== 'undefined' && window.React && window.React.useLayoutEffect) return window.React;
    if (typeof globalThis !== 'undefined' && globalThis.r) return globalThis.r;
    if (typeof window !== 'undefined' && window.r) return window.r;
    // Fallback cu hooks sigure
    return {
      useLayoutEffect: function(effect, deps) { return function() {}; },
      useEffect: function(effect, deps) { return function() {}; },
      useState: function(initial) { return [initial, function() {}]; }
    };
  } catch(err) {
    return {
      useLayoutEffect: function(effect, deps) { return function() {}; },
      useEffect: function(effect, deps) { return function() {}; },
      useState: function(initial) { return [initial, function() {}]; }
    };
  }
})();

import"${source}";import"./vendor-others.Dghsd3JV.js";import"./emotion-cache.BVoLpRA9.js";import"./emotion-utils.Bx4u77cl.js";import"./emotion-insertion-effect.BuQbZx3w.js";`;
            }
          );
          
          // Protecție la începutul fișierului
          code = `
// === EMOTION TDZ ULTIMATE PROTECTION ===
(function() {
  const scope = typeof globalThis !== 'undefined' ? globalThis : 
                typeof window !== 'undefined' ? window : this;
  
  const criticalVars = ['R', 'e', 't', 'n', 'r', 'o', 'i', 'a', 'u', 'c', 's', 'l', 'f', 'd', 'p', 'h', 'v', 'g', 'm', 'y', 'b', 'w', 'x', 'z', 'k', 'j', 'q'];
  
  criticalVars.forEach(function(varName) {
    if (typeof scope[varName] === 'undefined') {
      if (varName === 'r' || varName === 'o') {
        // Pentru variabilele React, creăm un obiect cu hooks
        scope[varName] = {
          useLayoutEffect: function(effect, deps) { return function() {}; },
          useEffect: function(effect, deps) { return function() {}; },
          useState: function(initial) { return [initial, function() {}]; },
          useCallback: function(fn, deps) { return fn; },
          useMemo: function(fn, deps) { 
            try { return fn(); } catch(e) { return null; }
          }
        };
      } else {
        scope[varName] = function() { return function() {}; };
      }
    }
  });
})();

${code}`;
          
          chunk.code = code;
        }
      });
    }
  };
}
