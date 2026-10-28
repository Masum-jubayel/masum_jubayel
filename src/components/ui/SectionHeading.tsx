"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** Section heading with a staggered entrance: the rule draws in, then eyebrow, title and lead text rise. */
export function SectionHeading({ index, eyebrow, title, children, className, as: As = "h2" }: { index?: string; eyebrow: string; title: ReactNode; children?: ReactNode; className?: string; as?: "h1" | "h2" }) {
  const reduce = useReducedMotion();
  const item = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] as const } });
  return (
    <div className={cn("max-w-3xl", className)}>
      <motion.p {...item(0)} className="eyebrow flex items-center gap-3">
        {index && <span className="text-mist-500">{index}</span>}
        <motion.span
          className="h-px w-8 origin-left bg-cyan-400/50"
          aria-hidden
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />
        {eyebrow}
      </motion.p>
      <motion.div {...item(0.08)}>
        <As className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.75rem]">{title}</As>
      </motion.div>
      {children && <motion.div {...item(0.16)} className="mt-4 text-base leading-relaxed text-mist-300 sm:text-lg">{children}</motion.div>}
    </div>
  );
}
