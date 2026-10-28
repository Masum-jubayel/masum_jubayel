"use client";

import { motion, useReducedMotion } from "motion/react";
import { CalendarDays, Clock3 } from "lucide-react";

/** Date range chip ("MAY 2026 → PRESENT"), a "Current" badge for the live role, and the length ("1 yr 5 mos"). */
export function DateBadge({ from, to, length, hue = "#3ee6ff", current = false, size = "md" }: { from: string; to: string; length?: string; months?: number; hue?: string; current?: boolean; size?: "sm" | "md" }) {
  const reduce = useReducedMotion();
  const sm = size === "sm";
  const chip = `relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border font-mono print:border-0 print:bg-transparent print:px-0 print:text-black ${sm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`;
  const pop = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 6, scale: 0.9 }, whileInView: { opacity: 1, y: 0, scale: 1 }, viewport: { once: true }, transition: { type: "spring" as const, stiffness: 260, damping: 18, delay: d } });
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 print:gap-2">
      <motion.span {...pop(0.05)} className={chip} style={{ color: hue, borderColor: `${hue}66`, background: `linear-gradient(90deg, ${hue}22, ${hue}08)`, boxShadow: `0 0 14px ${hue}33` }}>
        {!reduce && <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 animate-[date-sweep_3.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent print:hidden" />}
        <CalendarDays className={sm ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
        <span className="relative font-semibold uppercase tracking-wider">{from} <span aria-hidden>→</span><span className="sr-only">to</span> {current ? "Present" : to}</span>
      </motion.span>
      {current && (
        <motion.span {...pop(0.15)} className={`${chip} border-emerald-400/30 bg-emerald-400/10 font-semibold uppercase tracking-wider text-emerald-300`}>
          <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" /></span>
          Current
        </motion.span>
      )}
      {length && (
        <motion.span {...pop(0.25)} className={`${chip} border-white/15 bg-white/[0.05] text-mist-200`}>
          <Clock3 className="h-3 w-3" aria-hidden />{length}
        </motion.span>
      )}
    </span>
  );
}
