import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import compression from "vite-plugin-compression";
import type { ProxyOptions } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const isProd = mode === "production";
    const isLegacyBuild = env.VITE_LEGACY_BUILD === "true";
    
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
                return false; // Schimbat din true în false pentru a corecta eroarea de tip
            }
            return undefined; // Explicit returnăm undefined pentru alte cazuri
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
            visualizer({
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
        ].filter(Boolean),
        
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
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
            sourcemap: true,
            minify: isProd ? "terser" : false,
            terserOptions: isProd ? {
                compress: {
                    drop_console: !isLegacyBuild,
                    drop_debugger: true,
                    pure_funcs: isLegacyBuild ? [] : ["console.log", "console.info", "console.debug"],
                    passes: 2,
                    // Îmbunătățim terser pentru a evita erorile TDZ
                    sequences: false,       // Evităm combinarea expresiilor, care poate cauza erori TDZ
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
            rollupOptions: {
                output: {
                    entryFileNames: "assets/[name].[hash].js",
                    chunkFileNames: "assets/[name].[hash].js",
                    assetFileNames: "assets/[name].[hash].[ext]",
                    manualChunks: (id) => {
                        if (id.includes("node_modules")) {
                            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
                                return "vendor-react";
                            }
                            if (id.includes("firebase/")) {
                                return "vendor-firebase-core";
                            }
                            if (id.includes("@emotion/") || id.includes("@mui/")) {
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
                            if (id.includes("src/utils/tdz-prevention")) {
                                return "vendor-tdz-prevention";
                            }
                            return "vendor-others";
                        }
                        if (id.includes(".css")) {
                            return "styles";
                        }
                    },
                    // Adăugăm inițializare TDZ înainte de conținutul chunk-urilor
                    intro: `
                        // TDZ prevention
                        var __tdz_e;
                        var __tdz_handlers = [];
                        var __tdz_cache = new Map();
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
            },
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
            __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || "1.0.0"),
            __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
            __DEV__: mode !== "production",
            __LEGACY_BUILD__: isLegacyBuild,
            __PREVENT_TDZ__: true,
        },
        
        assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
    };
});