"use client";

import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck } from "lucide-react";
import { iconMap, fallbackIcon } from "@/components/ui/highlightIconMap";
import { CountUp } from "@/components/ui/CountUp";
import type { Highlight } from "@/content/highlights";

/** Credential & impact cards: 3D flip-in, spinning neon border, cursor spotlight, decrypting values. */
export function StatCards({ items }: { items: Highlight[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-4 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
      {items.map((s, i) => { const Icon = iconMap[s.icon] ?? fallbackIcon; return (
        <motion.div
          key={s.id}
          initial={reduce ? false : { opacity: 0, rotateX: 55, y: 40 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          style={{ ["--hue" as string]: s.hue, transformOrigin: "50% 100%" }}
          className="stat-card group relative h-full"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
          }}
        >
          <div className="stat-inner relative flex h-full flex-col overflow-hidden rounded-2xl p-4">
            <span className="stat-shine" aria-hidden />
            <div className="flex items-start justify-between">
              <span className="relative grid h-9 w-9 place-items-center rounded-lg border" style={{ borderColor: `${s.hue}55`, background: `${s.hue}14`, color: s.hue }}>
                <span className="stat-ping absolute inset-0 rounded-xl" style={{ boxShadow: `0 0 0 1px ${s.hue}` }} aria-hidden />
                <Icon className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" aria-hidden />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest" style={{ borderColor: `${s.hue}44`, color: s.hue }}>
                <BadgeCheck className="h-3 w-3" aria-hidden /> {s.tag}
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight">
              <CountUp value={s.value} className="stat-value" />
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-mist-100">{s.label}</p>
            <p className="mt-auto pt-3 font-mono text-[9px] uppercase tracking-wider text-mist-500">{s.source}</p>
            <span className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100" style={{ background: `linear-gradient(90deg, ${s.hue}, transparent)` }} aria-hidden />
          </div>
        </motion.div>
      ); })}
    </div>
  );
}
