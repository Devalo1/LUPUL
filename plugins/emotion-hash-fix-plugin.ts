import type { Plugin } from "vite";

/**
 * Plugin pentru eliminarea hash-urilor hard-coded din Emotion
 * Previne erori MIME type cauzate de referințe la hash-uri vechi
 */
export function emotionHashFixPlugin(): Plugin {
  const hashReferences = new Map<string, string>();
  
  return {
    name: "emotion-hash-fix",
    apply: "build",
    generateBundle(options, bundle) {
      // Prima trecere: colectăm hash-urile reale
      Object.keys(bundle).forEach((fileName) => {
        if (fileName.includes("emotion-")) {
          const match = fileName.match(/emotion-([^.]+)\.([^.]+)\.js$/);
          if (match) {
            const [, type, hash] = match;
            hashReferences.set(type, hash);
          }
        }
      });
      
      // A doua trecere: înlocuim hash-urile hard-coded
      Object.keys(bundle).forEach((fileName) => {
        const chunk = bundle[fileName];
        
        if (chunk.type === "chunk") {
          let code = chunk.code;
          
          // Înlocuim referințele la hash-uri hard-coded
          const hardcodedHashes = [
            "BuQbZx3w", // emotion-insertion-effect
            "BVoLpRA9", // emotion-cache  
            "Bx4u77cl", // emotion-utils
            "DKSDIFBv", // emotion-styled
          ];
          
          hardcodedHashes.forEach((oldHash) => {
            // Încercăm să găsim hash-ul corect bazat pe conținut
            hashReferences.forEach((newHash, _type) => {
              if (code.includes(oldHash)) {
                code = code.replace(new RegExp(oldHash, "g"), newHash);
                // Hash replacement completed for ${oldHash} -> ${newHash}
              }
            });
          });
          
          // Fix special pentru import-urile dinamice cu hash-uri greșite
          code = code.replace(
            /import\s*\(\s*["'`]\.\/[^"'`]*\.([A-Za-z0-9_-]+)\.js["'`]\s*\)/g,
            (match, hash) => {
              // Verificăm dacă hash-ul există în bundle
              const hasValidHash = Object.keys(bundle).some(name => name.includes(hash));
              if (!hasValidHash) {
                // Înlocuim cu primul hash disponibil pentru emoțion
                const firstEmotionHash = Array.from(hashReferences.values())[0];
                if (firstEmotionHash) {
                  return match.replace(hash, firstEmotionHash);
                }
              }
              return match;
            }
          );
          
          chunk.code = code;
        }
      });
    },
    
    configureServer(server) {
      // În development, servim toate modulele emotion cu MIME type corect
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        
        if (url.includes("emotion") && url.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          res.setHeader("X-Content-Type-Options", "nosniff");
        }
        
        next();
      });
    }
  };
}
