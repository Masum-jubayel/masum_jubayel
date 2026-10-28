"use client";

import { SeenMotion } from "@/components/ui/SeenMotion";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { DynamicIcon } from "@/components/ui/Icon";
import { CountUp } from "@/components/ui/CountUp";
import { LookImg } from "@/components/ui/LookMedia";

const ease = [0.22, 1, 0.36, 1] as const;
const hues = ["#3ee6ff", "#22ff88", "#a78bfa", "#fbbf24", "#f472b6"];

/** Portrait with a rotating neon ring and orbiting skill chips. */
export function AnimatedPortrait({ src, alt, chips, ring = true, focus = "top", shape = "rounded" }: { src: string; alt: string; chips: string[]; ring?: boolean; focus?: string; shape?: string }) {
  const reduce = useReducedMotion();
  const outer = shape === "circle" ? "rounded-full" : shape === "square" ? "rounded-xl" : "rounded-[2rem]";
  const inner = shape === "circle" ? "rounded-full" : shape === "square" ? "rounded-lg" : "rounded-[1.9rem]";
  return (
    <div className={`relative mx-auto w-full max-w-sm ${shape === "circle" ? "aspect-square" : "aspect-[4/5]"}`}>
      {ring && <div className={`absolute -inset-[3px] overflow-hidden ${outer}`} aria-hidden>
        <div className={`absolute -inset-[60%] bg-[conic-gradient(from_0deg,#3ee6ff,#a78bfa,#22ff88,#fbbf24,#3ee6ff)] ${reduce ? "" : "animate-[spin_8s_linear_infinite]"}`} />
      </div>}
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-violet-500/25 blur-2xl" aria-hidden />
      <div className={`relative h-full w-full overflow-hidden bg-ink-900 ${inner}`}>
        { }
        <LookImg src={src} alt={alt} className={`h-full w-full object-cover ${focus === "center" ? "object-center" : focus === "bottom" ? "object-bottom" : "object-top"}`} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" aria-hidden />
        {!reduce && <div className="pointer-events-none absolute inset-x-0 h-24 animate-[scanline_4s_linear_infinite] bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent" aria-hidden />}
      </div>
      {(() => {
        // Alternate left / right and spread each side evenly top-to-bottom, so any number of labels never overlap.
        const list = chips.map((c) => c.trim()).filter(Boolean).slice(0, 12);
        const left = list.filter((_, i) => i % 2 === 0), right = list.filter((_, i) => i % 2 === 1);
        const place = (side: string[], k: number) => `${((k + 1) / (side.length + 1)) * 100}%`;
        return list.map((c, i) => {
          const isLeft = i % 2 === 0, k = Math.floor(i / 2), side = isLeft ? left : right;
          const hue = hues[i % hues.length];
          return (
            <span key={`${c}-${i}`} className={`absolute z-10 -translate-y-1/2 ${isLeft ? "-left-3 sm:-left-6" : "-right-3 sm:-right-6"}`} style={{ top: place(side, k) }}>
              <motion.span className="block max-w-[9.5rem] truncate whitespace-nowrap rounded-full border bg-ink-950/90 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider shadow-lg backdrop-blur"
                style={{ color: hue, borderColor: `${hue}66`, boxShadow: `0 0 18px ${hue}33` }} title={c}
                initial={reduce ? false : { opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ y: { duration: 3 + (i % 4) * 0.6, repeat: Infinity, ease: "easeInOut" }, default: { delay: 0.3 + i * 0.12, duration: 0.5 } }}>
                {c}
              </motion.span>
            </span>
          );
        });
      })()}
    </div>
  );
}

/** Paragraphs that reveal word by word as they scroll into view. */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const paras = text.split(/\n\s*\n/).filter(Boolean);
  return (
    <div className={className}>
      {paras.map((p, pi) => (
        <motion.p key={pi} className={pi === 0 ? "text-xl leading-relaxed text-mist-100 sm:text-2xl" : "mt-5 text-base leading-relaxed text-mist-300 sm:text-lg"}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.012 } } }}>
          {p.split(" ").map((w, i) => (
            <motion.span key={i} className="inline-block whitespace-pre" variants={{ hidden: reduce ? {} : { opacity: 0, y: 8, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } }} transition={{ duration: 0.4, ease }}>{w + " "}</motion.span>
          ))}
        </motion.p>
      ))}
    </div>
  );
}

/** Animated "at a glance" numbers. */
export function GlanceStats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((s, i) => (
        <motion.div key={s.label} className="glass glass-hover relative overflow-hidden p-4 text-center"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5, ease }}>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${hues[i % hues.length]}, transparent)` }} aria-hidden />
          <p className="font-display text-3xl font-semibold" style={{ color: hues[i % hues.length] }}><CountUp value={s.value} /></p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mist-400">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

/** The three focus areas — tilt + glow cards with animated icons. */
export function FocusCards({ items }: { items: { title: string; body: string; tags: string; icon: string; link: string }[] }) {
  const reduce = useReducedMotion();
  const safe = (l: string) => (/^(\/|https?:\/\/)/.test(l) ? l : "");
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((f, i) => {
        const hue = hues[i % hues.length];
        const href = safe(f.link);
        const body = (
          <>
            <span className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-50" style={{ background: hue }} aria-hidden />
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${hue}, transparent)` }} aria-hidden />
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl border" style={{ color: hue, borderColor: `${hue}55`, background: `${hue}14` }}>
              <span className="absolute inset-0 animate-ping rounded-2xl opacity-20" style={{ border: `1px solid ${hue}` }} aria-hidden />
              <DynamicIcon name={f.icon} className="h-6 w-6 transition-transform duration-500 group-hover:rotate-[-10deg] group-hover:scale-110" />
            </span>
            <h3 className="relative mt-5 text-xl font-semibold">{f.title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-mist-300">{f.body}</p>
            <div className="relative mt-4 flex flex-wrap gap-1.5">
              {f.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-mist-400">{t}</span>)}
            </div>
            {href && <span className="relative mt-5 inline-flex items-center gap-1 text-sm" style={{ color: hue }}>See the work <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden /></span>}
          </>
        );
        return (
          <SeenMotion key={f.title} initial={reduce ? false : { opacity: 0, y: 30, rotateX: 10 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6, ease }} whileHover={reduce ? undefined : { y: -6 }} style={{ perspective: 800 }}>
            {href ? <Link href={href} className="glass group relative block h-full overflow-hidden p-6">{body}</Link> : <div className="glass group relative h-full overflow-hidden p-6">{body}</div>}
          </SeenMotion>
        );
      })}
    </div>
  );
}
