import type { Config } from "tailwindcss";
import { novaColors } from "./src/styles/colors";
import { novaFontSizes } from "./src/styles/typography";

const config: Config = {
  darkMode: "class", // optional but recommended
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["DM Mono", "monospace"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        nova: novaColors,
      },
      fontSize: {
        ...novaFontSizes,
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        typing: "typing 1.2s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        typing: {
          "0%, 80%, 100%": { transform: "scale(1)", opacity: 0.4 },
          "40%": { transform: "scale(1.3)", opacity: 1 },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};

export default config;