import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import type { ProxyOptions } from "vite";
import { defineConfig, loadEnv } from "vite";
import compression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const isProd = mode === "production";
    const isLegacyBuild = env.VITE_LEGACY_BUILD === "true";
    const isDev = mode === "development";
  // Dezactivăm consolele în proxy doar în producție
    const shouldLogProxy = !isProd;
    
    // Configurația proxy comună
    const analyticsProxyConfig: ProxyOptions = {
        target: "https://lupulsicorbul.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analytics-proxy/, "/api/analytics"),
        configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
                // eslint-disable-next-line no-console
                shouldLogProxy && console.log("Proxy error:", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
                // eslint-disable-next-line no-console
                shouldLogProxy && console.log("Sending Request to the Target:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
                // eslint-disable-next-line no-console
                shouldLogProxy && console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
            });
        },
        bypass: (req, res) => {
            if (req.method === "OPTIONS") {
                res.statusCode = 200;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.setHeader("Access-Control-Max-Age", "86400");
                res.end();
                return false;
            }
            return undefined;
        }
    };
    
    return {
        plugins: [
            react({
                babel: {
                    plugins: [
                        isProd && [
                            "babel-plugin-transform-react-remove-prop-types",
                            { removeImport: true }
                        ]
                    ].filter(Boolean)
                }
            }),
            // Rulăm visualizer și compression doar în build-ul de producție
            isProd && visualizer({
                filename: "./dist/stats.html",
                open: false,
                gzipSize: true,
                brotliSize: true,
            }),
            isProd && compression({
                algorithm: "gzip",
                ext: ".gz",
            }),
            isProd && compression({
                algorithm: "brotliCompress",
                ext: ".br",
            }),
        ].filter(Boolean),        resolve: {
            alias: {
                // Fix pentru React Icons error
                "react-icons/lib/iconContext": path.resolve(__dirname, "./src/fixes/icon-context-replacement.jsx"),
                "react-icons/iconContext.mjs": path.resolve(__dirname, "./src/fixes/icon-context-replacement.jsx"),
                "@": path.resolve(__dirname, "./src"),
                "@components": path.resolve(__dirname, "./src/components"),
                "@hooks": path.resolve(__dirname, "./src/hooks"),
                "@pages": path.resolve(__dirname, "./src/pages"),
                "@utils": path.resolve(__dirname, "./src/utils"),
                "@services": path.resolve(__dirname, "./src/services"),
                "@types": path.resolve(__dirname, "./src/types"),
                "@context": path.resolve(__dirname, "./src/contexts"),
                "@assets": path.resolve(__dirname, "./src/assets"),
                "@layouts": path.resolve(__dirname, "./src/layouts"),
                "@styles": path.resolve(__dirname, "./src/styles"),
                "@models": path.resolve(__dirname, "./src/models"),
                "@store": path.resolve(__dirname, "./src/store"),
                // Remove the Firebase alias to use the actual Firebase modules
                // "@firebase": path.resolve(__dirname, "./src/firebase"),
            },
        },
        
        server: {
            port: 3000,
            host: true,
            open: true,
            hmr: {
                overlay: false,
            },
            proxy: {
                "/api/analytics-proxy": analyticsProxyConfig
            },
        },
        
        preview: {
            port: 5174,
            proxy: {
                "/api/analytics-proxy": analyticsProxyConfig
            },
        },
        
        build: {
            outDir: "dist",
            sourcemap: isProd ? true : "inline", // pentru debugging în producție
            minify: isProd ? "terser" : false,
            terserOptions: isProd ? {
                compress: {
                    drop_console: !isLegacyBuild,
                    drop_debugger: true,
                    pure_funcs: isLegacyBuild ? [] : ["console.log", "console.info", "console.debug"],
                    passes: 2,
                    sequences: false,
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
                    reserved: ["app", "firebaseApp", "auth", "authModule", "firestore", "firestoreModule", 
                               "storage", "storageModule", "functions", "functionsModule", "analytics", "analyticsModule"],
                },
                ecma: 2020,
                keep_classnames: true,
                keep_fnames: true,
                module: true,
            } : undefined,
            rollupOptions: !isDev ? {
                output: {
                    entryFileNames: "assets/[name].[hash].js",
                    chunkFileNames: "assets/[name].[hash].js",
                    assetFileNames: "assets/[name].[hash].[ext]",
                    manualChunks: (id) => {
                        // Doar pentru producție
                        if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
                            return "vendor";
                        }
                        if (id.includes("node_modules/@emotion/")) {
                            return "emotion";
                        }
                        
                        if (id.includes("node_modules")) {
                            if (id.includes("react-router")) {
                                return "vendor-react";
                            }
                            if (id.includes("firebase/")) {
                                return "vendor-firebase-core";
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
                            if (id.includes("src/utils/tdz-prevention")) {
                                return "vendor-tdz-prevention";
                            }
                            return "vendor-others";
                        }
                        if (id.includes(".css")) {
                            return "styles";
                        }
                        
                        return undefined;
                    },                    intro: `
                        // TDZ prevention
                        var __tdz_e;
                        var __tdz_handlers = [];
                        var __tdz_cache = new Map();
                        var __tdz_load_promises = {};
                        
                        // React Icons Fix - definim variabilele problematice direct
                        var e = { Provider: null, Consumer: null };
                        var t = {};
                        // End React Icons Fix
                        var __tdz_load_promises = {};
                        // End TDZ prevention
                    `
                },
                external: [
                    "express",
                    "cors",
                    "nodemailer",
                    "firebase-functions",
                    "firebase-admin",
                    "mongoose",
                    "safe-buffer"
                ],
            } : undefined,
            commonjsOptions: {
                esmExternals: true,
                transformMixedEsModules: true,
                strictRequires: false,
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
                "safe-buffer"
            ],
            include: [
                "react", 
                "react-dom",
                "react-router-dom",
                "firebase/app",
                "firebase/auth",
                "firebase/firestore",
                "firebase/analytics",
                "firebase/storage",
                "firebase/functions",
                "@emotion/react",
                "@emotion/styled",
                // Includem explicit pachetele pentru iconuri
                "react-icons",
                "react-icons/fa",
                "react-icons/ri", 
                "react-icons/ai",
                "react-icons/io",
                "@mui/material",
                "@mui/icons-material",
                "@reduxjs/toolkit",
                "react-redux",
                "framer-motion",
                "react-toastify"
            ],
            esbuildOptions: {
                target: "es2020",
                treeShaking: true,
                legalComments: "none",
                minify: isProd,
                minifyIdentifiers: false,
                minifySyntax: isProd,
                minifyWhitespace: isProd,
            },
        },
          define: {
            "process.env": env,
            "process.env.NODE_ENV": JSON.stringify(mode), // Crucial pentru React Icons
            __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || "1.0.0"),
            __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
            __DEV__: mode !== "production",
            __LEGACY_BUILD__: isLegacyBuild,
            __PREVENT_TDZ__: true,
        },
        
        assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
    };
});