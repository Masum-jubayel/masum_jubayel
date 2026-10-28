"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, Film, Images, Sparkles } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { LookImg, LookVideo } from "@/components/ui/LookMedia";
import type { GalleryItem } from "@/content/gallery";
import { isVideo } from "@/lib/media";

const ease = [0.22, 1, 0.36, 1] as const;

/** Left side of the Gallery hero: animated headline, live counters and two calls to action. */
export function GalleryHeroIntro({ eyebrow, title, accent, text, stats, cta1, cta2, counts }: {
  eyebrow: string; title: string; accent: string; text: string; stats: boolean; cta1: string; cta2: string;
  counts: { photos: number; videos: number; memories: number };
}) {
  const reduce = useReducedMotion();
  const words = (line: string, cls: string, base: number) => line.split(" ").filter(Boolean).map((w, i) => (
    <motion.span key={w + i} className={`inline-block whitespace-pre ${cls}`}
      initial={reduce ? false : { opacity: 0, y: 40, rotateX: -70, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      transition={{ delay: base + i * 0.09, duration: 0.8, ease }}>{w + " "}</motion.span>
  ));
  const chips = [
    { icon: Images, label: "Photos", value: counts.photos, hue: "#3ee6ff" },
    { icon: Film, label: "Videos", value: counts.videos, hue: "#fbbf24" },
    { icon: Sparkles, label: "Memories", value: counts.memories, hue: "#a78bfa" },
  ];
  return (
    <div className="relative z-10 py-10">
      <motion.p className="eyebrow flex items-center gap-3" initial={reduce ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <motion.span className="h-px bg-cyan-400/60" initial={{ width: 0 }} animate={{ width: 32 }} transition={{ delay: 0.2, duration: 0.8, ease }} aria-hidden />{eyebrow}
      </motion.p>
      <h1 className="mt-5 text-5xl font-semibold leading-[0.95] [perspective:600px] sm:text-7xl">
        {words(title, "", 0.15)}
        {accent && <><br /><span className="text-gradient text-shimmer">{words(accent, "", 0.35)}</span></>}
      </h1>
      <motion.p className="mt-6 max-w-md text-mist-300" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>{text}</motion.p>

      {stats && (
        <div className="mt-7 flex flex-wrap gap-2.5">
          {chips.map((c, i) => (
            <motion.span key={c.label} className="relative flex items-center gap-2.5 overflow-hidden rounded-2xl border bg-ink-950/60 px-3.5 py-2 backdrop-blur"
              style={{ borderColor: `${c.hue}44`, boxShadow: `0 0 22px ${c.hue}1f` }}
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.85 + i * 0.12, type: "spring", stiffness: 240, damping: 18 }}
              whileHover={reduce ? undefined : { y: -3 }}>
              {!reduce && <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 animate-[date-sweep_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />}
              <c.icon className="h-4 w-4" style={{ color: c.hue }} aria-hidden />
              <span className="font-display text-xl font-semibold" style={{ color: c.hue }}><CountUp value={String(c.value)} /></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-mist-400">{c.label}</span>
            </motion.span>
          ))}
        </div>
      )}

      <motion.div className="mt-8 flex flex-wrap items-center gap-3" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }}>
        {cta1 && (
          <a href="#memories" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-ink-950 shadow-[0_0_30px_-6px_rgba(62,230,255,0.8)] transition hover:bg-cyan-200">
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden />
            {cta1} <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
          </a>
        )}
        {cta2 && (
          <a href="#archive" className="group inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm text-mist-100 transition hover:border-cyan-300/60 hover:text-cyan-200">
            {cta2} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </a>
        )}
      </motion.div>
    </div>
  );
}

/** Endless film strip of the latest photos and videos (pauses on hover). */
export function FilmStrip({ items }: { items: GalleryItem[] }) {
  const reduce = useReducedMotion();
  const list = items.filter((x) => x.src).slice(0, 14);
  if (list.length < 3) return null;
  const loop = [...list, ...list];
  const holes = <span className="flex justify-between px-1" aria-hidden>{Array.from({ length: 18 }, (_, i) => <span key={i} className="h-1.5 w-2.5 rounded-sm bg-ink-950" />)}</span>;
  return (
    <motion.div className="relative -rotate-1 border-y border-white/10 bg-[#0b0f18] py-1.5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
      initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }} aria-label="Latest photos and videos">
      <div className={`group flex w-max gap-3 ${reduce ? "" : "animate-[ticker_60s_linear_infinite] hover:[animation-play-state:paused]"}`}>
        {loop.map((it, i) => (
          <a key={it.id + i} href="#archive" className="relative w-44 shrink-0 overflow-hidden rounded-md bg-ink-900 sm:w-56" aria-hidden={i >= list.length} tabIndex={i >= list.length ? -1 : 0} title={it.title}>
            <span className="block bg-[#11161f] py-1">{holes}</span>
            <span className="relative block aspect-[16/10] overflow-hidden">
              {isVideo(it.src) || it.kind === "video"
                ? <LookVideo src={it.src} poster={it.poster || undefined} muted loop playsInline autoPlay preload="metadata" className="h-full w-full object-cover" />
                : <LookImg src={it.src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 hover:scale-110" />}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" aria-hidden />
              <span className="absolute inset-x-2 bottom-1.5 truncate font-mono text-[10px] uppercase tracking-wider text-mist-200">{it.kind === "video" ? "▶ " : ""}{it.title}</span>
            </span>
            <span className="block bg-[#11161f] py-1">{holes}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
