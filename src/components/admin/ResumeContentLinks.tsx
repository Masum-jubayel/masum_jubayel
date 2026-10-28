"use client";

import Link from "next/link";
import { Award, BadgeCheck, BookOpenText, BookUser, Briefcase, Cpu, FileText, GraduationCap, type LucideIcon } from "lucide-react";

const ITEMS: { key: string; label: string; hint: string; Icon: LucideIcon }[] = [
  { key: "resume", label: "Resume page settings", hint: "Headings, typewriter lines, sections shown, extra sections", Icon: FileText },
  { key: "experience", label: "Work history", hint: "Add, edit, reorder or delete jobs and duties", Icon: Briefcase },
  { key: "education", label: "Education", hint: "Degrees, schools, logos, certificates", Icon: GraduationCap },
  { key: "skills", label: "Skills & languages", hint: "Skill groups, each skill and its evidence", Icon: Cpu },
  { key: "certifications", label: "Certifications", hint: "Add or remove certificates", Icon: BadgeCheck },
  { key: "awards", label: "Awards", hint: "Awards and participation", Icon: Award },
  { key: "research", label: "Publication", hint: "Title, venue and paper", Icon: BookOpenText },
  { key: "about", label: "Summary (About introduction)", hint: "Used when the resume summary is empty", Icon: BookUser },
];

/** Shortcuts from Admin → Resume to every editor that feeds the online resume. */
export function ResumeContentLinks({ onOpen }: { onOpen?: (key: string) => void }) {
  return (
    <section className="glass p-6">
      <h2 className="text-lg font-semibold">Online resume content</h2>
      <p className="mt-1 text-sm text-mist-400">Everything on the Resume page is editable — add, change or delete any entry. Changes appear on the page as soon as you save.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {ITEMS.map(({ key, label, hint, Icon }) => {
          const body = (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"><Icon className="h-4 w-4" aria-hidden /></span>
              <span className="min-w-0"><span className="block text-sm text-mist-100">{label}</span><span className="block text-xs text-mist-500">{hint}</span></span>
              <span className="ml-auto text-xs text-cyan-300">Edit →</span>
            </>
          );
          const cls = "flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-left transition hover:border-cyan-400/40 hover:bg-white/[0.02]";
          return onOpen
            ? <button key={key} type="button" onClick={() => onOpen(key)} className={cls}>{body}</button>
            : <Link key={key} href={`/admin?tab=content&section=${key}`} className={cls}>{body}</Link>;
        })}
      </div>
    </section>
  );
}
