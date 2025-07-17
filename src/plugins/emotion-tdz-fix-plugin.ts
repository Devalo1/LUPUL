import type { Plugin } from "vite";

/**
 * Plugin Vite care injectează fix-ul TDZ direct în chunk-urile generate
 * pentru a elimina definitiv eroarea "Cannot access 'R' before initialization"
 */
export function emotionTdzFixPlugin(): Plugin {
  return {
    name: "emotion-tdz-fix",
    apply: "build",
    generateBundle(_options, bundle) {
      // TDZ fix code care va fi injectat în toate chunk-urile
      const tdzFixCode = `
// ULTIMATE TDZ FIX - injectat automat de plugin
(function() {
  if (typeof globalThis !== 'undefined') {
    const g = globalThis;
    if (!g.R) g.R = function() { return function() {}; };
    if (!g.e) g.e = {};
    if (!g.t) g.t = {};
    if (!g.n) g.n = {};
    if (!g.r) g.r = {};
    if (!g.o) g.o = {};
    if (!g.i) g.i = {};
    if (!g.a) g.a = {};
    if (!g.u) g.u = {};
    if (!g.c) g.c = {};
    if (!g.s) g.s = {};
    if (!g.l) g.l = {};
    if (!g.f) g.f = {};
    if (!g.d) g.d = {};
    if (!g.p) g.p = {};
    if (!g.h) g.h = {};
    if (!g.v) g.v = {};
    if (!g.g) g.g = {};
    if (!g.m) g.m = {};
    if (!g.y) g.y = {};
    if (!g.b) g.b = {};
    if (!g.w) g.w = {};
    if (!g.x) g.x = {};
    g.__emotion_cache__ = g.__emotion_cache__ || new Map();
    g.$RefreshReg$ = g.$RefreshReg$ || function() {};
    g.$RefreshSig$ = g.$RefreshSig$ || function() { return function() {}; };
  }
})();
`;

      // Injectăm fix-ul în toate chunk-urile JavaScript
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk" && fileName.endsWith(".js")) {
          // Injectăm la începutul fiecărui chunk
          chunk.code = tdzFixCode + chunk.code;
          
          // Special handling pentru chunk-ul emotion
          if (fileName.includes("emotion") || chunk.code.includes("@emotion")) {
            // Injectăm fix-ul și la sfârșitul chunk-ului pentru siguranță
            chunk.code = chunk.code + `
// EMOTION TDZ FIX - post injection
if (typeof window !== 'undefined' && !window.R) {
  window.R = function() { return function() {}; };
}
`;
          }
        }
      });
    },
    transformIndexHtml: {
      enforce: "pre",
      transform(html) {
        // Injectăm fix-ul și în HTML pentru extra siguranță
        return html.replace(
          "<head>",
          `<head>
    <script>
      // PRE-LOAD TDZ FIX
      window.R = window.R || function() { return function() {}; };
      window.__EMOTION_TDZ_ULTIMATE_FIX__ = true;
    </script>`
        );
      }
    }
  };
}
