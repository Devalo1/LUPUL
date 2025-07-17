// Fix pentru problema TDZ cu Emotion in production
// Acest fișier trebuie importat înaintea oricăror componente care folosesc Emotion

// Preventive initialization pentru Emotion
let emotionCache: any;
let emotionUtils: any;

// TDZ Prevention for Emotion
if (typeof window !== "undefined") {
  // Pre-define Emotion globals to prevent TDZ errors
  const w = window as any;

  // Initialize emotion globals before any modules load
  if (!w.__emotion_cache__) {
    w.__emotion_cache__ = new Map();
  }

  if (!w.__emotion_styles__) {
    w.__emotion_styles__ = new Map();
  }

  if (!w.__emotion_inserted__) {
    w.__emotion_inserted__ = new Set();
  }

  // Pre-initialize variables that might be accessed in TDZ
  if (!w.R) {
    w.R = function () {
      return function () {};
    };
  }

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
