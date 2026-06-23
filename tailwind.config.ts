import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F0D060",
          dark: "#A08020",
          muted: "#8B7322",
        },
        dark: {
          DEFAULT: "#0D0D0D",
          card: "#1A1A1A",
          surface: "#242424",
          border: "#2E2E2E",
        },
      },
      boxShadow: {
        gold: "0 0 0 1px #D4AF37",
        "gold-glow": "0 0 12px rgba(212,175,55,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
