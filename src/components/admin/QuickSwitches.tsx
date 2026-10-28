"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Box, Construction, Gauge, Loader2, Megaphone, MoonStar, Sparkles, SlidersHorizontal } from "lucide-react";
import type { LayoutInfo } from "@/content/cms";
import { cn } from "@/lib/utils";

type Key = "maintenanceOn" | "announceOn" | "heroScene" | "fxScrollProgress" | "fxAmbient" | "fxCalm";
const SWITCHES: { key: Key; label: string; hint: string; Icon: typeof Box; danger?: boolean }[] = [
  { key: "maintenanceOn", label: "Maintenance mode", hint: "Visitors see a “back soon” notice", Icon: Construction, danger: true },
  { key: "announceOn", label: "Announcement bar", hint: "Floating message on every page", Icon: Megaphone },
  { key: "heroScene", label: "3D workstation", hint: "Home hero scene", Icon: Box },
  { key: "fxScrollProgress", label: "Reading progress", hint: "Glowing bar while scrolling", Icon: Gauge },
  { key: "fxAmbient", label: "Ambient glow", hint: "Drifting background light", Icon: Sparkles },
  { key: "fxCalm", label: "Calm mode", hint: "Turn off decorative animation", Icon: MoonStar },
];

/** One-click site switches on the admin Overview. Saves straight to Site controls. */
export function QuickSwitches({ layout, onToggle, href = "/admin?tab=content&section=layout", onOpen }: { layout: LayoutInfo; onToggle: (key: Key, value: boolean) => Promise<{ ok: boolean; error?: string }>; href?: string; onOpen?: () => void }) {
  const [state, setState] = useState(layout);
  const [busy, setBusy] = useState<Key | null>(null);
  const [err, setErr] = useState("");
  const [, start] = useTransition();
  const flip = (k: Key) => start(async () => {
    const v = !state[k];
    setBusy(k); setErr("");
    setState((s) => ({ ...s, [k]: v }));
    const r = await onToggle(k, v);
    if (!r.ok) { setState((s) => ({ ...s, [k]: !v })); setErr(r.error || "Couldn’t save."); }
    setBusy(null);
  });
  return (
    <section className="glass p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold"><SlidersHorizontal className="h-4 w-4 text-cyan-300" aria-hidden /> Site switches</h2>
        {onOpen ? <button type="button" onClick={onOpen} className="text-xs text-cyan-300 hover:underline">All site controls →</button> : <Link href={href} className="text-xs text-cyan-300 hover:underline">All site controls →</Link>}
      </div>
      {state.maintenanceOn && <p className="mt-3 rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">Maintenance mode is ON — visitors can’t see the site.</p>}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {SWITCHES.map(({ key, label, hint, Icon, danger }) => {
          const on = Boolean(state[key]);
          return (
            <li key={key}>
              <button type="button" role="switch" aria-checked={on} onClick={() => flip(key)} disabled={busy === key}
                className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition", on ? (danger ? "border-amber-300/50 bg-amber-300/10" : "border-cyan-400/40 bg-cyan-400/[0.07]") : "border-white/10 hover:border-white/20")}>
                <Icon className={cn("h-4 w-4 shrink-0", on ? (danger ? "text-amber-300" : "text-cyan-300") : "text-mist-500")} aria-hidden />
                <span className="min-w-0 flex-1"><span className="block text-sm text-mist-100">{label}</span><span className="block truncate text-[11px] text-mist-500">{hint}</span></span>
                {busy === key ? <Loader2 className="h-4 w-4 animate-spin text-mist-400" aria-hidden /> : (
                  <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? (danger ? "bg-amber-400" : "bg-cyan-400") : "bg-white/15")}>
                    <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {err && <p className="mt-2 text-xs text-rose-300">{err}</p>}
    </section>
  );
}
