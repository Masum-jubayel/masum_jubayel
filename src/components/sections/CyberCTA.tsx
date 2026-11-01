"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Bot, CheckCircle2, Code2, Database, Fingerprint, ListChecks, Lock, Network, Server, ShieldCheck, Workflow, type LucideIcon } from "lucide-react";

const GLYPHS = "01ABCDEF#$%&*<>/\\{}[]=+";
const DEFAULT_LOG = [
  "> scanning perimeter ........ 22 · 443 · 8443",
  "> hardening ACLs & VLANs ..... OK",
  "> deploying web stack ........ OK",
  "> AI agent online · secure channel established",
];
const PILLAR_ICONS: [RegExp, LucideIcon, string][] = [
  [/secur|cyber|forens/i, ShieldCheck, "#22ff88"], [/network|cisco|lan/i, Network, "#3ee6ff"],
  [/web|code|engineer/i, Code2, "#a78bfa"], [/infra|server|it /i, Server, "#fbbf24"], [/ai|agent|automat/i, Bot, "#f472b6"],
];
const pillarStyle = (t: string): [LucideIcon, string] => { const m = PILLAR_ICONS.find(([r]) => r.test(t)); return m ? [m[1], m[2]] : [ShieldCheck, "#3ee6ff"]; };

/** Hex/binary rain behind the card. Paused off-screen; one static frame for reduced motion. */
function DataRain({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cols: number[] = [];
    let raf = 0, visible = true, last = 0;
    const size = 14;
    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = r.width * dpr; c.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Array.from({ length: Math.ceil(r.width / size) }, () => Math.random() * -40);
    };
    const draw = (t: number) => {
      raf = visible && !reduce ? requestAnimationFrame(draw) : 0;
      if (t - last < 55) return;
      last = t;
      const r = c.getBoundingClientRect();
      const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink-900").trim().split(/\s+/).join(",") || "6,11,26";
      ctx.fillStyle = `rgba(${ink}, 0.18)`;
      ctx.fillRect(0, 0, r.width, r.height);
      ctx.font = `${size - 2}px "JetBrains Mono Variable", monospace`;
      cols.forEach((y, i) => {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillStyle = Math.random() < 0.06 ? "rgba(167,139,250,0.85)" : "rgba(62,230,255,0.55)";
        ctx.fillText(ch, i * size, y * size);
        cols[i] = y * size > r.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };
    resize();
    if (reduce) {
      for (let k = 0; k < 40; k++) draw(k * 60 + 60);
    } else raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !reduce) raf = requestAnimationFrame(draw);
    });
    io.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [reduce]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-40" aria-hidden />;
}

/** Text that "decrypts" from random glyphs into the real headline. */
function Decrypt({ text, run }: { text: string; run: boolean }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const total = 28;
    const id = setInterval(() => {
      frame++;
      const revealed = Math.floor((frame / total) * text.length);
      setOut(text.split("").map((ch, i) => (ch === " " || i < revealed ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""));
      if (frame >= total) { clearInterval(id); setOut(text); }
    }, 40);
    return () => clearInterval(id);
  }, [run, text]);
  return <span aria-hidden>{out}</span>;
}

type AiDeck = { title?: string; text?: string; steps?: string[]; guards?: string[] };
const STEP_ICONS: LucideIcon[] = [Workflow, Database, Bot, ListChecks, Fingerprint];

