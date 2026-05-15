/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./assets/js/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        appBg: "#f5f6fa",
        primary: {
          DEFAULT: "#09090b",
          hover: "#18181b",
        },
      },
      boxShadow: {
        card: "none",
      },
    },
  },
  plugins: [],
};

