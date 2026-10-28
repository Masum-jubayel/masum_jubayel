"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { FileText } from "lucide-react";
import { PdfViewer } from "@/components/sections/PdfViewer";

/** Button that opens a PDF right on the page (pdf.js viewer in an overlay) instead of a new tab. */
export function PdfButton({ src, label, className = "btn-secondary", children, fileName }: { src: string; label: string; className?: string; children?: ReactNode; fileName?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);
  const name = fileName || decodeURIComponent(src.split("/").pop() || "document.pdf");
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children ?? <><FileText className="h-4 w-4" aria-hidden /> {label}</>}
      </button>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div className="fixed inset-0 z-[95] flex flex-col bg-ink-950/95 p-2 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={label}>
              <motion.div initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="glass mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden">
                <p className="truncate border-b border-white/[0.06] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-mist-400">{label}</p>
                <div className="min-h-0 flex-1"><PdfViewer src={src} fileName={name} onClose={() => setOpen(false)} /></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
