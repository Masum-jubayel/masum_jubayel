"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Cpu, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

import { THEME_KEY as KEY, type ThemeName } from "@/lib/theme";
export type { ThemeName };
const META: Record<ThemeName, { label: string; hint: string; Icon: typeof Sun; bar: string }> = {
  dark: { label: "Dark", hint: "Deep navy, cyan glow", Icon: Moon, bar: "#3ee6ff" },
  light: { label: "Light", hint: "Clean and bright", Icon: Sun, bar: "#0891b2" },
  jarvis: { label: "Jarvis", hint: "HUD · arc-reactor cyan & gold", Icon: Cpu, bar: "#ffb020" },
};
const THEME_COLOR: Record<ThemeName, string> = { dark: "#04070f", light: "#f4f7fc", jarvis: "#02070c" };

export function readTheme(fallback: ThemeName = "dark"): ThemeName {
  try { const v = localStorage.getItem(KEY); if (v === "dark" || v === "light" || v === "jarvis") return v; } catch { /* storage blocked */ }
  return fallback;
}
export function applyTheme(t: ThemeName) {
  const root = document.documentElement;
  root.dataset.theme = t;
  root.style.colorScheme = t === "light" ? "light" : "dark";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[t]);
}

/** Click to cycle Dark → Light → Jarvis; the arrow opens a menu with all three. */
export function ThemeToggle({ fallback = "dark", compact = false }: { fallback?: ThemeName; compact?: boolean }) {
  const [theme, setTheme] = useState<ThemeName>(fallback);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = readTheme(fallback); setTheme(t); applyTheme(t); }, [fallback]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  const pick = (t: ThemeName) => {
    setTheme(t); applyTheme(t); setOpen(false);
    try { localStorage.setItem(KEY, t); } catch { /* storage blocked */ }
  };
  const order: ThemeName[] = ["dark", "light", "jarvis"];
  const next = order[(order.indexOf(theme) + 1) % order.length];
  const { Icon, label } = META[theme];

  return (
    <div ref={box} className="relative">
      <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03]">
        <button type="button" onClick={() => pick(next)} title={`Theme: ${label} — click for ${META[next].label}`} aria-label={`Theme: ${label}. Switch to ${META[next].label}`}
          className={cn("relative grid h-10 place-items-center overflow-hidden text-mist-100", compact ? "w-10" : "w-10")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={theme} initial={{ y: 14, opacity: 0, rotate: -90 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: -14, opacity: 0, rotate: 90 }} transition={{ duration: 0.25 }}>
              <Icon className="h-[18px] w-[18px]" style={{ color: META[theme].bar }} aria-hidden />
            </motion.span>
          </AnimatePresence>
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Choose a theme"
          className="grid h-10 w-6 place-items-center border-l border-white/10 text-mist-400 hover:text-mist-100">
          <svg viewBox="0 0 10 6" className={cn("h-2 w-2.5 transition-transform", open && "rotate-180")} aria-hidden><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.ul role="menu" initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.16 }}
            className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-white/10 bg-ink-900/95 p-1.5 shadow-panel backdrop-blur-xl">
            {order.map((t) => {
              const m = META[t];
              return (
                <li key={t}>
                  <button type="button" role="menuitemradio" aria-checked={theme === t} onClick={() => pick(t)}
                    className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", theme === t ? "bg-cyan-400/10" : "hover:bg-white/5")}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg border" style={{ borderColor: `${m.bar}66`, color: m.bar, background: `${m.bar}18` }}><m.Icon className="h-4 w-4" aria-hidden /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-mist-100">{m.label}</span><span className="block text-[11px] text-mist-400">{m.hint}</span></span>
                    {theme === t && <Check className="h-4 w-4 text-cyan-300" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
