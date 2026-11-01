import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Theme-aware palettes (values live in globals.css: dark · light · jarvis)
        white: "rgb(var(--white) / <alpha-value>)",
        ink: { 950: "rgb(var(--ink-950) / <alpha-value>)", 900: "rgb(var(--ink-900) / <alpha-value>)", 850: "rgb(var(--ink-850) / <alpha-value>)", 800: "rgb(var(--ink-800) / <alpha-value>)", 700: "rgb(var(--ink-700) / <alpha-value>)", 600: "rgb(var(--ink-600) / <alpha-value>)" },
        cyan: { 300: "rgb(var(--cyan-300) / <alpha-value>)", 400: "rgb(var(--cyan-400) / <alpha-value>)", 500: "rgb(var(--cyan-500) / <alpha-value>)", 600: "rgb(var(--cyan-600) / <alpha-value>)" },
        volt: { 400: "rgb(var(--volt-400) / <alpha-value>)", 500: "rgb(var(--volt-500) / <alpha-value>)", 600: "rgb(var(--volt-600) / <alpha-value>)" },
        violet: { 400: "rgb(var(--violet-400) / <alpha-value>)", 500: "rgb(var(--violet-500) / <alpha-value>)" },
        mist: { 100: "rgb(var(--mist-100) / <alpha-value>)", 200: "rgb(var(--mist-200) / <alpha-value>)", 300: "rgb(var(--mist-300) / <alpha-value>)", 400: "rgb(var(--mist-400) / <alpha-value>)", 500: "rgb(var(--mist-500) / <alpha-value>)" },
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
