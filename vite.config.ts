import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import compression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
    // Încărcăm variabilele de mediu bazate pe modul curent (dev/prod)
    const env = loadEnv(mode, process.cwd());
    const isProd = mode === "production";
    
    return {
        plugins: [
            react({
                // Activăm optimizările pentru componente în producție
                babel: {
                    plugins: [
                        isProd && [
                            "babel-plugin-transform-react-remove-prop-types",
                            { removeImport: true }
                        ]
                    ].filter(Boolean)
                }
                // Am eliminat opțiunea fastRefresh care nu era compatibilă
            }),
            // Adăugăm plugin-ul de vizualizare a analizei dimensiunii bundle-ului
            visualizer({
                filename: "./dist/stats.html",
                open: true,
                gzipSize: true,
                brotliSize: true,
            }),
            // Adăugăm compresie GZIP și Brotli pentru producție
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
            port: 5173,
            host: true,
            open: true,
            hmr: {
                overlay: false,
            },
        },
        
        preview: {
            port: 5173,
        },
        
        // Optimizări pentru build
        build: {
            // Generarea de sourcemaps doar în modul dev
            sourcemap: !isProd,
            
            // Activăm minificarea CSS-ului și a JS-ului
            minify: isProd ? "terser" : false,
            
            // Opțiuni pentru terser (minificare)
            terserOptions: isProd ? {
                compress: {
                    drop_console: true,     // Elimină console.log
                    drop_debugger: true,    // Elimină debugger
                    pure_funcs: ["console.log", "console.info", "console.debug"],
                    passes: 2,              // Multipasuri pentru o minificare mai bună
                },
                output: {
                    comments: false,        // Elimină comentariile
                },
                mangle: {
                    safari10: true,         // Compatibilitate Safari 10
                },
                // Optimizare pentru TDZ issues
                ecma: 2020,
                module: true,
            } : undefined,
            
            // Divizăm bundle-ul pentru a optimiza încărcarea
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        // Strategia de chunking îmbunătățită
                        if (id.includes("node_modules")) {
                            // Separam React, ReactDOM și react-router ca un chunk major
                            if (id.includes("react/") || id.includes("react-dom") || id.includes("react-router")) {
                                return "vendor-react";
                            }
                            
                            // Firebase într-un chunk separat
                            if (id.includes("firebase/")) {
                                return "vendor-firebase";
                            }
                            
                            // Separăm modulele problematice în chunk-uri individuale
                            // pentru a preveni TDZ issues
                            if (id.includes("@emotion/") || id.includes("@mui/")) {
                                return "vendor-ui-libs";
                            }
                            
                            if (id.includes("@reduxjs/") || id.includes("react-redux")) {
                                return "vendor-redux";
                            }
                            
                            // Adăugăm mai multă granularitate pentru a evita TDZ issues
                            if (id.includes("framer-motion")) {
                                return "vendor-motion";
                            }
                            
                            // Alte librării third-party
                            return "vendor-others";
                        }
                        
                        // Separam CSS-urile
                        if (id.includes(".css")) {
                            return "styles";
                        }
                    },
                },
                // Excludem modulele server-side din build
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
            
            // Opțiuni pentru commonjs
            commonjsOptions: {
                esmExternals: true,
                transformMixedEsModules: true,  // Optimizare pentru module mixte
            },
            
            // Setări pentru divizarea chunk-urilor
            chunkSizeWarningLimit: 1000, // Limita de avertizare la 1MB
            
            // Activăm comprimarea pentru deployment
            assetsInlineLimit: 4096, // Limite pentru inlining (în bytes)
        },
        
        // Optimizarea dependențelor
        optimizeDeps: {
            // Excludem aceste module din optimizarea dependențelor
            exclude: [
                "express",
                "cors",
                "nodemailer",
                "firebase-functions",
                "firebase-admin",
                "mongoose",
                "safe-buffer"
            ],
            // Includem aceste module în optimizarea dependențelor
            include: [
                "react", 
                "react-dom",
                "react-router-dom",
                "firebase/app",
                "firebase/auth",
                "firebase/firestore",
                // Adăugăm dependențe problematice pentru pre-bundling
                "@emotion/react",
                "@emotion/styled",
                "@mui/material",
                "@mui/icons-material",
                "@reduxjs/toolkit",
                "react-redux",
                "framer-motion",
                "react-toastify"
            ],
            // Activăm optimizări de esbuild
            esbuildOptions: {
                target: "es2020",           // Targetăm ES2020 pentru browser moderni
                treeShaking: true,          // Activăm treeShaking pentru a elimina codul nefolosit
                legalComments: "none",      // Eliminăm comentariile legale
            },
        },
        
        // Configurare pentru variabile de mediu
        define: {
            // Asigurăm că process.env este disponibil
            "process.env": env,
            // Adăugăm informații despre build
            __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || "1.0.0"),
            __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
            __DEV__: mode !== "production",
        },
        
        // Optimizare imagini
        assetsInclude: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg"],
    };
});