import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'DM Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        nova: {
          bg: "#080b0f",
          surface: "#0e1117",
          surface2: "#141820",
          border: "#1e2530",
          accent: "#00e5ff",
          accent2: "#7c3aed",
          accent3: "#10b981",
          text: "#e8eaf0",
          muted: "#5a6478",
          dim: "#8a94a8",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "typing": "typing 1.2s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        typing: {
          "0%, 80%, 100%": { transform: "scale(1)", opacity: "0.4" },
          "40%": { transform: "scale(1.3)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
