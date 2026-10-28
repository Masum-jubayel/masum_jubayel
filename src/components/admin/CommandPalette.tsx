"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, CornerDownLeft, Search } from "lucide-react";
import { sections } from "@/content/cms";
import { cn } from "@/lib/utils";

type Entry = { label: string; hint: string; tab: string; section?: string };

const TABS: [string, string][] = [
  ["overview", "Overview & site switches"], ["content", "All content sections"], ["posts", "Blog posts"], ["memories", "Memories feed"],
  ["highlights", "Home highlight cards"], ["gallery", "Gallery photos & videos"], ["media", "Media library (all files)"], ["resume", "Resume PDF & content"],
  ["comments", "Comments"], ["reports", "Reported comments"], ["messages", "Contact messages & replies"], ["settings", "Settings & backup"],
];

/** Ctrl/⌘ + K — jump to any admin tab, content section or individual setting. */
export function CommandPalette({ onGo }: { onGo?: (tab: string, section?: string) => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const entries = useMemo<Entry[]>(() => [
    ...TABS.map(([tab, hint]) => ({ label: tab[0].toUpperCase() + tab.slice(1), hint, tab })),
    ...sections.filter((s) => !s.hideInNav).map((s) => ({ label: s.label, hint: `Content · ${s.page}`, tab: "content", section: s.key })),
    ...sections.filter((s) => !s.hideInNav).flatMap((s) => s.fields.map((f) => ({ label: f.label.replace(/\s*\(.*?\)\s*/g, " ").trim(), hint: `${s.label}${f.group ? ` › ${f.group}` : ""}`, tab: "content", section: s.key }))),
  ], []);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return entries.slice(0, 12);
    return entries.filter((e) => `${e.label} ${e.hint}`.toLowerCase().includes(t)).slice(0, 30);
  }, [entries, q]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); } if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => { if (open) { setQ(""); setI(0); setTimeout(() => input.current?.focus(), 10); } }, [open]);

  const go = (e: Entry) => {
    setOpen(false);
    if (onGo) return onGo(e.tab, e.section);
    router.push(`/admin?tab=${e.tab}${e.section ? `&section=${e.section}` : ""}`);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost gap-2 border border-white/10 py-1.5 text-xs text-mist-400" title="Search the admin (Ctrl/⌘ + K)">
        <Search className="h-3.5 w-3.5" aria-hidden /> Search admin… <kbd className="flex items-center gap-0.5 rounded border border-white/15 px-1 font-mono text-[10px]"><Command className="h-2.5 w-2.5" aria-hidden />K</kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-start bg-ink-950/70 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Search the admin">
          <div className="glass mx-auto w-full max-w-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <label className="flex items-center gap-2 border-b border-white/[0.06] px-4">
              <Search className="h-4 w-4 text-mist-500" aria-hidden />
              <input ref={input} className="h-12 flex-1 bg-transparent text-sm text-mist-100 outline-none" placeholder="Jump to a tab, section or setting…" value={q}
                onChange={(e) => { setQ(e.target.value); setI(0); }}
                onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(x + 1, results.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); } if (e.key === "Enter" && results[i]) go(results[i]); }} />
            </label>
            <ul className="max-h-[50vh] overflow-y-auto p-1.5">
              {results.map((r, k) => (
                <li key={`${r.tab}-${r.section}-${r.label}-${k}`}>
                  <button type="button" onMouseEnter={() => setI(k)} onClick={() => go(r)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left", k === i ? "bg-cyan-400/10 text-cyan-100" : "text-mist-200")}>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm">{r.label}</span><span className="block truncate text-[11px] text-mist-500">{r.hint}</span></span>
                    {k === i && <CornerDownLeft className="h-3.5 w-3.5 text-cyan-300" aria-hidden />}
                  </button>
                </li>
              ))}
              {!results.length && <li className="p-6 text-center text-sm text-mist-500">Nothing found.</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
