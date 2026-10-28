"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Lock } from "lucide-react";

const GLYPHS = "01ABCDEF#$%&*<>/\\{}[]=+";
const LOG = [
  "> scanning ports ............ 22 · 443 · 8443",
  "> verifying certificate ..... OK",
  "> negotiating TLS 1.3 ....... OK",
  "> handshake complete · secure channel established",
];

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
      ctx.fillStyle = "rgba(6, 11, 26, 0.18)";
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

export function CyberCTA({ title: HEADLINE, text }: { title: string; text: string }) {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [lines, setLines] = useState(reduce ? LOG.length : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    const id = setInterval(() => { i++; setLines(i); if (i >= LOG.length) clearInterval(id); }, 650);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const secured = lines >= LOG.length;

  return (
    <div ref={ref} className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-ink-900 p-8 text-center sm:p-14">
      <DataRain reduce={reduce} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,11,26,0.92)_30%,rgba(6,11,26,0.55)_75%)]" aria-hidden />
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
        <p className="mx-auto mt-4 max-w-xl text-mist-300">{text}</p>

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
