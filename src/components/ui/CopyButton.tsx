"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch { /* clipboard blocked */ } }}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-mist-400 hover:bg-white/5 hover:text-mist-100"
      aria-live="polite"
    >
      {done ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {done ? "Copied" : label}
    </button>
  );
}
