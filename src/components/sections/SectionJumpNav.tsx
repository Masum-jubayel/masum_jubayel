"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Award, BookOpenText, Flag, GraduationCap, Trophy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { degrees: GraduationCap, certs: Award, research: BookOpenText, awards: Trophy, participation: Flag };

/** Sticky, animated section index with scroll-spy (used on the Achievements page). */
export function SectionJumpNav({ items }: { items: { id: string; label: string; count: number }[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setActive(vis.target.id);
    }, { rootMargin: "-30% 0px -60% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <div className="sticky top-16 z-30 -mx-4 bg-ink-950/80 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:border-white/[0.06]">
      <nav aria-label="Achievements sections" className="flex gap-2 overflow-x-auto">
        {items.map((it, i) => {
          const Icon = icons[it.id] ?? Award;
          const on = active === it.id;
          return (
            <motion.button key={it.id} type="button" onClick={() => document.getElementById(it.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              initial={reduce ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={cn("relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-colors", on ? "text-cyan-100" : "text-mist-400 hover:text-mist-100")} aria-current={on ? "true" : undefined}>
              {on && <motion.span layoutId="jump-pill" className="absolute inset-0 rounded-xl border border-cyan-400/40 bg-cyan-400/10" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <Icon className="relative h-4 w-4" aria-hidden />
              <span className="relative">{it.label}</span>
              <span className="relative rounded-full bg-white/10 px-1.5 font-mono text-[10px]">{it.count}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
