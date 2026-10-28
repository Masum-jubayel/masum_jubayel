"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, BookOpenText, BookUser, Briefcase, Cpu, FolderKanban, GraduationCap, Heading, Microscope, Trophy, UserRound, FileText, ImageIcon, Newspaper, Sparkles, Camera, SlidersHorizontal, Box, Mail, Search, LayoutGrid, type LucideIcon } from "lucide-react";
import { contentNavGroups, sections, type ContentKey } from "@/content/cms";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = { BadgeCheck, BookOpenText, BookUser, Briefcase, Cpu, FolderKanban, GraduationCap, Heading, Microscope, Trophy, UserRound, SlidersHorizontal, FileText, Box, Mail, LayoutGrid };
const extras = [["memories", "Gallery memories", Camera], ["highlights", "Home highlight cards", Sparkles], ["posts", "Blog posts", Newspaper], ["gallery", "Gallery photos", ImageIcon], ["resume", "Resume PDF", FileText]] as const;

/** Grouped section navigation for the admin Content tab. Links (real admin) or buttons (demo). */
export function ContentNav({ active, edited, onSelect, onTab }: { active: ContentKey; edited: string[]; onSelect?: (k: ContentKey) => void; onTab?: (t: string) => void }) {
  const item = (key: string, label: string, Icon: LucideIcon, on: boolean, dot: boolean, href: string, click?: () => void) => {
    const cls = cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition", on ? "bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-400/25" : "text-mist-300 hover:bg-white/5 hover:text-mist-100");
    const body = <><Icon className={cn("h-4 w-4 shrink-0", on ? "text-cyan-300" : "text-mist-500")} aria-hidden /><span className="min-w-0 flex-1 truncate">{label}</span>{dot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Edited" />}</>;
    return click ? <button key={key} type="button" onClick={click} className={cls} aria-current={on ? "page" : undefined}>{body}</button> : <Link key={key} href={href} className={cls} aria-current={on ? "page" : undefined}>{body}</Link>;
  };
  const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  // Search matches section names and every setting label inside them.
  const match = (s: (typeof sections)[number]) => !s.hideInNav && (!t || `${s.label} ${s.page} ${s.fields.map((f) => `${f.label} ${f.group ?? ""}`).join(" ")}`.toLowerCase().includes(t));
  return (
    <nav aria-label="Content sections" className="glass h-fit space-y-4 p-2 lg:sticky lg:top-20">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-500" aria-hidden />
        <input className="input py-1.5 pl-8 text-xs" placeholder="Search all settings…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search all settings" />
      </label>
      {contentNavGroups.filter((g) => sections.some((s) => s.nav === g && match(s))).map((g) => (
        <div key={g}>
          <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-widest text-mist-500">{g}</p>
          {sections.filter((s) => s.nav === g && match(s)).map((s) => item(s.key, s.label, icons[s.icon] ?? FileText, s.key === active, edited.includes(s.key), `/admin?tab=content&section=${s.key}`, onSelect ? () => onSelect(s.key) : undefined))}
        </div>
      ))}
      <div>
        <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-widest text-mist-500">Other tabs</p>
        {extras.map(([t, l, I]) => item(t, l, I, false, false, `/admin?tab=${t}`, onTab ? () => onTab(t) : undefined))}
      </div>
    </nav>
  );
}
