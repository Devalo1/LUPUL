/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2c5282',
          dark: '#1a365d',
        },
        secondary: {
          DEFAULT: '#4c9aff',
          dark: '#2b6cb0',
        },
        accent: {
          DEFAULT: '#f6ad55',
          dark: '#dd6b20',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};