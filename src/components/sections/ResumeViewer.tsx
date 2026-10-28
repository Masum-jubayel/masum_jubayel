"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Download, Eye, FileText, LayoutList } from "lucide-react";
import { PdfViewer } from "./PdfViewer";
import { cn } from "@/lib/utils";

/** Online resume + original PDF (rendered on the page) + full-screen reader with download. */
export function ResumeViewer({ src, online, updated, initial = "online", fileName = "Masum_Mohammad_Jubayel_Resume.pdf" }: { src: string; online: ReactNode; updated?: string; initial?: string; fileName?: string }) {
  const [view, setView] = useState<"online" | "pdf">(initial === "pdf" ? "pdf" : "online");
  const [full, setFull] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [full]);

  const tabs = [
    { id: "online" as const, label: "Online resume", Icon: LayoutList },
    { id: "pdf" as const, label: "Original PDF", Icon: FileText },
  ];
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <div role="tablist" aria-label="Resume view" className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
              className={cn("flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition", view === id ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-mist-400 hover:text-mist-100")}>
              <Icon className="h-4 w-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {updated && <span className="font-mono text-[10px] uppercase tracking-widest text-mist-500">Updated {updated}</span>}
          <button type="button" onClick={() => setFull(true)} className="btn-secondary py-2 text-sm"><Eye className="h-4 w-4" aria-hidden /> Open PDF</button>
          <a href={src} download={fileName} className="btn-primary py-2 text-sm"><Download className="h-4 w-4" aria-hidden /> Download</a>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={view} role="tabpanel" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="mt-6">
          {view === "online" ? online : (
            <div className="glass overflow-hidden"><div className="h-[85vh]"><PdfViewer src={src} /></div></div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {full && (
          <motion.div role="dialog" aria-modal="true" aria-label="Resume PDF" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-ink-950/95 backdrop-blur">
            <motion.div initial={reduce ? false : { y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="mx-auto flex h-full max-w-5xl flex-col">
              <PdfViewer src={src} onClose={() => setFull(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
