import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
    // Încărcăm variabilele de mediu bazate pe modul curent (dev/prod)
    const env = loadEnv(mode, process.cwd());
    const isProd = mode === "production";
    
    return {
        plugins: [
            react(),
            // Adăugăm plugin-ul de vizualizare a analizei dimensiunii bundle-ului
            // dar doar când este activat prin variabila de mediu
            env.VITE_BUNDLE_ANALYZER === "true" && visualizer({
                filename: "./dist/stats.html",
                open: true,
                gzipSize: true,
                brotliSize: true,
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
                },
                output: {
                    comments: false,        // Elimină comentariile
                },
            } : undefined,
            
            // Divizăm bundle-ul pentru a optimiza încărcarea
            rollupOptions: {
                output: {
                    manualChunks: {
                        // Pachetele mari merg în chunk-uri separate
                        vendor: ["react", "react-dom", "react-router-dom"],
                        firebase: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage", "firebase/functions"],
                        // Removed utils chunk since the path cannot be resolved
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
                "firebase/firestore"
            ],
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
    };
});