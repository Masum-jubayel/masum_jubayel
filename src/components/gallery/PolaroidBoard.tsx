"use client";

 
import { isVideo } from "@/lib/media";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { GalleryItem } from "@/content/gallery";
import { Lightbox } from "./Lightbox";
import { cn } from "@/lib/utils";
import { LookImg, LookVideo } from "@/components/ui/LookMedia";

/**
 * Scrapbook board in the spirit of a travel journal: polaroids fly out of a stack and scatter
 * around a centred serif title, with a numbered index down each side. Hover a name or a photo to
 * lift it; drag photos around; click to open.
 */
const SLOTS: { x: number; y: number; r: number }[] = [
  { x: 14, y: 30, r: -9 }, { x: 30, y: 52, r: 6 }, { x: 47, y: 62, r: -4 }, { x: 64, y: 50, r: 8 },
  { x: 82, y: 32, r: -7 }, { x: 20, y: 76, r: 5 }, { x: 40, y: 84, r: -8 }, { x: 58, y: 82, r: 4 },
  { x: 77, y: 74, r: -5 }, { x: 8, y: 58, r: 10 }, { x: 90, y: 58, r: -10 }, { x: 70, y: 12, r: 6 },
  { x: 28, y: 12, r: -6 }, { x: 50, y: 40, r: 3 },
];

function slot(i: number) {
  const s = SLOTS[i % SLOTS.length];
  const lap = Math.floor(i / SLOTS.length);
  return { x: Math.min(92, Math.max(8, s.x + lap * 5)), y: Math.min(76, s.y * 0.8 + 8 + lap * 6), r: s.r * (lap % 2 ? -1 : 1) };
}

export function PolaroidBoard({ items }: { items: GalleryItem[] }) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { once: true, amount: 0.25 });
  const [active, setActive] = useState<string | null>(null);
  const [top, setTop] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const half = Math.ceil(items.length / 2);
  const left = items.slice(0, half), right = items.slice(half);

  const Index = ({ list, offset, align }: { list: GalleryItem[]; offset: number; align: "left" | "right" }) => (
    <ol className={cn("hidden w-48 shrink-0 space-y-1.5 self-center lg:block", align === "right" && "text-right")}>
      {list.map((it, i) => (
        <li key={it.id}>
          <button type="button" onPointerEnter={() => { setActive(it.id); setTop(it.id); }} onPointerLeave={() => setActive(null)} onFocus={() => { setActive(it.id); setTop(it.id); }} onBlur={() => setActive(null)} onClick={() => setOpen(items.indexOf(it))}
            className={cn("group inline-flex max-w-full items-baseline gap-2 font-mono text-[11px] uppercase tracking-widest transition-colors", active === it.id ? "text-cyan-200" : "text-mist-500 hover:text-mist-200", align === "right" && "flex-row-reverse")}>
            <span className="text-mist-600">{String(offset + i + 1).padStart(2, "0")}.</span>
            <span className="truncate">{it.title}</span>
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="relative">
      <div className="flex items-stretch gap-6">
        <Index list={left} offset={0} align="left" />

        <div ref={stage} className="relative h-[680px] flex-1 sm:h-[760px] lg:h-[820px]">
          {/* title */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 text-center">
            <motion.p initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-400">The scrapbook</motion.p>
            <motion.h3 initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="mx-auto mt-3 max-w-xl font-serif text-5xl leading-[0.95] text-mist-100 sm:text-6xl lg:text-7xl">
              <em>Moments</em> worth <em className="text-gradient">keeping</em>
            </motion.h3>
          </div>

          {items.map((it, i) => {
            const s = slot(i);
            const isActive = active === it.id;
            const dim = active && !isActive;
            return (
              <motion.div
                key={it.id}
                drag={!reduce}
                dragConstraints={stage}
                dragElastic={0.15}
                dragMomentum={false}
                onDragStart={() => setTop(it.id)}
                onPointerEnter={(e) => { if (e.pointerType === "mouse") { setActive(it.id); setTop(it.id); } }}
                onPointerLeave={() => setActive(null)}
                initial={reduce ? false : { left: "50%", top: "50%", rotate: 0, scale: 0.6, opacity: 0 }}
                animate={inView || reduce ? { left: `${s.x}%`, top: `${s.y}%`, rotate: isActive ? 0 : s.r, scale: isActive ? 1.12 : 1, opacity: dim ? 0.45 : 1 } : undefined}
                transition={{ type: "spring", stiffness: 120, damping: 16, delay: inView && !active ? i * 0.07 : 0 }}
                whileDrag={{ scale: 1.15, rotate: 0, cursor: "grabbing" }}
                style={{ zIndex: top === it.id ? 30 : isActive ? 20 : 10 + (i % 5), x: "-50%", y: "-50%" }}
                className="absolute w-[clamp(120px,15vw,200px)] cursor-grab touch-none select-none"
              >
                <button type="button" onClick={() => setOpen(i)} aria-label={`Open ${it.title}`}
                  className={cn("block w-full rounded-[3px] bg-[#f4f1ea] p-2 pb-9 text-left transition-shadow duration-300", isActive ? "shadow-[0_30px_70px_-20px_rgba(62,230,255,0.55)]" : "shadow-[0_18px_40px_-14px_rgba(0,0,0,0.85)]")}>
                  <span className="block aspect-square overflow-hidden bg-ink-900">
                    {isVideo(it.src) || it.kind === "video"
                      ? <span className="relative block h-full w-full"><LookVideo src={it.src} poster={it.poster || undefined} muted loop playsInline autoPlay preload="metadata" className="h-full w-full object-cover" /><span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-[10px] text-white">▶</span></span>
                      : <span className="relative block h-full w-full overflow-hidden"><LookImg src={it.src} alt={it.title} draggable={false} loading="lazy" className="h-full w-full object-cover" /></span>}
                  </span>
                  <span className="absolute inset-x-2 bottom-2 truncate text-center font-serif text-sm italic text-[#2a2a2a]">{it.title}</span>
                </button>
                {i % 3 === 0 && <span aria-hidden className="absolute -top-2 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3 bg-cyan-200/50 backdrop-blur-sm" />}
                {i % 4 === 2 && <span aria-hidden className="absolute -right-3 -top-3 grid h-8 w-8 rotate-12 place-items-center rounded-full border border-white/20 bg-ink-900 text-[9px] font-mono text-cyan-300">{it.kind === "video" ? "VID" : it.kind === "photo" ? "IRL" : "ART"}</span>}
              </motion.div>
            );
          })}

          <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center font-serif text-base italic text-mist-400">Drag them around. Click one to look closer.</p>
        </div>

        <Index list={right} offset={half} align="right" />
      </div>
      <Lightbox items={items} index={open} onIndex={setOpen} />
    </div>
  );
}
