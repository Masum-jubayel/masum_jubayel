"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, FileText } from "lucide-react";
import type { SiteInfo } from "@/content/cms";
import { SocialButtons } from "@/components/ui/SocialButtons";

/** Centered "find me online" strip: social buttons + an animated "See my resume" button side by side. */
export function ConnectStrip({ info }: { info: SiteInfo }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative mx-auto mt-14 flex max-w-3xl flex-col items-center gap-5 overflow-hidden px-6 py-8 text-center"
    >
      <span aria-hidden className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
      <p className="eyebrow relative">Find me online</p>
      <div className="relative flex flex-wrap items-center justify-center gap-4">
        <SocialButtons info={info} size="lg" />
        <span className="hidden h-10 w-px bg-white/10 sm:block" aria-hidden />
        <Link href="/resume" className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl px-5 py-3 text-sm font-semibold text-ink-950">
          <span aria-hidden className={`absolute -inset-[200%] bg-[conic-gradient(from_0deg,#3ee6ff,#a78bfa,#22ff88,#fbbf24,#3ee6ff)] ${reduce ? "" : "animate-[spin_5s_linear_infinite]"}`} />
          <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-cyan-300 transition-colors group-hover:bg-white" />
          <motion.span className="relative" animate={reduce ? undefined : { rotate: [0, -8, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2 }}><FileText className="h-5 w-5" aria-hidden /></motion.span>
          <span className="relative">See my resume</span>
          <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </motion.div>
  );
}
