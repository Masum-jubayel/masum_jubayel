"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpenText, Briefcase, ExternalLink, FileText, FileBadge, Maximize2, RadioTower, Sparkles, Wrench, X, type LucideIcon } from "lucide-react";
import type { WorkItem } from "@/content/cms";
import { cn } from "@/lib/utils";
import { PdfButton } from "@/components/ui/PdfButton";
import { LookImg } from "@/components/ui/LookMedia";

const catStyle: Record<string, { icon: LucideIcon; hue: string }> = {
  Research: { icon: BookOpenText, hue: "#a78bfa" },
  "Project lead": { icon: RadioTower, hue: "#3ee6ff" },
  "Field work": { icon: Wrench, hue: "#34d399" },
  Certificate: { icon: FileBadge, hue: "#fbbf24" },
  Documentation: { icon: FileText, hue: "#4f8cff" },
  Other: { icon: Sparkles, hue: "#f472b6" },
};

export function WorkCards({ works }: { works: WorkItem[] }) {
  const items = works.filter((w) => w.published !== false);
  const [open, setOpen] = useState<WorkItem | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open && !zoom) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { if (zoom) setZoom(null); else setOpen(null); } };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, zoom]);

  if (!items.length) return <p className="glass p-8 text-center text-sm text-mist-400">No work items yet.</p>;

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {items.map((w, i) => {
          const st = catStyle[w.category] ?? catStyle.Other;
          const Icon = st.icon;
          return (
            <motion.article
              key={w.id}
              initial={reduce ? false : { opacity: 0, y: 28, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduce ? undefined : { y: -4 }}
              style={{ ["--hue" as string]: st.hue }}
              className={cn("group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/70 p-6 backdrop-blur", w.featured && w.image && "lg:col-span-2 lg:flex-row lg:gap-8")}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--hue)] to-transparent opacity-70" aria-hidden />
              <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40" style={{ background: st.hue }} aria-hidden />

              {w.image && (
                <button type="button" onClick={() => setZoom(w.image)} className={cn("relative mb-5 block shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white text-left", w.featured ? "lg:mb-0 lg:w-[44%]" : "")} aria-label={`Enlarge ${w.imageCaption || w.title}`}>
                  <LookImg src={w.image} alt={w.imageCaption || w.title} className="aspect-[4/3] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                  <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-ink-950/70 text-mist-100 opacity-0 transition-opacity group-hover:opacity-100"><Maximize2 className="h-4 w-4" aria-hidden /></span>
                  {w.imageCaption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent px-3 pb-2 pt-6 font-mono text-[10px] uppercase tracking-wider text-mist-100">{w.imageCaption}</span>}
                </button>
              )}

              <div className="relative flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border" style={{ borderColor: `${st.hue}55`, background: `${st.hue}1a`, color: st.hue }}><Icon className="h-5 w-5" aria-hidden /></span>
                  <span className="chip" style={{ borderColor: `${st.hue}44`, color: st.hue }}>{w.category}</span>
                  {w.date && <span className="font-mono text-[11px] text-mist-500">{w.date}</span>}
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug sm:text-xl">{w.title}</h3>
                {(w.org || w.role) && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-mist-400">
                    {w.org && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" aria-hidden />{w.org}</span>}
                    {w.role && <span className="text-mist-500">· {w.role}</span>}
                  </p>
                )}
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-mist-300">{w.summary}</p>

                {w.metrics.length > 0 && (
                  <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {w.metrics.slice(0, 4).map((m) => (
                      <div key={m.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <dt className="sr-only">{m.label}</dt>
                        <dd className="font-display text-base font-semibold" style={{ color: st.hue }}>{m.value}</dd>
                        <p className="text-[10px] leading-tight text-mist-500" aria-hidden>{m.label}</p>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                  <button type="button" onClick={() => setOpen(w)} className="btn-secondary py-2 text-xs">Details</button>
                  {w.document && <PdfButton src={w.document} label={w.documentLabel || "Document"} className="btn-ghost py-2 text-xs"><FileText className="h-3.5 w-3.5" aria-hidden /> {w.documentLabel || "Document"}</PdfButton>}
                  {w.link && <a href={w.link} target="_blank" rel="noopener noreferrer" className="btn-ghost py-2 text-xs"><ExternalLink className="h-3.5 w-3.5" aria-hidden /> Link</a>}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div role="dialog" aria-modal="true" aria-label={open.title} initial={{ y: 30, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} onClick={(e) => e.stopPropagation()} className="glass relative max-h-[88vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8">
              <button type="button" onClick={() => setOpen(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-mist-300 hover:text-mist-100" aria-label="Close"><X className="h-4 w-4" aria-hidden /></button>
              <p className="eyebrow">{open.category}{open.date ? ` · ${open.date}` : ""}</p>
              <h3 className="mt-3 pr-10 text-xl font-semibold sm:text-2xl">{open.title}</h3>
              <p className="mt-2 text-sm text-mist-400">{[open.org, open.role].filter(Boolean).join(" · ")}</p>
              <p className="mt-5 text-sm leading-relaxed text-mist-200">{open.summary}</p>
              {open.points.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {open.points.map((p) => <li key={p} className="flex gap-3 text-sm text-mist-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden />{p}</li>)}
                </ul>
              )}
              {open.image && <button type="button" onClick={() => setZoom(open.image)} className="mt-6 block w-full overflow-hidden rounded-xl border border-white/10 bg-white"><img src={open.image} alt={open.imageCaption || open.title} className="w-full" /></button>}
              {open.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-1.5">{open.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>}
              <div className="mt-6 flex flex-wrap gap-2">
                {open.document && <PdfButton src={open.document} label={open.documentLabel || "Open document"} className="btn-primary py-2 text-sm" />}
                {open.link && <a href={open.link} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 text-sm"><ExternalLink className="h-4 w-4" aria-hidden /> Visit link</a>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoom && (
          <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-ink-950/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(null)} role="dialog" aria-modal="true" aria-label="Image preview">
            <motion.img src={zoom} alt="" initial={{ scale: 0.92 }} animate={{ scale: 1 }} className="max-h-[90vh] max-w-full rounded-xl bg-white shadow-2xl" />
            <button type="button" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-ink-900 text-mist-100" aria-label="Close preview"><X className="h-5 w-5" aria-hidden /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
