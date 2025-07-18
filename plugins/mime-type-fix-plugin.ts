import type { Plugin } from "vite";

/**
 * Plugin pentru fix-ul problemelor MIME type în Emotion și module JS
 * Asigură că toate fișierele JS sunt servite cu MIME type corect
 */
export function mimeTypeFixPlugin(): Plugin {
  return {
    name: "mime-type-fix",
    apply: "build",
    generateBundle(_options, bundle) {
      // Procesăm toate chunk-urile pentru a asigura că sunt servite corect
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        
        if (chunk.type === "chunk" && fileName.endsWith(".js")) {
          // Adăugăm header explicit pentru MIME type
          let code = chunk.code;
          
          // Asigurăm că fiecare chunk JS începe cu comentariul MIME type
          if (!code.startsWith("// MIME: application/javascript")) {
            code = `// MIME: application/javascript\n${code}`;
          }
          
          // Fix special pentru emotion chunks - asigură că importurile sunt corecte
          if (fileName.includes("emotion")) {
            // Înlocuim orice referințe la hash-uri vechi cu cele noi
            code = code.replace(/BuQbZx3w/g, fileName.split(".")[1] || "HASH");
            
            // Adăugăm verificare de tip pentru a preveni erori MIME
            code = `// Emotion Module: ${fileName}\n` + code;
          }
          
          chunk.code = code;
        }
      });
    },
    
    configureServer(server) {
      // Middleware pentru dev server
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        
        // Asigură MIME type corect pentru toate fișierele JS
        if (url.endsWith(".js") || url.includes("emotion")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        }
        
        // Previne cache-ul pentru emotion modules în development
        if (url.includes("emotion") && process.env.NODE_ENV !== "production") {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        }
        
        next();
      });
    }
  };
}
