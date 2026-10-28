"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";
import { fetchLikes, toggleLike, type LikeType } from "@/lib/likes-client";
import { cn } from "@/lib/utils";

/**
 * Heart button with a burst animation. Pass `initial` when counts were already fetched in bulk
 * (comments); otherwise it loads its own count (post page).
 */
export function LikeButton({ type, id, initial, size = "md", label }: { type: LikeType; id: string; initial?: { count: number; liked: boolean } | null; size?: "sm" | "md" | "lg"; label?: string }) {
  const [count, setCount] = useState(initial?.count ?? 0);
  const [liked, setLiked] = useState(initial?.liked ?? false);
  const [ready, setReady] = useState(Boolean(initial));
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (initial) { setCount(initial.count); setLiked(initial.liked); setReady(true); return; }
    let on = true;
    fetchLikes(type, [id]).then((s) => { if (!on) return; setCount(s.counts[id] ?? 0); setLiked(s.mine.includes(id)); setReady(s.configured); }).catch(() => {});
    return () => { on = false; };
  }, [type, id, initial]);

  // Keep several buttons for the same item (e.g. top and bottom of an article) in sync.
  useEffect(() => {
    const ev = `like:${type}:${id}`;
    const on = (e: Event) => { const d = (e as CustomEvent<{ count: number; liked: boolean }>).detail; setCount(d.count); setLiked(d.liked); };
    window.addEventListener(ev, on);
    return () => window.removeEventListener(ev, on);
  }, [type, id]);
  const broadcast = (d: { count: number; liked: boolean }) => window.dispatchEvent(new CustomEvent(`like:${type}:${id}`, { detail: d }));

  const click = async () => {
    if (busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next); setCount((c) => Math.max(0, c + (next ? 1 : -1))); if (next) setBurst((b) => b + 1);
    try { const r = await toggleLike(type, id); broadcast({ count: r.count, liked: r.liked }); }
    catch { setLiked(!next); setCount((c) => Math.max(0, c + (next ? -1 : 1))); }
    finally { setBusy(false); }
  };

  const icon = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <button
      type="button" onClick={click} disabled={!ready && !initial} aria-pressed={liked}
      aria-label={`${liked ? "Unlike" : "Like"} this ${type}${count ? ` (${count} likes)` : ""}`}
      className={cn(
        "group relative inline-flex items-center gap-1.5 rounded-full border transition",
        size === "sm" ? "px-2 py-1 text-xs" : size === "lg" ? "px-5 py-2.5 text-base" : "px-3 py-1.5 text-sm",
        liked ? "border-rose-400/50 bg-rose-500/10 text-rose-300" : "border-white/10 text-mist-300 hover:border-rose-400/40 hover:text-rose-300",
        !ready && "opacity-60",
      )}
    >
      <span className="relative grid place-items-center">
        <motion.span key={burst} initial={burst ? { scale: 0.6 } : false} animate={{ scale: [0.6, 1.35, 1] }} transition={{ duration: 0.45 }}>
          <Heart className={cn(icon, liked && "fill-current")} aria-hidden />
        </motion.span>
        <AnimatePresence>
          {burst > 0 && liked && (
            <motion.span key={`b${burst}`} className="pointer-events-none absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} aria-hidden>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span key={i} className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-rose-400"
                  initial={{ x: 0, y: 0 }} animate={{ x: Math.cos((i / 8) * Math.PI * 2) * 16, y: Math.sin((i / 8) * Math.PI * 2) * 16 }} transition={{ duration: 0.6 }} />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="tabular-nums">{count}</span>
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
