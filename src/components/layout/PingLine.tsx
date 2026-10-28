"use client";

import { useEffect, useState } from "react";

/** A little live "ping" in the footer — every reply is a friendly hello from Grande Prairie. */
export function PingLine() {
  const [seq, setSeq] = useState(1);
  const [ms, setMs] = useState("0.42");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setSeq((s) => (s % 999) + 1);
      setMs((0.3 + Math.random() * 0.4).toFixed(2));
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="flex min-w-0 items-center gap-2" aria-hidden>
      <span className="h-1.5 w-1.5 shrink-0 animate-pulseDot rounded-full bg-emerald-400" />
      <span className="truncate">
        <span className="text-cyan-400">$ ping masum</span> → reply from grande-prairie.ab: icmp_seq={seq} ttl=64 time={ms} ms
      </span>
    </span>
  );
}
