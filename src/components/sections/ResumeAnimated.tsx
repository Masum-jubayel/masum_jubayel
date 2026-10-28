"use client";

/* eslint-disable @next/next/no-img-element */
import { DateBadge } from "@/components/ui/DateBadge";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ChevronDown, Award, BadgeCheck, Briefcase, Cpu, Download, GraduationCap, Mail, MapPin, Phone, ScrollText, Sparkles, FileText } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { CompanyLogo, CompanyName } from "@/components/ui/CompanyLogo";
import { DynamicIcon } from "@/components/ui/Icon";
import { ProofThumb } from "@/components/ui/ProofThumb";
import { formatMonth, type Job } from "@/content/profile";
import { evidenceMeta, type SkillGroup } from "@/content/skills";
import { defaultResume, type Education, type ResumeInfo, type SiteInfo } from "@/content/cms";
import { monthCount, tenure } from "./ExperienceTimeline";

const ease = [0.22, 1, 0.36, 1] as const;
const HUES = ["#3ee6ff", "#a78bfa", "#22ff88", "#fbbf24", "#f472b6", "#4f8cff", "#38bdf8"];

/** Floating "paper" that writes itself — the resume header visual. */
export function ResumePaper({ name, title, src, labels = defaultResume.chips, fileName = defaultResume.downloadName }: { name: string; title: string; src: string; labels?: string[]; fileName?: string }) {
  const reduce = useReducedMotion();
  const lines = [92, 78, 85, 60, 88, 70, 95, 66, 80, 54];
  const spots = [["#3ee6ff", "-left-16 top-6"], ["#22ff88", "-right-14 top-24"], ["#a78bfa", "-left-12 bottom-20"], ["#f472b6", "-right-10 bottom-6"], ["#fbbf24", "-left-14 top-1/2"], ["#38bdf8", "-right-12 top-2"]] as const;
  const chips = labels.slice(0, spots.length).map((l, i) => [l, spots[i][0], spots[i][1]] as const);
  return (
    <motion.div className="relative mx-auto w-64 [perspective:1000px] sm:w-72" initial={reduce ? false : { opacity: 0, y: 30, rotateY: -25 }} animate={{ opacity: 1, y: 0, rotateY: 0 }} transition={{ duration: 0.9, ease }}>
      <motion.div className="relative" animate={reduce ? undefined : { y: [0, -10, 0], rotateZ: [-1.5, 1, -1.5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        {/* back sheets */}
        <span aria-hidden className="absolute inset-0 translate-x-4 translate-y-3 rotate-3 rounded-2xl border border-white/10 bg-ink-900/80" />
        <span aria-hidden className="absolute inset-0 translate-x-2 translate-y-1.5 rotate-1 rounded-2xl border border-white/10 bg-ink-900/90" />
        <div className="relative overflow-hidden rounded-2xl border border-cyan-300/30 bg-gradient-to-b from-ink-900 to-ink-950 p-5 shadow-[0_30px_80px_-20px_rgba(62,230,255,0.35)]">
          {!reduce && <span aria-hidden className="pointer-events-none absolute inset-x-0 h-16 animate-[scanline_3.5s_linear_infinite] bg-gradient-to-b from-transparent via-cyan-300/15 to-transparent" />}
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"><ScrollText className="h-5 w-5" aria-hidden /></span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-mist-100">{name}</p>
              <p className="truncate text-[10px] text-cyan-300">{title}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {lines.map((w, i) => (
              <motion.span key={i} aria-hidden className={`block h-1.5 rounded-full ${i % 4 === 0 ? "bg-cyan-300/50" : "bg-white/10"}`}
                initial={reduce ? false : { width: 0 }} animate={{ width: `${w}%` }} transition={{ delay: 0.5 + i * 0.12, duration: 0.6, ease }} />
            ))}
          </div>
          <a href={src} download={fileName} className="btn-primary mt-5 w-full justify-center py-2 text-xs"><Download className="h-3.5 w-3.5" aria-hidden /> Download PDF</a>
        </div>
        {chips.map(([label, hue, pos], i) => (
          <motion.span key={label} aria-hidden className={`absolute ${pos} z-10 hidden rounded-full border bg-ink-950/90 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur sm:block`}
            style={{ color: hue, borderColor: `${hue}66`, boxShadow: `0 0 16px ${hue}33` }}
            initial={reduce ? false : { opacity: 0, scale: 0.5 }} animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -7, 0] }}
            transition={{ opacity: { delay: 1 + i * 0.2 }, scale: { delay: 1 + i * 0.2, type: "spring" }, y: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 } }}>
            {label}
          </motion.span>
        ))}
        <motion.span className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-emerald-400 text-ink-950 shadow-lg" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 1.6 }} aria-hidden>
          <BadgeCheck className="h-5 w-5" />
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

/** Cycles through phrases with a typing effect. */
function Typewriter({ phrases }: { phrases: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const full = phrases[i % phrases.length];
    const t = setTimeout(() => {
      if (!del && n < full.length) setN(n + 1);
      else if (!del) setDel(true);
      else if (n > 0) setN(n - 1);
      else { setDel(false); setI(i + 1); }
    }, !del && n === full.length ? 1800 : del ? 25 : 55);
    return () => clearTimeout(t);
  }, [n, del, i, phrases, reduce]);
  const text = reduce ? phrases[0] : phrases[i % phrases.length].slice(0, n);
  return <span>{text}<span aria-hidden className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-cyan-300 print:hidden" /></span>;
}

