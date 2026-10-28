"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const GLYPHS = "01#$%&*<>/{}=+ABCDEFX";

/**
 * Animates a stat value when it scrolls into view: numbers count up ("20+"),
 * text values decrypt from random glyphs ("CCNA").
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const isNum = !!match;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [text, setText] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || reduce || started.current) return;
    started.current = true;
    const t0 = performance.now();
    const dur = isNum ? 1600 : 1100;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      if (isNum) {
        setText(`${Math.round(target * (1 - Math.pow(1 - p, 3)))}${suffix}`);
      } else {
        const shown = Math.floor(p * value.length);
        setText(value.split("").map((ch, i) => (i < shown || ch === " " || ch === "." ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""));
      }
      if (p < 1) raf = requestAnimationFrame(tick); else setText(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, isNum, target, suffix, value]);

  return <span ref={ref} className={className} aria-label={value}>{text}</span>;
}
