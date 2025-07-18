import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
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
});