/** Animated numbers above the online resume. */
export function ResumeStats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:hidden">
      {items.map((s, i) => (
        <motion.div key={s.label} className="shine glass group relative overflow-hidden p-4 text-center" initial={{ opacity: 0, y: 16, rotateX: 30 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} whileHover={{ y: -4 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6, ease }}>
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-60" style={{ background: HUES[i] }} />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${HUES[i]}, transparent)` }} />
          <p className="font-display text-3xl font-semibold" style={{ color: HUES[i] }}><CountUp value={s.value} /></p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mist-400">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function H({ icon, children, hue = "#3ee6ff" }: { icon: ReactNode; children: ReactNode; hue?: string }) {
  return (
    <motion.h2 className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] print:text-black" style={{ color: hue }}
      initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg border print:hidden" style={{ borderColor: `${hue}55`, background: `${hue}14` }}>
        <span aria-hidden className="absolute inset-0 animate-ping rounded-lg opacity-25" style={{ border: `1px solid ${hue}` }} />{icon}
      </span>
      {children}
      <motion.span aria-hidden className="h-px flex-1 origin-left print:bg-black/30" style={{ background: `linear-gradient(90deg, ${hue}88, transparent)` }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease }} />
    </motion.h2>
  );
}

const li = { h: { opacity: 0, x: 20 }, s: { opacity: 1, x: 0 } };
const rise = (i = 0) => ({ initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "0px 0px -30px 0px" }, transition: { duration: 0.5, delay: Math.min(i, 6) * 0.06, ease } });

type Cert = { name: string; listedWith: string; kind: string; summary?: string; learned?: string[]; date?: string };
type AwardRow = { rank: string; event: string; date: string; tier: string };

