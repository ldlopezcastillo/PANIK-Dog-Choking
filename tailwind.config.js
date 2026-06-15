/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./client/index.html",
    "./client/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        panik: {
          black: "#0A0A0A",
          red: "#E62E2E",
          "red-dark": "#c22020",
          yellow: "#E8A000",
          green: "#1E8A3E",
          surface: "#121212",
          border: "#1A1A1A",
          "border-light": "#222222",
          muted: "#333333",
          gray: "#AAAAAA"
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      }
    }
  },
  plugins: []
};
