"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { ReactNode, PointerEvent } from "react";
import { cn } from "@/lib/utils";

export function TiltCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const glowX = useTransform(x, (v) => `${v * 100}%`);
  const glowY = useTransform(y, (v) => `${v * 100}%`);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { x.set(0.5); y.set(0.5); };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn("group relative will-change-transform", className)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: useTransform([glowX, glowY], ([gx, gy]) => `radial-gradient(400px circle at ${gx} ${gy}, rgba(62,230,255,0.10), transparent 45%)`) }}
      />
      {children}
    </motion.div>
  );
}
