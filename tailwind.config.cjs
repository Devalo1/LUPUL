/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2c5282",
          dark: "#1a365d",
        },
        secondary: {
          DEFAULT: "#4c9aff",
          dark: "#2b6cb0",
        },
        accent: {
          DEFAULT: "#f6ad55",
          dark: "#dd6b20",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        display: ["Montserrat", "sans-serif"],
      },
      // Optimizări pentru Galaxy S24 FE
      screens: {
        galaxy: "428px",
        "galaxy-landscape": {
          raw: "(max-height: 430px) and (orientation: landscape)",
        },
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      minHeight: {
        "screen-dynamic": "100dvh",
        "screen-safe":
          "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
      maxHeight: {
        "screen-dynamic": "100dvh",
      },
    },
  },
  plugins: [],
};
