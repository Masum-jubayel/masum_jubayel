import { Award, BookOpenText, GraduationCap, ExternalLink, FileText, Flag, Medal, Rocket, Trophy } from "lucide-react";
import { CompanyName } from "@/components/ui/CompanyLogo";
import { ProofThumb } from "@/components/ui/ProofThumb";
import { PdfButton } from "@/components/ui/PdfButton";
import type { AwardItem, Certification, Education, Research } from "@/content/cms";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const tierStyle = {
  gold: "from-amber-300/25 to-amber-500/5 text-amber-300 border-amber-300/30",
  silver: "from-slate-200/20 to-slate-400/5 text-slate-200 border-slate-200/25",
  honor: "from-violet-400/25 to-violet-500/5 text-violet-300 border-violet-400/30",
  participation: "from-cyan-300/20 to-cyan-500/5 text-cyan-300 border-cyan-400/25",
} as const;

const kindColor: Record<string, string> = {
  Networking: "#3ee6ff", Cybersecurity: "#22ff88", Web: "#a78bfa", Embedded: "#fbbf24", IT: "#4f8cff", Support: "#38bdf8", Professional: "#f472b6",
};

/** Award cards. `only` filters to awards (gold/silver/honor) or participation entries. */
export function AwardCards({ awards, only = "awards", compact = false }: { awards: AwardItem[]; only?: "awards" | "participation" | "all"; compact?: boolean }) {
  const list = awards.filter((a) => only === "all" || (only === "participation" ? a.tier === "participation" : a.tier !== "participation"));
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", only === "participation" ? "lg:grid-cols-4" : "lg:grid-cols-4")}>
      {list.map((a, i) => {
        const tier = tierStyle[a.tier] ? a.tier : "honor";
        const Icon = tier === "gold" ? Trophy : tier === "silver" ? Medal : tier === "participation" ? Flag : Rocket;
        return (
          <Reveal flip key={a.event + a.rank + i} delay={(i % 4) * 0.06}>
            <article className="shine glass glass-hover group relative flex h-full flex-col overflow-hidden p-5">
              <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity group-hover:opacity-100", tierStyle[tier])} aria-hidden />
              {!compact && a.image && <ProofThumb src={a.image} alt={`${a.rank} — ${a.event}`} className="relative mb-4 aspect-[4/3]" />}
              <div className="relative flex items-center gap-3">
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-gradient-to-br", tierStyle[tier])}><Icon className="h-5 w-5" aria-hidden /></span>
                <p className={cn("font-display text-lg font-semibold", tierStyle[tier].split(" ").find((c) => c.startsWith("text-")))}>{a.rank}</p>
              </div>
              <p className="relative mt-3 text-sm text-mist-200">{a.event}</p>
              {a.detail && <p className="relative mt-1 text-xs text-mist-400">{a.detail}</p>}
              {a.date && <p className="relative mt-auto pt-3 font-mono text-[11px] text-mist-500">{a.date}</p>}
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

export function CertificationCards({ certifications }: { certifications: Certification[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {certifications.map((c, i) => {
        const hue = kindColor[c.kind] ?? "#3ee6ff";
        return (
          <Reveal flip key={c.name + i} delay={(i % 3) * 0.06}>
            <article className="shine glass glass-hover group relative flex h-full flex-col overflow-hidden p-5">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${hue}, transparent)` }} aria-hidden />
              {c.image && <ProofThumb src={c.image} alt={c.name} className="mb-4 aspect-[4/3]" />}
              <div className="flex items-center justify-between gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl border" style={{ color: hue, borderColor: `${hue}55`, background: `${hue}14` }}><Award className="h-5 w-5" aria-hidden /></span>
                <span className="chip" style={{ color: hue, borderColor: `${hue}44` }}>{c.kind}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug">{c.name}</h3>
              <p className="mt-2 text-xs text-mist-400">{c.listedWith}{c.instructor ? ` · Instructor: ${c.instructor}` : ""}</p>
              {c.summary && <p className="mt-3 text-sm leading-relaxed text-mist-300">{c.summary}</p>}
              {c.learned && c.learned.length > 0 && (
                <details className="group/d mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] open:bg-white/[0.03]">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-medium text-mist-200">
                    What it covered <span className="font-mono text-[10px] text-mist-500 transition-transform group-open/d:rotate-90">▸</span>
                  </summary>
                  <ul className="space-y-1.5 px-3 pb-3">
                    {c.learned.map((l) => <li key={l} className="flex gap-2 text-xs text-mist-300"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: hue }} aria-hidden />{l}</li>)}
                  </ul>
                </details>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                {c.date && <span className="font-mono text-[11px] text-mist-500">{c.date}</span>}
                <span className="ml-auto flex flex-wrap items-center gap-3">
                  {c.letter && <PdfButton src={c.letter} label={`${c.name} — ${c.letterLabel || "Letter"}`} className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200"><FileText className="h-3.5 w-3.5" aria-hidden /> {c.letterLabel || "Letter"}</PdfButton>}
                  {c.document && <PdfButton src={c.document} label={c.name} className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200"><FileText className="h-3.5 w-3.5" aria-hidden /> Certificate PDF</PdfButton>}
                </span>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

export function DegreeCards({ education }: { education: Education[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {education.map((e, i) => (
        <Reveal flip key={e.degree + i} delay={i * 0.08}>
          <article className="shine glass glass-hover group relative flex h-full flex-col overflow-hidden p-5 sm:flex-row sm:gap-5">
            <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 opacity-40 blur-3xl transition-opacity group-hover:opacity-80" aria-hidden />
            {e.image && <ProofThumb src={e.image} alt={`${e.degree} — ${e.school}`} className="mb-4 aspect-[4/3] shrink-0 sm:mb-0 sm:w-48" />}
            <div className="relative min-w-0">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300"><GraduationCap className="h-5 w-5" aria-hidden /></span>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{e.degree}</h3>
              <p className="text-sm text-cyan-300">{e.field}</p>
              <p className="mt-2 text-sm text-mist-300"><CompanyName name={e.school} website={e.website} /></p>
              <p className="text-xs text-mist-500">{e.location} · {e.date}{e.gpa ? ` · CGPA ${e.gpa}` : ""}</p>
              {e.note && <p className="mt-2 text-xs text-mist-400">{e.note}</p>}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function ResearchCard({ research }: { research: Research }) {
  return (
    <Reveal>
      <article className="glass relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_right,rgba(139,92,246,0.18),transparent_70%)]" aria-hidden />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-violet-400/30 bg-violet-500/10 text-violet-300"><BookOpenText className="h-7 w-7" aria-hidden /></span>
          <div className="min-w-0">
            <p className="eyebrow text-violet-400">Research publication · {research.year}</p>
            <h3 className="mt-3 text-xl font-semibold leading-snug sm:text-2xl">“{research.title}”</h3>
            <p className="mt-3 text-sm text-mist-300">
              Published at the {research.sponsor} {research.venue}, {research.host}.
            </p>
            {research.abstract && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-mist-300">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-violet-300">Abstract</p>
                {research.abstract}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {research.link && (/\.pdf($|\?)/i.test(research.link)
                ? <PdfButton src={research.link} label="Read the paper" className="btn-secondary" />
                : <a href={research.link} target="_blank" rel="noopener noreferrer" className="btn-secondary"><ExternalLink className="h-4 w-4" aria-hidden /> Read the paper</a>)}
              {research.certificate && <ProofThumb src={research.certificate} alt="ICIET 2019 certificate" label="View certificate" className="btn-ghost" />}
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
