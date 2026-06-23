import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "sans-serif"],
        condensed: ["var(--font-roboto-condensed)", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
      colors: {
        bg: "#080b10",
        card: "#0a0e14",
        surface: "#05080c",
        gold: "#fbbf24",
        dim: "#5e6b7a",
        muted: "#9aa6b5",
        primary: "#f4f7fb",
        secondary: "#eef2f7",
        body: "#dfe6ef",
      },
    },
  },
  plugins: [],
};
export default config;
