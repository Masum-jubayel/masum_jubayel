"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog";
import { cn } from "@/lib/utils";

export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  if (!items.length) return null;
  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="eyebrow mb-3">On this page</p>
      <ul className="space-y-1 border-l border-white/10">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={cn("-ml-px block border-l py-1 transition-colors", i.depth === 3 ? "pl-6" : "pl-3", active === i.id ? "border-cyan-400 text-cyan-200" : "border-transparent text-mist-400 hover:text-mist-100")}>{i.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
