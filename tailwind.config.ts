import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#0a1215",
          panel: "#101b20",
          panelSoft: "#16262c",
          positive: "#38d39f",
          negative: "#ff6464",
          neutral: "#f0b95f",
          line: "#1f3a42",
          text: "#d5efe7",
          dim: "#84a6a1",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,211,159,0.2), 0 12px 40px rgba(0,0,0,0.35)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        riseIn: "riseIn 550ms ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
