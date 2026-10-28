"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Crosshair, FlipHorizontal2, RotateCcw, RotateCw, Scissors, SlidersHorizontal, Wand2, X } from "lucide-react";
import { defaultLook, getLook, look as applyLook, lookPresets, lookStyle, stripLook, withLook, type Look } from "@/lib/look";
import { isVideo } from "@/lib/media";
import { cn } from "@/lib/utils";

const FRAMES = [["4/3", "4:3"], ["1/1", "Square"], ["16/9", "Wide"], ["4/5", "Portrait"], ["3/1", "Banner"]] as const;

/**
 * Photo & video editor for the admin: focal point (click/drag), zoom, rotate, flip, fit,
 * brightness / contrast / saturation / B&W / sepia / hue / blur / vignette, quick presets,
 * and video trim (start / end). Non-destructive — saved on the URL, original file untouched.
 */
export function MediaEditor({ src, onApply, onClose, title = "Edit photo" }: { src: string; onApply: (url: string) => void; onClose: () => void; title?: string }) {
  const [l, setL] = useState<Look>(() => getLook(src));
  const [frame, setFrame] = useState<string>("4/3");
  const [dur, setDur] = useState(0);
  const [compare, setCompare] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const dragging = useRef(false);
  const video = isVideo(src);
  const clean = stripLook(src);
  const set = (p: Partial<Look>) => setL((x) => ({ ...x, ...p }));

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);

  const pick = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    set({ x: Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))), y: Math.round(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100))) });
  };
  const shown = compare ? defaultLook : l;
  const fx = applyLook(withLook(clean, shown));

  const slider = (key: keyof Look, label: string, min: number, max: number, unit = "", step = 1) => (
    <label className="block">
      <span className="flex justify-between text-[11px] text-mist-400"><span>{label}</span><span className="font-mono text-mist-200">{String(l[key])}{unit}</span></span>
      <input type="range" min={min} max={max} step={step} value={Number(l[key])} onChange={(e) => set({ [key]: Number(e.target.value) } as Partial<Look>)} onDoubleClick={() => set({ [key]: defaultLook[key] } as Partial<Look>)} className="mt-1 w-full accent-cyan-400" />
    </label>
  );

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-950/80 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="glass flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold"><Wand2 className="h-4 w-4 text-cyan-300" aria-hidden />{title}</p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-ghost px-2 py-1 text-xs" onPointerDown={() => setCompare(true)} onPointerUp={() => setCompare(false)} onPointerLeave={() => setCompare(false)}>Hold to compare</button>
            <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => setL({ ...defaultLook })}><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset</button>
            <button type="button" className="btn-ghost px-1.5 py-1" onClick={onClose} aria-label="Close"><X className="h-4 w-4" aria-hidden /></button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-w-0 flex-col gap-3 p-4">
            <div className="flex flex-wrap gap-1">
              {FRAMES.map(([v, n]) => <button key={v} type="button" onClick={() => setFrame(v)} className={cn("rounded-md border px-2 py-1 font-mono text-[10px] uppercase", frame === v ? "border-cyan-300 bg-cyan-400/15 text-cyan-200" : "border-white/10 text-mist-400")}>{n}</button>)}
              <span className="ml-auto self-center text-[11px] text-mist-500"><Crosshair className="mr-1 inline h-3 w-3" aria-hidden />Click or drag to set the focus point</span>
            </div>
            <div ref={box} className="relative mx-auto w-full max-w-2xl cursor-crosshair touch-none overflow-hidden rounded-xl border border-white/10 bg-ink-900" style={{ aspectRatio: frame }}
              onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); pick(e); }} onPointerMove={(e) => dragging.current && pick(e)} onPointerUp={() => { dragging.current = false; }}>
              {video
                ? <video ref={vid} src={clean} muted playsInline controls={false} loop className="pointer-events-none h-full w-full object-cover" style={lookStyle(shown)} onLoadedMetadata={(e) => setDur(Math.floor(e.currentTarget.duration || 0))} autoPlay />
                : <img src={clean} alt="" draggable={false} className="pointer-events-none h-full w-full select-none object-cover" style={lookStyle(shown)} />}
              {fx.vignette && <span className="pointer-events-none absolute inset-0" style={fx.vignette} aria-hidden />}
              {!compare && <span className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300 shadow-[0_0_0_2px_rgba(0,0,0,0.5)]" style={{ left: `${l.x}%`, top: `${l.y}%` }} aria-hidden />}
              {compare && <span className="absolute left-2 top-2 rounded bg-ink-950/80 px-2 py-0.5 font-mono text-[10px] text-mist-200">ORIGINAL</span>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {lookPresets.map((p) => {
                const pl = { ...l, ...p.look };
                return (
                  <button key={p.name} type="button" onClick={() => set(p.look)} className="shrink-0 text-center">
                    <span className="block h-14 w-20 overflow-hidden rounded-lg border border-white/10 bg-ink-900">
                      {video ? <span className="grid h-full place-items-center text-[10px] text-mist-500" style={{ filter: lookStyle(pl).filter as string }}>{p.name}</span>
                        : <img src={clean} alt="" className="h-full w-full object-cover" style={{ filter: lookStyle(pl).filter, objectPosition: `${l.x}% ${l.y}%` }} />}
                    </span>
                    <span className="mt-1 block text-[10px] text-mist-400">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-4 border-t border-white/[0.06] p-4 md:border-l md:border-t-0">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-cyan-300">Frame</p>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => set({ rot: ((l.rot - 90 + 540) % 360) - 180 })}><RotateCcw className="h-3.5 w-3.5" aria-hidden /> 90°</button>
                <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => set({ rot: ((l.rot + 90 + 540) % 360) - 180 })}><RotateCw className="h-3.5 w-3.5" aria-hidden /> 90°</button>
                <button type="button" className={cn("btn-ghost px-2 py-1 text-xs", l.flip && "text-cyan-300")} onClick={() => set({ flip: !l.flip })}><FlipHorizontal2 className="h-3.5 w-3.5" aria-hidden /> Flip</button>
                <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => set({ fit: l.fit === "cover" ? "contain" : "cover" })}>{l.fit === "cover" ? "Fill frame" : "Show whole"}</button>
              </div>
              <div className="mt-3 space-y-2">{slider("zoom", "Zoom", 100, 300, "%")}{slider("rot", "Straighten / rotate", -180, 180, "°")}</div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-300"><SlidersHorizontal className="h-3 w-3" aria-hidden /> Light & colour</p>
              <div className="space-y-2">
                {slider("bright", "Brightness", 30, 200, "%")}{slider("contrast", "Contrast", 30, 200, "%")}{slider("sat", "Saturation", 0, 250, "%")}
                {slider("gray", "Black & white", 0, 100, "%")}{slider("sepia", "Warmth (sepia)", 0, 100, "%")}{slider("hue", "Hue shift", -180, 180, "°")}
                {slider("blur", "Soft blur", 0, 10, "px", 0.5)}{slider("vign", "Vignette", 0, 100, "%")}
              </div>
            </div>
            {video && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-300"><Scissors className="h-3 w-3" aria-hidden /> Trim video {dur ? `· ${dur}s long` : ""}</p>
                <div className="space-y-2">
                  {slider("t0", "Start at", 0, Math.max(dur, l.t0, 1), "s")}
                  {slider("t1", "End at (0 = to the end)", 0, Math.max(dur, l.t1, 1), "s")}
                  <div className="flex gap-1.5">
                    <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => vid.current && set({ t0: Math.floor(vid.current.currentTime) })}>Start = now</button>
                    <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => vid.current && set({ t1: Math.ceil(vid.current.currentTime) })}>End = now</button>
                    <button type="button" className="btn-ghost px-2 py-1 text-xs" onClick={() => { if (vid.current) { vid.current.currentTime = l.t0; vid.current.play().catch(() => {}); } }}>Play from start</button>
                  </div>
                </div>
              </div>
            )}
            <p className="text-[11px] leading-relaxed text-mist-500">Double-click a slider to reset it. Your original file is never changed — these settings are saved with the item and can be undone any time.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-4 py-3">
          <button type="button" className="btn-ghost text-sm" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary py-2 text-sm" onClick={() => { onApply(withLook(src, l)); onClose(); }}><Check className="h-4 w-4" aria-hidden /> Apply</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Small "Edit" button that opens the editor for a URL. */
export function EditMediaButton({ src, onChange, className, label = "Edit" }: { src: string; onChange: (url: string) => void; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  const edited = applyLook(src).edited;
  return (
    <>
      <button type="button" className={cn("btn-ghost px-2 py-1 text-xs", edited && "text-cyan-300", className)} onClick={() => setOpen(true)} title="Crop, focus, rotate, colour, trim">
        <Wand2 className="h-3.5 w-3.5" aria-hidden /> {label}{edited ? " ·" : ""}
      </button>
      {open && <MediaEditor src={src} onApply={onChange} onClose={() => setOpen(false)} title={isVideo(src) ? "Edit video" : "Edit photo"} />}
    </>
  );
}
