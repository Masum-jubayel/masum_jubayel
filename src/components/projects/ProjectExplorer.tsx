"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Search, X } from "lucide-react";
import { categories, type Project } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

export function ProjectExplorer({ projects, perPage = 12 }: { projects: Project[]; perPage?: number }) {
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const category = params.get("category") || "all";

  const setCategory = (c: string) => {
    const sp = new URLSearchParams(params.toString());
    if (c === "all") sp.delete("category"); else sp.set("category", c);
    sp.delete("page");
    router.replace(`/projects${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  };

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects.filter((p) =>
      (category === "all" || p.category === category) &&
      (status === "all" || p.status === status) &&
      (!term || [p.title, p.overview, p.category, p.context, ...p.tech].join(" ").toLowerCase().includes(term)),
    );
  }, [projects, q, category, status]);

  const size = Math.max(1, perPage || 12);
  const totalPages = Math.max(1, Math.ceil(results.length / size));
  const page = Math.min(totalPages, Math.max(1, Number(params.get("page")) || 1));
  const shown = results.slice((page - 1) * size, page * size);
  const top = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const goPage = (n: number) => {
    const sp = new URLSearchParams(params.toString());
    if (n <= 1) sp.delete("page"); else sp.set("page", String(n));
    router.replace(`/projects${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  };
  useEffect(() => { if (first.current) { first.current = false; return; } top.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, [page, reduce]);
  // A new search or filter starts again from page 1.
  const resetKey = `${q}|${status}|${category}`;
  const lastKey = useRef(resetKey);
  useEffect(() => { if (lastKey.current !== resetKey) { lastKey.current = resetKey; if (page !== 1) goPage(1); } });

  const counts = useMemo(() => Object.fromEntries(categories.map((c) => [c, projects.filter((p) => p.category === c).length])), [projects]);

  return (
    <div ref={top} className="scroll-mt-24">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, technology, context…" className="input pl-11" type="search" />
        </label>
        <div role="radiogroup" aria-label="Status" className="flex rounded-xl border border-white/10 p-1">
          {(["all", "published", "draft"] as const).map((s) => (
            <button key={s} role="radio" aria-checked={status === s} onClick={() => setStatus(s)} className={cn("rounded-lg px-3 py-2 text-xs capitalize transition", status === s ? "bg-cyan-400/15 text-cyan-200" : "text-mist-400 hover:text-mist-100")}>
              {s === "all" ? "All" : s === "published" ? "Case studies" : "Drafts"}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2" aria-label="Categories">
        <button onClick={() => setCategory("all")} aria-pressed={category === "all"} className={cn("chip shrink-0 px-3 py-1.5", category === "all" && "border-cyan-400/50 text-cyan-200")}>All ({projects.length})</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={cn("chip shrink-0 px-3 py-1.5", category === c && "border-cyan-400/50 text-cyan-200")}>
            {c} ({counts[c]})
          </button>
        ))}
      </div>

      <p className="mt-6 font-mono text-[11px] text-mist-500" aria-live="polite">{results.length} project{results.length === 1 ? "" : "s"}{totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}</p>
      <motion.div layout={!reduce} className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.div key={p.slug} layout={!reduce} initial={reduce ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <Pagination page={page} total={totalPages} onPage={goPage} from={(page - 1) * size + 1} to={Math.min(page * size, results.length)} count={results.length} label="projects" />
      {results.length === 0 && (
        <div className="glass mt-6 flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-mist-300">No projects match those filters.</p>
          <button className="btn-secondary" onClick={() => { setQ(""); setStatus("all"); setCategory("all"); }}><X className="h-4 w-4" aria-hidden /> Clear filters</button>
        </div>
      )}
    </div>
  );
}
