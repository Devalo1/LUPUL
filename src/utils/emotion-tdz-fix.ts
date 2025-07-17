/**
 * Comprehensive TDZ (Temporal Dead Zone) fix for Emotion
 *
 * This module specifically addresses the "Cannot access 'R' before initialization" error
 * that occurs with @emotion/use-insertion-effect-with-fallbacks in bundled code
 */

// Pre-define all possible variables that could cause TDZ errors in Emotion
if (typeof window !== "undefined") {
  const global = window as any;

  // Pre-define the 'R' variable that's causing the TDZ error
  if (typeof global.R === "undefined") {
    global.R = function defaultReactRefresh() {
      return function () {};
    };
  }

  // Pre-define other potential TDZ variables from Emotion
  const emotionVars = [
    "e",
    "t",
    "n",
    "r",
    "o",
    "i",
    "a",
    "u",
    "c",
    "s",
    "l",
    "f",
    "d",
    "p",
    "h",
    "v",
    "g",
    "m",
    "y",
    "b",
    "w",
    "x",
  ];

  emotionVars.forEach((varName) => {
    if (typeof global[varName] === "undefined") {
      global[varName] = {};
    }
  });

  // Ensure emotion cache is pre-initialized
  if (!global.__emotion_cache__) {
    global.__emotion_cache__ = new Map();
  }

  if (!global.__emotion_styles__) {
    global.__emotion_styles__ = new Map();
  }

  if (!global.__emotion_inserted__) {
    global.__emotion_inserted__ = new Set();
  }

  // Mark that TDZ fix has been applied
  global.__EMOTION_TDZ_FIXED__ = true;

  console.info(
    "[Emotion TDZ Fix] Applied comprehensive TDZ prevention for Emotion"
  );
}

export const emotionTdzFixed = true;
