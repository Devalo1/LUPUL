import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    // Disable React refresh functions in production builds
    __REACT_REFRESH__: mode === "development",
    // Fix comprehensiv pentru $RefreshSig$ error în toate browserele
    $RefreshReg$: mode === "production" ? "undefined" : "(function() {})",
    $RefreshSig$:
      mode === "production"
        ? "undefined"
        : "(function() { return function() {}; })",
  },
  plugins: [
    react({
      // Emotion support cu Babel
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    // Plugin custom pentru fix-ul $RefreshSig$ în browser
    {
      name: "refresh-sig-fix",
      transformIndexHtml(html) {
        // Injectează polyfill pentru $RefreshSig$ în development
        if (mode === "development") {
          return html.replace(
            /<head>/,
            `<head>
              <script>
                // Fix pentru $RefreshSig$ compatibility în toate browserele
                if (typeof window !== 'undefined') {
                  window.$RefreshReg$ = window.$RefreshReg$ || function() {};
                  window.$RefreshSig$ = window.$RefreshSig$ || function() { return function() {}; };
                }
              </script>`
          );
        }
        return html;
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    // Reactivăm HMR pentru React Fast Refresh
    hmr: true,
    // Forward /api/* to Netlify Dev functions on port 8888
    proxy: {
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\//, "/.netlify/functions/"),
      },
    },
  },
  preview: {
    port: 5174,
  },
  optimizeDeps: {
    // 🔧 CRITICAL FIX pentru Emotion TDZ Error (18 Iulie 2025 - Commit f44334b)
    // PROBLEMA: emotion-use-insertion-effect-with-fallbacks.browser.esm.js:7
    //           Uncaught ReferenceError: Cannot access 'u' before initialization
    // SOLUȚIA: Exclude din Vite pre-bundling pentru a permite încărcarea naturală
    // REZULTAT: Preview mode funcționează perfect, zero erori TDZ
    // ATENȚIE: NU șterge această linie! Vezi EMOTION_TDZ_FIX_DOCUMENTATION.md
    exclude: ["@emotion/use-insertion-effect-with-fallbacks"],
  },
}));
