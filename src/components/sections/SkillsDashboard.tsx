"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown, Search } from "lucide-react";
import { evidenceMeta, type Evidence, type SkillGroup } from "@/content/skills";
import { DynamicIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const order: Evidence[] = ["professional", "certified", "working", "academic", "developing", "native", "fluent"];
const evidenceColor: Record<Evidence, string> = { professional: "#3ee6ff", certified: "#a78bfa", working: "#4f8cff", academic: "#fbbf24", developing: "#34d399", native: "#2dd4bf", fluent: "#38bdf8" };
const groupHue: Record<string, string> = { web: "#a78bfa", data: "#38bdf8", poc: "#22ff88", networking: "#3ee6ff", infrastructure: "#4f8cff", business: "#fbbf24", security: "#f472b6", languages: "#2dd4bf" };
const hueOf = (id: string, i: number) => groupHue[id] ?? ["#3ee6ff", "#a78bfa", "#34d399", "#fbbf24", "#f472b6"][i % 5];

/** Two rows of skill names scrolling in opposite directions. */
function Ticker({ names }: { names: string[] }) {
  const half = Math.ceil(names.length / 2);
  const rows = [names.slice(0, half), names.slice(half)];
  return (
    <div className="group/t relative space-y-2 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]" aria-hidden>
      {rows.map((row, r) => (
        <div key={r} className={cn("flex w-max gap-2 group-hover/t:[animation-play-state:paused]", r === 0 ? "animate-[ticker_140s_linear_infinite]" : "animate-[ticker_160s_linear_infinite_reverse]")}>
          {[...row, ...row].map((n, i) => (
            <span key={i} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-mist-300">{n}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkillsDashboard({ skillGroups, show = { skillsTicker: true, skillsDomains: true, skillsFilters: true, skillsLegend: true } }: { skillGroups: SkillGroup[]; show?: { skillsTicker: boolean; skillsDomains: boolean; skillsFilters: boolean; skillsLegend: boolean } }) {
  const reduce = useReducedMotion();
  const [group, setGroup] = useState<string>("all");
  const [filter, setFilter] = useState<Evidence | "all">("all");
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const t = q.trim().toLowerCase();
    return skillGroups
      .map((g, i) => ({ ...g, hue: hueOf(g.id, i) }))
      .filter((g) => group === "all" || g.id === group)
      .map((g) => ({ ...g, skills: g.skills.filter((s) => (filter === "all" || s.evidence === filter) && (!t || `${s.name} ${s.note ?? ""}`.toLowerCase().includes(t))) }))
      .filter((g) => g.skills.length);
  }, [group, filter, q, skillGroups]);

  // Greedy split by estimated card height so both columns end at about the same place.
  const columns = useMemo(() => {
    if (groups.length < 2) return [groups];
    const cols: (typeof groups)[] = [[], []];
    const h = [0, 0];
    for (const g of groups) { const k = h[0] <= h[1] ? 0 : 1; cols[k].push(g); h[k] += 260 + g.skills.length * 6; }
    return cols;
  }, [groups]);

  // Cards start closed (like Experience); a search or filter opens the matching ones.
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [closedIds, setClosedIds] = useState<string[]>([]);
  const searching = q.trim() !== "" || filter !== "all" || group !== "all";
  const isOpen = (id: string) => (searching ? !closedIds.includes(id) : openIds.includes(id));
  const toggle = (id: string) => {
    if (searching) setClosedIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    else setOpenIds((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  };

  const all = useMemo(() => skillGroups.flatMap((g) => g.skills), [skillGroups]);
  const totals = useMemo(() => Object.fromEntries(order.map((e) => [e, all.filter((s) => s.evidence === e).length])) as Record<Evidence, number>, [all]);

  return (
    <div>
      {show.skillsTicker && <Ticker names={all.map((s) => s.name.replace(/\s*\(.*\)$/, ""))} />}

      {/* Domain overview: animated evidence bars per domain */}
      {show.skillsDomains && <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((g, i) => {
          const hue = hueOf(g.id, i);
          const n = g.skills.length;
          return (
            <motion.button
              key={g.id} type="button" onClick={() => setGroup(group === g.id ? "all" : g.id)}
              initial={reduce ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={reduce ? undefined : { y: -4 }}
              className={cn("glass group relative overflow-hidden p-4 text-left transition", group === g.id && "ring-1")} style={{ ["--tw-ring-color" as string]: `${hue}88` }}
              aria-pressed={group === g.id}
            >
              <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-60" style={{ background: hue }} aria-hidden />
              <div className="relative flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border" style={{ color: hue, borderColor: `${hue}55`, background: `${hue}14` }}><DynamicIcon name={g.icon} className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-mist-100">{g.title}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-mist-500">{n} skills</p>
                </div>
              </div>
              <div className="relative mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/[0.05]" aria-hidden>
                {order.map((e, k) => {
                  const c = g.skills.filter((s) => s.evidence === e).length;
                  return c ? <motion.span key={e} className="h-full" style={{ background: evidenceColor[e] }} initial={{ width: 0 }} whileInView={{ width: `${(c / n) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 + i * 0.06 + k * 0.08, ease: [0.22, 1, 0.36, 1] }} /> : null;
                })}
              </div>
            </motion.button>
          );
        })}
      </div>}

      {show.skillsFilters && <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Skill categories" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {[{ id: "all", title: "All", icon: "Network" }, ...skillGroups].map((g, i) => (
            <button key={g.id} role="tab" aria-selected={group === g.id} onClick={() => setGroup(g.id)}
              className={cn("flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition", group === g.id ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-mist-300 hover:border-white/20")}>
              {g.id !== "all" && <DynamicIcon name={g.icon} className="h-4 w-4" />}
              {g.id === "all" ? "All" : g.title.split(" & ")[0].split(",")[0]}
              {g.id !== "all" && <span className="h-1.5 w-1.5 rounded-full" style={{ background: hueOf(g.id, i - 1) }} aria-hidden />}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search skills</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills…" className="input w-56 py-2 pl-9 text-xs" />
          </label>
          <select aria-label="Evidence level" value={filter} onChange={(e) => setFilter(e.target.value as Evidence | "all")} className="input w-auto py-2 text-xs">
            <option value="all">All evidence</option>
            {order.map((e) => <option key={e} value={e}>{evidenceMeta[e].label}</option>)}
          </select>
        </div>
      </div>}

      {show.skillsLegend && <ul className="mt-5 flex flex-wrap gap-2" aria-label="Legend">
        {order.map((e) => (
          <li key={e}>
            <button type="button" onClick={() => setFilter(filter === e ? "all" : e)} aria-pressed={filter === e} title={evidenceMeta[e].description}
              className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition", filter === e ? "border-white/40 text-mist-100" : "border-white/10 text-mist-400 hover:text-mist-100")}>
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: evidenceColor[e] }} /><span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: evidenceColor[e] }} /></span>
              {evidenceMeta[e].label} <span className="font-mono text-[10px] text-mist-500">{totals[e]}</span>
            </button>
          </li>
        ))}
      </ul>}

      {/* Two balanced columns (no empty gap under the shorter one). */}
      <div className={cn("mt-8 grid gap-5", columns.length > 1 && "lg:grid-cols-2")}>
        {columns.map((col, ci) => (
          <div key={ci} className="space-y-5">
            <AnimatePresence mode="popLayout">
                {col.map((g) => (
            <motion.section
              key={g.id}
              initial={reduce ? false : { opacity: 0, y: 24, rotateX: 6 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={cn("glass group relative cursor-pointer overflow-hidden p-6 transition-all duration-300", !isOpen(g.id) && "hover:-translate-y-1")} aria-labelledby={`sg-${g.id}`}
              style={isOpen(g.id) ? { boxShadow: `0 0 0 1px ${g.hue}55, 0 20px 60px -25px ${g.hue}88` } : undefined}
              onClick={(e) => { if ((e.target as HTMLElement).closest("button,a,input") || (window.getSelection()?.toString() ?? "").length > 0) return; toggle(g.id); }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${g.hue}, transparent)` }} aria-hidden />
              <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40" style={{ background: g.hue }} aria-hidden />
              <div className="relative flex items-start gap-4">
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border" style={{ color: g.hue, borderColor: `${g.hue}55`, background: `${g.hue}14` }}>
                  <span className="absolute inset-0 animate-ping rounded-xl opacity-20" style={{ border: `1px solid ${g.hue}` }} aria-hidden />
                  <DynamicIcon name={g.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 id={`sg-${g.id}`} className="text-lg font-semibold">{g.title}</h3>
                  <p className="mt-1 text-sm text-mist-400">{g.blurb}</p>
                </div>
                <motion.button type="button" onClick={() => toggle(g.id)} aria-expanded={isOpen(g.id)} aria-controls={`sl-${g.id}`} aria-label={isOpen(g.id) ? "Collapse" : "Expand"}
                  animate={{ rotate: isOpen(g.id) ? 180 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-mist-400 hover:text-mist-100">
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </motion.button>
              </div>
              {!isOpen(g.id) && (
                <div className="relative mt-4">
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.05]" aria-hidden>
                    {order.map((e) => { const c = g.skills.filter((s) => s.evidence === e).length; return c ? <span key={e} className="h-full" style={{ width: `${(c / g.skills.length) * 100}%`, background: evidenceColor[e] }} /> : null; })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {g.skills.slice(0, 6).map((s) => <span key={s.name} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-mist-300">{s.name.replace(/\s*\(.*\)$/, "")}</span>)}
                    {g.skills.length > 6 && <span className="rounded-full px-2 py-0.5 text-[11px] text-mist-500">+{g.skills.length - 6} more</span>}
                  </div>
                  <button type="button" onClick={() => toggle(g.id)} className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest transition-[gap] hover:gap-2" style={{ color: g.hue }}>View all {g.skills.length} skills →</button>
                </div>
              )}
              <AnimatePresence initial={false}>
              {isOpen(g.id) && (
              <motion.ul id={`sl-${g.id}`} className="relative mt-5 divide-y divide-white/[0.05] overflow-hidden"
                initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                {g.skills.map((s, i) => (
                  <motion.li key={s.name}
                    initial={reduce ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + Math.min(i, 14) * 0.035, duration: 0.35 }}
                    className="group/s flex flex-col gap-1.5 py-2.5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="flex items-start gap-2.5 text-sm text-mist-100">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-transform group-hover/s:scale-150" style={{ background: evidenceColor[s.evidence] }} aria-hidden />
                      <span>{s.name}{s.note && <span className="ml-2 text-xs text-mist-500">({s.note})</span>}</span>
                    </span>
                    <span className={cn("self-start whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] sm:self-auto", evidenceMeta[s.evidence].className)}>{evidenceMeta[s.evidence].label}</span>
                  </motion.li>
                ))}
              </motion.ul>
              )}
              </AnimatePresence>
            </motion.section>
          ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
      {groups.length === 0 && <p className="mt-8 text-center text-sm text-mist-400">No skills match this filter.</p>}
    </div>
  );
}
