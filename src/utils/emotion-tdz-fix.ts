/**
 * AGGRESSIVE TDZ (Temporal Dead Zone) fix for Emotion
 *
 * This module specifically addresses the "Cannot access 'R' before initialization" error
 * that occurs with @emotion/use-insertion-effect-with-fallbacks in bundled code
 */

// IMMEDIATE EXECUTION - nu așteaptă module loading
(function aggressiveTdzFix() {
  if (typeof globalThis === "undefined") return;

  const global = globalThis as any;

  // Forțăm inițializarea ÎNAINTE de orice modul
  const criticalVars = {
    R: function () {
      return function () {};
    },
    e: {},
    t: {},
    n: {},
    r: {},
    o: {},
    i: {},
    a: {},
    u: {},
    c: {},
    s: {},
    l: {},
    f: {},
    d: {},
    p: {},
    h: {},
    v: {},
    g: {},
    m: {},
    y: {},
    b: {},
    w: {},
    x: {},
    k: {},
    j: {},
    q: {},
    z: {},
  };

  // Aplicăm cu forță toate variabilele
  Object.keys(criticalVars).forEach((varName) => {
    try {
      if (typeof (global as any)[varName] === "undefined") {
        Object.defineProperty(global, varName, {
          value: (criticalVars as any)[varName],
          writable: true,
          configurable: true,
          enumerable: false,
        });
      }
    } catch (e) {
      // Fallback dacă defineProperty eșuează
      (global as any)[varName] = (criticalVars as any)[varName];
    }
  });

  // Ensure emotion cache is pre-initialized
  if (!global.__emotion_cache__) {
    global.__emotion_cache__ = new Map();
  }

  if (!global.__emotion_styles__) {
    global.__emotion_styles__ = new Map();
  }

  if (!global.__emotion_inserted__) {
    global.__emotion_inserted__ = new Set();
  }

  // React Refresh globals
  if (!global.$RefreshReg$) {
    global.$RefreshReg$ = function () {};
  }

  if (!global.$RefreshSig$) {
    global.$RefreshSig$ = function () {
      return function () {};
    };
  }

  // Mark that TDZ fix has been applied
  global.__EMOTION_TDZ_AGGRESSIVE_FIXED__ = true;

  console.info(
    "[AGGRESSIVE Emotion TDZ Fix] Applied comprehensive TDZ prevention"
  );
})();

export const emotionTdzFixed = true;
