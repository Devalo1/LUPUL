import type { Plugin } from "vite";

/**
 * Plugin pentru prevenirea runtime errors cu fișierele Emotion
 * Injectează cod de protecție la începutul fiecărui chunk Emotion
 */
export function emotionRuntimeFixPlugin(): Plugin {
  return {
    name: "emotion-runtime-fix",
    apply: "build",
    generateBundle(_options, bundle) {
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        
        if (chunk.type === "chunk" && fileName.includes("emotion")) {
          let code = chunk.code;
          
          // Adăugăm protecție runtime la începutul fiecărui chunk Emotion
          const runtimeProtection = `
// EMOTION RUNTIME PROTECTION
(function() {
  'use strict';
  var g = typeof globalThis !== 'undefined' ? globalThis : 
          typeof window !== 'undefined' ? window :
          typeof global !== 'undefined' ? global : {};
  
  // Protejează toate variabilele potențial problemateice
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
  if (!g.m) g.m = {};
  if (!g.y) g.y = {};
  if (!g.b) g.b = {};
  if (!g.w) g.w = {};
  if (!g.x) g.x = {};
  
  // Protecție specifică pentru Emotion
  if (!g.__emotion_cache__) g.__emotion_cache__ = new Map();
  if (!g.__emotion_styles__) g.__emotion_styles__ = new Map();
  
  // React Refresh protection
  if (!g.$RefreshReg$) g.$RefreshReg$ = function() {};
  if (!g.$RefreshSig$) g.$RefreshSig$ = function() { return function() {}; };
})();

`;

          chunk.code = runtimeProtection + code;
        }
      });
    }
  };
}
