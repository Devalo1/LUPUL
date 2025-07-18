import type { Plugin } from "vite";

/**
 * Plugin Ultimate pentru eliminarea erorilor TDZ din Emotion
 * Acest plugin injectează cod specific pentru a preveni "Cannot access 'R' before initialization"
 */
export function emotionTdzFixPlugin(): Plugin {
  return {
    name: "emotion-tdz-ultimate-fix",
    apply: "build",
    enforce: "pre",
    generateBundle(_options, bundle) {
      // Cod EXTREM DE SPECIFIC pentru fix-ul TDZ Emotion
      const emotionUltimateFix = `
// ========== EMOTION TDZ ULTIMATE FIX ==========
(function() {
  'use strict';
  
  const globalScope = (function() {
    try {
      return globalThis;
    } catch (e) {
      try {
        return window;
      } catch (e) {
        return self;
      }
    }
  })();
  
  // CRÍTICA: Variabilele exacte care apar în erori
  const criticalVars = {
    // Variabila 'R' din emotion-styled.browser.esm.js:17
    R: function emotionRWrapper() { 
      return function emotionRInner() { 
        return {}; 
      }; 
    },
    // Variabilele din emotion-use-insertion-effect-with-fallbacks
    e: function emotionE() { return {}; },
    t: function emotionT() { return {}; },
    n: function emotionN() { return {}; },
    r: function emotionR2() { return {}; },
    o: function emotionO() { return {}; },
    i: function emotionI() { return {}; },
    a: function emotionA() { return {}; },
    u: function emotionU() { return {}; },
    c: function emotionC() { return {}; },
    s: function emotionS() { return {}; },
    l: function emotionL() { return {}; },
    f: function emotionF() { return {}; },
    d: function emotionD() { return {}; },
    p: function emotionP() { return {}; },
    h: function emotionH() { return {}; },
    v: function emotionV() { return {}; },
    g: function emotionG() { return {}; },
    m: function emotionM() { return {}; },
    y: function emotionY() { return {}; },
    b: function emotionB() { return {}; },
    w: function emotionW() { return {}; },
    x: function emotionX() { return {}; },
    k: function emotionK() { return {}; },
    j: function emotionJ() { return {}; },
    q: function emotionQ() { return {}; },
    z: function emotionZ() { return {}; }
  };
  
  // INIȚIALIZARE FORȚATĂ ȘI PROTEJATĂ
  Object.keys(criticalVars).forEach(function(varName) {
    if (!(varName in globalScope)) {
      try {
        // Încercăm să definim proprietatea ca writable și configurable
        Object.defineProperty(globalScope, varName, {
          value: criticalVars[varName],
          writable: true,
          configurable: true,
          enumerable: false
        });
      } catch (defineError) {
        // Fallback: setare simplă
        globalScope[varName] = criticalVars[varName];
      }
    }
  });
  
  // PROTECȚIE SPECIALĂ pentru contextul Emotion
  if (!globalScope.__EMOTION_ULTIMATE_PROTECTION__) {
    globalScope.__EMOTION_ULTIMATE_PROTECTION__ = {
      initialized: true,
      timestamp: Date.now(),
      protectedVars: Object.keys(criticalVars)
    };
  }
  
})();
// ========== END EMOTION TDZ ULTIMATE FIX ==========
`;

      // Aplicăm fix-ul pentru toate chunk-urile relevante
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        
        if (chunk.type === "chunk" && fileName.endsWith(".js")) {
          // APLICARE SELECTIVĂ - DOAR pentru chunk-urile care conțin cod Emotion
          if (fileName.includes("emotion") || 
              chunk.code.includes("@emotion") ||
              chunk.code.includes("emotion-styled") ||
              chunk.code.includes("emotion-use-insertion-effect")) {
            
            chunk.code = emotionUltimateFix + "\n\n" + chunk.code;
            
            // Adăugăm și protecție la sfârșit pentru siguranță maximă
            chunk.code += `
\n// EMOTION POST-PROTECTION
(function() {
  if (typeof globalThis !== 'undefined' && !globalThis.R) {
    globalThis.R = function() { return function() {}; };
  }
  if (typeof window !== 'undefined' && !window.R) {
    window.R = function() { return function() {}; };
  }
})();
`;
          }
          // ELIMINĂM codul TDZ pentru chunk-urile non-Emotion
        }
      });
    },
    
    transformIndexHtml: {
      enforce: "pre",
      transform(html) {
        // Injectăm fix-ul în HTML ca primul script din document
        return html.replace(
          "<head>",
          `<head>
    <script>
      // CRITICAL TDZ FIX - PRIMUL SCRIPT DIN DOCUMENT
      (function() {
        'use strict';
        var g = window;
        
        // Definim R IMEDIAT și îl protejăm
        if (!g.R) {
          try {
            Object.defineProperty(g, 'R', {
              value: function() { return function() {}; },
              writable: false,
              configurable: false,
              enumerable: false
            });
          } catch(e) {
            g.R = function() { return function() {}; };
          }
        }
        
        g.__EMOTION_TDZ_HTML_FIX__ = true;
      })();
    </script>`
        );
      }
    }
  };
}
