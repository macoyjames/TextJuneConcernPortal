import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6f0",
          100: "#d3e8d8",
          200: "#a7d1b1",
          300: "#7ab98a",
          400: "#4f9d64",
          500: "#357a49",
          600: "#245e37",
          700: "#1b4a2b", // primary deep green
          800: "#153b22",
          900: "#0f2c19",
          950: "#081c10",
        },
        surface: "#f6f8f6",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 44, 25, 0.08), 0 1px 2px -1px rgba(15, 44, 25, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
