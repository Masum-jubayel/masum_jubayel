"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Thin glowing bar at the top of the window that fills as you scroll the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  return <motion.div aria-hidden className="page-progress fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-cyan-300 via-violet-400 to-emerald-300 shadow-[0_0_10px_rgba(62,230,255,0.8)]" style={{ scaleX: x }} />;
}

/** Infinite two-row keyword band; rows run in opposite directions and speed up with scroll. */
export function KeywordMarquee({ words }: { words: string[] }) {
  const reduce = useReducedMotion();
  const half = Math.ceil(words.length / 2);
  const rows = [words.slice(0, half), words.slice(half)];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const skew = useTransform(scrollYProgress, [0, 0.5, 1], [-3, 0, 3]);
  return (
    <motion.div ref={ref} style={{ skewY: reduce ? 0 : skew }} className="relative my-6 py-6" aria-hidden>
      <span className="band-line top-0" /><span className="band-line band-line-rev bottom-0" />
      <div className="space-y-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className={`flex w-max gap-8 ${reduce ? "" : r === 0 ? "animate-[ticker_70s_linear_infinite]" : "animate-[ticker_80s_linear_infinite_reverse]"}`}>
          {[...row, ...row].map((w, i) => (
            <span key={i} className={`flex items-center gap-8 whitespace-nowrap font-display text-2xl font-semibold sm:text-3xl ${i % 3 === 0 ? "text-gradient" : "text-transparent [-webkit-text-stroke:1px_rgba(160,190,255,0.35)]"}`}>
              {w}<span className="h-2 w-2 rounded-full bg-cyan-400/60 shadow-[0_0_10px_#3ee6ff]" />
            </span>
          ))}
        </div>
      ))}
      </div>
    </motion.div>
  );
}

/** Glowing divider with a packet that travels across when it scrolls into view. */
export function SectionDivider() {
  const reduce = useReducedMotion();
  return (
    <div className="container-x" aria-hidden>
      <div className="relative h-px overflow-visible">
        <motion.div className="absolute inset-0 origin-center bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease }} />
        {!reduce && (
          <motion.span className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-cyan-300 shadow-[0_0_14px_4px_rgba(62,230,255,0.6)]"
            initial={{ left: "0%", opacity: 0 }} whileInView={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }} viewport={{ once: false, amount: 1 }} transition={{ duration: 2.4, ease: "easeInOut" }} />
        )}
      </div>
    </div>
  );
}

/** Cards rise with a 3D tilt, then follow the cursor gently. */
export function TiltReveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 }), sry = useSpring(ry, { stiffness: 200, damping: 20 });
  return (
    <motion.div className={className} style={{ perspective: 1000 }}
      initial={reduce ? false : { opacity: 0, y: 40, rotateX: 18 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: "0px 0px -60px 0px" }} transition={{ duration: 0.8, delay, ease }}>
      <motion.div className="h-full" style={reduce ? undefined : { rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => { if (reduce) return; const r = e.currentTarget.getBoundingClientRect(); ry.set(((e.clientX - r.left) / r.width - 0.5) * 8); rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8); }}
        onPointerLeave={() => { rx.set(0); ry.set(0); }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Content that drifts slightly as the page scrolls (depth effect). */
export function Parallax({ children, speed = 40, className }: { children: ReactNode; speed?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>{children}</motion.div>;
}
