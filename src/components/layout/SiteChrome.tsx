"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowRight, Megaphone, Wrench, X } from "lucide-react";
import { defaultLayout, type LayoutInfo } from "@/content/cms";

const LayoutCtx = createContext<LayoutInfo>(defaultLayout);
export const useLayout = () => useContext(LayoutCtx);

const tones: Record<string, string> = {
  info: "border-cyan-400/40 text-cyan-100 shadow-[0_0_30px_rgba(62,230,255,0.25)]",
  success: "border-emerald-400/40 text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.25)]",
  warning: "border-amber-300/50 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.25)]",
  promo: "border-violet-400/50 text-violet-100 shadow-[0_0_30px_rgba(167,139,250,0.3)]",
};

/** Applies Site controls everywhere: motion settings, announcement bar and maintenance mode. */
export function SiteChrome({ layout, children }: { layout: LayoutInfo; children: ReactNode }) {
  const pathname = usePathname() || "/";
  const [closed, setClosed] = useState(false);
  const admin = pathname.startsWith("/admin");

  const router = useRouter();
  // Hidden way into the admin (no public link): Ctrl/⌘ + Shift + A, or tap the © line in the footer 5 times.
  useEffect(() => {
    let taps: number[] = [];
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") { e.preventDefault(); router.push("/admin"); } };
    const click = (e: MouseEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-admin-tap]")) return;
      const now = Date.now(); taps = [...taps.filter((t) => now - t < 3000), now];
      if (taps.length >= 5) { taps = []; router.push("/admin"); }
    };
    window.addEventListener("keydown", key); document.addEventListener("click", click);
    return () => { window.removeEventListener("keydown", key); document.removeEventListener("click", click); };
  }, [router]);
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("fx-calm", layout.fxCalm);
    el.classList.toggle("no-ambient", !layout.fxAmbient);
    el.classList.toggle("no-header-motion", !layout.fxHeaderMotion);
    el.classList.toggle("no-progress", !layout.fxScrollProgress);
  }, [layout.fxCalm, layout.fxAmbient, layout.fxHeaderMotion, layout.fxScrollProgress]);

  const link = layout.announceLink && /^(\/|https?:\/\/)/.test(layout.announceLink) ? layout.announceLink : "";
  return (
    <LayoutCtx.Provider value={layout}>
      <MotionConfig reducedMotion={layout.fxCalm ? "always" : "user"}>
        {children}

        <AnimatePresence>
          {layout.announceOn && layout.announceText && !closed && !admin && (
            <motion.div role="status" className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4"
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ delay: 1.2, type: "spring", stiffness: 160, damping: 20 }}>
              <div className={`glass flex max-w-2xl items-center gap-3 rounded-full border bg-ink-950/90 py-2 pl-4 pr-2 text-sm backdrop-blur ${tones[layout.announceTone] ?? tones.info}`}>
                <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/5"><span className="absolute inset-0 animate-ping rounded-full bg-current opacity-10" /><Megaphone className="h-3.5 w-3.5" aria-hidden /></span>
                {link ? (
                  <Link href={link} className="group inline-flex min-w-0 items-center gap-1.5 hover:underline">
                    <span className="truncate">{layout.announceText}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                ) : <span className="min-w-0 truncate">{layout.announceText}</span>}
                <button type="button" onClick={() => setClosed(true)} aria-label="Dismiss announcement" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-mist-400 hover:bg-white/10 hover:text-mist-100"><X className="h-3.5 w-3.5" aria-hidden /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {layout.maintenanceOn && !admin && (
          <div role="alertdialog" aria-modal="true" aria-label={layout.maintenanceTitle} className="fixed inset-0 z-[100] grid place-items-center bg-ink-950/95 px-6 backdrop-blur-xl">
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
            <motion.div className="relative max-w-lg text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <motion.span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300" animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
                <Wrench className="h-7 w-7" aria-hidden />
              </motion.span>
              <h1 className="mt-6 text-3xl font-semibold">{layout.maintenanceTitle}</h1>
              <p className="mt-3 text-mist-300">{layout.maintenanceText}</p>
              <div className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" animate={{ x: ["-100%", "300%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} /></div>
            </motion.div>
          </div>
        )}
      </MotionConfig>
    </LayoutCtx.Provider>
  );
}
