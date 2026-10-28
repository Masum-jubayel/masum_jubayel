"use client";

import { isVideo } from "@/lib/media";
import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryItem } from "@/content/gallery";
import { look } from "@/lib/look";

export function Lightbox({ items, index, onIndex }: { items: GalleryItem[]; index: number | null; onIndex: (i: number | null) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const last = useRef<HTMLElement | null>(null);
  const close = useCallback(() => { onIndex(null); last.current?.focus(); }, [onIndex]);
  const go = useCallback((d: number) => { if (index !== null) onIndex((index + d + items.length) % items.length); }, [index, items.length, onIndex]);

  useEffect(() => {
    if (index === null) return;
    if (!last.current) last.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [index, close, go]);

  const cur = index !== null ? items[index] : null;
  return (
    <AnimatePresence>
      {cur && (
        <motion.div role="dialog" aria-modal="true" aria-label={cur.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur" onClick={close}>
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-mist-100">{cur.title}</p>
                <p className="text-xs text-mist-400">{cur.caption} · <span className={cur.kind === "photo" ? "text-emerald-300" : cur.kind === "video" ? "text-amber-300" : "text-violet-300"}>{cur.kind === "photo" ? "Real photo" : cur.kind === "video" ? "Video" : "Illustration"}</span></p>
              </div>
              <button ref={closeRef} onClick={close} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/15 text-mist-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <AnimatePresence mode="wait">
              {isVideo(cur.src) || cur.kind === "video" ? (
                <motion.video key={cur.id} src={look(cur.src).videoSrc} style={look(cur.src).style} poster={cur.poster || undefined} controls autoPlay playsInline initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="mx-auto max-h-[75vh] w-auto rounded-2xl border border-white/10 bg-black" />
              ) : (
                <motion.img key={cur.id} src={look(cur.src).src} style={{ filter: look(cur.src).style.filter, transform: look(cur.src).style.transform }} alt={cur.title} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }}
                  className="mx-auto max-h-[75vh] w-auto rounded-2xl border border-white/10 object-contain" />
              )}
            </AnimatePresence>
            <div className="mt-3 flex justify-between">
              <button onClick={() => go(-1)} className="btn-secondary py-2" aria-label="Previous image"><ChevronLeft className="h-4 w-4" aria-hidden /> Prev</button>
              <span className="self-center font-mono text-xs text-mist-500">{(index ?? 0) + 1} / {items.length}</span>
              <button onClick={() => go(1)} className="btn-secondary py-2" aria-label="Next image">Next <ChevronRight className="h-4 w-4" aria-hidden /></button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
