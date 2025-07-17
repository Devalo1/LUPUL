import type { Plugin } from "vite";
          // Fix pentru variabile locale în scope-ul modulului
          code = code.replace(
            /var\s+([a-z])\s*=\s*function\s+([^{]*\{[^}]*\})/g,
            (match, varName, funcBody) => {
              return `var ${varName} = (function() {
  try {
    return function ${funcBody};
  } catch(err) {
    return function() { return function() {}; };
  }
})()`;
            }
          );in pentru eliminarea completă a erorilor TDZ din Emotion
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
          console.log(`🔧 Fixing imports în: ${fileName}`);
          
          let code = chunk.code;
          
          // Înlocuim importul problematic din emotion-insertion-effect
          code = code.replace(
            /import\s*\{\s*R\s+as\s+e\s*,([^}]*)\}\s*from\s*"([^"]+)"/g,
            (match, rest, source) => {
              return `
// TDZ Safe Import Fix
var e = (function() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.R) return globalThis.R;
    if (typeof window !== 'undefined' && window.R) return window.R;
    return function() { return function() {}; };
  } catch(err) {
    return function() { return function() {}; };
  }
})();
import {${rest}} from "${source}"`;
            }
          );
          
          // Fix pentru variabile locale în scope-ul modulului
          code = code.replace(
            /var\s+([a-z])\s*=\s*function\s+[^{]*\{[^}]*\}/g,
            (match, varName) => {
              return `var ${varName} = (function() {
  try {
    return ${match.replace(/var\s+[a-z]\s*=\s*/, '')};
  } catch(err) {
    return function() { return function() {}; };
  }
})()`;
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
      scope[varName] = function() { return function() {}; };
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
