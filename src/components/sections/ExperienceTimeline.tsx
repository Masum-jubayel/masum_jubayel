"use client";

import { DateBadge } from "@/components/ui/DateBadge";
import { SeenMotion } from "@/components/ui/SeenMotion";
import { useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence, useScroll, useSpring } from "motion/react";
import { Briefcase, ChevronDown, MapPin } from "lucide-react";
import { formatMonth, type Job } from "@/content/profile";
import { CompanyLogo, CompanyName } from "@/components/ui/CompanyLogo";

const HUES = ["#3ee6ff", "#a78bfa", "#22ff88", "#fbbf24", "#f472b6", "#4f8cff"];

/** "2 yrs 3 mos" between YYYY-MM and YYYY-MM (or now). */
export function tenure(start: string, end: string | null) {
  const [sy, sm] = start.split("-").map(Number);
  const now = new Date();
  const [ey, em] = end ? end.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  if (!sy || !ey) return "";
  const months = Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
  const y = Math.floor(months / 12), m = months % 12;
  return [y ? `${y} yr${y > 1 ? "s" : ""}` : "", m ? `${m} mo${m > 1 ? "s" : ""}` : ""].filter(Boolean).join(" ");
}

/** Whole months between YYYY-MM and YYYY-MM (or now), counting both ends. */
export function monthCount(start: string, end: string | null) {
  const [sy, sm] = start.split("-").map(Number);
  const now = new Date();
  const [ey, em] = end ? end.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  if (!sy || !ey) return 0;
  return Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
}

export function ExperienceTimeline({ jobs, compact = false, openFirst = false }: { jobs: Job[]; compact?: boolean; openFirst?: boolean }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(compact || !openFirst ? null : jobs[0]?.id ?? null);
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <ol ref={ref} className="relative space-y-6 pl-6 sm:pl-10">
      {/* Track + scroll-drawn beam */}
      <span aria-hidden className="absolute left-0 top-0 h-full w-px bg-white/10" />
      <motion.span aria-hidden style={{ scaleY: reduce ? 1 : progress }} className="absolute left-0 top-0 h-full w-px origin-top bg-gradient-to-b from-cyan-300 via-violet-400 to-emerald-300 shadow-[0_0_12px_rgba(62,230,255,0.6)]" />

      {jobs.map((job, i) => {
        const isOpen = open === job.id;
        const hue = HUES[i % HUES.length];
        const current = job.end === null;
        return (
          <SeenMotion
            as="li"
            key={job.id}
            id={`job-card-${job.id}`}
            initial={reduce ? false : { opacity: 0, x: -40, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative scroll-mt-28"
          >
            {/* Node */}
            <motion.span aria-hidden className="absolute -left-[31px] top-7 grid h-4 w-4 place-items-center rounded-full border-2 bg-ink-950 sm:-left-[47px]"
              style={{ borderColor: hue, boxShadow: `0 0 14px ${hue}88` }}
              initial={reduce ? false : { scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.2 }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: hue }} />
              {current && <span className="absolute inset-0 animate-ping rounded-full" style={{ border: `2px solid ${hue}` }} />}
            </motion.span>

            <article
              className="glass group relative cursor-pointer overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 sm:p-6"
              style={isOpen ? { boxShadow: `0 0 0 1px ${hue}55, 0 20px 60px -25px ${hue}88` } : undefined}
              onClick={(e) => { if ((e.target as HTMLElement).closest("a,button,input,select,textarea") || (window.getSelection()?.toString() ?? "").length > 0) return; setOpen(isOpen ? null : job.id); }}
              onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}
            >
              {/* Cursor spotlight + accent edge */}
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${hue}1f, transparent 60%)` }} />
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[3px]" style={{ background: `linear-gradient(${hue}, transparent)` }} />

              <div className="relative flex w-full items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <motion.div initial={reduce ? false : { scale: 0.6, rotate: -8, opacity: 0 }} whileInView={{ scale: 1, rotate: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}>
                    <CompanyLogo name={job.company} logo={job.logo} website={job.website} hue={hue} className="h-12 w-12 sm:h-14 sm:w-14" />
                  </motion.div>
                  <div className="min-w-0">
                    <DateBadge from={formatMonth(job.start)} to={formatMonth(job.end)} length={tenure(job.start, job.end)} months={monthCount(job.start, job.end)} hue={hue} current={current} />
                    <h3 className="mt-2 text-lg font-semibold text-mist-100 sm:text-xl">
                      <button type="button" onClick={() => setOpen(isOpen ? null : job.id)} aria-expanded={isOpen} aria-controls={`job-${job.id}`} className="text-left hover:text-white">{job.title}</button>
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist-300">
                      <CompanyName name={job.company} website={job.website} icon={<Briefcase className="h-3.5 w-3.5" aria-hidden />} />
                      <span className="inline-flex items-center gap-1.5 text-mist-400"><MapPin className="h-3.5 w-3.5" aria-hidden />{job.location}</span>
                    </p>
                  </div>
                </div>
                <motion.button type="button" onClick={() => setOpen(isOpen ? null : job.id)} aria-label={isOpen ? "Collapse" : "Expand"} aria-expanded={isOpen} animate={reduce ? { rotate: isOpen ? 180 : 0 } : { rotate: isOpen ? 180 : 0, y: isOpen ? 0 : [0, 4, 0] }} transition={{ rotate: { duration: 0.3 }, y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } }} className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-mist-300 hover:text-white" style={{ borderColor: `${hue}55`, background: isOpen ? `${hue}22` : undefined }}>
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </motion.button>
              </div>
              <p className="relative mt-3 text-sm text-mist-300">{job.summary}</p>
              {!isOpen && (
                <button type="button" onClick={() => setOpen(job.id)} className="relative mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest transition-[gap] hover:gap-2" style={{ color: hue }}>
                  View {job.groups?.length ? `${job.groups.length} areas of responsibility` : "details"} →
                </button>
              )}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div id={`job-${job.id}`} initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden">
                    {job.groups?.length ? (
                      <div className="mt-4 grid gap-4 border-t border-white/[0.06] pt-4 xl:grid-cols-2">
                        {job.groups.map((g, gi) => (
                          <motion.section key={g.title} initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, delay: 0.05 + gi * 0.07 }}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.04]">
                            <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest" style={{ color: hue }}>
                              <span className="text-mist-500">{String(gi + 1).padStart(2, "0")}</span>{g.title}
                            </h4>
                            <ul className="mt-3 space-y-2">
                              {g.items.map((h, hi) => (
                                <motion.li key={h} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + gi * 0.07 + hi * 0.04 }} className="flex gap-3 text-sm leading-relaxed text-mist-200">
                                  <span aria-hidden className="mt-2 h-1 w-2.5 shrink-0 rounded" style={{ background: `${hue}b0` }} />{h}
                                </motion.li>
                              ))}
                            </ul>
                          </motion.section>
                        ))}
                      </div>
                    ) : (
                      <ul className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-4">
                        {job.highlights.map((h, hi) => (
                          <motion.li key={h} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + hi * 0.05 }} className="flex gap-3 text-sm leading-relaxed text-mist-200">
                            <span aria-hidden className="mt-2 h-1 w-3 shrink-0 rounded" style={{ background: `${hue}b0` }} />{h}
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative mt-4 flex flex-wrap gap-1.5">
                {job.tags.map((t, ti) => (
                  <motion.span key={t} className="chip py-0.5 text-[10px]" initial={reduce ? false : { opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + ti * 0.04 }}>{t}</motion.span>
                ))}
              </div>
            </article>
          </SeenMotion>
        );
      })}
    </ol>
  );
}
