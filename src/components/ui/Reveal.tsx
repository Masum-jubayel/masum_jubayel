"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Fade/slide in on scroll. `flip` adds a 3D tilt-in (cards).
 * Safety net: content always becomes visible after a short delay, so a section can never stay blank
 * (e.g. when the page is embedded somewhere that doesn't report scrolling).
 */
export function Reveal({ children, delay = 0, y = 18, className, flip = false }: { children: ReactNode; delay?: number; y?: number; className?: string; flip?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const [fallback, setFallback] = useState(false);
  useEffect(() => { const t = setTimeout(() => setFallback(true), 2500); return () => clearTimeout(t); }, []);
  const show = inView || fallback;
  const hidden = flip ? { opacity: 0, y: y + 12, rotateX: 18, scale: 0.97 } : { opacity: 0, y };
  const visible = flip ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 1, y: 0 };
  return (
    <motion.div
      ref={ref}
      className={className}
      style={flip ? { perspective: 1000 } : undefined}
      initial={reduce ? false : hidden}
      animate={show ? visible : undefined}
      transition={{ duration: flip ? 0.75 : 0.6, delay: inView ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
