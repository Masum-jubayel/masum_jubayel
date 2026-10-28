"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page numbers with ellipses: 1 … 4 5 6 … 12 */
function pagesFor(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
  const list = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  list.forEach((n, i) => { if (i && n - list[i - 1] > 1) out.push("…"); out.push(n); });
  return out;
}

/** Animated pager: Previous · numbered pages · Next, plus "Showing 13–24 of 30". */
export function Pagination({ page, total, onPage, from, to, count, label = "items" }: { page: number; total: number; onPage: (p: number) => void; from: number; to: number; count: number; label?: string }) {
  const reduce = useReducedMotion();
  if (total <= 1) return null;
  const btn = "grid h-10 min-w-10 place-items-center rounded-xl border px-3 font-mono text-sm transition disabled:pointer-events-none disabled:opacity-35";
  return (
    <nav aria-label="Pages" className="mt-10 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button type="button" className={cn(btn, "gap-1 border-white/10 text-mist-300 hover:border-cyan-300/50 hover:text-cyan-200")} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <span className="flex items-center gap-1"><ChevronLeft className="h-4 w-4" aria-hidden /><span className="hidden text-xs uppercase tracking-widest sm:inline">Prev</span></span>
        </button>
        {pagesFor(page, total).map((n, i) => n === "…"
          ? <span key={`e${i}`} className="px-1 text-mist-600" aria-hidden>…</span>
          : (
            <button key={n} type="button" onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`}
              className={cn(btn, "relative overflow-hidden", n === page ? "border-cyan-300/60 text-ink-950" : "border-white/10 text-mist-300 hover:border-cyan-300/50 hover:text-cyan-200")}>
              {n === page && <motion.span layoutId={reduce ? undefined : "page-pill"} className="absolute inset-0 bg-cyan-300 shadow-[0_0_24px_-4px_rgba(62,230,255,0.9)]" transition={{ type: "spring", stiffness: 380, damping: 30 }} aria-hidden />}
              <span className="relative font-semibold">{n}</span>
            </button>
          ))}
        <button type="button" className={cn(btn, "gap-1 border-white/10 text-mist-300 hover:border-cyan-300/50 hover:text-cyan-200")} disabled={page >= total} onClick={() => onPage(page + 1)} aria-label="Next page">
          <span className="flex items-center gap-1"><span className="hidden text-xs uppercase tracking-widest sm:inline">Next</span><ChevronRight className="h-4 w-4" aria-hidden /></span>
        </button>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-mist-500">Showing {from}–{to} of {count} {label}</p>
    </nav>
  );
}
