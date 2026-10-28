"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StaticFallback } from "./StaticFallback";
import type { Tier } from "./Scene";
import type { SceneInfo } from "@/content/cms";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

type Mode = "pending" | "3d" | "static";

function detect(): { mode: Mode; tier: Tier } {
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData) return { mode: "static", tier: "low" };
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return { mode: "static", tier: "low" };
    const mem = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency ?? 8;
    if (mem < 2 || cores < 2) return { mode: "static", tier: "low" };
    const small = window.matchMedia("(max-width: 768px)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const tier: Tier = small || coarse || mem < 4 || cores < 4 ? "low" : "high";
    return { mode: "3d", tier };
  } catch {
    return { mode: "static", tier: "low" };
  }
}

export function HeroScene({ characterModelUrl, settings, hologram = true }: { characterModelUrl?: string; settings?: SceneInfo; hologram?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [{ mode, tier }, setCap] = useState<{ mode: Mode; tier: Tier }>({ mode: "pending", tier: "low" });
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    // defer heavy work until the browser is idle so text paints first
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const id = ric ? ric(() => setCap(detect()), { timeout: 1200 }) : window.setTimeout(() => setCap(detect()), 300);
    return () => {
      mq.removeEventListener("change", onChange);
      if (!ric) clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    const onVis = () => setActive(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <div ref={wrap} className="relative h-full w-full">
      <StaticFallback
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${mode === "3d" && ready ? "opacity-0" : "opacity-100"}`}
      />
      {mode === "3d" && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <Scene settings={settings} hologram={hologram} tier={tier} animate={!reduced} active={active} characterModelUrl={characterModelUrl} onReady={() => setReady(true)}
            onNavigate={(href) => { document.body.style.cursor = ""; router.push(href); }} />
        </div>
      )}
      <p className="sr-only">Decorative 3D illustration of a network engineer working at a multi-monitor network operations workstation.</p>
    </div>
  );
}
