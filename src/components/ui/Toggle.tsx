"use client";

import { cn } from "@/lib/utils";

/** On/off switch used for every yes/no setting in the admin. */
export function Toggle({ id, on, onChange, label }: { id?: string; on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cn("group relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-300", on ? "border-cyan-300/60 bg-cyan-400/80 shadow-[0_0_14px_rgba(62,230,255,0.45)]" : "border-white/15 bg-white/10")}>
      <span className={cn("absolute h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 group-active:w-6", on ? "left-[24px]" : "left-[3px]")} />
      <span className="sr-only">{on ? "On" : "Off"}</span>
    </button>
  );
}
