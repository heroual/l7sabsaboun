/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#006A4E", // Moroccan Green
        'majorelle-blue': '#243E82',
        'sandy-beige': '#F4E9D8',
        'mint-green': '#90EE90',
        'silver-highlight': '#C0C0C0',
        'brand-gold': '#D4AF37', // Gold from reference
        'brand-red': '#C1272D', // Moroccan Red
        'tifinagh-turquoise': '#4FD1C5',
        "background-light": "#F8FAFC",
        "background-dark": "#1a1a1a",
      },
      fontFamily: {
        display: ["Tajawal", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
    },
  },
  plugins: [],
}
