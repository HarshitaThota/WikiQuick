/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{ts,js, jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["satoshi", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}