/** The AI part, set apart: a supervised control loop where the last step is always a human sign-off. */
function AiControlDeck({ ai, inView, reduce }: { ai: AiDeck; inView: boolean; reduce: boolean }) {
  const steps = (ai.steps ?? []).filter(Boolean).slice(0, 6);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!inView || reduce || steps.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 1600);
    return () => clearInterval(id);
  }, [inView, reduce, steps.length]);
  if (!steps.length && !ai.text) return null;
  return (
    <motion.div className="relative mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-300/[0.07] via-ink-950/80 to-cyan-400/[0.06] p-5 text-left backdrop-blur sm:p-6"
      initial={reduce ? false : { opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.55, duration: 0.6 }}>
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl" aria-hidden />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-amber-200"><Bot className="h-4 w-4" aria-hidden /> {ai.title}</p>
          {ai.text && <p className="mt-2 text-sm leading-relaxed text-mist-300">{ai.text}</p>}
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-emerald-300">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" /><span className="relative h-2 w-2 rounded-full bg-emerald-300" /></span>
          Supervised autonomy
        </span>
      </div>
      {steps.length > 0 && (
        <ol className="relative mt-5 grid gap-2 sm:grid-cols-5" aria-label="AI control loop">
          {steps.map((st, i) => {
            const [name, desc = ""] = st.split("|").map((x) => x.trim());
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            const last = i === steps.length - 1;
            const on = active === i;
            return (
              <li key={st} className={`relative rounded-xl border p-3 transition-all duration-500 ${on ? (last ? "border-amber-300/70 bg-amber-300/10 shadow-[0_0_24px_-6px_rgba(252,211,77,0.6)]" : "border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_24px_-8px_rgba(62,230,255,0.6)]") : "border-white/10 bg-ink-950/60"}`}>
                <span className="flex items-center gap-2">
                  <span className={`grid h-7 w-7 place-items-center rounded-lg ${last ? "bg-amber-300/15 text-amber-200" : "bg-cyan-300/10 text-cyan-200"}`}><Icon className="h-4 w-4" aria-hidden /></span>
                  <span className="font-mono text-[10px] text-mist-500">0{i + 1}</span>
                </span>
                <p className={`mt-2 text-sm font-semibold ${last ? "text-amber-100" : "text-mist-100"}`}>{name}</p>
                {desc && <p className="mt-0.5 text-[11.5px] leading-snug text-mist-400">{desc}</p>}
                {!last && <span className="absolute -right-2 top-1/2 hidden h-px w-3 bg-gradient-to-r from-cyan-300/60 to-transparent sm:block" aria-hidden />}
              </li>
            );
          })}
        </ol>
      )}
      {(ai.guards ?? []).length > 0 && (
        <ul className="relative mt-4 flex flex-wrap gap-2">
          {(ai.guards ?? []).map((g) => (
            <li key={g} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/60 px-2.5 py-1 text-[11.5px] text-mist-200"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" aria-hidden />{g}</li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export function CyberCTA({ title: HEADLINE, accent, text, pillars = [], log, ai }: { title: string; accent?: string; text: string; pillars?: string[]; log?: string[]; ai?: AiDeck }) {
  const LOG = log && log.length ? log : DEFAULT_LOG;
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [lines, setLines] = useState(reduce ? LOG.length : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    const id = setInterval(() => { i++; setLines(i); if (i >= LOG.length) clearInterval(id); }, 650);
    return () => clearInterval(id);
  }, [inView, reduce, LOG.length]);

  const secured = lines >= LOG.length;

  return (
    <div ref={ref} className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-ink-900 p-8 text-center sm:p-14">
      <DataRain reduce={reduce} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--ink-900)/0.92)_30%,rgb(var(--ink-900)/0.55)_75%)]" aria-hidden />
      {!reduce && <div className="cyber-scan pointer-events-none absolute inset-0" aria-hidden />}
      {/* corner brackets */}
      {["left-4 top-4 border-l border-t", "right-4 top-4 border-r border-t", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((c) => (
        <span key={c} className={`absolute h-6 w-6 border-cyan-400/60 ${c}`} aria-hidden />
      ))}

      <div className="relative">
        <motion.span
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : undefined}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl border ${secured ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"} transition-colors duration-500`}
        >
          <Lock className="h-6 w-6" aria-hidden />
        </motion.span>
        <p className="eyebrow mt-5">Open to opportunities</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold sm:text-4xl">
          <span className="sr-only">{HEADLINE}</span>
          <Decrypt text={HEADLINE} run={inView && !reduce} />
        </h2>
        {accent && (
          <motion.p className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-lg font-semibold sm:text-xl"
            initial={reduce ? false : { opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 1.2, duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-widest text-amber-200"><Bot className="h-3.5 w-3.5" aria-hidden /> AI</span>
            <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-cyan-300 bg-clip-text text-transparent">{accent}</span>
          </motion.p>
        )}
        <p className="mx-auto mt-4 max-w-2xl text-mist-300">{text}</p>

        {pillars.length > 0 && (
          <ul className="mx-auto mt-7 grid max-w-4xl grid-cols-2 gap-2.5 text-left lg:grid-cols-4">
            {pillars.map((p, i) => {
              const [title, desc = ""] = p.split("|").map((x) => x.trim());
              const [Icon, hue] = pillarStyle(title);
              return (
                <motion.li key={p} className="group relative overflow-hidden rounded-2xl border bg-ink-950/70 p-3.5 backdrop-blur"
                  style={{ borderColor: `${hue}40` }}
                  initial={reduce ? false : { opacity: 0, y: 18, scale: 0.94 }} animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
                  transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 220, damping: 18 }} whileHover={reduce ? undefined : { y: -4 }}>
                  <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-60" style={{ background: hue }} aria-hidden />
                  <span className="relative grid h-9 w-9 place-items-center rounded-xl border" style={{ color: hue, borderColor: `${hue}55`, background: `${hue}14` }}><Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden /></span>
                  <p className="relative mt-2.5 text-sm font-semibold text-mist-100">{title}</p>
                  {desc && <p className="relative mt-0.5 text-[11.5px] leading-snug text-mist-400">{desc}</p>}
                </motion.li>
              );
            })}
          </ul>
        )}

        {ai && <AiControlDeck ai={ai} inView={inView} reduce={reduce} />}

        <div className="mx-auto mt-6 max-w-md rounded-xl border border-white/10 bg-ink-950/80 p-4 text-left font-mono text-[11px] leading-relaxed sm:text-xs" aria-hidden>
          {LOG.slice(0, lines).map((l, i) => (
            <p key={l} className={i === LOG.length - 1 ? "text-emerald-300" : "text-cyan-200/80"}>{l}</p>
          ))}
          {!secured && <span className="inline-block h-3.5 w-2 animate-pulseDot bg-cyan-300 align-middle" />}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-primary">Contact Me <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <Link href="/resume" className="btn-secondary">View Resume</Link>
        </div>
      </div>
    </div>
  );
}
