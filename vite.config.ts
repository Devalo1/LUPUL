import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode: _mode }) => ({
  define: {
    // Fix React production mode detection - force development mode
    "process.env.NODE_ENV": JSON.stringify("development"),
    // Fix React development mode detection
    __DEV__: true,
    // Ensure React runs in development mode
    "process.env.REACT_APP_NODE_ENV": JSON.stringify("development"),
    // Force React development globals
    global: "globalThis",
  },
  plugins: [
    react({
      // Emotion support cu Babel - forțează development mode
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    // Plugin custom pentru suprimarea React production warnings
    {
      name: "suppress-react-warnings",
      config() {
        // Ensure development mode is forced in all contexts
        process.env.NODE_ENV = "development";
      },
      configureServer() {
        // Force development mode on server
        process.env.NODE_ENV = "development";
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
    // Forward /api/* to Netlify Dev server on port 8888
    proxy: {
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/.netlify/functions"), // Convert /api to /.netlify/functions
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
