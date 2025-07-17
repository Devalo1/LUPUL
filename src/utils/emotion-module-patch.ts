/**
 * Patch direct pentru emotion-use-insertion-effect-with-fallbacks
 * Acest fișier redefine modulul problematic pentru a evita TDZ errors
 */

import * as React from 'react';

// Declarații pentru window properties extendite
declare global {
  interface Window {
    __import?: (specifier: string) => Promise<any>;
    import?: (specifier: string) => Promise<any>;
  }
}

// Interceptăm și patchăm încărcarea modulelor
if (typeof window !== 'undefined') {
  // Override la importul dinamic
  const originalDynamicImport = window.__import || window.import;
  
  const patchedImport = async function(this: any, specifier: string): Promise<any> {
    // Dacă este modulul problematic, returnăm o versiune safe
    if (typeof specifier === 'string' && specifier.includes('emotion-use-insertion-effect-with-fallbacks')) {
      console.warn('[TDZ Patch] Intercepted problematic emotion module:', specifier);
      
      // Returnăm un modul safe care nu cauzează TDZ
      return {
        default: function() {
          // Safe fallback pentru useInsertionEffect
          return typeof React !== 'undefined' && React.useInsertionEffect ? 
            React.useInsertionEffect : 
            typeof React !== 'undefined' && React.useLayoutEffect ? 
              React.useLayoutEffect : 
              function(fn: React.EffectCallback, deps?: React.DependencyList) { 
                if (typeof React !== 'undefined' && React.useEffect) {
                  React.useEffect(fn, deps);
                }
              };
        },
        useInsertionEffectWithFallbacks: function() {
          return typeof React !== 'undefined' && React.useInsertionEffect ? 
            React.useInsertionEffect : 
            typeof React !== 'undefined' && React.useLayoutEffect ? 
              React.useLayoutEffect : 
              function(fn: React.EffectCallback, deps?: React.DependencyList) { 
                if (typeof React !== 'undefined' && React.useEffect) {
                  React.useEffect(fn, deps);
                }
              };
        }
      };
    }
    
    // Pentru toate celelalte module, folosim importul original
    if (originalDynamicImport) {
      return originalDynamicImport.call(this, specifier);
    }
    
    // Fallback pentru browsers mai vechi
    return import(specifier);
  };
  
  // Aplicăm patch-ul
  if (window.__import) {
    window.__import = patchedImport;
  }
  if (window.import) {
    window.import = patchedImport;
  }
  
  console.info('[TDZ Patch] Emotion module interceptor installed');
}

export const emotionPatchApplied = true;
