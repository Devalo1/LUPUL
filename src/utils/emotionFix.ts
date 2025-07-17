// Fix pentru problema TDZ cu Emotion in production
// Acest fișier trebuie importat înaintea oricăror componente care folosesc Emotion

// Preventive initialization pentru Emotion
let emotionCache: any;
let emotionUtils: any;

if (typeof window !== "undefined") {
  try {
    // Preload Emotion modules pentru a evita TDZ errors
    import("@emotion/react")
      .then((mod) => {
        emotionCache = mod;
      })
      .catch(() => {
        // Ignore errors during preload
      });

    import("@emotion/use-insertion-effect-with-fallbacks")
      .then((mod) => {
        emotionUtils = mod;
      })
      .catch(() => {
        // Ignore errors during preload
      });
  } catch (e) {
    // Fallback pentru cazurile când modulele nu pot fi încărcate
    console.warn("Emotion preload failed, using fallback");
  }
}

export { emotionCache, emotionUtils };