/** The online resume — animated, but prints as a clean black-and-white document. */
export function OnlineResume({ site, summary, experience, education, skills: allSkills, certifications, research, awards, cfg = defaultResume }: {
  site: SiteInfo; summary: string; experience: Job[]; education: Education[]; skills: SkillGroup[]; certifications: Cert[];
  research: { title: string; sponsor: string; venue: string; host: string; dateFrom?: string; dateTo?: string; duration?: string; link?: string; certificate?: string }; awards: AwardRow[]; cfg?: ResumeInfo;
}) {
  const skills = cfg.showLanguages ? allSkills : allSkills.filter((g) => g.id !== "languages");
  const phrases = cfg.phrases.length ? cfg.phrases : [site.title];
  const reduce = useReducedMotion();
  const jobs = [...experience].sort((a, b) => Number(b.end === null) - Number(a.end === null) || b.start.localeCompare(a.start));
  const maxSkills = Math.max(...skills.map((g) => g.skills.length), 1);
  const art = useRef<HTMLElement>(null);
  const work = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: art, offset: ["start 80%", "end 80%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const { scrollYProgress: workP } = useScroll({ target: work, offset: ["start 80%", "end 60%"] });
  const workLine = useSpring(workP, { stiffness: 120, damping: 30 });
  // Jobs and skill groups start closed (like Experience & Skills); printing always shows everything.
  const [openJobs, setOpenJobs] = useState<string[]>([]);
  const flip = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const [openSec, setOpenSec] = useState<string[]>([]);
  const [openSkills, setOpenSkills] = useState<string[]>([]);
  const secOpen = (k: string) => openSec.includes(k);
  const allOpen = openJobs.length === jobs.length && openSkills.length === skills.length && ["certs", "awards"].every(secOpen);
  return (
    <article ref={art} className="glass relative overflow-hidden p-6 sm:p-10 print:mt-0 print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none" aria-label="Online resume">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-60 print:hidden"><span className="hdr-orb a" /><span className="hdr-orb b" /><span className="hdr-sweep" /></div>
      <motion.span aria-hidden className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left bg-gradient-to-r from-cyan-300 via-violet-400 to-emerald-300 shadow-[0_0_12px_rgba(62,230,255,0.7)] print:hidden" style={{ scaleX: reduce ? 1 : progress }} />

      {/* Identity */}
      <header className="relative flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center print:border-black/30">
        {cfg.showPhoto && <motion.span className="relative shrink-0 self-start rounded-full p-[3px] print:hidden" initial={reduce ? false : { scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <span aria-hidden className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#3ee6ff,#a78bfa,#22ff88,#fbbf24,#3ee6ff)] ${reduce ? "" : "animate-[spin_6s_linear_infinite]"}`} />
          <img src={site.profilePhoto} alt={site.name} className="relative h-24 w-24 rounded-full border-4 border-ink-950 object-cover object-top" />
        </motion.span>}
        <div className="min-w-0 flex-1">
          <p className="font-display text-3xl font-semibold text-mist-100 sm:text-4xl print:text-black">{site.name}</p>
          <p className="mt-1 min-h-[1.75rem] text-lg text-cyan-300 print:hidden"><Typewriter phrases={phrases} /></p>
          <p className="mt-1 hidden text-lg print:block print:text-black">{phrases[0]}</p>
          <p className="mt-1 text-sm text-mist-400 print:text-black">{site.positioning}</p>
        </div>
        <motion.ul className="space-y-1.5 text-sm text-mist-300 sm:text-right print:text-black" initial="h" whileInView="s" viewport={{ once: true }} variants={{ s: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}>
          {cfg.showLocation && <motion.li variants={li} className="flex items-center gap-2 sm:justify-end"><MapPin className="h-3.5 w-3.5 text-emerald-300" aria-hidden />{site.location}</motion.li>}
          {cfg.showEmail && <motion.li variants={li}><a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-cyan-300 sm:justify-end"><Mail className="h-3.5 w-3.5 text-cyan-300" aria-hidden />{site.email}</a></motion.li>}
          {cfg.showPhone && site.phone && <motion.li variants={li}><a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 hover:text-cyan-300 sm:justify-end"><Phone className="h-3.5 w-3.5 text-violet-300" aria-hidden />{site.phone}</a></motion.li>}
        </motion.ul>
      </header>

      <div className="relative mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] print:block">
        <div className="min-w-0 space-y-12">
          {cfg.showSummary && <section>
            <H icon={<Sparkles className="h-4 w-4" aria-hidden />}>{cfg.summaryTitle}</H>
            {(cfg.summary.trim() || summary).split(/\n\s*\n/).map((p, i) => <motion.p key={i} {...rise(i)} className="mt-3 text-sm leading-relaxed text-mist-200 first:mt-0 print:text-black">{p}</motion.p>)}
          </section>}

          {cfg.showWork && <section>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1"><H icon={<Briefcase className="h-4 w-4" aria-hidden />} hue="#a78bfa">{cfg.workTitle}</H></div>
              <button type="button" className="btn-ghost shrink-0 px-2 py-1 text-[11px] print:hidden" onClick={() => { if (allOpen) { setOpenJobs([]); setOpenSkills([]); setOpenSec([]); } else { setOpenJobs(jobs.map((x) => x.id)); setOpenSkills(skills.map((x) => x.id)); setOpenSec(["certs", "awards"]); } }}>{allOpen ? "Collapse all" : "Expand all"}</button>
            </div>
            <ol ref={work} className="relative space-y-8 border-l border-white/10 pl-6 print:border-0 print:pl-0">
              <motion.span aria-hidden className="absolute -left-px top-0 h-full w-px origin-top bg-gradient-to-b from-cyan-300 via-violet-400 to-emerald-300 shadow-[0_0_10px_rgba(62,230,255,0.7)] print:hidden" style={{ scaleY: reduce ? 1 : workLine }} />
              {jobs.map((j, ji) => {
                const hue = HUES[ji % HUES.length];
                return (
                  <motion.li key={j.id} initial={reduce ? false : { opacity: 0, x: -30, filter: "blur(6px)" }} whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ duration: 0.6, ease }}
                    className="group relative -mx-3 break-inside-avoid rounded-xl px-3 py-2 transition-colors hover:bg-white/[0.025] print:mx-0 print:px-0"
                    style={openJobs.includes(j.id) ? { boxShadow: `inset 0 0 0 1px ${hue}33` } : undefined}
                    onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}>
                    <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 print:hidden" style={{ background: `radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), ${hue}14, transparent 60%)` }} />
                    <span aria-hidden className="absolute -left-[19px] top-3.5 grid h-3.5 w-3.5 place-items-center rounded-full border-2 bg-ink-950 print:hidden" style={{ borderColor: hue, boxShadow: `0 0 10px ${hue}` }}>
                      {j.end === null && <span className="absolute inset-0 animate-ping rounded-full" style={{ border: `2px solid ${hue}` }} />}
                    </span>
                    <div className="relative flex cursor-pointer items-start gap-3 print:cursor-auto" title={openJobs.includes(j.id) ? "Click to close" : "Click to open"}
                      onClick={(e) => { if ((e.target as HTMLElement).closest("a,button") || (window.getSelection()?.toString() ?? "").length > 0) return; flip(openJobs, setOpenJobs, j.id); }}>
                      <span className="print:hidden"><CompanyLogo name={j.company} logo={j.logo} website={j.website} hue={hue} className="h-10 w-10" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1.5">
                          <h3 className="text-base font-semibold text-mist-100 print:text-black">{j.title}</h3>
                          <span className="shrink-0"><DateBadge from={formatMonth(j.start)} to={formatMonth(j.end)} length={tenure(j.start, j.end)} months={monthCount(j.start, j.end)} hue={hue} current={j.end === null} size="sm" /></span>
                        </div>
                        <p className="text-sm print:text-black" style={{ color: hue }}><CompanyName name={j.company} website={j.website} /> <span className="text-mist-400 print:text-black">· {j.location}</span></p>
                      </div>
                      <motion.button type="button" onClick={() => flip(openJobs, setOpenJobs, j.id)} aria-expanded={openJobs.includes(j.id)} aria-label={openJobs.includes(j.id) ? "Hide duties" : "Show duties"}
                        animate={{ rotate: openJobs.includes(j.id) ? 180 : 0 }} className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-mist-400 hover:text-mist-100 print:hidden"><ChevronDown className="h-3.5 w-3.5" aria-hidden /></motion.button>
                    </div>
                    {!openJobs.includes(j.id) && (
                      <p className="relative mt-2 cursor-pointer font-mono text-[11px] uppercase tracking-widest print:hidden" style={{ color: hue }} onClick={() => flip(openJobs, setOpenJobs, j.id)}>
                        View {j.groups?.length ? `${j.groups.length} areas · ${j.groups.reduce((n, g) => n + g.items.length, 0)} duties` : `${j.highlights.length} duties`} →
                      </p>
                    )}
                    <AnimatePresence initial={false}>
                    {openJobs.includes(j.id) && (
                    <motion.div key="duties" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden print:hidden">
                    <Duties j={j} hue={hue} reduce={!!reduce} />
                    </motion.div>
                    )}
                    </AnimatePresence>
                    <div className="hidden print:block"><Duties j={j} hue={hue} reduce /></div>
                    {cfg.workShowTags && j.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5 print:hidden">{j.tags.map((t) => <span key={t} className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-mist-400">{t}</span>)}</div>}
                  </motion.li>
                );
              })}
            </ol>
          </section>}

          {cfg.extra.filter((x) => x.title || x.body).map((x, xi) => (
            <section key={x.title + xi}>
              <H icon={<ScrollText className="h-4 w-4" aria-hidden />} hue={HUES[(xi + 3) % HUES.length]}>{x.title || "More"}</H>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-mist-300 marker:text-mist-500 print:text-black">
                {x.body.split("\n").map((l) => l.trim()).filter(Boolean).map((l, li2) => <motion.li key={li2} {...rise(li2)}>{l}</motion.li>)}
              </ul>
            </section>
          ))}
        </div>

        <aside className="min-w-0 space-y-12 print:mt-8">
          {cfg.showEducation && <section>
            <H icon={<GraduationCap className="h-4 w-4" aria-hidden />} hue="#fbbf24">{cfg.educationTitle}</H>
            <div className="space-y-4">
              {education.map((e, i) => (
                <motion.div key={e.degree} {...rise(i)} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 print:border-0 print:p-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-mist-100 print:text-black">{e.degree}</p>
                      <p className="text-sm text-mist-300 print:text-black">{e.field}</p>
                    </div>
                    {e.logo && <span className="print:hidden"><CompanyLogo name={e.school} logo={e.logo} website={e.website} hue="#fbbf24" className="h-9 w-auto min-w-9 max-w-[6rem]" /></span>}
                  </div>
                  <p className="mt-1 text-xs text-mist-500 print:text-black"><CompanyName name={e.school} website={e.website} /> · {e.date}{e.gpa ? ` · GPA ${e.gpa}` : ""}</p>
                  {e.image && <ProofThumb src={e.image} alt={`${e.degree} certificate`} label="View certificate" className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 print:hidden" />}
                </motion.div>
              ))}
            </div>
          </section>}

          {cfg.showSkills && <section>
            <H icon={<Cpu className="h-4 w-4" aria-hidden />} hue="#22ff88">{cfg.skillsTitle}</H>
            <div className="space-y-4">
              {skills.map((g, i) => {
                const hue = HUES[i % HUES.length];
                return (
                  <motion.div key={g.id} {...rise(i)}>
                    <div className="flex cursor-pointer items-center justify-between rounded-md text-xs transition-colors hover:bg-white/[0.03] print:cursor-auto" onClick={() => flip(openSkills, setOpenSkills, g.id)} title={openSkills.includes(g.id) ? "Click to close" : "Click to open"}>
                      <span className="flex items-center gap-2 font-semibold text-mist-100 print:text-black"><span className="print:hidden" style={{ color: hue }}><DynamicIcon name={g.icon} className="h-3.5 w-3.5" /></span>{g.title}</span>
                      <span className="flex items-center gap-1.5 font-mono text-mist-500 print:hidden">{g.skills.length}<ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${openSkills.includes(g.id) ? "rotate-180" : ""}`} aria-hidden /></span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05] print:hidden">
                      <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${hue}, ${hue}44)` }} initial={{ width: 0 }} whileInView={{ width: `${(g.skills.length / maxSkills) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 + i * 0.06, ease }} />
                    </div>
                    <p className={`mt-1.5 text-xs leading-relaxed text-mist-400 print:block print:text-black ${cfg.skillsAsChips ? "hidden" : ""}`}>{g.skills.map((s) => (g.id === "languages" ? `${s.name} (${evidenceMeta[s.evidence].label})` : s.name)).join(" · ")}</p>
                    {!openSkills.includes(g.id) && <p className="mt-1.5 cursor-pointer truncate text-[11px] text-mist-500 hover:text-mist-300 print:hidden" onClick={() => flip(openSkills, setOpenSkills, g.id)}>{g.skills.slice(0, 3).map((s) => s.name.replace(/\s*\(.*\)$/, "")).join(" · ")}{g.skills.length > 3 ? ` · +${g.skills.length - 3} more` : ""}</p>}
                    <AnimatePresence initial={false}>
                    {cfg.skillsAsChips && openSkills.includes(g.id) && <motion.div key="chips" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }} className="mt-2 flex flex-wrap gap-1 overflow-hidden print:hidden">
                      {g.skills.map((s, si) => (
                        <motion.span key={s.name} className="cursor-default rounded-md border px-1.5 py-0.5 text-[10.5px] text-mist-300 transition-colors hover:text-white"
                          style={{ borderColor: `${hue}33`, background: `${hue}0d` }}
                          initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -2, borderColor: hue }} transition={{ delay: Math.min(si, 20) * 0.025, type: "spring", stiffness: 300, damping: 18 }}>
                          {s.name.replace(/\s*\(.*\)$/, "")}
                          {g.id === "languages" && <span className={`ml-1.5 rounded-full border px-1.5 py-px font-mono text-[9px] ${evidenceMeta[s.evidence].className}`}>{evidenceMeta[s.evidence].label}{s.note ? ` · ${s.note}` : ""}</span>}
                        </motion.span>
                      ))}
                    </motion.div>}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </section>}

          {cfg.showCerts && <section>
            <H icon={<BadgeCheck className="h-4 w-4" aria-hidden />} hue="#a78bfa">{cfg.certsTitle}</H>
            <Fold open={secOpen("certs")} onToggle={() => flip(openSec, setOpenSec, "certs")} hue="#a78bfa" count={certifications.length} unit="certifications"
              preview={certifications.slice(0, 3).map((c) => c.name.replace(/\s*\(.*?\)/g, "").split(":")[0])} reduce={!!reduce}>
            <ul className="space-y-3 text-sm">
              {certifications.map((c, i) => (
                <motion.li key={c.name} initial={reduce ? false : { opacity: 0, rotateX: -60, y: 10 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} transition={{ delay: i * 0.06, duration: 0.45, ease }} className="group flex gap-3 [transform-origin:top]">
                  <motion.span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-violet-400/40 bg-violet-500/10 text-violet-300 transition-transform group-hover:rotate-[360deg] group-hover:duration-700 print:hidden"><BadgeCheck className="h-3.5 w-3.5" /></motion.span>
                  <div className="min-w-0">
                    <p className="text-mist-100 print:text-black">{c.name}{c.date ? <span className="ml-2 font-mono text-[10px] text-mist-500">{c.date}</span> : null}</p>
                    <p className="text-xs text-mist-500 print:text-black">{c.listedWith}</p>
                    {c.summary && <p className="mt-1 text-xs leading-relaxed text-mist-400 print:hidden">{c.summary}</p>}
                  </div>
                </motion.li>
              ))}
            </ul>
            </Fold>
          </section>}

          {cfg.showResearch && <section>
            <H icon={<ScrollText className="h-4 w-4" aria-hidden />} hue="#38bdf8">{cfg.researchTitle}</H>
            <motion.div {...rise()} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 print:border-0 print:p-0">
              {research.dateFrom && <div className="mb-2"><DateBadge from={research.dateFrom} to={research.dateTo || research.dateFrom} length={research.duration} hue="#38bdf8" size="sm" /></div>}
              {research.link
                ? <a href={research.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-mist-100 transition hover:text-sky-300 print:text-black">“{research.title}”</a>
                : <p className="text-sm font-semibold text-mist-100 print:text-black">“{research.title}”</p>}
              <p className="mt-1 text-xs text-mist-500 print:text-black">{research.sponsor} {research.venue}, {research.host}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 print:hidden">
                {research.link && <a href={research.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200"><FileText className="h-3.5 w-3.5" aria-hidden /> Read the paper</a>}
                {research.certificate && <ProofThumb src={research.certificate} alt="Conference certificate" label="View certificate" className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200" />}
              </div>
            </motion.div>
          </section>}

          {cfg.showAwards && <section>
            <H icon={<Award className="h-4 w-4" aria-hidden />} hue="#f472b6">{cfg.awardsTitle}</H>
            <Fold open={secOpen("awards")} onToggle={() => flip(openSec, setOpenSec, "awards")} hue="#f472b6" count={awards.filter((a) => a.tier !== "participation").length} unit="awards"
              preview={awards.filter((a) => a.tier !== "participation").slice(0, 3).map((a) => `${a.rank} — ${a.event.split(/[—(]/)[0].trim()}`)} reduce={!!reduce}>
            <ul className="space-y-2 text-sm text-mist-300 print:text-black">
              {awards.filter((a) => a.tier !== "participation").map((a, i) => (
                <motion.li key={a.event + a.rank} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ x: 4 }} className="flex gap-2">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase print:border print:border-black/30 print:bg-transparent print:text-black ${a.tier === "gold" ? "bg-amber-400/15 text-amber-300" : a.tier === "silver" ? "bg-slate-300/15 text-slate-200" : "bg-cyan-400/15 text-cyan-300"}`}>{a.rank}</span>
                  <span>{a.event}{a.date && <span className="text-mist-500"> ({a.date})</span>}</span>
                </motion.li>
              ))}
            </ul>
            </Fold>
          </section>}
        </aside>
      </div>
    </article>
  );
}

/** A job's duty sections (shared by the animated view and the print view). */
function Duties({ j, hue, reduce }: { j: Job; hue: string; reduce: boolean }) {
  return j.groups?.length ? (
    <>
      {j.groups.map((g) => (
        <div key={g.title} className="mt-3">
          <p className="font-mono text-[11px] uppercase tracking-wider print:text-black" style={{ color: `${hue}dd` }}>{g.title}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-mist-300 print:text-black">
            {g.items.map((h, hi) => <motion.li key={h} className="marker:text-mist-500" initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(hi, 8) * 0.04, duration: 0.3 }}>{h}</motion.li>)}
          </ul>
        </div>
      ))}
    </>
  ) : (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-mist-300 marker:text-mist-500 print:text-black">
      {j.highlights.map((h) => <li key={h}>{h}</li>)}
    </ul>
  );
}

/** Collapsible block: a preview + "View all" when closed; the full content when open. Always printed in full. */
function Fold({ open, onToggle, hue, count, unit, preview, reduce, children }: { open: boolean; onToggle: () => void; hue: string; count: number; unit: string; preview: string[]; reduce: boolean; children: ReactNode }) {
  return (
    <>
      <div className="print:hidden">
        <button type="button" onClick={onToggle} aria-expanded={open} className="group/f flex w-full items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-left transition hover:border-white/15">
          <span className="min-w-0">
            <span className="block font-mono text-[11px] uppercase tracking-widest" style={{ color: hue }}>{open ? "Hide" : count === 1 ? "View" : "View all"} {count === 1 ? "" : count} {unit} {open ? "" : "→"}</span>
            {!open && <span className="mt-0.5 block truncate text-[11px] text-mist-500">{preview.join(" · ")}{count > preview.length ? ` · +${count - preview.length} more` : ""}</span>}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-mist-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="body" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} className="overflow-hidden pt-4">
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="hidden print:block">{children}</div>
    </>
  );
}
