"use client";

import { SeenMotion } from "@/components/ui/SeenMotion";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Facebook, Link2, Linkedin, MapPin, MessageCircle, MessageSquare, Pin, Share2, Smile, X } from "lucide-react";
import Link from "next/link";
import type { Memory, PhotoFit, PhotoFocus, PhotoSize } from "@/content/memories";
import { LikeButton } from "@/components/blog/LikeButton";
import { Comments } from "@/components/blog/Comments";
import { cn } from "@/lib/utils";
import { isVideo } from "@/lib/media";
import { LookImg, LookVideo } from "@/components/ui/LookMedia";
import { look } from "@/lib/look";

const when = (iso: string) => {
  const d = new Date(iso); const s = (Date.now() - +d) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d`;
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
};

/** Swipeable full-screen viewer for a post's photos. */
function Viewer({ images, start, onClose }: { images: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") setI((x) => (x + 1) % images.length); if (e.key === "ArrowLeft") setI((x) => (x - 1 + images.length) % images.length); };
    window.addEventListener("keydown", k); const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [images.length, onClose]);
  return createPortal(
    <motion.div className="fixed inset-0 z-[95] grid place-items-center bg-ink-950/95 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Photo viewer">
      <AnimatePresence mode="wait">
        {isVideo(images[i])
          ? <motion.video key={images[i]} src={images[i]} controls autoPlay playsInline className="max-h-[86vh] max-w-full rounded-xl bg-black shadow-2xl" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()} />
          : <motion.img key={images[i]} src={images[i]} alt="" className="max-h-[86vh] max-w-full rounded-xl object-contain shadow-2xl" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()} />}
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button type="button" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); setI((x) => (x - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-900/80 text-mist-100"><ChevronLeft className="h-5 w-5" aria-hidden /></button>
          <button type="button" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); setI((x) => (x + 1) % images.length); }} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink-900/80 text-mist-100"><ChevronRight className="h-5 w-5" aria-hidden /></button>
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-ink-900/90 px-3 py-1 font-mono text-xs text-mist-200">{i + 1} / {images.length}</p>
        </>
      )}
      <button type="button" aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-ink-900 text-mist-100"><X className="h-5 w-5" aria-hidden /></button>
    </motion.div>,
    document.body,
  );
}

const sizeH = { compact: "h-[220px]", normal: "h-[340px]", large: "h-[480px]" } as const;
const focusPos = { top: "object-top", center: "object-center", bottom: "object-bottom" } as const;

/** Facebook-style photo grid: 1 · 2 · 3 (one big + two) · 4+ (2×2 with "+N"). Fit, focus and size are set per post in the admin. */
export function PhotoGrid({ images, onOpen, fit = "fill", focus = "center", size = "normal" }: { images: string[]; onOpen: (i: number) => void; fit?: PhotoFit; focus?: PhotoFocus; size?: PhotoSize }) {
  if (!images.length) return null;
  const shown = images.slice(0, 4);
  const extra = images.length - shown.length;
  const cols = shown.length === 1 ? "grid-cols-1" : "grid-cols-2";
  const rows = shown.length >= 3 ? "grid-rows-2" : "grid-rows-1";
  return (
    <div className={cn("grid gap-1 overflow-hidden bg-ink-950", cols, rows, sizeH[size])}>
      {shown.map((src, i) => (
        <button key={src + i} type="button" onClick={() => onOpen(i)} aria-label={`Open photo ${i + 1}`}
          className={cn("group/ph relative min-h-0 overflow-hidden bg-ink-900", shown.length === 3 && i === 0 && "row-span-2")}>
          {isVideo(src) ? (
            <>
              <LookVideo src={src} muted loop playsInline autoPlay preload="metadata" className={cn("relative h-full w-full", fit === "fit" ? "object-contain" : "object-cover", focusPos[focus])} />
              <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">▶ VIDEO</span>
            </>
          ) : (
            <>
              {fit === "fit" && <img src={look(src).src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl" />}
              <LookImg src={src} alt="" loading="lazy" className={cn("relative h-full w-full transition-transform duration-700 group-hover/ph:scale-105", fit === "fit" ? "object-contain" : "object-cover", focusPos[focus])} />
            </>
          )}
          {extra > 0 && i === 3 && <span className="absolute inset-0 grid place-items-center bg-ink-950/60 font-display text-3xl font-semibold text-white">+{extra}</span>}
        </button>
      ))}
    </div>
  );
}

function ShareMenu({ id, text }: { id: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = () => `${window.location.origin}${window.location.pathname}#memory-${id}`;
  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await navigator.share({ title: "Masum Jubayel — Memories", text: text.slice(0, 120), url: url() }); return; } catch { /* cancelled → fall back to menu */ }
    }
    setOpen((o) => !o);
  };
  const enc = (s: string) => encodeURIComponent(s);
  return (
    <div className="relative">
      <button type="button" onClick={share} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-mist-300 transition hover:border-cyan-400/40 hover:text-cyan-200" aria-expanded={open}><Share2 className="h-4 w-4" aria-hidden /> Share</button>
      <AnimatePresence>
        {open && (
          <motion.div className="glass absolute bottom-full right-0 z-20 mb-2 w-52 p-1.5" initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }}>
            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-mist-200 hover:bg-white/5" onClick={async () => { try { await navigator.clipboard.writeText(url()); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ } }}>
              {copied ? <Check className="h-4 w-4 text-emerald-300" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />} {copied ? "Link copied" : "Copy link"}
            </button>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mist-200 hover:bg-white/5" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? enc(url()) : ""}`}><Facebook className="h-4 w-4 text-[#1877f2]" aria-hidden /> Facebook</a>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mist-200 hover:bg-white/5" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== "undefined" ? enc(url()) : ""}`}><Linkedin className="h-4 w-4 text-[#0a66c2]" aria-hidden /> LinkedIn</a>
            <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-mist-200 hover:bg-white/5" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${typeof window !== "undefined" ? enc(`${text.slice(0, 100)} ${url()}`) : ""}`}><MessageCircle className="h-4 w-4 text-[#25d366]" aria-hidden /> WhatsApp</a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MemoryCard({ m, name, avatar, index }: { m: Memory; name: string; avatar: string; index: number }) {
  const reduce = useReducedMotion();
  const [viewer, setViewer] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const long = m.body.length > 280;
  return (
    <SeenMotion as="article" id={`memory-${m.id}`} className="glass scroll-mt-24 overflow-hidden"
      initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -40px 0px" }} transition={{ duration: 0.55, delay: Math.min(index, 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}>
      <header className="flex items-start gap-3 p-4 sm:p-5">
        <span className="relative shrink-0">
          {avatar ? <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover object-top ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-ink-950" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-cyan-400/20 font-semibold text-cyan-200">{name[0]}</span>}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-950 bg-emerald-400" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-mist-100"><span className="font-semibold">{name}</span>{m.feeling && <span className="text-mist-400"> is feeling <Smile className="inline h-3.5 w-3.5 text-amber-300" aria-hidden /> {m.feeling}</span>}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-mist-500">
            <time dateTime={m.date}>{when(m.date)}</time>
            {m.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{m.location}</span>}
          </p>
        </div>
        {m.pinned && <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-300"><Pin className="h-3 w-3" aria-hidden /> Pinned</span>}
      </header>
      {m.body && (
        <div className="px-4 pb-4 sm:px-5">
          <p className={cn("whitespace-pre-wrap break-words text-[15px] leading-relaxed text-mist-100", !expanded && long && "line-clamp-4")}>{m.body}</p>
          {long && <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-1 text-sm text-cyan-300 hover:underline">{expanded ? "See less" : "See more"}</button>}
        </div>
      )}
      <PhotoGrid images={m.images} onOpen={setViewer} fit={m.photoFit} focus={m.photoFocus} size={m.photoSize} />
      <footer className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-4 py-3 sm:px-5">
        <LikeButton type="memory" id={m.id} label="Like" />
        <button type="button" onClick={() => setShowComments((s) => !s)} aria-expanded={showComments}
          className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition", showComments ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-mist-300 hover:border-cyan-400/40 hover:text-cyan-200")}>
          <MessageSquare className="h-4 w-4" aria-hidden /> Comment
        </button>
        <div className="ml-auto"><ShareMenu id={m.id} text={m.body} /></div>
      </footer>
      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t border-white/[0.06]">
            <div className="p-4 sm:p-5"><Comments slug={`m-${m.id}`} title="Comments" compact /></div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{viewer !== null && <Viewer images={m.images} start={viewer} onClose={() => setViewer(null)} />}</AnimatePresence>
    </SeenMotion>
  );
}

/** Social-style "Memories" feed (status updates + photos) with likes, comments and sharing. */
export function MemoryFeed({ memories, name, avatar, limit, moreHref, wide = false }: { memories: Memory[]; name: string; avatar: string; limit?: number; moreHref?: string; wide?: boolean }) {
  const [count, setCount] = useState(limit ?? 5);
  const list = memories.filter((m) => m.published !== false);
  if (!list.length) return <p className="glass p-10 text-center text-sm text-mist-400">No memories shared yet.</p>;
  return (
    <div className={cn("mx-auto space-y-6", wide ? "max-w-none" : "max-w-2xl")}>
      {list.slice(0, count).map((m, i) => <MemoryCard key={m.id} m={m} name={name} avatar={avatar} index={i} />)}
      {count < list.length && (moreHref ? (
        <div className="text-center">
          <Link href={moreHref} className="btn-primary">See all {list.length} memories <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      ) : (
        <div className="text-center"><button type="button" className="btn-secondary" onClick={() => setCount((c) => c + 5)}>Show older memories ({list.length - count})</button></div>
      ))}
    </div>
  );
}

/** Photo wall of every image across all memories (profile "Photos" tab). */
export function MemoryPhotos({ memories }: { memories: Memory[] }) {
  const all = memories.filter((m) => m.published !== false).flatMap((m) => m.images);
  const [viewer, setViewer] = useState<number | null>(null);
  if (!all.length) return <p className="glass p-10 text-center text-sm text-mist-400">No photos yet.</p>;
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {all.map((src, i) => (
          <motion.button key={src + i} type="button" onClick={() => setViewer(i)} className="group relative aspect-square overflow-hidden rounded-xl bg-ink-900"
            initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.05 }} aria-label={`Open photo ${i + 1}`}>
            {isVideo(src) ? <LookVideo src={src} muted loop playsInline autoPlay preload="metadata" className="h-full w-full object-cover" /> : <LookImg src={src} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>{viewer !== null && <Viewer images={all} start={viewer} onClose={() => setViewer(null)} />}</AnimatePresence>
    </>
  );
}
