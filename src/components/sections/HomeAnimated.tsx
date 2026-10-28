"use client";

import { SeenMotion } from "@/components/ui/SeenMotion";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import type { SkillGroup } from "@/content/skills";
import { DynamicIcon } from "@/components/ui/Icon";

const ease = [0.22, 1, 0.36, 1] as const;
const groupHue: Record<string, string> = { web: "#a78bfa", data: "#38bdf8", poc: "#22ff88", networking: "#3ee6ff", infrastructure: "#4f8cff", business: "#fbbf24", security: "#f472b6", languages: "#2dd4bf" };
const hueOf = (id: string, i: number) => groupHue[id] ?? ["#3ee6ff", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"][i % 5];

/** Compact animated bars — one per skill domain — to sit under the "What I do" heading. */
export function DomainBars({ groups }: { groups: SkillGroup[] }) {
  const max = Math.max(...groups.map((g) => g.skills.length), 1);
  return (
    <ul className="mt-8 space-y-3" aria-label="Skills per domain">
      {groups.map((g, i) => {
        const hue = hueOf(g.id, i);
        return (
          <li key={g.id}>
            <Link href={`/skills#${g.id}`} className="group block">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-mist-300 group-hover:text-mist-100"><DynamicIcon name={g.icon} className="h-3.5 w-3.5" />{g.title}</span>
                <span className="font-mono text-mist-500">{g.skills.length}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${hue}, ${hue}55)` }}
                  initial={{ width: 0 }} whileInView={{ width: `${(g.skills.length / max) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1 + i * 0.08, ease }} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Domain cards with flip-in, hue glow, cursor spotlight and an animated icon. Last card spans two columns. */
export function DomainCards({ groups }: { groups: SkillGroup[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-4 sm:grid-cols-2 [perspective:1200px]">
      {groups.map((g, i) => {
        const hue = hueOf(g.id, i);
        const wide = groups.length % 2 === 1 && i === groups.length - 1;
        return (
          <SeenMotion key={g.id} className={wide ? "sm:col-span-2" : undefined}
            initial={reduce ? false : { opacity: 0, rotateX: 25, y: 30 }} whileInView={{ opacity: 1, rotateX: 0, y: 0 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease }}>
            <Link href={`/skills#${g.id}`} className="shine glass group relative block h-full overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1"
              onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}>
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), ${hue}22, transparent 60%)` }} />
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${hue}, transparent)` }} />
              <div className="relative flex items-center justify-between">
                <span className="relative grid h-11 w-11 place-items-center rounded-xl border" style={{ color: hue, borderColor: `${hue}55`, background: `${hue}12` }}>
                  <span className="absolute inset-0 animate-ping rounded-xl opacity-15" style={{ border: `1px solid ${hue}` }} aria-hidden />
                  <DynamicIcon name={g.icon} className="h-5 w-5 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">{g.skills.length} skills</span>
              </div>
              <h3 className="relative mt-4 text-base font-semibold">{g.title}</h3>
              <p className="relative mt-2 text-sm text-mist-400">{g.blurb}</p>
              <span className="relative mt-3 inline-flex items-center gap-1 text-xs opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" style={{ color: hue }}>Explore <ArrowRight className="h-3.5 w-3.5" aria-hidden /></span>
            </Link>
          </SeenMotion>
        );
      })}
    </div>
  );
}

/** "Specialization in progress" — animated shield, scanning rings and a journey line of security milestones. */
export function SecurityJourney({ href }: { href: string }) {
  const reduce = useReducedMotion();
  const steps = [
    { label: "M.A.S. Computer Security & Forensics", note: "Fairleigh Dickinson · 2025", state: "done" },
    { label: "B.Sc. CSE", note: "Metropolitan University · 2019", state: "done" },
    { label: "CCNA — ACLs, NAT, secure access", note: "Cisco Networking Academy", state: "done" },
    { label: "Intro to Cybersecurity", note: "Cisco · 2020", state: "done" },
    { label: "Security home lab", note: "Segmentation · monitoring · forensics", state: "active" },
    { label: "Security role", note: "Next step", state: "next" },
  ] as const;
  return (
    <motion.div className="glass relative overflow-hidden p-6 sm:p-10" initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      {!reduce && <div aria-hidden className="cyber-scan pointer-events-none absolute inset-0 opacity-60" />}

      <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr]">
        {/* Animated shield */}
        <div className="relative mx-auto grid h-40 w-40 place-items-center">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} aria-hidden className="absolute rounded-full border border-violet-400/40" style={{ inset: i * -14 }}
              animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.15, 0.5] }} transition={{ duration: 2.6, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" }} />
          ))}
          <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-300/40" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
          <motion.span aria-hidden className="absolute inset-3 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(167,139,250,0.35), transparent 30%)" }} animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
          <span className="relative grid h-24 w-24 place-items-center rounded-3xl border border-violet-400/40 bg-ink-950/90 text-violet-300 shadow-[0_0_40px_rgba(139,92,246,0.35)]">
            <ShieldCheck className="h-12 w-12" aria-hidden />
            <motion.span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-emerald-400 text-ink-950" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", delay: 0.8 }}><Lock className="h-3.5 w-3.5" aria-hidden /></motion.span>
          </span>
        </div>

        <div>
          <p className="eyebrow text-violet-400">Specialization in progress</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">From secure infrastructure to <span className="text-gradient">cybersecurity</span></h2>
          <p className="mt-3 max-w-2xl text-mist-300">My master’s in Computer Security and Forensic Administration grounds my next step. I’m building practical security skills through documented labs on segmentation, monitoring and forensics.</p>

          {/* Journey line */}
          <ol className="relative mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <motion.span aria-hidden className="absolute left-0 right-0 top-[13px] hidden h-0.5 origin-left rounded bg-gradient-to-r from-emerald-400 via-violet-400 to-white/10 lg:block"
              initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease }} />
            {steps.map((s, i) => (
              <motion.li key={s.label} className="relative" initial={reduce ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }}>
                <span className={`relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 ${s.state === "done" ? "border-emerald-400 bg-emerald-400/15 text-emerald-300" : s.state === "active" ? "border-violet-400 bg-violet-500/20 text-violet-200" : "border-white/20 bg-ink-950 text-mist-500"}`}>
                  {s.state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden /> : s.state === "active" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  {s.state === "active" && <span className="absolute inset-0 animate-ping rounded-full border-2 border-violet-400" aria-hidden />}
                </span>
                <p className={`mt-2 text-xs font-semibold leading-snug ${s.state === "next" ? "text-mist-400" : "text-mist-100"}`}>{s.label}</p>
                <p className="text-[11px] leading-snug text-mist-500">{s.note}</p>
              </motion.li>
            ))}
          </ol>

          <Link href={href} className="btn-secondary mt-7">Explore security labs <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </div>
    </motion.div>
  );
}
