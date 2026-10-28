import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#03060f", 900: "#060b1a", 850: "#0a1124", 800: "#0d1730", 700: "#142142", 600: "#1d2d57" },
        cyan: { 300: "#7ef3ff", 400: "#3ee6ff", 500: "#14c8f0", 600: "#0ea2c9" },
        volt: { 400: "#4f8cff", 500: "#2f6bff", 600: "#2553d6" },
        violet: { 400: "#a78bfa", 500: "#8b5cf6" },
        mist: { 100: "#eef4ff", 200: "#cfdbf2", 300: "#a6b6d6", 400: "#7d8db0", 500: "#5b6a8c" },
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', "system-ui", "sans-serif"],
        sans: ['"Inter Variable"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "monospace"],
        script: ['"Kaushan Script"', "cursive"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(62,230,255,.18), 0 10px 40px -10px rgba(20,200,240,.35)",
        panel: "0 1px 0 0 rgba(255,255,255,.04) inset, 0 20px 50px -20px rgba(0,0,0,.6)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(126,243,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(126,243,255,.05) 1px, transparent 1px)",
      },
      keyframes: {
        pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100%)" } },
      },
      animation: { pulseDot: "pulseDot 2s ease-in-out infinite", scan: "scan 6s linear infinite" },
    },
  },
  plugins: [typography],
} satisfies Config;
