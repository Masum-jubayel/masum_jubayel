"use client";

import { DateBadge } from "@/components/ui/DateBadge";
import { SeenMotion } from "@/components/ui/SeenMotion";
import { motion, useReducedMotion } from "motion/react";
import { MapPin } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { formatMonth, type Job } from "@/content/profile";
import { tenure } from "./ExperienceTimeline";
import { CompanyLogo, CompanyName } from "@/components/ui/CompanyLogo";

const HUES = ["#3ee6ff", "#a78bfa", "#22ff88", "#fbbf24", "#f472b6", "#4f8cff"];
const ease = [0.22, 1, 0.36, 1] as const;

/** Animated summary numbers for the experience page (computed from the job list). */
export function ExperienceStats({ jobs }: { jobs: Job[] }) {
  const first = jobs.map((j) => j.start).filter(Boolean).sort()[0] ?? "";
  const since = Number(first.slice(0, 4)) || new Date().getFullYear();
  const countries = new Set(jobs.map((j) => (/(canada|bc|ab|alberta|british columbia)/i.test(j.location) ? "Canada" : j.location.split(",").pop()?.trim() || "")).filter(Boolean));
  const items = [
    { value: String(jobs.length), label: "Roles" },
    { value: `${new Date().getFullYear() - since}+`, label: `Years since ${since}` },
    { value: String(new Set(jobs.map((j) => j.company)).size), label: "Employers" },
    { value: String(countries.size), label: countries.size > 1 ? "Countries" : "Country" },
    { value: String(jobs.reduce((n, j) => n + (j.groups?.reduce((m, g) => m + g.items.length, 0) || j.highlights.length), 0)), label: "Responsibilities" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((s, i) => (
        <motion.div key={s.label} className="glass relative overflow-hidden p-4 text-center" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5, ease }}>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${HUES[i]}, transparent)` }} />
          <p className="font-display text-3xl font-semibold" style={{ color: HUES[i] }}><CountUp value={s.value} /></p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mist-400">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

/** Horizontal "career path" — each role is a stop on an animated line, newest first. */
export function CareerPath({ jobs }: { jobs: Job[] }) {
  const reduce = useReducedMotion();
  // Newest first: the current role leads the path.
  const list = [...jobs].sort((a, b) => Number(b.end === null) - Number(a.end === null) || b.start.localeCompare(a.start));
  return (
    <div className="glass relative overflow-x-auto p-5">
      <div className="relative flex min-w-max items-start gap-0 pt-3">
        <motion.span aria-hidden className="absolute left-4 right-4 top-[32px] h-0.5 origin-left rounded bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-300"
          initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease }} />
        {list.map((j, i) => {
          const hue = HUES[i % HUES.length];
          return (
            <motion.button type="button" key={j.id} onClick={() => document.getElementById(`job-card-${j.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="group relative w-48 shrink-0 px-2 text-center"
              initial={reduce ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 + i * 0.18, duration: 0.5, ease }}>
              {j.logo ? (
                <span className="relative mx-auto grid h-10 w-10 place-items-center rounded-full bg-white p-1 ring-2 transition-transform group-hover:scale-125" style={{ ["--tw-ring-color" as string]: hue, boxShadow: `0 0 14px ${hue}88` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={j.logo} alt="" className="h-full w-full rounded-full object-contain" />
                  {j.end === null && <span className="absolute inset-0 animate-ping rounded-full" style={{ border: `2px solid ${hue}` }} />}
                </span>
              ) : (
                <span className="relative mx-auto mt-[10px] grid h-5 w-5 place-items-center rounded-full border-2 bg-ink-950 transition-transform group-hover:scale-125" style={{ borderColor: hue, boxShadow: `0 0 12px ${hue}88` }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: hue }} />
                  {j.end === null && <span className="absolute inset-0 animate-ping rounded-full" style={{ border: `2px solid ${hue}` }} />}
                </span>
              )}
              <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: hue }}>{formatMonth(j.start)} → {j.end === null ? "Present" : formatMonth(j.end)}</p>
              <span className="mx-auto mt-1 inline-block rounded-full border border-white/15 bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-mist-200">{tenure(j.start, j.end)}</span>
              <p className="mt-1 text-xs font-semibold leading-snug text-mist-100 group-hover:text-white">{j.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-mist-400">{j.company}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/** Additional-roles cards: 3D flip-in, hover spotlight, collapsible duty groups. */
export function SecondaryRoles({ jobs }: { jobs: Job[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-5 md:grid-cols-3 [perspective:1200px]">
      {jobs.map((j, i) => {
        const hue = HUES[(i + 2) % HUES.length];
        return (
          <SeenMotion as="article" key={j.id} id={`job-card-${j.id}`}
            initial={reduce ? false : { opacity: 0, rotateY: -25, y: 30 }} whileInView={{ opacity: 1, rotateY: 0, y: 0 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ delay: i * 0.12, duration: 0.7, ease }}
            whileHover={reduce ? undefined : { y: -6 }}
            className="glass group relative flex h-full scroll-mt-28 flex-col overflow-hidden p-6"
            onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}>
            <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), ${hue}1f, transparent 60%)` }} />
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${hue}, transparent)` }} />
            <div className="relative"><DateBadge from={formatMonth(j.start)} to={formatMonth(j.end)} length={tenure(j.start, j.end)} hue={hue} size="sm" /></div>
            <div className="relative mt-3 flex items-center gap-3">
              <CompanyLogo name={j.company} logo={j.logo} website={j.website} hue={hue} className="h-11 w-11" />
              <div className="min-w-0">
                <h3 className="text-lg font-semibold leading-tight">{j.title}</h3>
                <CompanyName name={j.company} website={j.website} className="text-sm text-mist-300" />
              </div>
            </div>
            <p className="relative flex items-center gap-1 text-xs text-mist-500"><MapPin className="h-3 w-3" aria-hidden />{j.location}</p>
            <p className="relative mt-4 text-sm text-mist-400">{j.summary}</p>
            {j.groups?.length ? (
              <div className="relative mt-4 space-y-2">
                {j.groups.map((g, gi) => (
                  <details key={g.title} open={gi === 0} className="group/g rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/15">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 font-mono text-[11px] uppercase tracking-widest" style={{ color: hue }}>
                      {g.title}<span className="text-mist-500 transition-transform group-open/g:rotate-90">▸</span>
                    </summary>
                    <ul className="space-y-2 px-3 pb-3 text-sm text-mist-300">
                      {g.items.map((h) => <li key={h} className="flex gap-2"><span className="mt-2 h-1 w-2 shrink-0 rounded" style={{ background: `${hue}99` }} aria-hidden />{h}</li>)}
                    </ul>
                  </details>
                ))}
              </div>
            ) : (
              <ul className="relative mt-4 space-y-2 text-sm text-mist-300">
                {j.highlights.map((h) => <li key={h} className="flex gap-2"><span className="mt-2 h-1 w-2 shrink-0 rounded" style={{ background: `${hue}99` }} aria-hidden />{h}</li>)}
              </ul>
            )}
            {j.tags.length > 0 && <div className="relative mt-auto flex flex-wrap gap-1.5 pt-4">{j.tags.map((t) => <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-mist-400">{t}</span>)}</div>}
          </SeenMotion>
        );
      })}
    </div>
  );
}
