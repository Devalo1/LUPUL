import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import compression from "vite-plugin-compression";
import type { ProxyOptions } from "vite";
import { emotionTdzFixPlugin } from "./plugins/emotion-tdz-fix-plugin";
import { emotionImportFixPlugin } from "./plugins/emotion-import-fix-simple";
import { mimeTypeFixPlugin } from "./plugins/mime-type-fix-plugin";
import { emotionHashFixPlugin } from "./plugins/emotion-hash-fix-plugin";
/// <reference types="vitest" />

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === "production";
  const isLegacyBuild = env.VITE_LEGACY_BUILD === "true";

  // Configurația proxy comună
  const analyticsProxyConfig: ProxyOptions = {
    target: "https://lupulsicorbul.com",
    changeOrigin: true,
    rewrite: (path) =>
      path.replace(/^\/api\/analytics-proxy/, "/api/analytics"),
    configure: (proxy, _options) => {
      proxy.on("error", (_err, _req, _res) => {
        // Logging disabled to satisfy lint rule
      });
      proxy.on("proxyReq", (_proxyReq, _req, _res) => {
        // Logging disabled to satisfy lint rule
      });
      proxy.on("proxyRes", (_proxyRes, _req, _res) => {
        // Logging disabled to satisfy lint rule
      });
    },
    bypass: (req, res) => {
      if (req.method === "OPTIONS") {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        res.setHeader("Access-Control-Max-Age", "86400");
        res.end();
        return false; // Schimbat din true în false pentru a corecta eroarea de tip
      }
      return undefined; // Explicit returnăm undefined pentru alte cazuri
    },
  };
  return {
    plugins: [
      react({
        // Configurație pentru a evita $RefreshSig$ error și TDZ errors cu Emotion
        jsxImportSource: "react",
        babel: {
          plugins: [
            [
              "@emotion/babel-plugin",
              {
                sourceMap: !isProd,
                autoLabel: "dev-only",
                labelFormat: "[local]",
                cssPropOptimization: false,
              },
            ],
          ],
        },
      }),
      // Plugin-uri custom pentru fix-ul TDZ al Emotion și MIME type
      emotionHashFixPlugin(),
      mimeTypeFixPlugin(),
      emotionTdzFixPlugin(),
      emotionImportFixPlugin(),
      {
        name: "edge-hmr-fix",
        configureServer(server) {
          // Plugin pentru a fixa probleme HMR în Edge
          server.middlewares.use("/@vite/client", (req, res, next) => {
            // Interceptăm clientul Vite și adăugăm fix-uri pentru Edge
            res.setHeader("Content-Type", "application/javascript");
            next();
          });
        },
        transformIndexHtml(html) {
          // Adăugăm un script pentru a initializa $RefreshSig$ în Edge
          if (!isProd) {
            return html.replace(
              /<head>/,
              `<head>
                <script>
                  // Fix pentru Edge browser compatibility cu React Refresh
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
      {
        name: "spa-fallback",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || "";

            // Nu redirecționa fișierele statice și modulele
            if (
              req.method === "GET" &&
              !url.includes(".") &&
              !url.startsWith("/api") &&
              !url.startsWith("/@") && // Vite internals
              !url.startsWith("/node_modules") && // Node modules
              !url.startsWith("/__vite") && // Vite HMR
              !url.startsWith("/src/") && // Source files
              !url.includes("?") && // Query parameters
              url !== "/favicon.ico" // Favicon
            ) {
              req.url = "/index.html";
            }
            next();
          });
        },
      },
      visualizer({
        filename: "./dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
      isProd &&
        compression({
          algorithm: "gzip",
          ext: ".gz",
        }),
      isProd &&
        compression({
          algorithm: "brotliCompress",
          ext: ".br",
        }),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Fix pentru hoist-non-react-statics export issue
        "hoist-non-react-statics":
          "hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js",
      },
    },
    esbuild: {
      jsx: "automatic",
      jsxImportSource: "react",
      jsxDev: !isProd,
      // Previne probleme cu $RefreshSig$ în Edge
      target: "es2020",
    },
    server: {
      port: 5173,
      host: true,
      open: true,
      hmr: {
        overlay: false,
        // Fix specific pentru Edge browser
        port: 24678,
        clientPort: 24678,
        // Dezactivează overlay-ul pentru erori HMR în Edge
        timeout: 30000,
      },
      // Configurație pentru rutele SPA (Single Page Application)
      // Aceasta permite ca rutele React Router să funcționeze corect în dev mode
      middlewareMode: false,
      // Asigură-te că toate rutele necunoscute sunt redirecționate către index.html
      fs: {
        strict: false,
      },
      proxy: {
        "/api/analytics-proxy": analyticsProxyConfig,
        "/.netlify/functions": {
          target: "http://localhost:8888",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 5174,
      proxy: {
        "/api/analytics-proxy": analyticsProxyConfig,
        "/.netlify/functions": {
          target: "http://localhost:8888",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: "dist",
      sourcemap: true,
      minify: isProd ? "terser" : false,
      terserOptions: isProd
        ? {
            compress: {
              drop_console: !isLegacyBuild,
              drop_debugger: true,
              pure_funcs: isLegacyBuild
                ? []
                : ["console.log", "console.info", "console.debug"],
              passes: 2,
              // Îmbunătățim terser pentru a evita erorile TDZ
              sequences: false, // Evităm combinarea expresiilor, care poate cauza erori TDZ
              inline: 0,
              collapse_vars: false,
              reduce_vars: false,
              unsafe: false,
              unsafe_arrows: false,
              unsafe_comps: false,
              unsafe_Function: false,
              unsafe_math: false,
              unsafe_methods: false,
              unsafe_proto: false,
              unsafe_regexp: false,
              unsafe_undefined: false,
            },
            output: {
              comments: false,
            },
            mangle: {
              safari10: true,
              reserved: [
                "app",
                "firebaseApp",
                "auth",
                "authModule",
                "firestore",
                "firestoreModule",
                "storage",
                "storageModule",
                "functions",
                "functionsModule",
                "analytics",
                "analyticsModule",
              ],
            },
            ecma: 2020,
            keep_classnames: true,
            keep_fnames: true,
            module: true,
          }
        : undefined,
      rollupOptions: {
        output: {
          entryFileNames: "assets/[name].[hash].js",
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: "assets/[name].[hash].[ext]",
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router")
              ) {
                return "vendor-react";
              }
              if (id.includes("firebase/")) {
                return "vendor-firebase-core";
              }
              // CRITICAL: Separăm fiecare modul Emotion în propriul sub-chunk pentru control total
              if (id.includes("@emotion/use-insertion-effect-with-fallbacks")) {
                return "emotion-insertion-effect";
              }
              if (id.includes("@emotion/styled")) {
                return "emotion-styled";
              }
              if (id.includes("@emotion/react")) {
                return "emotion-react";
              }
              if (id.includes("@emotion/cache")) {
                return "emotion-cache";
              }
              if (id.includes("@emotion/")) {
                return "emotion-utils";
              }
              if (id.includes("@mui/")) {
                return "vendor-ui-libs";
              }
              if (id.includes("@reduxjs/") || id.includes("react-redux")) {
                return "vendor-redux";
              }
              if (id.includes("framer-motion")) {
                return "vendor-motion";
              }
              if (id.includes("lodash") || id.includes("date-fns")) {
                return "vendor-utils";
              }
              // Adaugă un chunk suplimentar pentru TDZ prevention
              if (
                id.includes("src/utils/tdz-prevention") ||
                id.includes("src/utils/emotion")
              ) {
                return "vendor-tdz-prevention";
              }
              return "vendor-others";
            }
            if (id.includes(".css")) {
              return "styles";
            }
          },
          // Adăugăm inițializare TDZ AGRESIVĂ înainte de conținutul chunk-urilor
          intro: `
                        // AGGRESSIVE TDZ prevention pentru Emotion
                        (function() {
                          if (typeof globalThis !== 'undefined') {
                            var g = globalThis;
                            if (!g.R) g.R = function() { return function() {}; };
                            if (!g.e) g.e = {};
                            if (!g.t) g.t = {};
                            if (!g.n) g.n = {};
                            if (!g.r) g.r = {
                              useLayoutEffect: function(effect, deps) { return function() {}; },
                              useEffect: function(effect, deps) { return function() {}; },
                              useState: function(initial) { return [initial, function() {}]; }
                            };
                            if (!g.o) g.o = {
                              useLayoutEffect: function(effect, deps) { return function() {}; },
                              useEffect: function(effect, deps) { return function() {}; },
                              useState: function(initial) { return [initial, function() {}]; }
                            };
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
                            g.__emotion_styles__ = g.__emotion_styles__ || new Map();
                            g.$RefreshReg$ = g.$RefreshReg$ || function() {};
                            g.$RefreshSig$ = g.$RefreshSig$ || function() { return function() {}; };
                          }
                        })();
                    `,
        },
        external: [
          "express",
          "cors",
          "nodemailer",
          "firebase-functions",
          "firebase-admin",
          "mongoose",
          "safe-buffer",
        ],
      },
      commonjsOptions: {
        esmExternals: true,
        transformMixedEsModules: true,
        strictRequires: false,
        // Fix pentru hoist-non-react-statics export compatibility
        defaultIsModuleExports: (id) => {
          if (id.includes("hoist-non-react-statics")) {
            return true;
          }
          return false;
        },
        requireReturnsDefault: (id) => {
          if (id.includes("hoist-non-react-statics")) {
            return "auto";
          }
          return false;
        },
      },
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
    },
    optimizeDeps: {
      exclude: [
        "express",
        "cors",
        "nodemailer",
        "firebase-functions",
        "firebase-admin",
        "mongoose",
        "safe-buffer",
        "@firebase/logger",
        "@firebase/webchannel-wrapper",
        // Exclude toate modulele Emotion pentru a evita TDZ errors
        "@emotion/react",
        "@emotion/styled",
        "@emotion/cache",
        "@emotion/utils",
        "@emotion/use-insertion-effect-with-fallbacks",
        "@emotion/serialize",
        "@emotion/hash",
        "@emotion/weak-memoize",
        "@emotion/sheet",
        "@emotion/unitless",
        "@emotion/memoize",
      ],
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "firebase/app",
        "firebase/auth",
        "firebase/firestore",
        "firebase/analytics",
        "firebase/storage",
        "firebase/functions",
        "@mui/material/styles",
        "@mui/material/Button",
        "@mui/material/TextField",
        "@mui/material/Typography",
        "hoist-non-react-statics",
        "@mui/material/Box",
        "@mui/material/Container",
        "@mui/material/Grid",
        "@mui/material/Paper",
        "@mui/material/AppBar",
        "@mui/material/Toolbar",
        "@mui/material/Card",
        "@mui/material/CardContent",
        "@mui/material/Table",
        "@mui/material/TableBody",
        "@mui/material/TableCell",
        "@mui/material/TableContainer",
        "@mui/material/TableHead",
        "@mui/material/TableRow",
        "@mui/material/Dialog",
        "@mui/material/DialogActions",
        "@mui/material/DialogContent",
        "@mui/material/DialogTitle",
        "@mui/material/IconButton",
        "@mui/material/Menu",
        "@mui/material/MenuItem",
        "@mui/material/Divider",
        "@mui/material/Tabs",
        "@mui/material/Tab",
        "@mui/material/FormControl",
        "@mui/material/InputLabel",
        "@mui/material/Select",
        "@mui/material/FormHelperText",
        "@mui/material/Alert",
        "@mui/material/AlertTitle",
        "@mui/material/Snackbar",
        "@mui/material/CircularProgress",
        "@mui/icons-material",
        "@reduxjs/toolkit",
        "react-redux",
        "framer-motion",
        "react-toastify",
        // Eliminăm Emotion din include pentru a-l lăsa să se încarce natural
      ],
      esbuildOptions: {
        target: "es2020",
        treeShaking: true,
        legalComments: "none",
        minify: false,
        minifyIdentifiers: false,
        minifySyntax: false,
        minifyWhitespace: false,
        jsx: "automatic",
        jsxImportSource: "react",
        resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"],
        loader: {
          ".js": "jsx",
          ".jsx": "jsx",
          ".ts": "tsx",
          ".tsx": "tsx",
        },
      },
      force: true,
    },
    define: {
      "process.env": env,
      "import.meta.env.VITE_OPENAI_API_KEY": JSON.stringify(
        env.VITE_OPENAI_API_KEY
      ),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || "1.0.0"),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __DEV__: mode !== "production",
      __LEGACY_BUILD__: isLegacyBuild,
      __PREVENT_TDZ__: true,
      // Fix comprehensiv pentru toate browserele și $RefreshSig$ error
      $RefreshReg$: isProd ? "undefined" : "(function() {})",
      $RefreshSig$: isProd
        ? "undefined"
        : "(function() { return function() {}; })",
      global: "globalThis",
    },
    assetsInclude: [
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.gif",
      "**/*.svg",
    ],

    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      reporters: ["verbose"],
      coverage: {
        reporter: ["text", "json", "html"],
        exclude: ["node_modules/", "src/test/"],
      },
    },
  };
});
