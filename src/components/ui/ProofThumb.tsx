"use client";
import { LookImg } from "@/components/ui/LookMedia";
import { look } from "@/lib/look";

 
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Award, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Certificate thumbnail that opens a full-screen preview. */
/** Pass `label` to render a button instead of a thumbnail. */
export function ProofThumb({ src, alt, className, label }: { src: string; alt: string; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);
  return (
    <>
      {label ? (
        <button type="button" onClick={() => setOpen(true)} className={className ?? "btn-ghost"}><Award className="h-4 w-4" aria-hidden /> {label}</button>
      ) : (
      <button type="button" onClick={() => setOpen(true)} aria-label={`View certificate: ${alt}`} className={cn("group/thumb relative block w-full overflow-hidden rounded-xl border border-white/10 bg-white", className)}>
        <LookImg src={src} alt={alt} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-700 group-hover/thumb:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent opacity-0 transition-opacity group-hover/thumb:opacity-100" aria-hidden />
        <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-ink-950/75 text-mist-100 opacity-0 transition-opacity group-hover/thumb:opacity-100" aria-hidden><Maximize2 className="h-3.5 w-3.5" /></span>
      </button>
      )}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-ink-950/90 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={alt}>
              <motion.img src={look(src).src} style={{ filter: look(src).style.filter }} alt={alt} initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="max-h-[88vh] max-w-full rounded-xl bg-white shadow-2xl" />
              <p className="absolute bottom-4 left-1/2 max-w-[90vw] -translate-x-1/2 truncate rounded-full bg-ink-900/90 px-4 py-1.5 text-xs text-mist-200">{alt}</p>
              <button type="button" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-ink-900 text-mist-100" aria-label="Close preview"><X className="h-5 w-5" aria-hidden /></button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
